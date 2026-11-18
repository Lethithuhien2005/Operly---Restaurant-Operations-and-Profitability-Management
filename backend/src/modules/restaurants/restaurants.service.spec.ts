import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service.js';
import { BranchesService } from './branches.service.js';
import { RestaurantsService } from './restaurants.service.js';

describe('RestaurantsService & BranchesService', () => {
  let restaurantsService: RestaurantsService;
  let branchesService: BranchesService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      restaurant: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      branch: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    restaurantsService = new RestaurantsService(prismaMock as unknown as PrismaService);
    branchesService = new BranchesService(prismaMock as unknown as PrismaService);
  });

  describe('RestaurantsService', () => {
    it('should create a restaurant entity', async () => {
      const dto = { name: 'Operly Flagship', address: 'Da Nang' };
      prismaMock.restaurant.create.mockResolvedValue({ id: 'res-1', ...dto });

      const result = await restaurantsService.create(dto);
      expect(result).toHaveProperty('id', 'res-1');
      expect(prismaMock.restaurant.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when restaurant does not exist', async () => {
      prismaMock.restaurant.findUnique.mockResolvedValue(null);
      await expect(restaurantsService.findOne('res-999')).rejects.toThrow(NotFoundException);
    });

    it('should prevent deleting restaurant if active branches contain tables', async () => {
      prismaMock.restaurant.findUnique.mockResolvedValue({
        id: 'res-1',
        name: 'Operly Flagship',
        branches: [{ id: 'br-1', _count: { tables: 5 } }],
      });

      await expect(restaurantsService.remove('res-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('BranchesService', () => {
    it('should throw NotFoundException if parent restaurant does not exist', async () => {
      prismaMock.restaurant.findUnique.mockResolvedValue(null);
      await expect(
        branchesService.create({
          restaurantId: 'non-existent-res',
          name: 'Branch 1',
          address: '123 St',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should prevent deleting branch if tables are associated with it', async () => {
      prismaMock.branch.findUnique.mockResolvedValue({
        id: 'br-1',
        name: 'Downtown Branch',
        _count: { tables: 4, reservations: 0 },
      });

      await expect(branchesService.remove('br-1')).rejects.toThrow(BadRequestException);
    });

    it('should retrieve branches by restaurant ID', async () => {
      prismaMock.restaurant.findUnique.mockResolvedValue({ id: 'res-1', name: 'Operly Group' });
      prismaMock.branch.findMany.mockResolvedValue([
        { id: 'br-1', name: 'Branch Hai Chau', restaurantId: 'res-1' },
      ]);

      const branches = await branchesService.findByRestaurant('res-1');
      expect(branches).toHaveLength(1);
      expect(branches[0].name).toBe('Branch Hai Chau');
    });
  });
});
