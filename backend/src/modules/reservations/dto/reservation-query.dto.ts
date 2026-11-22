import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ReservationStatus } from '../../../generated/prisma/enums.js';

export class ReservationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by table UUID' })
  @IsOptional()
  @IsUUID('4')
  tableId?: string;

  @ApiPropertyOptional({ description: 'Filter by booking customer UUID' })
  @IsOptional()
  @IsUUID('4')
  customerId?: string;

  @ApiPropertyOptional({ enum: ReservationStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional({
    description: 'Filter reservations on a specific date (YYYY-MM-DD)',
    example: '2026-11-20',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
