import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderItemStatus, OrderStatus, SessionStatus, TableStatus } from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OrdersService } from './orders.service.js';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaMock: any;
  let txMock: any;

  beforeEach(() => {
    txMock = {
      diningSession: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      table: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      menuItem: {
        findMany: vi.fn(),
      },
      order: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      orderItem: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
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

    service = new OrdersService(prismaMock as unknown as PrismaService);
  });

  it('should create an atomic order batch with calculated backend total', async () => {
    txMock.diningSession.findUnique.mockResolvedValue({
      id: 'sess-1',
      status: SessionStatus.OPEN,
      tableId: 'tbl-1',
    });
    txMock.menuItem.findMany.mockResolvedValue([
      { id: 'dish-1', name: 'Spring Rolls', price: 150000, costPrice: 45000, isAvailable: true },
      { id: 'dish-2', name: 'Herbal Tea', price: 25000, costPrice: 5000, isAvailable: true },
    ]);
    txMock.order.create.mockResolvedValue({
      id: 'ord-1',
      orderCode: 'ORD-123',
      totalAmount: 325000, // (150000 * 2) + (25000 * 1)
      status: OrderStatus.CREATED,
    });

    const result = await service.create({
      sessionId: 'sess-1',
      items: [
        { menuItemId: 'dish-1', quantity: 2 },
        { menuItemId: 'dish-2', quantity: 1 },
      ],
    });

    expect(result.id).toBe('ord-1');
    expect(txMock.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalAmount: 325000,
        }),
      }),
    );
    expect(txMock.table.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'tbl-1' },
        data: { status: TableStatus.OCCUPIED },
      }),
    );
  });

  it('should reject order if any item is 86 out-of-stock', async () => {
    txMock.diningSession.findUnique.mockResolvedValue({
      id: 'sess-1',
      status: SessionStatus.OPEN,
    });
    txMock.menuItem.findMany.mockResolvedValue([
      { id: 'dish-86', name: 'Fresh Oysters', price: 180000, isAvailable: false },
    ]);

    await expect(
      service.create({
        sessionId: 'sess-1',
        items: [{ menuItemId: 'dish-86', quantity: 1 }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should prevent removing an item that is already cooking or served', async () => {
    txMock.orderItem.findFirst.mockResolvedValue({
      id: 'item-cooking',
      orderId: 'ord-1',
      itemStatus: OrderItemStatus.COOKING,
    });

    await expect(service.removeItem('ord-1', 'item-cooking')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should remove pending item and recalculate order total amount', async () => {
    txMock.orderItem.findFirst.mockResolvedValue({
      id: 'item-pending',
      orderId: 'ord-1',
      itemStatus: OrderItemStatus.PENDING,
    });
    txMock.orderItem.delete.mockResolvedValue({});
    txMock.orderItem.findMany.mockResolvedValue([
      { id: 'item-2', unitPrice: 50000, quantity: 2 },
    ]);
    txMock.order.update.mockResolvedValue({
      id: 'ord-1',
      totalAmount: 100000,
    });

    const updated = await service.removeItem('ord-1', 'item-pending');
    expect(updated.totalAmount).toBe(100000);
    expect(txMock.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ord-1' },
        data: { totalAmount: 100000 },
      }),
    );
  });
});
