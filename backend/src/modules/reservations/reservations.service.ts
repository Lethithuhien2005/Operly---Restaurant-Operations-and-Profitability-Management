import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DepositStatus,
  ReservationStatus,
  TableStatus,
} from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { ReservationQueryDto } from './dto/reservation-query.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReservationDto) {
    // 1. Verify customer exists
    const customer = await this.prisma.user.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID "${dto.customerId}" was not found`);
    }

    const requestedTime = new Date(dto.reservationTime);
    if (isNaN(requestedTime.getTime())) {
      throw new BadRequestException('Invalid reservation time format');
    }

    // 2. If table is assigned, validate table, capacity, and 90-minute conflict buffer
    if (dto.tableId) {
      const table = await this.prisma.table.findUnique({
        where: { id: dto.tableId },
      });
      if (!table) {
        throw new NotFoundException(`Table with ID "${dto.tableId}" was not found`);
      }

      if (table.capacity < dto.partySize) {
        throw new BadRequestException(
          `Table capacity (${table.capacity}) is insufficient for party size (${dto.partySize})`,
        );
      }

      await this.checkTableConflict(dto.tableId, requestedTime);
    }

    return this.prisma.reservation.create({
      data: {
        customerId: dto.customerId,
        guestName: dto.guestName,
        guestPhone: dto.guestPhone,
        specialRequest: dto.specialRequest,
        tableId: dto.tableId || null,
        partySize: dto.partySize,
        reservationTime: requestedTime,
        depositAmount: dto.depositAmount ?? 0,
        depositStatus:
          dto.depositAmount && dto.depositAmount > 0
            ? DepositStatus.PAID
            : DepositStatus.PENDING,
        status: ReservationStatus.PENDING,
      },
      include: {
        customer: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
        table: true,
      },
    });
  }

  async findAll(query?: ReservationQueryDto) {
    let dateFilter: any = undefined;
    if (query?.date) {
      const startOfDay = new Date(`${query.date}T00:00:00.000Z`);
      const endOfDay = new Date(`${query.date}T23:59:59.999Z`);
      dateFilter = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.reservation.findMany({
      where: {
        ...(query?.tableId ? { tableId: query.tableId } : {}),
        ...(query?.customerId ? { customerId: query.customerId } : {}),
        ...(query?.status ? { status: query.status } : {}),
        ...(dateFilter ? { reservationTime: dateFilter } : {}),
      },
      include: {
        customer: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
        table: {
          select: { id: true, tableNumber: true, floor: true, capacity: true },
        },
      },
      orderBy: { reservationTime: 'asc' },
    });
  }

  async findOne(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
        table: true,
        diningSession: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID "${id}" was not found`);
    }

    return reservation;
  }

  async update(id: string, dto: UpdateReservationDto) {
    const existing = await this.findOne(id);

    if (
      existing.status === ReservationStatus.CANCELLED ||
      existing.status === ReservationStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `Cannot update a reservation with status "${existing.status}"`,
      );
    }

    const tableId = dto.tableId !== undefined ? dto.tableId : existing.tableId;
    const reservationTime = dto.reservationTime
      ? new Date(dto.reservationTime)
      : existing.reservationTime;

    if (tableId && (dto.tableId !== undefined || dto.reservationTime !== undefined)) {
      const table = await this.prisma.table.findUnique({
        where: { id: tableId },
      });
      if (!table) {
        throw new NotFoundException(`Table with ID "${tableId}" was not found`);
      }

      const partySize = dto.partySize || existing.partySize;
      if (table.capacity < partySize) {
        throw new BadRequestException(
          `Table capacity (${table.capacity}) is insufficient for party size (${partySize})`,
        );
      }

      await this.checkTableConflict(tableId, reservationTime, id);
    }

    return this.prisma.reservation.update({
      where: { id },
      data: {
        guestName: dto.guestName,
        guestPhone: dto.guestPhone,
        specialRequest: dto.specialRequest,
        partySize: dto.partySize,
        reservationTime: dto.reservationTime ? new Date(dto.reservationTime) : undefined,
        depositAmount: dto.depositAmount,
        tableId: dto.tableId,
      },
      include: {
        table: true,
      },
    });
  }

  async updateStatus(id: string, status: ReservationStatus) {
    const reservation = await this.findOne(id);

    // Validate state transitions
    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('A cancelled reservation cannot change status');
    }
    if (reservation.status === ReservationStatus.COMPLETED) {
      throw new BadRequestException('A completed reservation cannot change status');
    }

    // If confirming reservation and table is assigned, mark table as RESERVED
    if (status === ReservationStatus.CONFIRMED && reservation.tableId) {
      await this.prisma.table.update({
        where: { id: reservation.tableId },
        data: { status: TableStatus.RESERVED },
      });
    }

    return this.prisma.reservation.update({
      where: { id },
      data: { status },
      include: {
        table: true,
        customer: {
          select: { id: true, fullName: true, phone: true },
        },
      },
    });
  }

  async cancel(id: string, reason?: string) {
    const reservation = await this.findOne(id);

    if (reservation.status === ReservationStatus.CANCELLED) {
      return reservation;
    }

    if (reservation.status === ReservationStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed reservation');
    }

    // If table was RESERVED, free it back to AVAILABLE if no other confirmed bookings exist
    if (reservation.tableId) {
      const otherBookings = await this.prisma.reservation.count({
        where: {
          tableId: reservation.tableId,
          status: ReservationStatus.CONFIRMED,
          NOT: { id },
        },
      });
      if (otherBookings === 0) {
        await this.prisma.table.update({
          where: { id: reservation.tableId },
          data: { status: TableStatus.AVAILABLE },
        });
      }
    }

    const updatedNote = reason
      ? reservation.specialRequest
        ? `${reservation.specialRequest} | Cancellation Reason: ${reason}`
        : `Cancellation Reason: ${reason}`
      : reservation.specialRequest;

    return this.prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CANCELLED,
        depositStatus:
          reservation.depositStatus === DepositStatus.PAID
            ? DepositStatus.REFUNDED
            : reservation.depositStatus,
        specialRequest: updatedNote,
      },
    });
  }

  /**
   * Enforces 90-minute conflict buffer rule on tables.
   */
  private async checkTableConflict(
    tableId: string,
    targetTime: Date,
    excludeReservationId?: string,
  ) {
    const bufferMs = 90 * 60 * 1000; // 90 minutes
    const windowStart = new Date(targetTime.getTime() - bufferMs);
    const windowEnd = new Date(targetTime.getTime() + bufferMs);

    const conflicting = await this.prisma.reservation.findFirst({
      where: {
        tableId,
        status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
        reservationTime: {
          gte: windowStart,
          lte: windowEnd,
        },
        ...(excludeReservationId ? { NOT: { id: excludeReservationId } } : {}),
      },
      include: { table: true },
    });

    if (conflicting) {
      const conflictFormatted = conflicting.reservationTime.toISOString();
      throw new ConflictException(
        `Table is already booked at ${conflictFormatted} (conflicts with 90-minute buffer window [${windowStart.toISOString()} - ${windowEnd.toISOString()}])`,
      );
    }
  }
}
