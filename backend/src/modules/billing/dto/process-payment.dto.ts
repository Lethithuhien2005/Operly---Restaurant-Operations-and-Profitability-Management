import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaymentMethod } from '../../../generated/prisma/enums.js';

export class ProcessPaymentDto {
  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod!: PaymentMethod;

  @ApiProperty({
    description: 'Amount paid by customer',
    example: 250000,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amountPaid!: number;

  @ApiPropertyOptional({
    description: 'Transaction / reference code for electronic payments (Bank transfer, VNPay, MoMo)',
    example: 'VNP12345678',
  })
  @IsOptional()
  @IsString()
  transactionCode?: string;
}
