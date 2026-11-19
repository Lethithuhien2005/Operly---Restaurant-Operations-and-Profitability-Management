import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { UpdateOrderItemStatusDto } from '../orders/dto/update-order-item-status.dto.js';
import { KitchenQueryDto } from './dto/kitchen-query.dto.js';
import { KitchenService } from './kitchen.service.js';

@ApiTags('Kitchen Management (KDS)')
@Controller('api/v1/kitchen')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @Get('queue')
  @Roles(RoleName.CHEF, RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({
    summary: 'Retrieve live Kitchen Display System (KDS) order tickets queue',
    description:
      'Returns active tickets with items in PENDING, COOKING, and READY states. Includes table info and notes.',
  })
  @ApiResponse({ status: 200, description: 'Live kitchen ticket queue' })
  getKitchenQueue(@Query() query: KitchenQueryDto) {
    return this.kitchenService.getKitchenQueue(query);
  }

  @Patch('items/:itemId/status')
  @Roles(RoleName.CHEF, RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({
    summary: 'Advance kitchen preparation status of an item (with automated Recipe BOM depletion on COOKING)',
    description:
      'Enforces state machine: PENDING -> COOKING -> READY -> SERVED (or REJECTED with reason). Deducts raw ingredients atomically without duplication.',
  })
  @ApiParam({ name: 'itemId', description: 'Order Item UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Order item status advanced' })
  @ApiResponse({ status: 400, description: 'Invalid state transition or missing rejection reason' })
  @ApiResponse({ status: 404, description: 'Order item not found' })
  updateItemStatus(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateOrderItemStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.kitchenService.updateItemStatusWithInventory(
      itemId,
      dto.itemStatus,
      dto.rejectionReason,
      user.id,
    );
  }
}
