// Operly Prototype Mock Data
// Strictly traced to PRD v1.1, Chapter 4.1 User Flows, and Chapter 4.2 Wireframes

export const MOCK_MENU_ITEMS = [
  {
    id: 'DISH-101',
    name: 'Seafood Spicy Hotpot',
    category: 'Hotpot',
    price: 280000,
    station: 'Station 3 (Hot Line)',
    description: 'Fresh prawns, squid, clams, spicy broth.',
    image: '🍲',
    modifiers: [
      { id: 'MOD-01', name: 'Less Spicy', priceDelta: 0 },
      { id: 'MOD-02', name: 'Standard Spicy', priceDelta: 0 },
      { id: 'MOD-03', name: 'Extra Spicy', priceDelta: 0 }
    ],
    is86: false
  },
  {
    id: 'DISH-102',
    name: 'Grilled Ribeye Steak',
    category: 'BBQ / Grill',
    price: 250000,
    station: 'Station 2 (Grill)',
    description: '300g US Beef, garlic butter, asparagus.',
    image: '🥩',
    modifiers: [
      { id: 'MOD-04', name: 'Medium Rare', priceDelta: 0 },
      { id: 'MOD-05', name: 'Medium', priceDelta: 0 },
      { id: 'MOD-06', name: 'Well Done', priceDelta: 0 }
    ],
    is86: false
  },
  {
    id: 'DISH-103',
    name: 'Grilled Wagyu Skewers (x4)',
    category: 'BBQ / Grill',
    price: 320000,
    station: 'Station 2 (Grill)',
    description: 'Tender Australian Wagyu beef with teriyaki glaze.',
    image: '🍢',
    modifiers: [],
    is86: false
  },
  {
    id: 'DISH-104',
    name: 'US Beef Slices',
    category: 'Hotpot',
    price: 80000,
    station: 'Station 3 (Hot Line)',
    description: 'Thinly sliced US choice beef for hotpot dipping.',
    image: '🥓',
    modifiers: [],
    is86: false
  },
  {
    id: 'DISH-105',
    name: 'Iced Herbal Tea',
    category: 'Drinks',
    price: 25000,
    station: 'Station 4 (Bar)',
    description: 'Refreshing organic cold-brewed herbal tea.',
    image: '🍵',
    modifiers: [
      { id: 'MOD-07', name: 'Less Sweet', priceDelta: 0 },
      { id: 'MOD-08', name: 'Regular Sweet', priceDelta: 0 }
    ],
    is86: false
  },
  {
    id: 'DISH-106',
    name: 'Spring Rolls Platter',
    category: 'Appetizers',
    price: 150000,
    station: 'Station 1 (Pantry)',
    description: 'Traditional fried pork & mushroom spring rolls (6 pcs).',
    image: '🥟',
    modifiers: [],
    is86: false
  },
  {
    id: 'DISH-107',
    name: 'Fresh Atlantic Salmon Fillet',
    category: 'BBQ / Grill',
    price: 220000,
    station: 'Station 2 (Grill)',
    description: 'Pan-seared salmon with lemon dill butter sauce.',
    image: '🐟',
    modifiers: [],
    is86: false
  },
  {
    id: 'DISH-108',
    name: 'Fresh Oysters Rockefeller',
    category: 'Appetizers',
    price: 180000,
    station: 'Station 1 (Pantry)',
    description: 'Baked oysters with spinach, herbs, and parmesan.',
    image: '🦪',
    modifiers: [],
    is86: true,
    disabledReason: 'Disabled at 18:45 by Chef Hung (Inventory depleted)'
  }
];

