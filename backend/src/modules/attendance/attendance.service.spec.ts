import { BadRequestException, ConflictException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AttendanceStatus, LeaveStatus } from '../../generated/prisma/enums.js';
import { AttendanceService, calculateHaversineDistanceMeters } from './attendance.service.js';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let prismaMock: any;
  let configServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      shiftAssignment: {
        findUnique: vi.fn(),
      },
      attendance: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      leaveRequest: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    };

    configServiceMock = {
      get: vi.fn((key: string) => {
        if (key === 'RESTAURANT_LATITUDE') return '10.7769';
        if (key === 'RESTAURANT_LONGITUDE') return '106.7009';
        if (key === 'RESTAURANT_GEOFENCE_RADIUS') return '50.0';
        if (key === 'RESTAURANT_WIFI_BSSID') return '00:14:22:01:23:45';
        return undefined;
      }),
    };

    service = new AttendanceService(prismaMock, configServiceMock as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Haversine Distance calculation', () => {
    it('should accurately calculate distance between two coordinates', () => {
      // Notre Dame Cathedral Saigon: 10.77978, 106.69901
      // Saigon Central Post Office: 10.77983, 106.69996 (approx 100 meters)
      const dist = calculateHaversineDistanceMeters(10.77978, 106.69901, 10.77983, 106.69996);
      expect(dist).toBeGreaterThan(90);
      expect(dist).toBeLessThan(120);
    });
  });

  describe('clockIn', () => {
    it('should throw ConflictException if already clocked in for this shift', async () => {
      prismaMock.shiftAssignment.findUnique.mockResolvedValue({
        id: 'sa-1',
        userId: 'user-1',
        attendances: [{ id: 'att-1' }],
      });

      await expect(
        service.clockIn('user-1', { shiftAssignmentId: 'sa-1' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject clock-in if restaurant geofence configuration is missing', async () => {
      configServiceMock.get.mockReturnValue(undefined);
      prismaMock.shiftAssignment.findUnique.mockResolvedValue({
        id: 'sa-1',
        userId: 'user-1',
        attendances: [],
        shift: { startTime: '08:00' },
        assignedDate: new Date('2026-11-20'),
      });

      await expect(
        service.clockIn('user-1', {
          shiftAssignmentId: 'sa-1',
          latitude: 10.7769,
          longitude: 106.7009,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject clock-in if device is outside geofence and Wi-Fi does not match', async () => {
      prismaMock.shiftAssignment.findUnique.mockResolvedValue({
        id: 'sa-1',
        userId: 'user-1',
        attendances: [],
        shift: { startTime: '08:00' },
        assignedDate: new Date('2026-11-20'),
      });

      // 5km away
      await expect(
        service.clockIn('user-1', {
          shiftAssignmentId: 'sa-1',
          latitude: 10.8200,
          longitude: 106.7500,
          wifiBssid: 'wrong-wifi',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept clock-in if outside geofence but Wi-Fi BSSID matches fallback and persist coordinates', async () => {
      prismaMock.shiftAssignment.findUnique.mockResolvedValue({
        id: 'sa-1',
        userId: 'user-1',
        attendances: [],
        shift: { startTime: '08:00' },
        assignedDate: new Date('2026-11-20'),
      });

      prismaMock.attendance.create.mockResolvedValue({
        id: 'att-1',
        userId: 'user-1',
        gpsLatitude: 10.8200,
        gpsLongitude: 106.7500,
        status: AttendanceStatus.ON_TIME,
      });

      const result = await service.clockIn('user-1', {
        shiftAssignmentId: 'sa-1',
        latitude: 10.8200, // outside geofence
        longitude: 106.7500,
        wifiBssid: '00:14:22:01:23:45', // Wi-Fi matches
      });

      expect(result.id).toBe('att-1');
      expect(prismaMock.attendance.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            shiftAssignmentId: 'sa-1',
            gpsLatitude: 10.8200,
            gpsLongitude: 106.7500,
          }),
        }),
      );
    });

    it('should clock-in successfully when within geofence and persist GPS coordinates', async () => {
      prismaMock.shiftAssignment.findUnique.mockResolvedValue({
        id: 'sa-1',
        userId: 'user-1',
        attendances: [],
        shift: { startTime: '08:00' },
        assignedDate: new Date('2026-11-20'),
      });

      prismaMock.attendance.create.mockResolvedValue({
        id: 'att-1',
        userId: 'user-1',
        gpsLatitude: 10.77691,
        gpsLongitude: 106.70091,
        status: AttendanceStatus.ON_TIME,
      });

      const result = await service.clockIn('user-1', {
        shiftAssignmentId: 'sa-1',
        latitude: 10.77691, // ~1 meter away
        longitude: 106.70091,
      });

      expect(result.id).toBe('att-1');
      expect(prismaMock.attendance.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            gpsLatitude: 10.77691,
            gpsLongitude: 106.70091,
          }),
        }),
      );
    });
  });

  describe('clockOut', () => {
    it('should clock out from active attendance', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue({
        id: 'att-1',
        userId: 'user-1',
        checkInTime: new Date(),
        checkOutTime: null,
      });

      prismaMock.attendance.update.mockResolvedValue({
        id: 'att-1',
        checkOutTime: new Date(),
      });

      const result = await service.clockOut('user-1', { attendanceId: 'att-1' });
      expect(result.checkOutTime).toBeDefined();
    });

    it('should reject clock-out if already clocked out', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue({
        id: 'att-1',
        userId: 'user-1',
        checkOutTime: new Date(),
      });

      await expect(
        service.clockOut('user-1', { attendanceId: 'att-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createLeaveRequest', () => {
    it('should reject if startDate is after endDate', async () => {
      await expect(
        service.createLeaveRequest('user-1', {
          startDate: '2026-11-28',
          endDate: '2026-11-20',
          reason: 'Sick leave',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if an overlapping active leave request already exists', async () => {
      prismaMock.leaveRequest.findFirst.mockResolvedValue({
        id: 'existing-lr',
        status: LeaveStatus.PENDING,
      });

      await expect(
        service.createLeaveRequest('user-1', {
          startDate: '2026-11-20',
          endDate: '2026-11-22',
          reason: 'Vacation',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create leave request with PENDING status', async () => {
      prismaMock.leaveRequest.findFirst.mockResolvedValue(null);
      prismaMock.leaveRequest.create.mockResolvedValue({
        id: 'lr-1',
        userId: 'user-1',
        status: LeaveStatus.PENDING,
      });

      const result = await service.createLeaveRequest('user-1', {
        startDate: '2026-11-25',
        endDate: '2026-11-26',
        reason: 'Wedding ceremony',
      });

      expect(result.status).toBe(LeaveStatus.PENDING);
    });
  });

  describe('reviewLeaveRequest', () => {
    it('should reject reviewing a leave request that is not PENDING', async () => {
      prismaMock.leaveRequest.findUnique.mockResolvedValue({
        id: 'lr-1',
        status: LeaveStatus.APPROVED,
      });

      await expect(
        service.reviewLeaveRequest('lr-1', 'mgr-1', {
          status: LeaveStatus.REJECTED,
          reviewNote: 'Already approved earlier',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should approve leave request and record reviewer info', async () => {
      prismaMock.leaveRequest.findUnique.mockResolvedValue({
        id: 'lr-1',
        status: LeaveStatus.PENDING,
      });

      prismaMock.leaveRequest.update.mockResolvedValue({
        id: 'lr-1',
        status: LeaveStatus.APPROVED,
        reviewedById: 'mgr-1',
        reviewNote: 'Approved. Enjoy your time.',
      });

      const result = await service.reviewLeaveRequest('lr-1', 'mgr-1', {
        status: LeaveStatus.APPROVED,
        reviewNote: 'Approved. Enjoy your time.',
      });

      expect(result.status).toBe(LeaveStatus.APPROVED);
      expect(prismaMock.leaveRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'lr-1' },
          data: expect.objectContaining({
            status: LeaveStatus.APPROVED,
            reviewedById: 'mgr-1',
          }),
        }),
      );
    });
  });

  describe('cancelLeaveRequest', () => {
    it('should allow employee to cancel own PENDING leave request', async () => {
      prismaMock.leaveRequest.findUnique.mockResolvedValue({
        id: 'lr-1',
        userId: 'user-1',
        status: LeaveStatus.PENDING,
      });

      prismaMock.leaveRequest.update.mockResolvedValue({
        id: 'lr-1',
        status: LeaveStatus.CANCELLED,
      });

      const result = await service.cancelLeaveRequest('lr-1', 'user-1');
      expect(result.status).toBe(LeaveStatus.CANCELLED);
    });

    it('should reject cancellation if request is already APPROVED', async () => {
      prismaMock.leaveRequest.findUnique.mockResolvedValue({
        id: 'lr-1',
        userId: 'user-1',
        status: LeaveStatus.APPROVED,
      });

      await expect(
        service.cancelLeaveRequest('lr-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
