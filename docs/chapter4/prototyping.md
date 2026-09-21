# 4.3 PROTOTYPING: OPERLY
## RESTAURANT OPERATIONS AND PROFITABILITY MANAGEMENT

* **Document:** Interactive Prototype Architecture, Scope & Traceability Specification
* **Module:** Chapter 4 – Product Design & Prototyping (Section 4.3)
* **Status:** Finalized (Awaiting Team Review)
* **Author / Responsibility:** Team Member 2 (Section 4.3 Prototyping & Section 4.4 AI Design Review)
* **Traceability Baseline:** PRD v1.1 (`docs/chapter3/product-requirements.md`), Feature Specification (`docs/chapter3/feature-specification.md`), User Flow Design (`docs/chapter4/user-flow.md`), Low-Fidelity Wireframes (`docs/chapter4/wireframing.md`)

---

## 4.3.1 Objectives

The translation of Chapter 4.2 wireframes into an interactive, functional software prototype serves several core engineering and operational objectives:

1. **Validation of Cross-Role Operational Synchronicity:**
   In a restaurant operating environment, operational bottlenecks arise when state transitions fail across roles (e.g., dish ordered by customer $\rightarrow$ displayed to line cook $\rightarrow$ picked up by server $\rightarrow$ invoiced by cashier $\rightarrow$ audited by manager & admin). The interactive prototype validates the live flow of state events between Front-of-House (FOH), Back-of-House (BOH), Cashier desks, and Administrative controls without requiring complete enterprise backend deployment.

2. **Verification of High-Speed Ergonomic Touch Targets:**
   Wireframe layouts define theoretical $48 \times 48\text{ px}$ touch targets, single-handed thumb-zone placement, and 2-meter visual readability for Kitchen Display Systems (KDS). The interactive prototype allows realistic physical interaction testing across handheld smartphone form factors, station-mounted tablets, and desktop terminals.

3. **Behavioral Testing of Business Logic and Blocking Gates:**
   Restaurant operational rules—such as the 40% cumulative discount cap, automatic cash rounding to 1,000 VND, instant token-version session revocation upon staff suspension, and blocking cashier checkout while food is actively cooking—cannot be evaluated through static wireframes. The interactive prototype renders these computational constraints and edge cases directly.

4. **Iterative Usability Refinement via AI and Heuristic Review:**
   Building a clickable prototype establishes a concrete, observable baseline for Section 4.4 (AI Design Review), enabling evidence-based human verification of AI suggestions before production code implementation in Chapter 6.

---

## 4.3.2 Prototype Scope

In accordance with course-level prototype objectives and team project boundaries, the prototype scope encompasses the **Core Operational Dining Spine** and the **Managerial / Administrative Control Centers** across all 6 actors defined in Chapter 4.1 and Chapter 4.2:

```
+---------------------------------------------------------------------------------------------------+
|                                 OPERLY COMPLETE PROTOTYPE ROLE DIRECTORY                          |
+--------------------------+------------------------------------+-----------------------------------+
| Actor Role               | Screen Identifiers                 | Operational Scope Demonstrated    |
+--------------------------+------------------------------------+-----------------------------------+
| **Customer**             | `SCR-CUST-03`, `SCR-CUST-04`       | QR Guest self-order, AI pairing,  |
|                          |                                    | shared cart sync, meal progress.  |
| **Kitchen Staff**        | `SCR-KDS-01`, `SCR-KDS-02`         | FIFO queue, station route, bump,  |
|                          |                                    | partial 1/2 bump, 86 item toggle. |
| **Waiter**               | `SCR-WAIT-01`, `SCR-WAIT-03`       | Floor topology, ready dish alert  |
|                          |                                    | drawer, table sanitization reset. |
| **Cashier**              | `SCR-POS-01`, `SCR-POS-03`         | Bill queue, unserved food gate,   |
|                          |                                    | Gold tier / coupon cap, VietQR.   |
| **Manager**              | `SCR-MGR-01`, `SCR-MGR-02`         | 7-Day AI ARIMA forecast (95% CI), |
|                          |                                    | Recipe BOM stock depletion setup. |
| **Administrator**        | `SCR-ADM-01`, `SCR-ADM-02`         | RBAC staff directory, instant     |
|                          |                                    | session revocation, audit trail.  |
+--------------------------+------------------------------------+-----------------------------------+
```

