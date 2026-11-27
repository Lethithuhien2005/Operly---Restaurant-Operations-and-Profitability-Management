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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { AnomalyStatus, RecommendationStatus, RoleName } from '../../generated/prisma/enums.js';
import { AnalyticsService } from './analytics.service.js';

@ApiTags('AI Analytics & Insights')
@Controller('api/v1/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.MANAGER)
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Manager Executive & Financial Intelligence Dashboard' })
  getDashboard() {
    return this.analyticsService.getDashboardSummary();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Module 01: Revenue Analytics (Daily / Weekly / Monthly)' })
  getRevenue(@Query('period') period?: 'daily' | 'weekly' | 'monthly') {
    return this.analyticsService.getRevenueAnalytics(period || 'daily');
  }

  @Get('revenue-forecast')
  @ApiOperation({ summary: 'Module 02: ML Revenue Forecasting (XGBoost / LightGBM)' })
  getRevenueForecast(@Query('horizon') horizon?: '7d' | '4w' | '3m') {
    return this.analyticsService.getRevenueForecast(horizon || '7d');
  }

  @Get('demand-forecast')
  @ApiOperation({ summary: 'Module 03: ML Menu Demand Forecasting' })
  getDemandForecast(@Query('days') days?: string) {
    return this.analyticsService.getDemandForecast(days ? Number(days) : 7);
  }

  @Get('profitability')
  @ApiOperation({ summary: 'Module 04: Menu Profitability & BCG Matrix Analysis' })
  getProfitability() {
    return this.analyticsService.getProfitabilityAnalysis();
  }

  @Get('inventory-intelligence')
  @ApiOperation({ summary: 'Module 05: Inventory Intelligence (BOM + ROP + Safety Stock)' })
  getInventoryIntelligence(@Query('days') days?: string) {
    return this.analyticsService.getInventoryIntelligence(days ? Number(days) : 7);
  }

  @Get('anomalies')
  @ApiOperation({ summary: 'Module 06: Loss & Anomaly Detection (Isolation Forest)' })
  getAnomalies() {
    return this.analyticsService.getAnomalies();
  }

  @Post('anomalies/scan')
  @ApiOperation({ summary: 'Run heuristic/anomaly scan on live DB records' })
  runAnomalyScan() {
    return this.analyticsService.runAnomalyScan();
  }

  @Patch('anomalies/:id')
  @ApiOperation({ summary: 'Update anomaly investigation status' })
  updateAnomalyStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: AnomalyStatus,
  ) {
    return this.analyticsService.updateAnomalyStatus(id, status);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Rule-based Recommendation Engine' })
  getRecommendations() {
    return this.analyticsService.getRecommendations();
  }

  @Patch('recommendations/:id')
  @ApiOperation({ summary: 'Update recommendation status (PENDING/ACCEPTED/REJECTED/COMPLETED)' })
  updateRecommendationStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: RecommendationStatus,
  ) {
    return this.analyticsService.updateRecommendationStatus(id, status);
  }
}
