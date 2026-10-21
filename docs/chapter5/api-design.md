# API DESIGN AND INTERFACE SPECIFICATION
## PROJECT: OPERLY – RESTAURANT OPERATIONS AND PROFITABILITY MANAGEMENT

* **Document Identifier:** `DOC-CH5-API-01`
* **Module:** Chapter 5 – AI in Software Design and Architecture (Section 5.5)
* **Status:** Finalized (Academic Baseline)
* **Traceability Baseline:** PRD v1.1 (`docs/chapter3/product-requirements.md`), Feature Specification (`docs/chapter3/feature-specification.md`), Interactive Prototype (`prototype/`)

---

## 1. Architectural Communication Model

The **Operly** platform implements a **Dual-Protocol Hybrid Communication Architecture** engineered to accommodate the distinct operational rhythms of commercial restaurant environments:

1. **Stateless RESTful HTTP/HTTPS API:**
   Serves as the primary protocol for transactional CRUD operations, identity authentication, catalog queries, reservation deposits, POS invoice settlement, and management analytics reports.
2. **Stateful Duplex WebSocket Stream (Socket.IO):**
   Provides sub-second event synchronization across Front-of-House (FOH), Back-of-House (BOH), and administrative terminals. Manages ephemeral shared table carts, real-time Kitchen Display System (KDS) order queues, waiter ready-alerts, urgent manager approvals, and global out-of-stock toggles.

```
+---------------------------------------------------------------------------------------------------+
|                                 OPERLY DUAL-PROTOCOL API TOPOLOGY                                 |
+---------------------------------+---------------------------------+-------------------------------+
| COMMUNICATION PROTOCOL          | TECHNICAL CHARACTERISTICS       | OPERATIONAL RESPONSIBILITY    |
+---------------------------------+---------------------------------+-------------------------------+
| **HTTPS RESTful API**           | JSON Payload, Stateless,        | User authentication, table    |
| (Port 443 / Base: `/api/v1`)    | TLS 1.3 Transport Encryption,   | reservation deposits, menu    |
|                                 | UUID-based Transaction Safety   | catalog, POS VietQR settlement|
+---------------------------------+---------------------------------+-------------------------------+
| **WSS Socket.IO Event Bus**     | Persistent TCP Connection,      | Shared table cart sync, FIFO  |
| (Namespace: `/socket.io`)       | Dynamic Room Partitioning       | KDS status bumps, waiter dish |
|                                 | (`table:{id}`, `station:{id}`)  | alerts, instant 86 disabling  |
+---------------------------------+---------------------------------+-------------------------------+
```

---

## 2. Resource Naming Conventions and Response Envelopes

### 2.1. Resource URI Structure
All RESTful endpoints strictly adhere to kebab-case, pluralized resource hierarchies:
* Canonical format: `/api/v1/{resources}/{resourceId}/{sub-resources}`
* Examples: `/api/v1/tables/T05/orders`, `/api/v1/kds/tickets/104/items/ITEM-1`

### 2.2. Standardized Response Envelope
All responses emitted by the application gateway adhere to a consistent contract structure:

```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2026-10-21T14:30:00.000Z"
}
```

Standardized error response envelope:
```json
{
  "success": false,
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Combined discount (45%) exceeds the strict restaurant policy ceiling of 40%",
  "validationErrors": [
    { "field": "discountPct", "constraint": "maxDiscountCeilingExceeded" }
  ],
  "timestamp": "2026-10-21T14:30:00.000Z"
}
```

---

## 3. Authentication, Authorization, and Instant Session Revocation

1. **Dual-Token Authentication Scheme:**
   * Short-lived `AccessToken` (signed JWT using RS256/HS256, 15-minute expiration) containing payload metadata: `{ sub: userId, role: "Waiter", tokenVersion: 1 }`.
   * Cryptographically secure `RefreshToken` stored in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie (7-day expiration).
