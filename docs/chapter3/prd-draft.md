# 3.2 PRD DRAFT (INITIAL STAKEHOLDER PROPOSAL)
## PROJECT: OPERLY – RESTAURANT OPERATIONS AND PROFITABILITY MANAGEMENT

* **Document:** Product Requirements Document Draft (Initial Proposal)
* **Module:** Chapter 3 – Requirements Engineering (Section 3.2)
* **Phase:** Initial Specification & Stakeholder Alignment
* **Status:** Superseded by Final Product Requirements (v1.1)

---

## 1. Document Overview

This draft document represents the initial stakeholder-aligned product specification for **Operly**, established during the P3.1 Discovery & Requirements formulation milestone. It served as the review baseline for architectural feasibility analysis, quality checklist inspection (P3.2), and stakeholder sign-off prior to detailed technical breakdown.

---

## 2. High-Level Product Scope & Architecture

Operly is designed to centralize and streamline core restaurant operations for a medium-sized dine-in restaurant into three operational rings:

```
+-----------------------------------------------------------------------------------------+
|                                OPERLY HIGH-LEVEL ARCHITECTURE                           |
+-----------------------------+-----------------------------+-----------------------------+
| FRONT-OF-HOUSE (FOH)        | BACK-OF-HOUSE (BOH)         | MANAGEMENT & INTELLIGENCE   |
| • Table Reservation & Cọc   | • Kitchen Display (KDS)     | • Menu & Recipe BOM Engine  |
| • On-table QR Self-Ordering | • Station-specific routing  | • Automated Inventory Deplet|
| • Real-time Floor Topo Map  | • Live item progress states | • Shift Rosters & Geofence  |
| • Cashier POS & Billing     | • Instant 86 item disable   | • 7-Day AI Sales Forecasts  |
| • Dynamic VietQR Settlement | • Kitchen Spoilage Logging  | • RBAC & Audit Trails       |
+-----------------------------+-----------------------------+-----------------------------+
```

---

## 3. High-Level Module Breakdown

### Module 1: Authentication & Role-Based Access Control (RBAC)
* Centralized identity provider for 6 system roles: Customer, Waiter, Kitchen Staff, Cashier, Manager, Administrator.
* Token-based authentication using short-lived Access JWTs (15 min) and HttpOnly Refresh Tokens.
* Middleware authorization checks to prevent privilege escalation.

### Module 2: Online Reservation & Advance Deposit
* Public booking portal for guests to reserve tables, specify party size, and pre-order dishes.
* Conflict-detection engine enforcing 90-minute operational buffers per physical table.
* Advance deposit gateway for high-value pre-orders and large parties to eliminate no-shows.

### Module 3: Contactless QR Dining & Shared Table Cart
* Instant table QR scanning supporting **Guest Mode** (friction-free anonymous table session) and **Member Mode** (phone-based loyalty authentication).
* WebSocket-powered shared cart synchronization allowing multiple diners at the same table to add items simultaneously.
* Billable modifiers support (e.g., extra toppings, custom sides) with recipe BOM integration.

### Module 4: AI Cross-Sell Recommender
* Embedded machine learning recommender analyzing historical meal combinations to suggest 2–4 complementary items when diners review their cart.
* Real-time suppression of out-of-stock items ("86'd items").
* Cold-start heuristic fallback to restaurant top-sellers when order history is $< 500$ transactions.

### Module 5: Real-Time Table Topology & Floor Map
* Interactive floor plan displaying tables segmented by zone (Indoor, Patio, Mezzanine).
* Four synchronized states: `Available` (Green), `Reserved` (Blue), `Occupied` (Red), `Cleaning` (Yellow).
* Table merge and table transfer capabilities for floor servers.

### Module 6: Kitchen Display System (KDS)
* Chronological FIFO order queue with station routing (Grill, Fryer, Sauté, Pantry).
* Large-format high-contrast cards with audible chime alerts on ticket arrival.
* State transitions: `Pending` $\rightarrow$ `Cooking` $\rightarrow$ `Ready` $\rightarrow$ `Served`.
* Partial fulfillment support for multi-quantity items.

### Module 7: Recipe-Based Inventory & Spoilage Management
* Automated deduction of raw ingredients from database inventory when a dish transitions to `Cooking`.
* Dedicated Kitchen Spoilage / Wastage Log to record dropped or burned items with reason codes.
* Automated dashboard alerts when ingredient stock falls below configured safety thresholds.

### Module 8: Cashier POS & Omnichannel Settlement
* Active checkout queue with active bills locked to order-time price snapshots.
* Automated loyalty tier discounts (Bronze, Silver, Gold) and promotional coupon code validation.
* Split-billing support: equal split across guests or item-by-item assignment.
* Dynamic VietQR bank transfer generation with cash rounding to the nearest 1,000 VND.

### Module 9: Staff Rostering & Dual-Mode Attendance
* Weekly staff shift scheduling with automatic overlap conflict prevention.
* Mobile clock-in/out validated via GPS geofence ($\le 50\text{m}$ radius).
* Indoor fallback validation via local restaurant Wi-Fi router BSSID when GPS signal drifts.

### Module 10: Executive Business Intelligence & AI Forecasting
* Dashboard aggregating gross sales, net margins, estimated COGS, and top-selling items.
* Time-series predictive model (ARIMA / Prophet baseline) projecting next 7-day revenue, covers, and ingredient prep demand.

---

## 4. Review & Quality Checkpoint Log (P3.2)

During the formal peer review of this draft, the following core gaps were identified and incorporated into the finalized requirements specification:

| Checkpoint ID | Category | Finding Description | Resolution in Final PRD |
| :--- | :--- | :--- | :--- |
| **REV-01** | Inventory Hook | Stock deduction timing was ambiguous (`Paid` vs `Ready`). | Standardized: Deduct raw stock at `Cooking` state; log cancelled items to Spoilage Log. |
| **REV-02** | QR Dining Mode | Mandatory phone login caused drop-off at dining table. | Added Guest Mode (ephemeral table session) with optional Member login. |
| **REV-03** | Deposit Policy | Large party deposit calculation was ambiguous for zero pre-orders. | Established rule: $\max(40\% \text{ pre-order}, \text{party size} \times 50,000 \text{ VND})$. |
| **REV-04** | Cancellation Policy | No refund schedule defined for cancelled reservations. | Added 3-tier cancellation policy: $\ge 24\text{h}$ (100%), $6-24\text{h}$ (50%), $< 6\text{h}$ (0%). |
| **REV-05** | Multi-Diner Dining | Multiple diners scanning table QR caused cart collisions. | Created shared WebSocket table room (`table:{id}`) with real-time cart sync. |
| **REV-06** | Indoor GPS Drift | Kitchen / basement staff failed geofenced clock-in. | Implemented local Wi-Fi router BSSID / public IP whitelist fallback. |
| **REV-07** | Network Catch-Up | Lost socket events during temporary Wi-Fi drops. | Added `/api/v1/sync/state` reconciliation endpoint upon client reconnection. |

---
*End of Document: 3.2 PRD Draft.*
