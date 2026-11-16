// Operly Admin Financial Intelligence Mock Data
// Comprehensive dataset for restaurant operational & financial intelligence
// All monetary values in VND. Units in kg, portions, or pcs.

export const MOCK_FINANCIAL_SUMMARY = {
  currentPeriod: 'September 2026',
  currency: 'VND',
  totalRevenue: 684500000,
  previousPeriodRevenue: 619800000,
  revenueGrowthPct: 10.44,
  forecastedRevenue: 728000000,
  forecastedGrowthPct: 6.35,
  totalCostOfGoodsSold: 217671000,
  cogsPercentage: 31.8,
  previousCogsPct: 33.1,
  grossProfit: 466829000,
  grossProfitMargin: 68.2,
  averageTicketSize: 524000,
  totalOrders: 1306,
  inventoryRiskCount: 3, // 2 low stock, 1 overstock
  activeAnomaliesCount: 4,
  pendingRecommendationsCount: 5
};

export const MOCK_REVENUE_TRENDS = {
  daily: [
    { label: 'Sep 14', revenue: 21500000, orders: 41, cogs: 6880000, profit: 14620000 },
    { label: 'Sep 15', revenue: 22800000, orders: 43, cogs: 7068000, profit: 15732000 },
    { label: 'Sep 16', revenue: 26400000, orders: 50, cogs: 8448000, profit: 17952000 },
    { label: 'Sep 17', revenue: 25100000, orders: 48, cogs: 7781000, profit: 17319000 },
    { label: 'Sep 18', revenue: 29800000, orders: 56, cogs: 9238000, profit: 20562000 },
    { label: 'Sep 19', revenue: 38200000, orders: 74, cogs: 12224000, profit: 25976000 },
    { label: 'Sep 20', revenue: 35600000, orders: 69, cogs: 11036000, profit: 24564000 }
  ],
  weekly: [
    { label: 'Week 34', revenue: 158200000, orders: 304, cogs: 50624000, profit: 107576000 },
    { label: 'Week 35', revenue: 164500000, orders: 318, cogs: 52640000, profit: 111860000 },
    { label: 'Week 36', revenue: 172400000, orders: 332, cogs: 54306000, profit: 118094000 },
    { label: 'Week 37', revenue: 189400000, orders: 352, cogs: 60101000, profit: 129299000 }
  ],
  monthly: [
    { label: 'Apr 2026', revenue: 540000000, orders: 1040, cogs: 178200000, profit: 361800000 },
    { label: 'May 2026', revenue: 575000000, orders: 1110, cogs: 186875000, profit: 388125000 },
    { label: 'Jun 2026', revenue: 610000000, orders: 1180, cogs: 195200000, profit: 414800000 },
    { label: 'Jul 2026', revenue: 595000000, orders: 1150, cogs: 196350000, profit: 398650000 },
    { label: 'Aug 2026', revenue: 619800000, orders: 1195, cogs: 205153800, profit: 414646200 },
    { label: 'Sep 2026', revenue: 684500000, orders: 1306, cogs: 217671000, profit: 466829000 }
  ]
};

