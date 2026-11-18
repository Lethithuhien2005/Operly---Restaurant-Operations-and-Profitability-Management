import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CategoriesService } from './categories.service.js';
import { DishesService } from './dishes.service.js';

describe('CategoriesService & DishesService', () => {
  let categoriesService: CategoriesService;
  let dishesService: DishesService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      category: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      menuItem: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    categoriesService = new CategoriesService(prismaMock as unknown as PrismaService);
    dishesService = new DishesService(prismaMock as unknown as PrismaService);
  });

  describe('CategoriesService', () => {
    it('should create a category', async () => {
      prismaMock.category.findFirst.mockResolvedValue(null);
      prismaMock.category.create.mockResolvedValue({
        id: 'cat-1',
        name: 'Hotpot',
        displayOrder: 1,
        isActive: true,
      });

      const result = await categoriesService.create({ name: 'Hotpot', displayOrder: 1 });
      expect(result.name).toBe('Hotpot');
      expect(prismaMock.category.create).toHaveBeenCalled();
    });

    it('should reject creating category with duplicate name', async () => {
      prismaMock.category.findFirst.mockResolvedValue({ id: 'cat-1', name: 'Hotpot' });

      await expect(categoriesService.create({ name: 'Hotpot' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should prevent deleting category containing dishes', async () => {
      prismaMock.category.findUnique.mockResolvedValue({
        id: 'cat-1',
        name: 'Hotpot',
        _count: { menuItems: 3 },
      });

      await expect(categoriesService.remove('cat-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('DishesService', () => {
    it('should create a dish linked to a valid category', async () => {
      prismaMock.category.findUnique.mockResolvedValue({ id: 'cat-1', name: 'Hotpot' });
      prismaMock.menuItem.create.mockResolvedValue({
        id: 'dish-1',
        categoryId: 'cat-1',
        name: 'Spicy Beef Hotpot',
        price: 250000,
        isAvailable: true,
      });

      const result = await dishesService.create({
        categoryId: 'cat-1',
        name: 'Spicy Beef Hotpot',
        price: 250000,
      });

      expect(result.name).toBe('Spicy Beef Hotpot');
      expect(prismaMock.menuItem.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if category does not exist', async () => {
      prismaMock.category.findUnique.mockResolvedValue(null);

      await expect(
        dishesService.create({
          categoryId: 'invalid-cat',
          name: 'Steak',
          price: 300000,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should toggle dish availability (86 out-of-stock toggle)', async () => {
      prismaMock.menuItem.findUnique.mockResolvedValue({ id: 'dish-1', isAvailable: true });
      prismaMock.menuItem.update.mockResolvedValue({ id: 'dish-1', isAvailable: false });

      const updated = await dishesService.toggleAvailability('dish-1', false);
      expect(updated.isAvailable).toBe(false);
      expect(prismaMock.menuItem.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isAvailable: false } }),
      );
    });

    it('should prevent deleting dish if referenced in orders', async () => {
      prismaMock.menuItem.findUnique.mockResolvedValue({
        id: 'dish-1',
        name: 'Spicy Hotpot',
        _count: { orderItems: 12 },
      });

      await expect(dishesService.remove('dish-1')).rejects.toThrow(BadRequestException);
    });
  });
});