---

## 4.3.3 Screen Mapping

The following matrix documents the complete traceability from Chapter 4.1 User Flows, through Chapter 4.2 Wireframes, to the implemented Chapter 4.3 Prototype Screens:

| Role | 4.1 User Flow (Ch 4.1) | 4.2 Wireframe (Ch 4.2) | 4.3 Prototype Screen / Component | Form Factor |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | Journey 2 (Steps 1–7) | `SCR-CUST-03` | `CustomerQRMenuScreen.jsx` | Mobile (420px) |
| **Customer** | Journey 2 (Step 9), Journey 3 (Step 4) | `SCR-CUST-04` | `CustomerProgressScreen.jsx` | Mobile (420px) |
| **Kitchen** | Journey 3 (Steps 1–5) | `SCR-KDS-01` | `KitchenKDSScreen.jsx` | Tablet (1100px) |
| **Kitchen** | Journey 3 (Step 6), EF-2.1 | `SCR-KDS-02` | `KitchenKDSScreen.jsx` (Modal) | Tablet (1100px) |
| **Waiter** | Journey 4 (Step 4), AF-3.1 | `SCR-WAIT-01` | `WaiterFloorScreen.jsx` | Mobile (420px) |
| **Waiter** | Journey 4 (Steps 1–3) | `SCR-WAIT-03` | `WaiterFloorScreen.jsx` (Drawer) | Mobile (420px) |
| **Cashier** | Journey 5 (Steps 1–3), EF-3.1 | `SCR-POS-01` | `CashierPOSScreen.jsx` | Desktop (1200px) |
| **Cashier** | Journey 5 (Steps 4–6), EF-4.1 | `SCR-POS-03` | `CashierPOSScreen.jsx` (Modal) | Desktop (1200px) |
| **Manager** | Journey 6 (Step 5) | `SCR-MGR-01` | `ManagerPortalScreen.jsx` (Tab 1) | Desktop (1200px) |
| **Manager** | Journey 6 (Step 2) | `SCR-MGR-02` | `ManagerPortalScreen.jsx` (Tab 2) | Desktop (1200px) |
| **Administrator** | Journey 7 (Steps 1–3) | `SCR-ADM-01` | `AdminConsoleScreen.jsx` (Tab 1) | Desktop (1200px) |
| **Administrator** | Journey 7 (Step 4) | `SCR-ADM-02` | `AdminConsoleScreen.jsx` (Tab 2) | Desktop (1200px) |

---

## 4.3.4 Interaction Design

### 1. Customer Screens (`SCR-CUST-03` & `SCR-CUST-04`)
* **`SCR-CUST-03`:** Ephemeral Guest Mode for Table 05. Category navigation (`All`, `Hotpot`, `BBQ / Grill`, `Appetizers`, `Drinks`). Dish modifiers selection ("Less Spicy"). Apriori AI Recommender carousel ("Frequently Paired With" US Beef Slices & Herbal Tea) with 1-click Quick Add. Synchronized shared table cart displaying items from Guest-A and Guest-B. Submit order locks cart and pushes Ticket #104 to KDS.
* **`SCR-CUST-04`:** Real-time meal progress stepper (`Ordered` $\rightarrow$ `Cooking` $\rightarrow$ `Ready / Served`). Station routing tags. Assistance actions ("Call Waiter" and "Pre-print Bill") equipped with a 30-second anti-spam cooldown countdown.

