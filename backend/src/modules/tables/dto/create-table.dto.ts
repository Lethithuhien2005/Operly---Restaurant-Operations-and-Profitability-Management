import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { TableStatus } from '../../../generated/prisma/enums.js';

export class CreateTableDto {
  @ApiPropertyOptional({ description: 'Branch UUID to which the table belongs' })
  @IsOptional()
  @IsUUID('4', { message: 'branchId must be a valid UUID' })
  branchId?: string;

  @ApiProperty({ example: 'T-01', description: 'Unique identifier or number of table' })
  @IsString()
  @IsNotEmpty()
  tableNumber: string;

  @ApiProperty({ example: 1, description: 'Floor number (1-10)' })
  @IsInt()
  @Min(1)
  @Max(10)
  floor: number;

  @ApiProperty({ example: 4, description: 'Seating capacity (1-50)' })
  @IsInt()
  @Min(1)
  @Max(50)
  capacity: number;

  @ApiPropertyOptional({
    enum: TableStatus,
    default: TableStatus.AVAILABLE,
    description: 'Initial table status',
  })
  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @ApiPropertyOptional({
    example: 'QR-T01-TOKEN-DEV',
    description: 'Unique QR token for diner table ordering (auto-generated if omitted)',
  })
  @IsOptional()
  @IsString()
  qrCodeToken?: string;
}
