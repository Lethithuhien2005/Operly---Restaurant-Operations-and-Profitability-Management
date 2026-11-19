import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderItemStatus, OrderStatus } from '../../../generated/prisma/enums.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { InventoryService } from '../inventory/inventory.service.js';
import { KitchenQueryDto } from './dto/kitchen-query.dto.js';

@Injectable()
export class KitchenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

  /**
   * Retrieves active tickets and order items currently in kitchen preparation stages (PENDING, COOKING, READY)
   */
  async getKitchenQueue(query: KitchenQueryDto) {
    const activeStatuses = query.status
      ? [query.status]
      : [OrderItemStatus.PENDING, OrderItemStatus.COOKING, OrderItemStatus.READY];

    const orders = await this.prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.CREATED, OrderStatus.CONFIRMED, OrderStatus.IN_PROGRESS] },
        orderItems: {
          some: {
            itemStatus: { in: activeStatuses },
          },
        },
        session: query.branchId
          ? {
              table: { branchId: query.branchId },
            }
          : undefined,
      },
      include: {
        session: {
          include: {
            table: {
              select: { id: true, tableNumber: true, floor: true, branchId: true },
            },
          },
        },
        orderItems: {
          where: {
            itemStatus: { in: activeStatuses },
            menuItem: query.category
              ? {
                  category: {
                    name: { contains: query.category, mode: 'insensitive' },
                  },
                }
              : undefined,
          },
          include: {
            menuItem: {
              select: { id: true, name: true, imageUrl: true, categoryId: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return orders.map((order) => {
      const elapsedMinutes = Math.floor(
        (Date.now() - new Date(order.createdAt).getTime()) / 60000,
      );

      return {
        orderId: order.id,
        orderCode: order.orderCode,
        tableId: order.session.table.id,
        tableNumber: order.session.table.tableNumber,
        floor: order.session.table.floor,
        createdAt: order.createdAt,
        elapsedMinutes,
        status: order.status,
        items: order.orderItems.map((item) => ({
          itemId: item.id,
          menuItemId: item.menuItemId,
          dishName: item.menuItem.name,
          quantity: item.quantity,
          status: item.itemStatus,
          notes: item.notes,
          rejectionReason: item.rejectionReason,
          createdAt: item.createdAt,
        })),
      };
    });
  }

  /**
   * Validates state transitions for order items:
   * PENDING -> COOKING -> READY -> SERVED
   * PENDING or COOKING -> REJECTED (requires rejection reason)
   */
  private validateStatusTransition(currentStatus: OrderItemStatus, newStatus: OrderItemStatus): void {
    if (currentStatus === newStatus) {
      return; // No-op
    }

    const validTransitions: Record<OrderItemStatus, OrderItemStatus[]> = {
      [OrderItemStatus.PENDING]: [OrderItemStatus.COOKING, OrderItemStatus.REJECTED],
      [OrderItemStatus.COOKING]: [OrderItemStatus.READY, OrderItemStatus.REJECTED],
      [OrderItemStatus.READY]: [OrderItemStatus.SERVED],
      [OrderItemStatus.SERVED]: [], // Terminal state
      [OrderItemStatus.REJECTED]: [], // Terminal state
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid order item status transition from "${currentStatus}" to "${newStatus}". Allowed transitions: [${allowed.join(', ')}]`,
      );
    }
  }

  /**
   * Unified, transaction-safe item status progression with automatic BOM inventory deduction.
   */
  async updateItemStatusWithInventory(
    itemId: string,
    newStatus: OrderItemStatus,
    rejectionReason?: string | null,
    chefId?: string,
    orderId?: string,
  ) {
    if (newStatus === OrderItemStatus.REJECTED && (!rejectionReason || !rejectionReason.trim())) {
      throw new BadRequestException('A non-empty rejectionReason is required when marking an item as REJECTED');
    }

    return this.prisma.$transaction(async (tx) => {
      const item = await tx.orderItem.findFirst({
        where: {
          id: itemId,
          orderId: orderId || undefined,
        },
        include: { menuItem: true },
      });

      if (!item) {
        throw new NotFoundException(`Order item "${itemId}" was not found`);
      }

      // 1. Enforce strict transition rules
      this.validateStatusTransition(item.itemStatus, newStatus);

      // 2. If advancing to COOKING: safely deduct inventory BOM
      if (newStatus === OrderItemStatus.COOKING) {
        await this.inventoryService.deductIngredientsForOrderItem(
          tx,
          item.id,
          item.menuItemId,
          item.quantity,
          chefId,
        );

        // Advance parent order status to IN_PROGRESS if currently CREATED or CONFIRMED
        await tx.order.updateMany({
          where: {
            id: item.orderId,
            status: { in: [OrderStatus.CREATED, OrderStatus.CONFIRMED] },
          },
          data: { status: OrderStatus.IN_PROGRESS },
        });
      }

      // 3. Update order item status
      const updatedItem = await tx.orderItem.update({
        where: { id: itemId },
        data: {
          itemStatus: newStatus,
          rejectionReason: newStatus === OrderItemStatus.REJECTED ? rejectionReason?.trim() : null,
        },
        include: { menuItem: true },
      });

      // 4. If all items in this order are now SERVED, transition order to SERVED
      const remainingItems = await tx.orderItem.findMany({
        where: {
          orderId: item.orderId,
          itemStatus: { notIn: [OrderItemStatus.SERVED, OrderItemStatus.REJECTED] },
        },
      });

      if (remainingItems.length === 0) {
        await tx.order.update({
          where: { id: item.orderId },
          data: { status: OrderStatus.SERVED },
        });
      }

      return updatedItem;
    });
  }
}