### 2. Kitchen KDS Screens (`SCR-KDS-01` & `SCR-KDS-02`)
* **`SCR-KDS-01`:** Station-mounted FIFO queue with tactile touch pills (`All`, `Pantry`, `Grill`, `Hot Line`, `Bar`). Elapsed timer warning badge ($\ge 10\text{m}$). Tap `START COOKING` (triggers simulated BOM depletion). Tap `BUMP TO READY` (triggers waiter push alert). Tap `BUMP 1/2` for partial line item splits. Spoilage logging action.
* **`SCR-KDS-02`:** Real-time 86 out-of-stock modal. Searching and tapping `86 NOW` immediately disables the item across customer QR menus via simulated WebSocket.

### 3. Waiter Floor Screens (`SCR-WAIT-01` & `SCR-WAIT-03`)
* **`SCR-WAIT-01`:** Real-time floor plan topology with color codes (Green = Available, Red = Occupied, Blue = Reserved, Yellow = Cleaning). Contextual table actions. Resetting Table 06 (`Cleaning`) requires explicit confirmation dialog before returning to `Available` (PRD Rule 10).
* **`SCR-WAIT-03`:** Notification drawer displaying incoming dish-ready alerts with station notes. Tapping `✓ PICKUP & MARK SERVED` advances item status and clears alert queue.

### 4. Cashier POS Screens (`SCR-POS-01` & `SCR-POS-03`)
* **`SCR-POS-01`:** Settlement queue with table selection. Payment gate check blocks checkout if items remain in `Cooking` status (PRD Rule 6) with explicit Manager void guidance. Customer phone lookup (`0912345678`) applies Gold Tier (-10%). Auto-uppercasing coupon code input (`HAPPYHOUR`) calculates combined discount, clamping at the 40% ceiling (PRD Rule 7). Cash rounding rounds to nearest 1,000 VND.
* **`SCR-POS-03`:** Dynamic VietQR payment modal with exact VND amount, transfer syntax (`ORD1048 TBL08`), QR visual, manual "Check Gateway Status" API polling fallback (1.2s loading state $\rightarrow$ green "PAID & VERIFIED" checkmark), and invoice settlement trigger shifting table to `Cleaning`.

### 5. Manager Portal Screens (`SCR-MGR-01` & `SCR-MGR-02`)
* **`SCR-MGR-01` (Executive BI & AI Forecasting):**
  - Displays real-time operational KPI cards: Gross Sales (24,500,000 VND), Tables Served (38), Average Ticket Spend (644,700 VND), and Kitchen Spoilage Loss (145,000 VND).
  - Renders 7-day predictive time-series revenue and customer covers forecast with shaded 95% confidence interval envelope bands and model accuracy indicator (MAPE: 11.4%).
  - Generates actionable AI procurement and staffing advice for peak weekend shifts (e.g. Schedule 2 extra servers; Requisition 15 kg Ribeye).
* **`SCR-MGR-02` (Menu & Recipe BOM Configurator):**
  - Displays dish metadata (Grilled Ribeye Steak, 250,000 VND, BBQ/Grill, Station 2).
  - Form table for raw ingredient recipe specification (US Choice Ribeye Beef 300g, Fresh Garlic Butter 50g, Fresh Asparagus 100g) with unit costs and yields.
  - Dynamically computes theoretical food cost (139,500 VND) and gross margin percentage (44.2%) upon quantity adjustments with minimum input validation (`min="1"`).
  - `[ SAVE RECIPE & ACTIVATE BOM DEPLETION ]` action updates database depletion parameters.

### 6. Administrator Console Screens (`SCR-ADM-01` & `SCR-ADM-02`)
* **`SCR-ADM-01` (User Provisioning & Instant Session Revocation):**
  - Displays staff accounts directory with RBAC roles (Waiter, Kitchen, Cashier), contact details, status (`Active` / `SUSPENDED`), and database `token_version`.
  - Tapping `[SUSPEND]` prompts a confirmation dialog explaining immediate session termination.
  - Upon confirmation, user's token version increments (e.g. 1 $\rightarrow$ 2), invalidating active JWT tokens (HTTP 401 Unauthorized per SPEC-AUTH-001) across all devices, and prepends an immutable audit entry to the audit log.