export const MOCK_MENU_ITEMS_PERFORMANCE = [
  {
    dishId: 'DISH-101',
    name: 'Seafood Spicy Hotpot',
    category: 'Hotpot',
    sellingPrice: 280000,
    unitCost: 89600, // 32% COGS
    unitsSold: 420,
    totalRevenue: 117600000,
    totalCost: 37632000,
    grossProfit: 79968000,
    marginPct: 68.0,
    rank: 1,
    performanceCategory: 'Star', // High volume, high profit
    growthVsLastMonth: 14.2
  },
  {
    dishId: 'DISH-102',
    name: 'Grilled Ribeye Steak',
    category: 'BBQ / Grill',
    sellingPrice: 250000,
    unitCost: 92500, // 37% COGS
    unitsSold: 385,
    totalRevenue: 96250000,
    totalCost: 35612500,
    grossProfit: 60637500,
    marginPct: 63.0,
    rank: 2,
    performanceCategory: 'Star',
    growthVsLastMonth: 8.5
  },
  {
    dishId: 'DISH-103',
    name: 'Grilled Wagyu Skewers (x4)',
    category: 'BBQ / Grill',
    sellingPrice: 320000,
    unitCost: 137600, // 43% COGS
    unitsSold: 210,
    totalRevenue: 67200000,
    totalCost: 28896000,
    grossProfit: 38304000,
    marginPct: 57.0,
    rank: 3,
    performanceCategory: 'Puzzle', // Lower volume, decent margin but high cost
    growthVsLastMonth: 5.1
  },
  {
    dishId: 'DISH-107',
    name: 'Fresh Atlantic Salmon Fillet',
    category: 'BBQ / Grill',
    sellingPrice: 220000,
    unitCost: 70400, // 32% COGS
    unitsSold: 290,
    totalRevenue: 63800000,
    totalCost: 20416000,
    grossProfit: 43384000,
    marginPct: 68.0,
    rank: 4,
    performanceCategory: 'Star',
    growthVsLastMonth: 12.0
  },
  {
    dishId: 'DISH-104',
    name: 'US Beef Slices',
    category: 'Hotpot',
    sellingPrice: 80000,
    unitCost: 28000, // 35% COGS
    unitsSold: 650,
    totalRevenue: 52000000,
    totalCost: 18200000,
    grossProfit: 33800000,
    marginPct: 65.0,
    rank: 5,
    performanceCategory: 'Plowhorse', // High volume, moderate unit margin
    growthVsLastMonth: 16.8
  },
  {
    dishId: 'DISH-106',
    name: 'Spring Rolls Platter',
    category: 'Appetizers',
    sellingPrice: 150000,
    unitCost: 36000, // 24% COGS
    unitsSold: 310,
    totalRevenue: 46500000,
    totalCost: 11160000,
    grossProfit: 35340000,
    marginPct: 76.0,
    rank: 6,
    performanceCategory: 'Star',
    growthVsLastMonth: 6.4
  },
  {
    dishId: 'DISH-105',
    name: 'Iced Herbal Tea',
    category: 'Drinks',
    sellingPrice: 25000,
    unitCost: 3500, // 14% COGS
    unitsSold: 980,
    totalRevenue: 24500000,
    totalCost: 3430000,
    grossProfit: 21070000,
    marginPct: 86.0,
    rank: 7,
    performanceCategory: 'Plowhorse',
    growthVsLastMonth: 21.0
  },
  {
    dishId: 'DISH-108',
    name: 'Fresh Oysters Rockefeller',
    category: 'Appetizers',
    sellingPrice: 180000,
    unitCost: 82800, // 46% COGS
    unitsSold: 85,
    totalRevenue: 15300000,
    totalCost: 7038000,
    grossProfit: 8262000,
    marginPct: 54.0,
    rank: 8,
    performanceCategory: 'Underperformer', // Low volume, high spoilage risk
    growthVsLastMonth: -15.4
  }
];

