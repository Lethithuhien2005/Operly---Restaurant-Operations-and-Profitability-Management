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
import { DishesService } from './dishes.service.js';
import { CreateDishDto } from './dto/create-dish.dto.js';
import { DishQueryDto } from './dto/dish-query.dto.js';
import { ToggleAvailabilityDto } from './dto/toggle-availability.dto.js';
import { UpdateDishDto } from './dto/update-dish.dto.js';

@ApiTags('Menu & Catalog')
@Controller(['api/v1/dishes', 'api/v1/menu-items'])
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CHEF)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new dish / menu item (Admin / Manager / Chef)' })
  @ApiResponse({ status: 201, description: 'Dish created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Target category not found' })
  create(@Body() dto: CreateDishDto) {
    return this.dishesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Search and paginate dishes with category and availability filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of dishes' })
  findAll(@Query() query: DishQueryDto) {
    return this.dishesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dish details by UUID with BOM and category' })
  @ApiParam({ name: 'id', description: 'Dish UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Dish details' })
  @ApiResponse({ status: 404, description: 'Dish not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.dishesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CHEF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update dish pricing, details, or category (Admin / Manager / Chef)' })
  @ApiParam({ name: 'id', description: 'Dish UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Dish updated successfully' })
  @ApiResponse({ status: 404, description: 'Dish or target category not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDishDto,
  ) {
    return this.dishesService.update(id, dto);
  }

  @Patch(':id/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CHEF, RoleName.WAITER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Toggle dish availability (86 out-of-stock toggle across menus)',
  })
  @ApiParam({ name: 'id', description: 'Dish UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Dish availability toggled' })
  @ApiResponse({ status: 404, description: 'Dish not found' })
  toggleAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToggleAvailabilityDto,
  ) {
    return this.dishesService.toggleAvailability(id, dto.isAvailable);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a dish (Protected against historical order records)' })
  @ApiParam({ name: 'id', description: 'Dish UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Dish deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete dish referenced in orders' })
  @ApiResponse({ status: 404, description: 'Dish not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.dishesService.remove(id);
  }
}