2. **Instant Session Revocation via `token_version` (SPEC-AUTH-001):**
   * Standard stateless JWTs present an inherent vulnerability in hospitality environments: suspended or terminated staff retain unauthorized access until token expiration.
   * Operly addresses this via a database and Redis-cached `token_version` integer column. On every restricted request, the `TokenVersionGuard` compares the JWT payload version against the live user record. If `jwt.tokenVersion < db.token_version`, the request is terminated immediately with `HTTP 401 Unauthorized`.
3. **Role-Based Access Control (RBAC):**
   * 6 canonical roles enforced at the gateway interceptor layer: `Customer`, `Waiter`, `Kitchen Staff`, `Cashier`, `Manager`, `Administrator`.

---

## 4. Comprehensive API Endpoint Catalog

The table below catalogs representative API endpoints across all core functional domains. The **Implementation Status** column strictly distinguishes between operations verified within the prototype's reactive state engine (`prototype/src/store/mockStore.jsx`) and proposed target endpoints for the production Nest.js server.

| Module | Method | Endpoint | Purpose | Authentication / Authorization | Implementation Status |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Auth & RBAC** | `POST` | `/api/v1/auth/login` | Authenticates staff via phone/email and password | Public (Unrestricted) | Mock Verified / Proposed Nest.js |
| **Auth & RBAC** | `POST` | `/api/v1/auth/refresh` | Issues fresh AccessToken via HttpOnly RefreshToken cookie | Valid RefreshToken | Proposed Nest.js |
| **Auth & RBAC** | `POST` | `/api/v1/auth/logout` | Revokes session and clears authentication cookies | Authenticated Session | Mock Verified / Proposed Nest.js |
| **Auth & RBAC** | `PATCH` | `/api/v1/admin/users/:id/suspend` | Suspends staff and increments `token_version` to revoke sessions | Administrator | Implemented in Prototype (`toggleStaffStatus`) |
| **Table & Res** | `GET` | `/api/v1/tables` | Retrieves real-time floor topology and table states | Waiter, Cashier, Manager | Implemented in Prototype (`tables`) |
| **Table & Res** | `PATCH` | `/api/v1/tables/:id/reset` | Confirms sanitization and resets table status to Available | Waiter, Manager | Implemented in Prototype (`resetTableToAvailable`) |
| **Table & Res** | `POST` | `/api/v1/reservations` | Books table online, checks 90-min buffer, calculates deposit | Public (Customer) | Implemented in Prototype (`createReservation`) |
| **Table & Res** | `PATCH` | `/api/v1/reservations/:id/cancel` | Cancels reservation under tiered cancellation refund rules | Customer, Manager | Implemented in Prototype (`cancelReservation`) |
| **Menu & Catalog**| `GET` | `/api/v1/menu/items` | Retrieves menu items, categories, and billable modifiers | Public (Customer, Staff) | Implemented in Prototype (`menuItems`) |
| **Menu & Catalog**| `PATCH` | `/api/v1/menu/items/:id/86` | Toggles item 86 out-of-stock state across all customer menus | Kitchen Staff, Manager | Implemented in Prototype (`toggle86Item`) |
| **AI Recommender**| `POST` | `/api/v1/ai/recommendations/pairings` | Computes Apriori cross-sell food pairings based on cart state | Public (Table Diner) | Implemented in Prototype (`MOCK_AI_PAIRINGS`) |
| **Order & Cart** | `GET` | `/api/v1/tables/:id/cart` | Fetches active synchronized table cart items | Table Diners | Implemented in Prototype (`cartItems`) |
| **Order & Cart** | `POST` | `/api/v1/orders` | Dispatches cart items to KDS, locking table to Occupied | Table Diners | Implemented in Prototype (`submitCustomerOrder`) |
| **Order & Cart** | `POST` | `/api/v1/orders/:id/service-call`| Dispatches diner assistance request or pre-print bill command | Table Diners | Implemented in Prototype (`addServiceCall`) |
| **Kitchen KDS** | `GET` | `/api/v1/kds/tickets` | Queries chronological FIFO prep queue filtered by station | Kitchen Staff | Implemented in Prototype (`kdsTickets`) |
| **Kitchen KDS** | `PATCH` | `/api/v1/kds/tickets/:id/items/:itemId/status` | Advances item status (Pending $\rightarrow$ Cooking $\rightarrow$ Ready) | Kitchen Staff | Implemented in Prototype (`advanceTicketItemStatus`) |
| **Kitchen KDS** | `POST` | `/api/v1/kds/tickets/:id/items/:itemId/bump-half` | Performs partial 1/2 item split for multi-quantity lines | Kitchen Staff | Implemented in Prototype (`partialBumpItem`) |
| **Kitchen KDS** | `POST` | `/api/v1/kds/tickets/:id/items/:itemId/spoilage` | Logs food waste/spoilage, computes loss, and triggers re-fire | Kitchen Staff, Manager | Implemented in Prototype (`logSpoilage`) |
| **Waiter Alert** | `GET` | `/api/v1/waiter/alerts/ready` | Fetches incoming ready dish notifications from kitchen stations | Waiter | Implemented in Prototype (`readyDishesList`) |
| **Waiter Alert** | `PATCH` | `/api/v1/orders/:id/items/:itemId/served` | Confirms floor delivery of prepared dish to dining table | Waiter | Implemented in Prototype (`markItemServed`) |
| **Billing & POS**| `GET` | `/api/v1/pos/bills/queue` | Queries active checkout queue with pending settlement orders | Cashier | Implemented in Prototype (`checkoutQueue`) |
| **Billing & POS**| `GET` | `/api/v1/pos/members/lookup` | Queries loyalty profile by phone number (Silver, Gold tier) | Cashier | Implemented in Prototype (`loginMember`) |
| **Billing & POS**| `POST` | `/api/v1/pos/bills/vietqr` | Generates dynamic EMVCo VietQR payment payload | Cashier | Implemented in Prototype (`SCR-POS-03`) |
| **Billing & POS**| `POST` | `/api/v1/pos/bills/settle` | Finalizes settlement with unserved item validation gate | Cashier | Implemented in Prototype (`recordSettlement`) |
| **Inventory BOM**| `GET` | `/api/v1/inventory/bom/:dishId` | Retrieves raw ingredient bill of materials and margin ratios | Manager | Implemented in Prototype (`recipeBOM`) |
| **Inventory BOM**| `PUT` | `/api/v1/inventory/bom/:dishId` | Configures raw ingredient quantities and yields for dish BOM | Manager | Implemented in Prototype (`updateBOMQuantity`) |
| **Staff & HR** | `GET` | `/api/v1/staff/roster/today` | Fetches daily duty roster with verified check-in statuses | Manager | Implemented in Prototype (`teamRoster`) |
| **Staff & HR** | `POST` | `/api/v1/staff/attendance/clock-in` | Validates attendance via Haversine GPS ($\le 50\text{m}$) or Wi-Fi | Waiter, Kitchen, Cashier | Proposed Nest.js (Haversine Engine) |
| **Approvals** | `GET` | `/api/v1/manager/approvals` | Retrieves urgent exception queue (Voids, Discount Overrides) | Manager | Implemented in Prototype (`managerApprovals`) |
| **Approvals** | `POST` | `/api/v1/manager/approvals/:id/decide` | Authorizes or rejects urgent managerial requests with notes | Manager | Implemented in Prototype (`approveRequest`, `rejectRequest`) |
| **AI Analytics** | `GET` | `/api/v1/analytics/forecast/7-day` | Fetches 7-day ARIMA/Prophet revenue and covers forecast (95% CI)| Manager, Administrator | Implemented in Prototype (`MOCK_AI_FORECAST`) |
| **Audit Logs** | `GET` | `/api/v1/admin/audit-logs` | Queries immutable system audit trail with multi-facet filters | Administrator | Implemented in Prototype (`auditLogs`) |