// Apriori Recommender Rules (SPEC-AI-004)
export const MOCK_AI_PAIRINGS = {
  'DISH-101': [
    { dishId: 'DISH-104', name: 'US Beef Slices', price: 80000, confidence: 88, reason: 'Frequently dipped in Hotpot' },
    { dishId: 'DISH-105', name: 'Iced Herbal Tea', price: 25000, confidence: 76, reason: 'Cooling balance for spicy soup' }
  ],
  'DISH-102': [
    { dishId: 'DISH-105', name: 'Iced Herbal Tea', price: 25000, confidence: 64, reason: 'Cleanses palate' },
    { dishId: 'DISH-106', name: 'Spring Rolls Platter', price: 150000, confidence: 52, reason: 'Popular starter pairing' }
  ]
};

// Floor Layout Tables matching SCR-WAIT-01
export const MOCK_INITIAL_TABLES = [
  { id: 'T01', name: 'Table 01', seats: 4, status: 'Available', orderId: null },
  { id: 'T02', name: 'Table 02', seats: 2, status: 'Occupied', orderId: 'ORD-1046', billAmount: 320000, unservedItems: 0 },
  { id: 'T03', name: 'Table 03', seats: 4, status: 'Occupied', orderId: 'ORD-1047', billAmount: 820000, unservedItems: 1, note: 'Cooking (12m)' },
  { id: 'T04', name: 'Table 04', seats: 10, status: 'Reserved', note: 'Res: 19:00 (10 Guests)' },
  { id: 'T05', name: 'Table 05', seats: 6, status: 'Occupied', activeDineIn: true, orderId: 'ORD-1048', note: 'Active Guest Session' },
  { id: 'T06', name: 'Table 06', seats: 4, status: 'Cleaning', note: 'Needs sanitize & reset' },
  { id: 'T08', name: 'Table 08', seats: 4, status: 'Occupied', checkoutQueue: true, orderId: 'ORD-1045', billAmount: 350000, unservedItems: 0 }
];

// Initial KDS Tickets matching SCR-KDS-01
export const MOCK_INITIAL_KDS_TICKETS = [
  {
    ticketId: '104',
    tableId: 'T05',
    orderId: 'ORD-1048',
    placedAt: '19:30',
    elapsedMinutes: 12,
    station: 'Station 3 (Hot Line)',
    items: [
      {
        id: 'ITEM-1',
        dishId: 'DISH-101',
        name: 'Seafood Spicy Hotpot',
        quantity: 1,
        modifier: 'Less Spicy',
        status: 'Cooking',
        station: 'Station 3 (Hot Line)'
      },
      {
        id: 'ITEM-2',
        dishId: 'DISH-104',
        name: 'US Beef Slices',
        quantity: 1,
        modifier: 'Default',
        status: 'Ready',
        station: 'Station 3 (Hot Line)'
      },
      {
        id: 'ITEM-3',
        dishId: 'DISH-105',
        name: 'Iced Herbal Tea',
        quantity: 2,
        modifier: 'Less Sweet',
        status: 'Served',
        station: 'Station 4 (Bar)'
      }
    ]
  },
  {
    ticketId: '105',
    tableId: 'T03',
    orderId: 'ORD-1047',
    placedAt: '19:32',
    elapsedMinutes: 10,
    station: 'Station 2 (Grill)',
    items: [
      {
        id: 'ITEM-4',
        dishId: 'DISH-102',
        name: 'Grilled Ribeye Steak',
        quantity: 2,
        modifier: 'Medium Rare',
        status: 'Cooking',
        station: 'Station 2 (Grill)'
      }
    ]
  },
  {
    ticketId: '106',
    tableId: 'T02',
    orderId: 'ORD-1046',
    placedAt: '19:35',
    elapsedMinutes: 7,
    station: 'Station 1 (Pantry)',
    items: [
      {
        id: 'ITEM-5',
        dishId: 'DISH-106',
        name: 'Spring Rolls Platter',
        quantity: 1,
        modifier: '',
        status: 'Ready',
        station: 'Station 1 (Pantry)'
      }
    ]
  }
];

