# 3.5 FEATURE SPECIFICATION: OPERLY
## RESTAURANT OPERATIONS AND PROFITABILITY MANAGEMENT

* **Document:** Detailed Feature Specification for Engineering
* **Module:** Chapter 3 – Requirements Engineering (Section 3.5)
* **Status:** Finalized

---

## 1. Architectural Feature Map

```
+-----------------------------------------------------------------------------------------+
|                                OPERLY FEATURE ARCHITECTURE                              |
+-----------------------------------------------------------------------------------------+
| [CLIENT LAYER]                                                                          |
| • Customer Web App (Responsive HTML5 QR / Reservation Portal)                           |
| • Waiter Handheld PWA (Single-handed touch UI)                                          |
| • Kitchen Display System (High-contrast Tablet/Monitor UI)                              |
| • Cashier POS Station (Desktop / Tablet Checkout UI)                                    |
| • Manager / Admin Dashboard (Desktop Analytics & Control Center)                        |
+-----------------------------------------------------------------------------------------+
| [API & APPLICATION GATEWAY LAYER]                                                       |
| • REST API Endpoints (Express / NestJS)                                                  |
| • WebSocket Event Gateway (Socket.IO duplex message router)                             |
| • Security Middleware (JWT Validator, RBAC Interceptor, Token Version Checker)          |
+-----------------------------------------------------------------------------------------+
| [DOMAIN ENGINES & SERVICES]                                                             |
| • Reservation & Deposit Engine     • Shared Table Cart Synchronizer                     |
| • AI Recommender Service (Apriori) • KDS State & Station Dispatcher                     |
| • BOM Inventory Depletion Engine   • Split-Billing & VietQR Generator                   |
| • Dual-Mode Geofence Validator     • AI Time-Series Forecaster (ARIMA/Prophet)          |
+-----------------------------------------------------------------------------------------+
| [DATA STORAGE & LOGGING LAYER]                                                          |
| • PostgreSQL / MongoDB (Transactional Operational Data)                                 |
| • Redis (Live Socket Session Store & Ephemeral Cart State)                              |
| • Append-Only AuditLogs Collection                                                      |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Feature Specifications

### 2.1. Feature 1: Authentication & Role-Based Access Control (RBAC)
* **Feature ID:** SPEC-AUTH-001
* **Components:** Identity Provider, JWT Issuer, RBAC Middleware, Session Revocation Service.
* **Token Specification:**
  * `AccessToken`: Signed RS256/HS256 JWT, payload contains `userId`, `role`, `tokenVersion`. Expires in 15 minutes.
  * `RefreshToken`: Cryptographically random UUID/hash stored in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie. Expires in 7 days.
* **Instant Session Revocation:**
  * When an Administrator suspends an employee, the user's `token_version` column in the database is incremented.
  * Every authenticated API request checks the JWT payload `tokenVersion` against the live database or Redis cache; if mismatched, request returns `401 Unauthorized` immediately.
* **Permission Matrix:**
  | Permission | Customer | Waiter | Kitchen | Cashier | Manager | Admin |
  | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
  | Browse Menu & Order | Yes | Yes | Read-only | Read-only | Yes | Yes |
  | Update Table States | No | Yes | No | Yes | Yes | Yes |
  | Advance KDS Tickets | No | No | Yes | No | Yes | Yes |
  | Process Checkout & Bills | No | No | No | Yes | Yes | Yes |
  | Approve Voids / Refunds | No | No | No | No | Yes | Yes |
  | Edit Menu & BOM Recipes | No | No | No | No | Yes | Yes |
  | View AI Sales Forecasts | No | No | No | No | Yes | Yes |
  | Manage Users & Roles | No | No | No | No | No | Yes |

---

### 2.2. Feature 2: Online Reservation & Advance Deposit Engine
* **Feature ID:** SPEC-RES-002
* **Components:** Reservation Booking Controller, Conflict Buffer Validator, Deposit Calculator, Payment Callback Webhook.
* **Table Conflict Algorithm:**
  * Buffer duration: 90 minutes.
  * For requested booking time $T_{\text{req}}$ on Table $X$:
    $$\text{Conflict exists if: } |T_{\text{existing}} - T_{\text{req}}| < 90\text{ minutes}$$
* **Deposit Calculation Formula:**
  $$\text{Deposit} = \begin{cases} 
  0 & \text{if } \text{partySize} < 8 \text{ and } \text{preOrderTotal} < 1,000,000\text{ VND} \\
  \max(0.40 \times \text{preOrderTotal}, \text{partySize} \times 50,000) & \text{otherwise}
  \end{cases}$$
* **Refund Lifecycle:**
  * Cancelled $\ge 24\text{h}$: $100\%$ deposit refunded (minus $2\%$ payment processing fee).
  * Cancelled $6\text{h} - 24\text{h}$: $50\%$ deposit refunded.
  * Cancelled $< 6\text{h}$ or No-Show ($> 20\text{m}$ late): $0\%$ refund. Table unlocked to `Available`.

---

### 2.3. Feature 3: QR Self-Ordering & Multi-Diner Live Cart Sync
* **Feature ID:** SPEC-QR-003
* **Components:** Table QR Token Decoder, WebSocket Room Hub (`table:{id}`), Cart Conflict Serializer.
* **Dual-Mode Access:**
  * **Guest Mode:** Scanning QR generates an ephemeral session bound strictly to Table Token and client browser UUID. Zero login prompt.
  * **Member Mode:** Optional phone entry during cart review to apply loyalty points and member tier discounts.
* **Shared Cart Synchronization Payload (Socket.IO):**
  ```json
  {
    "event": "cart:item_added",
    "tableId": "TBL-05",
    "item": {
      "dishId": "DISH-104",
      "name": "Seafood Spicy Hotpot",
      "quantity": 1,
      "price": 280000,
      "modifiers": [
        { "modifierId": "MOD-01", "name": "Less Spicy", "price": 0 }
      ]
    },
    "addedBy": "Guest-A",
    "version": 4
  }
  ```

---

### 2.4. Feature 4: AI Food Recommendation Service
* **Feature ID:** SPEC-AI-004
* **Components:** Co-Occurrence Association Scorer (Apriori), Cart State Inspector, Fallback Heuristic.
* **Scoring Formula (Support & Confidence):**
  $$\text{Confidence}(A \rightarrow B) = \frac{\text{Transactions containing both } A \text{ and } B}{\text{Transactions containing } A}$$
  * For active cart items $\{A_1, A_2, \dots\}$, select top 3 candidates $B$ with highest Confidence where $B \notin \text{Cart}$ and $B.\text{is86} == \text{false}$.
* **Cold-Start Fallback:**
  * When total historical orders $< 500$, model defaults to ranking items by:
    $$\text{Score}(B) = \text{GrossMargin}(B) \times \text{SalesVolumeRank}(B)$$

---

### 2.5. Feature 5: Real-Time Table Topology & Floor Map
* **Feature ID:** SPEC-FLOOR-005
* **Components:** Floor Plan Visualizer, Table State Machine, Waiter Notification Interceptor.
* **State Transition Lifecycle:**
  ```
  +-------------+   Guest scans QR / Waiter seats   +--------------+
  |  Available  | --------------------------------> |   Occupied   |
  +-------------+                                   +--------------+
         ^                                                 |
         | Manual tap "Reset" by Waiter                    | Bill settled (Paid)
         |                                                 v
  +-------------+                                   +--------------+
  |  Cleaning   | <-------------------------------- |   Cleaning   |
  +-------------+                                   +--------------+
  ```

---

### 2.6. Feature 6: Kitchen Display System (KDS)
* **Feature ID:** SPEC-KDS-006
* **Components:** Chronological FIFO Queue Controller, Station Dispatcher, Audio Alarm Generator.
* **Station Routing Rules:**
  * `Appetizers / Cold Dishes` $\rightarrow$ Station 1 (Pantry)
  * `Steaks / BBQ / Skewers` $\rightarrow$ Station 2 (Grill)
  * `Hotpots / Stir Fry / Soups` $\rightarrow$ Station 3 (Hot Line / Sauté)
  * `Beers / Mocktails / Juices` $\rightarrow$ Station 4 (Bar)
* **Partial Line Item Bump:**
  * For a line item with quantity $N > 1$, cook can click "Bump 1", splitting the database record into $1 \times \text{Ready}$ and $(N-1) \times \text{Cooking}$.

---

### 2.7. Feature 7: Recipe-Based Inventory BOM Depletion & Spoilage
* **Feature ID:** SPEC-INV-007
* **Components:** BOM Recipe Database Hook, Transactional Depletion Runner, Spoilage Ledger.
* **Depletion Trigger:**
  * Hook: Event `kds:item_cooking`.
  * For each dish and billable modifier in the ticket, run an atomic database transaction decrementing ingredient stock:
    $$\text{Stock}_{\text{new}} = \text{Stock}_{\text{current}} - (\text{Quantity} \times \text{BOM\_Weight})$$
* **Spoilage / Wastage Entry Schema:**
  ```json
  {
    "spoilageId": "SPL-20260910-01",
    "timestamp": "2026-09-10T19:45:00Z",
    "dishId": "DISH-202",
    "reason": "Overcooked",
    "loggedBy": "USER-CHEF-01",
    "costImpactVND": 145000
  }
  ```

---

### 2.8. Feature 8: Cashier POS, Split Billing & Dynamic VietQR
* **Feature ID:** SPEC-POS-008
* **Components:** Bill Calculation Engine, Split-Billing Matrix, VietQR Dynamic Payload Generator.
* **Cash Rounding Policy:**
  * Cash payments round to the nearest 1,000 VND:
    $$\text{CashAmount} = \text{round}\left(\frac{\text{SubTotal}}{1000}\right) \times 1000$$
* **Dynamic VietQR Specification:**
  * Standard: EMVCo Merchant-Presented QR Specification (NAPAS / VietQR standard).
  * Payload includes: Bank BIN, Account Number, Amount (exact to 1 VND), and Invoice Reference ID.

---

### 2.9. Feature 9: Staff Rostering & Dual-Mode Attendance
* **Feature ID:** SPEC-HR-009
* **Components:** Shift Schedule Planner, Haversine Distance Calculator, Wi-Fi BSSID Validator.
* **Haversine Distance Formula:**
  $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
  * If GPS horizontal accuracy $\le 50\text{m}$ and calculated distance $d \le 50\text{m} \implies \text{Approve}$.
  * If GPS horizontal accuracy $> 50\text{m}$, inspect client `bssid`:
    * If `bssid` $\in \text{WhitelistedBSSIDs} \implies \text{Approve (Wi-Fi Verified)}$.
    * Otherwise $\implies \text{Reject}$.

---

### 2.10. Feature 10: Executive BI & AI Predictive Analytics
* **Feature ID:** SPEC-BI-010
* **Components:** Aggregation Analytics Pipeline, Time-Series ML Inference Worker (ARIMA / Prophet).
* **Inference Pipeline:**
  * Input: 60-day rolling daily order history, covers, day-of-week, weather index.
  * Output: 7-day projected daily revenue $\hat{Y}_{t}$, projected customer covers $\hat{C}_{t}$, and lower/upper bounds with $95\%$ confidence interval.
  * Latency constraint: Execution completed within $< 500\text{ ms}$ on standard cloud CPU.

---
*End of Document: 3.5 Feature Specification.*
