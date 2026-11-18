import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser, JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';
import { mapRoleToFrontend } from '../../common/utils/role-mapping.js';
import { UsersService } from '../../users/users.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET') || 'default_jwt_access_secret';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    const permissions = user.role.rolePermissions.map((rp) => rp.permission.code);

    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      roleId: user.roleId,
      roleName: user.role.name,
      frontendRole: mapRoleToFrontend(user.role.name),
      permissions,
    };
  }
}