// Loyalty Members for POS (FR-011)
export const MOCK_MEMBERS = {
  '0912345678': {
    name: 'Lan Anh Nguyen',
    phone: '0912345678',
    tier: 'Gold',
    tierDiscountPct: 10,
    pointsBalance: 420
  },
  '0905123456': {
    name: 'Hoang Nam Le',
    phone: '0905123456',
    tier: 'Silver',
    tierDiscountPct: 5,
    pointsBalance: 150
  }
};

// Initial Table Reservations matching SCR-CUST-01 & SCR-CUST-02
export const MOCK_INITIAL_RESERVATIONS = [
  {
    id: 'RSV-01',
    code: 'BK-8942',
    customerName: 'Lan Anh Nguyen',
    phone: '0912345678',
    email: 'lananh.nguyen@example.com',
    partySize: 4,
    date: '2026-09-26',
    time: '19:00',
    area: 'Indoor Dining Room',
    tableId: 'T03',
    specialRequests: 'Window seat preferred, birthday dinner',
    preOrderItems: [
      { dishId: 'DISH-101', name: 'Seafood Spicy Hotpot', quantity: 1, price: 280000, modifier: 'Less Spicy' },
      { dishId: 'DISH-105', name: 'Iced Herbal Tea', quantity: 4, price: 25000, modifier: 'Less Sweet' }
    ],
    preOrderTotal: 380000,
    depositRequired: 0,
    depositPaid: 0,
    status: 'Confirmed',
    createdAt: '2026-09-24 14:20'
  }
];

// Coupons for POS (FR-008, 40% cap policy)
export const MOCK_COUPONS = {
  'HAPPYHOUR': { code: 'HAPPYHOUR', discountPct: 10, description: 'Evening Happy Hour 10% Off' },
  'VIPMEGA': { code: 'VIPMEGA', discountPct: 35, description: 'Special Promo 35% Off' }
};

// Manager Metrics & AI Demand Forecast (SCR-MGR-01 & Journey 6 Step 5)
export const MOCK_MANAGER_METRICS = {
  branch: 'Da Nang Central',
  date: '2026-09-20',
  managerName: 'Nam Hoang',
  grossSales: 24500000,
  salesTarget: 28000000,
  tablesServed: 38,
  totalCovers: 134,
  avgTicket: 644700,
  wasteLoss: 145000,
  laborCostPct: 18.2,
  foodCostPct: 31.4,
  tableTurnoverRate: '1.42 turn/table',
  shiftStaffOnDuty: 8,
  shiftTotalStaff: 9
};

export const MOCK_AI_FORECAST = {
  modelType: 'ARIMA / Prophet Baseline (7-Day Inference)',
  confidenceLevel: 95,
  expectedCovers: 320,
  modelMape: 11.4,
  dataPoints: [
    { day: 'Mon', revenueM: 16.2, lowerM: 14.5, upperM: 18.0, covers: 32 },
    { day: 'Tue', revenueM: 17.5, lowerM: 15.2, upperM: 19.8, covers: 35 },
    { day: 'Wed', revenueM: 26.0, lowerM: 23.5, upperM: 28.5, covers: 52 },
    { day: 'Thu', revenueM: 24.8, lowerM: 22.0, upperM: 27.2, covers: 48 },
    { day: 'Fri', revenueM: 21.0, lowerM: 18.5, upperM: 23.5, covers: 44 },
    { day: 'Sat', revenueM: 34.0, lowerM: 30.5, upperM: 37.5, covers: 75 },
    { day: 'Sun', revenueM: 28.5, lowerM: 25.0, upperM: 32.0, covers: 60 }
  ],
  recommendations: [
    {
      id: 'REC-01',
      type: 'Staffing',
      title: 'Saturday Floor Staff Schedule',
      text: 'Predicted Covers: 75 tables (+35% vs weekday). Required Floor Staff: 6 Waiters (Schedule 2 extra).'
    },
    {
      id: 'REC-02',
      type: 'Procurement',
      title: 'Critical Prep Requisition',
      text: 'Order 15 kg Fresh Ribeye Beef & 20 kg Tiger Prawns by Friday 14:00 to prevent stockout.'
    }
  ]
};

