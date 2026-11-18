import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleName } from '../../generated/prisma/enums.js';

export class UserProfileDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '0987654321' })
  phone: string;

  @ApiPropertyOptional({ example: 'customer@example.com' })
  email: string | null;

  @ApiProperty({ example: 'Nguyen Van A' })
  fullName: string;

  @ApiPropertyOptional({ example: null })
  avatarUrl: string | null;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  roleId: string;

  @ApiProperty({ enum: RoleName, example: RoleName.CUSTOMER })
  role: RoleName;

  @ApiProperty({ example: 'customer', description: 'Mapped role identifier for frontend UI' })
  frontendRole: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: ['ORDER_VIEW', 'RESERVATION_CREATE'] })
  permissions: string[];
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT Access token for authorizing API requests',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT Refresh token for obtaining new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Current user profile information and permissions',
    type: UserProfileDto,
  })
  user: UserProfileDto;
}