* **`SCR-ADM-02` (Immutable System Audit Trail Explorer):**
  - Displays append-only system audit logs with filters for event categories (`BILL_VOID`, `MENU_86_TOGGLE`, `USER_SUSPENDED`), date ranges, and text search across actor IDs, client IPs, and detail snapshots.
  - Includes empty state handling when filter queries match zero records.
  - Actions: `[ EXPORT AUDIT REPORT (CSV) ]` and `[ VERIFY LOG CHECKSUM ]` (simulating SHA-256 HMAC cryptographic chain verification).

---

## 4.3.5 Prototype Implementation

### 1. Technology Architecture
* **Frontend Framework:** React 18 with Vite build bundler (`vite.config.js`).
* **Styling Architecture:** Modern responsive CSS with custom properties (`prototype/src/index.css`), supporting mobile viewports (420px), tablet screens (1100px), and desktop administration consoles (1200px).
* **State Management:** React Context API (`prototype/src/store/mockStore.jsx`) providing a synchronized multi-role reactive event engine.

### 2. File & Component Structure
```text
prototype/
├── package.json                   # Dependencies: React 18, Vite 5, Lucide Icons
├── vite.config.js                 # Dev server configuration
├── index.html                     # Responsive viewport & Google Inter fonts
└── src/
    ├── main.jsx                   # React application mount
    ├── App.jsx                    # Root app frame & multi-role layout harness
    ├── index.css                  # Global styles, color tokens & modal animations
    ├── mock/
    │   └── data.js                # Mock catalog, tables, tickets, members, BOM, staff & audit logs
    ├── store/
    │   └── mockStore.jsx          # Synchronized multi-role reactive state engine
    ├── components/
    │   └── RoleSwitcherBar.jsx    # Evaluator navigation bar covering all 6 roles
    └── screens/
        ├── CustomerQRMenuScreen.jsx   # SCR-CUST-03 (QR Menu, AI carousel, Shared Cart)
        ├── CustomerProgressScreen.jsx # SCR-CUST-04 (Meal Progress Stepper & Cooldown)
        ├── KitchenKDSScreen.jsx       # SCR-KDS-01 & SCR-KDS-02 (FIFO Queue & 86 Modal)
        ├── WaiterFloorScreen.jsx      # SCR-WAIT-01 & SCR-WAIT-03 (Floor Map & Alert Drawer)
        ├── CashierPOSScreen.jsx       # SCR-POS-01 & SCR-POS-03 (POS Billing & VietQR Modal)
        ├── ManagerPortalScreen.jsx    # SCR-MGR-01 & SCR-MGR-02 (BI Forecast & Recipe BOM)
        └── AdminConsoleScreen.jsx     # SCR-ADM-01 & SCR-ADM-02 (RBAC Tokens & Audit Trail)
```

### 3. Role Switcher Evaluation Harness
The `RoleSwitcherBar.jsx` component provides a compact evaluation header across all six actors (`Customer`, `Kitchen`, `Waiter`, `Cashier`, `Manager`, `Admin`). It is strictly an **evaluator harness** enabling reviewers to inspect cross-role data propagation within a single browser session without introducing artificial authentication barriers.

---

## 4.3.6 AI-Assisted Development Process

The development of Section 4.3 was conducted through an iterative AI-assisted workflow:

### Prompt 1: Initial Architecture & Scope Definition
* **Prompt:**
  > *"We need to implement an interactive prototype for Chapter 4.3 based on Chapter 4.1 user flows and 4.2 wireframes for Operly. Review the repository and propose the architecture."*
* **AI Output:**
  Proposed generating 19 individual static screens.
* **Human Refinement & Reason:**
  Refined to: *"Do NOT automatically implement all 19 screens. Group screens by user flow and select only the representative flows that form the operational backbone of the restaurant to maintain high interactive fidelity and prevent superficial screen sprawl."*
* **Result:**
  Scoped initial implementation to the core dining and fulfillment cycle, subsequently expanding to include Manager and Administrator roles.

