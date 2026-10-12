# Operly — Manager Role Architectural Documentation & Feature Guide
**Document Identifier:** `DOC-PROTO-MGR-01`  
**Prototype Version:** `1.0.0 (Chapter 4.3 Interactive Prototype)`  
**Scope:** Duty Manager Portal (`SCR-MGR-01`, `SCR-MGR-02`, Operations & Approvals)  
**Localization:** 100% Enterprise SaaS Standard English  

---

## 1. Executive Summary & Architectural Overview

The **Manager Portal** in Operly serves as the operational command and control center for restaurant duty managers. In modern food and beverage (F&B) operations, duty managers are mobile, multi-tasking leaders who balance three primary responsibilities simultaneously:
1. **Financial & Operational Vigilance:** Overseeing real-time gross revenue, sales targets, labor/food cost ratios, and kitchen spoilage loss.
2. **Immediate Exception Handling & Approvals:** Resolving escalations from POS cashiers (voids, discount overrides above policy caps) and BOH kitchen/bar staff (urgent procurement, shift swaps) without halting service flow.
3. **Workforce & BI Decision Support:** Managing front-of-house (FOH) and back-of-house (BOH) floor rosters, evaluating predictive demand forecasts (ARIMA/Prophet baseline), and simulating recipe bill of materials (BOM) gross margins.

### Strict Scope & Architecture Boundaries
- **Frontend-Only Execution:** 100% client-side state management implemented via React 18, Vite 5, and React Context (`useMockStore`). Zero backend API controllers, zero server endpoints, and zero database schema modifications were introduced.
- **Strict Role Isolation:** All newly created components reside strictly in `prototype/src/components/manager/`. Unrelated roles (`Customer QR`, `Kitchen KDS`, `Waiter Floor`, `Cashier POS`, `Administrator`) remain 100% untouched and fully operational.
- **Enterprise SaaS Standards:** High-density desktop and tablet responsive interface, 100% professional English nomenclature, sub-second optimistic UI feedback, and persistent audit logging.

---

