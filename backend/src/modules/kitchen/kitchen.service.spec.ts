import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderItemStatus, OrderStatus } from '../../generated/prisma/enums.js';
import { KitchenService } from './kitchen.service.js';

describe('KitchenService', () => {
  let service: KitchenService;
  let prismaMock: any;
  let inventoryServiceMock: any;
  let txMock: any;

  beforeEach(() => {
    txMock = {
      orderItem: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      order: {
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
    };

    prismaMock = {
      $transaction: vi.fn((callback) => callback(txMock)),
      order: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      orderItem: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
    };

    inventoryServiceMock = {
      deductIngredientsForOrderItem: vi.fn(),
    };

    service = new KitchenService(prismaMock, inventoryServiceMock as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateItemStatusWithInventory', () => {
    it('should throw NotFoundException if item does not exist', async () => {
      txMock.orderItem.findFirst.mockResolvedValue(null);

      await expect(
        service.updateItemStatusWithInventory('item-999', OrderItemStatus.COOKING),
      ).rejects.toThrow(NotFoundException);
    });

    it('should deduct ingredients when transitioning from PENDING to COOKING', async () => {
      txMock.orderItem.findFirst.mockResolvedValue({
        id: 'item-1',
        orderId: 'order-1',
        menuItemId: 'dish-1',
        quantity: 2,
        itemStatus: OrderItemStatus.PENDING,
      });

      txMock.orderItem.update.mockResolvedValue({
        id: 'item-1',
        itemStatus: OrderItemStatus.COOKING,
      });

      txMock.orderItem.findMany.mockResolvedValue([
        { id: 'item-1', itemStatus: OrderItemStatus.COOKING },
      ]);

      const result = await service.updateItemStatusWithInventory(
        'item-1',
        OrderItemStatus.COOKING,
        undefined,
        'chef-1',
        'order-1',
      );

      expect(inventoryServiceMock.deductIngredientsForOrderItem).toHaveBeenCalledWith(
        txMock,
        'item-1',
        'dish-1',
        2,
        'chef-1',
      );
      expect(result.itemStatus).toBe(OrderItemStatus.COOKING);
    });

    it('should not allow backwards status transition (e.g. READY to PENDING)', async () => {
      txMock.orderItem.findFirst.mockResolvedValue({
        id: 'item-1',
        orderId: 'order-1',
        menuItemId: 'dish-1',
        quantity: 2,
        itemStatus: OrderItemStatus.READY,
      });

      await expect(
        service.updateItemStatusWithInventory(
          'item-1',
          OrderItemStatus.PENDING,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should require a rejectionReason when transitioning to REJECTED', async () => {
      await expect(
        service.updateItemStatusWithInventory(
          'item-1',
          OrderItemStatus.REJECTED,
          '',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getKitchenQueue', () => {
    it('should return kitchen orders with elapsed time and formatted items', async () => {
      prismaMock.order.findMany.mockResolvedValue([
        {
          id: 'order-1',
          orderCode: 'ORD-001',
          createdAt: new Date(),
          status: OrderStatus.CONFIRMED,
          session: {
            table: { id: 'table-1', tableNumber: 5, floor: 1 },
          },
          orderItems: [
            {
              id: 'oi-1',
              menuItemId: 'dish-1',
              quantity: 2,
              itemStatus: OrderItemStatus.PENDING,
              notes: 'No spicy',
              rejectionReason: null,
              createdAt: new Date(),
              menuItem: { id: 'dish-1', name: 'Burger', imageUrl: null, categoryId: 'cat-1' },
            },
          ],
        },
      ]);

      const queue = await service.getKitchenQueue({});
      expect(queue).toHaveLength(1);
      expect(queue[0].orderCode).toBe('ORD-001');
      expect(queue[0].items[0].dishName).toBe('Burger');
    });
  });
});
