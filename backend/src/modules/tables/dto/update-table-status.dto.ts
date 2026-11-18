import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TableStatus } from '../../../generated/prisma/enums.js';

export class UpdateTableStatusDto {
  @ApiProperty({
    enum: TableStatus,
    example: TableStatus.AVAILABLE,
    description: 'Updated operational status of the table',
  })
  @IsEnum(TableStatus)
  @IsNotEmpty()
  status: TableStatus;
}
