# 3.1 PRODUCT DISCOVERY: OPERLY
## RESTAURANT OPERATIONS AND PROFITABILITY MANAGEMENT

* **Document:** Product Discovery & Problem Definition
* **Module:** Chapter 3 – Requirements Engineering (Section 3.1)
* **Target Domain:** Medium-sized Dine-in Restaurants (25–40 tables, 2–3 service zones, 15–30 staff members)
* **Status:** Approved

---

## 1. Executive Summary & Vision

In the food and beverage (F&B) industry, medium-sized restaurants operate under razor-thin margins and high customer expectations. Unlike small cafes with simple workflows or large enterprise chains with dedicated IT departments, medium-sized dine-in restaurants face unique operational bottlenecks:
* They handle complex dining floor dynamics across multiple rooms or floors.
* They experience severe rush-hour surges that overwhelm front-of-house (FOH) and kitchen (BOH) coordination.
* They suffer from unmonitored ingredient waste and lack systematic forecasting tools to optimize purchasing and labor scheduling.

**Operly** is envisioned as a real-time, unified digital operating system and profitability intelligence platform. By replacing disconnected manual steps with reactive WebSocket streams, automated recipe bill-of-materials (BOM) inventory deductions, and lightweight AI recommender and forecasting models, Operly transforms reactive restaurant operations into a data-driven, high-margin enterprise.

---

## 2. Problem Statement & Root Cause Analysis

### 2.1. Critical Operating Bottlenecks
1. **Floor-to-Kitchen Transmission Latency:**
   * *Symptom:* Waiters take physical paper orders, walk to terminal or kitchen pass, and manually hand over tickets. During peak dinner hours (18:30–20:30), order transmission takes 5 to 8 minutes.
   * *Consequence:* Guests wait excessively for appetizers, table turnover rates drop by 20–30%, and orders are frequently misplaced or prepared out of chronological sequence.
2. **High Reservation No-Show Rates:**
   * *Symptom:* Guests book large tables for weekend parties over phone calls or social media without an upfront financial commitment.
   * *Consequence:* 15% to 20% of peak-hour bookings result in no-shows or last-minute cancellations. Prime tables sit empty while walk-in customers are turned away, causing immediate revenue loss.
3. **Inventory Shrinkage & Uncontrolled COGS (Cost of Goods Sold):**
   * *Symptom:* Ingredients are received without systematic tracking against dish orders. Over-portioning, kitchen waste, and inventory theft go unnoticed until month-end accounting.
   * *Consequence:* Food waste and shrinkage consume 8% to 12% of total procurement costs.
4. **Order Modification & Allergy Errors:**
   * *Symptom:* Verbal or handwritten modification notes ("no garlic", "extra mild", "nut allergy") are misread by kitchen staff in noisy, dimly lit kitchen environments.
   * *Consequence:* Comped meals, remade dishes, food wastage, and serious food safety risks.
5. **Intuition-Based Demand & Labor Planning:**
   * *Symptom:* Kitchen prep volumes and staff shift rosters are planned based on gut feeling.
   * *Consequence:* Over-staffing on slow rainy days burns payroll; under-staffing on surge days leads to service meltdowns and bad reviews.

---

## 3. Target Users & Persona Profiles

```
+-----------------------------------------------------------------------------------------+
|                                  TARGET ACTOR ECOSYSTEM                                 |
+-----------------------------+-----------------------------+-----------------------------+
| Customer (Guest & Member)   | Waiter (Floor Staff)        | Kitchen Staff (Chefs/Cooks) |
| - Self-ordering via QR      | - Mobile table monitoring   | - High-contrast KDS queue   |
| - Deposit-backed bookings   | - Instant dish-ready alerts | - 1-tap 86 out-of-stock     |
| - AI complementary pairings | - Assisted order taking     | - Spoilage & waste logging  |
+-----------------------------+-----------------------------+-----------------------------+
| Cashier (Front POS Desk)    | Restaurant Manager          | System Administrator        |
| - Equal / itemized split    | - Live sales & COGS metrics | - RBAC permission matrices  |
| - Dynamic VietQR payment    | - Weekly shift scheduler    | - Session revocation        |
| - Loyalty tier discounts    | - 7-day AI demand forecasts | - Tamper-proof audit logs   |
+-----------------------------+-----------------------------+-----------------------------+
```

### Persona 1: Customer – Lan Anh Nguyen (28, Digital Marketing Specialist)
* **Dine-in Behavior:** Regularly organizes weekend lunches and dinners with friends (groups of 4–8).
* **Goals:** Quick access to menus with clear pricing and imagery; ability to order and re-order without waiting for busy staff; transparent bill splitting.
* **Frustrations:** Inability to reserve tables reliably; waiting 15 minutes just to catch a server's eye for the bill.

### Persona 2: Waiter – Minh Tuan Tran (21, University Student / Server)
* **Work Context:** Serves 10–12 tables across the mezzanine dining area.
* **Goals:** Clear view of table availability; instant vibration notifications on his mobile phone when kitchen plates are ready for pickup.
* **Frustrations:** Running downstairs to the kitchen repeatedly to check dish status; getting yelled at by customers for kitchen delays.