// Manager Recipe BOM Configurator (SCR-MGR-02 & Journey 6 Step 2)
export const MOCK_RECIPE_BOM = {
  dishId: 'DISH-102',
  dishName: 'Grilled Ribeye Steak',
  sellingPrice: 250000,
  category: 'BBQ / Grill',
  station: 'Station 2 - Grill',
  imageName: 'ribeye.jpg (Cloudinary Hosted)',
  ingredients: [
    { id: 'ING-01', name: 'US Choice Ribeye Beef', quantity: 300, unit: 'Grams', yieldPct: 95, unitCost: 400, lineCost: 120000 },
    { id: 'ING-02', name: 'Fresh Garlic Butter', quantity: 50, unit: 'Grams', yieldPct: 100, unitCost: 150, lineCost: 7500 },
    { id: 'ING-03', name: 'Fresh Green Asparagus', quantity: 100, unit: 'Grams', yieldPct: 90, unitCost: 120, lineCost: 12000 }
  ]
};

// Manager Pending & Processed Approvals Queue (Urgent Operations & Decisions)
export const MOCK_MANAGER_APPROVALS = [
  {
    id: 'APP-101',
    type: 'Void Dish',
    category: 'Billing',
    urgency: 'High',
    title: 'Void Dish: Seafood Spicy Hotpot (Table T08)',
    requester: 'Mai Le',
    requesterRole: 'Cashier',
    timestamp: '18:42',
    table: 'Table 08',
    amount: 280000,
    reason: 'Customer requested cancellation prior to cooking due to seafood allergy',
    status: 'Pending',
    details: 'Order #ORD-1045. Kitchen confirmed cooking has not started (Status: Pending, not moved to Cooking). Zero ingredient waste incurred.'
  },
  {
    id: 'APP-102',
    type: 'Discount Override',
    category: 'Policy',
    urgency: 'Medium',
    title: 'VIP Discount Override 45% (Exceeds 40% Policy Cap)',
    requester: 'Mai Le',
    requesterRole: 'Cashier',
    timestamp: '18:35',
    table: 'Table 04',
    amount: 450000,
    reason: 'VIP Diamond guest presenting Restaurant Owner invitation letter',
    status: 'Pending',
    details: 'Preliminary bill: 3,250,000 VND. Per PRD Rule 7, default discount cap is 40%. Requires Manager passcode override to release POS checkout.'
  },
  {
    id: 'APP-103',
    type: 'Urgent Procurement',
    category: 'Inventory',
    urgency: 'Critical',
    title: 'Urgent Order: 15kg Ribeye Beef (Inventory at 2.1kg Critical)',
    requester: 'Chef Hung',
    requesterRole: 'Head Chef',
    timestamp: '18:15',
    supplier: 'Fresh Meat Co.',
    amount: 4800000,
    reason: 'Stock depleted to 2.1kg (safety buffer: 5.0kg); 3 banquet dinner tables booked tonight',
    status: 'Pending',
    details: 'Supplier requires approval before 19:00 for express delivery dispatch by 19:45.'
  },
  {
    id: 'APP-104',
    type: 'Shift Swap',
    category: 'Staffing',
    urgency: 'Low',
    title: 'Evening Shift Swap: Minh Tuan Tran & Van B',
    requester: 'Minh Tuan Tran',
    requesterRole: 'Waiter',
    timestamp: '17:50',
    targetShift: 'Evening Shift (17:00 - 23:00)',
    amount: null,
    reason: 'Urgent family emergency; Van B agreed to take over floor coverage',
    status: 'Pending',
    details: 'Both employees meet role qualifications, within weekly hour limits, with zero schedule conflicts.'
  },
  {
    id: 'APP-099',
    type: 'Void Dish',
    category: 'Billing',
    urgency: 'Medium',
    title: 'Void 2x Avocado Smoothie (Table T02)',
    requester: 'Minh Tuan Tran',
    requesterRole: 'Waiter',
    timestamp: '16:20',
    table: 'Table 02',
    amount: 90000,
    reason: 'Bar station out of ripe avocados; guest switched to Iced Herbal Tea',
    status: 'Approved',
    processedAt: '16:25',
    processedBy: 'Nam Hoang (Manager)',
    notes: 'Confirmed Bar station had not begun preparation.'
  },
  {
    id: 'APP-098',
    type: 'Inventory Write-off',
    category: 'Inventory',
    urgency: 'High',
    title: 'Record Spoilage Write-off: 1.5kg Fresh Scallops',
    requester: 'Chef Hung',
    requesterRole: 'Head Chef',
    timestamp: '15:10',
    amount: 450000,
    reason: 'Chiller compartment 3 compressor malfunction during morning shift',
    status: 'Approved',
    processedAt: '15:15',
    processedBy: 'Nam Hoang (Manager)',
    notes: 'Logged under FR-013 Spoilage Ledger; maintenance technician dispatched.'
  },
  {
    id: 'APP-097',
    type: 'Discount Override',
    category: 'Policy',
    urgency: 'Low',
    title: 'Family Discount Request 50% (Staff Relative)',
    requester: 'Mai Le',
    requesterRole: 'Cashier',
    timestamp: '14:05',
    table: 'Table 01',
    amount: 300000,
    reason: 'Staff relative dining during lunch service',
    status: 'Rejected',
    processedAt: '14:12',
    processedBy: 'Nam Hoang (Manager)',
    notes: 'Restaurant policy caps staff relative discounts at 30%; instructed cashier to bill standard promo rate.'
  }
];

