import { BadRequestException, ConflictException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleName } from '../../generated/prisma/enums.js';
import { StaffService } from './staff.service.js';

describe('StaffService', () => {
  let service: StaffService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      role: {
        findUnique: vi.fn(),
      },
      shift: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
      },
      shiftAssignment: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
      },
    };

    service = new StaffService(prismaMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createStaff', () => {
    it('should reject creating staff with CUSTOMER role', async () => {
      await expect(
        service.createStaff({
          fullName: 'Customer Test',
          phone: '0901234567',
          password: 'password123',
          role: RoleName.CUSTOMER,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if phone is already registered', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 'existing-user' });

      await expect(
        service.createStaff({
          fullName: 'Staff Test',
          phone: '0901234567',
          password: 'password123',
          role: RoleName.WAITER,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password and create staff account', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.role.findUnique.mockResolvedValue({ id: 'role-waiter-id', name: RoleName.WAITER });
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        fullName: 'Nguyen Van A',
        phone: '0901234567',
        role: { name: RoleName.WAITER },
      });

      const result = await service.createStaff({
        fullName: 'Nguyen Van A',
        phone: '0901234567',
        password: 'password123',
        role: RoleName.WAITER,
      });

      expect(prismaMock.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fullName: 'Nguyen Van A',
            phone: '0901234567',
            roleId: 'role-waiter-id',
          }),
        }),
      );
      expect(result.id).toBe('user-1');
    });
  });

  describe('assignShift', () => {
    it('should prevent assigning shifts to customers', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'cust-1',
        role: { name: RoleName.CUSTOMER },
      });

      await expect(
        service.assignShift({
          userId: 'cust-1',
          shiftId: 'shift-1',
          assignedDate: '2026-11-20',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate shift assignment on the same date', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'staff-1',
        role: { name: RoleName.WAITER },
      });
      prismaMock.shift.findUnique.mockResolvedValue({ id: 'shift-1', name: 'Morning' });
      prismaMock.shiftAssignment.findUnique.mockResolvedValue({ id: 'existing-sa' });

      await expect(
        service.assignShift({
          userId: 'staff-1',
          shiftId: 'shift-1',
          assignedDate: '2026-11-20',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should assign shift successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'staff-1',
        role: { name: RoleName.WAITER },
      });
      prismaMock.shift.findUnique.mockResolvedValue({ id: 'shift-1', name: 'Morning' });
      prismaMock.shiftAssignment.findUnique.mockResolvedValue(null);
      prismaMock.shiftAssignment.create.mockResolvedValue({
        id: 'sa-1',
        userId: 'staff-1',
        shiftId: 'shift-1',
        assignedDate: new Date('2026-11-20'),
      });

      const result = await service.assignShift({
        userId: 'staff-1',
        shiftId: 'shift-1',
        assignedDate: '2026-11-20',
      });

      expect(result.id).toBe('sa-1');
      expect(prismaMock.shiftAssignment.create).toHaveBeenCalled();
    });
  });
});