## 2. The 3 Primary Operational Pillars

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OPERLY MANAGER PORTAL                             │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│ 📊 Pillar 1:         │ 👥 Pillar 2:         │ 📈 Pillar 3:                  │
│ Overview & Approvals │ Team Operations      │ BI & Performance Reports      │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ • KPI Ribbon (4 cards│ • Live Duty Roster   │ • 7-Day AI Revenue Forecast   │
│ • Urgent Queue       │ • Live Search        │   (95% CI bands, MAPE 11.4%)  │
│ • Optimistic UI      │ • Multi-facet Filter │ • Recipe BOM Configurator     │
│ • Slide-over Drawer  │ • Verified Check-in  │   (Real-time Gross Margin %)  │
│ • Recently Processed │ • 5-item Pagination  │ • Actionable Recommendations  │
└──────────────────────┴──────────────────────┴───────────────────────────────┘
```

### Pillar 1: Overview & Approvals (`📊 Overview & Approvals`)
1. **Real-Time KPI Metric Ribbon (`ManagerKPICards.jsx`):**
   - **Gross Sales (Today):** Live accumulated revenue from Cashier POS settlements, tracked against the daily target of `28,000,000 VND` with an animated progress bar and delta indicator (`▲ +12.4% vs last Saturday`).
   - **Tables Served & Turnover:** Real-time table count, turnover velocity (`1.42 turn/table`), total cover count (`134 diners`), and standard dining duration (`52 mins`).
   - **Avg Spend & Cost Ratios:** Spend per table (`liveAvgTicket`), monitored alongside real-time Food Cost (`31.4%`, benchmark < 32%) and Labor Cost (`18.2%`, benchmark < 20%).
   - **Spoilage Loss & Staffing:** Real-time financial loss tracking from burned/spoiled dishes (`FR-013 Spoilage Ledger`), active staff coverage counter (`8 / 10 On Duty`), and urgent approvals badge.

2. **Urgent Approvals & Decision Queue (`ManagerApprovalsQueue.jsx`):**
   - **3-Tab State Filter:**
     - `⏳ Pending Approvals` (badges count with pulsing red alert indicator)
     - `🕒 Recently Processed` (displays shift decision history, manager signature, and notes)
     - `All Requests` (complete list)
   - **Multi-Category Filter:** Instant filtering across `Billing`, `Inventory`, `Policy`, and `Staffing`.
   - **Urgency Classification:** `Critical` (pulsing glowing dot), `High Priority`, `Medium`, and `Standard`.
   - **Optimistic UI Quick Actions:** 
     - `✓ Quick Approve`: Instantly updates local item status to `Approved`, stamps `processedAt` and `processedBy`, fires a toast notification, and moves the item to the "Recently Processed" tab without screen reload.
     - `✕ Reject`: Rejects the request with an audit trail note.
     - `🔍 View Details`: Triggers the slide-over inspection drawer.
   - **Interactive Test Simulation:** Includes a `⚡ Simulate Incoming Request` button allowing evaluators to inject random urgent requests (e.g. Void Dish, VIP 45% Discount Override, Urgent Wine Requisition) into the live queue on demand.

3. **Slide-Over Request Detail Drawer (`ManagerDetailDrawer.jsx`):**
   - Slides smoothly from the right viewport with a blurred backdrop (`backdrop-filter: blur(4px)`).
   - Structured into 4 audit sections:
     1. *Requester & Operational Channel:* Staff identity, role, channel (POS/KDS/Mobile), timestamp, and location.
     2. *Financial Impact & Ledger Value:* Currency amount impact in VND, ledger implications.
     3. *Justification & Operational Context:* Full explanation, kitchen readiness status, and policy constraint context (e.g., PRD Rule 7 discount cap).
     4. *Duty Manager Decision & Audit Trail Note:* Free-form decision textarea with `✓ AUTHORIZE & EXECUTE` and `✕ REJECT REQUEST` action controls.

---

### Pillar 2: Operations & Team Management (`👥 Operations & Team Management`)
1. **Live Duty Roster Data Table (`ManagerTeamTable.jsx`):**
   - **Summary Banner:** Live counts of on-duty staff, on-break staff, FOH vs BOH breakdown, and average team service rating (`⭐ Avg 4.86`).
   - **Instant Live Search:** Real-time client-side filter matching staff name, position/role, and phone number.
   - **Multi-Facet Department & Status Filtering:**
     - Department: `All` | `FOH` (Front of House) | `BOH` (Back of House)
     - Shift Status: `All` | `On Duty` | `On Break` | `Off Shift`
   - **Rich SaaS Columns:**
     - Staff Member (Avatar, Name, ID, Phone)
     - Department & Role Badge (Waiter, Head Chef, Cashier, Line Cook, Bartender, Host, Busser)
     - Shift Schedule (Evening vs Morning shift timing)
     - Attendance Verification Tag (`📍 16:55 (GPS Verified)` / `📍 15:50 (Wi-Fi Verified)` / `Morning Shift Completed`)
     - Live Shift Metrics (Tables Served, Orders Cooked, Bills Settled, Drinks Poured, Tables Bussed, Guests Welcomed)
     - Service Rating (`⭐ 4.6` to `⭐ 5.0`)
     - Status Toggle Action: Inline dropdown allowing immediate shift status transition (`On Duty` ↔ `On Break` ↔ `Off Shift`).
   - **Clean Pagination:** 5 rows per page with page index indicators, "Previous", and "Next" controls.

---

### Pillar 3: BI & Performance Reports (`📈 BI & Performance Reports`)
1. **7-Day Predictive AI Demand & Revenue Forecast (`ManagerForecastChart.jsx` — `SCR-MGR-01`):**
   - **Model Evaluation:** Visualizes time-series inference based on ARIMA / Prophet baseline algorithms with a `11.4%` MAPE (Mean Absolute Percentage Error) and `95%` Confidence Interval envelope.
   - **Dynamic Daily Visuals:**
     - Height-scaled revenue bars with upper/lower bound indicators (`[lowerM - upperM]`).
     - Distinct color highlighting for the peak revenue surge (`Saturday: 34.0M VND`, `+35% traffic surge`).
     - Clickable day selector updating the summary card in real-time.
   - **Automated Actionable Recommendations:**
     - `REC-01 (Staffing)`: Saturday Floor Staff Schedule — predicts 75 covers, advises scheduling 2 additional floor waiters.
     - `REC-02 (Procurement)`: Critical Prep Requisition — advises purchasing 15 kg Fresh Ribeye Beef and 20 kg Tiger Prawns by Friday 14:00 to prevent stockouts.

2. **Recipe Bill of Materials (BOM) Configurator (`ManagerBOMEditor.jsx` — `SCR-MGR-02`):**
   - **Dish Specification Header:** Menu List Price (`250,000 VND`), Category (`BBQ / Grill`), Preparation Station (`Station 2 - Grill`), and Image Asset identifier.
   - **Interactive Ingredients Specification Table:**
     - Lists ingredients, unit costs, yields, and editable BOM quantities.
     - Input field with strict `min="1"` validation.
     - Modifying any ingredient quantity immediately recalculates the component line cost and the theoretical food cost.
   - **Real-Time Financial Margin Simulator:**
     - Dynamically computes Theoretical Food Cost (`139,500 VND`) and Target Gross Margin (`55.8%`).
     - Visual indicator confirms compliance with F&B gross margin standards (`✓ Exceeds F&B Benchmark`).
   - **Action Controls:** "Cancel" and "SAVE RECIPE & ACTIVATE BOM DEPLETION" with toast confirmation.

---

## 3. Component Directory Structure

All components dedicated to the Manager role are located in [`prototype/src/components/manager/`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/manager):

| File Name | Purpose & Functionality |
| :--- | :--- |
| [`ManagerKPICards.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/manager/ManagerKPICards.jsx) | Renders the 4 core KPI cards: Gross Sales, Tables Served & Turnover, Avg Ticket & Cost Ratios, and Spoilage Loss & Staffing. |
| [`ManagerApprovalsQueue.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/manager/ManagerApprovalsQueue.jsx) | Renders the urgent request queue, category pills, 3-tab state switcher, quick action buttons, and simulation trigger. |
| [`ManagerDetailDrawer.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/manager/ManagerDetailDrawer.jsx) | Slide-over drawer providing 4-part in-depth context on any approval item and the manager decision form. |
| [`ManagerTeamTable.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/manager/ManagerTeamTable.jsx) | Full duty roster data table with live client search, department and status filters, performance tags, and pagination. |
| [`ManagerForecastChart.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/manager/ManagerForecastChart.jsx) | 7-day ARIMA/Prophet predictive revenue chart with 95% CI bands envelope and actionable AI insight cards. |
| [`ManagerBOMEditor.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/manager/ManagerBOMEditor.jsx) | Recipe Bill of Materials specification editor with real-time food cost and gross margin simulation. |
| [`ManagerEmptyState.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/manager/ManagerEmptyState.jsx) | Reusable visual empty state card for zero pending requests or empty search queries. |
| [`ManagerLoadingSkeleton.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/manager/ManagerLoadingSkeleton.jsx) | Reusable shimmer skeleton placeholders for smooth UX transitions. |

---

## 4. State Management & Optimistic UI Workflow

In [`prototype/src/store/mockStore.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/store/mockStore.jsx), state management for the Manager role is structured as follows:

