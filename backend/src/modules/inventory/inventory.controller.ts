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
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import type { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface.js';
import { RoleName } from '../../generated/prisma/enums.js';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto.js';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto.js';
import { CreateStockReceiptDto } from './dto/create-stock-receipt.dto.js';
import { InventoryQueryDto } from './dto/inventory-query.dto.js';
import { SetRecipeBomDto } from './dto/set-recipe-bom.dto.js';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto.js';
import { InventoryService } from './inventory.service.js';

@ApiTags('Inventory & BOM')
@Controller('api/v1/inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('items')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new ingredient or inventory item (Admin / Manager)' })
  @ApiResponse({ status: 201, description: 'Inventory item created successfully' })
  createItem(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.createItem(dto);
  }

  @Get('items')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CHEF)
  @ApiOperation({ summary: 'Query inventory items with optional search and low-stock filter' })
  @ApiResponse({ status: 200, description: 'List of inventory items with pagination metadata' })
  findAllItems(@Query() query: InventoryQueryDto) {
    return this.inventoryService.findAllItems(query);
  }

  @Get('items/low-stock')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CHEF)
  @ApiOperation({ summary: 'Get list of items that have breached minimum alert threshold' })
  @ApiResponse({ status: 200, description: 'List of ingredients with stock <= alert threshold' })
  getLowStockItems() {
    return this.inventoryService.getLowStockItems();
  }

  @Get('items/:id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CHEF)
  @ApiOperation({ summary: 'Get details of an inventory item and associated recipes' })
  @ApiParam({ name: 'id', description: 'Inventory item UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Item details' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  findOneItem(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.findOneItem(id);
  }

  @Patch('items/:id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Update inventory item attributes or thresholds (Admin / Manager)' })
  @ApiParam({ name: 'id', description: 'Inventory item UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Item updated' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInventoryItemDto,
  ) {
    return this.inventoryService.updateItem(id, dto);
  }

  @Post('receipts')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Receive shipment goods and increment inventory (Admin / Manager)' })
  @ApiResponse({ status: 201, description: 'Stock receipt created and stock credited' })
  createStockReceipt(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateStockReceiptDto,
  ) {
    return this.inventoryService.createStockReceipt(user.id, dto);
  }

  @Get('receipts')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get stock receiving history and purchase costs' })
  @ApiResponse({ status: 200, description: 'List of historical stock receipts' })
  findStockReceipts() {
    return this.inventoryService.findStockReceipts();
  }

  @Post('adjustments')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CHEF)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log kitchen spoilage or physical count audit adjustments' })
  @ApiResponse({ status: 201, description: 'Stock adjusted and ledger movement logged' })
  @ApiResponse({ status: 400, description: 'Negative stock balance or invalid delta' })
  createStockAdjustment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateStockAdjustmentDto,
  ) {
    return this.inventoryService.createStockAdjustment(user.id, dto);
  }

  @Get('movements')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get immutable stock ledger movements history' })
  @ApiResponse({ status: 200, description: 'List of stock movement events' })
  findMovements(@Query('inventoryItemId') inventoryItemId?: string) {
    return this.inventoryService.findMovements(inventoryItemId);
  }

  @Post('recipes')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CHEF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Configure or update Recipe Bill of Materials (BOM) for a dish' })
  @ApiResponse({ status: 200, description: 'Recipe BOM updated successfully' })
  setRecipeBom(@Body() dto: SetRecipeBomDto) {
    return this.inventoryService.setRecipeBom(dto);
  }

  @Get('recipes/:menuItemId')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CHEF)
  @ApiOperation({ summary: 'Get Recipe Bill of Materials (BOM) for a dish' })
  @ApiParam({ name: 'menuItemId', description: 'Dish Menu Item UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Recipe BOM with ingredient specifications' })
  getRecipeBom(@Param('menuItemId', ParseUUIDPipe) menuItemId: string) {
    return this.inventoryService.getRecipeBom(menuItemId);
  }
}
