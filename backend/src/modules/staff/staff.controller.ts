import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { RoleName } from '../../generated/prisma/enums.js';
import { AssignShiftDto } from './dto/assign-shift.dto.js';
import { CreateShiftDto } from './dto/create-shift.dto.js';
import { CreateStaffDto } from './dto/create-staff.dto.js';
import { StaffQueryDto } from './dto/staff-query.dto.js';
import { UpdateStaffDto } from './dto/update-staff.dto.js';
import { StaffService } from './staff.service.js';

@ApiTags('Staff Management')
@Controller('api/v1/staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @Roles(RoleName.ADMIN)
  @ApiOperation({
    summary: 'Create operational staff account (ADMIN only)',
    description: 'Registers a new employee with an operational role (MANAGER, CASHIER, CHEF, WAITER).',
  })
  @ApiResponse({ status: 201, description: 'Staff account created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid role or customer role assigned' })
  @ApiResponse({ status: 409, description: 'Phone or email already registered' })
  createStaff(@Body() dto: CreateStaffDto) {
    return this.staffService.createStaff(dto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'List operational restaurant staff (ADMIN and MANAGER)' })
  @ApiResponse({ status: 200, description: 'Paginated list of staff members' })
  findAllStaff(@Query() query: StaffQueryDto) {
    return this.staffService.findAllStaff(query);
  }

  @Get('shifts')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CASHIER, RoleName.CHEF, RoleName.WAITER)
  @ApiOperation({ summary: 'List all operational shift definitions' })
  findAllShifts() {
    return this.staffService.findAllShifts();
  }

  @Post('shifts')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Create shift configuration (ADMIN only)' })
  createShift(@Body() dto: CreateShiftDto) {
    return this.staffService.createShift(dto);
  }

  @Post('shifts/assign')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Assign staff member to a shift on a date (ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Shift successfully assigned' })
  @ApiResponse({ status: 400, description: 'Duplicate shift assignment or customer target' })
  assignShift(@Body() dto: AssignShiftDto) {
    return this.staffService.assignShift(dto);
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get staff member profile details by ID' })
  @ApiParam({ name: 'id', description: 'Staff User UUID', format: 'uuid' })
  findStaffById(@Param('id', ParseUUIDPipe) id: string) {
    return this.staffService.findStaffById(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Update staff member profile / role / active status (ADMIN only)' })
  @ApiParam({ name: 'id', description: 'Staff User UUID', format: 'uuid' })
  updateStaff(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStaffDto,
  ) {
    return this.staffService.updateStaff(id, dto);
  }

  @Get(':id/schedule')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CASHIER, RoleName.CHEF, RoleName.WAITER)
  @ApiOperation({ summary: 'Get assigned shift schedule for a staff member' })
  @ApiParam({ name: 'id', description: 'Staff User UUID', format: 'uuid' })
  getStaffSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.staffService.getStaffSchedule(id, fromDate, toDate);
  }
}
