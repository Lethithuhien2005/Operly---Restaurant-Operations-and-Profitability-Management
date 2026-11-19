import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { RoleName } from '../../../generated/prisma/enums.js';

export class UpdateStaffDto {
  @ApiPropertyOptional({ description: 'Full staff name', example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '0912345678' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9+]{9,15}$/, { message: 'Phone must be a valid number of 9 to 15 digits' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'nguyenvana@operly.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Updated operational role',
    enum: [RoleName.MANAGER, RoleName.CASHIER, RoleName.CHEF, RoleName.WAITER],
    example: RoleName.CASHIER,
  })
  @IsOptional()
  @IsEnum(RoleName)
  role?: RoleName;

  @ApiPropertyOptional({ description: 'Account active status', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
