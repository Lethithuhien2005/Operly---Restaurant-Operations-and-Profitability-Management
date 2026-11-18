import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RoleName } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RolesService } from '../roles/roles.service.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let rolesService: Partial<RolesService>;
  let jwtService: Partial<JwtService>;
  let prismaService: any;

  const mockCustomerRole = {
    id: 'role-customer-uuid',
    name: RoleName.CUSTOMER,
    description: 'Standard customer account',
    rolePermissions: [
      { permission: { code: 'RESERVATION_CREATE', name: 'Create Reservation' } },
    ],
  };

  const mockAdminRole = {
    id: 'role-admin-uuid',
    name: RoleName.ADMIN,
    description: 'Administrator account',
    rolePermissions: [
      { permission: { code: 'ORDER_CANCEL', name: 'Cancel Order' } },
      { permission: { code: 'REFUND_PAYMENT', name: 'Refund Payment' } },
    ],
  };

  beforeEach(async () => {
    usersService = {
      findByPhone: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
    };

    rolesService = {
      getCustomerRole: vi.fn().mockResolvedValue(mockCustomerRole),
      findByName: vi.fn(),
      findById: vi.fn(),
    };

    jwtService = {
      signAsync: vi.fn().mockImplementation((payload) => Promise.resolve(`mock-jwt-${JSON.stringify(payload)}`)),
      verifyAsync: vi.fn(),
    };

    prismaService = {
      refreshToken: {
        create: vi.fn().mockResolvedValue({ id: 'rt-uuid-1' }),
        findFirst: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: RolesService, useValue: rolesService },
        { provide: JwtService, useValue: jwtService },
        { provide: PrismaService, useValue: prismaService },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn((key: string) => {
              if (key === 'JWT_ACCESS_SECRET') return 'test_access_secret';
              if (key === 'JWT_REFRESH_SECRET') return 'test_refresh_secret';
              if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
              if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
              return null;
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  // 1. Successful customer registration
  it('1. should register a customer successfully and return tokens and user profile', async () => {
    const registerDto = {
      fullName: 'Customer Test',
      phoneNumber: '0987654321',
      email: 'customer@test.com',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    };

    (usersService.create as any).mockResolvedValue({
      id: 'user-uuid-1',
      fullName: 'Customer Test',
      phone: '0987654321',
      email: 'customer@test.com',
      roleId: mockCustomerRole.id,
      isActive: true,
      role: mockCustomerRole,
    });

    const result = await authService.register(registerDto);

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result.user.role).toBe(RoleName.CUSTOMER);
    expect(result.user.frontendRole).toBe('customer');
    expect(result.user.permissions).toContain('RESERVATION_CREATE');
    expect(prismaService.refreshToken.create).toHaveBeenCalled();
  });

  // 2. Duplicate email or phone registration
  it('2. should reject registration with duplicate phone or email', async () => {
    const registerDto = {
      fullName: 'Customer Duplicate',
      phoneNumber: '0987654321',
      email: 'duplicate@test.com',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    };

    (usersService.create as any).mockRejectedValue(
      new ConflictException('Phone number is already registered'),
    );

    await expect(authService.register(registerDto)).rejects.toThrow(ConflictException);
  });

  // 3. Registration cannot assign ADMIN or other privileged roles
  it('3. registration must ONLY create CUSTOMER accounts and ignore any privilege attempts', async () => {
    const registerDto = {
      fullName: 'Hacker Attempt',
      phoneNumber: '0912345678',
      email: 'hacker@test.com',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    };

    (usersService.create as any).mockResolvedValue({
      id: 'user-uuid-2',
      fullName: 'Hacker Attempt',
      phone: '0912345678',
      email: 'hacker@test.com',
      roleId: mockCustomerRole.id,
      isActive: true,
      role: mockCustomerRole,
    });

    const result = await authService.register(registerDto);

    // Verify role assigned in usersService.create is strictly mockCustomerRole.id
    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        roleId: mockCustomerRole.id,
      }),
    );
    expect(result.user.role).toBe(RoleName.CUSTOMER);
  });

  // Rejection if confirm password does not match
  it('should reject registration when confirm password does not match', async () => {
    const registerDto = {
      fullName: 'Password Mismatch',
      phoneNumber: '0987654321',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword!',
    };

    await expect(authService.register(registerDto)).rejects.toThrow(BadRequestException);
  });

  // 4. Successful login
  it('4. should log in successfully with correct credentials', async () => {
    const hashedPassword = await bcrypt.hash('CorrectPassword123!', 10);
    const mockUser = {
      id: 'user-uuid-1',
      fullName: 'Manager User',
      phone: '0901234567',
      email: 'manager@operly.vn',
      passwordHash: hashedPassword,
      roleId: mockAdminRole.id,
      isActive: true,
      role: mockAdminRole,
    };

    (usersService.findByEmail as any).mockResolvedValue(mockUser);

    const result = await authService.login({
      email: 'manager@operly.vn',
      password: 'CorrectPassword123!',
    });

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result.user.role).toBe(RoleName.ADMIN);
    expect(result.user.permissions).toContain('ORDER_CANCEL');
  });

  // 5. Incorrect password rejection
  it('5. should reject login with incorrect password', async () => {
    const hashedPassword = await bcrypt.hash('CorrectPassword123!', 10);
    const mockUser = {
      id: 'user-uuid-1',
      fullName: 'Manager User',
      phone: '0901234567',
      email: 'manager@operly.vn',
      passwordHash: hashedPassword,
      roleId: mockAdminRole.id,
      isActive: true,
      role: mockAdminRole,
    };

    (usersService.findByEmail as any).mockResolvedValue(mockUser);

    await expect(
      authService.login({
        email: 'manager@operly.vn',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  // 6. Inactive account rejection
  it('6. should reject login for inactive accounts', async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const mockUser = {
      id: 'user-uuid-inactive',
      fullName: 'Deactivated User',
      phone: '0909999999',
      email: 'deactivated@operly.vn',
      passwordHash: hashedPassword,
      roleId: mockCustomerRole.id,
      isActive: false, // Inactive
      role: mockCustomerRole,
    };

    (usersService.findByEmail as any).mockResolvedValue(mockUser);

    await expect(
      authService.login({
        email: 'deactivated@operly.vn',
        password: 'Password123!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  // 8. Refresh token rotation
  it('8. should rotate refresh token and return new tokens', async () => {
    const oldRefreshToken = 'valid-refresh-token-sample';
    (jwtService.verifyAsync as any).mockResolvedValue({ sub: 'user-uuid-1' });

    prismaService.refreshToken.findFirst.mockResolvedValue({
      id: 'token-db-id',
      userId: 'user-uuid-1',
      expiresAt: new Date(Date.now() + 1000000),
      revokedAt: null,
    });

    (usersService.findById as any).mockResolvedValue({
      id: 'user-uuid-1',
      fullName: 'Customer Test',
      phone: '0987654321',
      email: 'customer@test.com',
      roleId: mockCustomerRole.id,
      isActive: true,
      role: mockCustomerRole,
    });

    const result = await authService.refreshTokens(oldRefreshToken);

    // Old token must be revoked
    expect(prismaService.refreshToken.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'token-db-id' },
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
      }),
    );

    // New token must be saved
    expect(prismaService.refreshToken.create).toHaveBeenCalled();
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
  });

  // 9. Logout and token revocation
  it('9. should revoke refresh tokens upon logout', async () => {
    const result = await authService.logout('sample-token-to-revoke', 'user-uuid-1');

    expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ revokedAt: null }),
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
      }),
    );
    expect(result.message).toBe('Logged out successfully');
  });
});
