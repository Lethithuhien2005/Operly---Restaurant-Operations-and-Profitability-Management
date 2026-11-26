/**
 * ==============================================================================
 * OPERLY — 60-DAY REVENUE ANALYTICS SEED SCRIPT (ANALYTICS-ONLY HARDENED)
 * ==============================================================================
 * Purpose: Standalone, idempotent historical transaction data generator for
 *          Revenue Analysis (daily/weekly/monthly trends, KPIs, promotions,
 *          refunds, payment channels).
 *
 * Safety & Data Integrity Guarantees:
 *  - Strict 6-Entity Idempotency: Complete consistency audit for DiningSession,
 *    Order, OrderItem, Bill, Payment, and Refund. Aborts with descriptive error
 *    on any field mismatch, foreign key discrepancy, or child incompleteness.
 *  - Dynamic Refund Calculation: Full refunds match payment netPaid exactly.
 *    Partial refunds are strictly less than netPaid.
 *  - Explicit Cumulative Refund Protection: Validates remaining refundable
 *    balance before refund creation, preventing total refunds from exceeding net paid.
 *  - Real Promotion Business Rules: Validates WELCOME10, LUNCHSPECIAL, VIPDINING15
 *    against database configuration and calculates discounts identically to BillingService.
 *  - Exact Semantic Fidelity: Order totalAmount includes all ordered items;
 *    Bill subtotalAmount excludes kitchen-rejected items.
 *  - Non-destructive: Does NOT alter, truncate, reset, or overwrite existing
 *    operational records or primary seed data.
 *  - Atomic Per-Day Transactions: Each day's batch is wrapped in prisma.$transaction().
 *
 * Reference Window: 2026-09-26 through 2026-11-24 inclusive (60 calendar days).
 * ==============================================================================
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient, Promotion } from '../generated/prisma/client.js';
import {
  BillStatus,
  OrderItemStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  RoleName,
  SessionStatus,
} from '../generated/prisma/enums.js';
import { createHash } from 'node:crypto';

// ------------------------------------------------------------------------------
// 1. STANDARDS-COMPLIANT RFC 4122 UUID v5 IMPLEMENTATION
// ------------------------------------------------------------------------------
const OPERLY_ANALYTICS_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // Fixed DNS namespace

function parseUuidToBytes(uuid: string): Buffer {
  const hex = uuid.replace(/-/g, '');
  return Buffer.from(hex, 'hex');
}

/**
 * Generates an RFC 4122 Section 4.3 compliant UUID v5 using SHA-1 over namespace + name.
 */
export function generateUuidV5(name: string, namespace: string = OPERLY_ANALYTICS_NAMESPACE): string {
  const nsBytes = parseUuidToBytes(namespace);
  const nameBytes = Buffer.from(name, 'utf8');

  // SHA-1 digest as mandated by RFC 4122 for Version 5 UUIDs
  const hash = createHash('sha1')
    .update(Buffer.concat([nsBytes, nameBytes]))
    .digest();

  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // Version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant RFC 4122

  const hex = bytes.toString('hex');
  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32),
  ].join('-');
}

// ------------------------------------------------------------------------------
// 2. PRISMA CLIENT & ADAPTER INITIALIZATION
// ------------------------------------------------------------------------------
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not configured in environment variables');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ------------------------------------------------------------------------------
// 3. TYPES & DATA SPECIFICATION
// ------------------------------------------------------------------------------
export type SessionCategory =
  | 'STANDARD_SETTLED'     // 105 sessions
  | 'PROMO_SETTLED'        // 40 sessions
  | 'PARTIAL_REFUND'       // 3 sessions
  | 'FULL_REFUND'          // 2 sessions
  | 'CANCELLED'            // 4 sessions
  | 'VOIDED'               // 3 sessions
  | 'UNPAID_OPEN';         // 3 sessions

export interface SessionSpec {
  dayIndex: number; // 0 to 59
  sessionSeq: number; // 1, 2, ...
  category: SessionCategory;
  tableNumber: string;
  hour: number;
  minute: number;
  customerCount: number;
  promoCode?: 'WELCOME10' | 'LUNCHSPECIAL' | 'VIPDINING15';
  paymentMethod?: PaymentMethod;
  hasRejectedItem?: boolean;
  hasExtraPrawnsForRefund?: boolean; // Specific for Day 28 partial refund
  partialRefundItemName?: string;    // Dish being refunded
  refundReason?: string;
}

// ------------------------------------------------------------------------------
// 4. PROMOTION BUSINESS RULES & VALIDATION (MATCHING BillingService)
// ------------------------------------------------------------------------------
export function validatePromotionsConfiguration(
  promotions: Promotion[],
  windowStart: Date,
  windowEnd: Date,
): Map<string, Promotion> {
  const requiredCodes = ['WELCOME10', 'LUNCHSPECIAL', 'VIPDINING15'];
  const promoMap = new Map(promotions.map((p) => [p.code, p]));

  for (const code of requiredCodes) {
    const promo = promoMap.get(code);
    if (!promo) {
      throw new Error(
        `Promotion Validation Error: Required promotion voucher "${code}" was not found in the database. Please run primary seed first.`,
      );
    }
    if (!promo.isActive) {
      throw new Error(
        `Promotion Validation Error: Promotion voucher "${code}" is marked inactive in the database.`,
      );
    }
    if (promo.startDate > windowStart || promo.endDate < windowEnd) {
      throw new Error(
        `Promotion Validation Error: Promotion "${code}" validity window [${promo.startDate.toISOString()} - ${promo.endDate.toISOString()}] does not cover the 60-day analytics window [${windowStart.toISOString()} - ${windowEnd.toISOString()}].`,
      );
    }

    // Validate specific expected business rules from billing service
    if (code === 'WELCOME10') {
      if (Number(promo.discountPercent) !== 10 || Number(promo.maxDiscount) !== 50000 || Number(promo.minOrderAmount) !== 200000) {
        throw new Error(`Promotion Configuration Error: WELCOME10 attributes do not match expected rules (10%, max 50k, min 200k).`);
      }
    } else if (code === 'LUNCHSPECIAL') {
      if (Number(promo.discountAmount) !== 30000 || Number(promo.minOrderAmount) !== 150000) {
        throw new Error(`Promotion Configuration Error: LUNCHSPECIAL attributes do not match expected rules (fixed 30k, min 150k).`);
      }
    } else if (code === 'VIPDINING15') {
      if (Number(promo.discountPercent) !== 15 || Number(promo.maxDiscount) !== 150000 || Number(promo.minOrderAmount) !== 1000000) {
        throw new Error(`Promotion Configuration Error: VIPDINING15 attributes do not match expected rules (15%, max 150k, min 1,000k).`);
      }
    }
  }

  return promoMap;
}