export const MOCK_REVENUE_FORECAST_DATA = {
  modelName: 'Ensemble Prophet & Holt-Winters Hybrid',
  modelAccuracyMape: 7.8, // 7.8% Mean Absolute Percentage Error
  confidenceInterval: 95,
  daily: [
    { period: 'Sep 21 (Mon)', historical: null, forecast: 22400000, lowerBound: 20100000, upperBound: 24700000, isWeekend: false },
    { period: 'Sep 22 (Tue)', historical: null, forecast: 23600000, lowerBound: 21200000, upperBound: 26000000, isWeekend: false },
    { period: 'Sep 23 (Wed)', historical: null, forecast: 27100000, lowerBound: 24500000, upperBound: 29700000, isWeekend: false },
    { period: 'Sep 24 (Thu)', historical: null, forecast: 26000000, lowerBound: 23400000, upperBound: 28600000, isWeekend: false },
    { period: 'Sep 25 (Fri)', historical: null, forecast: 31500000, lowerBound: 28500000, upperBound: 34500000, isWeekend: false },
    { period: 'Sep 26 (Sat)', historical: null, forecast: 39800000, lowerBound: 36000000, upperBound: 43600000, isWeekend: true },
    { period: 'Sep 27 (Sun)', historical: null, forecast: 37200000, lowerBound: 33500000, upperBound: 40900000, isWeekend: true }
  ],
  weekly: [
    { period: 'Week 38 (Current)', historical: 189400000, forecast: 191200000, lowerBound: 180000000, upperBound: 202400000 },
    { period: 'Week 39', historical: null, forecast: 198500000, lowerBound: 184000000, upperBound: 213000000 },
    { period: 'Week 40', historical: null, forecast: 206000000, lowerBound: 191000000, upperBound: 221000000 },
    { period: 'Week 41', historical: null, forecast: 212500000, lowerBound: 196000000, upperBound: 229000000 }
  ],
  monthly: [
    { period: 'Aug 2026', historical: 619800000, forecast: 615000000, lowerBound: 585000000, upperBound: 645000000 },
    { period: 'Sep 2026 (Actual/Proj)', historical: 684500000, forecast: 690000000, lowerBound: 660000000, upperBound: 720000000 },
    { period: 'Oct 2026 (Forecast)', historical: null, forecast: 735000000, lowerBound: 695000000, upperBound: 775000000 },
    { period: 'Nov 2026 (Forecast)', historical: null, forecast: 752000000, lowerBound: 708000000, upperBound: 796000000 },
    { period: 'Dec 2026 (Forecast)', historical: null, forecast: 840000000, lowerBound: 785000000, upperBound: 895000000 }
  ]
};

export const MOCK_MENU_DEMAND_FORECAST = [
  {
    dishId: 'DISH-101',
    name: 'Seafood Spicy Hotpot',
    category: 'Hotpot',
    currentWeekSold: 98,
    next7DaysForecast: 114,
    next30DaysForecast: 485,
    demandLevel: 'High Demand',
    trend: '+16.3%',
    trendDirection: 'up',
    peakDay: 'Saturday',
    prepRecommendation: 'Pre-portion spicy stock bases by Friday afternoon'
  },
  {
    dishId: 'DISH-102',
    name: 'Grilled Ribeye Steak',
    category: 'BBQ / Grill',
    currentWeekSold: 90,
    next7DaysForecast: 105,
    next30DaysForecast: 430,
    demandLevel: 'High Demand',
    trend: '+16.7%',
    trendDirection: 'up',
    peakDay: 'Saturday',
    prepRecommendation: 'Order 35kg additional aged ribeye loin before Thursday'
  },
  {
    dishId: 'DISH-103',
    name: 'Grilled Wagyu Skewers (x4)',
    category: 'BBQ / Grill',
    currentWeekSold: 48,
    next7DaysForecast: 52,
    next30DaysForecast: 225,
    demandLevel: 'Moderate Demand',
    trend: '+8.3%',
    trendDirection: 'up',
    peakDay: 'Friday',
    prepRecommendation: 'Skewers prep in morning shift'
  },
  {
    dishId: 'DISH-107',
    name: 'Fresh Atlantic Salmon Fillet',
    category: 'BBQ / Grill',
    currentWeekSold: 68,
    next7DaysForecast: 78,
    next30DaysForecast: 320,
    demandLevel: 'High Demand',
    trend: '+14.7%',
    trendDirection: 'up',
    peakDay: 'Sunday',
    prepRecommendation: 'Secure fresh delivery on Friday and Sunday mornings'
  },
  {
    dishId: 'DISH-104',
    name: 'US Beef Slices',
    category: 'Hotpot',
    currentWeekSold: 152,
    next7DaysForecast: 175,
    next30DaysForecast: 720,
    demandLevel: 'High Demand',
    trend: '+15.1%',
    trendDirection: 'up',
    peakDay: 'Saturday',
    prepRecommendation: 'Maintain automatic meat slicer buffer at 30kg'
  },
  {
    dishId: 'DISH-106',
    name: 'Spring Rolls Platter',
    category: 'Appetizers',
    currentWeekSold: 72,
    next7DaysForecast: 76,
    next30DaysForecast: 330,
    demandLevel: 'Moderate Demand',
    trend: '+5.5%',
    trendDirection: 'up',
    peakDay: 'Saturday',
    prepRecommendation: 'Roll batch preparation during morning pantry shift'
  },
  {
    dishId: 'DISH-105',
    name: 'Iced Herbal Tea',
    category: 'Drinks',
    currentWeekSold: 228,
    next7DaysForecast: 260,
    next30DaysForecast: 1100,
    demandLevel: 'High Demand',
    trend: '+14.0%',
    trendDirection: 'up',
    peakDay: 'Sunday',
    prepRecommendation: 'Cold brew 40L dispensers daily'
  },
  {
    dishId: 'DISH-108',
    name: 'Fresh Oysters Rockefeller',
    category: 'Appetizers',
    currentWeekSold: 20,
    next7DaysForecast: 18,
    next30DaysForecast: 75,
    demandLevel: 'Low Demand',
    trend: '-10.0%',
    trendDirection: 'down',
    peakDay: 'Friday',
    prepRecommendation: 'Restrict procurement to strictly match reservations to avoid spoilage'
  }
];

