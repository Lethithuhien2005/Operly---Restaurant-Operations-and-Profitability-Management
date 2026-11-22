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
import { CreateTableDto } from './dto/create-table.dto.js';
import { TableQueryDto } from './dto/table-query.dto.js';
import { UpdateTableStatusDto } from './dto/update-table-status.dto.js';
import { UpdateTableDto } from './dto/update-table.dto.js';
import { TablesService } from './tables.service.js';

@ApiTags('Dining Tables Setup')
@Controller()
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post('api/v1/tables')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new dining table (Admin / Manager)' })
  @ApiResponse({ status: 201, description: 'Table created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Table number already exists' })
  create(@Body() dto: CreateTableDto) {
    return this.tablesService.create(dto);
  }

  @Get('api/v1/tables')
  @ApiOperation({ summary: 'List and filter tables by floor or status' })
  @ApiResponse({ status: 200, description: 'List of matching tables' })
  findAll(@Query() query: TableQueryDto) {
    return this.tablesService.findAll(query);
  }

  @Get('api/v1/tables/:id')
  @ApiOperation({ summary: 'Get table details by ID with active session' })
  @ApiParam({ name: 'id', description: 'Table UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Table details' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tablesService.findOne(id);
  }

  @Patch('api/v1/tables/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update table details (Admin / Manager)' })
  @ApiParam({ name: 'id', description: 'Table UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Table updated successfully' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  @ApiResponse({ status: 409, description: 'Table number conflict' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTableDto,
  ) {
    return this.tablesService.update(id, dto);
  }

  @Patch('api/v1/tables/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.WAITER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update table operational status (AVAILABLE, RESERVED, OCCUPIED, CLEANING)',
  })
  @ApiParam({ name: 'id', description: 'Table UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Table status updated' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTableStatusDto,
  ) {
    return this.tablesService.updateStatus(id, dto.status);
  }

  @Delete('api/v1/tables/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete table (Cannot delete if table has active sessions or reservations)' })
  @ApiParam({ name: 'id', description: 'Table UUID', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Table deleted successfully' })
  @ApiResponse({ status: 400, description: 'Table has active sessions or reservations' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tablesService.remove(id);
  }
}
