import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ReservationStatus,
  SessionStatus,
  TableStatus,
} from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateTableDto } from './dto/create-table.dto.js';
import { TableQueryDto } from './dto/table-query.dto.js';
import { UpdateTableDto } from './dto/update-table.dto.js';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTableDto) {
    const existingTable = await this.prisma.table.findUnique({
      where: { tableNumber: dto.tableNumber },
    });
    if (existingTable) {
      throw new ConflictException(
        `Table with number "${dto.tableNumber}" already exists`,
      );
    }

    const qrToken =
      dto.qrCodeToken ||
      `QR-${dto.tableNumber.toUpperCase()}-${randomUUID().slice(0, 8)}`;

    return this.prisma.table.create({
      data: {
        tableNumber: dto.tableNumber,
        floor: dto.floor,
        capacity: dto.capacity,
        status: dto.status ?? TableStatus.AVAILABLE,
        qrCodeToken: qrToken,
      },
    });
  }

  async findAll(query?: TableQueryDto) {
    return this.prisma.table.findMany({
      where: {
        ...(query?.floor ? { floor: query.floor } : {}),
        ...(query?.status ? { status: query.status } : {}),
      },
      include: {
        _count: {
          select: {
            diningSessions: true,
            reservations: true,
          },
        },
      },
      orderBy: [{ floor: 'asc' }, { tableNumber: 'asc' }],
    });
  }

  async findOne(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        diningSessions: {
          where: {
            status: { in: [SessionStatus.OPEN, SessionStatus.PAYING] },
          },
          include: {
            orders: {
              include: {
                orderItems: {
                  include: { menuItem: true },
                },
              },
            },
          },
          take: 1,
        },
        reservations: {
          where: {
            status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
          },
          orderBy: { reservationTime: 'asc' },
          take: 5,
        },
      },
    });

    if (!table) {
      throw new NotFoundException(`Table with ID "${id}" was not found`);
    }

    return table;
  }

  async update(id: string, dto: UpdateTableDto) {
    await this.findOne(id);

    if (dto.tableNumber) {
      const existing = await this.prisma.table.findFirst({
        where: {
          tableNumber: dto.tableNumber,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(
          `Another table with number "${dto.tableNumber}" already exists`,
        );
      }
    }

    return this.prisma.table.update({
      where: { id },
      data: {
        ...(dto.tableNumber !== undefined ? { tableNumber: dto.tableNumber } : {}),
        ...(dto.floor !== undefined ? { floor: dto.floor } : {}),
        ...(dto.capacity !== undefined ? { capacity: dto.capacity } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.qrCodeToken !== undefined ? { qrCodeToken: dto.qrCodeToken } : {}),
      },
    });
  }

  async updateStatus(id: string, status: TableStatus) {
    await this.findOne(id);

    return this.prisma.table.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string) {
    const table = await this.findOne(id);

    // Guard against active dining sessions
    const hasActiveSession = table.diningSessions.some(
      (s) => s.status === SessionStatus.OPEN || s.status === SessionStatus.PAYING,
    );
    if (hasActiveSession) {
      throw new BadRequestException(
        `Cannot delete table "${table.tableNumber}": An active dining session is currently in progress.`,
      );
    }

    // Guard against active reservations
    const hasActiveReservation = table.reservations.some(
      (r) =>
        r.status === ReservationStatus.PENDING ||
        r.status === ReservationStatus.CONFIRMED,
    );
    if (hasActiveReservation) {
      throw new BadRequestException(
        `Cannot delete table "${table.tableNumber}": Pending or confirmed reservations are scheduled for this table.`,
      );
    }

    return this.prisma.table.delete({
      where: { id },
    });
  }
}
