import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({
    description: 'Customer UUID who booked the reservation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'customerId must be a valid UUID v4' })
  @IsNotEmpty()
  customerId: string;

  @ApiPropertyOptional({
    description: 'Target restaurant branch UUID',
    example: '123e4567-e89b-12d3-a456-426614174099',
  })
  @IsOptional()
  @IsUUID(4, { message: 'branchId must be a valid UUID v4' })
  branchId?: string;

  @ApiProperty({
    description: 'Name of the guest arriving at the restaurant',
    example: 'Tran Thi B',
  })
  @IsString()
  @IsNotEmpty()
  guestName: string;

  @ApiProperty({
    description: 'Phone number of the guest arriving',
    example: '0912345678',
  })
  @IsString()
  @IsNotEmpty()
  guestPhone: string;

  @ApiPropertyOptional({
    description: 'Special requests (e.g. Birthday, baby chair)',
    example: 'Cần bàn gần cửa sổ, chuẩn bị ghế trẻ em',
  })
  @IsOptional()
  @IsString()
  specialRequest?: string;

  @ApiPropertyOptional({
    description: 'Optional pre-assigned table UUID',
    example: '223e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID(4, { message: 'tableId must be a valid UUID v4' })
  tableId?: string;

  @ApiProperty({
    description: 'Number of guests in the party',
    example: 4,
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  partySize: number;

  @ApiProperty({
    description: 'Reservation date and time in ISO-8601 format',
    example: '2026-11-20T19:00:00.000Z',
  })
  @IsISO8601({}, { message: 'reservationTime must be a valid ISO-8601 date string' })
  @IsNotEmpty()
  reservationTime: string;

  @ApiPropertyOptional({
    description: 'Pre-paid deposit amount in VND',
    example: 200000,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'depositAmount must be a numeric value' })
  @Min(0)
  depositAmount?: number;
}