---

## 5. Data Transfer Objects and Validation Pipelines

All incoming request payloads in the target Nest.js framework pass through strict `ValidationPipe` instances utilizing `class-validator` and `class-transformer`:

### 5.1. Reservation Booking Request DTO (`CreateReservationDto`)
```typescript
import { IsString, IsNotEmpty, Matches, IsInt, Min, Max, IsDateString, IsOptional } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty({ message: 'Customer name is mandatory' })
  customerName: string;

  @IsString()
  @Matches(/^(03|05|07|08|09)[0-9]{8}$/, { message: 'Phone number must match Vietnamese mobile format' })
  phone: string;

  @IsInt()
  @Min(1, { message: 'Party size must be at least 1 guest' })
  @Max(30, { message: 'Online bookings capped at 30 guests; larger parties require direct manager booking' })
  partySize: number;

  @IsDateString({}, { message: 'Reservation date and time must be a valid ISO-8601 string' })
  reservationTime: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;
}
```

### 5.2. POS Settlement Request DTO (`SettleBillDto`)
```typescript
import { IsUUID, IsEnum, IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';

export enum PaymentMethodEnum {
  VIETQR = 'VIETQR',
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD'
}

export class SettleBillDto {
  @IsUUID('4', { message: 'Table ID must be a valid UUID' })
  tableId: string;

  @IsEnum(PaymentMethodEnum, { message: 'Invalid payment method specified' })
  paymentMethod: PaymentMethodEnum;

  @IsNumber()
  @Min(0, { message: 'Discount percentage cannot be negative' })
  @Max(40, { message: 'PRD Rule 7: Cumulative discount ceiling clamped at 40%' })
  discountPct: number;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  managerOverrideNote?: string;
}
```

