import { RoleName } from '../../generated/prisma/enums.js';

export interface JwtPayload {
  sub: string;
  phone: string;
  email: string | null;
  role: RoleName;
}

export interface JwtRefreshPayload {
  sub: string;
  tokenId?: string;
}

export interface AuthenticatedUser {
  id: string;
  phone: string;
  email: string | null;
  fullName: string;
  avatarUrl: string | null;
  roleId: string;
  roleName: RoleName;
  frontendRole: string; // Provides mapping such as 'kitchen' for CHEF
  permissions: string[];
}
