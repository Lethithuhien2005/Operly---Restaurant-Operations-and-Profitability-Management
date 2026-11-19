import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RoleName } from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AssignShiftDto } from './dto/assign-shift.dto.js';
import { CreateShiftDto } from './dto/create-shift.dto.js';
import { CreateStaffDto } from './dto/create-staff.dto.js';
import { StaffQueryDto } from './dto/staff-query.dto.js';
import { UpdateStaffDto } from './dto/update-staff.dto.js';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List staff members (excluding CUSTOMER role), with search and filters
   */
  async findAllStaff(query: StaffQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      role: {
        name: {
          not: RoleName.CUSTOMER,
          ...(query.role ? { equals: query.role } : {}),
        },
      },
    };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phone: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: { id: true, name: true, description: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a staff member by ID
   */
  async findStaffById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        phone: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: { id: true, name: true, description: true },
        },
        shiftAssignments: {
          include: {
            shift: true,
            attendances: true,
          },
          orderBy: { assignedDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Staff member with ID "${id}" was not found`);
    }

    if (user.role.name === RoleName.CUSTOMER) {
      throw new BadRequestException('User is a customer, not an operational staff member');
    }

    return user;
  }

  /**
   * Create an operational staff account (ADMIN only).
   * Strictly enforces allowed operational roles (MANAGER, CASHIER, CHEF, WAITER).
   */
  async createStaff(dto: CreateStaffDto) {
    if (dto.role === RoleName.CUSTOMER) {
      throw new BadRequestException(
        'Staff account cannot be assigned the CUSTOMER role',
      );
    }

    // Check phone uniqueness
    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (existingPhone) {
      throw new ConflictException(`Phone number "${dto.phone}" is already in use`);
    }

    // Check email uniqueness if provided
    if (dto.email && dto.email.trim()) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email.trim().toLowerCase() },
      });
      if (existingEmail) {
        throw new ConflictException(`Email "${dto.email}" is already in use`);
      }
    }

    // Resolve Role record
    const roleRecord = await this.prisma.role.findUnique({
      where: { name: dto.role },
    });
    if (!roleRecord) {
      throw new NotFoundException(`Role "${dto.role}" does not exist in the system`);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const newUser = await this.prisma.user.create({
      data: {
        fullName: dto.fullName.trim(),
        phone: dto.phone.trim(),
        email: dto.email ? dto.email.trim().toLowerCase() : null,
        passwordHash,
        roleId: roleRecord.id,
        isActive: true,
      },
      select: {
        id: true,
        phone: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        role: {
          select: { id: true, name: true, description: true },
        },
      },
    });

    return newUser;
  }

  /**
   * Update staff account details (ADMIN only)
   */
  async updateStaff(id: string, dto: UpdateStaffDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`Staff member "${id}" was not found`);
    }

    if (user.role.name === RoleName.CUSTOMER) {
      throw new BadRequestException('Cannot manage customer accounts via staff management');
    }

    if (dto.phone && dto.phone !== user.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });
      if (existingPhone) {
        throw new ConflictException(`Phone number "${dto.phone}" is already in use`);
      }
    }

    if (dto.email && dto.email.toLowerCase() !== user.email?.toLowerCase()) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });
      if (existingEmail) {
        throw new ConflictException(`Email "${dto.email}" is already in use`);
      }
    }

    let roleId = user.roleId;
    if (dto.role) {
      if (dto.role === RoleName.CUSTOMER) {
        throw new BadRequestException('Cannot reassign staff to CUSTOMER role');
      }
      const roleRecord = await this.prisma.role.findUnique({
        where: { name: dto.role },
      });
      if (!roleRecord) {
        throw new NotFoundException(`Role "${dto.role}" does not exist`);
      }
      roleId = roleRecord.id;
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        fullName: dto.fullName !== undefined ? dto.fullName.trim() : undefined,
        phone: dto.phone !== undefined ? dto.phone.trim() : undefined,
        email: dto.email !== undefined ? dto.email.trim().toLowerCase() : undefined,
        roleId,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
      },
      select: {
        id: true,
        phone: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        isActive: true,
        updatedAt: true,
        role: {
          select: { id: true, name: true, description: true },
        },
      },
    });
  }

  /**
   * Shifts & Scheduling
   */
  async createShift(dto: CreateShiftDto) {
    return this.prisma.shift.create({
      data: {
        name: dto.name.trim(),
        startTime: dto.startTime.trim(),
        endTime: dto.endTime.trim(),
      },
    });
  }

  async findAllShifts() {
    return this.prisma.shift.findMany({
      orderBy: { startTime: 'asc' },
    });
  }

  async assignShift(dto: AssignShiftDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`Staff user "${dto.userId}" was not found`);
    }

    if (user.role.name === RoleName.CUSTOMER) {
      throw new BadRequestException('Cannot assign shifts to customers');
    }

    const shift = await this.prisma.shift.findUnique({
      where: { id: dto.shiftId },
    });

    if (!shift) {
      throw new NotFoundException(`Shift "${dto.shiftId}" was not found`);
    }

    const assignedDate = new Date(dto.assignedDate);

    const existingAssignment = await this.prisma.shiftAssignment.findUnique({
      where: {
        userId_shiftId_assignedDate: {
          userId: dto.userId,
          shiftId: dto.shiftId,
          assignedDate,
        },
      },
    });

    if (existingAssignment) {
      throw new BadRequestException(
        `Staff member is already assigned to this shift on ${dto.assignedDate}`,
      );
    }

    return this.prisma.shiftAssignment.create({
      data: {
        userId: dto.userId,
        shiftId: dto.shiftId,
        assignedDate,
      },
      include: {
        shift: true,
        user: {
          select: { id: true, fullName: true, phone: true },
        },
      },
    });
  }

  async getStaffSchedule(userId: string, fromDate?: string, toDate?: string) {
    const where: any = { userId };

    if (fromDate || toDate) {
      where.assignedDate = {};
      if (fromDate) where.assignedDate.gte = new Date(fromDate);
      if (toDate) where.assignedDate.lte = new Date(toDate);
    }

    return this.prisma.shiftAssignment.findMany({
      where,
      include: {
        shift: true,
        attendances: true,
      },
      orderBy: { assignedDate: 'asc' },
    });
  }
}
