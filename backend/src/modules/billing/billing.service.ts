import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BillStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  SessionStatus,
  TableStatus,
} from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { BillQueryDto } from './dto/bill-query.dto.js';
import { CreateBillDto } from './dto/create-bill.dto.js';
import { CreatePromotionDto } from './dto/create-promotion.dto.js';
import { CreateRefundDto } from './dto/create-refund.dto.js';
import { ProcessPaymentDto } from './dto/process-payment.dto.js';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a finalized Bill for a dining session.
   * Calculates subtotal from immutable order_items.unit_price snapshots,
   * applies active promotion rules if applicable, and sets status to UNPAID.
   */
  async createBill(cashierId: string, dto: CreateBillDto) {
    const session = await this.prisma.diningSession.findUnique({
      where: { id: dto.sessionId },
      include: {
        table: true,
        orders: {
          where: { status: { not: OrderStatus.CANCELLED } },
          include: {
            orderItems: {
              where: { itemStatus: { not: 'REJECTED' } },
              include: { menuItem: true },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Dining session "${dto.sessionId}" not found`);
    }

    if (session.status === SessionStatus.CLOSED) {
      throw new BadRequestException('Dining session is already closed');
    }

    // Collect all billable order items across non-cancelled orders
    const allItems = session.orders.flatMap((order) => order.orderItems);

    if (allItems.length === 0) {
      throw new BadRequestException(
        'Dining session has no valid order items available to bill',
      );
    }

    // Compute subtotal from snapshot unitPrice
    const subtotal = allItems.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );

    let promotionId: string | null = null;
    let discountAmount = 0;

    if (dto.promotionCode && dto.promotionCode.trim()) {
      const code = dto.promotionCode.trim().toUpperCase();
      const promotion = await this.prisma.promotion.findUnique({
        where: { code },
      });

      if (!promotion) {
        throw new NotFoundException(`Promotion voucher "${code}" not found`);
      }

      if (!promotion.isActive) {
        throw new BadRequestException(`Promotion "${code}" is inactive`);
      }

      const now = new Date();
      if (now < promotion.startDate || now > promotion.endDate) {
        throw new BadRequestException(
          `Promotion "${code}" is expired or not yet valid`,
        );
      }

      if (
        promotion.minOrderAmount &&
        subtotal < Number(promotion.minOrderAmount)
      ) {
        throw new BadRequestException(
          `Subtotal (${subtotal.toLocaleString()} VND) does not meet minimum order requirement of ${Number(promotion.minOrderAmount).toLocaleString()} VND for promotion "${code}"`,
        );
      }

      if (promotion.discountPercent) {
        discountAmount = subtotal * (promotion.discountPercent / 100);
        if (promotion.maxDiscount) {
          discountAmount = Math.min(
            discountAmount,
            Number(promotion.maxDiscount),
          );
        }
      } else if (promotion.discountAmount) {
        discountAmount = Math.min(Number(promotion.discountAmount), subtotal);
      }

      promotionId = promotion.id;
    }

    const finalAmount = Math.max(0, subtotal - discountAmount);
    const billCode = `HD-${Date.now().toString().slice(-8)}`;

    return this.prisma.bill.create({
      data: {
        billCode,
        sessionId: session.id,
        cashierId,
        promotionId,
        subtotalAmount: subtotal,
        discountAmount,
        finalAmount,
        status: BillStatus.UNPAID,
      },
      include: {
        promotion: true,
        session: {
          include: {
            table: true,
          },
        },
      },
    });
  }

  /**
   * List bills with optional status and session filters, paginated
   */
  async findAllBills(query: BillQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.sessionId) {
      where.sessionId = query.sessionId;
    }

    const [data, total] = await Promise.all([
      this.prisma.bill.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          session: {
            include: { table: true },
          },
          cashier: {
            select: { id: true, fullName: true, phone: true },
          },
          promotion: true,
          payments: true,
        },
      }),
      this.prisma.bill.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a specific bill by ID with session, order breakdown, cashier, payments & refunds
   */
  async findOneBill(id: string) {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: {
        session: {
          include: {
            table: true,
            orders: {
              include: {
                orderItems: {
                  include: { menuItem: true },
                },
              },
            },
          },
        },
        cashier: {
          select: { id: true, fullName: true, phone: true },
        },
        promotion: true,
        payments: {
          include: {
            refunds: {
              include: {
                manager: {
                  select: { id: true, fullName: true },
                },
              },
            },
            cashier: {
              select: { id: true, fullName: true },
            },
          },
        },
      },
    });

    if (!bill) {
      throw new NotFoundException(`Bill with ID "${id}" was not found`);
    }

    // Calculate remaining balance to pay
    const effectivePaid = bill.payments
      .filter((p) => p.status === PaymentStatus.SUCCESS)
      .reduce((sum, p) => sum + (Number(p.amountPaid) - Number(p.changeAmount)), 0);

    const remainingBalance = Math.max(0, Number(bill.finalAmount) - effectivePaid);

    return {
      ...bill,
      summary: {
        subtotal: Number(bill.subtotalAmount),
        discount: Number(bill.discountAmount),
        finalAmount: Number(bill.finalAmount),
        totalPaid: effectivePaid,
        remainingBalance,
      },
    };
  }

  /**
   * Processes a payment against a Bill.
   * Supports split billing and multi-method payments.
   * Atomically closes the DiningSession and releases the Table ONLY when all bills for the session are settled.
   */
  async processPayment(billId: string, cashierId: string, dto: ProcessPaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const bill = await tx.bill.findUnique({
        where: { id: billId },
        include: {
          payments: {
            where: { status: PaymentStatus.SUCCESS },
          },
          session: {
            include: { table: true },
          },
        },
      });

      if (!bill) {
        throw new NotFoundException(`Bill with ID "${billId}" was not found`);
      }

      if (bill.status === BillStatus.PAID) {
        throw new BadRequestException('Bill is already fully paid');
      }

      if (bill.status === BillStatus.VOIDED) {
        throw new BadRequestException('Cannot process payment on a VOIDED bill');
      }

      // Calculate outstanding balance
      const alreadySettled = bill.payments.reduce(
        (sum, p) => sum + (Number(p.amountPaid) - Number(p.changeAmount)),
        0,
      );
      const remainingBalance = Number(bill.finalAmount) - alreadySettled;

      if (remainingBalance <= 0) {
        throw new BadRequestException('No outstanding balance remaining on this bill');
      }

      let changeAmount = 0;

      if (dto.amountPaid >= remainingBalance) {
        if (dto.paymentMethod === PaymentMethod.CASH) {
          changeAmount = dto.amountPaid - remainingBalance;
        } else if (dto.amountPaid > remainingBalance) {
          throw new BadRequestException(
            `Non-cash payment amount (${dto.amountPaid.toLocaleString()} VND) cannot exceed remaining balance (${remainingBalance.toLocaleString()} VND)`,
          );
        }
      }

      // Record payment
      const payment = await tx.payment.create({
        data: {
          billId: bill.id,
          cashierId,
          paymentMethod: dto.paymentMethod,
          amountPaid: dto.amountPaid,
          changeAmount,
          transactionCode: dto.transactionCode?.trim() || null,
          status: PaymentStatus.SUCCESS,
        },
      });

      const netApplied = dto.amountPaid - changeAmount;
      const newRemaining = remainingBalance - netApplied;

      const updatedBillStatus =
        newRemaining <= 0 ? BillStatus.PAID : BillStatus.PARTIALLY_PAID;

      const updatedBill = await tx.bill.update({
        where: { id: bill.id },
        data: { status: updatedBillStatus },
      });

      // Check whether ALL bills for this dining session are now fully paid
      const allSessionBills = await tx.bill.findMany({
        where: { sessionId: bill.sessionId },
      });

      const allBillsSettled = allSessionBills.every(
        (b) => (b.id === bill.id ? updatedBillStatus : b.status) === BillStatus.PAID,
      );

      let sessionClosed = false;

      if (allBillsSettled) {
        // Automatically close dining session and release table to CLEANING
        await tx.diningSession.update({
          where: { id: bill.sessionId },
          data: {
            status: SessionStatus.CLOSED,
            endTime: new Date(),
            closedById: cashierId,
          },
        });

        await tx.table.update({
          where: { id: bill.session.tableId },
          data: { status: TableStatus.CLEANING },
        });

        sessionClosed = true;
      }

      return {
        payment,
        bill: updatedBill,
        remainingBalance: Math.max(0, newRemaining),
        sessionClosed,
      };
    });
  }

  /**
   * Issues a refund for a successful payment.
   * Enforces Manager/Admin authorization and transaction safety.
   */
  async createRefund(paymentId: string, managerId: string, dto: CreateRefundDto) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          refunds: true,
          bill: true,
        },
      });

      if (!payment) {
        throw new NotFoundException(`Payment "${paymentId}" was not found`);
      }

      if (payment.status !== PaymentStatus.SUCCESS) {
        throw new BadRequestException(
          `Cannot refund a payment with status "${payment.status}"`,
        );
      }

      const totalRefundedAlready = payment.refunds.reduce(
        (sum, r) => sum + Number(r.amount),
        0,
      );

      const netPaid = Number(payment.amountPaid) - Number(payment.changeAmount);
      const availableToRefund = netPaid - totalRefundedAlready;

      if (dto.amount > availableToRefund) {
        throw new BadRequestException(
          `Requested refund amount (${dto.amount.toLocaleString()} VND) exceeds refundable payment balance (${availableToRefund.toLocaleString()} VND)`,
        );
      }

      // Record refund
      const refund = await tx.refund.create({
        data: {
          paymentId: payment.id,
          managerId,
          amount: dto.amount,
          reason: dto.reason.trim(),
        },
      });

      // Update payment status if fully refunded
      if (totalRefundedAlready + dto.amount >= netPaid) {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.REFUNDED },
        });
      }

      // Revert bill status to PARTIALLY_PAID or UNPAID if it was previously marked PAID
      if (payment.bill.status === BillStatus.PAID) {
        await tx.bill.update({
          where: { id: payment.billId },
          data: { status: BillStatus.PARTIALLY_PAID },
        });
      }

      return refund;
    });
  }

  /**
   * Promotions management
   */
  async createPromotion(dto: CreatePromotionDto) {
    const existing = await this.prisma.promotion.findUnique({
      where: { code: dto.code.trim().toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException(
        `Promotion with code "${dto.code.trim().toUpperCase()}" already exists`,
      );
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start >= end) {
      throw new BadRequestException('Promotion startDate must be before endDate');
    }

    return this.prisma.promotion.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        description: dto.description?.trim() || null,
        discountPercent: dto.discountPercent ?? null,
        discountAmount: dto.discountAmount ?? null,
        maxDiscount: dto.maxDiscount ?? null,
        minOrderAmount: dto.minOrderAmount ?? null,
        startDate: start,
        endDate: end,
        isActive: true,
      },
    });
  }

  async findAllPromotions() {
    return this.prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActivePromotions() {
    const now = new Date();
    return this.prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { endDate: 'asc' },
    });
  }
}