### Persona 3: Head Chef – Nguyen Van Hung (46, Kitchen Expediter)
* **Work Context:** Directs 5 line cooks across hot line, grill, and pantry stations in a fast-paced, high-heat kitchen.
* **Goals:** Clear FIFO queue of incoming dishes on a durable touchscreen; immediate notification if an ingredient runs out so it can be 86'd across the menu.
* **Frustrations:** Water-damaged paper tickets; servers coming into the kitchen to verbally change order modifiers.

### Persona 4: Cashier – Le Thi Mai (23, Front-Desk Cashier)
* **Work Context:** Operates the checkout station during lunch and dinner rushes.
* **Goals:** Instant bill lookup, automated loyalty discount calculation, frictionless split-billing, and instant VietQR payment verification.
* **Frustrations:** Hand-written receipt adjustments; manual math mistakes during bill splits; customers disputing items on their bill.

### Persona 5: General Manager – Hoang Trong Nam (35, Operations Lead)
* **Work Context:** Manages day-to-day profit and loss (P&L), staffing, procurement, and customer feedback.
* **Goals:** Automated recipe-based inventory depletion; early low-stock warnings; reliable staff attendance tracking; AI-powered 7-day demand projections.
* **Frustrations:** Staying late every night calculating food costs manually; sudden mid-service stockouts; no-shows leaving large tables vacant.

### Persona 6: System Administrator – Vu Dinh Khoa (31, IT / Operations Engineer)
* **Work Context:** Ensures technical uptime, data integrity, and compliance.
* **Goals:** Granular RBAC, instant session invalidation upon staff termination, and tamper-proof audit trails for all sensitive financial overrides.
* **Frustrations:** Shared generic passwords; untraceable bill voids or price adjustments.

---

## 4. Value Proposition & Market Opportunity

```
+----------------------------------------------------------------------------------+
|                            OPERLY VALUE PROPOSITION                             |
+-----------------------------------+----------------------------------------------+
| For Front-of-House (FOH):         | • 70% reduction in order processing time.    |
|                                   | • Friction-free QR ordering (Guest Mode).    |
|                                   | • Turnaround time improved by 20-30%.        |
+-----------------------------------+----------------------------------------------+
| For Back-of-House (BOH):          | • Zero lost tickets via digital KDS.         |
|                                   | • Station-specific routing & audio cues.     |
|                                   | • Immediate 86 item synchronization.         |
+-----------------------------------+----------------------------------------------+
| For Management & Finance:         | • Automatic BOM raw material stock deduction.|
|                                   | • Deposit enforcement cuts no-shows by 75%.  |
|                                   | • AI recommendations increase AOV by 12-18%. |
|                                   | • AI forecasting eliminates prep waste.      |
+-----------------------------------+----------------------------------------------+
```

---

## 5. Business Objectives & Key Success Signals

1. **Table Turnaround & Efficiency:**
   * Order-to-kitchen transmission dropped from 5–8 minutes to $\le 1.5$ minutes.
   * Average table dining cycle reduced by at least 15 minutes during peak rush.
2. **Revenue & Profitability:**
   * Average Order Value (AOV) increased by $12\% - 18\%$ via AI cross-sell pairing suggestions.
   * Reservation no-show rate reduced to $\le 4\%$ via deposit mandate for large groups.
3. **Cost Control & Accuracy:**
   * Inventory waste and unrecorded shrinkage reduced to $\le 2.5\%$ of total food purchases.
   * Order error rate kept below $0.1\%$.
4. **Platform Reliability:**
   * WebSocket state propagation latency maintained under 2.0 seconds.
   * System availability $\ge 99.5\%$ during operating hours (07:00–23:59).

---

## 6. Assumptions, Constraints & Risk Analysis

### 6.1. Technical & Operational Assumptions
* The restaurant is equipped with a stable local Wi-Fi network and a 4G LTE cellular backup connection.
* Customers carry smartphones capable of scanning standard QR codes without specialized app installation.
* Commercial kitchen staff will use stationary tablet screens mounted in safe, heat-shielded zones.

### 6.2. Strategic Constraints
* **Scope Constraint:** Single-branch restaurant operations only in v1.0. Multi-branch chain governance is deferred to future releases.
* **Hardware Constraint:** No proprietary POS terminal hardware drivers; payment operations leverage standard web browsers, dynamic VietQR, and cash drawers.
* **Inference Budget:** AI models must execute on standard CPU cloud instances in $< 500\text{ ms}$.

### 6.3. Risk Assessment & Mitigation Matrix

| Risk Event | Severity | Likelihood | Mitigation Strategy |
| :--- | :---: | :---: | :--- |
| **Wi-Fi Network Drops During Peak Rush** | High | Medium | Client-side caching (IndexedDB/LocalStorage); dual-WAN router with automated 4G failover. |
| **QR Table Session Hijacking / Phantom Orders** | High | Low | Cryptographically signed table tokens with expiration timestamps; waiter verification on anomalous cart sizes. |
| **Indoor GPS Drift during Staff Clock-in** | High | High | Dual-mode geofencing: GPS radius ($\le 50\text{m}$) with automatic fallback to local Wi-Fi router BSSID verification. |
| **AI Cold-Start Inaccuracy** | Medium | High | Rule-based heuristic fallback (highest-margin & top-selling items) until the database accumulates 500 orders. |
| **Staff Collusion on Cash Voids** | High | Low | Mandatory manager PIN authorization for voids; append-only immutable audit logging with instant push alerts to General Manager. |

---
*End of Document: 3.1 Product Discovery.*
