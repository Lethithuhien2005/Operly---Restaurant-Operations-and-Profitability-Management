import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LeaveStatus } from '../../../generated/prisma/enums.js';

export class ReviewLeaveRequestDto {
  @ApiProperty({
    description: 'Review decision: APPROVED or REJECTED',
    enum: [LeaveStatus.APPROVED, LeaveStatus.REJECTED],
    example: LeaveStatus.APPROVED,
  })
  @IsEnum(LeaveStatus)
  @IsNotEmpty()
  status!: LeaveStatus;

  @ApiPropertyOptional({ description: 'Optional reviewer remarks / note', example: 'Approved, handover completed' })
  @IsOptional()
  @IsString()
  reviewNote?: string;
}
