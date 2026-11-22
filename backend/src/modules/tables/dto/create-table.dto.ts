import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { TableStatus } from '../../../generated/prisma/enums.js';

export class CreateTableDto {
  @ApiProperty({ example: 'T-01', description: 'Unique identifier or number of table' })
  @IsString()
  @IsNotEmpty()
  tableNumber!: string;

  @ApiProperty({ example: 1, description: 'Floor number (1-10)' })
  @IsInt()
  @Min(1)
  @Max(10)
  floor!: number;

  @ApiProperty({ example: 4, description: 'Seating capacity (1-50)' })
  @IsInt()
  @Min(1)
  @Max(50)
  capacity!: number;

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