// Manager Operations & Team Management (Duty Roster & Live Performance)
export const MOCK_TEAM_DUTY_ROSTER = [
  {
    id: 'STF-01',
    name: 'Minh Tuan Tran',
    role: 'Waiter',
    department: 'FOH',
    shift: 'Evening (17:00 - 23:00)',
    status: 'On Duty',
    checkInTime: '16:55 (GPS Verified)',
    tablesHandled: 8,
    rating: 4.9,
    avatar: '👨‍🍳',
    phone: '0905111222'
  },
  {
    id: 'STF-02',
    name: 'Chef Hung',
    role: 'Head Chef',
    department: 'BOH',
    shift: 'Evening (16:00 - 23:00)',
    status: 'On Duty',
    checkInTime: '15:50 (Wi-Fi Verified)',
    ordersCooked: 42,
    rating: 5.0,
    avatar: '👨‍🍳',
    phone: '0905333444'
  },
  {
    id: 'STF-03',
    name: 'Mai Le',
    role: 'Cashier',
    department: 'FOH',
    shift: 'Evening (17:00 - 23:00)',
    status: 'On Duty',
    checkInTime: '16:50 (GPS Verified)',
    billsSettled: 19,
    rating: 4.8,
    avatar: '👩‍💼',
    phone: '0905555666'
  },
  {
    id: 'STF-04',
    name: 'Van B',
    role: 'Waiter',
    department: 'FOH',
    shift: 'Evening (17:00 - 23:00)',
    status: 'On Duty',
    checkInTime: '17:02 (GPS Verified)',
    tablesHandled: 5,
    rating: 4.6,
    avatar: '👨‍💼',
    phone: '0905777888'
  },
  {
    id: 'STF-05',
    name: 'Quoc Anh Nguyen',
    role: 'Line Cook (Grill)',
    department: 'BOH',
    shift: 'Evening (16:30 - 23:00)',
    status: 'On Duty',
    checkInTime: '16:25 (Wi-Fi Verified)',
    ordersCooked: 28,
    rating: 4.7,
    avatar: '👨‍🍳',
    phone: '0905222333'
  },
  {
    id: 'STF-06',
    name: 'Thao Vy Pham',
    role: 'Bartender',
    department: 'FOH',
    shift: 'Evening (17:00 - 23:00)',
    status: 'On Break',
    checkInTime: '16:58 (GPS Verified)',
    drinksPrepared: 34,
    rating: 4.9,
    avatar: '👩‍🍳',
    phone: '0905666777'
  },
  {
    id: 'STF-07',
    name: 'Duc Long Tran',
    role: 'Busser / Runner',
    department: 'FOH',
    shift: 'Evening (17:30 - 23:00)',
    status: 'On Duty',
    checkInTime: '17:25 (GPS Verified)',
    tablesCleaned: 14,
    rating: 4.7,
    avatar: '👨‍💼',
    phone: '0905888999'
  },
  {
    id: 'STF-08',
    name: 'Huong Giang Le',
    role: 'Host / Reception',
    department: 'FOH',
    shift: 'Evening (17:00 - 22:30)',
    status: 'On Duty',
    checkInTime: '16:48 (GPS Verified)',
    guestsGreeted: 86,
    rating: 5.0,
    avatar: '👩‍💼',
    phone: '0905444555'
  },
  {
    id: 'STF-09',
    name: 'Hoang Nam Vu',
    role: 'Prep Cook',
    department: 'BOH',
    shift: 'Morning (08:00 - 16:00)',
    status: 'Off Duty',
    checkInTime: 'Morning Shift Completed',
    ordersCooked: 35,
    rating: 4.8,
    avatar: '👨‍🍳',
    phone: '0905333111'
  },
  {
    id: 'STF-10',
    name: 'Bao Tram Do',
    role: 'Cashier',
    department: 'FOH',
    shift: 'Morning (08:00 - 16:30)',
    status: 'Off Duty',
    checkInTime: 'Morning Shift Completed',
    billsSettled: 32,
    rating: 4.9,
    avatar: '👩‍💼',
    phone: '0905999000'
  }
];

