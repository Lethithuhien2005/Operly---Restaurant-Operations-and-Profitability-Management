import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DepositStatus, ReservationStatus, TableStatus } from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ReservationsService } from './reservations.service.js';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: vi.fn(),
      },
      branch: {
        findUnique: vi.fn(),
      },
      table: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      reservation: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
    };

    service = new ReservationsService(prismaMock as unknown as PrismaService);
  });

  it('should create a reservation successfully', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1', fullName: 'Tran Thi B' });
    prismaMock.table.findUnique.mockResolvedValue({
      id: 'tbl-1',
      tableNumber: 'T-01',
      capacity: 4,
      branchId: 'br-1',
    });
    prismaMock.reservation.findFirst.mockResolvedValue(null); // No conflict
    prismaMock.reservation.create.mockResolvedValue({
      id: 'resv-1',
      customerId: 'user-1',
      tableId: 'tbl-1',
      partySize: 4,
      status: ReservationStatus.PENDING,
    });

    const result = await service.create({
      customerId: 'user-1',
      tableId: 'tbl-1',
      guestName: 'Tran Thi B',
      guestPhone: '0912345678',
      partySize: 4,
      reservationTime: '2026-11-20T19:00:00.000Z',
    });

    expect(result.id).toBe('resv-1');
    expect(prismaMock.reservation.create).toHaveBeenCalled();
  });

  it('should throw NotFoundException if customer does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        customerId: 'non-existent-user',
        guestName: 'Guest',
        guestPhone: '0912345678',
        partySize: 2,
        reservationTime: '2026-11-20T19:00:00.000Z',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if table capacity is smaller than party size', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });
    prismaMock.table.findUnique.mockResolvedValue({ id: 'tbl-1', capacity: 2 });

    await expect(
      service.create({
        customerId: 'user-1',
        tableId: 'tbl-1',
        guestName: 'Guest',
        guestPhone: '0912345678',
        partySize: 6,
        reservationTime: '2026-11-20T19:00:00.000Z',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw ConflictException if table is already booked within 90-minute window', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });
    prismaMock.table.findUnique.mockResolvedValue({ id: 'tbl-1', capacity: 4 });
    prismaMock.reservation.findFirst.mockResolvedValue({
      id: 'resv-conflicting',
      reservationTime: new Date('2026-11-20T19:30:00.000Z'),
    });

    await expect(
      service.create({
        customerId: 'user-1',
        tableId: 'tbl-1',
        guestName: 'Guest',
        guestPhone: '0912345678',
        partySize: 4,
        reservationTime: '2026-11-20T19:00:00.000Z',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should free table back to AVAILABLE upon reservation cancellation if no other bookings', async () => {
    prismaMock.reservation.findUnique.mockResolvedValue({
      id: 'resv-1',
      status: ReservationStatus.CONFIRMED,
      tableId: 'tbl-1',
      depositStatus: DepositStatus.PAID,
    });
    prismaMock.reservation.count.mockResolvedValue(0);
    prismaMock.reservation.update.mockResolvedValue({
      id: 'resv-1',
      status: ReservationStatus.CANCELLED,
    });

    await service.cancel('resv-1', 'Personal emergency');

    expect(prismaMock.table.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'tbl-1' },
        data: { status: TableStatus.AVAILABLE },
      }),
    );
  });
});
