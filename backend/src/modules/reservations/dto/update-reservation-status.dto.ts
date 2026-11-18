import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReservationStatus } from '../../../generated/prisma/enums.js';

export class UpdateReservationStatusDto {
  @ApiProperty({
    enum: ReservationStatus,
    example: ReservationStatus.CONFIRMED,
    description: 'Updated reservation status (PENDING, CONFIRMED, COMPLETED, CANCELLED)',
  })
  @IsEnum(ReservationStatus)
  @IsNotEmpty()
  status: ReservationStatus;
}
