# 3.3 PRODUCT REQUIREMENTS SPECIFICATION: OPERLY
## RESTAURANT OPERATIONS AND PROFITABILITY MANAGEMENT

* **Document:** Final Product Requirements Specification (SRS / Detailed PRD)
* **Module:** Chapter 3 – Requirements Engineering (Section 3.3)
* **Version:** 1.1 (Final Approved Specification)
* **Status:** Finalized

---

## 1. Scope Boundary & System Architecture

Operly is bounded within the physical and operational boundaries of a medium-sized standalone restaurant. The system interfaces with 6 user roles via specialized responsive client interfaces communicating with a centralized Node.js/Express or NestJS backend via RESTful APIs and real-time Socket.IO event buses.

```
+-----------------------------------------------------------------------------------------+
|                               OPERLY SYSTEM BOUNDARY MATRIX                             |
+-----------------------------------+-----------------------------------------------------+
| IN-SCOPE SYSTEM BOUNDARIES        | OUT-OF-SCOPE EXCLUSIONS                             |
+-----------------------------------+-----------------------------------------------------+
| • Multi-role Authentication & RBAC| • Multi-branch franchise hierarchy & central ERP    |
| • Reservation & Tiered Deposit    | • Third-party food delivery aggregator dispatching  |
| • Contactless QR Ordering (Guest) | • Automated vendor supply chain EDI integration     |
| • Multi-diner Shared Table Cart   | • Direct government tax authority e-invoicing API   |
| • Real-time Floor & Table Topology| • Low-level hardware drivers for bank card terminals|
| • FIFO Kitchen Display (KDS)      |                                                     |
| • BOM Inventory Depletion at Cook |                                                     |
| • Kitchen Spoilage & Waste Log    |                                                     |
| • POS Split Billing & VietQR      |                                                     |
| • Dual-mode Geofenced Attendance  |                                                     |
| • 7-day AI Demand & Sales Forecast|                                                     |
| • Immutable System Audit Logs     |                                                     |
+-----------------------------------+-----------------------------------------------------+
```

---

## 2. Detailed Functional Requirements (FR)