/**
 * Calculates discount identical to BillingService.createBill()
 */
export function calculatePromotionDiscount(
  promo: Promotion,
  subtotal: number,
  billDate: Date,
): number {
  if (billDate < promo.startDate || billDate > promo.endDate) {
    throw new Error(`Promotion "${promo.code}" is expired or not yet valid for bill date ${billDate.toISOString()}`);
  }

  if (promo.minOrderAmount && subtotal < Number(promo.minOrderAmount)) {
    throw new Error(
      `Subtotal (${subtotal.toLocaleString()} VND) does not meet minimum order requirement of ${Number(promo.minOrderAmount).toLocaleString()} VND for promotion "${promo.code}"`,
    );
  }

  let discountAmount = 0;
  if (promo.discountPercent) {
    discountAmount = subtotal * (Number(promo.discountPercent) / 100);
    if (promo.maxDiscount) {
      discountAmount = Math.min(discountAmount, Number(promo.maxDiscount));
    }
  } else if (promo.discountAmount) {
    discountAmount = Math.min(Number(promo.discountAmount), subtotal);
  }

  return discountAmount;
}

// ------------------------------------------------------------------------------
// 5. DETERMINISTIC 60-DAY SCHEDULE BUILDER (EXACTLY 160 SESSIONS)
// ------------------------------------------------------------------------------
export function build60DaySchedule(): SessionSpec[] {
  const schedule: SessionSpec[] = [];

  // Table assignment cycle: 1 through 10
  const tablesPool = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  let tableIdx = 0;
  const nextTable = () => {
    const t = tablesPool[tableIdx % tablesPool.length];
    tableIdx++;
    return t;
  };

  // Payment method cycle across all 150 payments (52 Cash, 52 Bank, 27 VNPay, 19 MoMo)
  // The 5 refund sessions have pre-allocated methods:
  // - 1 Cash (Day 43 full refund)
  // - 2 Bank Transfer (Day 16 full refund, Day 28 partial refund)
  // - 1 VNPay (Day 11 partial refund)
  // - 1 MoMo (Day 51 partial refund)
  // Therefore, the 145 standard & promo sessions require:
  // 51 Cash, 50 Bank, 26 VNPay, 18 MoMo.
  let cashCount = 0;
  let bankCount = 0;
  let vnpayCount = 0;
  let momoCount = 0;

  const nextPaymentMethod = (): PaymentMethod => {
    if (cashCount < 51 && (cashCount <= bankCount || bankCount >= 50)) {
      cashCount++;
      return PaymentMethod.CASH;
    }
    if (bankCount < 50) {
      bankCount++;
      return PaymentMethod.BANK_TRANSFER;
    }
    if (vnpayCount < 26) {
      vnpayCount++;
      return PaymentMethod.VNPAY;
    }
    momoCount++;
    return PaymentMethod.MOMO;
  };

  // Promotion cycle (Total 40: exactly 18 WELCOME10, 16 LUNCHSPECIAL, 6 VIPDINING15)
  let welcomeCount = 0;
  let lunchCount = 0;
  let vipCount = 0;

  const nextPromo = (isVip: boolean): 'WELCOME10' | 'LUNCHSPECIAL' | 'VIPDINING15' => {
    if (isVip && vipCount < 6) {
      vipCount++;
      return 'VIPDINING15';
    }
    if (lunchCount < 16 && (lunchCount <= welcomeCount || welcomeCount >= 18)) {
      lunchCount++;
      return 'LUNCHSPECIAL';
    }
    if (welcomeCount < 18) {
      welcomeCount++;
      return 'WELCOME10';
    }
    if (lunchCount < 16) {
      lunchCount++;
      return 'LUNCHSPECIAL';
    }
    if (vipCount < 6) {
      vipCount++;
      return 'VIPDINING15';
    }
    throw new Error('Promotion distribution quota exceeded');
  };

  // Days with rejected items (6 distinct days):
  const rejectedItemDays = new Set([7, 14, 23, 32, 41, 50]);

  // Days with deep cleaning (zero sessions):
  const zeroSessionDays = new Set([9, 37]); // Day 9 (2026-10-05), Day 37 (2026-11-02)

  // Track session category allocations
  let standardCount = 0;
  let promoCount = 0;

  for (let day = 0; day < 60; day++) {
    if (zeroSessionDays.has(day)) {
      continue; // Restaurant closed for maintenance
    }

    // Determine day volume
    let dailySessions = 2; // Default weekday: 2 sessions
    const dayOfWeek = (day + 5) % 7; // Day 0 is 2026-09-26 (Saturday = 5)
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;

    if (isWeekend) {
      dailySessions = 4; // Friday/Saturday/Sunday peak
    }

    // Specific peak festival/banquet overrides:
    if (day === 24) dailySessions = 7; // 2026-10-20 (Vietnamese Women's Day)
    if (day === 35) dailySessions = 6; // 2026-10-31 (Halloween banquet weekend)
    if (day === 18) dailySessions = 1; // 2026-10-14 (Severe rainstorm lull)
    if (day === 45) dailySessions = 1; // 2026-11-10 (Cold rainy weather lull)

    for (let seq = 1; seq <= dailySessions; seq++) {
      // 1. CANCELLED Sessions (4 total: day 6, 22, 39, 56)
      if (day === 6 && seq === 2) {
        schedule.push({
          dayIndex: day,
          sessionSeq: seq,
          category: 'CANCELLED',
          tableNumber: nextTable(),
          hour: 12,
          minute: 30,
          customerCount: 2,
        });
        continue;
      }
      if (day === 22 && seq === 4) {
        schedule.push({
          dayIndex: day,
          sessionSeq: seq,
          category: 'CANCELLED',
          tableNumber: nextTable(),
          hour: 19,
          minute: 15,
          customerCount: 4,
        });
        continue;
      }
      if (day === 39 && seq === 2) {
        schedule.push({
          dayIndex: day,
          sessionSeq: seq,
          category: 'CANCELLED',
          tableNumber: nextTable(),
          hour: 13,
          minute: 0,
          customerCount: 3,
        });
        continue;
      }
      if (day === 56 && seq === 3) {
        schedule.push({
          dayIndex: day,
          sessionSeq: seq,
          category: 'CANCELLED',
          tableNumber: nextTable(),
          hour: 18,
          minute: 45,
          customerCount: 2,
        });
        continue;
      }

      // 2. VOIDED Invoices (3 total: day 3, 18, 46)
      if (day === 3 && seq === 1) {
        schedule.push({
          dayIndex: day,
          sessionSeq: seq,
          category: 'VOIDED',
          tableNumber: nextTable(),
          hour: 11,
          minute: 45,
          customerCount: 2,
        });
        continue;
      }
      if (day === 18 && seq === 1) {
        schedule.push({
          dayIndex: day,
          sessionSeq: seq,
          category: 'VOIDED',
          tableNumber: nextTable(),
          hour: 12,
          minute: 15,
          customerCount: 3,
        });
        continue;
      }
      if (day === 46 && seq === 1) {
        schedule.push({
          dayIndex: day,
          sessionSeq: seq,
          category: 'VOIDED',
          tableNumber: nextTable(),
          hour: 13,
          minute: 10,
          customerCount: 2,
        });
        continue;
      }

      // 3. UNPAID Open Sessions (3 total on final days 57, 58, 59)
      if (day === 57 && seq === 4) {
        schedule.push({
          dayIndex: day,
          sessionSeq: seq,
          category: 'UNPAID_OPEN',
          tableNumber: nextTable(),
          hour: 20,
          minute: 0,
          customerCount: 4,
        });
        continue;
      }
      if (day === 58 && seq === 2) {
        schedule.push({
          dayIndex: day,
          sessionSeq: seq,
          category: 'UNPAID_OPEN',
          tableNumber: nextTable(),
          hour: 19,
          minute: 30,
          customerCount: 2,
        });
        continue;
      }
      if (day === 59 && seq === 2) {
        schedule.push({
          dayIndex: day,
          sessionSeq: seq,
          category: 'UNPAID_OPEN',
          tableNumber: nextTable(),
          hour: 12,
          minute: 45,
          customerCount: 3,
        });
        continue;
      }

      // 4. FULL REFUND Sessions (2 total: day 16, 43)
      if (day === 16 && seq === 1) {
        schedule.push({
          dayIndex: day,
          sessionSeq: seq,
          category: 'FULL_REFUND',
          tableNumber: '5',
          hour: 12,
          minute: 0,
          customerCount: 4,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          refundReason: 'REF-ANL-20261012-001: Food quality complaint on family dining; manager approved full refund',
        });
        continue;
      }
      if (day === 43 && seq === 3) {
        schedule.push({
          dayIndex: day,
          sessionSeq: seq,
          category: 'FULL_REFUND',
          tableNumber: '3',
          hour: 18,
          minute: 30,
          customerCount: 3,
          paymentMethod: PaymentMethod.CASH,
          refundReason: 'REF-ANL-20261108-001: Table order mix-up settlement cancellation; cashier cash refund',
        });
        continue;
      }

      // 5. PARTIAL REFUND Sessions (3 total: day 11, 28, 51)
      if (day === 11 && seq === 1) {
        schedule.push({
          dayIndex: day,
          sessionSeq: seq,
          category: 'PARTIAL_REFUND',
          tableNumber: '2',
          hour: 12,
          minute: 15,
          customerCount: 2,
          paymentMethod: PaymentMethod.VNPAY,
          partialRefundItemName: 'Crispy Vietnamese Spring Rolls (Nem Ran)',
          refundReason: 'REF-ANL-20261007-001: Spring rolls returned before cooking; partial refund issued',
        });
        continue;
      }
      if (day === 28 && seq === 2) {
        schedule.push({
          dayIndex: day,
          sessionSeq: seq,
          category: 'PARTIAL_REFUND',
          tableNumber: '6',
          hour: 19,
          minute: 0,
          customerCount: 4,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          hasExtraPrawnsForRefund: true,
          partialRefundItemName: 'Garlic Butter Tiger Prawns (Tom Sot Bo Toi)',
          refundReason: 'REF-ANL-20261024-001: Tiger prawns rejected due to allergy notice; partial refund approved',
        });
        continue;
      }
      if (day === 51 && seq === 1) {
        schedule.push({
          dayIndex: day,
          sessionSeq: seq,
          category: 'PARTIAL_REFUND',
          tableNumber: '4',
          hour: 13,
          minute: 0,
          customerCount: 2,
          paymentMethod: PaymentMethod.MOMO,
          partialRefundItemName: 'Vietnamese Iced Coffee with Condensed Milk (Ca Phe Sua Da)',
          refundReason: 'REF-ANL-20261116-001: Spilled beverage voucher compensation credit; partial refund approved',
        });
        continue;
      }

      // 6. PROMO SETTLED Sessions (40 total)
      const shouldPromo = promoCount < 40 && (promoCount * 2.6 < standardCount || standardCount >= 105);
      if (shouldPromo) {
        const isVipBanqueting = (day === 24 || day === 35) && seq >= 3;
        schedule.push({
          dayIndex: day,
          sessionSeq: seq,
          category: 'PROMO_SETTLED',
          tableNumber: isVipBanqueting ? '10' : nextTable(),
          hour: 18 + (seq % 3),
          minute: 15 * (seq % 4),
          customerCount: isVipBanqueting ? 8 : 3,
          promoCode: nextPromo(isVipBanqueting),
          paymentMethod: nextPaymentMethod(),
          hasRejectedItem: rejectedItemDays.has(day) && seq === 1,
        });
        promoCount++;
        continue;
      }

      // 7. STANDARD SETTLED Sessions (105 total)
      if (standardCount < 105) {
        schedule.push({
          dayIndex: day,
          sessionSeq: seq,
          category: 'STANDARD_SETTLED',
          tableNumber: nextTable(),
          hour: seq % 2 === 0 ? 19 : 12,
          minute: 10 * (seq % 6),
          customerCount: (seq % 3) + 2,
          paymentMethod: nextPaymentMethod(),
          hasRejectedItem: rejectedItemDays.has(day) && seq === 1,
        });
        standardCount++;
        continue;
      }
    }
  }

  // Strict Assertions on Schedule Counts
  if (schedule.length !== 160) {
    throw new Error(`Schedule builder generated ${schedule.length} sessions, expected exactly 160.`);
  }
  if (welcomeCount !== 18 || lunchCount !== 16 || vipCount !== 6 || promoCount !== 40) {
    throw new Error(`Promotion distribution mismatch: WELCOME10=${welcomeCount}/18, LUNCHSPECIAL=${lunchCount}/16, VIPDINING15=${vipCount}/6, total=${promoCount}/40`);
  }
  const actualCash = schedule.filter((s) => s.paymentMethod === PaymentMethod.CASH).length;
  const actualBank = schedule.filter((s) => s.paymentMethod === PaymentMethod.BANK_TRANSFER).length;
  const actualVnPay = schedule.filter((s) => s.paymentMethod === PaymentMethod.VNPAY).length;
  const actualMoMo = schedule.filter((s) => s.paymentMethod === PaymentMethod.MOMO).length;

  if (actualCash !== 52 || actualBank !== 52 || actualVnPay !== 27 || actualMoMo !== 19) {
    throw new Error(
      `Payment method distribution mismatch: CASH=${actualCash}/52, BANK=${actualBank}/52, VNPAY=${actualVnPay}/27, MOMO=${actualMoMo}/19`,
    );
  }

  const actualRejected = schedule.filter((s) => s.hasRejectedItem).length;
  if (actualRejected !== 6) {
    throw new Error(`Schedule builder generated ${actualRejected} rejected items, expected exactly 6.`);
  }

  return schedule;
}

