import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StockMovementType } from '../../generated/prisma/enums.js';
import { InventoryService } from './inventory.service.js';

describe('InventoryService', () => {
  let service: InventoryService;
  let prismaMock: any;
  let txMock: any;

  beforeEach(() => {
    txMock = {
      inventoryItem: {
        update: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      stockMovement: {
        create: vi.fn(),
        findFirst: vi.fn(),
      },
      stockReceipt: {
        create: vi.fn(),
      },
      recipe: {
        deleteMany: vi.fn(),
        createMany: vi.fn(),
        findMany: vi.fn(),
      },
    };

    prismaMock = {
      $transaction: vi.fn((callback) => callback(txMock)),
      inventoryItem: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      stockMovement: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      recipe: {
        findMany: vi.fn(),
      },
      menuItem: {
        findUnique: vi.fn(),
      },
    };

    service = new InventoryService(prismaMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createItem', () => {
    it('should create an inventory item', async () => {
      const dto = { itemName: 'Beef Patty', unit: 'kg', currentStock: 10, minAlertThreshold: 2 };
      prismaMock.inventoryItem.create.mockResolvedValue({ id: 'item-1', ...dto });

      const result = await service.createItem(dto);
      expect(result).toEqual({ id: 'item-1', ...dto });
      expect(prismaMock.inventoryItem.create).toHaveBeenCalledWith({
        data: {
          itemName: 'Beef Patty',
          unit: 'kg',
          currentStock: 10,
          minAlertThreshold: 2,
        },
      });
    });
  });

  describe('createStockReceipt', () => {
    it('should create stock receipt and increase currentStock in transaction', async () => {
      txMock.inventoryItem.findMany.mockResolvedValue([
        { id: 'item-1', currentStock: 10 },
      ]);
      txMock.stockReceipt.create.mockResolvedValue({
        id: 'receipt-1',
        receiptCode: 'NK-12345678',
        totalCost: 500000,
        details: [{ inventoryItemId: 'item-1', quantity: 5, unitPrice: 100000 }],
      });
      txMock.inventoryItem.update.mockResolvedValue({ id: 'item-1', currentStock: 15 });
      txMock.stockMovement.create.mockResolvedValue({ id: 'move-1', movementType: StockMovementType.IN_PURCHASE });

      const result = await service.createStockReceipt(
        'manager-1',
        {
          items: [{ inventoryItemId: 'item-1', quantity: 5, unitPrice: 100000 }],
          supplierName: 'Metro Supplier',
        },
      );

      expect(txMock.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { currentStock: 15 },
      });
      expect(result.id).toBe('receipt-1');
    });
  });

  describe('createStockAdjustment', () => {
    it('should decrease stock for WASTE_SPOILED movement', async () => {
      txMock.inventoryItem.findUnique.mockResolvedValue({ id: 'item-1', itemName: 'Beef', currentStock: 10 });
      txMock.inventoryItem.update.mockResolvedValue({ id: 'item-1', currentStock: 7 });
      txMock.stockMovement.create.mockResolvedValue({ id: 'move-2', movementType: StockMovementType.WASTE_SPOILED });

      const result = await service.createStockAdjustment('user-1', {
        inventoryItemId: 'item-1',
        quantity: 3,
        movementType: StockMovementType.WASTE_SPOILED,
        reason: 'Expired ingredients',
      });

      expect(txMock.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { currentStock: 7 },
      });
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if deducting more than currentStock', async () => {
      txMock.inventoryItem.findUnique.mockResolvedValue({ id: 'item-1', itemName: 'Beef', currentStock: 2 });

      await expect(
        service.createStockAdjustment('user-1', {
          inventoryItemId: 'item-1',
          quantity: 5,
          movementType: StockMovementType.WASTE_SPOILED,
          reason: 'Too much spoiled',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deductIngredientsForOrderItem', () => {
    it('should skip deduction if already deducted (idempotency check)', async () => {
      txMock.stockMovement.findFirst.mockResolvedValue({ id: 'already-deducted' });

      await service.deductIngredientsForOrderItem(txMock, 'oi-1', 'dish-1', 2, 'chef-1');
      expect(txMock.recipe.findMany).not.toHaveBeenCalled();
      expect(txMock.stockMovement.create).not.toHaveBeenCalled();
    });

    it('should deduct ingredients according to BOM', async () => {
      txMock.stockMovement.findFirst.mockResolvedValue(null);
      txMock.recipe.findMany.mockResolvedValue([
        {
          inventoryItemId: 'inv-1',
          quantityRequired: 0.25,
          inventoryItem: { id: 'inv-1', currentStock: 10 },
        },
      ]);
      txMock.inventoryItem.update.mockResolvedValue({ id: 'inv-1', currentStock: 9.5 });
      txMock.stockMovement.create.mockResolvedValue({ id: 'sm-1' });

      await service.deductIngredientsForOrderItem(txMock, 'oi-1', 'dish-1', 2, 'chef-1');
      expect(txMock.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: { currentStock: 9.5 }, // 10 - (0.25 * 2)
      });
      expect(txMock.stockMovement.create).toHaveBeenCalled();
    });
  });
});