export const MOCK_INGREDIENT_DEMAND_FORECAST = [
  {
    ingredientId: 'ING-01',
    name: 'US Choice Ribeye Beef',
    unit: 'kg',
    unitCost: 380000,
    requiredQuantity7Days: 31.5,
    requiredQuantity30Days: 129.0,
    currentStock: 6.8,
    safetyStock: 8.0,
    estimatedShortage: 24.7,
    status: 'Shortage Warning',
    associatedDishes: ['Grilled Ribeye Steak (300g / portion)'],
    bomRatio: '0.30 kg per portion'
  },
  {
    ingredientId: 'ING-02',
    name: 'Fresh Atlantic Salmon',
    unit: 'kg',
    unitCost: 320000,
    requiredQuantity7Days: 17.2,
    requiredQuantity30Days: 70.4,
    currentStock: 4.5,
    safetyStock: 5.0,
    estimatedShortage: 12.7,
    status: 'Shortage Warning',
    associatedDishes: ['Fresh Atlantic Salmon Fillet (220g / portion)'],
    bomRatio: '0.22 kg per portion'
  },
  {
    ingredientId: 'ING-03',
    name: 'Tiger Prawns (Size 20/25)',
    unit: 'kg',
    unitCost: 290000,
    requiredQuantity7Days: 22.8,
    requiredQuantity30Days: 97.0,
    currentStock: 8.0,
    safetyStock: 7.0,
    estimatedShortage: 14.8,
    status: 'Shortage Warning',
    associatedDishes: ['Seafood Spicy Hotpot (200g / portion)'],
    bomRatio: '0.20 kg per portion'
  },
  {
    ingredientId: 'ING-04',
    name: 'Fresh Oysters',
    unit: 'pcs',
    unitCost: 15000,
    requiredQuantity7Days: 108,
    requiredQuantity30Days: 450,
    currentStock: 140,
    safetyStock: 60,
    estimatedShortage: 0,
    status: 'Overstock Risk',
    associatedDishes: ['Fresh Oysters Rockefeller (6 pcs / portion)'],
    bomRatio: '6 pcs per portion'
  },
  {
    ingredientId: 'ING-05',
    name: 'US Beef Slices (Pre-cut)',
    unit: 'kg',
    unitCost: 160000,
    requiredQuantity7Days: 35.0,
    requiredQuantity30Days: 144.0,
    currentStock: 15.0,
    safetyStock: 10.0,
    estimatedShortage: 20.0,
    status: 'Replenish Required',
    associatedDishes: ['US Beef Slices Hotpot Plate (200g / portion)'],
    bomRatio: '0.20 kg per portion'
  },
  {
    ingredientId: 'ING-06',
    name: 'Fresh Green Asparagus',
    unit: 'kg',
    unitCost: 120000,
    requiredQuantity7Days: 10.5,
    requiredQuantity30Days: 43.0,
    currentStock: 8.0,
    safetyStock: 3.0,
    estimatedShortage: 2.5,
    status: 'Optimal',
    associatedDishes: ['Grilled Ribeye Steak (100g / portion)'],
    bomRatio: '0.10 kg per portion'
  },
  {
    ingredientId: 'ING-07',
    name: 'Cold-Brew Herbal Blend',
    unit: 'kg',
    unitCost: 140000,
    requiredQuantity7Days: 6.5,
    requiredQuantity30Days: 27.5,
    currentStock: 12.0,
    safetyStock: 4.0,
    estimatedShortage: 0,
    status: 'Optimal',
    associatedDishes: ['Iced Herbal Tea (25g dry / 1L)'],
    bomRatio: '0.025 kg per liter'
  }
];

