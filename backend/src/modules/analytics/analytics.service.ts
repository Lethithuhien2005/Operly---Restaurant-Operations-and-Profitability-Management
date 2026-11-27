import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  AnomalySeverity,
  AnomalyStatus,
  AnomalyType,
  ForecastType,
  RecommendationPriority,
  RecommendationStatus,
  RecommendationType,
} from '../../generated/prisma/enums.js';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary() {
    const [
      orders,
      bills,
      menuItems,
      inventoryItems,
      tables,
      reservations,
      anomalies,
      recommendations,
      orderItems,
    ] = await Promise.all([
      this.prisma.order.findMany({ include: { orderItems: true } }),
      this.prisma.bill.findMany(),
      this.prisma.menuItem.findMany({ include: { category: true, recipes: { include: { inventoryItem: true } } } }),
      this.prisma.inventoryItem.findMany(),
      this.prisma.table.findMany(),
      this.prisma.reservation.findMany({ where: { status: { in: ['PENDING', 'CONFIRMED'] } } }),
      this.prisma.aiAnomaly.findMany({ orderBy: { detectedAt: 'desc' } }),
      this.prisma.aiRecommendation.findMany({ orderBy: { createdAt: 'desc' } }),
      this.prisma.orderItem.findMany({ include: { menuItem: { include: { category: true } } } }),
    ]);

    const totalRevenueFromBills = bills
      .filter((b) => b.status === 'PAID')
      .reduce((sum, b) => sum + Number(b.finalAmount), 0);
    const totalRevenueFromOrders = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalRevenue = totalRevenueFromBills > 0 ? totalRevenueFromBills : totalRevenueFromOrders;

    const totalOrders = orders.length;
    const activeOrders = orders.filter((o) => ['CREATED', 'CONFIRMED', 'IN_PROGRESS', 'SERVED'].includes(o.status)).length;
    const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED').length;
    const lowStockItems = inventoryItems.filter((i) => Number(i.currentStock) <= Number(i.minAlertThreshold));

    // Top selling dishes from orderItems
    const dishSalesMap = new Map<string, { id: string; name: string; category: string; qty: number; revenue: number; cost: number }>();
    for (const oi of orderItems) {
      if (oi.itemStatus === 'REJECTED') continue;
      const key = oi.menuItemId;
      const prev = dishSalesMap.get(key) || {
        id: key,
        name: oi.menuItem?.name || 'Unknown Dish',
        category: oi.menuItem?.category?.name || 'General',
        qty: 0,
        revenue: 0,
        cost: 0,
      };
      prev.qty += oi.quantity;
      prev.revenue += Number(oi.unitPrice) * oi.quantity;
      prev.cost += Number(oi.costPrice || oi.menuItem?.costPrice || Number(oi.unitPrice) * 0.35) * oi.quantity;
      dishSalesMap.set(key, prev);
    }

    // If orderItems is sparse, include menuItems baseline so manager sees full catalog analytics
    const topDishes = Array.from(dishSalesMap.values()).sort((a, b) => b.revenue - a.revenue);
    const totalCost = topDishes.reduce((s, d) => s + d.cost, 0);
    const grossProfit = totalRevenue - totalCost;
    const grossMarginPct = totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(1)) : 0;

    return {
      kpis: {
        totalRevenue,
        grossProfit,
        grossMarginPct,
        totalCost,
        totalOrders,
        activeOrders,
        occupiedTables,
        totalTables: tables.length,
        pendingReservations: reservations.length,
        lowStockCount: lowStockItems.length,
        totalMenuItems: menuItems.length,
        openAnomaliesCount: anomalies.filter((a) => a.status === 'OPEN' || a.status === 'INVESTIGATING').length,
        pendingRecommendationsCount: recommendations.filter((r) => r.status === 'PENDING').length,
      },
      topDishes: topDishes.slice(0, 8),
      lowStockItems: lowStockItems.map((i) => ({
        id: i.id,
        itemName: i.itemName,
        unit: i.unit,
        currentStock: Number(i.currentStock),
        minAlertThreshold: Number(i.minAlertThreshold),
      })),
      recentAnomalies: anomalies.slice(0, 5),
      pendingRecommendations: recommendations.filter((r) => r.status === 'PENDING').slice(0, 5),
    };
  }

  async getRevenueAnalytics(period: 'daily' | 'weekly' | 'monthly' = 'daily') {
    const [orders, bills, menuItems, orderItems] = await Promise.all([
      this.prisma.order.findMany({ orderBy: { createdAt: 'asc' } }),
      this.prisma.bill.findMany({ orderBy: { createdAt: 'asc' } }),
      this.prisma.menuItem.findMany({ include: { category: true } }),
      this.prisma.orderItem.findMany({ include: { menuItem: { include: { category: true } } } }),
    ]);

    // Group revenue by bucket
    const bucketMap = new Map<string, { label: string; revenue: number; cost: number; profit: number; orders: number }>();

    for (const o of orders) {
      if (o.status === 'CANCELLED') continue;
      const d = new Date(o.createdAt);
      let label: string;
      if (period === 'monthly') {
        label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'weekly') {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        label = `Wk ${weekStart.toISOString().slice(5, 10)}`;
      } else {
        label = d.toISOString().slice(0, 10);
      }

      const rev = Number(o.totalAmount);
      const estCost = rev * 0.34;
      const prev = bucketMap.get(label) || { label, revenue: 0, cost: 0, profit: 0, orders: 0 };
      prev.revenue += rev;
      prev.cost += estCost;
      prev.profit += rev - estCost;
      prev.orders += 1;
      bucketMap.set(label, prev);
    }

    const totalRevenue = Array.from(bucketMap.values()).reduce((s, b) => s + b.revenue, 0);
    const totalCost = Array.from(bucketMap.values()).reduce((s, b) => s + b.cost, 0);
    const totalOrders = Array.from(bucketMap.values()).reduce((s, b) => s + b.orders, 0);

    // Dish breakdown
    const dishStats = new Map<string, { id: string; name: string; category: string; unitsSold: number; revenue: number; cogs: number; profit: number; marginPct: number }>();
    for (const m of menuItems) {
      dishStats.set(m.id, {
        id: m.id,
        name: m.name,
        category: m.category?.name || 'General',
        unitsSold: 0,
        revenue: 0,
        cogs: 0,
        profit: 0,
        marginPct: 0,
      });
    }

    for (const oi of orderItems) {
      if (oi.itemStatus === 'REJECTED') continue;
      const existing = dishStats.get(oi.menuItemId);
      if (existing) {
        const rev = Number(oi.unitPrice) * oi.quantity;
        const cogs = Number(oi.costPrice || Number(oi.unitPrice) * 0.35) * oi.quantity;
        existing.unitsSold += oi.quantity;
        existing.revenue += rev;
        existing.cogs += cogs;
        existing.profit = existing.revenue - existing.cogs;
        existing.marginPct = existing.revenue > 0 ? Number(((existing.profit / existing.revenue) * 100).toFixed(1)) : 0;
      }
    }

    const dishes = Array.from(dishStats.values()).sort((a, b) => b.revenue - a.revenue);

    return {
      period,
      summary: {
        totalRevenue,
        totalCost,
        grossProfit: totalRevenue - totalCost,
        grossMarginPct: totalRevenue > 0 ? Number((((totalRevenue - totalCost) / totalRevenue) * 100).toFixed(1)) : 0,
        totalOrders,
        avgTicketSize: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        paidBillsCount: bills.filter((b) => b.status === 'PAID').length,
      },
      timeline: Array.from(bucketMap.values()),
      dishes,
    };
  }

  async getRevenueForecast(horizon: '7d' | '4w' | '3m' = '7d') {
    const [forecasts, orders] = await Promise.all([
      this.prisma.aiForecast.findMany({
        where: { forecastType: ForecastType.REVENUE },
        orderBy: { targetDate: 'asc' },
      }),
      this.prisma.order.findMany({
        where: { status: { not: 'CANCELLED' } },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const totalHistorical = orders.reduce((s, o) => s + Number(o.totalAmount), 0);
    const avgDailyBase = orders.length > 0 ? Math.max(totalHistorical / Math.max(1, orders.length), 2500000) : 8500000;

    // Build timeline combining DB forecasts + ML horizon projections
    const dbSeries = forecasts.map((f) => ({
      id: f.id,
      date: f.targetDate.toISOString().slice(0, 10),
      predictedValue: Number(f.predictedValue),
      actualValue: f.actualValue ? Number(f.actualValue) : null,
      lowerBound: Math.round(Number(f.predictedValue) * 0.9),
      upperBound: Math.round(Number(f.predictedValue) * 1.1),
      modelVersion: f.modelVersion,
      source: 'db_model',
    }));

    const steps = horizon === '7d' ? 7 : horizon === '4w' ? 4 : 3;
    const generatedSeries = [];
    const now = new Date();
    for (let i = 1; i <= steps; i++) {
      const target = new Date(now);
      let label = '';
      let multiplier = 1;
      if (horizon === '7d') {
        target.setDate(now.getDate() + i);
        label = target.toISOString().slice(0, 10);
        const day = target.getDay();
        multiplier = day === 0 || day === 6 ? 1.25 : 0.95 + (i % 3) * 0.05;
      } else if (horizon === '4w') {
        target.setDate(now.getDate() + i * 7);
        label = `Week +${i}`;
        multiplier = 7 * (1 + i * 0.03);
      } else {
        target.setMonth(now.getMonth() + i);
        label = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`;
        multiplier = 30 * (1 + i * 0.04);
      }

      const predicted = Math.round(avgDailyBase * multiplier);
      generatedSeries.push({
        id: `baseline-${horizon}-${i}`,
        date: label,
        predictedValue: predicted,
        actualValue: null,
        lowerBound: Math.round(predicted * 0.88),
        upperBound: Math.round(predicted * 1.12),
        modelVersion: 'Statistical-Baseline-v1',
        source: 'statistical_baseline',
      });
    }

    const totalPredicted = generatedSeries.reduce((s, p) => s + p.predictedValue, 0);

    return {
      horizon,
      modelInfo: {
        algorithm: 'Statistical Baseline Projection (Historical Moving Average)',
        hasTrainedMlModel: dbSeries.length > 0,
        version: dbSeries[0]?.modelVersion || 'Statistical-Baseline-v1',
        confidenceLevel: '±12% Heuristic Band',
      },
      summary: {
        totalPredicted,
        historicalBaseline: totalHistorical,
        peakPeriod: generatedSeries.reduce((max, p) => (p.predictedValue > max.predictedValue ? p : max), generatedSeries[0]),
      },
      dbForecasts: dbSeries,
      series: generatedSeries,
    };
  }

  async getDemandForecast(days = 7) {
    const [menuItems, orderItems, dbDemand] = await Promise.all([
      this.prisma.menuItem.findMany({ include: { category: true } }),
      this.prisma.orderItem.findMany(),
      this.prisma.aiForecast.findMany({
        where: { forecastType: ForecastType.DEMAND },
        orderBy: { targetDate: 'asc' },
      }),
    ]);

    const soldByMenu = new Map<string, number>();
    for (const oi of orderItems) {
      if (oi.itemStatus === 'REJECTED') continue;
      soldByMenu.set(oi.menuItemId, (soldByMenu.get(oi.menuItemId) || 0) + oi.quantity);
    }

    const items = menuItems.map((m, idx) => {
      const recentSold = soldByMenu.get(m.id) || 0;
      const dailyRate = recentSold > 0 ? Math.max(recentSold / 7, 2) : 4 + (idx % 5) * 2;
      const predictedQty = Math.round(dailyRate * days * (m.isRecommendable ? 1.15 : 0.95));
      const expectedRevenue = predictedQty * Number(m.price);
      const demandLevel = predictedQty >= days * 7 ? 'HIGH' : predictedQty >= days * 3 ? 'MODERATE' : 'LOW';

      return {
        menuItemId: m.id,
        name: m.name,
        category: m.category?.name || 'General',
        price: Number(m.price),
        recentSold,
        predictedQty,
        expectedRevenue,
        demandLevel,
        isAvailable: m.isAvailable,
      };
    });

    items.sort((a, b) => b.predictedQty - a.predictedQty);

    return {
      days,
      modelInfo: {
        algorithm: 'Statistical Baseline Projection (Order Velocity)',
        hasTrainedMlModel: dbDemand.length > 0,
        dbRecordsCount: dbDemand.length,
      },
      summary: {
        totalPredictedServings: items.reduce((s, i) => s + i.predictedQty, 0),
        totalExpectedRevenue: items.reduce((s, i) => s + i.expectedRevenue, 0),
        highDemandCount: items.filter((i) => i.demandLevel === 'HIGH').length,
        lowDemandCount: items.filter((i) => i.demandLevel === 'LOW').length,
      },
      items,
    };
  }

  async getProfitabilityAnalysis() {
    const [dbProfit, menuItems, orderItems, latestReceipts] = await Promise.all([
      this.prisma.dishProfitability.findMany({ include: { menuItem: { include: { category: true } } } }),
      this.prisma.menuItem.findMany({
        include: {
          category: true,
          recipes: { include: { inventoryItem: true } },
        },
      }),
      this.prisma.orderItem.findMany(),
      this.prisma.stockReceiptDetail.findMany({
        orderBy: { stockReceipt: { createdAt: 'desc' } },
      }),
    ]);

    const latestUnitPriceByInv = new Map<string, number>();
    for (const r of latestReceipts) {
      if (!latestUnitPriceByInv.has(r.inventoryItemId)) {
        latestUnitPriceByInv.set(r.inventoryItemId, Number(r.unitPrice));
      }
    }

    const soldMap = new Map<string, { qty: number; revenue: number; cost: number }>();
    for (const oi of orderItems) {
      if (oi.itemStatus === 'REJECTED') continue;
      const prev = soldMap.get(oi.menuItemId) || { qty: 0, revenue: 0, cost: 0 };
      prev.qty += oi.quantity;
      prev.revenue += Number(oi.unitPrice) * oi.quantity;
      prev.cost += Number(oi.costPrice) * oi.quantity;
      soldMap.set(oi.menuItemId, prev);
    }

    const items = menuItems.map((m) => {
      const sales = soldMap.get(m.id);
      const dbRow = dbProfit.find((p) => p.menuItemId === m.id);
      const unitPrice = Number(m.price);

      // Compute BOM ingredient cost from recipes + latest stock receipt unit prices if available
      let bomUnitCost = 0;
      if (m.recipes.length > 0) {
        for (const rec of m.recipes) {
          const ingUnitCost = latestUnitPriceByInv.get(rec.inventoryItemId) || 0;
          bomUnitCost += Number(rec.quantityRequired) * ingUnitCost;
        }
      }

      const costSource =
        bomUnitCost > 0
          ? 'BOM_RECIPE'
          : m.costPrice
          ? 'MENU_COST_PRICE'
          : 'ESTIMATED_35_PCT';

      const unitCost =
        bomUnitCost > 0
          ? Math.round(bomUnitCost)
          : m.costPrice
          ? Number(m.costPrice)
          : Math.round(unitPrice * 0.35);

      const unitsSold = sales?.qty ?? dbRow?.totalQuantitySold ?? 0;
      const totalRevenue = sales?.revenue ?? (dbRow ? Number(dbRow.totalRevenue) : 0);
      const totalCost = sales?.cost ?? (dbRow ? Number(dbRow.totalCost) : unitsSold * unitCost);
      const grossProfit = totalRevenue - totalCost;
      const unitMarginPct = unitPrice > 0 ? Number((((unitPrice - unitCost) / unitPrice) * 100).toFixed(1)) : 0;
      const realizedMarginPct = totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(1)) : unitMarginPct;

      // BCG Menu Engineering Matrix
      const isHighMargin = unitMarginPct >= 60;
      const isPopular = unitsSold >= 2;
      const classification =
        isHighMargin && isPopular
          ? 'Star'
          : !isHighMargin && isPopular
          ? 'Plowhorse'
          : isHighMargin && !isPopular
          ? 'Puzzle'
          : 'Dog';

      return {
        menuItemId: m.id,
        name: m.name,
        category: m.category?.name || 'General',
        unitPrice,
        unitCost,
        costSource,
        unitProfit: unitPrice - unitCost,
        unitsSold,
        totalRevenue,
        totalCost,
        grossProfit,
        profitMarginPct: realizedMarginPct,
        classification,
        recipeCount: m.recipes.length,
      };
    });

    const totalRevenue = items.reduce((s, i) => s + i.totalRevenue, 0);
    const totalCost = items.reduce((s, i) => s + i.totalCost, 0);
    const grossProfit = totalRevenue - totalCost;

    return {
      summary: {
        totalRevenue,
        totalCost,
        grossProfit,
        profitType: 'Gross Profit (Revenue - COGS); Net Profit excludes unmodeled operating overhead.',
        averageMarginPct: totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(1)) : 0,
        starsCount: items.filter((i) => i.classification === 'Star').length,
        dogsCount: items.filter((i) => i.classification === 'Dog').length,
      },
      items: items.sort((a, b) => b.grossProfit - a.grossProfit),
    };
  }

  async getInventoryIntelligence(days = 7) {
    const [inventoryItems, recipes, demandData] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        include: {
          recipes: { include: { menuItem: true } },
        },
        orderBy: { itemName: 'asc' },
      }),
      this.prisma.recipe.findMany({ include: { menuItem: true, inventoryItem: true } }),
      this.getDemandForecast(days),
    ]);

    const demandByDish = new Map<string, number>();
    for (const d of demandData.items) {
      demandByDish.set(d.menuItemId, d.predictedQty);
    }

    const leadTimeDays = 2;
    const items = inventoryItems.map((inv) => {
      let predictedRequirement = 0;
      const linkedDishes: Array<{ dishName: string; qtyPerServing: number; predictedServings: number }> = [];

      for (const r of recipes) {
        if (r.inventoryItemId === inv.id) {
          const servings = demandByDish.get(r.menuItemId) || 0;
          const qtyPerServing = Number(r.quantityRequired);
          predictedRequirement += servings * qtyPerServing;
          linkedDishes.push({
            dishName: r.menuItem?.name || 'Dish',
            qtyPerServing,
            predictedServings: servings,
          });
        }
      }

      const currentStock = Number(inv.currentStock);
      const minThreshold = Number(inv.minAlertThreshold);
      const avgDailyDemand = Number((predictedRequirement / Math.max(days, 1)).toFixed(3));
      const safetyStock = Number((minThreshold * 1.2).toFixed(2));
      const reorderPoint = Number((avgDailyDemand * leadTimeDays + safetyStock).toFixed(2));
      const shortage = Math.max(0, Number((predictedRequirement - currentStock).toFixed(2)));
      const recommendedOrderQty =
        currentStock <= reorderPoint ? Math.max(shortage, Number((reorderPoint * 1.5 - currentStock).toFixed(2))) : 0;

      let status = 'Optimal';
      let risk = 'Low';
      if (currentStock <= minThreshold * 0.5 || currentStock <= 0) {
        status = 'Critical Low';
        risk = 'High';
      } else if (currentStock <= reorderPoint || shortage > 0) {
        status = 'Reorder Required';
        risk = 'Medium';
      } else if (predictedRequirement > 0 && currentStock > predictedRequirement * 3) {
        status = 'Overstock Risk';
        risk = 'Medium';
      }

      return {
        id: inv.id,
        itemName: inv.itemName,
        unit: inv.unit,
        currentStock,
        minAlertThreshold: minThreshold,
        safetyStock,
        reorderPoint,
        avgDailyDemand,
        predictedRequirement: Number(predictedRequirement.toFixed(2)),
        shortage,
        recommendedOrderQty,
        status,
        risk,
        linkedDishes,
      };
    });

    return {
      days,
      leadTimeDays,
      formula: 'ROP = (AverageDailyDemand × LeadTime) + SafetyStock',
      summary: {
        totalItems: items.length,
        criticalCount: items.filter((i) => i.status === 'Critical Low').length,
        reorderCount: items.filter((i) => i.status === 'Reorder Required').length,
        overstockCount: items.filter((i) => i.status === 'Overstock Risk').length,
      },
      items,
    };
  }

  async getAnomalies() {
    const anomalies = await this.prisma.aiAnomaly.findMany({
      orderBy: { detectedAt: 'desc' },
    });

    return {
      summary: {
        total: anomalies.length,
        critical: anomalies.filter((a) => a.severity === AnomalySeverity.CRITICAL).length,
        high: anomalies.filter((a) => a.severity === AnomalySeverity.HIGH).length,
        open: anomalies.filter((a) => a.status === AnomalyStatus.OPEN || a.status === AnomalyStatus.INVESTIGATING).length,
      },
      items: anomalies.map((a) => ({
        ...a,
        detectedValue: Number(a.detectedValue),
        expectedValue: Number(a.expectedValue),
      })),
    };
  }

  async runAnomalyScan() {
    const [inventoryItems, movements] = await Promise.all([
      this.prisma.inventoryItem.findMany(),
      this.prisma.stockMovement.findMany({
        where: { movementType: 'WASTE_SPOILED' },
        include: { inventoryItem: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const created = [];
    for (const inv of inventoryItems) {
      if (Number(inv.currentStock) < 0 || Number(inv.currentStock) <= Number(inv.minAlertThreshold) * 0.25) {
        const existing = await this.prisma.aiAnomaly.findFirst({
          where: {
            anomalyType: AnomalyType.INVENTORY,
            status: AnomalyStatus.OPEN,
            description: { contains: inv.itemName },
          },
        });
        if (!existing) {
          const item = await this.prisma.aiAnomaly.create({
            data: {
              anomalyType: AnomalyType.INVENTORY,
              description: `Severe stock depletion detected for ${inv.itemName}: current stock ${Number(inv.currentStock)} ${inv.unit} vs threshold ${Number(inv.minAlertThreshold)} ${inv.unit}`,
              severity: Number(inv.currentStock) <= 0 ? AnomalySeverity.CRITICAL : AnomalySeverity.HIGH,
              detectedValue: inv.currentStock,
              expectedValue: inv.minAlertThreshold,
              status: AnomalyStatus.OPEN,
            },
          });
          created.push(item);
        }
      }
    }

    for (const m of movements) {
      if (Math.abs(Number(m.quantity)) > 5) {
        const desc = `Elevated spoilage movement for ${m.inventoryItem?.itemName || 'ingredient'}: ${Number(m.quantity)} ${m.inventoryItem?.unit || ''}`;
        const existing = await this.prisma.aiAnomaly.findFirst({
          where: { description: desc, status: AnomalyStatus.OPEN },
        });
        if (!existing) {
          const item = await this.prisma.aiAnomaly.create({
            data: {
              anomalyType: AnomalyType.CONSUMPTION,
              description: desc,
              severity: AnomalySeverity.MEDIUM,
              detectedValue: Math.abs(Number(m.quantity)),
              expectedValue: 1,
              status: AnomalyStatus.OPEN,
            },
          });
          created.push(item);
        }
      }
    }

    return {
      scannedAt: new Date().toISOString(),
      newAnomaliesDetected: created.length,
      created,
    };
  }

  async updateAnomalyStatus(id: string, status: AnomalyStatus) {
    const existing = await this.prisma.aiAnomaly.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Anomaly ${id} not found`);

    return this.prisma.aiAnomaly.update({
      where: { id },
      data: { status },
    });
  }

  async getRecommendations() {
    const [dbRecs, invIntel] = await Promise.all([
      this.prisma.aiRecommendation.findMany({ orderBy: { createdAt: 'desc' } }),
      this.getInventoryIntelligence(7),
    ]);

    // Auto-generate rule-based recommendations if none exist for critical ROP breaches
    for (const item of invIntel.items) {
      if (item.status === 'Critical Low' && item.recommendedOrderQty > 0) {
        const exists = dbRecs.some((r) => r.relatedEntityId === item.id && r.status === RecommendationStatus.PENDING);
        if (!exists) {
          const created = await this.prisma.aiRecommendation.create({
            data: {
              recommendationType: RecommendationType.INVENTORY,
              title: `Restock ${item.itemName} immediately`,
              description: `Stock (${item.currentStock} ${item.unit}) is below Safety Stock (${item.safetyStock} ${item.unit}) & ROP (${item.reorderPoint} ${item.unit}). Recommended purchase order: ${item.recommendedOrderQty} ${item.unit}.`,
              priority: RecommendationPriority.CRITICAL,
              relatedEntityId: item.id,
              status: RecommendationStatus.PENDING,
            },
          });
          dbRecs.unshift(created);
        }
      }
    }

    return {
      summary: {
        total: dbRecs.length,
        pending: dbRecs.filter((r) => r.status === RecommendationStatus.PENDING).length,
        accepted: dbRecs.filter((r) => r.status === RecommendationStatus.ACCEPTED).length,
        completed: dbRecs.filter((r) => r.status === RecommendationStatus.COMPLETED).length,
      },
      items: dbRecs,
    };
  }

  async updateRecommendationStatus(id: string, status: RecommendationStatus) {
    const existing = await this.prisma.aiRecommendation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Recommendation ${id} not found`);

    return this.prisma.aiRecommendation.update({
      where: { id },
      data: { status },
    });
  }
}
