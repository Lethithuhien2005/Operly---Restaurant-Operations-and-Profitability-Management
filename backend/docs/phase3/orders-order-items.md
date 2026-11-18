# Module 5: Orders and Order Items

## 1. Feature Overview
Module 5 implements the real-time dining order lifecycle and commercial kitchen dispatch engine. It provides atomic order creation with transactional safety, dynamic server-side pricing and subtotal/total calculations, association with active dining sessions, tables, and branches, real-time item status transitions for the Kitchen Display System (KDS), and strict protection against modifying or deleting items already in preparation.

---

## 2. Implemented Backend Functionality
- **Transactional Order Creation**:
  - Entire order batch creation executed inside an ACID database transaction (`$transaction`).
  - Resolves dining session by explicit `sessionId` or automatically finds/opens an active session by `tableId`.
  - Automatically shifts table status to `OCCUPIED` upon order placement.
- **Backend Price Calculation & Snapshotting**:
  - Validates all dish references against active catalog.
  - Snapshots current selling price (`unitPrice`) and recipe cost (`costPrice`) for historical reporting and margin analysis.
  - Computes item line totals (`unitPrice * quantity`) and order `totalAmount` on the backend.
- **86 Out-of-Stock Protection**:
  - Rejects any order containing an item that is currently 86'd (`isAvailable: false`).
- **Dynamic Item Management**:
  - Add items to an active order with automatic recalculation of order total.
  - Update item quantities and preparation notes with total recalculation.
  - Remove items from an order with total recalculation.
- **Kitchen Preparation Protection**:
  - Prevents removing or deleting an item if its status is `COOKING`, `READY`, or `SERVED` (`400 Bad Request`).
- **KDS Item Status Transitions**:
  - Updates individual dish statuses: `PENDING` $\rightarrow$ `COOKING` $\rightarrow$ `READY` $\rightarrow$ `SERVED` / `REJECTED`.
  - Automatically bumps overall order status to `SERVED` once all dishes are served or rejected.

---

## 3. API Endpoints & HTTP Methods

| Method | Endpoint | Description | Auth / Roles | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/orders` | Create an order batch with nested items | Public / Diners / Waiters | `201 Created` |
| `GET` | `/api/v1/orders` | Query orders (`?sessionId=&tableId=&branchId=&status=&date=`) | Public / Authenticated | `200 OK` |
| `GET` | `/api/v1/orders/:id` | Get order details with nested dishes, table, and branch | Public / Authenticated | `200 OK` |
| `PATCH` | `/api/v1/orders/:id` | Update order overall status or assign waiter | `ADMIN`, `MANAGER`, `WAITER` | `200 OK` |
| `POST` | `/api/v1/orders/:id/items` | Add additional items to an active order | Diners / Waiter / Manager | `201 Created` |
| `PATCH` | `/api/v1/orders/:id/items/:itemId` | Update item quantity or preparation notes | Diners / Waiter / Manager | `200 OK` |
| `PATCH` | `/api/v1/orders/:id/items/:itemId/status` | Update KDS kitchen prep status (`COOKING`, `READY`, etc.) | `ADMIN`, `MANAGER`, `CHEF`, `WAITER` | `200 OK` |
| `DELETE` | `/api/v1/orders/:id/items/:itemId` | Remove item (protected against cooking/served state) | `ADMIN`, `MANAGER`, `WAITER` | `200 OK` |

---

## 4. Request and Response DTOs
- `CreateOrderDto`:
  - `sessionId` (UUID, optional if tableId provided)
  - `tableId` (UUID, optional if sessionId provided)
  - `waiterId` (UUID, optional)
  - `items` (`CreateOrderItemDto[]`, minimum 1 item)
- `CreateOrderItemDto`:
  - `menuItemId` (UUID, required)
  - `quantity` (integer 1-50, required)
  - `unitPrice` (number, optional price override; defaults to active menu price)
  - `notes` (string, optional)
- `AddOrderItemsDto`: `items` (`CreateOrderItemDto[]`)
- `UpdateOrderDto`: `status` (`OrderStatus` enum, optional), `waiterId` (UUID, optional)
- `UpdateOrderItemDto`: `quantity` (integer 1-50, optional), `notes` (string, optional)
- `UpdateOrderItemStatusDto`: `itemStatus` (`OrderItemStatus` enum, required), `rejectionReason` (string, optional)
- `OrderQueryDto`: `sessionId`, `tableId`, `branchId`, `status`, `date`

---

## 5. Database Models & Relationships
```prisma
model Order {
  id          String      @id @default(uuid()) @db.Uuid
  orderCode   String      @unique @map("order_code")
  sessionId   String      @map("session_id") @db.Uuid
  waiterId    String?     @map("waiter_id") @db.Uuid
  status      OrderStatus @default(CREATED)
  totalAmount Decimal     @default(0) @map("total_amount") @db.Decimal(12, 2)
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  session     DiningSession @relation(fields: [sessionId], references: [id])
  waiter      User?         @relation(fields: [waiterId], references: [id])
  orderItems  OrderItem[]

  @@map("orders")
}