export const MOCK_INVENTORY_OPTIMIZATION_DATA = [
  {
    id: 'INV-OPT-01',
    sku: 'SKU-BEEF-001',
    name: 'US Choice Ribeye Beef',
    category: 'Meat & Poultry',
    unit: 'kg',
    unitPrice: 380000,
    currentStock: 6.8,
    minStock: 5.0,
    safetyStock: 8.0,
    reorderPoint: 12.5, // Daily usage 4.5kg * Lead Time 2d + Safety Stock 8kg = 17kg or adjusted
    recommendedOrderQty: 25.0, // Economic Order Quantity
    leadTimeDays: 2,
    shelfLifeDays: 5,
    stockStatus: 'Critical Low',
    riskLevel: 'High',
    suggestedAction: 'Dispatch PO immediately to Meat Co. (Require delivery before Friday 14:00)'
  },
  {
    id: 'INV-OPT-02',
    sku: 'SKU-SEAFOOD-002',
    name: 'Fresh Atlantic Salmon',
    category: 'Seafood',
    unit: 'kg',
    unitPrice: 320000,
    currentStock: 4.5,
    minStock: 4.0,
    safetyStock: 5.0,
    reorderPoint: 9.0,
    recommendedOrderQty: 15.0,
    leadTimeDays: 1,
    shelfLifeDays: 3,
    stockStatus: 'Low Stock',
    riskLevel: 'High',
    suggestedAction: 'Place daily fresh fish procurement order for Saturday morning intake'
  },
  {
    id: 'INV-OPT-03',
    sku: 'SKU-SEAFOOD-003',
    name: 'Tiger Prawns (Size 20/25)',
    category: 'Seafood',
    unit: 'kg',
    unitPrice: 290000,
    currentStock: 8.0,
    minStock: 6.0,
    safetyStock: 7.0,
    reorderPoint: 13.5,
    recommendedOrderQty: 20.0,
    leadTimeDays: 1,
    shelfLifeDays: 4,
    stockStatus: 'Low Stock',
    riskLevel: 'Medium',
    suggestedAction: 'Replenish buffer for weekend hotpot demand spike'
  },
  {
    id: 'INV-OPT-04',
    sku: 'SKU-SEAFOOD-004',
    name: 'Fresh Oysters',
    category: 'Seafood',
    unit: 'pcs',
    unitPrice: 15000,
    currentStock: 140,
    minStock: 40,
    safetyStock: 60,
    reorderPoint: 80,
    recommendedOrderQty: 0,
    leadTimeDays: 1,
    shelfLifeDays: 2,
    stockStatus: 'Overstock Risk',
    riskLevel: 'High',
    suggestedAction: 'Halt replenishment. Trigger Chef Special promotional pairing to clear inventory before spoilage.'
  },
  {
    id: 'INV-OPT-05',
    sku: 'SKU-MEAT-005',
    name: 'US Beef Slices (Pre-cut)',
    category: 'Meat & Poultry',
    unit: 'kg',
    unitPrice: 160000,
    currentStock: 15.0,
    minStock: 8.0,
    safetyStock: 10.0,
    reorderPoint: 18.0,
    recommendedOrderQty: 25.0,
    leadTimeDays: 2,
    shelfLifeDays: 14,
    stockStatus: 'Reorder Point Met',
    riskLevel: 'Medium',
    suggestedAction: 'Issue regular replenishment order'
  },
  {
    id: 'INV-OPT-06',
    sku: 'SKU-PRODUCE-006',
    name: 'Fresh Green Asparagus',
    category: 'Produce',
    unit: 'kg',
    unitPrice: 120000,
    currentStock: 8.0,
    minStock: 2.0,
    safetyStock: 3.0,
    reorderPoint: 5.5,
    recommendedOrderQty: 8.0,
    leadTimeDays: 1,
    shelfLifeDays: 4,
    stockStatus: 'Optimal',
    riskLevel: 'Low',
    suggestedAction: 'Stock level healthy. Re-evaluate on next routine cycle.'
  },
  {
    id: 'INV-OPT-07',
    sku: 'SKU-DRY-007',
    name: 'Cold-Brew Herbal Blend',
    category: 'Dry Goods & Beverages',
    unit: 'kg',
    unitPrice: 140000,
    currentStock: 12.0,
    minStock: 3.0,
    safetyStock: 4.0,
    reorderPoint: 6.0,
    recommendedOrderQty: 10.0,
    leadTimeDays: 3,
    shelfLifeDays: 90,
    stockStatus: 'Optimal',
    riskLevel: 'Low',
    suggestedAction: 'Adequate stock for 20+ service shifts.'
  }
];

