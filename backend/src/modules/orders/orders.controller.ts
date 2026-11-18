import {
  Body,
  Controller,
  Delete,
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
import { AddOrderItemsDto } from './dto/add-order-items.dto.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderQueryDto } from './dto/order-query.dto.js';
import { UpdateOrderItemStatusDto } from './dto/update-order-item-status.dto.js';
import { UpdateOrderItemDto } from './dto/update-order-item.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';
import { OrdersService } from './orders.service.js';

@ApiTags('Dining Sessions & Orders')
@Controller('api/v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create an atomic order batch with nested items, backend subtotal calculation, and session/table binding',
  })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed or item 86 out of stock' })
  @ApiResponse({ status: 404, description: 'Session, table, or dish not found' })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Query orders with optional sessionId, tableId, branchId, status, and date filters',
  })
  @ApiResponse({ status: 200, description: 'List of matching orders' })
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full order details with itemized dishes, table, and branch' })
  @ApiParam({ name: 'id', description: 'Order UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.WAITER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update order status or assign waiter (Admin / Manager / Waiter)' })
  @ApiParam({ name: 'id', description: 'Order UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Order updated' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, dto);
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Append items to an active order with automatic total recalculation' })
  @ApiParam({ name: 'id', description: 'Order UUID', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Items added and total updated' })
  @ApiResponse({ status: 400, description: 'Cannot add items to completed/cancelled order' })
  @ApiResponse({ status: 404, description: 'Order or dish not found' })
  addItems(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddOrderItemsDto,
  ) {
    return this.ordersService.addItems(id, dto);
  }

  @Patch(':id/items/:itemId')
  @ApiOperation({ summary: 'Update item quantity or kitchen preparation notes' })
  @ApiParam({ name: 'id', description: 'Order UUID', format: 'uuid' })
  @ApiParam({ name: 'itemId', description: 'Order item UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Item updated and total recalculated' })
  @ApiResponse({ status: 404, description: 'Order or item not found' })
  updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateOrderItemDto,
  ) {
    return this.ordersService.updateItem(id, itemId, dto);
  }

  @Patch(':id/items/:itemId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CHEF, RoleName.WAITER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update kitchen preparation status of an item (PENDING, COOKING, READY, SERVED, REJECTED)',
  })
  @ApiParam({ name: 'id', description: 'Order UUID', format: 'uuid' })
  @ApiParam({ name: 'itemId', description: 'Order item UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Item status updated' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  updateItemStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateOrderItemStatusDto,
  ) {
    return this.ordersService.updateItemStatus(id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.WAITER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Remove an item from order (Protected: rejected if item is cooking or already served)',
  })
  @ApiParam({ name: 'id', description: 'Order UUID', format: 'uuid' })
  @ApiParam({ name: 'itemId', description: 'Order item UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Item removed and order total adjusted' })
  @ApiResponse({ status: 400, description: 'Cannot remove cooking or served item' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.ordersService.removeItem(id, itemId);
  }
}