```
[User Action: Click "Quick Approve"]
               │
               ▼
   Update managerApprovals in memory (status: 'Approved', processedAt, notes)
               │
               ├──► Trigger Toast: "✓ Request Void Dish (APP-101) approved successfully!"
               │
               ├──► Append to Audit Trail: LOG-104 (actorId: 'MGR-NAM-01', actionCategory: 'MANAGER_APPROVAL')
               │
               └──► UI updates in 0ms (Card moves from 'Pending' to 'Recently Processed' tab)
```

### Store Methods:
- `approveRequest(id, notes)`: Updates approval state optimistically, appends to immutable `auditLogs`, and fires notification.
- `rejectRequest(id, notes)`: Rejects approval with justification note, records in audit trail, and fires notification.
- `openApprovalDrawer(approval)` / `closeApprovalDrawer()`: Controls slide-over drawer visibility and active selection.
- `updateStaffShiftStatus(staffId, newStatus)`: Mutates staff on-duty status in `teamRoster` and fires toast.
- `addSimulatedUrgentApproval()`: Injects randomized urgent requisitions into `managerApprovals` for live evaluation.
- `updateBOMQuantity(ingredientId, newQty)`: Updates recipe ingredient portion and dynamically recalculates total dish line cost and gross margin.
- `resetAllPrototypeData()`: Completely restores all datasets back to their pristine mock baseline.