export const MOCK_LOSS_AND_ANOMALIES = [
  {
    id: 'ANOM-2026-091',
    timestamp: '2026-09-20 20:15:30',
    type: 'Revenue Anomaly',
    severity: 'Warning',
    title: 'Sudden Revenue Velocity Drop (-42% vs Forecast)',
    affectedPeriodOrItem: 'Dinner Service (19:30 - 20:15)',
    expectedValue: '18,500,000 VND',
    actualValue: '10,730,000 VND',
    variancePct: -42.0,
    details: 'Unexpected 42% revenue contraction during peak service window. Kitchen ticket generation stalled at 19:40 due to local POS network switch disconnect. Reconnected at 20:10.',
    rootCause: 'LAN hardware switch transient failure at FOH terminal desk.',
    status: 'Investigated',
    suggestedMitigation: 'Schedule IT hardware inspection; ensure backup Wi-Fi failover is activated.'
  },
  {
    id: 'ANOM-2026-092',
    timestamp: '2026-09-20 18:45:10',
    type: 'Unusual Ingredient Consumption',
    severity: 'Critical',
    title: 'High Ribeye Waste Variance (Theoretical vs Actual +3.4kg)',
    affectedPeriodOrItem: 'US Choice Ribeye Beef (SKU-BEEF-001)',
    expectedValue: '12.0 kg theoretical consumption',
    actualValue: '15.4 kg depleted from walk-in',
    variancePct: +28.3,
    details: 'Recipe BOM specifies 300g per portion (40 steaks sold = 12.0kg theoretical). Inventory ledger recorded 15.4kg consumption. 3.4kg excess unbilled portioning or trimming trim loss detected.',
    rootCause: 'Over-trimming by junior prep cook and unrecorded complimentary test cuts.',
    status: 'Open Action Required',
    suggestedMitigation: 'Enforce pre-shift portion scale audit and conduct butchery yield retraining.'
  },
  {
    id: 'ANOM-2026-093',
    timestamp: '2026-09-19 22:30:00',
    type: 'Inventory Discrepancy',
    severity: 'Critical',
    title: 'Physical Inventory Audit Mismatch: Fresh Oysters Rockefeller',
    affectedPeriodOrItem: 'Fresh Oysters (SKU-SEAFOOD-004)',
    expectedValue: '176 pcs remaining',
    actualValue: '140 pcs counted in cold storage',
    variancePct: -20.5,
    details: 'Daily closing physical stock count registered 36 missing oysters with zero corresponding POS sales or logged kitchen spoilage write-offs.',
    rootCause: 'Unrecorded kitchen breakage and unauthorized staff meal usage.',
    status: 'Under Review',
    suggestedMitigation: 'Require Head Chef dual-signature signoff on all raw shellfish pantry reconciliations.'
  },
  {
    id: 'ANOM-2026-094',
    timestamp: '2026-09-18 21:05:44',
    type: 'Cashier Discount Anomaly',
    severity: 'Warning',
    title: 'Repetitive VIP Discount Overrides by Terminal CSH-02',
    affectedPeriodOrItem: 'Cashier Station 2 (Mai Le)',
    expectedValue: '<= 1 override per shift',
    actualValue: '4 overrides applied within 90 minutes',
    variancePct: +300.0,
    details: 'Four manual 40% VIP discounts were processed sequentially without manager RFID card tap. Audit log indicates bypass code was shared.',
    rootCause: 'Manager passcode shared verbally during busy rush.',
    status: 'Resolved',
    suggestedMitigation: 'Reset manager supervisor passcode immediately; mandate biometrics or physical RFID badge tap.'
  },
  {
    id: 'ANOM-2026-095',
    timestamp: '2026-09-17 14:20:18',
    type: 'Price vs Cost Anomaly',
    severity: 'Info',
    title: 'Margin Compression on Grilled Wagyu Skewers (COGS at 43%)',
    affectedPeriodOrItem: 'Grilled Wagyu Skewers (x4)',
    expectedValue: 'Target Food Cost: <= 35%',
    actualValue: 'Actual Food Cost: 43.0%',
    variancePct: +22.8,
    details: 'Recent wholesale supplier invoice price surge of Australian Wagyu beef (+18%) eroded unit gross margin from 65% down to 57%.',
    rootCause: 'Supplier price hike without menu selling price recalibration.',
    status: 'Action Scheduled',
    suggestedMitigation: 'Adjust menu selling price to 345,000 VND or renegotiate bulk purchase rates.'
  }
];