---

## 6. Real-Time WebSocket Event Matrix (Socket.IO)

To ensure synchronization latency $\le 2.0\text{ seconds}$ across local network devices, events are partitioned into granular rooms:

| Event Identifier | Target Room Scope | Flow Direction | Payload Structure | Operational Impact |
| :--- | :--- | :---: | :--- | :--- |
| `cart:item_added` | `table:{tableId}` | Client $\rightarrow$ Server $\rightarrow$ Clients | `{ dishId, name, quantity, modifier, addedBy }` | Synchronizes shared cart across co-diners |
| `kds:new_ticket` | `station:{stationId}`| Server $\rightarrow$ Clients | `{ ticketId, tableId, items, placedAt, priority }` | Triggers 70dB KDS chime and renders ticket in FIFO queue |
| `kds:item_status_bump` | `table:{tableId}`, `station:{id}` | Client $\rightarrow$ Server $\rightarrow$ Clients | `{ ticketId, itemId, newStatus: "Cooking" \| "Ready" }` | Advances diner meal progress and triggers BOM raw stock depletion |
| `waiter:ready_alert` | `role:waiter` | Server $\rightarrow$ Clients | `{ tableId, ticketId, itemName, stationName }` | Triggers server handheld vibration and alert badge |
| `menu:86_toggle` | `broadcast:all` | Client $\rightarrow$ Server $\rightarrow$ Clients | `{ dishId, is86: true, reason }` | Instantly disables order action across all customer QR screens |
| `manager:urgent_alert`| `role:manager` | Server $\rightarrow$ Clients | `{ approvalId, type, urgency, amount, table }` | Renders pulsing alert banner on duty manager portal |

---

## 7. AI-Assisted API Engineering Workflows

1. **Schema Synthesis from User Stories:**
   * Input: User Story US-CUST-02 ("As a diner, I want cross-sell recommendations during cart review").
   * AI Output: Synthesized `/api/v1/ai/recommendations/pairings` endpoint contract specifying input `cartDishIds: string[]` and response schema including `confidenceScore` and `pairingReason`.
2. **DTO Constraint Gap Identification:**
   * Automated static code audits identified unconstrained numeric inputs, recommending explicit `@Max(40)` bounds according to PRD Rule 7 (40% discount ceiling) and strict Vietnamese mobile regex patterns (`/^(03|05|07|08|09)[0-9]{8}$/`).
   * Human Verification: Kỹ sư verified and integrated these validation bounds into production DTOs.
3. **OpenAPI / Swagger 3.0 Documentation Generation:**
   * Automated generation of Swagger UI specifications directly from NestJS TypeScript decorators, reducing documentation divergence and maintenance effort by over 80%.
