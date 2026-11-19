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
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import type { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface.js';
import { RoleName } from '../../generated/prisma/enums.js';
import { AttendanceService } from './attendance.service.js';
import { AttendanceQueryDto } from './dto/attendance-query.dto.js';
import { ClockInDto } from './dto/clock-in.dto.js';
import { ClockOutDto } from './dto/clock-out.dto.js';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto.js';
import { LeaveRequestQueryDto } from './dto/leave-request-query.dto.js';
import { ReviewLeaveRequestDto } from './dto/review-leave-request.dto.js';

@ApiTags('Attendance & Leave Requests')
@Controller('api/v1/attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CASHIER, RoleName.CHEF, RoleName.WAITER)
  @ApiOperation({
    summary: 'Clock-in for an assigned shift with Geofence GPS validation & Wi-Fi fallback',
  })
  @ApiResponse({ status: 201, description: 'Clock-in successful' })
  @ApiResponse({ status: 400, description: 'Outside geofence or not matching Wi-Fi' })
  @ApiResponse({ status: 409, description: 'Already clocked in for this shift assignment' })
  clockIn(@CurrentUser() user: AuthenticatedUser, @Body() dto: ClockInDto) {
    return this.attendanceService.clockIn(user.id, dto);
  }

  @Post('clock-out')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CASHIER, RoleName.CHEF, RoleName.WAITER)
  @ApiOperation({ summary: 'Clock-out from an active attendance punch' })
  @ApiResponse({ status: 200, description: 'Clock-out recorded' })
  @ApiResponse({ status: 400, description: 'Already clocked out' })
  clockOut(@CurrentUser() user: AuthenticatedUser, @Body() dto: ClockOutDto) {
    return this.attendanceService.clockOut(user.id, dto);
  }

  @Get('records')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'List staff attendance records (Admin & Manager)' })
  @ApiResponse({ status: 200, description: 'Paginated attendance records' })
  findAllAttendance(@Query() query: AttendanceQueryDto) {
    return this.attendanceService.findAllAttendance(query);
  }

  @Get('me')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CASHIER, RoleName.CHEF, RoleName.WAITER)
  @ApiOperation({ summary: 'List current employee attendance punch history' })
  getMyAttendance(@CurrentUser() user: AuthenticatedUser, @Query() query: AttendanceQueryDto) {
    return this.attendanceService.getMyAttendance(user.id, query);
  }

  @Post('leave-requests')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CASHIER, RoleName.CHEF, RoleName.WAITER)
  @ApiOperation({
    summary: 'Submit a new leave request (validates date range & checks overlapping requests)',
  })
  @ApiResponse({ status: 201, description: 'Leave request submitted in PENDING state' })
  @ApiResponse({ status: 400, description: 'Invalid date range or overlapping leave request' })
  createLeaveRequest(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateLeaveRequestDto) {
    return this.attendanceService.createLeaveRequest(user.id, dto);
  }

  @Get('leave-requests')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'List all leave requests for review (Admin & Manager)' })
  @ApiResponse({ status: 200, description: 'Paginated leave requests' })
  findAllLeaveRequests(@Query() query: LeaveRequestQueryDto) {
    return this.attendanceService.findAllLeaveRequests(query);
  }

  @Get('leave-requests/me')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CASHIER, RoleName.CHEF, RoleName.WAITER)
  @ApiOperation({ summary: 'List current employee submitted leave requests' })
  getMyLeaveRequests(@CurrentUser() user: AuthenticatedUser, @Query() query: LeaveRequestQueryDto) {
    return this.attendanceService.getMyLeaveRequests(user.id, query);
  }

  @Patch('leave-requests/:id/review')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({
    summary: 'Approve or Reject leave request (Admin and Manager only)',
    description: 'Enforces state transition: PENDING -> APPROVED | REJECTED, logs reviewer note and timestamp.',
  })
  @ApiParam({ name: 'id', description: 'Leave Request UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Leave request reviewed' })
  @ApiResponse({ status: 400, description: 'Leave request is not in PENDING state' })
  reviewLeaveRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReviewLeaveRequestDto,
  ) {
    return this.attendanceService.reviewLeaveRequest(id, user.id, dto);
  }

  @Patch('leave-requests/:id/cancel')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CASHIER, RoleName.CHEF, RoleName.WAITER)
  @ApiOperation({ summary: 'Cancel own PENDING leave request' })
  @ApiParam({ name: 'id', description: 'Leave Request UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Leave request cancelled' })
  @ApiResponse({ status: 400, description: 'Leave request is not in PENDING state' })
  cancelLeaveRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.attendanceService.cancelLeaveRequest(id, user.id);
  }
}