// ------------------------------------------------------------------------------
// 6. MAIN SEED EXECUTION ROUTINE
// ------------------------------------------------------------------------------
async function runAnalyticsSeed() {
  console.log('==============================================================================');
  console.log('🚀 OPERLY 60-DAY REVENUE ANALYTICS SEED SCRIPT (WITH FULL CONSISTENCY AUDIT)');
  console.log('==============================================================================\n');

  // Step 6.1: Validate Foundational Primary Seed Records
  console.log('📦 Step 1/3: Verifying existing database foundation & promotions...');

  const waiter = await prisma.user.findFirst({
    where: { role: { name: RoleName.WAITER } },
  });
  const cashier = await prisma.user.findFirst({
    where: { role: { name: RoleName.CASHIER } },
  });
  const manager = await prisma.user.findFirst({
    where: { role: { name: RoleName.MANAGER } },
  });

  if (!waiter || !cashier || !manager) {
    throw new Error(
      'Required staff accounts (Waiter, Cashier, Manager) not found. Please run "npm run seed" first.',
    );
  }

  const tables = await prisma.table.findMany();
  if (tables.length === 0) {
    throw new Error('No dining tables found. Please run "npm run seed" first.');
  }
  const tableMap = new Map(tables.map((t) => [t.tableNumber, t.id]));

  const menuItems = await prisma.menuItem.findMany();
  if (menuItems.length === 0) {
    throw new Error('No menu items found. Please run "npm run seed" first.');
  }
  const dishMap = new Map(menuItems.map((d) => [d.name, d]));

  // Reference dates: 2026-09-26 (Day 0) to 2026-11-24 (Day 59)
  const baseStartDate = new Date(Date.UTC(2026, 8, 26, 0, 0, 0));
  const baseEndDate = new Date(Date.UTC(2026, 10, 24, 23, 59, 59));

  // Strict Promotion Validation against actual Billing Service rules
  const requiredPromoCodes = ['WELCOME10', 'LUNCHSPECIAL', 'VIPDINING15'];
  const promotions = await prisma.promotion.findMany({
    where: { code: { in: requiredPromoCodes } },
  });

  const promoMap = validatePromotionsConfiguration(promotions, baseStartDate, baseEndDate);

  console.log(`   ✓ Staff verified (Waiter: ${waiter.fullName}, Cashier: ${cashier.fullName}, Manager: ${manager.fullName})`);
  console.log(`   ✓ ${tables.length} Tables, ${menuItems.length} Menu Items loaded.`);
  console.log(`   ✓ Required promotions verified against business rules: ${requiredPromoCodes.join(', ')}.`);

  // Step 6.2: Build 60-Day Discrete Schedule
  console.log('\n📦 Step 2/3: Constructing 60-day non-smooth transaction schedule...');
  const schedule = build60DaySchedule();

  // Group schedule by DayIndex (0..59)
  const dayGroups = new Map<number, SessionSpec[]>();
  for (const item of schedule) {
    const list = dayGroups.get(item.dayIndex) || [];
    list.push(item);
    dayGroups.set(item.dayIndex, list);
  }

  // Step 6.3: Process Each Day Atomically inside prisma.$transaction()
  console.log('📦 Step 3/3: Executing idempotent transaction insertion with 6-entity verification...');

  let totalSessionsCreated = 0;
  let totalOrdersCreated = 0;
  let totalOrderItemsCreated = 0;
  let totalBillsCreated = 0;
  let totalPaymentsCreated = 0;
  let totalRefundsCreated = 0;
  let consistentSessionsSkipped = 0;

  // Dish menu pool for deterministic order items composition
  const dishPho = dishMap.get('Special Traditional Beef Pho (Pho Bo Dac Biet)')!;
  const dishSpringRoll = dishMap.get('Crispy Vietnamese Spring Rolls (Nem Ran)')!;
  const dishBunCha = dishMap.get('Hanoi Grilled Pork with Vermicelli (Bun Cha Ha Noi)')!;
  const dishCoffee = dishMap.get('Vietnamese Iced Coffee with Condensed Milk (Ca Phe Sua Da)')!;
  const dishRice = dishMap.get('Steamed Fragrant Jasmine Rice (Com Trang)')!;
  const dishMorningGlory = dishMap.get('Morning Glory Stir-fried with Garlic (Rau Muong Xao Toi)')!;
  const dishPorkBelly = dishMap.get('Caramelized Pork Belly in Claypot (Thit Kho To)')!;
  const dishTigerPrawns = dishMap.get('Garlic Butter Tiger Prawns (Tom Sot Bo Toi)')!;
  const dishFlan = dishMap.get('Vietnamese Caramel Flan (Banh Flan)')!;
  const dishPapayaSalad = dishMap.get('Fresh Green Papaya Salad with Prawns (Goi Du Du Tom)')!;
  const dishLimeJuice = dishMap.get('Fresh Lime Juice with Mint (Nuoc Chanh Tuoi)')!;

  for (let day = 0; day < 60; day++) {
    const daySessions = dayGroups.get(day);
    if (!daySessions || daySessions.length === 0) {
      continue;
    }

    const currentCalendarDate = new Date(baseStartDate.getTime() + day * 86400 * 1000);
    const dateStr = currentCalendarDate.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const isoDateLabel = currentCalendarDate.toISOString().slice(0, 10);

    // Atomic transaction for this single calendar day
    await prisma.$transaction(async (tx) => {
      for (const spec of daySessions) {
        const seqStr = String(spec.sessionSeq).padStart(3, '0');
        const sessionCode = `SESS-ANL-${dateStr}-${seqStr}`;
        const sessionId = generateUuidV5(`session:${sessionCode}`);

        const sessionStartTime = new Date(currentCalendarDate);
        sessionStartTime.setUTCHours(spec.hour, spec.minute, 0, 0);

        const sessionEndTime = new Date(sessionStartTime.getTime() + 5400 * 1000); // 90 min duration

        const tableId = tableMap.get(spec.tableNumber) || tables[0].id;

        // Determine session status
        let sessionStatus: SessionStatus = SessionStatus.CLOSED;
        if (spec.category === 'CANCELLED') sessionStatus = SessionStatus.CANCELLED;
        if (spec.category === 'UNPAID_OPEN') sessionStatus = SessionStatus.OPEN;

        // ----------------------------------------------------------------------
        // Entity 1: DiningSession Idempotency & Consistency Check
        // ----------------------------------------------------------------------
        const existingSession = await tx.diningSession.findFirst({
          where: { OR: [{ id: sessionId }, { sessionCode }] },
        });

        if (existingSession) {
          // Ownership verification: must have -ANL- marker
          if (!existingSession.sessionCode.startsWith('SESS-ANL-')) {
            throw new Error(`Data Safety Error: Identifier collision on non-analytics session code "${existingSession.sessionCode}"`);
          }
          // ID and Code bijection check
          if (existingSession.id !== sessionId || existingSession.sessionCode !== sessionCode) {
            throw new Error(`Data Safety Error: DiningSession ID/Code mismatch for "${sessionCode}" (id: ${existingSession.id})`);
          }
          // Field consistency verification
          const expectedClosedById = sessionStatus === SessionStatus.CLOSED ? cashier.id : null;
          const timeMatch = Math.abs(existingSession.startTime.getTime() - sessionStartTime.getTime()) < 1000;
          const endTimeMatch = sessionStatus === SessionStatus.CLOSED
            ? (existingSession.endTime && Math.abs(existingSession.endTime.getTime() - sessionEndTime.getTime()) < 1000)
            : (existingSession.endTime === null);

          if (
            existingSession.tableId !== tableId ||
            existingSession.openedById !== waiter.id ||
            existingSession.closedById !== expectedClosedById ||
            existingSession.status !== sessionStatus ||
            existingSession.customerCount !== spec.customerCount ||
            !timeMatch ||
            !endTimeMatch
          ) {
            throw new Error(`Data Consistency Error: Existing DiningSession "${sessionCode}" has conflicting attributes.`);
          }
        } else {
          await tx.diningSession.create({
            data: {
              id: sessionId,
              sessionCode,
              tableId,
              openedById: waiter.id,
              closedById: sessionStatus === SessionStatus.CLOSED ? cashier.id : null,
              customerCount: spec.customerCount,
              status: sessionStatus,
              startTime: sessionStartTime,
              endTime: sessionStatus === SessionStatus.CLOSED ? sessionEndTime : null,
            },
          });
          totalSessionsCreated++;
        }

        // ----------------------------------------------------------------------
        // Entity 2 & 3: Order and OrderItems Construction
        // ----------------------------------------------------------------------
        const orderCode = `ORD-ANL-${dateStr}-${seqStr}`;
        const orderId = generateUuidV5(`order:${orderCode}`);

        let orderStatus: OrderStatus = OrderStatus.COMPLETED;
        if (spec.category === 'CANCELLED') orderStatus = OrderStatus.CANCELLED;
        if (spec.category === 'UNPAID_OPEN') orderStatus = OrderStatus.SERVED;

        interface ItemDef {
          dish: typeof dishPho;
          quantity: number;
          rejected?: boolean;
        }

        const itemsToCreate: ItemDef[] = [];

        if (spec.promoCode === 'VIPDINING15') {
          itemsToCreate.push({ dish: dishTigerPrawns, quantity: 3 });
          itemsToCreate.push({ dish: dishPho, quantity: 4 });
          itemsToCreate.push({ dish: dishPorkBelly, quantity: 2 });
          itemsToCreate.push({ dish: dishSpringRoll, quantity: 4 });
          itemsToCreate.push({ dish: dishMorningGlory, quantity: 3 });
          itemsToCreate.push({ dish: dishRice, quantity: 6 });
          itemsToCreate.push({ dish: dishCoffee, quantity: 5 });
          itemsToCreate.push({ dish: dishFlan, quantity: 4 });
        } else if (spec.customerCount >= 4) {
          itemsToCreate.push({ dish: dishPho, quantity: 2 });
          itemsToCreate.push({ dish: dishBunCha, quantity: 2 });
          itemsToCreate.push({ dish: dishSpringRoll, quantity: 2 });
          itemsToCreate.push({ dish: dishMorningGlory, quantity: 1 });
          itemsToCreate.push({ dish: dishRice, quantity: 2 });
          itemsToCreate.push({ dish: dishCoffee, quantity: 2 });
          itemsToCreate.push({ dish: dishLimeJuice, quantity: 2 });
          if (spec.hasExtraPrawnsForRefund) {
            itemsToCreate.push({ dish: dishTigerPrawns, quantity: 1 });
          }
        } else {
          itemsToCreate.push({ dish: dishPho, quantity: 1 });
          itemsToCreate.push({ dish: dishBunCha, quantity: 1 });
          itemsToCreate.push({ dish: dishSpringRoll, quantity: 1 });
          itemsToCreate.push({ dish: dishCoffee, quantity: 2 });
        }

        if (spec.hasRejectedItem) {
          itemsToCreate.push({
            dish: dishTigerPrawns,
            quantity: 1,
            rejected: true,
          });
        }

        // Semantic Rule (Section 6):
        // orderTotalAmount includes all items (OrdersService line 107-116)
        // billSubtotalAmount excludes rejected items (BillingService line 38-40)
        let orderTotalAmount = 0;
        let billSubtotalAmount = 0;

        const orderItemEntities = itemsToCreate.map((item, idx) => {
          const itemKey = `order_item:${orderCode}:${idx}:${item.dish.id}`;
          const itemId = generateUuidV5(itemKey);
          const linePrice = Number(item.dish.price);
          const lineCost = Number(item.dish.costPrice || 0);
          const lineTotal = linePrice * item.quantity;

          orderTotalAmount += lineTotal;
          if (!item.rejected) {
            billSubtotalAmount += lineTotal;
          }

          return {
            id: itemId,
            orderId,
            menuItemId: item.dish.id,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(linePrice),
            costPrice: new Prisma.Decimal(lineCost),
            itemStatus: item.rejected ? OrderItemStatus.REJECTED : OrderItemStatus.SERVED,
            rejectionReason: item.rejected
              ? 'Kitchen 86 out of stock - ingredients depleted'
              : null,
            createdAt: sessionStartTime,
            updatedAt: sessionStartTime,
          };
        });

        // Order Idempotency & Consistency Check
        const existingOrder = await tx.order.findFirst({
          where: { OR: [{ id: orderId }, { orderCode }] },
        });

        if (existingOrder) {
          if (!existingOrder.orderCode.startsWith('ORD-ANL-')) {
            throw new Error(`Data Safety Error: Identifier collision on non-analytics order code "${existingOrder.orderCode}"`);
          }
          if (existingOrder.id !== orderId || existingOrder.orderCode !== orderCode) {
            throw new Error(`Data Safety Error: Order ID/Code mismatch for "${orderCode}" (id: ${existingOrder.id})`);
          }
          if (
            existingOrder.sessionId !== sessionId ||
            existingOrder.waiterId !== waiter.id ||
            existingOrder.status !== orderStatus ||
            Number(existingOrder.totalAmount) !== orderTotalAmount ||
            Math.abs(existingOrder.createdAt.getTime() - sessionStartTime.getTime()) >= 1000
          ) {
            throw new Error(`Data Consistency Error: Existing Order "${orderCode}" has conflicting attributes.`);
          }
        } else {
          await tx.order.create({
            data: {
              id: orderId,
              orderCode,
              sessionId,
              waiterId: waiter.id,
              status: orderStatus,
              totalAmount: new Prisma.Decimal(orderTotalAmount),
              createdAt: sessionStartTime,
              updatedAt: sessionStartTime,
            },
          });
          totalOrdersCreated++;
        }

        // OrderItems Complete Set & Consistency Check
        const existingOrderItems = await tx.orderItem.findMany({
          where: { orderId },
        });

        if (existingOrderItems.length > 0) {
          // Check child record completeness: a partially populated order must abort
          if (existingOrderItems.length !== orderItemEntities.length) {
            throw new Error(
              `Data Consistency Error: Order "${orderCode}" has ${existingOrderItems.length} items but expects ${orderItemEntities.length}. Partially populated order detected.`,
            );
          }

          const existingItemsById = new Map(existingOrderItems.map((it) => [it.id, it]));

          for (const expectedItem of orderItemEntities) {
            const matchedItem = existingItemsById.get(expectedItem.id);
            if (!matchedItem) {
              throw new Error(`Data Consistency Error: OrderItem "${expectedItem.id}" missing from Order "${orderCode}".`);
            }
            if (
              matchedItem.orderId !== orderId ||
              matchedItem.menuItemId !== expectedItem.menuItemId ||
              matchedItem.quantity !== expectedItem.quantity ||
              Number(matchedItem.unitPrice) !== Number(expectedItem.unitPrice) ||
              Number(matchedItem.costPrice) !== Number(expectedItem.costPrice) ||
              matchedItem.itemStatus !== expectedItem.itemStatus ||
              matchedItem.rejectionReason !== expectedItem.rejectionReason
            ) {
              throw new Error(`Data Consistency Error: Existing OrderItem "${expectedItem.id}" has conflicting attributes.`);
            }
          }
        } else {
          for (const itemEntity of orderItemEntities) {
            await tx.orderItem.create({
              data: itemEntity,
            });
            totalOrderItemsCreated++;
          }
        }

        // If session was CANCELLED, no bill was created
        if (spec.category === 'CANCELLED') {
          continue;
        }

        // ----------------------------------------------------------------------
        // Entity 4: Bill Construction, Idempotency & Consistency Check
        // ----------------------------------------------------------------------
        const billCode = `BILL-ANL-${dateStr}-${seqStr}`;
        const billId = generateUuidV5(`bill:${billCode}`);

        let discountAmount = 0;
        let promotionId: string | null = null;

        if (spec.promoCode) {
          const promo = promoMap.get(spec.promoCode);
          if (!promo) {
            throw new Error(`Promotion Rule Error: Promotion code "${spec.promoCode}" not configured in promoMap`);
          }
          promotionId = promo.id;
          discountAmount = calculatePromotionDiscount(promo, billSubtotalAmount, sessionEndTime);
        }

        const finalAmount = Math.max(0, billSubtotalAmount - discountAmount);

        let billStatus: BillStatus = BillStatus.PAID;
        if (spec.category === 'VOIDED') billStatus = BillStatus.VOIDED;
        if (spec.category === 'UNPAID_OPEN') billStatus = BillStatus.UNPAID;
        if (spec.category === 'PARTIAL_REFUND' || spec.category === 'FULL_REFUND') {
          // Reverted to PARTIALLY_PAID per backend billing.service.ts L427-432
          billStatus = BillStatus.PARTIALLY_PAID;
        }

        const existingBill = await tx.bill.findFirst({
          where: { OR: [{ id: billId }, { billCode }] },
        });

        if (existingBill) {
          if (!existingBill.billCode.startsWith('BILL-ANL-')) {
            throw new Error(`Data Safety Error: Identifier collision on non-analytics bill code "${existingBill.billCode}"`);
          }
          if (existingBill.id !== billId || existingBill.billCode !== billCode) {
            throw new Error(`Data Safety Error: Bill ID/Code mismatch for "${billCode}" (id: ${existingBill.id})`);
          }
          if (
            existingBill.sessionId !== sessionId ||
            existingBill.cashierId !== cashier.id ||
            existingBill.promotionId !== promotionId ||
            existingBill.status !== billStatus ||
            Number(existingBill.subtotalAmount) !== billSubtotalAmount ||
            Number(existingBill.discountAmount) !== discountAmount ||
            Number(existingBill.finalAmount) !== finalAmount ||
            Math.abs(existingBill.createdAt.getTime() - sessionEndTime.getTime()) >= 1000
          ) {
            throw new Error(`Data Consistency Error: Existing Bill "${billCode}" has conflicting attributes.`);
          }
        } else {
          await tx.bill.create({
            data: {
              id: billId,
              billCode,
              sessionId,
              cashierId: cashier.id,
              promotionId,
              subtotalAmount: new Prisma.Decimal(billSubtotalAmount),
              discountAmount: new Prisma.Decimal(discountAmount),
              finalAmount: new Prisma.Decimal(finalAmount),
              status: billStatus,
              createdAt: sessionEndTime,
              updatedAt: sessionEndTime,
            },
          });
          totalBillsCreated++;
        }

        // If VOIDED or UNPAID, no payments exist
        const hasPayment =
          spec.category === 'STANDARD_SETTLED' ||
          spec.category === 'PROMO_SETTLED' ||
          spec.category === 'PARTIAL_REFUND' ||
          spec.category === 'FULL_REFUND';

        if (!hasPayment) {
          continue;
        }

        // ----------------------------------------------------------------------
        // Entity 5: Payment Construction, Idempotency & Consistency Check
        // ----------------------------------------------------------------------
        const paymentMethod = spec.paymentMethod || PaymentMethod.CASH;
        const transactionCode = `TXN-ANL-${dateStr}-${seqStr}`;
        const paymentId = generateUuidV5(`payment:${transactionCode}`);

        let amountPaid = finalAmount;
        let changeAmount = 0;

        if (paymentMethod === PaymentMethod.CASH) {
          const roundedCash = Math.ceil(finalAmount / 50000) * 50000;
          if (roundedCash > finalAmount) {
            amountPaid = roundedCash;
            changeAmount = roundedCash - finalAmount;
          } else {
            amountPaid = finalAmount + 20000;
            changeAmount = 20000;
          }
        }

        const netPaid = amountPaid - changeAmount; // Exactly equals finalAmount

        let paymentStatus: PaymentStatus = PaymentStatus.SUCCESS;
        if (spec.category === 'FULL_REFUND') {
          // Full refund marks payment status REFUNDED per billing.service.ts L420-424
          paymentStatus = PaymentStatus.REFUNDED;
        }

        // Check both deterministic ID and unique transaction code
        const paymentById = await tx.payment.findUnique({ where: { id: paymentId } });
        const paymentByCode = await tx.payment.findFirst({ where: { transactionCode } });

        if (paymentById && paymentByCode && paymentById.id !== paymentByCode.id) {
          throw new Error(
            `Data Safety Error: Transaction code "${transactionCode}" belongs to a different ID than "${paymentId}"`,
          );
        }

        const existingPayment = paymentById || paymentByCode;

        if (existingPayment) {
          if (!existingPayment.transactionCode?.startsWith('TXN-ANL-')) {
            throw new Error(`Data Safety Error: Identifier collision on non-analytics transaction code "${existingPayment.transactionCode}"`);
          }
          if (existingPayment.id !== paymentId || existingPayment.transactionCode !== transactionCode) {
            throw new Error(`Data Safety Error: Payment ID/Code mismatch for "${transactionCode}" (id: ${existingPayment.id})`);
          }
          if (
            existingPayment.billId !== billId ||
            existingPayment.cashierId !== cashier.id ||
            existingPayment.paymentMethod !== paymentMethod ||
            Number(existingPayment.amountPaid) !== amountPaid ||
            Number(existingPayment.changeAmount) !== changeAmount ||
            existingPayment.status !== paymentStatus ||
            Math.abs(existingPayment.createdAt.getTime() - sessionEndTime.getTime()) >= 1000
          ) {
            throw new Error(`Data Consistency Error: Existing Payment "${transactionCode}" has conflicting attributes.`);
          }
        } else {
          await tx.payment.create({
            data: {
              id: paymentId,
              billId,
              cashierId: cashier.id,
              paymentMethod,
              amountPaid: new Prisma.Decimal(amountPaid),
              changeAmount: new Prisma.Decimal(changeAmount),
              transactionCode,
              status: paymentStatus,
              createdAt: sessionEndTime,
            },
          });
          totalPaymentsCreated++;
        }

        // ----------------------------------------------------------------------
        // Entity 6: Refund Construction with Cumulative Protection & Exact Billing Semantics
        // ----------------------------------------------------------------------
        if (spec.category === 'PARTIAL_REFUND' || spec.category === 'FULL_REFUND') {
          const refundCode = `REF-ANL-${dateStr}-${seqStr}`;
          const refundId = generateUuidV5(`refund:${refundCode}`);

          let refundAmount = 0;

          if (spec.category === 'FULL_REFUND') {
            // Full refund must equal exactly net paid amount (amountPaid - changeAmount)
            refundAmount = netPaid;
          } else if (spec.category === 'PARTIAL_REFUND') {
            // Partial refund must be strictly positive and strictly less than net paid amount
            if (spec.partialRefundItemName && dishMap.has(spec.partialRefundItemName)) {
              refundAmount = Number(dishMap.get(spec.partialRefundItemName)!.price);
            } else {
              refundAmount = 50000;
            }

            if (refundAmount >= netPaid) {
              throw new Error(`Refund Logic Error: Partial refund ${refundAmount} must be strictly less than net paid ${netPaid}`);
            }
          }

          if (refundAmount <= 0) {
            throw new Error(`Refund Logic Error: Calculated refund amount ${refundAmount} must be strictly positive.`);
          }

          // Section 3.3: Explicit Cumulative Refund Protection
          const existingPaymentRefunds = await tx.refund.findMany({
            where: { paymentId },
          });

          const previousRefundTotal = existingPaymentRefunds
            .filter((r) => r.id !== refundId)
            .reduce((sum, r) => sum + Number(r.amount), 0);

          const remainingRefundable = netPaid - previousRefundTotal;

          if (refundAmount > remainingRefundable) {
            throw new Error(
              `Cumulative Refund Error: Requested refund ${refundAmount.toLocaleString()} VND exceeds remaining refundable balance ${remainingRefundable.toLocaleString()} VND (netPaid: ${netPaid.toLocaleString()} VND, already refunded: ${previousRefundTotal.toLocaleString()} VND)`,
            );
          }

          if (previousRefundTotal + refundAmount > netPaid) {
            throw new Error(
              `Cumulative Refund Error: Total refunds (${(previousRefundTotal + refundAmount).toLocaleString()} VND) would exceed net paid (${netPaid.toLocaleString()} VND)`,
            );
          }

          const refundReason = spec.refundReason || `${refundCode}: Customer satisfaction resolution`;

          const existingRefund = await tx.refund.findUnique({
            where: { id: refundId },
          });

          if (existingRefund) {
            if (!existingRefund.reason.startsWith('REF-ANL-')) {
              throw new Error(`Data Safety Error: Found non-analytics refund with ID "${refundId}"`);
            }
            if (
              existingRefund.paymentId !== paymentId ||
              existingRefund.managerId !== manager.id ||
              Number(existingRefund.amount) !== refundAmount ||
              existingRefund.reason !== refundReason
            ) {
              throw new Error(`Data Consistency Error: Existing Refund "${refundCode}" has conflicting attributes.`);
            }
          } else {
            await tx.refund.create({
              data: {
                id: refundId,
                paymentId,
                managerId: manager.id,
                amount: new Prisma.Decimal(refundAmount),
                reason: refundReason,
                createdAt: new Date(sessionEndTime.getTime() + 600 * 1000), // 10 min after bill
              },
            });
            totalRefundsCreated++;
          }
        }
      }
    });

    if (day % 10 === 0 || day === 59) {
      console.log(`   ✓ [Day ${String(day + 1).padStart(2, '0')}/60] Processed ${isoDateLabel} batch safely.`);
    }
  }

  console.log('\n==============================================================================');
  console.log('🎉 60-DAY REVENUE ANALYTICS SEED SCRIPT COMPLETED SUCCESSFULLY!');
  console.log('==============================================================================');
  console.log(`   Dining Sessions Created: ${totalSessionsCreated}`);
  console.log(`   Orders Created:          ${totalOrdersCreated}`);
  console.log(`   Order Items Created:     ${totalOrderItemsCreated}`);
  console.log(`   Bills Created:           ${totalBillsCreated}`);
  console.log(`   Payments Created:        ${totalPaymentsCreated}`);
  console.log(`   Refunds Created:         ${totalRefundsCreated}`);
  if (consistentSessionsSkipped > 0) {
    console.log(`   Skipped (Consistent):    ${consistentSessionsSkipped} existing sessions`);
  }
  console.log('==============================================================================\n');
}

runAnalyticsSeed()
  .catch((e) => {
    console.error('❌ Error executing Operly analytics seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
