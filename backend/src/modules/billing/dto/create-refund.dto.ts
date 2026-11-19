import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateRefundDto {
  @ApiProperty({
    description: 'Refund amount in VND',
    example: 50000,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({
    description: 'Detailed reason for refund (e.g. food returned, overcharged)',
    example: 'Dish was not served due to ingredient shortage',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