export const MOCK_RECOMMENDATION_ENGINE_DATA = [
  {
    id: 'REC-ENG-001',
    category: 'Inventory Replenishment',
    title: 'Expedite Weekend Ribeye & Prawn Stock Replenishment',
    targetMetric: 'US Choice Ribeye Beef & Tiger Prawns',
    priority: 'Critical',
    reason: 'Current stock is projected to run out on Friday at 20:30 based on 7-day ARIMA demand forecasting (+35% weekend customer surge).',
    supportingData: 'Ribeye Stock: 6.8kg vs 17kg ROP. Prawns: 8.0kg vs 13.5kg ROP. Forecasted weekend covers: 135 tables.',
    suggestedAction: 'Issue expedited Purchase Orders for 25kg Ribeye and 20kg Tiger Prawns for delivery before Friday 14:00.',
    expectedImpact: 'Prevent ~18,500,000 VND in lost banquet sales and avoid 86-item customer dissatisfaction.',
    status: 'Pending', // 'Pending' | 'Reviewed' | 'Completed' | 'Dismissed'
    createdAt: '2026-09-20 09:00'
  },
  {
    id: 'REC-ENG-002',
    category: 'Overstock Reduction',
    title: 'Trigger Flash Pairing Promo for Fresh Oysters Rockefeller',
    targetMetric: 'Fresh Oysters (140 pcs on hand / 2-day shelf life)',
    priority: 'High',
    reason: 'Inventory velocity dropped by 10% this week. Current stock of 140 pcs will exceed shelf life limit within 48 hours.',
    supportingData: 'Shelf life: 48 hours remaining. Normal demand: ~18 pcs/day. Projected spoilage: 85 pcs (~2,550,000 VND loss).',
    suggestedAction: 'Create temporary combo: 1x Seafood Hotpot + 1x Oyster Rockefeller with 20% bundle discount.',
    expectedImpact: 'Recover 2,550,000 VND inventory value and generate 3,800,000 VND incremental appetizer revenue.',
    status: 'Pending',
    createdAt: '2026-09-20 10:15'
  },
  {
    id: 'REC-ENG-003',
    category: 'Menu Profitability Improvement',
    title: 'Recalibrate Selling Price on Grilled Wagyu Skewers (x4)',
    targetMetric: 'DISH-103 Gross Margin (Current: 57%, Target: >= 65%)',
    priority: 'Medium',
    reason: 'Wholesale Australian Wagyu cost increased by 18%, pushing COGS to 43%. Price has remained at 320,000 VND for 6 months.',
    supportingData: 'Unit cost: 137,600 VND. Current price: 320,000 VND. Competitor benchmark: 350,000 - 380,000 VND.',
    suggestedAction: 'Adjust menu price from 320,000 VND to 345,000 VND and feature as Chef Premium Selection.',
    expectedImpact: '+5,250,000 VND monthly gross profit with negligible demand elasticity drop (< 3%).',
    status: 'Pending',
    createdAt: '2026-09-19 16:30'
  },
  {
    id: 'REC-ENG-004',
    category: 'Ingredient Purchasing',
    title: 'Consolidate Produce Purchasing with GreenFarm Supplier',
    targetMetric: 'Produce & Vegetable Supplier Terms',
    priority: 'Medium',
    reason: 'Restaurant is currently ordering herbs, asparagus, and hotpot vegetables from three separate split vendors.',
    supportingData: 'Monthly produce spend: 45,000,000 VND across 3 vendors. GreenFarm offers 8% tiered volume rebate.',
    suggestedAction: 'Consolidate 100% of weekly produce orders under single master agreement with GreenFarm.',
    expectedImpact: 'Estimated direct annual procurement savings of 43,200,000 VND and reduced receiving dock handling.',
    status: 'Pending',
    createdAt: '2026-09-19 11:00'
  },
  {
    id: 'REC-ENG-005',
    category: 'Demand-based Inventory Planning',
    title: 'Establish Dynamic Safety Stock Buffers for Rain Forecast Days',
    targetMetric: 'Hotpot Broth & Meat Slice Inventory Buffer',
    priority: 'Low',
    reason: 'Historical correlation indicates +24% hotpot demand on days with recorded rainfall in Da Nang Central.',
    supportingData: 'Weather forecast predicts 3 consecutive days of rain next week. Historical hotpot demand lifts from 98 to 122 pots/week.',
    suggestedAction: 'Increase hotpot base broth prep by +25% on rainy forecast days and alert morning kitchen prep line.',
    expectedImpact: 'Capture +9,800,000 VND incremental hotpot sales without stockouts.',
    status: 'Pending',
    createdAt: '2026-09-18 15:00'
  },
  {
    id: 'REC-ENG-006',
    category: 'Business Performance Improvement',
    title: 'Promote High-Margin Iced Herbal Tea as Default Table Pairing',
    targetMetric: 'Beverage Attachment Rate & Palate Cleanser Upsell',
    priority: 'Low',
    reason: 'Iced Herbal Tea yields 86% gross profit margin (Cost: 3,500 VND, Selling: 25,000 VND). Current attachment rate is 45%.',
    supportingData: '980 glasses sold monthly. Apriori pairing rule shows 76% affinity with Seafood Spicy Hotpot.',
    suggestedAction: 'Train service staff to suggest herbal tea pitcher immediately upon seating spicy hotpot tables.',
    expectedImpact: 'Increase tea attachment to 65%, generating +6,250,000 VND high-margin revenue per month.',
    status: 'Reviewed',
    createdAt: '2026-09-17 08:30'
  }
];
