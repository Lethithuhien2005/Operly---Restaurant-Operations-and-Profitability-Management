import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StockMovementType } from '../../../generated/prisma/enums.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto.js';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto.js';
import { CreateStockReceiptDto } from './dto/create-stock-receipt.dto.js';
import { InventoryQueryDto } from './dto/inventory-query.dto.js';
import { SetRecipeBomDto } from './dto/set-recipe-bom.dto.js';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto.js';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createItem(dto: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({
      data: {
        itemName: dto.itemName.trim(),
        unit: dto.unit.trim(),
        currentStock: dto.currentStock ?? 0,
        minAlertThreshold: dto.minAlertThreshold ?? 0,
      },
    });
  }

  async findAllItems(query: InventoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search && query.search.trim()) {
      where.itemName = {
        contains: query.search.trim(),
        mode: 'insensitive',
      };
    }

    const items = await this.prisma.inventoryItem.findMany({
      where,
      skip,
      take: limit,
      orderBy: { itemName: 'asc' },
    });

    const total = await this.prisma.inventoryItem.count({ where });

    // Filter low stock in-memory if requested (comparing currentStock <= minAlertThreshold)
    const resultItems = query.lowStockOnly
      ? items.filter((item) => Number(item.currentStock) <= Number(item.minAlertThreshold))
      : items;

    return {
      data: resultItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneItem(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        recipes: {
          include: {
            menuItem: {
              select: { id: true, name: true, price: true },
            },
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID "${id}" was not found`);
    }

    return item;
  }

  async updateItem(id: string, dto: UpdateInventoryItemDto) {
    await this.findOneItem(id);

    return this.prisma.inventoryItem.update({
      where: { id },
      data: {
        itemName: dto.itemName?.trim(),
        unit: dto.unit?.trim(),
        currentStock: dto.currentStock !== undefined ? dto.currentStock : undefined,
        minAlertThreshold: dto.minAlertThreshold !== undefined ? dto.minAlertThreshold : undefined,
      },
    });
  }

  async getLowStockItems() {
    const allItems = await this.prisma.inventoryItem.findMany({
      orderBy: { itemName: 'asc' },
    });

    return allItems.filter(
      (item) => Number(item.currentStock) <= Number(item.minAlertThreshold),
    );
  }

  async createStockReceipt(managerId: string, dto: CreateStockReceiptDto) {
    const receiptCode = `NK-${Date.now().toString().slice(-8)}`;

    return this.prisma.$transaction(async (tx) => {
      // Validate all items exist
      const itemIds = dto.items.map((i) => i.inventoryItemId);
      const dbItems = await tx.inventoryItem.findMany({
        where: { id: { in: itemIds } },
      });

      if (dbItems.length !== new Set(itemIds).size) {
        throw new NotFoundException('One or more inventory items specified in receipt do not exist');
      }

      const dbItemMap = new Map(dbItems.map((item) => [item.id, item]));

      const totalCost = dto.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );

      const receipt = await tx.stockReceipt.create({
        data: {
          receiptCode,
          managerId,
          supplierName: dto.supplierName?.trim() || null,
          totalCost,
          details: {
            create: dto.items.map((item) => ({
              inventoryItemId: item.inventoryItemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          details: true,
        },
      });

      // Update current stock and record stock movements
      for (const item of dto.items) {
        const currentDbItem = dbItemMap.get(item.inventoryItemId)!;
        const newStock = Number(currentDbItem.currentStock) + item.quantity;

        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: { currentStock: newStock },
        });

        await tx.stockMovement.create({
          data: {
            inventoryItemId: item.inventoryItemId,
            createdById: managerId,
            movementType: StockMovementType.IN_RECEIPT,
            quantity: item.quantity,
            balanceAfter: newStock,
            note: `Stock receipt ${receiptCode} from ${dto.supplierName || 'vendor'}`,
          },
        });
      }

      return receipt;
    });
  }

  async createStockAdjustment(userId: string, dto: CreateStockAdjustmentDto) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({
        where: { id: dto.inventoryItemId },
      });

      if (!item) {
        throw new NotFoundException(`Inventory item "${dto.inventoryItemId}" not found`);
      }

      const currentStockNum = Number(item.currentStock);
      let delta = dto.quantity;

      if (dto.movementType === StockMovementType.WASTE_SPOILED) {
        // Spoilage is a reduction
        delta = -Math.abs(dto.quantity);
      }

      const balanceAfter = currentStockNum + delta;

      if (balanceAfter < 0) {
        throw new BadRequestException(
          `Adjustment of ${delta} would result in invalid negative stock (${balanceAfter}) for "${item.itemName}"`,
        );
      }

      await tx.inventoryItem.update({
        where: { id: item.id },
        data: { currentStock: balanceAfter },
      });

      const movement = await tx.stockMovement.create({
        data: {
          inventoryItemId: item.id,
          createdById: userId,
          movementType: dto.movementType,
          quantity: delta,
          balanceAfter,
          note: dto.note?.trim() || null,
        },
      });

      return {
        item: { ...item, currentStock: balanceAfter },
        movement,
      };
    });
  }

  async findMovements(inventoryItemId?: string) {
    return this.prisma.stockMovement.findMany({
      where: inventoryItemId ? { inventoryItemId } : undefined,
      include: {
        inventoryItem: {
          select: { id: true, itemName: true, unit: true },
        },
        createdBy: {
          select: { id: true, fullName: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findStockReceipts() {
    return this.prisma.stockReceipt.findMany({
      include: {
        manager: {
          select: { id: true, fullName: true },
        },
        details: {
          include: {
            inventoryItem: {
              select: { id: true, itemName: true, unit: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setRecipeBom(dto: SetRecipeBomDto) {
    return this.prisma.$transaction(async (tx) => {
      const menuItem = await tx.menuItem.findUnique({
        where: { id: dto.menuItemId },
      });

      if (!menuItem) {
        throw new NotFoundException(`Menu item "${dto.menuItemId}" was not found`);
      }

      // Check all ingredients exist
      const ingredientIds = dto.ingredients.map((i) => i.inventoryItemId);
      const ingredients = await tx.inventoryItem.findMany({
        where: { id: { in: ingredientIds } },
      });

      if (ingredients.length !== new Set(ingredientIds).size) {
        throw new NotFoundException('One or more recipe ingredients do not exist');
      }

      // Replace BOM
      await tx.recipe.deleteMany({
        where: { menuItemId: dto.menuItemId },
      });

      await tx.recipe.createMany({
        data: dto.ingredients.map((i) => ({
          menuItemId: dto.menuItemId,
          inventoryItemId: i.inventoryItemId,
          quantityRequired: i.quantityRequired,
        })),
      });

      return tx.recipe.findMany({
        where: { menuItemId: dto.menuItemId },
        include: {
          inventoryItem: true,
        },
      });
    });
  }

  async getRecipeBom(menuItemId: string) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: {
        recipes: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item "${menuItemId}" was not found`);
    }

    return menuItem;
  }

  /**
   * Safe, idempotent ingredient deduction executed within a transaction.
   * Defends against duplicate deduction at both application and database level.
   */
  async deductIngredientsForOrderItem(
    tx: any,
    orderItemId: string,
    menuItemId: string,
    quantity: number,
    chefId?: string,
  ): Promise<void> {
    // 1. Application-level idempotency check:
    const existingMovement = await tx.stockMovement.findFirst({
      where: {
        orderItemId,
        movementType: StockMovementType.OUT_COOKING,
      },
    });

    if (existingMovement) {
      // Already deducted for this order line item; skip safely
      return;
    }

    // 2. Fetch recipe BOM for dish
    const recipes = await tx.recipe.findMany({
      where: { menuItemId },
      include: { inventoryItem: true },
    });

    if (!recipes || recipes.length === 0) {
      // No BOM configured for this dish, nothing to deduct
      return;
    }

    // 3. Atomically deduct and record stock movements
    for (const recipe of recipes) {
      const totalDepletion = Number(recipe.quantityRequired) * quantity;
      const currentStockNum = Number(recipe.inventoryItem.currentStock);
      const balanceAfter = currentStockNum - totalDepletion;

      await tx.inventoryItem.update({
        where: { id: recipe.inventoryItemId },
        data: { currentStock: balanceAfter },
      });

      await tx.stockMovement.create({
        data: {
          inventoryItemId: recipe.inventoryItemId,
          orderItemId,
          createdById: chefId || null,
          movementType: StockMovementType.OUT_COOKING,
          quantity: -totalDepletion,
          balanceAfter,
          note: `Auto-depletion for order item ${orderItemId} (${quantity}x dish)`,
        },
      });
    }
  }
}