| Req ID | Module / Feature Name | Primary Actor | Detailed Description & Business Logic | System Inputs | System Outputs |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-001** | Authentication & RBAC | All Actors | Authenticates users via Phone/Email and Password. Issues short-lived Access JWTs (15 min) and HttpOnly Refresh Tokens. Enforces role-based authorization at the middleware layer. Implements token versioning in database to allow immediate session invalidation upon staff suspension. | Login credentials, refresh tokens. | Signed JWT token, role metadata, authorized UI redirection. |
| **FR-002** | Online Reservation & Deposit | Customer, Waiter, Manager | Users book a table specifying date, timeslot, party size, and optional pre-ordered items. If pre-order $\ge 1,000,000$ VND or party $\ge 8$, enforce deposit: $\max(40\% \text{ pre-order value}, \text{party count} \times 50,000 \text{ VND})$. Imposes 90-minute buffer per table. Enforces tiered cancellation refunds. | Booking date/time, party size, contact info, deposit transaction. | Booking Code, deposit receipt, locked table allocation, SMS/Email confirmation. |
| **FR-003** | QR Menu & Multi-Diner Ordering | Customer, Waiter | Diners scan a table QR code to open the menu in **Guest Mode** (ephemeral table session) or **Member Mode**. Diners at the same table join a shared WebSocket room (`table:{id}`) with a synchronized active cart. Supports dish modifier additions with billable pricing and BOM impact. Order dispatch locks table to `Occupied`. | Scanned Table Token, cart items, billable modifiers, prep notes. | Order ID, ticket status `Created`, synchronized dispatch to KDS and floor servers. |
| **FR-004** | AI Food Recommender | Customer | When diners view the cart or browse items, an AI association module (Apriori co-occurrence scoring) recommends 2–4 complementary items. Suppresses out-of-stock ("86") items. Falls back to top-selling items if historical training samples $< 500$ orders. | Current cart items, time of day, historical order patterns. | "Frequently Paired With" carousel with dish thumbnails, modifier prices, and 1-tap add. |
| **FR-005** | Real-Time Table Topology | Waiter, Cashier, Manager | Displays floor plans segmented by zones/floors with 4 states: `Available`, `Reserved`, `Occupied`, `Cleaning`. Moving from `Cleaning` back to `Available` requires explicit manual confirmation by Waiter/Busser after sanitization. | Table touch events, status toggle, table merge/transfer command. | Instant visual floor map state synchronization ($< 2$s) across all active terminals. |
| **FR-006** | Kitchen Display System (KDS) | Kitchen Staff | Chronological FIFO prep queue grouped by station (Grill, Fryer, Sauté, Pantry). Line cooks advance statuses: `Pending` $\rightarrow$ `Cooking` $\rightarrow$ `Ready`. Supports partial item fulfillment (e.g., fulfill 1 of 2 ordered steaks). Emits 500ms 70dB audio alert on new ticket. Supports 1-tap "86" item toggle. | Tap on dish state, partial fulfillment split, 86 item trigger, ticket priority bump. | Updated ticket state, KDS audio alert, push alert to assigned floor waiter. |
| **FR-007** | Real-Time Event Dispatch & Catch-up | All Actors | Socket.IO duplex event bus broadcasting operational state changes. Implements an automatic state re-fetch reconciliation API (`/api/v1/sync/state`) triggered upon client socket reconnect to prevent missed events during network drops. | System business event triggers, socket reconnection events. | Audio chimes, visual badge updates, push banners, state resynchronization. |
| **FR-008** | POS Checkout & Settlement | Cashier | Displays checkout queue with active bills. Prices are locked to order-creation snapshot. Applies member tier discounts and coupon codes (cumulative discount ceiling $\le 40\%$). Handles equal and itemized split bills. Dynamic VietQR code generation. Cash rounding to nearest 1,000 VND. | Table ID, member phone, voucher code, tender selection. | Settled invoice (`Paid`), receipt print command, table shifted to `Cleaning`, loyalty points credited. |
| **FR-009** | Recipe BOM Depletion & Spoilage | Manager, Kitchen Staff | Maps each menu item and billable modifier to raw ingredient BOM. **Inventory depletion is executed at the database level when a dish transitions to `Cooking`**. Cancelling an item in `Cooking` logs an entry in the Kitchen Spoilage / Wastage Log without stock rollback. Emits low-stock dashboard alerts when stock $\le$ safety threshold. | Dish recipe BOMs, PO receiving slips, wastage/spoilage entries. | Live stock balance decrement, wastage audit logs, low-stock threshold alerts. |
| **FR-010** | Staff Scheduling & Geofenced Attendance | Manager, Waiter, Cashier, Kitchen | Manager builds weekly shift rosters with overlap prevention. Staff clock in/out on mobile devices. Validates device GPS coordinates ($\le 50\text{m}$ radius). If GPS horizontal accuracy $> 50\text{m}$, validates attendance against restaurant Wi-Fi BSSID / public IP whitelist. | Device GPS coords, Wi-Fi BSSID/IP, server timestamp, shift schedule. | Verified clock-in record, tardiness flags, monthly labor payroll summary. |
| **FR-011** | Tiered Loyalty & Rewards | Customer, Cashier, Manager | Accrues 1 point per 10,000 VND spent. Automatically manages membership tiers: Bronze (Default), Silver (Spent $> 5,000,000$ VND, 5% off), Gold (Spent $> 15,000,000$ VND, 10% off). Point redemptions capped at a maximum of $30\%$ of invoice total. | Customer phone number, net bill expenditure, point redemption amount. | Accrued points, updated member tier, redeemed discount credit. |
| **FR-012** | Business Intelligence & AI Analytics | Manager, Admin | Visualizes sales revenue, COGS, labor cost ratios, and top-selling items. Executes time-series machine learning models (ARIMA / Prophet baseline) projecting 7-day revenue, table covers, and ingredient prep demand with $95\%$ confidence intervals. | Historical sales ledgers, shift costs, seasonal calendar indicators. | Interactive BI dashboards, 7-day demand projections, suggested procurement quantities. |
| **FR-013** | Kitchen Spoilage & Wastage Tracking | Kitchen Staff, Manager | Dedicated module allowing Head Chef or Manager to log discarded ingredients, dropped plates, or expired batches with mandatory category tags (Prep Loss, Dropped Plate, Overcooked, Expired). Updates theoretical inventory balance. | Ingredient ID / Dish ID, quantity/weight, reason tag, responsible staff ID. | Wastage audit entry, cost of waste metric, inventory shrinkage adjustment. |

---

## 3. Non-Functional Requirements (NFR)

### 3.1. Performance & Latency
* **Socket Propagation Latency:** All operational events (order placement, dish state bump, floor color mutation) must broadcast and render on active client screens within $\le 2.0$ seconds under normal local network load.
* **API Response Time:** $95\%$ of transactional REST API requests must complete in $p95 \le 300\text{ ms}$.
* **Client App Performance:** First Contentful Paint (FCP) $\le 1.8$ seconds; Time to Interactive (TTI) $\le 2.5$ seconds on standard mobile 4G connections. UI rendering must maintain a smooth 60 FPS profile.

