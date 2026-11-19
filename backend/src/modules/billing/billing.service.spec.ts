import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BillStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  SessionStatus,
  TableStatus,
} from '../../generated/prisma/enums.js';
import { BillingService } from './billing.service.js';

describe('BillingService', () => {
  let service: BillingService;
  let prismaMock: any;
  let txMock: any;

  beforeEach(() => {
    txMock = {
      bill: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      payment: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      diningSession: {
        update: vi.fn(),
      },
      table: {
        update: vi.fn(),
      },
      refund: {
        create: vi.fn(),
      },
    };

    prismaMock = {
      $transaction: vi.fn((callback) => callback(txMock)),
      diningSession: {
        findUnique: vi.fn(),
      },
      promotion: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
      },
      bill: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
      },
    };

    service = new BillingService(prismaMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBill', () => {
    it('should calculate subtotal and create bill without promotion', async () => {
      prismaMock.diningSession.findUnique.mockResolvedValue({
        id: 'session-1',
        status: SessionStatus.OPEN,
        tableId: 'table-1',
        orders: [
          {
            id: 'order-1',
            status: OrderStatus.CONFIRMED,
            orderItems: [
              { id: 'item-1', unitPrice: 100000, quantity: 2, itemStatus: 'SERVED' },
              { id: 'item-2', unitPrice: 50000, quantity: 1, itemStatus: 'COOKING' },
            ],
          },
        ],
      });

      prismaMock.bill.create.mockResolvedValue({
        id: 'bill-1',
        billCode: 'HD-12345678',
        subtotalAmount: 250000,
        discountAmount: 0,
        finalAmount: 250000,
        status: BillStatus.UNPAID,
      });

      const result = await service.createBill('cashier-1', { sessionId: 'session-1' });

      expect(prismaMock.bill.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sessionId: 'session-1',
          cashierId: 'cashier-1',
          subtotalAmount: 250000,
          discountAmount: 0,
          finalAmount: 250000,
          status: BillStatus.UNPAID,
        }),
        include: expect.any(Object),
      });
      expect(result.id).toBe('bill-1');
    });

    it('should throw BadRequestException if dining session is already CLOSED', async () => {
      prismaMock.diningSession.findUnique.mockResolvedValue({
        id: 'session-1',
        status: SessionStatus.CLOSED,
        orders: [],
      });

      await expect(
        service.createBill('cashier-1', { sessionId: 'session-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should apply percentage promotion discount with max ceiling', async () => {
      prismaMock.diningSession.findUnique.mockResolvedValue({
        id: 'session-1',
        status: SessionStatus.OPEN,
        orders: [
          {
            id: 'order-1',
            status: OrderStatus.CONFIRMED,
            orderItems: [
              { id: 'item-1', unitPrice: 500000, quantity: 1, itemStatus: 'SERVED' },
            ],
          },
        ],
      });

      const now = new Date();
      prismaMock.promotion.findUnique.mockResolvedValue({
        id: 'promo-1',
        code: 'SALE20',
        isActive: true,
        startDate: new Date(now.getTime() - 86400000),
        endDate: new Date(now.getTime() + 86400000),
        discountPercent: 20, // 20% of 500,000 = 100,000
        maxDiscount: 60000, // Capped at 60,000
        minOrderAmount: 200000,
      });

      prismaMock.bill.create.mockResolvedValue({
        id: 'bill-1',
        subtotalAmount: 500000,
        discountAmount: 60000,
        finalAmount: 440000,
      });

      await service.createBill('cashier-1', {
        sessionId: 'session-1',
        promotionCode: 'SALE20',
      });

      expect(prismaMock.bill.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          subtotalAmount: 500000,
          discountAmount: 60000,
          finalAmount: 440000,
          promotionId: 'promo-1',
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('processPayment', () => {
    it('should handle partial payment and set status to PARTIALLY_PAID', async () => {
      txMock.bill.findUnique.mockResolvedValue({
        id: 'bill-1',
        sessionId: 'session-1',
        finalAmount: 500000,
        status: BillStatus.UNPAID,
        payments: [],
        session: { tableId: 'table-1' },
      });

      txMock.payment.create.mockResolvedValue({
        id: 'pay-1',
        amountPaid: 200000,
        changeAmount: 0,
        status: PaymentStatus.SUCCESS,
      });

      txMock.bill.update.mockResolvedValue({
        id: 'bill-1',
        status: BillStatus.PARTIALLY_PAID,
      });

      txMock.bill.findMany.mockResolvedValue([
        { id: 'bill-1', status: BillStatus.PARTIALLY_PAID },
      ]);

      const result = await service.processPayment('bill-1', 'cashier-1', {
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        amountPaid: 200000,
        transactionCode: 'TXN-123456',
      });

      expect(txMock.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          billId: 'bill-1',
          cashierId: 'cashier-1',
          amountPaid: 200000,
          changeAmount: 0,
        }),
      });
      expect(txMock.bill.update).toHaveBeenCalledWith({
        where: { id: 'bill-1' },
        data: { status: BillStatus.PARTIALLY_PAID },
      });
      expect(result.remainingBalance).toBe(300000);
      expect(result.sessionClosed).toBe(false);
      expect(txMock.diningSession.update).not.toHaveBeenCalled();
    });

    it('should handle full cash settlement with change, close session and release table', async () => {
      txMock.bill.findUnique.mockResolvedValue({
        id: 'bill-1',
        sessionId: 'session-1',
        finalAmount: 450000,
        status: BillStatus.UNPAID,
        payments: [],
        session: { tableId: 'table-1' },
      });

      txMock.payment.create.mockResolvedValue({
        id: 'pay-1',
        amountPaid: 500000,
        changeAmount: 50000,
        status: PaymentStatus.SUCCESS,
      });

      txMock.bill.update.mockResolvedValue({
        id: 'bill-1',
        status: BillStatus.PAID,
      });

      txMock.bill.findMany.mockResolvedValue([
        { id: 'bill-1', status: BillStatus.PAID },
      ]);

      const result = await service.processPayment('bill-1', 'cashier-1', {
        paymentMethod: PaymentMethod.CASH,
        amountPaid: 500000,
      });

      expect(txMock.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amountPaid: 500000,
          changeAmount: 50000,
        }),
      });
      expect(txMock.bill.update).toHaveBeenCalledWith({
        where: { id: 'bill-1' },
        data: { status: BillStatus.PAID },
      });
      // Verifies atomic session close & table release
      expect(txMock.diningSession.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: expect.objectContaining({
          status: SessionStatus.CLOSED,
          closedById: 'cashier-1',
        }),
      });
      expect(txMock.table.update).toHaveBeenCalledWith({
        where: { id: 'table-1' },
        data: { status: TableStatus.CLEANING },
      });
      expect(result.sessionClosed).toBe(true);
      expect(result.remainingBalance).toBe(0);
    });
  });

  describe('createRefund', () => {
    it('should reject refund if refund amount exceeds available payment balance', async () => {
      txMock.payment.findUnique.mockResolvedValue({
        id: 'pay-1',
        amountPaid: 200000,
        changeAmount: 0,
        status: PaymentStatus.SUCCESS,
        refunds: [{ amount: 150000 }],
        bill: { id: 'bill-1', status: BillStatus.PAID },
      });

      await expect(
        service.createRefund('pay-1', 'manager-1', {
          amount: 100000, // Only 50,000 available
          reason: 'Customer return',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should approve valid refund and mark payment REFUNDED when fully refunded', async () => {
      txMock.payment.findUnique.mockResolvedValue({
        id: 'pay-1',
        billId: 'bill-1',
        amountPaid: 200000,
        changeAmount: 0,
        status: PaymentStatus.SUCCESS,
        refunds: [],
        bill: { id: 'bill-1', status: BillStatus.PAID },
      });

      txMock.refund.create.mockResolvedValue({
        id: 'refund-1',
        amount: 200000,
      });

      await service.createRefund('pay-1', 'manager-1', {
        amount: 200000,
        reason: 'Customer cancelled meal',
      });

      expect(txMock.payment.update).toHaveBeenCalledWith({
        where: { id: 'pay-1' },
        data: { status: PaymentStatus.REFUNDED },
      });
      expect(txMock.bill.update).toHaveBeenCalledWith({
        where: { id: 'bill-1' },
        data: { status: BillStatus.PARTIALLY_PAID },
      });
    });
  });
});