### Prompt 2: State Synchronization & AI Recommender
* **Prompt:**
  > *"Implement a reactive state store simulating WebSocket room table:TBL-05 where adding a dish in Customer QR updates the KDS queue, and the cart incorporates Apriori association recommendations based on FR-004."*
* **Result:**
  Created `mockStore.jsx` with shared cart, ticket mutation methods (`advanceTicketItemStatus`, `partialBumpItem`, `toggle86Item`), and the dynamic "Frequently Paired With" carousel.

### Prompt 3: Business Rule Enforcement & Safety Gates
* **Prompt:**
  > *"Ensure Cashier POS strictly enforces PRD Rule 6 (blocking checkout while food is cooking), Rule 7 (40% discount ceiling), and Rule 10 (manual table cleaning confirmation)."*
* **Result:**
  Integrated gate verification checking `invoiceItems.some(i => i.status === 'Cooking')` to disable checkout buttons, dynamic discount ceiling clamp `Math.min(tierPct + couponPct, 40)`, and a mandatory confirmation modal before table status changes from `Cleaning` to `Available`.

### Prompt 4: Manager & Administrator Role Integration
* **Prompt:**
  > *"Add Manager (SCR-MGR-01 BI Forecast & SCR-MGR-02 Recipe BOM) and Administrator (SCR-ADM-01 RBAC Session Revocation & SCR-ADM-02 Audit Trail) while preserving all four existing roles and verifying build integrity."*
* **Result:**
  Implemented `ManagerPortalScreen.jsx` and `AdminConsoleScreen.jsx`, updated `mockStore.jsx` with BOM and staff status handlers, and expanded `RoleSwitcherBar.jsx` to all six roles with clean `npm run build` validation.

---

## 4.3.7 Traceability Matrix

This matrix establishes complete backward traceability to Chapter 3 requirements, user stories, and wireframe specifications:

| Requirement / Story ID | Description | Addressed in Prototype Screen | Observed Interaction |
| :--- | :--- | :--- | :--- |
| **FR-001 / US-A01, US-A02** | Authentication, RBAC & Session Invalidation | `AdminConsoleScreen.jsx` (`SCR-ADM-01`) | Staff list, token versioning, instant session revocation button with confirmation. |
| **FR-003 / US-C02** | Contactless QR Ordering & Shared Cart | `CustomerQRMenuScreen.jsx` (`SCR-CUST-03`) | Ephemeral Guest Mode, category filter, modifier selection, shared diner cart tally. |
| **FR-004 / US-C04** | AI Food Recommender | `CustomerQRMenuScreen.jsx` (`SCR-CUST-03`) | Apriori recommendation carousel ("Frequently Paired With") with 1-click Quick Add. |
| **FR-005 / US-W01** | Real-Time Table Topology | `WaiterFloorScreen.jsx` (`SCR-WAIT-01`) | Color-coded floor grid (`Available`, `Occupied`, `Reserved`, `Cleaning`). |
| **FR-006 / US-K01, US-K02** | Kitchen Display System (KDS) | `KitchenKDSScreen.jsx` (`SCR-KDS-01`) | Chronological FIFO queue, elapsed timers, cooking/ready state bump actions. |
| **FR-006 / US-K03** | Partial Line Item Fulfillment | `KitchenKDSScreen.jsx` (`SCR-KDS-01`) | "Bump 1/2" splits multi-item lines into Ready and Cooking records. |
| **FR-006 / US-K04** | 86 Out-of-Stock Toggle | `KitchenKDSScreen.jsx` (`SCR-KDS-02`) | Instant menu disable modal; disables dish across customer QR menu. |
| **FR-008 / US-CS01, US-CS04**| POS Settlement & Dynamic VietQR | `CashierPOSScreen.jsx` (`SCR-POS-01`, `03`) | Active check desk, cash rounding, VietQR modal with exact VND amount & reference. |
| **FR-009 / US-M01** | Recipe BOM & Stock Depletion Setup | `ManagerPortalScreen.jsx` (`SCR-MGR-02`) | Raw ingredient BOM configurator, unit costs, yield, and food cost / margin calculation. |
| **FR-011 / US-CS02** | Tiered Member Loyalty Discount | `CashierPOSScreen.jsx` (`SCR-POS-01`) | Phone lookup verifies Gold member tier (-10% discount). |
| **FR-012 / US-M02** | Executive BI & 7-Day AI Forecast | `ManagerPortalScreen.jsx` (`SCR-MGR-01`) | 7-Day ARIMA revenue forecast with 95% confidence intervals and staffing insights. |
| **SPEC-AUTH-001 / US-A03**| Immutable Append-Only Audit Trail | `AdminConsoleScreen.jsx` (`SCR-ADM-02`) | Filterable audit log explorer with CSV export and cryptographic checksum verification. |
| **Rule 6 & EF-3.1** | Payment Finalization Gate | `CashierPOSScreen.jsx` (`SCR-POS-01`) | Checkout blocked with alert if dishes are in `Cooking` status. |
| **Rule 7** | Discount Stacking Ceiling | `CashierPOSScreen.jsx` (`SCR-POS-01`) | Clamps total discount at $40\%$ when coupon and tier discount exceed cap. |
| **Rule 10 / US-W05** | Table State Sanitization Reset | `WaiterFloorScreen.jsx` (`SCR-WAIT-01`) | Confirmation modal required to transition table from `Cleaning` to `Available`. |

