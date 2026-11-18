import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../common/interfaces/jwt-payload.interface.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { AuthResponseDto, UserProfileDto } from './dto/auth-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@ApiTags('Auth & RBAC')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new customer account',
    description: 'Creates a CUSTOMER account. Registration cannot assign privileged roles.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Registration successful. Returns JWT access & refresh tokens and user profile.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or passwords do not match.',
  })
  @ApiResponse({
    status: 409,
    description: 'Phone number or email is already registered.',
  })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.register(dto, deviceInfo, ipAddress);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login with email or phone',
    description: 'Authenticates credentials and returns JWT access and refresh tokens.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or inactive account.',
  })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.login(dto, deviceInfo, ipAddress);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token using refresh token rotation',
    description: 'Validates existing refresh token, revokes it, and issues a new token pair.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully with rotation.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token is expired, invalid, or revoked.',
  })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.refreshTokens(dto.refreshToken, deviceInfo, ipAddress);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout user and revoke refresh token',
    description: 'Revokes the active refresh token session.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out.',
    schema: { example: { message: 'Logged out successfully' } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @Body() dto: Partial<RefreshTokenDto>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.authService.logout(dto.refreshToken, user.id);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current authenticated user profile and permissions',
    description: 'Returns profile details, assigned role, mapped frontend role, and granted permissions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user profile.',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: AuthenticatedUser): Promise<UserProfileDto> {
    return this.authService.getMe(user.id);
  }
}
