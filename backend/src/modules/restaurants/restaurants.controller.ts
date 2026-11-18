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
import { BranchesService } from './branches.service.js';
import { CreateBranchNestedDto } from './dto/create-branch.dto.js';
import { CreateRestaurantDto } from './dto/create-restaurant.dto.js';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto.js';
import { RestaurantsService } from './restaurants.service.js';

@ApiTags('Restaurant & Branch Setup')
@Controller('api/v1/restaurants')
export class RestaurantsController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly branchesService: BranchesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new restaurant entity (Admin / Manager)' })
  @ApiResponse({ status: 201, description: 'Restaurant created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  create(@Body() dto: CreateRestaurantDto) {
    return this.restaurantsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all restaurants with optional active filter' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of restaurants' })
  findAll(@Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean) {
    return this.restaurantsService.findAll(isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant details with branches' })
  @ApiParam({ name: 'id', description: 'Restaurant UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Restaurant details' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update restaurant details (Admin / Manager)' })
  @ApiParam({ name: 'id', description: 'Restaurant UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Restaurant updated' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a restaurant (Admin only - protected against cascade loss)' })
  @ApiParam({ name: 'id', description: 'Restaurant UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Restaurant deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete restaurant with active tables' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantsService.remove(id);
  }

  // --- Sub-resource: Branches belonging to this Restaurant ---

  @Post(':restaurantId/branches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a branch for this restaurant (Admin / Manager)' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Branch created under restaurant' })
  createBranch(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Body() dto: CreateBranchNestedDto,
  ) {
    return this.branchesService.create({
      ...dto,
      restaurantId,
    });
  }

  @Get(':restaurantId/branches')
  @ApiOperation({ summary: 'Retrieve branches belonging to a restaurant' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'List of branches belonging to restaurant' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  getBranchesByRestaurant(@Param('restaurantId', ParseUUIDPipe) restaurantId: string) {
    return this.branchesService.findByRestaurant(restaurantId);
  }
}
