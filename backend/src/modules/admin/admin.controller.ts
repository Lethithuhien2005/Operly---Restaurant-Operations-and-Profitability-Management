import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import type { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface.js';
import { RoleName } from '../../generated/prisma/enums.js';
import { AdminService, type SystemConfigState } from './admin.service.js';
import {
  CreateAdminUserDto,
  UpdateAdminUserDto,
  UpdateUserStatusDto,
} from './dto/admin-users.dto.js';

@ApiTags('System Administration')
@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all system user accounts' })
  listUsers() {
    return this.adminService.listUsers();
  }

  @Post('users')
  @ApiOperation({ summary: 'Create a new user account with assigned role' })
  createUser(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() body: CreateAdminUserDto,
  ) {
    return this.adminService.createUser(actor.id, body);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user details or role' })
  updateUser(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAdminUserDto,
  ) {
    return this.adminService.updateUser(actor.id, id, body);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Activate or suspend a user account' })
  toggleUserStatus(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserStatusDto,
  ) {
    return this.adminService.toggleUserStatus(actor.id, id, body?.isActive);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete or safely archive a user account' })
  deleteUser(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.adminService.deleteUser(actor.id, id);
  }

  @Get('roles')
  @ApiOperation({ summary: 'List all RBAC roles and their permissions' })
  listRoles() {
    return this.adminService.listRoles();
  }

  @Get('permissions')
  @ApiOperation({ summary: 'List all available system permissions' })
  listPermissions() {
    return this.adminService.listPermissions();
  }

  @Patch('roles/:id/permissions')
  @ApiOperation({ summary: 'Update permission assignments for a role' })
  updateRolePermissions(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('permissionIds') permissionIds: string[],
  ) {
    return this.adminService.updateRolePermissions(actor.id, id, permissionIds || []);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Query immutable system audit logs' })
  listAuditLogs(
    @Query('action') action?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listAuditLogs({
      action,
      search,
      limit: limit ? Number(limit) : 100,
    });
  }

  @Get('config')
  @ApiOperation({ summary: 'Get global system configuration' })
  getSystemConfig() {
    return this.adminService.getSystemConfig();
  }

  @Patch('config')
  @ApiOperation({ summary: 'Update global system configuration' })
  updateSystemConfig(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() body: Partial<SystemConfigState>,
  ) {
    return this.adminService.updateSystemConfig(actor.id, body);
  }
}
