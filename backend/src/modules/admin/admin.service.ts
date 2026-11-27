import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RoleName } from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';

export interface SystemConfigState {
  restaurantName: string;
  branchName: string;
  currency: string;
  timezone: string;
  vatPercent: number;
  serviceChargePercent: number;
  sessionTimeoutMinutes: number;
  requireManagerApprovalDiscountOverPct: number;
  lowStockAlertMultiplier: number;
  auditRetentionDays: number;
  maintenanceMode: boolean;
}

@Injectable()
export class AdminService {
  private systemConfig: SystemConfigState = {
    restaurantName: 'OPERLY Dining & Hotpot',
    branchName: 'Da Nang Central',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    vatPercent: 8,
    serviceChargePercent: 5,
    sessionTimeoutMinutes: 60,
    requireManagerApprovalDiscountOverPct: 15,
    lowStockAlertMultiplier: 1.2,
    auditRetentionDays: 365,
    maintenanceMode: false,
  };

  constructor(private readonly prisma: PrismaService) {}

  private async writeAuditLog(
    actorId: string | null,
    action: string,
    entityName: string,
    entityId: string | null,
    oldValues: unknown,
    newValues: unknown,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId: actorId,
        action,
        entityName,
        entityId,
        oldValues: oldValues ? (oldValues as any) : undefined,
        newValues: newValues ? (newValues as any) : undefined,
      },
    });
  }

  async listUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        role: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      isActive: u.isActive,
      roleId: u.roleId,
      role: u.role.name,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  }

  private async ensureNotLastActiveAdmin(targetUser: { id: string; isActive: boolean; role: { name: RoleName } }) {
    if (targetUser.role.name === RoleName.ADMIN && targetUser.isActive) {
      const activeAdmins = await this.prisma.user.count({
        where: { isActive: true, role: { name: RoleName.ADMIN } },
      });
      if (activeAdmins <= 1) {
        throw new BadRequestException('Cannot suspend, demote, or delete the last active ADMIN account');
      }
    }
  }

  async createUser(
    actorId: string,
    dto: { fullName: string; phone: string; email?: string; password: string; roleName: RoleName; isActive?: boolean },
  ) {
    const existingPhone = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existingPhone) throw new ConflictException('Phone number is already registered');

    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existingEmail) throw new ConflictException('Email is already registered');
    }

    const role = await this.prisma.role.findUnique({ where: { name: dto.roleName } });
    if (!role) throw new BadRequestException(`Role ${dto.roleName} not found`);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const created = await this.prisma.user.create({
      data: {
        fullName: dto.fullName.trim(),
        phone: dto.phone.trim(),
        email: dto.email?.trim() || null,
        passwordHash,
        roleId: role.id,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
      include: { role: true },
    });

    await this.writeAuditLog(actorId, 'USER_CREATED', 'User', created.id, null, {
      fullName: created.fullName,
      phone: created.phone,
      email: created.email,
      role: created.role.name,
      isActive: created.isActive,
    });

    return {
      id: created.id,
      fullName: created.fullName,
      email: created.email,
      phone: created.phone,
      isActive: created.isActive,
      roleId: created.roleId,
      role: created.role.name,
      createdAt: created.createdAt,
    };
  }

  async updateUser(
    actorId: string,
    id: string,
    dto: { fullName?: string; email?: string; phone?: string; roleName?: RoleName },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    if (dto.phone && dto.phone !== user.phone) {
      const dupPhone = await this.prisma.user.findFirst({ where: { phone: dto.phone, id: { not: id } } });
      if (dupPhone) throw new ConflictException('Phone number is already in use');
    }

    if (dto.email && dto.email !== user.email) {
      const dupEmail = await this.prisma.user.findFirst({ where: { email: dto.email, id: { not: id } } });
      if (dupEmail) throw new ConflictException('Email address is already in use');
    }

    let roleId = user.roleId;
    if (dto.roleName && dto.roleName !== user.role.name) {
      if (user.role.name === RoleName.ADMIN) {
        await this.ensureNotLastActiveAdmin(user);
      }
      const targetRole = await this.prisma.role.findUnique({ where: { name: dto.roleName } });
      if (!targetRole) throw new BadRequestException(`Role ${dto.roleName} not found`);
      roleId = targetRole.id;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        fullName: dto.fullName !== undefined ? dto.fullName.trim() : user.fullName,
        email: dto.email !== undefined ? dto.email?.trim() || null : user.email,
        phone: dto.phone !== undefined ? dto.phone.trim() : user.phone,
        roleId,
      },
      include: { role: true },
    });

    await this.writeAuditLog(
      actorId,
      'USER_UPDATED',
      'User',
      id,
      { fullName: user.fullName, email: user.email, phone: user.phone, role: user.role.name },
      { fullName: updated.fullName, email: updated.email, phone: updated.phone, role: updated.role.name },
    );

    return {
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      phone: updated.phone,
      isActive: updated.isActive,
      roleId: updated.roleId,
      role: updated.role.name,
    };
  }

  async toggleUserStatus(actorId: string, id: string, isActive?: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    const nextActive = isActive !== undefined ? isActive : !user.isActive;
    if (!nextActive) {
      if (actorId === id) {
        throw new BadRequestException('You cannot suspend your own account');
      }
      await this.ensureNotLastActiveAdmin(user);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: nextActive },
      include: { role: true },
    });

    // Revoke active refresh tokens on suspension
    if (!nextActive) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    await this.writeAuditLog(
      actorId,
      nextActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
      'User',
      id,
      { isActive: user.isActive },
      { isActive: nextActive },
    );

    return {
      id: updated.id,
      fullName: updated.fullName,
      isActive: updated.isActive,
      role: updated.role.name,
    };
  }

  async deleteUser(actorId: string, id: string) {
    if (actorId === id) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        _count: {
          select: {
            reservations: true,
            openedSessions: true,
            closedSessions: true,
            orders: true,
            stockReceipts: true,
            stockMovements: true,
            bills: true,
            payments: true,
            refunds: true,
            shiftAssignments: true,
            attendances: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    await this.ensureNotLastActiveAdmin(user);

    const hasBusinessHistory = Object.values(user._count).some((count) => count > 0);
    if (hasBusinessHistory) {
      // Safe archival: deactivate & revoke sessions without deleting historical business records
      await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
      await this.prisma.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await this.writeAuditLog(
        actorId,
        'USER_ARCHIVED',
        'User',
        id,
        { isActive: user.isActive, fullName: user.fullName },
        { isActive: false, reason: 'Has historical business records' },
      );
      return {
        id,
        action: 'ARCHIVED',
        message: `User "${user.fullName}" has historical business records and was safely archived (deactivated).`,
      };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.auditLog.updateMany({ where: { userId: id }, data: { userId: null } });
      await tx.user.delete({ where: { id } });
    });

    await this.writeAuditLog(
      actorId,
      'USER_DELETED',
      'User',
      id,
      { fullName: user.fullName, email: user.email, role: user.role.name },
      null,
    );

    return {
      id,
      action: 'DELETED',
      message: `User "${user.fullName}" permanently deleted.`,
    };
  }

  async listRoles() {
    const roles = await this.prisma.role.findMany({
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
    });

    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      userCount: r._count.users,
      permissions: r.rolePermissions.map((rp) => rp.permission),
    }));
  }

  async listPermissions() {
    return this.prisma.permission.findMany({
      orderBy: { code: 'asc' },
    });
  }

  async updateRolePermissions(actorId: string, roleId: string, permissionIds: string[]) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: { rolePermissions: { include: { permission: true } } },
    });
    if (!role) throw new NotFoundException(`Role ${roleId} not found`);

    const oldCodes = role.rolePermissions.map((rp) => rp.permission.code);

    await this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId } });
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
        });
      }
    });

    const updated = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: { rolePermissions: { include: { permission: true } } },
    });

    await this.writeAuditLog(
      actorId,
      'ROLE_PERMISSIONS_UPDATED',
      'Role',
      roleId,
      { role: role.name, permissionsCount: oldCodes.length },
      { role: role.name, permissionsCount: permissionIds.length },
    );

    return {
      id: updated!.id,
      name: updated!.name,
      permissions: updated!.rolePermissions.map((rp) => rp.permission),
    };
  }

  async listAuditLogs(query: { action?: string; search?: string; limit?: number }) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        ...(query.action && query.action !== 'All' ? { action: query.action } : {}),
        ...(query.search
          ? {
              OR: [
                { action: { contains: query.search, mode: 'insensitive' } },
                { entityName: { contains: query.search, mode: 'insensitive' } },
                { entityId: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, role: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit || 100,
    });

    return logs;
  }

  getSystemConfig() {
    return this.systemConfig;
  }

  async updateSystemConfig(actorId: string, partial: Partial<SystemConfigState>) {
    const oldConfig = { ...this.systemConfig };
    this.systemConfig = {
      ...this.systemConfig,
      ...partial,
    };

    await this.writeAuditLog(
      actorId,
      'SYSTEM_CONFIG_UPDATED',
      'SystemConfig',
      'global',
      oldConfig,
      this.systemConfig,
    );

    return this.systemConfig;
  }
}
