import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import type { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface.js';
import { RoleName } from '../../generated/prisma/enums.js';
import { BillingService } from './billing.service.js';
import { BillQueryDto } from './dto/bill-query.dto.js';
import { CreateBillDto } from './dto/create-bill.dto.js';
import { CreatePromotionDto } from './dto/create-promotion.dto.js';
import { CreateRefundDto } from './dto/create-refund.dto.js';
import { ProcessPaymentDto } from './dto/process-payment.dto.js';

@ApiTags('Billing & Payments')
@Controller('api/v1/billing')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('bills')
  @Roles(RoleName.CASHIER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({
    summary: 'Create and finalize bill for a dining session',
    description:
      'Calculates subtotal from order item unit price snapshots and applies promotion discounts.',
  })
  @ApiResponse({ status: 201, description: 'Bill created successfully' })
  @ApiResponse({ status: 400, description: 'No valid items or invalid promotion' })
  @ApiResponse({ status: 404, description: 'Dining session or promotion not found' })
  createBill(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBillDto,
  ) {
    return this.billingService.createBill(user.id, dto);
  }

  @Get('bills')
  @Roles(RoleName.CASHIER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'List bills with optional status and session filters' })
  @ApiResponse({ status: 200, description: 'Paginated bill records' })
  findAllBills(@Query() query: BillQueryDto) {
    return this.billingService.findAllBills(query);
  }

  @Get('bills/:id')
  @Roles(RoleName.CASHIER, RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Get full bill details, order line items, payment history and balance' })
  @ApiParam({ name: 'id', description: 'Bill UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Detailed bill' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  findOneBill(@Param('id', ParseUUIDPipe) id: string) {
    return this.billingService.findOneBill(id);
  }

  @Post('bills/:id/payments')
  @Roles(RoleName.CASHIER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({
    summary: 'Process payment for a bill (cash, bank transfer, VNPay, MoMo)',
    description:
      'Supports partial/split payments and change calculation. Automatically closes session and releases table once all bills are paid.',
  })
  @ApiParam({ name: 'id', description: 'Bill UUID', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Payment recorded and balance updated' })
  @ApiResponse({ status: 400, description: 'Bill already paid or payment exceeds balance' })
  processPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ProcessPaymentDto,
  ) {
    return this.billingService.processPayment(id, user.id, dto);
  }

  @Post('payments/:paymentId/refund')
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({
    summary: 'Issue a refund for a payment (Manager/Admin only)',
    description: 'Enforces transaction safety and prevents over-refunds.',
  })
  @ApiParam({ name: 'paymentId', description: 'Payment UUID', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Refund recorded' })
  @ApiResponse({ status: 400, description: 'Refund amount exceeds refundable balance' })
  createRefund(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRefundDto,
  ) {
    return this.billingService.createRefund(paymentId, user.id, dto);
  }

  @Post('promotions')
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Create a new promotion voucher' })
  @ApiResponse({ status: 201, description: 'Promotion created' })
  @ApiResponse({ status: 400, description: 'Duplicate code or invalid dates' })
  createPromotion(@Body() dto: CreatePromotionDto) {
    return this.billingService.createPromotion(dto);
  }

  @Get('promotions')
  @Roles(RoleName.CASHIER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'List all promotions' })
  findAllPromotions() {
    return this.billingService.findAllPromotions();
  }

  @Get('promotions/active')
  @Roles(RoleName.CASHIER, RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'List currently active promotions' })
  findActivePromotions() {
    return this.billingService.findActivePromotions();
  }

  @Patch('promotions/:id/toggle')
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Toggle promotion active status' })
  togglePromotion(@Param('id', ParseUUIDPipe) id: string) {
    return this.billingService.togglePromotion(id);
  }
}
