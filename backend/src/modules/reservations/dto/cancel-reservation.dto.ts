import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelReservationDto {
  @ApiPropertyOptional({
    example: 'Customer requested cancellation due to scheduling conflict',
    description: 'Optional reason for reservation cancellation',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
