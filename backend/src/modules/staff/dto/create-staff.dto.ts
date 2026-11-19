import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { RoleName } from '../../../generated/prisma/enums.js';

export class CreateStaffDto {
  @ApiProperty({ description: 'Full staff name', example: 'Tran Van B' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ description: 'Unique contact phone number', example: '0987654321' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+]{9,15}$/, { message: 'Phone must be a valid number of 9 to 15 digits' })
  phone!: string;

  @ApiPropertyOptional({ description: 'Unique staff email', example: 'tranvanb@operly.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Account password (minimum 6 characters)', example: 'Operly@2026' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password!: string;

  @ApiProperty({
    description: 'Operational restaurant role',
    enum: [RoleName.MANAGER, RoleName.CASHIER, RoleName.CHEF, RoleName.WAITER],
    example: RoleName.WAITER,
  })
  @IsEnum(RoleName)
  @IsNotEmpty()
  role!: RoleName;
}
