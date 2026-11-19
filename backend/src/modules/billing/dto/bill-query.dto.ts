import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { BillStatus } from '../../../generated/prisma/enums.js';

export class BillQueryDto {
  @ApiPropertyOptional({ enum: BillStatus, description: 'Filter bills by status' })
  @IsOptional()
  @IsEnum(BillStatus)
  status?: BillStatus;

  @ApiPropertyOptional({ description: 'Filter by dining session ID' })
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
