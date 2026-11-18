import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { RoleName } from '../../generated/prisma/enums.js';
import { CategoriesService } from './categories.service.js';
import { DishesService } from './dishes.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@ApiTags('Menu & Catalog')
@Controller('api/v1/categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly dishesService: DishesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new dish category (Admin / Manager)' })
  @ApiResponse({ status: 201, description: 'Category created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Category name already exists' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all menu categories with optional active filter' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of categories' })
  findAll(@Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean) {
    return this.categoriesService.findAll(isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category details with its dishes' })
  @ApiParam({ name: 'id', description: 'Category UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Category details' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update category details (Admin / Manager)' })
  @ApiParam({ name: 'id', description: 'Category UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Category updated' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete category (Protected against existing dishes)' })
  @ApiParam({ name: 'id', description: 'Category UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete category containing dishes' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }

  @Get(':categoryId/dishes')
  @ApiOperation({ summary: 'Retrieve dishes belonging to a specific category' })
  @ApiParam({ name: 'categoryId', description: 'Category UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'List of dishes in category' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  getDishesByCategory(@Param('categoryId', ParseUUIDPipe) categoryId: string) {
    return this.dishesService.findByCategory(categoryId);
  }
}
