import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RoleName } from '../../generated/prisma/enums.js';
import { JwtStrategy } from '../strategies/jwt.strategy.js';
import { PermissionsGuard } from './permissions.guard.js';
import { RolesGuard } from './roles.guard.js';

describe('Auth Guards & Strategy', () => {
  let reflector: Reflector;
  let rolesGuard: RolesGuard;
  let permissionsGuard: PermissionsGuard;
  let jwtStrategy: JwtStrategy;
  let usersService: any;

  beforeEach(() => {
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
    permissionsGuard = new PermissionsGuard(reflector);

    usersService = {
      findById: vi.fn(),
    };

    const configService = {
      get: vi.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;

    jwtStrategy = new JwtStrategy(configService, usersService);
  });

  const createMockContext = (user?: any): ExecutionContext => {
    const mockRequest = { user };
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;
  };

  // 7. Access token validation via JwtStrategy
  it('7. should validate active user payload and return full authenticated user profile', async () => {
    usersService.findById.mockResolvedValue({
      id: 'user-uuid-1',
      phone: '0987654321',
      email: 'user@operly.vn',
      fullName: 'Valid User',
      avatarUrl: null,
      roleId: 'role-uuid',
      isActive: true,
      role: {
        name: RoleName.WAITER,
        rolePermissions: [
          { permission: { code: 'ORDER_CREATE' } },
          { permission: { code: 'TABLE_STATUS_UPDATE' } },
        ],
      },
    });

    const result = await jwtStrategy.validate({
      sub: 'user-uuid-1',
      phone: '0987654321',
      email: 'user@operly.vn',
      role: RoleName.WAITER,
    });

    expect(result.id).toBe('user-uuid-1');
    expect(result.roleName).toBe(RoleName.WAITER);
    expect(result.frontendRole).toBe('waiter');
    expect(result.permissions).toEqual(['ORDER_CREATE', 'TABLE_STATUS_UPDATE']);
  });

  // 10. Unauthenticated requests
  it('10. should reject when user is deactivated in strategy', async () => {
    usersService.findById.mockResolvedValue({
      id: 'user-uuid-inactive',
      phone: '0987654321',
      isActive: false,
    });

    await expect(
      jwtStrategy.validate({
        sub: 'user-uuid-inactive',
        phone: '0987654321',
        email: null,
        role: RoleName.CUSTOMER,
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  // 11. Authenticated users without permission receive 403
  it('11. should throw 403 Forbidden when user lacks required permission', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN_REFUND_APPROVE']);

    const context = createMockContext({
      id: 'waiter-user-id',
      roleName: RoleName.WAITER,
      permissions: ['ORDER_CREATE', 'TABLE_VIEW'], // Missing ADMIN_REFUND_APPROVE
    });

    expect(() => permissionsGuard.canActivate(context)).toThrow(ForbiddenException);
  });

  // 12. Authorized roles can access permitted endpoints
  it('12. should allow access when user possesses the required role', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleName.MANAGER, RoleName.ADMIN]);

    const context = createMockContext({
      id: 'admin-user-id',
      roleName: RoleName.ADMIN,
      permissions: ['ALL_PERMISSIONS'],
    });

    const canActivate = rolesGuard.canActivate(context);
    expect(canActivate).toBe(true);
  });

  it('should throw 403 when user does not possess the required role', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleName.ADMIN]);

    const context = createMockContext({
      id: 'customer-user-id',
      roleName: RoleName.CUSTOMER,
      permissions: [],
    });

    expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow access when user possesses all required permissions', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ORDER_CANCEL', 'MENU_EDIT']);

    const context = createMockContext({
      id: 'manager-user-id',
      roleName: RoleName.MANAGER,
      permissions: ['ORDER_CANCEL', 'MENU_EDIT', 'REPORT_VIEW'],
    });

    const canActivate = permissionsGuard.canActivate(context);
    expect(canActivate).toBe(true);
  });
});