---

## Assumptions
1. **Network Simulation:** Real-time WebSocket transmission latency ($< 2.0\text{s}$) is simulated via synchronous React context state broadcasts and toast notifications.
2. **Session Invalidation Simulation:** Staff suspension demonstrates token version incrementation ($1 \rightarrow 2$) and audit logging; actual HTTP 401 rejection on subsequent requests is simulated as backend servers are outside prototype scope.
3. **AI Inference Simulation:** 7-day revenue and covers projections are pre-computed using synthetic historical baseline parameters ($95\%$ confidence bounds, $11.4\%$ MAPE) rather than calling live cloud ML workers.

---

## Unresolved Issues
- None. All 6 primary actors and their documented wireframe interactions have been implemented and verified against Chapter 4.1 and Chapter 4.2 baselines.

---

## Changes Made
- Created `ManagerPortalScreen.jsx` implementing `SCR-MGR-01` and `SCR-MGR-02`.
- Created `AdminConsoleScreen.jsx` implementing `SCR-ADM-01` and `SCR-ADM-02`.
- Updated `mockStore.jsx` to manage BOM state, staff accounts, token version incrementing, and audit logging.
- Updated `RoleSwitcherBar.jsx` to navigate across all six roles.
- Updated `App.jsx` to render Manager and Administrator views.
- Updated `docs/chapter4/prototyping.md` to reflect all six implemented roles.

---

## Files Created
- `docs/chapter4/prototyping.md`
- `prototype/package.json`
- `prototype/vite.config.js`
- `prototype/index.html`
- `prototype/src/main.jsx`
- `prototype/src/App.jsx`
- `prototype/src/index.css`
- `prototype/src/mock/data.js`
- `prototype/src/store/mockStore.jsx`
- `prototype/src/components/RoleSwitcherBar.jsx`
- `prototype/src/screens/CustomerQRMenuScreen.jsx`
- `prototype/src/screens/CustomerProgressScreen.jsx`
- `prototype/src/screens/KitchenKDSScreen.jsx`
- `prototype/src/screens/WaiterFloorScreen.jsx`
- `prototype/src/screens/CashierPOSScreen.jsx`
- `prototype/src/screens/ManagerPortalScreen.jsx`
- `prototype/src/screens/AdminConsoleScreen.jsx`

---

## Files Modified
- None of the preexisting repository files (`docs/chapter3/*`, `docs/chapter4/user-flow.md`, `docs/chapter4/wireframing.md`, `README.md`) were modified.

---
*End of Document: 4.3 Prototyping.*
