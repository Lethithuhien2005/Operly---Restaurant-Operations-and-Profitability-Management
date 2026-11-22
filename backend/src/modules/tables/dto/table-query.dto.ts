import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { TableStatus } from '../../../generated/prisma/enums.js';

export class TableQueryDto {
  @ApiPropertyOptional({ description: 'Filter tables by floor number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  floor?: number;

  @ApiPropertyOptional({ enum: TableStatus, description: 'Filter tables by status' })
  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;
}
