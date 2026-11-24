# OPERLY — DEVELOPMENT SEED DATA SPECIFICATION & MANUAL (P5)

This document describes the development dataset seeded for **Operly – Restaurant Operations and Profitability Management**.

---

## 1. How to Run the Seed Script

To execute or re-execute the seed script:

```bash
# Method 1: Using npm script from backend directory
cd backend
npm run seed

# Method 2: Using Prisma CLI
cd backend
npx prisma db seed

# Method 3: Direct Node invocation
cd backend
node --env-file=.env dist/prisma/seed.js
```

> **Note:** If you modify `src/prisma/seed.ts`, compile the project first with `npm run build` before executing the seed.

---

## 2. Development Login Credentials

All seeded development accounts share the same secure development password:

- **Universal Development Password:** `Password123@`
- **Password Hash:** Encrypted using `bcrypt` (10 salt rounds) exactly matching the authentication service.

| Role | Email | Phone Number | Full Name | Description |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@operly.com` | `0901000001` | System Administrator | Unrestricted system-wide management access |
| **MANAGER** | `manager@operly.com` | `0902000002` | Tran Thi Mai | Operations, attendance, leave approval, and inventory |
| **CASHIER** | `cashier@operly.com` | `0903000003` | Le Van Thu | Table checkout, bill creation, and payment collection |
| **CHEF** | `chef@operly.com` | `0904000004` | Chef Nguyen Hoang | Kitchen KDS queue, order preparation, recipes & inventory |
| **WAITER** | `waiter@operly.com` | `0905000005` | Pham Quoc Bao | Floor table management, guest order taking, and check-in |
| **CUSTOMER** | `customer@example.com` | `0987654321` | Nguyen Van A | Dine-in guest with table reservations and online browsing |
| **CUSTOMER** | `customer2@operly.com` | `0906000006` | Doan Minh Tu | Additional secondary customer account |

---

## 3. Roles and Permission Architecture

Operly strictly enforces Role-Based Access Control (RBAC):

### 3.1. Standard Role Mapping
| Database Role (`RoleName` enum) | Frontend UI Role String | Description |
| :--- | :--- | :--- |
| `ADMIN` | `admin` | Full administrator rights |
| `MANAGER` | `manager` | Restaurant Operations Manager |
| `CASHIER` | `cashier` | Cashier & POS Terminal Operator |
| `CHEF` | `kitchen` | Kitchen Station Chef |
| `WAITER` | `waiter` | Dining Room Waiter |
| `CUSTOMER` | `customer` | Registered Customer |

### 3.2. Permission Breakdown
- **ADMIN:** Granted all 30 system permissions.
- **MANAGER:** Operational management (`STAFF_VIEW`, `TABLE_MANAGE`, `MENU_MANAGE`, `INVENTORY_MANAGE`, `ORDER_CANCEL`, `REFUND_PROCESS`, `ATTENDANCE_VIEW`, `LEAVE_APPROVE`, `REPORT_VIEW`, `ANALYTICS_VIEW`). *Manager does NOT have unrestricted staff administrative privileges (`STAFF_MANAGE`).*
- **CASHIER:** Checkout & billing (`BILL_CREATE`, `PAYMENT_PROCESS`, `TABLE_VIEW`, `ORDER_VIEW`, `ATTENDANCE_CHECKIN`).
- **CHEF:** Kitchen line (`KITCHEN_VIEW`, `KITCHEN_MANAGE`, `MENU_VIEW`, `INVENTORY_VIEW`, `ATTENDANCE_CHECKIN`).
- **WAITER:** Table service (`TABLE_VIEW`, `TABLE_STATUS_UPDATE`, `ORDER_CREATE`, `ORDER_VIEW`, `RESERVATION_CREATE`, `ATTENDANCE_CHECKIN`).
- **CUSTOMER:** Customer portal (`MENU_VIEW`, `RESERVATION_CREATE`, `RESERVATION_VIEW`, `ORDER_VIEW`).

---

## 4. Summary of Seeded Records

| Domain Module | Model Name | Count | Key Highlights / Details |
| :--- | :--- | :---: | :--- |
| **Auth & RBAC** | `Role` | 6 | All 6 system roles (`ADMIN`, `MANAGER`, `CASHIER`, `CHEF`, `WAITER`, `CUSTOMER`) |
| **Auth & RBAC** | `Permission` | 30 | Granular permissions covering all backend modules |
| **Auth & RBAC** | `RolePermission` | 74 | Fine-grained role-to-permission mappings |
| **Auth & RBAC** | `User` | 7 | 5 Staff accounts + 2 Customer accounts |
| **Dining Tables** | `Table` | 10 | Tables 1–6 on Floor 1, Tables 7–10 on Floor 2 (capacities 2 to 12) |
| **Menu & Catalog** | `Category` | 6 | Appetizers, Mains, Seafood, Sides, Desserts, Beverages |
| **Menu & Catalog** | `MenuItem` | 11 | Authentic Vietnamese specialties with realistic pricing and cost |
| **Inventory & BOM** | `InventoryItem` | 14 | Essential raw ingredients with units, including 1 low-stock alert item |
| **Inventory & BOM** | `Recipe` | 16 | Bill of Materials (BOM) linking menu dishes to inventory quantities |
| **Inventory & BOM** | `StockReceipt` | 1 | Demonstrates bulk warehouse goods receipt (`REC-202611-001`) |
| **Inventory & BOM** | `StockReceiptDetail`| 3 | Beef, rice, and cooking oil receipt line items |
| **Inventory & BOM** | `StockMovement` | 2 | 1 `IN_RECEIPT` movement + 1 `OUT_COOKING` order deduction |
| **Billing & Promos**| `Promotion` | 3 | `WELCOME10` (10%), `LUNCHSPECIAL` (30k), `VIPDINING15` (15%) |
| **Staff & Shifts** | `Shift` | 2 | Morning Shift (07:00–15:00), Evening Shift (15:00–23:00) |
| **Staff & Shifts** | `ShiftAssignment`| 3 | Scheduled assignments for Chef, Waiter, and Cashier today |
| **Staff & Shifts** | `Attendance` | 3 | Check-in attendance records with GPS coordinates |
| **Staff & Shifts** | `LeaveRequest` | 3 | Demonstrates 3 workflow statuses: `PENDING`, `APPROVED`, `REJECTED` |
| **Operations Demo** | `Reservation` | 1 | Confirmed table reservation for Table 5 (Party of 6) |
| **Operations Demo** | `DiningSession` | 2 | 1 Settled/Closed session (Table 1) + 1 Active/Open session (Table 4) |
| **Operations Demo** | `Order` | 2 | 1 Completed order (`ORD-001`) + 1 In-Progress order (`ORD-002`) |
| **Operations Demo** | `OrderItem` | 5 | Dishes in `SERVED`, `COOKING`, and `PENDING` kitchen statuses |
| **Operations Demo** | `Bill` | 1 | Completed bill (`BILL-001`) with discount calculation |
| **Operations Demo** | `Payment` | 1 | Settled Cash payment (`PAY-001`) with correct change amount |
| **AI Analytics** | `DishProfitability`| 1 | Historical profitability analysis for Beef Pho (61.82% margin) |
| **AI Analytics** | `AiForecast` | 1 | Revenue demand forecast demo for tomorrow |
| **AI Analytics** | `AiRecommendation`| 1 | Proactive restock alert recommendation for low Truffle Oil |
| **AI Analytics** | `AiAnomaly` | 1 | Consumption anomaly detection record |

---

## 5. Idempotency and Safety Strategy

The seed script is strictly **idempotent**:
1. **Upsert on Unique Keys:** Models with unique identifiers (`Role.name`, `Permission.code`, `User.phone`, `Table.tableNumber`, `Promotion.code`, `ShiftAssignment.userId_shiftId_assignedDate`, `Attendance.shiftAssignmentId`, `Recipe.menuItemId_inventoryItemId`) utilize `prisma.<model>.upsert()`.
2. **Find-or-Create on Business Keys:** Models without native database unique constraints (`Category`, `MenuItem`, `InventoryItem`, `Shift`) check existence before updating or creating.
3. **Deterministic Demo Codes:** Demonstration sessions, receipts, orders, and bills utilize deterministic codes (`SESS-20261124-001`, `ORD-20261124-001`, `BILL-20261124-001`).
4. **Preservation of Existing Data:** Existing users and records are never deleted (`deleteMany` and `truncate` are strictly avoided).

---

## 6. Demonstration-Only Records

The following records are explicitly intended for demonstrating and testing feature workflows:
- **Dining Sessions & Bills:** `SESS-20261124-001` (demonstrates completed dining cycle), `SESS-20261124-002` (demonstrates active kitchen ticket display).
- **Stock Movement:** 1 `OUT_COOKING` movement demonstrating automated stock reduction on food serving.
- **AI Analytics:** Tables `dish_profitability`, `ai_forecasts`, `ai_recommendations`, and `ai_anomalies` contain demonstration records clearly identifying prototype model versions (`operly-sales-prophet-v2.1`).