// Administrator Staff Accounts & RBAC (SCR-ADM-01 & Journey 7 Steps 1-3)
export const MOCK_STAFF_ACCOUNTS = [
  { id: 'USR-01', name: 'Minh Tuan Tran', role: 'Waiter', contact: '0905111222', status: 'Active', tokenVersion: 1 },
  { id: 'USR-02', name: 'Chef Hung', role: 'Kitchen', contact: '0905333444', status: 'Active', tokenVersion: 1 },
  { id: 'USR-03', name: 'Mai Le', role: 'Cashier', contact: '0905555666', status: 'Active', tokenVersion: 2 },
  { id: 'USR-04', name: 'Van B', role: 'Waiter', contact: '0905777888', status: 'SUSPENDED', tokenVersion: 3 }
];

// Administrator Immutable Audit Logs (SCR-ADM-02 & Journey 7 Step 4)
export const MOCK_AUDIT_LOGS = [
  { id: 'LOG-101', timestamp: '2026-09-20 19:48:12', actorId: 'MGR-NAM-01', actionCategory: 'BILL_VOID', clientIp: '192.168.1.45', details: 'Voided Dish #104 on Table 08' },
  { id: 'LOG-102', timestamp: '2026-09-20 19:30:05', actorId: 'CHEF-HUNG-01', actionCategory: 'MENU_86_TOGGLE', clientIp: '192.168.1.80', details: 'Set Salmon Sashimi: 86 (Out of Stock)' },
  { id: 'LOG-103', timestamp: '2026-09-20 18:15:22', actorId: 'ADM-KHOA-01', actionCategory: 'USER_SUSPENDED', clientIp: '192.168.1.10', details: 'Suspended Staff ID: USR-04 (Van B)' }
];