### 3.2. Security & Compliance
* **Transport Encryption:** Mandatory HTTPS/TLS 1.3 across all HTTP endpoints; WSS (WebSocket Secure) for real-time duplex streams.
* **Password Hashing:** Passwords must be hashed using `Bcrypt` with a salt work factor of $\ge 10$. Plaintext passwords must never be stored or logged.
* **Token Security & Instant Invalidation:** Short-lived JWT Access Tokens (15-minute expiry) paired with HttpOnly, Secure, SameSite=Strict Refresh Tokens. The auth middleware must validate a database/Redis `token_version` on every restricted request to guarantee immediate session termination when an account is suspended.
* **Input Validation & Sanitization:** All phone numbers must match Vietnamese regex (`^(03|05|07|08|09)[0-9]{8}$`). All inputs must be strictly typed and sanitized against SQL/NoSQL injections and XSS attacks.
* **Immutable Audit Trail:** Sensitive financial and operational actions (voids, price changes, refunds, stock adjustments) must write read-only records containing: timestamp, actor ID, client IP, action name, and before/after JSON payloads.

### 3.3. Availability, Reliability & Recovery
* **System Uptime:** $\ge 99.5\%$ availability during operating hours (07:00 to 23:59).
* **Socket Reconnection Catch-Up:** In the event of temporary Wi-Fi disconnection, clients must execute an automated exponential backoff reconnection loop. Upon reconnecting, the client must trigger `/api/v1/sync/state` to reconcile any missed orders, table mutations, or notifications.
* **Payment Webhook Resilience:** Cashier POS interface must provide a manual "Check Gateway Status" action to query the payment gateway API directly in case incoming bank webhooks experience network delay.

### 3.4. Usability & Device Ergonomics
* **Responsive Breakpoints:** Desktop ($> 1024\text{px}$) for Cashier POS and Manager Portal; Tablet ($768\text{px} - 1024\text{px}$) for Kitchen KDS; Mobile ($< 768\text{px}$) for Customer QR and Waitstaff apps.
* **Waiter Ergonomics:** Waiter mobile interface must be designed for single-handed thumb navigation with minimum interactive touch targets of $48 \times 48\text{ px}$.
* **Kitchen KDS Visibility:** High-contrast display with minimum 24pt typography, readable from a 2-meter distance under high-heat, high-glare kitchen environments.

### 3.5. Testability
* **Deterministic AI Testing:** Automated unit and integration test suites for the AI Recommendation module and Predictive Forecasting module must assert against a fixed synthetic dataset with pinned random seeds to prevent non-deterministic CI/CD build failures.
* **Measurable Usability Acceptance:** Checkout workflow completion must require $\le 4$ user clicks on the POS interface.

---

## 4. Business Rules & Operational Policies

1. **Reservation Table Buffer:** A physical table cannot be assigned to two bookings unless separated by at least a 90-minute operational window.
2. **Deposit Calculation Policy:** If pre-order total $\ge 1,000,000$ VND or party size $\ge 8$, deposit is mandatory and equals $\max(40\% \text{ of pre-order}, \text{party size} \times 50,000 \text{ VND})$.
3. **Cancellation & Refund Schedule:**
   * $\ge 24$ hours prior: $100\%$ refund (minus $2\%$ gateway fee).
   * $6 - 24$ hours prior: $50\%$ refund.
   * $< 6$ hours prior or No-Show ($> 20$ mins late): $0\%$ refund.
4. **Order Price Snapshot:** Dish prices and billable modifier fees are permanently snapshotted at the exact time of order placement. Mid-shift price changes configured by the Manager only apply to newly placed orders.
5. **Inventory Depletion Point:** Raw ingredient stock is deducted from database inventory records when a dish moves to `Cooking`. Items cancelled in `Cooking` require a Spoilage Log entry and do not restore raw stock.
6. **Payment Finalization Gate:** A check cannot be finalized to `Paid` if any line item remains in `Pending` or `Cooking` state. Items must be either `Served` or officially `Cancelled` / `Spoiled`.
7. **Discount Stacking Ceiling:** Combined loyalty tier discounts and promotional coupons cannot exceed a maximum cumulative discount of $40\%$ of the gross food total.
8. **Loyalty Point Redemption Limit:** Customer reward points can be redeemed for a maximum discount equivalent to $30\%$ of the net invoice total.
9. **Managerial Authorization:** Ticket voids, invoice refunds, and manual inventory stock adjustments strictly require Manager credential verification (Passcode/PIN).
10. **Table State Reset:** Transitioning a table from `Cleaning` back to `Available` requires manual confirmation from floor staff or bussers.

---
*End of Document: 3.3 Product Requirements Specification.*
