import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service.js';
import { PaginationQueryDto } from './common/dto/pagination-query.dto.js';
import { RegisterUserDto } from './modules/auth/dto/register-user.dto.js';
import { CreateOrderDto } from './modules/orders/dto/create-order.dto.js';
import { CreateReservationDto } from './modules/reservations/dto/create-reservation.dto.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiTags('System & Health')
  @ApiOperation({ summary: 'Server root health check' })
  @ApiResponse({ status: 200, description: 'Operly Backend status confirmation', schema: { example: 'Operly Backend is running!' } })
  getHello(): string {
    return 'Operly Backend is running!';
  }

  @Get('health/database')
  @ApiTags('System & Health')
  @ApiOperation({ summary: 'Check PostgreSQL database connectivity' })
  @ApiResponse({
    status: 200,
    description: 'Database connection verified',
    schema: { example: { database: 'connected' } },
  })
  checkDatabase(): Promise<{ database: string }> {
    return this.appService.checkDatabase();
  }

  // --- Demonstration & Documentation Endpoints for Validation & Swagger ---

  @Post('api/v1/auth/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiTags('Auth & RBAC')
  @ApiOperation({ summary: 'Register a new staff member or customer' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Validation failed (e.g. invalid phone, email, or missing fields)' })
  registerUser(@Body() dto: RegisterUserDto) {
    return {
      message: 'Validation passed successfully',
      data: dto,
    };
  }

  @Post('api/v1/reservations')
  @HttpCode(HttpStatus.CREATED)
  @ApiTags('Dining Sessions & Orders')
  @ApiOperation({ summary: 'Create a new table reservation with deposit' })
  @ApiBody({ type: CreateReservationDto })
  @ApiResponse({ status: 201, description: 'Reservation registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed on party size, ISO date or phone' })
  createReservation(@Body() dto: CreateReservationDto) {
    return {
      message: 'Reservation validation passed successfully',
      data: dto,
    };
  }

  @Post('api/v1/orders')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiTags('Dining Sessions & Orders')
  @ApiOperation({ summary: 'Create an order batch with nested order items (supports KDS)' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created and queued for kitchen' })
  @ApiResponse({ status: 400, description: 'Validation failed on nested item array or numeric fields' })
  createOrder(@Body() dto: CreateOrderDto) {
    return {
      message: 'Order with nested items validation passed successfully',
      data: dto,
    };
  }

  @Get('api/v1/menu-items')
  @ApiTags('Restaurant Setup')
  @ApiOperation({ summary: 'List and paginate menu items with search filter' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'phở' })
  @ApiResponse({ status: 200, description: 'Paginated list of menu items' })
  listMenuItems(@Query() query: PaginationQueryDto) {
    return {
      page: query.page,
      limit: query.limit,
      search: query.search ?? null,
      items: [],
    };
  }

  @Get('api/v1/menu-items/:id')
  @ApiTags('Restaurant Setup')
  @ApiOperation({ summary: 'Get details of a specific menu item by UUID' })
  @ApiParam({ name: 'id', description: 'Menu Item UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Menu item details' })
  @ApiResponse({ status: 400, description: 'Invalid UUID parameter format' })
  getMenuItemById(@Param('id', ParseUUIDPipe) id: string) {
    return {
      id,
      name: 'Phở Bò Đặc Biệt',
      price: 65000,
    };
  }
}
