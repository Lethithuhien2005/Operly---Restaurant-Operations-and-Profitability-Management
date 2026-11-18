import { RoleName } from '../../generated/prisma/enums.js';

/**
 * Maps database RoleName to frontend role representation.
 * In particular, database CHEF is represented in the UI prototype as 'kitchen'.
 */
export function mapRoleToFrontend(role: RoleName): string {
  switch (role) {
    case RoleName.ADMIN:
      return 'admin';
    case RoleName.MANAGER:
      return 'manager';
    case RoleName.CASHIER:
      return 'cashier';
    case RoleName.CHEF:
      return 'kitchen';
    case RoleName.WAITER:
      return 'waiter';
    case RoleName.CUSTOMER:
      return 'customer';
    default:
      return String(role).toLowerCase();
  }
}

/**
 * Maps frontend role string to backend database RoleName enum.
 */
export function mapFrontendToRole(frontendRole: string): RoleName | null {
  const normalized = frontendRole.trim().toLowerCase();
  switch (normalized) {
    case 'admin':
      return RoleName.ADMIN;
    case 'manager':
      return RoleName.MANAGER;
    case 'cashier':
      return RoleName.CASHIER;
    case 'kitchen':
    case 'chef':
      return RoleName.CHEF;
    case 'waiter':
      return RoleName.WAITER;
    case 'customer':
      return RoleName.CUSTOMER;
    default:
      return null;
  }
}
