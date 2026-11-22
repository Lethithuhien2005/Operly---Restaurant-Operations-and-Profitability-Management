import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AttendanceStatus,
  LeaveStatus,
} from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AttendanceQueryDto } from './dto/attendance-query.dto.js';
import { ClockInDto } from './dto/clock-in.dto.js';
import { ClockOutDto } from './dto/clock-out.dto.js';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto.js';
import { LeaveRequestQueryDto } from './dto/leave-request-query.dto.js';
import { ReviewLeaveRequestDto } from './dto/review-leave-request.dto.js';

export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Clock-in for an assigned shift with Geofence GPS verification and Wi-Fi BSSID fallback
   */
  async clockIn(userId: string, dto: ClockInDto) {
    const assignment = await this.prisma.shiftAssignment.findUnique({
      where: { id: dto.shiftAssignmentId },
      include: {
        shift: true,
        attendances: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException(`Shift assignment "${dto.shiftAssignmentId}" not found`);
    }

    if (assignment.userId !== userId) {
      throw new BadRequestException('Cannot record attendance for another staff member');
    }

    if (assignment.attendances.length > 0) {
      throw new ConflictException(
        'Attendance has already been clocked in for this shift assignment',
      );
    }

    // Geofence / location verification using ConfigService for single-restaurant architecture
    const restLatStr = this.configService.get<string>('RESTAURANT_LATITUDE');
    const restLonStr = this.configService.get<string>('RESTAURANT_LONGITUDE');
    const restRadiusStr = this.configService.get<string>('RESTAURANT_GEOFENCE_RADIUS');
    const configuredWifiBssid = this.configService.get<string>('RESTAURANT_WIFI_BSSID');

    const restLat = restLatStr !== undefined && restLatStr !== null ? parseFloat(restLatStr) : NaN;
    const restLon = restLonStr !== undefined && restLonStr !== null ? parseFloat(restLonStr) : NaN;
    const maxRadius = restRadiusStr !== undefined && restRadiusStr !== null ? parseFloat(restRadiusStr) : 50.0;

    if (
      isNaN(restLat) ||
      isNaN(restLon) ||
      restLat < -90 ||
      restLat > 90 ||
      restLon < -180 ||
      restLon > 180 ||
      isNaN(maxRadius) ||
      maxRadius <= 0
    ) {
      throw new BadRequestException(
        'Restaurant geofence coordinates are not configured or invalid on the server',
      );
    }

    let locationVerified = false;

    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      if (
        dto.latitude < -90 ||
        dto.latitude > 90 ||
        dto.longitude < -180 ||
        dto.longitude > 180
      ) {
        throw new BadRequestException('Invalid GPS coordinates provided');
      }

      const distance = calculateHaversineDistanceMeters(
        dto.latitude,
        dto.longitude,
        restLat,
        restLon,
      );

      if (distance <= maxRadius) {
        locationVerified = true;
      }
    }

    // Wi-Fi BSSID fallback
    if (
      !locationVerified &&
      configuredWifiBssid &&
      dto.wifiBssid &&
      configuredWifiBssid.trim().toLowerCase() === dto.wifiBssid.trim().toLowerCase()
    ) {
      locationVerified = true;
    }

    if (!locationVerified) {
      throw new BadRequestException(
        `Clock-in location is outside the restaurant geofence boundary (max ${maxRadius}m) and Wi-Fi BSSID did not match`,
      );
    }

    // Evaluate punctuality against scheduled shift start time
    const now = new Date();
    let status: AttendanceStatus = AttendanceStatus.ON_TIME;

    if (assignment.shift.startTime) {
      const [startHour, startMinute] = assignment.shift.startTime
        .split(':')
        .map(Number);
      const scheduledStart = new Date(assignment.assignedDate);
      scheduledStart.setHours(startHour, startMinute, 0, 0);

      // Grace period of 5 minutes allowed
      const gracePeriodMs = 5 * 60 * 1000;
      if (now.getTime() > scheduledStart.getTime() + gracePeriodMs) {
        status = AttendanceStatus.LATE;
      }
    }

    return this.prisma.attendance.create({
      data: {
        userId,
        shiftAssignmentId: assignment.id,
        checkInTime: now,
        gpsLatitude: dto.latitude !== undefined ? dto.latitude : null,
        gpsLongitude: dto.longitude !== undefined ? dto.longitude : null,
        status,
      },
      include: {
        shiftAssignment: {
          include: { shift: true },
        },
      },
    });
  }

  /**
   * Clock-out from an active attendance punch
   */
  async clockOut(userId: string, dto: ClockOutDto) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: dto.attendanceId },
      include: {
        shiftAssignment: {
          include: { shift: true },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record "${dto.attendanceId}" was not found`);
    }

    if (attendance.userId !== userId) {
      throw new BadRequestException('Cannot clock out attendance for another staff member');
    }

    if (attendance.checkOutTime !== null) {
      throw new BadRequestException('Attendance has already been clocked out');
    }

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime: new Date(),
      },
      include: {
        shiftAssignment: {
          include: { shift: true },
        },
      },
    });
  }

  /**
   * Query attendance records (Manager & Admin)
   */
  async findAllAttendance(query: AttendanceQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.userId) {
      where.userId = query.userId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.date) {
      where.shiftAssignment = {
        assignedDate: new Date(query.date),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { checkInTime: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, phone: true },
          },
          shiftAssignment: {
            include: { shift: true },
          },
        },
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Query current user's attendance records
   */
  async getMyAttendance(userId: string, query: AttendanceQueryDto) {
    const q: AttendanceQueryDto = {
      userId,
      status: query.status,
      date: query.date,
      page: query.page,
      limit: query.limit,
    };
    return this.findAllAttendance(q);
  }

  /**
   * Submit a new Leave Request
   * Validates startDate <= endDate and prevents overlapping requests
   */
  async createLeaveRequest(userId: string, dto: CreateLeaveRequestDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start > end) {
      throw new BadRequestException('Leave startDate cannot be after endDate');
    }

    // Check for overlapping PENDING or APPROVED leave requests
    const overlapping = await this.prisma.leaveRequest.findFirst({
      where: {
        userId,
        status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        `An active or pending leave request already overlaps with ${dto.startDate} to ${dto.endDate}`,
      );
    }

    return this.prisma.leaveRequest.create({
      data: {
        userId,
        startDate: start,
        endDate: end,
        reason: dto.reason.trim(),
        status: LeaveStatus.PENDING,
      },
      include: {
        user: {
          select: { id: true, fullName: true, phone: true },
        },
      },
    });
  }

  /**
   * List leave requests (MANAGER and ADMIN)
   */
  async findAllLeaveRequests(query: LeaveRequestQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.userId) {
      where.userId = query.userId;
    }
    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, phone: true },
          },
          reviewer: {
            select: { id: true, fullName: true },
          },
        },
      }),
      this.prisma.leaveRequest.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * List current user's leave requests
   */
  async getMyLeaveRequests(userId: string, query: LeaveRequestQueryDto) {
    const q: LeaveRequestQueryDto = {
      userId,
      status: query.status,
      page: query.page,
      limit: query.limit,
    };
    return this.findAllLeaveRequests(q);
  }

  /**
   * Review leave request (MANAGER and ADMIN only)
   * Enforces status transition PENDING -> APPROVED | REJECTED
   */
  async reviewLeaveRequest(
    id: string,
    reviewerId: string,
    dto: ReviewLeaveRequestDto,
  ) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leave) {
      throw new NotFoundException(`Leave request "${id}" was not found`);
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        `Cannot review a leave request that is already ${leave.status}`,
      );
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: dto.status,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        reviewNote: dto.reviewNote?.trim() || null,
      },
      include: {
        user: {
          select: { id: true, fullName: true, phone: true },
        },
        reviewer: {
          select: { id: true, fullName: true },
        },
      },
    });
  }

  /**
   * Cancel employee's own PENDING leave request
   */
  async cancelLeaveRequest(id: string, userId: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leave) {
      throw new NotFoundException(`Leave request "${id}" was not found`);
    }

    if (leave.userId !== userId) {
      throw new BadRequestException('Cannot cancel another employee’s leave request');
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        `Cannot cancel a leave request with status "${leave.status}". Only PENDING requests may be cancelled`,
      );
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: LeaveStatus.CANCELLED,
      },
    });
  }
}
