import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import { CancelReservationDto } from './dto/cancel-reservation.dto.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { ReservationQueryDto } from './dto/reservation-query.dto.js';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';
import { ReservationsService } from './reservations.service.js';

@ApiTags('Dining Sessions & Orders')
@Controller('api/v1/reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Book a table reservation with 90-minute conflict buffer and branch verification',
  })
  @ApiResponse({ status: 201, description: 'Reservation registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed or table capacity insufficient' })
  @ApiResponse({ status: 404, description: 'Customer, branch, or table not found' })
  @ApiResponse({ status: 409, description: 'Table conflict within 90-minute buffer window' })
  create(@Body() dto: CreateReservationDto) {
    return this.reservationsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Query reservations with optional tableId, customerId, status, and date filters',
  })
  @ApiResponse({ status: 200, description: 'List of matching reservations' })
  findAll(@Query() query: ReservationQueryDto) {
    return this.reservationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full reservation details by UUID' })
  @ApiParam({ name: 'id', description: 'Reservation UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Reservation details' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CUSTOMER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update reservation details / table reassignment' })
  @ApiParam({ name: 'id', description: 'Reservation UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Reservation updated' })
  @ApiResponse({ status: 400, description: 'Cannot update completed or cancelled reservation' })
  @ApiResponse({ status: 404, description: 'Reservation or table not found' })
  @ApiResponse({ status: 409, description: 'Table conflict with updated time/table' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.WAITER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Transition reservation status (CONFIRMED, COMPLETED, CANCELLED)' })
  @ApiParam({ name: 'id', description: 'Reservation UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Status transitioned successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReservationStatusDto,
  ) {
    return this.reservationsService.updateStatus(id, dto.status);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel reservation with automatic refund and table release' })
  @ApiParam({ name: 'id', description: 'Reservation UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Reservation cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel completed reservation' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelReservationDto,
  ) {
    return this.reservationsService.cancel(id, dto.reason);
  }
}
