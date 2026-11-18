import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service.js';
import { RegisterUserDto } from './modules/auth/dto/register-user.dto.js';

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
}
