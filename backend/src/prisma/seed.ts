/**
 * ==============================================================================
 * OPERLY — PHASE 5 COMPREHENSIVE SEED DATA
 * ==============================================================================
 * Architecture: Single-Restaurant Modular Monolith (Operly v2.1)
 * Idempotency: All operations use upsert or deterministic checks to ensure
 *              safe, repeatable execution without creating duplicate records.
 * ==============================================================================
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../generated/prisma/client.js';
import {
  AnomalySeverity,
  AnomalyStatus,
  AnomalyType,
  AttendanceStatus,
  BillStatus,
  ForecastType,
  LeaveStatus,
  OrderItemStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  RecommendationPriority,
  RecommendationStatus,
  RecommendationType,
  ReservationStatus,
  RoleName,
  SessionStatus,
  StockMovementType,
  TableStatus,
} from '../generated/prisma/enums.js';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not configured in environment variables');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log('🚀 Starting Operly Phase 5 Seed Data generation...\n');

  // ============================================================================
  // 1. AUTH & RBAC (ROLES, PERMISSIONS, ROLE_PERMISSIONS, USERS)
  // ============================================================================
  console.log('📦 1/8 Seeding Auth & RBAC (Roles & Permissions)...');

  // 1.1 Roles
  const rolesData: Array<{ name: RoleName; description: string }> = [
    { name: RoleName.ADMIN, description: 'System Administrator with unrestricted access' },
    { name: RoleName.MANAGER, description: 'Restaurant Operations, Attendance and Leave Approval Manager' },
    { name: RoleName.CASHIER, description: 'Cashier handling billing, dining sessions checkout and payments' },
    { name: RoleName.CHEF, description: 'Kitchen Head Chef managing orders, prep line and recipes' },
    { name: RoleName.WAITER, description: 'Floor Waiter serving tables, reservations and taking orders' },
    { name: RoleName.CUSTOMER, description: 'Standard customer account for dining, online orders and reservations' },
  ];

  const roleMap = new Map<RoleName, string>();
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: { name: r.name, description: r.description },
    });
    roleMap.set(r.name, role.id);
  }
  console.log(`   ✓ 6 Roles verified/seeded (${Array.from(roleMap.keys()).join(', ')})`);

  // 1.2 Permissions
  const permissionsData: Array<{ code: string; name: string; description: string }> = [
    // Staff & Users
    { code: 'STAFF_VIEW', name: 'View Staff', description: 'View staff members list and schedules' },
    { code: 'STAFF_MANAGE', name: 'Manage Staff', description: 'Create, update, and manage staff accounts' },
    // Tables & Dining
    { code: 'TABLE_VIEW', name: 'View Tables', description: 'View restaurant floor layout and table statuses' },
    { code: 'TABLE_MANAGE', name: 'Manage Tables', description: 'Create and configure dining tables' },
    { code: 'TABLE_STATUS_UPDATE', name: 'Update Table Status', description: 'Change table availability status' },
    // Menu & Categories
    { code: 'MENU_VIEW', name: 'View Menu', description: 'Browse categories and menu items' },
    { code: 'MENU_MANAGE', name: 'Manage Menu', description: 'Create, update, or remove dishes and categories' },
    // Inventory & Recipes
    { code: 'INVENTORY_VIEW', name: 'View Inventory', description: 'View stock levels and inventory alerts' },
    { code: 'INVENTORY_MANAGE', name: 'Manage Inventory', description: 'Perform stock adjustments and receipts' },
    { code: 'RECIPE_MANAGE', name: 'Manage Recipes', description: 'Configure dish recipes and BOM ingredients' },
    // Orders & Kitchen
    { code: 'ORDER_VIEW', name: 'View Orders', description: 'View dining orders and items' },
    { code: 'ORDER_CREATE', name: 'Create Order', description: 'Take customer orders and dispatch to kitchen' },
    { code: 'ORDER_CANCEL', name: 'Cancel Order', description: 'Cancel active dining orders or items' },
    { code: 'KITCHEN_VIEW', name: 'View Kitchen Queue', description: 'View kitchen display system (KDS) order items' },
    { code: 'KITCHEN_MANAGE', name: 'Manage Kitchen Prep', description: 'Update cooking, ready, and served states' },
    // Billing & Payments
    { code: 'BILL_VIEW', name: 'View Bills', description: 'View dining session bills and checkout details' },
    { code: 'BILL_CREATE', name: 'Create Bill', description: 'Generate bills for dining sessions' },
    { code: 'PAYMENT_PROCESS', name: 'Process Payments', description: 'Collect payments via Cash, MoMo, VNPay, Bank' },
    { code: 'REFUND_PROCESS', name: 'Process Refunds', description: 'Approve and execute payment refunds' },
    { code: 'PROMOTION_MANAGE', name: 'Manage Promotions', description: 'Configure discount codes and vouchers' },
    // Attendance & Scheduling
    { code: 'ATTENDANCE_CHECKIN', name: 'Staff Check-In/Out', description: 'Perform GPS/WiFi shift check-in and out' },
    { code: 'ATTENDANCE_VIEW', name: 'View Attendance', description: 'Monitor daily staff attendance logs' },
    { code: 'SHIFT_VIEW', name: 'View Shifts', description: 'View scheduled shifts and assignments' },
    { code: 'SHIFT_MANAGE', name: 'Manage Shifts', description: 'Create and assign staff work shifts' },
    { code: 'LEAVE_REQUEST', name: 'Request Leave', description: 'Submit personal leave requests' },
    { code: 'LEAVE_APPROVE', name: 'Approve Leave', description: 'Review and approve/reject staff leave requests' },
    // Reservations
    { code: 'RESERVATION_VIEW', name: 'View Reservations', description: 'View table reservation bookings' },
    { code: 'RESERVATION_CREATE', name: 'Create Reservation', description: 'Book a table reservation' },
    { code: 'RESERVATION_MANAGE', name: 'Manage Reservations', description: 'Confirm, modify, or cancel reservations' },
    // Reports & AI
    { code: 'REPORT_VIEW', name: 'View Reports', description: 'Access revenue, cost, and sales performance reports' },
    { code: 'ANALYTICS_VIEW', name: 'View AI Insights', description: 'View dish profitability, forecast, and anomaly alerts' },
  ];

  const permissionMap = new Map<string, string>();
  for (const p of permissionsData) {
    const perm = await prisma.permission.upsert({
      where: { code: p.code },
      update: { name: p.name, description: p.description },
      create: { code: p.code, name: p.name, description: p.description },
    });
    permissionMap.set(p.code, perm.id);
  }
  console.log(`   ✓ ${permissionMap.size} Permissions verified/seeded`);

  // 1.3 Role-Permission Mapping
  const rolePermissionsMapping: Record<RoleName, string[]> = {
    [RoleName.ADMIN]: permissionsData.map((p) => p.code),
    [RoleName.MANAGER]: [
      'STAFF_VIEW',
      'TABLE_VIEW', 'TABLE_MANAGE', 'TABLE_STATUS_UPDATE',
      'MENU_VIEW', 'MENU_MANAGE',
      'INVENTORY_VIEW', 'INVENTORY_MANAGE', 'RECIPE_MANAGE',
      'ORDER_VIEW', 'ORDER_CREATE', 'ORDER_CANCEL',
      'KITCHEN_VIEW',
      'BILL_VIEW', 'BILL_CREATE', 'PAYMENT_PROCESS', 'REFUND_PROCESS', 'PROMOTION_MANAGE',
      'ATTENDANCE_VIEW', 'ATTENDANCE_CHECKIN', 'SHIFT_VIEW', 'LEAVE_REQUEST', 'LEAVE_APPROVE',
      'RESERVATION_VIEW', 'RESERVATION_MANAGE',
      'REPORT_VIEW', 'ANALYTICS_VIEW',
    ],
    [RoleName.CASHIER]: [
      'TABLE_VIEW', 'MENU_VIEW', 'ORDER_VIEW',
      'BILL_VIEW', 'BILL_CREATE', 'PAYMENT_PROCESS',
      'ATTENDANCE_CHECKIN', 'LEAVE_REQUEST',
    ],
    [RoleName.CHEF]: [
      'MENU_VIEW', 'INVENTORY_VIEW',
      'ORDER_VIEW', 'KITCHEN_VIEW', 'KITCHEN_MANAGE',
      'ATTENDANCE_CHECKIN', 'LEAVE_REQUEST',
    ],
    [RoleName.WAITER]: [
      'TABLE_VIEW', 'TABLE_STATUS_UPDATE', 'MENU_VIEW',
      'ORDER_VIEW', 'ORDER_CREATE', 'KITCHEN_VIEW',
      'RESERVATION_VIEW', 'RESERVATION_CREATE',
      'ATTENDANCE_CHECKIN', 'LEAVE_REQUEST',
    ],
    [RoleName.CUSTOMER]: [
      'MENU_VIEW', 'RESERVATION_VIEW', 'RESERVATION_CREATE', 'ORDER_VIEW',
    ],
  };

  let totalRolePermissions = 0;
  for (const [roleName, permCodes] of Object.entries(rolePermissionsMapping)) {
    const roleId = roleMap.get(roleName as RoleName);
    if (!roleId) continue;
    for (const code of permCodes) {
      const permissionId = permissionMap.get(code);
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId, permissionId },
        },
        update: {},
        create: { roleId, permissionId },
      });
      totalRolePermissions++;
    }
  }
  console.log(`   ✓ ${totalRolePermissions} Role-Permission assignments ensured`);

  // 1.4 Development Users
  const defaultPassword = 'Password123@';
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

  const usersData: Array<{
    phone: string;
    email: string;
    fullName: string;
    roleName: RoleName;
  }> = [
    { phone: '0901000001', email: 'admin@operly.com', fullName: 'System Administrator', roleName: RoleName.ADMIN },
    { phone: '0902000002', email: 'manager@operly.com', fullName: 'Tran Thi Mai (Manager)', roleName: RoleName.MANAGER },
    { phone: '0903000003', email: 'cashier@operly.com', fullName: 'Le Van Thu (Cashier)', roleName: RoleName.CASHIER },
    { phone: '0904000004', email: 'chef@operly.com', fullName: 'Chef Nguyen Hoang (Head Chef)', roleName: RoleName.CHEF },
    { phone: '0905000005', email: 'waiter@operly.com', fullName: 'Pham Quoc Bao (Senior Waiter)', roleName: RoleName.WAITER },
    { phone: '0987654321', email: 'customer@example.com', fullName: 'Nguyen Van A (Loyal Customer)', roleName: RoleName.CUSTOMER },
    { phone: '0906000006', email: 'customer2@operly.com', fullName: 'Doan Minh Tu (Customer)', roleName: RoleName.CUSTOMER },
  ];

  const userMap = new Map<string, string>(); // email -> userId
  for (const u of usersData) {
    const roleId = roleMap.get(u.roleName)!;
    const user = await prisma.user.upsert({
      where: { phone: u.phone },
      update: {
        email: u.email,
        fullName: u.fullName,
        roleId,
        isActive: true,
      },
      create: {
        phone: u.phone,
        email: u.email,
        fullName: u.fullName,
        roleId,
        passwordHash,
        isActive: true,
      },
    });
    userMap.set(u.email, user.id);
  }
  console.log(`   ✓ ${userMap.size} Development User Accounts created/verified (Password: "${defaultPassword}")`);

  // ============================================================================
  // 2. DINING TABLES (MODULE 2)
  // ============================================================================
  console.log('\n📦 2/8 Seeding Dining Tables...');

  const tablesData: Array<{
    tableNumber: string;
    floor: number;
    capacity: number;
    status: TableStatus;
    qrCodeToken: string;
  }> = [
    { tableNumber: '1', floor: 1, capacity: 2, status: TableStatus.AVAILABLE, qrCodeToken: 'QR-OPERLY-T01' },
    { tableNumber: '2', floor: 1, capacity: 2, status: TableStatus.AVAILABLE, qrCodeToken: 'QR-OPERLY-T02' },
    { tableNumber: '3', floor: 1, capacity: 4, status: TableStatus.AVAILABLE, qrCodeToken: 'QR-OPERLY-T03' },
    { tableNumber: '4', floor: 1, capacity: 4, status: TableStatus.OCCUPIED, qrCodeToken: 'QR-OPERLY-T04' },
    { tableNumber: '5', floor: 1, capacity: 6, status: TableStatus.RESERVED, qrCodeToken: 'QR-OPERLY-T05' },
    { tableNumber: '6', floor: 1, capacity: 8, status: TableStatus.AVAILABLE, qrCodeToken: 'QR-OPERLY-T06' },
    { tableNumber: '7', floor: 2, capacity: 4, status: TableStatus.AVAILABLE, qrCodeToken: 'QR-OPERLY-T07' },
    { tableNumber: '8', floor: 2, capacity: 4, status: TableStatus.CLEANING, qrCodeToken: 'QR-OPERLY-T08' },
    { tableNumber: '9', floor: 2, capacity: 10, status: TableStatus.AVAILABLE, qrCodeToken: 'QR-OPERLY-T09' },
    { tableNumber: '10', floor: 2, capacity: 12, status: TableStatus.AVAILABLE, qrCodeToken: 'QR-OPERLY-T10' },
  ];

  const tableMap = new Map<string, string>();
  for (const t of tablesData) {
    const table = await prisma.table.upsert({
      where: { tableNumber: t.tableNumber },
      update: {
        floor: t.floor,
        capacity: t.capacity,
        qrCodeToken: t.qrCodeToken,
      },
      create: t,
    });
    tableMap.set(t.tableNumber, table.id);
  }
  console.log(`   ✓ ${tableMap.size} Dining Tables seeded across Floors 1 and 2`);

  // ============================================================================
  // 3. MENU CATEGORIES & ITEMS (MODULE 3)
  // ============================================================================
  console.log('\n📦 3/8 Seeding Menu Categories and Dishes...');

  const categoriesData: Array<{ name: string; displayOrder: number }> = [
    { name: 'Appetizers', displayOrder: 1 },
    { name: 'Main Courses', displayOrder: 2 },
    { name: 'Seafood Specialties', displayOrder: 3 },
    { name: 'Side Dishes & Rice', displayOrder: 4 },
    { name: 'Desserts', displayOrder: 5 },
    { name: 'Beverages', displayOrder: 6 },
  ];

  const categoryMap = new Map<string, string>();
  for (const c of categoriesData) {
    let cat = await prisma.category.findFirst({ where: { name: c.name } });
    if (cat) {
      cat = await prisma.category.update({
        where: { id: cat.id },
        data: { displayOrder: c.displayOrder, isActive: true },
      });
    } else {
      cat = await prisma.category.create({
        data: { name: c.name, displayOrder: c.displayOrder, isActive: true },
      });
    }
    categoryMap.set(c.name, cat.id);
  }
  console.log(`   ✓ ${categoryMap.size} Menu Categories seeded`);

  const menuItemsData: Array<{
    categoryName: string;
    name: string;
    description: string;
    price: number;
    costPrice: number;
    imageUrl: string;
    isAvailable: boolean;
    isRecommendable: boolean;
  }> = [
    {
      categoryName: 'Appetizers',
      name: 'Crispy Vietnamese Spring Rolls (Nem Ran)',
      description: 'Pork, shrimp, wood ear mushroom and vermicelli wrapped in crispy rice paper.',
      price: 85000,
      costPrice: 32000,
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
      isAvailable: true,
      isRecommendable: true,
    },
    {
      categoryName: 'Appetizers',
      name: 'Fresh Green Papaya Salad with Prawns (Goi Du Du Tom)',
      description: 'Shredded crunchy green papaya, sweet-sour lime dressing, poached prawns and crushed peanuts.',
      price: 95000,
      costPrice: 38000,
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
      isAvailable: true,
      isRecommendable: false,
    },
    {
      categoryName: 'Main Courses',
      name: 'Special Traditional Beef Pho (Pho Bo Dac Biet)',
      description: '24-hour slow-cooked marrow bone broth, premium sliced sirloin and brisket with fresh herbs.',
      price: 110000,
      costPrice: 42000,
      imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500',
      isAvailable: true,
      isRecommendable: true,
    },
    {
      categoryName: 'Main Courses',
      name: 'Hanoi Grilled Pork with Vermicelli (Bun Cha Ha Noi)',
      description: 'Charcoal-grilled pork patties, crispy spring roll, fresh rice noodles, and savory dipping sauce.',
      price: 105000,
      costPrice: 40000,
      imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=500',
      isAvailable: true,
      isRecommendable: true,
    },
    {
      categoryName: 'Main Courses',
      name: 'Caramelized Pork Belly in Claypot (Thit Kho To)',
      description: 'Tender pork belly braised in rich coconut water, pepper, and caramelized fish sauce.',
      price: 125000,
      costPrice: 48000,
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500',
      isAvailable: true,
      isRecommendable: false,
    },
    {
      categoryName: 'Seafood Specialties',
      name: 'Garlic Butter Tiger Prawns (Tom Sot Bo Toi)',
      description: 'Jumbo tiger prawns sautéed with French Normandy butter, roasted garlic, and parsley.',
      price: 185000,
      costPrice: 78000,
      imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500',
      isAvailable: true,
      isRecommendable: true,
    },
    {
      categoryName: 'Side Dishes & Rice',
      name: 'Morning Glory Stir-fried with Garlic (Rau Muong Xao Toi)',
      description: 'Crisp green morning glory flash-fried in hot wok with fragrant crushed garlic.',
      price: 55000,
      costPrice: 18000,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
      isAvailable: true,
      isRecommendable: false,
    },
    {
      categoryName: 'Side Dishes & Rice',
      name: 'Steamed Fragrant Jasmine Rice (Com Trang)',
      description: 'Steamed premium Vietnamese ST25 rice bowl.',
      price: 20000,
      costPrice: 5000,
      imageUrl: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=500',
      isAvailable: true,
      isRecommendable: false,
    },
    {
      categoryName: 'Desserts',
      name: 'Vietnamese Caramel Flan (Banh Flan)',
      description: 'Silky smooth egg custard topped with bitter coffee and dark caramel syrup.',
      price: 45000,
      costPrice: 15000,
      imageUrl: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=500',
      isAvailable: true,
      isRecommendable: false,
    },
    {
      categoryName: 'Beverages',
      name: 'Vietnamese Iced Coffee with Condensed Milk (Ca Phe Sua Da)',
      description: 'Slow-dripped dark Robusta coffee with sweetened condensed milk over crushed ice.',
      price: 40000,
      costPrice: 12000,
      imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500',
      isAvailable: true,
      isRecommendable: true,
    },
    {
      categoryName: 'Beverages',
      name: 'Fresh Lime Juice with Mint (Nuoc Chanh Tuoi)',
      description: 'Freshly squeezed Dalat limes with crushed mint leaves and cane sugar syrup.',
      price: 35000,
      costPrice: 10000,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500',
      isAvailable: true,
      isRecommendable: false,
    },
  ];

  const menuItemMap = new Map<string, string>();
  for (const item of menuItemsData) {
    const categoryId = categoryMap.get(item.categoryName)!;
    let menuItem = await prisma.menuItem.findFirst({
      where: { categoryId, name: item.name },
    });
    if (menuItem) {
      menuItem = await prisma.menuItem.update({
        where: { id: menuItem.id },
        data: {
          description: item.description,
          price: new Prisma.Decimal(item.price),
          costPrice: new Prisma.Decimal(item.costPrice),
          imageUrl: item.imageUrl,
          isAvailable: item.isAvailable,
          isRecommendable: item.isRecommendable,
        },
      });
    } else {
      menuItem = await prisma.menuItem.create({
        data: {
          categoryId,
          name: item.name,
          description: item.description,
          price: new Prisma.Decimal(item.price),
          costPrice: new Prisma.Decimal(item.costPrice),
          imageUrl: item.imageUrl,
          isAvailable: item.isAvailable,
          isRecommendable: item.isRecommendable,
        },
      });
    }
    menuItemMap.set(item.name, menuItem.id);
  }
  console.log(`   ✓ ${menuItemMap.size} Dishes and Menu Items seeded`);

  // ============================================================================
  // 4. INVENTORY, RECIPES & STOCK MOVEMENTS (MODULE 4)
  // ============================================================================
  console.log('\n📦 4/8 Seeding Inventory Items, BOM Recipes, and Stock Receipts...');

  const inventoryItemsData: Array<{
    itemName: string;
    unit: string;
    currentStock: number;
    minAlertThreshold: number;
  }> = [
    { itemName: 'Beef Brisket & Sirloin', unit: 'kg', currentStock: 45.0, minAlertThreshold: 10.0 },
    { itemName: 'Pho Rice Noodles', unit: 'kg', currentStock: 60.0, minAlertThreshold: 15.0 },
    { itemName: 'Pork Belly', unit: 'kg', currentStock: 35.0, minAlertThreshold: 10.0 },
    { itemName: 'Tiger Prawns', unit: 'kg', currentStock: 18.0, minAlertThreshold: 5.0 },
    { itemName: 'Morning Glory Greens', unit: 'kg', currentStock: 25.0, minAlertThreshold: 6.0 },
    { itemName: 'Jasmine Rice ST25', unit: 'kg', currentStock: 120.0, minAlertThreshold: 30.0 },
    { itemName: 'Robusta Coffee Beans', unit: 'kg', currentStock: 15.0, minAlertThreshold: 3.0 },
    { itemName: 'Condensed Milk (Can 380g)', unit: 'can', currentStock: 50.0, minAlertThreshold: 12.0 },
    { itemName: 'Fresh Chicken Eggs', unit: 'piece', currentStock: 150.0, minAlertThreshold: 30.0 },
    { itemName: 'Garlic & Shallots', unit: 'kg', currentStock: 20.0, minAlertThreshold: 5.0 },
    { itemName: 'Fish Sauce 40°N', unit: 'liter', currentStock: 40.0, minAlertThreshold: 8.0 },
    { itemName: 'Cooking Oil', unit: 'liter', currentStock: 50.0, minAlertThreshold: 10.0 },
    { itemName: 'Dalat Limes & Herbs', unit: 'kg', currentStock: 12.0, minAlertThreshold: 3.0 },
    { itemName: 'Truffle Finishing Oil', unit: 'bottle', currentStock: 1.5, minAlertThreshold: 3.0 }, // Low-stock alert demo
  ];

  const inventoryMap = new Map<string, string>();
  for (const inv of inventoryItemsData) {
    let item = await prisma.inventoryItem.findFirst({
      where: { itemName: inv.itemName },
    });
    if (item) {
      item = await prisma.inventoryItem.update({
        where: { id: item.id },
        data: {
          unit: inv.unit,
          minAlertThreshold: new Prisma.Decimal(inv.minAlertThreshold),
        },
      });
    } else {
      item = await prisma.inventoryItem.create({
        data: {
          itemName: inv.itemName,
          unit: inv.unit,
          currentStock: new Prisma.Decimal(inv.currentStock),
          minAlertThreshold: new Prisma.Decimal(inv.minAlertThreshold),
        },
      });
    }
    inventoryMap.set(inv.itemName, item.id);
  }
  console.log(`   ✓ ${inventoryMap.size} Inventory Items seeded (including 1 low-stock demonstration alert item)`);

  // 4.2 Recipes (BOM)
  const recipesData: Array<{
    menuItemName: string;
    inventoryItemName: string;
    quantityRequired: number;
  }> = [
    // Special Traditional Beef Pho
    { menuItemName: 'Special Traditional Beef Pho (Pho Bo Dac Biet)', inventoryItemName: 'Beef Brisket & Sirloin', quantityRequired: 0.15 },
    { menuItemName: 'Special Traditional Beef Pho (Pho Bo Dac Biet)', inventoryItemName: 'Pho Rice Noodles', quantityRequired: 0.2 },
    { menuItemName: 'Special Traditional Beef Pho (Pho Bo Dac Biet)', inventoryItemName: 'Fish Sauce 40°N', quantityRequired: 0.02 },
    // Hanoi Grilled Pork with Vermicelli
    { menuItemName: 'Hanoi Grilled Pork with Vermicelli (Bun Cha Ha Noi)', inventoryItemName: 'Pork Belly', quantityRequired: 0.2 },
    { menuItemName: 'Hanoi Grilled Pork with Vermicelli (Bun Cha Ha Noi)', inventoryItemName: 'Fish Sauce 40°N', quantityRequired: 0.05 },
    { menuItemName: 'Hanoi Grilled Pork with Vermicelli (Bun Cha Ha Noi)', inventoryItemName: 'Garlic & Shallots', quantityRequired: 0.03 },
    // Garlic Butter Tiger Prawns
    { menuItemName: 'Garlic Butter Tiger Prawns (Tom Sot Bo Toi)', inventoryItemName: 'Tiger Prawns', quantityRequired: 0.25 },
    { menuItemName: 'Garlic Butter Tiger Prawns (Tom Sot Bo Toi)', inventoryItemName: 'Garlic & Shallots', quantityRequired: 0.04 },
    { menuItemName: 'Garlic Butter Tiger Prawns (Tom Sot Bo Toi)', inventoryItemName: 'Cooking Oil', quantityRequired: 0.03 },
    // Morning Glory Stir-fried
    { menuItemName: 'Morning Glory Stir-fried with Garlic (Rau Muong Xao Toi)', inventoryItemName: 'Morning Glory Greens', quantityRequired: 0.3 },
    { menuItemName: 'Morning Glory Stir-fried with Garlic (Rau Muong Xao Toi)', inventoryItemName: 'Garlic & Shallots', quantityRequired: 0.03 },
    { menuItemName: 'Morning Glory Stir-fried with Garlic (Rau Muong Xao Toi)', inventoryItemName: 'Cooking Oil', quantityRequired: 0.02 },
    // Vietnamese Iced Coffee
    { menuItemName: 'Vietnamese Iced Coffee with Condensed Milk (Ca Phe Sua Da)', inventoryItemName: 'Robusta Coffee Beans', quantityRequired: 0.03 },
    { menuItemName: 'Vietnamese Iced Coffee with Condensed Milk (Ca Phe Sua Da)', inventoryItemName: 'Condensed Milk (Can 380g)', quantityRequired: 0.1 },
    // Vietnamese Caramel Flan
    { menuItemName: 'Vietnamese Caramel Flan (Banh Flan)', inventoryItemName: 'Fresh Chicken Eggs', quantityRequired: 2.0 },
    { menuItemName: 'Vietnamese Caramel Flan (Banh Flan)', inventoryItemName: 'Condensed Milk (Can 380g)', quantityRequired: 0.15 },
    // --- 5 Additional Dishes (Simulated Academic BOM Recipes for Complete Dish Profitability) ---
    // Crispy Vietnamese Spring Rolls (Nem Ran)
    { menuItemName: 'Crispy Vietnamese Spring Rolls (Nem Ran)', inventoryItemName: 'Pork Belly', quantityRequired: 0.10 },
    { menuItemName: 'Crispy Vietnamese Spring Rolls (Nem Ran)', inventoryItemName: 'Tiger Prawns', quantityRequired: 0.05 },
    { menuItemName: 'Crispy Vietnamese Spring Rolls (Nem Ran)', inventoryItemName: 'Cooking Oil', quantityRequired: 0.03 },
    { menuItemName: 'Crispy Vietnamese Spring Rolls (Nem Ran)', inventoryItemName: 'Garlic & Shallots', quantityRequired: 0.01 },
    // Fresh Green Papaya Salad with Prawns (Goi Du Du Tom)
    { menuItemName: 'Fresh Green Papaya Salad with Prawns (Goi Du Du Tom)', inventoryItemName: 'Tiger Prawns', quantityRequired: 0.12 },
    { menuItemName: 'Fresh Green Papaya Salad with Prawns (Goi Du Du Tom)', inventoryItemName: 'Pork Belly', quantityRequired: 0.05 },
    { menuItemName: 'Fresh Green Papaya Salad with Prawns (Goi Du Du Tom)', inventoryItemName: 'Dalat Limes & Herbs', quantityRequired: 0.05 },
    { menuItemName: 'Fresh Green Papaya Salad with Prawns (Goi Du Du Tom)', inventoryItemName: 'Fish Sauce 40°N', quantityRequired: 0.02 },
    // Caramelized Pork Belly in Claypot (Thit Kho To)
    { menuItemName: 'Caramelized Pork Belly in Claypot (Thit Kho To)', inventoryItemName: 'Pork Belly', quantityRequired: 0.25 },
    { menuItemName: 'Caramelized Pork Belly in Claypot (Thit Kho To)', inventoryItemName: 'Fresh Chicken Eggs', quantityRequired: 1.0 },
    { menuItemName: 'Caramelized Pork Belly in Claypot (Thit Kho To)', inventoryItemName: 'Fish Sauce 40°N', quantityRequired: 0.03 },
    { menuItemName: 'Caramelized Pork Belly in Claypot (Thit Kho To)', inventoryItemName: 'Garlic & Shallots', quantityRequired: 0.02 },
    { menuItemName: 'Caramelized Pork Belly in Claypot (Thit Kho To)', inventoryItemName: 'Cooking Oil', quantityRequired: 0.01 },
    // Steamed Fragrant Jasmine Rice (Com Trang)
    { menuItemName: 'Steamed Fragrant Jasmine Rice (Com Trang)', inventoryItemName: 'Jasmine Rice ST25', quantityRequired: 0.15 },
    // Fresh Lime Juice with Mint (Nuoc Chanh Tuoi)
    { menuItemName: 'Fresh Lime Juice with Mint (Nuoc Chanh Tuoi)', inventoryItemName: 'Dalat Limes & Herbs', quantityRequired: 0.10 },
  ];

  let recipeCount = 0;
  for (const r of recipesData) {
    const menuItemId = menuItemMap.get(r.menuItemName);
    const inventoryItemId = inventoryMap.get(r.inventoryItemName);
    if (!menuItemId || !inventoryItemId) continue;
    await prisma.recipe.upsert({
      where: {
        menuItemId_inventoryItemId: { menuItemId, inventoryItemId },
      },
      update: {
        quantityRequired: new Prisma.Decimal(r.quantityRequired),
      },
      create: {
        menuItemId,
        inventoryItemId,
        quantityRequired: new Prisma.Decimal(r.quantityRequired),
      },
    });
    recipeCount++;
  }
  console.log(`   ✓ ${recipeCount} Dish BOM Recipes linked to Inventory items`);

  // 4.3 Stock Receipt Demo
  const managerUserId = userMap.get('manager@operly.com')!;
  const receiptCode = 'REC-202611-001';
  const existingReceipt = await prisma.stockReceipt.findUnique({
    where: { receiptCode },
  });
  if (!existingReceipt) {
    const receipt = await prisma.stockReceipt.create({
      data: {
        receiptCode,
        supplierName: 'Metro Cash & Carry Vietnam',
        managerId: managerUserId,
        totalCost: new Prisma.Decimal(5420000),
        details: {
          create: [
            {
              inventoryItemId: inventoryMap.get('Beef Brisket & Sirloin')!,
              quantity: new Prisma.Decimal(20.0),
              unitPrice: new Prisma.Decimal(210000),
            },
            {
              inventoryItemId: inventoryMap.get('Jasmine Rice ST25')!,
              quantity: new Prisma.Decimal(50.0),
              unitPrice: new Prisma.Decimal(20000),
            },
            {
              inventoryItemId: inventoryMap.get('Cooking Oil')!,
              quantity: new Prisma.Decimal(10.0),
              unitPrice: new Prisma.Decimal(42000),
            },
          ],
        },
      },
    });
    // Record Stock Movement of type IN_RECEIPT
    await prisma.stockMovement.create({
      data: {
        inventoryItemId: inventoryMap.get('Beef Brisket & Sirloin')!,
        createdById: managerUserId,
        movementType: StockMovementType.IN_RECEIPT,
        quantity: new Prisma.Decimal(20.0),
        balanceAfter: new Prisma.Decimal(45.0),
        note: `Goods receipt ${receipt.receiptCode}`,
      },
    });
    console.log(`   ✓ Stock Receipt ${receiptCode} created with IN_RECEIPT movement`);
  } else {
    console.log(`   ✓ Stock Receipt ${receiptCode} already verified`);
  }

  // 4.4 Simulated Academic Stock Receipt for Complete BOM Costing (Latest Purchase Price Benchmark)
  // Preserves existing REC-202611-001 prices (Beef Brisket: 210,000, Jasmine Rice: 20,000, Cooking Oil: 42,000)
  // and establishes benchmark purchase prices for the remaining 11 inventory items.
  const benchmarkReceiptCode = 'REC-202611-002';
  const expectedTotalCost = 12580000;
  const benchmarkItems: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
  }> = [
    { itemName: 'Pho Rice Noodles', quantity: 30.0, unitPrice: 25000 },
    { itemName: 'Pork Belly', quantity: 20.0, unitPrice: 130000 },
    { itemName: 'Tiger Prawns', quantity: 10.0, unitPrice: 260000 },
    { itemName: 'Morning Glory Greens', quantity: 15.0, unitPrice: 20000 },
    { itemName: 'Robusta Coffee Beans', quantity: 10.0, unitPrice: 180000 },
    { itemName: 'Condensed Milk (Can 380g)', quantity: 30.0, unitPrice: 24000 },
    { itemName: 'Fresh Chicken Eggs', quantity: 100.0, unitPrice: 3500 },
    { itemName: 'Garlic & Shallots', quantity: 10.0, unitPrice: 60000 },
    { itemName: 'Fish Sauce 40°N', quantity: 20.0, unitPrice: 90000 },
    { itemName: 'Dalat Limes & Herbs', quantity: 8.0, unitPrice: 45000 },
    { itemName: 'Truffle Finishing Oil', quantity: 2.0, unitPrice: 350000 },
  ];

  const existingBenchmarkReceipt = await prisma.stockReceipt.findUnique({
    where: { receiptCode: benchmarkReceiptCode },
    include: { details: true },
  });

  if (!existingBenchmarkReceipt) {
    await prisma.stockReceipt.create({
      data: {
        receiptCode: benchmarkReceiptCode,
        supplierName: 'Metro Cash & Carry Vietnam - Dry Goods & Fresh Wholesale',
        managerId: managerUserId,
        totalCost: new Prisma.Decimal(expectedTotalCost),
        createdAt: new Date('2026-11-24T11:00:00.000Z'),
        details: {
          create: benchmarkItems.map((b) => ({
            inventoryItemId: inventoryMap.get(b.itemName)!,
            quantity: new Prisma.Decimal(b.quantity),
            unitPrice: new Prisma.Decimal(b.unitPrice),
          })),
        },
      },
    });
    console.log(`   ✓ Benchmark Stock Receipt ${benchmarkReceiptCode} created for 11 inventory items (LPP Benchmark)`);
  } else {
    // Hardened idempotency verification: strictly validate existing receipt consistency using Decimal-safe comparisons
    const expectedTotalCostDecimal = new Prisma.Decimal(expectedTotalCost);
    if (!existingBenchmarkReceipt.totalCost.equals(expectedTotalCostDecimal)) {
      throw new Error(
        `Benchmark Stock Receipt "${benchmarkReceiptCode}" already exists but totalCost mismatch: ` +
        `expected ${expectedTotalCost} VND, found ${existingBenchmarkReceipt.totalCost} VND. ` +
        `Refusing to proceed to prevent inconsistent BOM costing.`
      );
    }

    if (existingBenchmarkReceipt.details.length !== benchmarkItems.length) {
      throw new Error(
        `Benchmark Stock Receipt "${benchmarkReceiptCode}" already exists but details count mismatch: ` +
        `expected ${benchmarkItems.length} items, found ${existingBenchmarkReceipt.details.length} items. ` +
        `Refusing to proceed to prevent incomplete BOM costing.`
      );
    }

    // Duplicate inventory detail validation
    const uniqueItemIds = new Set(existingBenchmarkReceipt.details.map((d) => d.inventoryItemId));
    if (uniqueItemIds.size !== existingBenchmarkReceipt.details.length) {
      throw new Error(
        `Benchmark Stock Receipt "${benchmarkReceiptCode}" already exists but contains duplicate inventory item details. ` +
        `Refusing to proceed to prevent inconsistent BOM costing.`
      );
    }

    const detailMap = new Map(
      existingBenchmarkReceipt.details.map((d) => [d.inventoryItemId, d])
    );

    for (const expectedItem of benchmarkItems) {
      const inventoryItemId = inventoryMap.get(expectedItem.itemName);
      if (!inventoryItemId) {
        throw new Error(
          `Inventory item "${expectedItem.itemName}" not found in inventoryMap during benchmark verification.`
        );
      }

      const existingDetail = detailMap.get(inventoryItemId);
      if (!existingDetail) {
        throw new Error(
          `Benchmark Stock Receipt "${benchmarkReceiptCode}" missing required item detail for "${expectedItem.itemName}". ` +
          `Refusing to proceed to prevent inconsistent BOM costing.`
        );
      }

      const expectedQuantityDecimal = new Prisma.Decimal(expectedItem.quantity);
      if (!existingDetail.quantity.equals(expectedQuantityDecimal)) {
        throw new Error(
          `Benchmark Stock Receipt "${benchmarkReceiptCode}" quantity mismatch for "${expectedItem.itemName}": ` +
          `expected ${expectedItem.quantity}, found ${existingDetail.quantity}.`
        );
      }

      const expectedUnitPriceDecimal = new Prisma.Decimal(expectedItem.unitPrice);
      if (!existingDetail.unitPrice.equals(expectedUnitPriceDecimal)) {
        throw new Error(
          `Benchmark Stock Receipt "${benchmarkReceiptCode}" unitPrice mismatch for "${expectedItem.itemName}": ` +
          `expected ${expectedItem.unitPrice} VND, found ${existingDetail.unitPrice} VND.`
        );
      }
    }

    console.log(
      `   ✓ Benchmark Stock Receipt ${benchmarkReceiptCode} verified: all 11 items, quantities, and unit prices match via Decimal equality (${expectedTotalCost.toLocaleString()} VND)`
    );
  }

  // ============================================================================
  // 5. PROMOTIONS (MODULE 5)
  // ============================================================================
  console.log('\n📦 5/8 Seeding Promotions...');

  const promotionsData: Array<{
    code: string;
    description: string;
    discountPercent?: number;
    discountAmount?: number;
    maxDiscount?: number;
    minOrderAmount: number;
    isActive: boolean;
    startDate: Date;
    endDate: Date;
  }> = [
    {
      code: 'WELCOME10',
      description: '10% discount for first-time dining guests',
      discountPercent: 10.0,
      maxDiscount: 50000,
      minOrderAmount: 200000,
      isActive: true,
      startDate: new Date('2026-01-01T00:00:00Z'),
      endDate: new Date('2026-12-31T23:59:59Z'),
    },
    {
      code: 'LUNCHSPECIAL',
      description: 'Direct 30,000 VND discount on weekday lunch orders over 150,000 VND',
      discountAmount: 30000,
      minOrderAmount: 150000,
      isActive: true,
      startDate: new Date('2026-01-01T00:00:00Z'),
      endDate: new Date('2026-12-31T23:59:59Z'),
    },
    {
      code: 'VIPDINING15',
      description: '15% exclusive discount for VIP room banquet bookings',
      discountPercent: 15.0,
      maxDiscount: 150000,
      minOrderAmount: 1000000,
      isActive: true,
      startDate: new Date('2026-01-01T00:00:00Z'),
      endDate: new Date('2026-12-31T23:59:59Z'),
    },
  ];

  const promotionMap = new Map<string, string>();
  for (const promo of promotionsData) {
    const p = await prisma.promotion.upsert({
      where: { code: promo.code },
      update: {
        description: promo.description,
        discountPercent: promo.discountPercent ?? null,
        discountAmount: promo.discountAmount ? new Prisma.Decimal(promo.discountAmount) : null,
        maxDiscount: promo.maxDiscount ? new Prisma.Decimal(promo.maxDiscount) : null,
        minOrderAmount: new Prisma.Decimal(promo.minOrderAmount),
        isActive: promo.isActive,
        startDate: promo.startDate,
        endDate: promo.endDate,
      },
      create: {
        code: promo.code,
        description: promo.description,
        discountPercent: promo.discountPercent ?? null,
        discountAmount: promo.discountAmount ? new Prisma.Decimal(promo.discountAmount) : null,
        maxDiscount: promo.maxDiscount ? new Prisma.Decimal(promo.maxDiscount) : null,
        minOrderAmount: new Prisma.Decimal(promo.minOrderAmount),
        isActive: promo.isActive,
        startDate: promo.startDate,
        endDate: promo.endDate,
      },
    });
    promotionMap.set(promo.code, p.id);
  }
  console.log(`   ✓ ${promotionMap.size} Promotions seeded`);

  // ============================================================================
  // 6. SHIFTS, ASSIGNMENTS, ATTENDANCE & LEAVE REQUESTS (MODULE 6)
  // ============================================================================
  console.log('\n📦 6/8 Seeding Staff Shifts, Attendance Logs, and Leave Requests...');

  const shiftsData = [
    { name: 'Morning Shift', startTime: '07:00', endTime: '15:00' },
    { name: 'Evening Shift', startTime: '15:00', endTime: '23:00' },
  ];

  const shiftMap = new Map<string, string>();
  for (const s of shiftsData) {
    let shift = await prisma.shift.findFirst({ where: { name: s.name } });
    if (shift) {
      shift = await prisma.shift.update({
        where: { id: shift.id },
        data: { startTime: s.startTime, endTime: s.endTime },
      });
    } else {
      shift = await prisma.shift.create({ data: s });
    }
    shiftMap.set(s.name, shift.id);
  }
  console.log(`   ✓ ${shiftMap.size} Work Shifts configured (Morning: 07:00-15:00, Evening: 15:00-23:00)`);

  // Shift Assignments for Staff
  const today = new Date();
  const todayDateOnly = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

  const staffEmailsToAssign = [
    { email: 'chef@operly.com', shiftName: 'Morning Shift' },
    { email: 'waiter@operly.com', shiftName: 'Morning Shift' },
    { email: 'cashier@operly.com', shiftName: 'Morning Shift' },
  ];

  let assignedCount = 0;
  for (const assignment of staffEmailsToAssign) {
    const userId = userMap.get(assignment.email)!;
    const shiftId = shiftMap.get(assignment.shiftName)!;

    const sa = await prisma.shiftAssignment.upsert({
      where: {
        userId_shiftId_assignedDate: {
          userId,
          shiftId,
          assignedDate: todayDateOnly,
        },
      },
      update: {},
      create: {
        userId,
        shiftId,
        assignedDate: todayDateOnly,
      },
    });
    assignedCount++;

    // Seed realistic Attendance for this shift assignment (1-to-1 unique relationship)
    await prisma.attendance.upsert({
      where: { shiftAssignmentId: sa.id },
      update: {},
      create: {
        userId,
        shiftAssignmentId: sa.id,
        checkInTime: new Date(today.setHours(6, 55, 0, 0)),
        checkOutTime: null,
        gpsLatitude: 10.7769,
        gpsLongitude: 106.7009,
        status: AttendanceStatus.ON_TIME,
      },
    });
  }
  console.log(`   ✓ ${assignedCount} Staff Shift Assignments & Check-in Attendance records seeded`);

  // Leave Requests Demo
  const waiterUserId = userMap.get('waiter@operly.com')!;
  const chefUserId = userMap.get('chef@operly.com')!;
  const managerId = userMap.get('manager@operly.com')!;

  const leaveRequestsData: Array<{
    userId: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: LeaveStatus;
    reviewedById?: string;
    reviewNote?: string;
    reviewedAt?: Date;
  }> = [
    {
      userId: waiterUserId,
      startDate: new Date('2026-12-01T00:00:00Z'),
      endDate: new Date('2026-12-02T00:00:00Z'),
      reason: 'Personal family affair in hometown',
      status: LeaveStatus.PENDING,
    },
    {
      userId: waiterUserId,
      startDate: new Date('2026-11-10T00:00:00Z'),
      endDate: new Date('2026-11-11T00:00:00Z'),
      reason: 'Medical health checkup and recovery',
      status: LeaveStatus.APPROVED,
      reviewedById: managerId,
      reviewNote: 'Approved. Valid doctor note presented.',
      reviewedAt: new Date('2026-11-08T09:30:00Z'),
    },
    {
      userId: chefUserId,
      startDate: new Date('2026-11-15T00:00:00Z'),
      endDate: new Date('2026-11-16T00:00:00Z'),
      reason: 'Weekend leave request during high-demand festival',
      status: LeaveStatus.REJECTED,
      reviewedById: managerId,
      reviewNote: 'Rejected due to critical staffing shortage on peak banquet weekend.',
      reviewedAt: new Date('2026-11-12T14:15:00Z'),
    },
  ];

  for (const lr of leaveRequestsData) {
    const existing = await prisma.leaveRequest.findFirst({
      where: {
        userId: lr.userId,
        startDate: lr.startDate,
        endDate: lr.endDate,
      },
    });
    if (!existing) {
      await prisma.leaveRequest.create({
        data: lr,
      });
    }
  }
  console.log(`   ✓ 3 Leave Requests seeded (PENDING, APPROVED, REJECTED)`);

  // ============================================================================
  // 7. RESERVATIONS, SESSIONS, ORDERS & BILLING DEMO (MODULE 2, 4, 5)
  // ============================================================================
  console.log('\n📦 7/8 Seeding Realistic Operations Demo Workflows...');

  const customerId = userMap.get('customer@example.com')!;
  const waiterId = userMap.get('waiter@operly.com')!;
  const cashierId = userMap.get('cashier@operly.com')!;

  // 7.1 Reservation Demo (Table 5)
  const reservationTableId = tableMap.get('5')!;
  const reservationTime = new Date(Date.now() + 4 * 3600 * 1000); // 4 hours later today
  const existingReservation = await prisma.reservation.findFirst({
    where: { customerId, guestPhone: '0987654321' },
  });
  if (!existingReservation) {
    await prisma.reservation.create({
      data: {
        customerId,
        guestName: 'Nguyen Van A',
        guestPhone: '0987654321',
        partySize: 6,
        reservationTime,
        depositAmount: new Prisma.Decimal(200000),
        status: ReservationStatus.CONFIRMED,
        tableId: reservationTableId,
        specialRequest: 'Window table preferred, birthday celebration with cake',
      },
    });
    console.log(`   ✓ 1 Confirmed Reservation created for Table 5 (Nguyen Van A)`);
  }

  // 7.2 Completed Dining Session Demo (Table 1 - Settled Bill)
  const table1Id = tableMap.get('1')!;
  const sessionCode1 = 'SESS-20261124-001';
  let session1 = await prisma.diningSession.findUnique({
    where: { sessionCode: sessionCode1 },
  });

  if (!session1) {
    session1 = await prisma.diningSession.create({
      data: {
        sessionCode: sessionCode1,
        tableId: table1Id,
        openedById: waiterId,
        closedById: cashierId,
        customerCount: 2,
        status: SessionStatus.CLOSED,
        startTime: new Date(Date.now() - 7200 * 1000),
        endTime: new Date(Date.now() - 3600 * 1000),
      },
    });

    // Create Completed Order
    const orderCode1 = 'ORD-20261124-001';
    const order1 = await prisma.order.create({
      data: {
        orderCode: orderCode1,
        sessionId: session1.id,
        waiterId,
        status: OrderStatus.COMPLETED,
        totalAmount: new Prisma.Decimal(385000),
        orderItems: {
          create: [
            {
              menuItemId: menuItemMap.get('Special Traditional Beef Pho (Pho Bo Dac Biet)')!,
              quantity: 2,
              unitPrice: new Prisma.Decimal(110000),
              costPrice: new Prisma.Decimal(42000),
              itemStatus: OrderItemStatus.SERVED,
            },
            {
              menuItemId: menuItemMap.get('Crispy Vietnamese Spring Rolls (Nem Ran)')!,
              quantity: 1,
              unitPrice: new Prisma.Decimal(85000),
              costPrice: new Prisma.Decimal(32000),
              itemStatus: OrderItemStatus.SERVED,
            },
            {
              menuItemId: menuItemMap.get('Vietnamese Iced Coffee with Condensed Milk (Ca Phe Sua Da)')!,
              quantity: 2,
              unitPrice: new Prisma.Decimal(40000),
              costPrice: new Prisma.Decimal(12000),
              itemStatus: OrderItemStatus.SERVED,
            },
          ],
        },
      },
      include: { orderItems: true },
    });

    // Record Stock Movement of type OUT_COOKING for order items (verifying Idempotent Unique Index)
    const phoItem = order1.orderItems.find(
      (i: { menuItemId: string }) =>
        i.menuItemId === menuItemMap.get('Special Traditional Beef Pho (Pho Bo Dac Biet)'),
    )!;
    await prisma.stockMovement.create({
      data: {
        orderItemId: phoItem.id,
        inventoryItemId: inventoryMap.get('Beef Brisket & Sirloin')!,
        movementType: StockMovementType.OUT_COOKING,
        quantity: new Prisma.Decimal(0.3),
        balanceAfter: new Prisma.Decimal(44.7),
        note: `Kitchen consumption for Order Item ${phoItem.id}`,
      },
    });

    // Generate Bill & Payment
    const billCode1 = 'BILL-20261124-001';
    const welcomePromoId = promotionMap.get('WELCOME10')!;
    const bill1 = await prisma.bill.create({
      data: {
        billCode: billCode1,
        sessionId: session1.id,
        cashierId,
        promotionId: welcomePromoId,
        subtotalAmount: new Prisma.Decimal(385000),
        discountAmount: new Prisma.Decimal(38500),
        finalAmount: new Prisma.Decimal(346500),
        status: BillStatus.PAID,
      },
    });

    await prisma.payment.create({
      data: {
        billId: bill1.id,
        cashierId,
        paymentMethod: PaymentMethod.CASH,
        amountPaid: new Prisma.Decimal(350000),
        changeAmount: new Prisma.Decimal(3500),
        status: PaymentStatus.SUCCESS,
        transactionCode: 'CASH-TXN-20261124-001',
      },
    });
    console.log(`   ✓ 1 Fully Completed Dining Session, Order, Stock Deduction, Bill and Cash Payment seeded`);
  }

  // 7.3 Active In-Progress Dining Session (Table 4)
  const table4Id = tableMap.get('4')!;
  const sessionCode2 = 'SESS-20261124-002';
  const existingSession2 = await prisma.diningSession.findUnique({
    where: { sessionCode: sessionCode2 },
  });

  if (!existingSession2) {
    const session2 = await prisma.diningSession.create({
      data: {
        sessionCode: sessionCode2,
        tableId: table4Id,
        openedById: waiterId,
        customerCount: 3,
        status: SessionStatus.OPEN,
        startTime: new Date(Date.now() - 1800 * 1000), // opened 30 mins ago
      },
    });

    await prisma.order.create({
      data: {
        orderCode: 'ORD-20261124-002',
        sessionId: session2.id,
        waiterId,
        status: OrderStatus.IN_PROGRESS,
        totalAmount: new Prisma.Decimal(395000),
        orderItems: {
          create: [
            {
              menuItemId: menuItemMap.get('Hanoi Grilled Pork with Vermicelli (Bun Cha Ha Noi)')!,
              quantity: 2,
              unitPrice: new Prisma.Decimal(105000),
              costPrice: new Prisma.Decimal(40000),
              itemStatus: OrderItemStatus.COOKING,
            },
            {
              menuItemId: menuItemMap.get('Garlic Butter Tiger Prawns (Tom Sot Bo Toi)')!,
              quantity: 1,
              unitPrice: new Prisma.Decimal(185000),
              costPrice: new Prisma.Decimal(78000),
              itemStatus: OrderItemStatus.PENDING,
            },
          ],
        },
      },
    });
    console.log(`   ✓ 1 Active Dining Session on Table 4 with kitchen queue in COOKING / PENDING status`);
  }

  // ============================================================================
  // 8. AI ANALYTICS & INSIGHTS (MODULE 7 DEMO RECORDS)
  // ============================================================================
  console.log('\n📦 8/8 Seeding AI Analytics & Operational Insights Demo Records...');

  // Dish Profitability Demo
  const beefPhoId = menuItemMap.get('Special Traditional Beef Pho (Pho Bo Dac Biet)')!;
  const existingProfit = await prisma.dishProfitability.findFirst({
    where: { menuItemId: beefPhoId },
  });
  if (!existingProfit) {
    await prisma.dishProfitability.create({
      data: {
        menuItemId: beefPhoId,
        periodStart: new Date('2026-11-01T00:00:00Z'),
        periodEnd: new Date('2026-11-20T23:59:59Z'),
        totalQuantitySold: 420,
        totalRevenue: new Prisma.Decimal(46200000),
        totalCost: new Prisma.Decimal(17640000),
        grossProfit: new Prisma.Decimal(28560000),
        profitMargin: new Prisma.Decimal(61.82),
      },
    });
  }

  // AI Demand Forecast Demo
  const forecastTarget = new Date(Date.now() + 86400 * 1000); // Tomorrow
  const existingForecast = await prisma.aiForecast.findFirst({
    where: { forecastType: ForecastType.REVENUE, targetDate: forecastTarget },
  });
  if (!existingForecast) {
    await prisma.aiForecast.create({
      data: {
        forecastType: ForecastType.REVENUE,
        targetDate: forecastTarget,
        predictedValue: new Prisma.Decimal(24500000),
        modelVersion: 'operly-sales-prophet-v2.1',
      },
    });
  }

  // AI Recommendation Demo
  const existingRec = await prisma.aiRecommendation.findFirst({
    where: { title: 'Restock Alert: Truffle Finishing Oil below safe margin' },
  });
  if (!existingRec) {
    await prisma.aiRecommendation.create({
      data: {
        recommendationType: RecommendationType.INVENTORY,
        title: 'Restock Alert: Truffle Finishing Oil below safe margin',
        description: 'Current stock is 1.5 bottles against minimum threshold of 3.0 bottles. Order replenishment from gourmet supplier.',
        priority: RecommendationPriority.HIGH,
        relatedEntityId: inventoryMap.get('Truffle Finishing Oil'),
        status: RecommendationStatus.PENDING,
      },
    });
  }

  // AI Anomaly Demo
  const existingAnomaly = await prisma.aiAnomaly.findFirst({
    where: { anomalyType: AnomalyType.CONSUMPTION },
  });
  if (!existingAnomaly) {
    await prisma.aiAnomaly.create({
      data: {
        anomalyType: AnomalyType.CONSUMPTION,
        description: 'Unusual cooking oil consumption detected on shift Nov 22: 45% above expected BOM recipe baseline.',
        severity: AnomalySeverity.MEDIUM,
        detectedValue: new Prisma.Decimal(4.8),
        expectedValue: new Prisma.Decimal(3.3),
        status: AnomalyStatus.INVESTIGATING,
      },
    });
  }
  console.log('   ✓ AI Analytics records (Profitability, Forecast, Recommendation, Anomaly) seeded');

  console.log('\n==============================================================================');
  console.log('🎉 OPERLY PHASE 5 SEED DATA COMPLETED SUCCESSFULLY!');
  console.log('==============================================================================\n');
}

seed()
  .catch((e) => {
    console.error('❌ Error executing Operly seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
