import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Full name of the customer',
    example: 'Nguyen Van A',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  fullName: string;

  @ApiPropertyOptional({
    description: 'Contact email address',
    example: 'customer@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @ApiProperty({
    description: 'Phone number used for primary identification and login',
    example: '0987654321',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[0-9+]{9,15}$/, {
    message: 'Phone number must contain between 9 and 15 digits',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Account password (minimum 8 characters)',
    example: 'Password123!',
    minLength: 8,
    maxLength: 64,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(64, { message: 'Password must not exceed 64 characters' })
  password: string;

  @ApiProperty({
    description: 'Password confirmation matching the password field',
    example: 'Password123!',
    minLength: 8,
    maxLength: 64,
  })
  @IsString()
  @IsNotEmpty({ message: 'Confirm password is required' })
  confirmPassword: string;
}