model OrderItem {
  id              String          @id @default(uuid()) @db.Uuid
  orderId         String          @map("order_id") @db.Uuid
  menuItemId      String          @map("menu_item_id") @db.Uuid
  quantity        Int             @default(1)
  unitPrice       Decimal         @map("unit_price") @db.Decimal(12, 2)
  costPrice       Decimal         @map("cost_price") @db.Decimal(12, 2)
  notes           String?
  itemStatus      OrderItemStatus @default(PENDING) @map("item_status")
  rejectionReason String?         @map("rejection_reason")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  order           Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItem        MenuItem        @relation(fields: [menuItemId], references: [id])
  stockMovements  StockMovement[]

  @@map("order_items")
}
```

---

## 6. Validation and Business Rules
1. Orders must contain at least one valid item.
2. Dishes must exist and have `isAvailable: true` (cannot order 86'd dishes).
3. If `sessionId` is provided, session status must be `OPEN` or `PAYING`.
4. If `tableId` is provided, attaches to the active dining session or automatically opens a new dining session and sets table status to `OCCUPIED`.
5. An order in `COMPLETED` or `CANCELLED` status cannot accept additional items.
6. Order items with status `COOKING`, `READY`, or `SERVED` cannot be deleted (`400 Bad Request`).
7. Modifying quantities or adding/removing items automatically updates `order.totalAmount`.

---

## 7. Authentication and Authorization Requirements
- Order placement: Open to customer QR table clients and floor staff.
- Order overall status updates: Restricted to `ADMIN`, `MANAGER`, and `WAITER`.
- Kitchen preparation updates (`itemStatus`): Accessible to `ADMIN`, `MANAGER`, `CHEF`, and `WAITER`.
- Item cancellation/removal: Accessible to `ADMIN`, `MANAGER`, and `WAITER`.

---

## 8. Important Files Created or Modified
- `backend/src/modules/orders/dto/create-order-item.dto.ts`
- `backend/src/modules/orders/dto/create-order.dto.ts`
- `backend/src/modules/orders/dto/add-order-items.dto.ts`
- `backend/src/modules/orders/dto/update-order.dto.ts`
- `backend/src/modules/orders/dto/update-order-item.dto.ts`
- `backend/src/modules/orders/dto/update-order-item-status.dto.ts`
- `backend/src/modules/orders/dto/order-query.dto.ts`
- `backend/src/modules/orders/orders.service.ts`
- `backend/src/modules/orders/orders.controller.ts`
- `backend/src/modules/orders/orders.module.ts`
- `backend/src/modules/orders/orders.service.spec.ts`
- `backend/src/app.module.ts`: Registered `OrdersModule`.
- `backend/src/app.controller.ts`: Removed placeholder mock endpoint.

---

## 9. Testing Performed and Results
- Unit testing with Vitest: 4 unit tests in `orders.service.spec.ts` testing transactional creation, calculation of totals, 86 rejection, cooking item deletion protection, and item removal total adjustments. All passed.
- Overall suite test: 45 passed tests across 8 test suites.
- TypeScript compiler verification via `nest build`: Passed with 0 errors.

---

## 10. Remaining Issues or Incomplete Functionality
None. Module 5 is completely implemented, verified, and documented.