---

## 5. Verification & Testing Guide

To test and evaluate the Manager Role in the interactive prototype:

### Step 1: Accessing the Manager Portal
1. Open the interactive prototype in your browser (e.g. `http://localhost:5173`).
2. On the top evaluation harness bar (`RoleSwitcherBar`), click the **"👔 Manager (SCR-MGR-01)"** button.

### Step 2: Testing Pillar 1 (Overview & Approvals)
1. Verify the 4 KPI cards: Confirm that Gross Sales shows live accumulated values, Target shows progress bar, and Spoilage Loss highlights red.
2. In the **Urgent Approvals Queue**, click **"⚡ Simulate Incoming Request"**: Notice a new urgent request card appears immediately with a toast notification.
3. On any pending request card, click **"✓ Quick Approve"**:
   - The card disappears from `⏳ Pending Approvals` immediately.
   - A success toast is displayed.
   - Click the `🕒 Recently Processed` tab: The approved request appears with the timestamp and manager signature.
4. On another card, click **"🔍 View Details"**:
   - The slide-over drawer opens from the right.
   - Enter a custom decision note in the textarea.
   - Click **"✓ AUTHORIZE & EXECUTE"**: The drawer closes and the state is updated.

### Step 3: Testing Pillar 2 (Operations & Team Management)
1. Click the **"👥 Operations & Team Management"** tab in the sub-navigation bar.
2. In the search bar, type `"Chef"` or `"0905"`: The table filters instantly.
3. Click the department filter pills (`FOH`, `BOH`) and status pills (`On Duty`, `On Break`, `Off Shift`).
4. In the status column of any staff member, change the dropdown from `On Duty` to `On Break`: Notice the live coverage summary counter updates in real time.
5. Test pagination by clicking `Next →` and page numbers.

### Step 4: Testing Pillar 3 (BI & Performance Reports)
1. Click the **"📈 BI & Performance Reports"** tab in the sub-navigation bar.
2. Under **"📊 7-Day AI Revenue Forecast"**, click different days (`Mon`, `Wed`, `Sat`): The focus card updates with day-specific revenue projections and confidence interval envelopes.
3. Click the sub-tab **"🥩 Recipe BOM Configurator"**:
4. Edit the quantity of `"US Choice Ribeye Beef"` from `300` to `350`:
   - Watch the Line Cost change from `120,000 VND` to `140,000 VND`.
   - Watch the Theoretical Food Cost update from `139,500 VND` to `159,500 VND`.
   - Watch the Target Gross Margin recalculate dynamically.
5. Click **"SAVE RECIPE & ACTIVATE BOM DEPLETION"**: Confirm the toast notification appears.

### Step 5: Responsive Verification (Tablet/iPad)
1. Open Developer Tools in your browser (press `F12` or `Ctrl+Shift+I`).
2. Switch device toolbar to **iPad / Tablet** viewport (width: 768px - 1024px).
3. Observe that the metric grid adjusts smoothly to 2 columns, table elements support horizontal scroll, and touch targets remain clear and accessible.

---
*Authored by Lead Frontend UI/UX Architect for Operly Project Chapter 4.3 Interactive Prototype.*
