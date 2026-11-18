import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionStatus, TableStatus } from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TablesService } from './tables.service.js';

describe('TablesService', () => {
  let service: TablesService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      branch: {
        findUnique: vi.fn(),
      },
      table: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    service = new TablesService(prismaMock as unknown as PrismaService);
  });

  it('should create a table and assign it to a branch', async () => {
    prismaMock.branch.findUnique.mockResolvedValue({ id: 'branch-1', name: 'Main Branch' });
    prismaMock.table.findUnique.mockResolvedValue(null);
    prismaMock.table.create.mockResolvedValue({
      id: 'tbl-1',
      tableNumber: 'T-01',
      floor: 1,
      capacity: 4,
      status: TableStatus.AVAILABLE,
      qrCodeToken: 'QR-T-01-XYZ',
      branchId: 'branch-1',
    });

    const result = await service.create({
      branchId: 'branch-1',
      tableNumber: 'T-01',
      floor: 1,
      capacity: 4,
    });

    expect(result.tableNumber).toBe('T-01');
    expect(prismaMock.table.create).toHaveBeenCalled();
  });

  it('should throw NotFoundException if assigned branch does not exist', async () => {
    prismaMock.branch.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        branchId: 'invalid-branch-id',
        tableNumber: 'T-02',
        floor: 1,
        capacity: 2,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException on duplicate table number', async () => {
    prismaMock.table.findUnique.mockResolvedValue({ id: 'tbl-existing', tableNumber: 'T-01' });

    await expect(
      service.create({
        tableNumber: 'T-01',
        floor: 1,
        capacity: 4,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should update table operational status', async () => {
    prismaMock.table.findUnique.mockResolvedValue({ id: 'tbl-1', tableNumber: 'T-01' });
    prismaMock.table.update.mockResolvedValue({
      id: 'tbl-1',
      status: TableStatus.OCCUPIED,
    });

    const updated = await service.updateStatus('tbl-1', TableStatus.OCCUPIED);
    expect(updated.status).toBe(TableStatus.OCCUPIED);
  });

  it('should prevent table deletion if active dining session is in progress', async () => {
    prismaMock.table.findUnique.mockResolvedValue({
      id: 'tbl-1',
      tableNumber: 'T-01',
      diningSessions: [{ id: 'sess-1', status: SessionStatus.OPEN }],
      reservations: [],
    });

    await expect(service.remove('tbl-1')).rejects.toThrow(BadRequestException);
  });

  it('should retrieve all tables belonging to a branch', async () => {
    prismaMock.branch.findUnique.mockResolvedValue({ id: 'branch-1', name: 'Hai Chau' });
    prismaMock.table.findMany.mockResolvedValue([
      { id: 'tbl-1', tableNumber: 'T-01', branchId: 'branch-1' },
      { id: 'tbl-2', tableNumber: 'T-02', branchId: 'branch-1' },
    ]);

    const tables = await service.findByBranch('branch-1');
    expect(tables).toHaveLength(2);
    expect(prismaMock.table.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { branchId: 'branch-1' } }),
    );
  });
});
