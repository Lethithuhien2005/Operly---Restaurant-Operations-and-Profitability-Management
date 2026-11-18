import * as crypto from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayload, JwtRefreshPayload } from '../common/interfaces/jwt-payload.interface.js';
import { mapRoleToFrontend } from '../common/utils/role-mapping.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RolesService } from '../roles/roles.service.js';
import { UsersService } from '../users/users.service.js';
import { AuthResponseDto, UserProfileDto } from './dto/auth-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  private readonly accessSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshSecret: string;
  private readonly refreshExpiresIn: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') || 'operly_jwt_access_secret_key_secure_2026_dev';
    this.accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    this.refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') || 'operly_jwt_refresh_secret_key_secure_2026_dev';
    this.refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private calculateExpiryDate(expiresInStr: string): Date {
    const now = Date.now();
    let ms = 7 * 24 * 60 * 60 * 1000; // default 7 days

    const match = /^(\d+)([smhd])$/.exec(expiresInStr.trim());
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      switch (unit) {
        case 's':
          ms = value * 1000;
          break;
        case 'm':
          ms = value * 60 * 1000;
          break;
        case 'h':
          ms = value * 60 * 60 * 1000;
          break;
        case 'd':
          ms = value * 24 * 60 * 60 * 1000;
          break;
      }
    }

    return new Date(now + ms);
  }

  private sanitizeUser(user: {
    id: string;
    phone: string;
    email: string | null;
    fullName: string;
    avatarUrl: string | null;
    roleId: string;
    isActive: boolean;
    role: {
      name: any;
      rolePermissions: Array<{
        permission: {
          code: string;
        };
      }>;
    };
  }): UserProfileDto {
    const permissions = user.role.rolePermissions.map((rp) => rp.permission.code);
    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      roleId: user.roleId,
      role: user.role.name,
      frontendRole: mapRoleToFrontend(user.role.name),
      isActive: user.isActive,
      permissions,
    };
  }

  private async generateTokens(user: {
    id: string;
    phone: string;
    email: string | null;
    role: { name: any };
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role.name,
    };

    const refreshPayload: JwtRefreshPayload = {
      sub: user.id,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresIn as any,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiresIn as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async register(
    dto: RegisterDto,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Confirm password does not match password');
    }

    // Public registration strictly creates CUSTOMER accounts
    const customerRole = await this.rolesService.getCustomerRole();

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const createdUser = await this.usersService.create({
      fullName: dto.fullName.trim(),
      phone: dto.phoneNumber.trim(),
      email: dto.email ? dto.email.trim().toLowerCase() : undefined,
      passwordHash,
      roleId: customerRole.id,
    });

    const tokens = await this.generateTokens(createdUser);

    // Save hashed refresh token
    const tokenHash = this.hashToken(tokens.refreshToken);
    const expiresAt = this.calculateExpiryDate(this.refreshExpiresIn);

    await this.prisma.refreshToken.create({
      data: {
        userId: createdUser.id,
        tokenHash,
        deviceInfo: deviceInfo || null,
        ipAddress: ipAddress || null,
        expiresAt,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(createdUser),
    };
  }

  async login(
    dto: LoginDto,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    const identifier = dto.email.trim();

    // Check by email or by phone
    let user = await this.usersService.findByEmail(identifier.toLowerCase());
    if (!user) {
      user = await this.usersService.findByPhone(identifier);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid email/phone or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email/phone or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Account is deactivated. Please contact your restaurant manager or administrator.',
      );
    }

    const tokens = await this.generateTokens(user);

    // Save hashed refresh token
    const tokenHash = this.hashToken(tokens.refreshToken);
    const expiresAt = this.calculateExpiryDate(this.refreshExpiresIn);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        deviceInfo: deviceInfo || null,
        ipAddress: ipAddress || null,
        expiresAt,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async refreshTokens(
    refreshTokenStr: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    let payload: JwtRefreshPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtRefreshPayload>(refreshTokenStr, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokenHash = this.hashToken(refreshTokenStr);

    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        tokenHash,
        revokedAt: null,
      },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid, revoked, or expired');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is invalid or deactivated');
    }

    // Refresh Token Rotation: Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Issue new pair of tokens
    const tokens = await this.generateTokens(user);
    const newHash = this.hashToken(tokens.refreshToken);
    const newExpiresAt = this.calculateExpiryDate(this.refreshExpiresIn);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newHash,
        deviceInfo: deviceInfo || storedToken.deviceInfo,
        ipAddress: ipAddress || storedToken.ipAddress,
        expiresAt: newExpiresAt,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async logout(refreshTokenStr?: string, userId?: string): Promise<{ message: string }> {
    if (refreshTokenStr) {
      const tokenHash = this.hashToken(refreshTokenStr);
      await this.prisma.refreshToken.updateMany({
        where: {
          tokenHash,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    } else if (userId) {
      await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    return { message: 'Logged out successfully' };
  }

  async getMe(userId: string): Promise<UserProfileDto> {
    const user = await this.usersService.findById(userId);
    return this.sanitizeUser(user);
  }
}
