import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    description: 'User phone number used for login',
    example: '0987654321',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+]{9,15}$/, {
    message: 'phone must be a valid phone number containing 9 to 15 digits',
  })
  phone: string;

  @ApiPropertyOptional({
    description: 'User contact email',
    example: 'manager@operly.vn',
  })
  @IsOptional()
  @IsEmail({}, { message: 'email must be a valid email address' })
  email?: string;

  @ApiProperty({
    description: 'Account password (minimum 8 characters)',
    example: 'SecurePassword123!',
    minLength: 8,
    maxLength: 64,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(64, { message: 'Password must not exceed 64 characters' })
  password: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'Nguyen Van A',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @ApiPropertyOptional({
    description: 'URL of the user profile avatar',
    example: 'https://res.cloudinary.com/operly/image/upload/avatar1.jpg',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({
    description: 'Role UUID referencing roles table',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID(4, { message: 'roleId must be a valid UUID v4' })
  @IsNotEmpty()
  roleId: string;
}
