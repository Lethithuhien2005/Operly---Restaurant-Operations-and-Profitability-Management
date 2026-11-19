import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateShiftDto {
  @ApiProperty({ description: 'Shift label name', example: 'Ca Sáng (Morning)' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Start time (HH:mm format)', example: '06:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:mm format' })
  startTime!: string;

  @ApiProperty({ description: 'End time (HH:mm format)', example: '14:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be in HH:mm format' })
  endTime!: string;
}
