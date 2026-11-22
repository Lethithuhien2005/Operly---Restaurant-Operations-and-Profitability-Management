import { BadRequestException, ConflictException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionStatus, TableStatus } from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TablesService } from './tables.service.js';

describe('TablesService', () => {
  let service: TablesService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
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

  it('should create a table in the restaurant', async () => {
    prismaMock.table.findUnique.mockResolvedValue(null);
    prismaMock.table.create.mockResolvedValue({
      id: 'tbl-1',
      tableNumber: 'T-01',
      floor: 1,
      capacity: 4,
      status: TableStatus.AVAILABLE,
      qrCodeToken: 'QR-T-01-XYZ',
    });

    const result = await service.create({
      tableNumber: 'T-01',
      floor: 1,
      capacity: 4,
    });

    expect(result.tableNumber).toBe('T-01');
    expect(prismaMock.table.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tableNumber: 'T-01',
          floor: 1,
          capacity: 4,
          status: TableStatus.AVAILABLE,
        }),
      }),
    );
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

  it('should list tables filtered by floor and status', async () => {
    prismaMock.table.findMany.mockResolvedValue([
      { id: 'tbl-1', tableNumber: 'T-01', floor: 1, status: TableStatus.AVAILABLE },
    ]);

    const result = await service.findAll({ floor: 1, status: TableStatus.AVAILABLE });
    expect(result).toHaveLength(1);
    expect(prismaMock.table.findMany).toHaveBeenCalledWith({
      where: { floor: 1, status: TableStatus.AVAILABLE },
      include: expect.any(Object),
      orderBy: expect.any(Array),
    });
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
});
