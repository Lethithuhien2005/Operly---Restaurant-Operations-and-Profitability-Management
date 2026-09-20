# 4.2 WIREFRAMING: OPERLY
## RESTAURANT OPERATIONS AND PROFITABILITY MANAGEMENT

* **Document:** UI/UX Low-Fidelity Wireframes & Layout Specifications
* **Module:** Chapter 4 – Product Design & Prototyping (Section 4.2)
* **Status:** Finalized (Awaiting Review)
* **Traceability Baseline:** PRD v1.1 (`docs/chapter3/product-requirements.md`), User Flow Design (`docs/chapter4/user-flow.md`)

---

## 1. Wireframing Objectives

The wireframes in this document translate the functional requirements and user flows into structural, low-fidelity interface layouts across the 6 primary actor roles.

The primary engineering objectives are:
1. **Ergonomic Device Optimization:**
   * Handheld mobile interfaces (Waiter, Customer) are optimized for single-handed thumb zones with minimum interactive targets of $48 \times 48\text{ px}$.
   * Station-mounted KDS displays utilize high-contrast cards and large touch surfaces legible from a 2-meter working distance.
   * High-volume desktop terminals (Cashier POS) prioritize dense information architecture and high-speed settlement ($\le 4$ user clicks).
2. **Real-Time State Visibility:**
   * Dynamic color coding and visual badge indicators immediately communicate operational states (`Available`, `Reserved`, `Occupied`, `Cleaning`, `Pending`, `Cooking`, `Ready`, `Served`).
3. **Seamless AI Integration:**
   * AI-generated recommendations and predictive demand charts are woven into natural workflow paths (e.g., cart sidebars and executive forecast tabs) rather than intrusive modal interruptions.
4. **Consistency & Component Reusability:**
   * Establish a unified component inventory to prepare for efficient frontend component development in Chapter 6.

---

## 2. List of Required Screens

The platform comprises 19 core screens organized across the 6 actor environments:

```
+-----------------------------------------------------------------------------------------+
|                                OPERLY SCREEN DIRECTORY                                  |
+----------------------+---------------------------+--------------------------------------+
| Actor Role           | Device Form Factor        | Screen Identifier & Screen Name      |
+----------------------+---------------------------+--------------------------------------+
| Customer             | Mobile Responsive Browser | SCR-CUST-01: Public Booking Portal   |
|                      |                           | SCR-CUST-02: Deposit Payment View    |
|                      |                           | SCR-CUST-03: QR Menu & Shared Cart   |
|                      |                           | SCR-CUST-04: Live Meal Progress Bar  |
+----------------------+---------------------------+--------------------------------------+
| Waiter               | Handheld Smartphone (PWA) | SCR-WAIT-01: Interactive Floor Map   |
|                      |                           | SCR-WAIT-02: Assisted Order Sheet    |
|                      |                           | SCR-WAIT-03: Dish-Ready Alerts Drawer|
+----------------------+---------------------------+--------------------------------------+
| Kitchen Staff        | Wall/Station Tablet (KDS) | SCR-KDS-01: FIFO Preparation Queue   |
|                      |                           | SCR-KDS-02: 86 Out-of-Stock Modal    |
|                      |                           | SCR-KDS-03: Spoilage / Wastage Logger|
+----------------------+---------------------------+--------------------------------------+
| Cashier              | Desktop / POS Terminal    | SCR-POS-01: Active Checkout Queue    |
|                      |                           | SCR-POS-02: Split-Billing & Loyalty  |
|                      |                           | SCR-POS-03: Dynamic VietQR Modal     |
+----------------------+---------------------------+--------------------------------------+
| Restaurant Manager   | Desktop Web Portal        | SCR-MGR-01: BI & AI Predictive Board |
|                      |                           | SCR-MGR-02: Menu & Recipe BOM Editor |
|                      |                           | SCR-MGR-03: Inventory & Low-Stock Bar|
|                      |                           | SCR-MGR-04: Shift Roster & Geofence  |
+----------------------+---------------------------+--------------------------------------+
| System Administrator | Desktop Administration    | SCR-ADM-01: User Management & RBAC   |
|                      |                           | SCR-ADM-02: Immutable Audit Log View |
+----------------------+---------------------------+--------------------------------------+
```

---

## 3. Low-Fidelity Wireframe Descriptions & ASCII Layouts

### 3.1. Customer Screens

#### SCR-CUST-01: Public Table Booking & Pre-Order Portal (Mobile Web)
```text
+-------------------------------------------------------------+
| [=] OPERLY RESTAURANT               [Reservations] [Cart(0)]|
+-------------------------------------------------------------+
| BOOK A TABLE                                                |
| Select Party Size:  [-] [ 10 Guests ] [+]                   |
| Select Date & Time: [ Sat, 2026-09-26 ] [ 19:00 v ]         |
+-------------------------------------------------------------+
| AVAILABLE SEATING AREAS:                                    |
| (•) Indoor Dining Room (Table T04, Max 12) - [SELECTED]     |
| ( ) Garden Terrace Patio (Table P02, Max 10)                |
+-------------------------------------------------------------+
| OPTIONAL: PRE-ORDER DISHES FOR YOUR PARTY                   |
| [Search Menu...                                          ]  |
| +---------------------------------------------------------+ |
| | [Img] Seafood Spicy Hotpot           280,000 VND  [+Add]| |
| | [Img] Grilled Wagyu Skewers (x4)     320,000 VND  [+Add]| |
| | [Img] Spring Rolls Platter           150,000 VND  [+Add]| |
| +---------------------------------------------------------+ |
| PRE-ORDER TALLY: 2 Items | Subtotal: 1,600,000 VND          |
+-------------------------------------------------------------+
| DEPOSIT SUMMARY:                                            |
| [!] Large party / Pre-order >= 1M VND mandate:              |
| Required Advance Deposit (40%): 640,000 VND                 |
+-------------------------------------------------------------+
| [ PROCEED TO SECURE DEPOSIT PAYMENT (10 MIN LOCK)  >>> ]    |
+-------------------------------------------------------------+
```

#### SCR-CUST-03: Contactless QR Menu & Multi-Diner Shared Cart (Mobile Web)
```text
+-------------------------------------------------------------+
| Table 05 | Floor 1                   [Guest Mode] [Cart (3)]|
| Shared with: Guest-A (You), Guest-B                         |
+-------------------------------------------------------------+
| [ All ] [ Hotpot ] [ BBQ / Grill ] [ Appetizers ] [ Drinks ]|
+-------------------------------------------------------------+
| +---------------------------------------------------------+ |
| | [Dish Img]  SEAFOOD SPICY HOTPOT                        | |
| | Fresh prawns, squid, clams, spicy broth.                | |
| | 280,000 VND                               [ + ADD ]     | |
| +---------------------------------------------------------+ |
| | [Dish Img]  GRILLED RIBEYE STEAK                        | |
| | 300g US Beef, garlic butter, asparagus.                 | |
| | 250,000 VND                               [ + ADD ]     | |
| +---------------------------------------------------------+ |
|                                                             |
| +=========================================================+ |
| | *** FREQUENTLY PAIRED WITH (AI RECOMMENDATION) ***      | |
| | [Img] US Beef Slices       [Img] Iced Herbal Tea        | |
| | +80,000 VND   [+ Quick Add]  +25,000 VND   [+ Quick Add]| |
| +=========================================================+ |
|                                                             |
| +---------------------------------------------------------+ |
| | SHARED TABLE CART (3 Items)                             | |
| | • 1x Seafood Hotpot (Less Spicy) - Guest-A   280,000 VND| |
| | • 1x US Beef Slices              - Guest-B    80,000 VND| |
| | • 2x Iced Herbal Tea             - Guest-B    50,000 VND| |
| | Total Cart Value: 410,000 VND                           | |
| +---------------------------------------------------------+ |
| [ SUBMIT ORDER TO KITCHEN (LOCKED & SYNCED) >>> ]           |
+-------------------------------------------------------------+
```

#### SCR-CUST-04: Live Meal Progress Tracker (Mobile Web)
```text
+-------------------------------------------------------------+
| Table 05 | Order #ORD-1048                                  |
+-------------------------------------------------------------+
| MEAL PROGRESS:                                              |
|                                                             |
|   [✓] Ordered  ====>  [•] Cooking  ====>  [ ] Ready/Served  |
|   (19:30)             (In Kitchen)        (Estimated 19:45) |
|                                                             |
+-------------------------------------------------------------+
| CURRENT DISH STATUSES:                                      |
| • Seafood Spicy Hotpot    [ COOKING ]  Station 3 (Hot Line) |
| • US Beef Slices          [ READY ]    Awaiting Waiter      |
| • Iced Herbal Tea (x2)    [ SERVED ]   Delivered (19:35)    |
+-------------------------------------------------------------+
| [!] Need assistance?                                        |
| [ CALL WAITER ]                 [ REQUEST PRE-PRINT BILL ]  |
+-------------------------------------------------------------+
```

---

### 3.2. Waiter Screens

#### SCR-WAIT-01: Real-Time Floor Map & Table Topo (Handheld Mobile PWA)
```text
+-------------------------------------------------------------+
| OPERLY WAITER | Floor 1 v               [🔔 Alerts (2)] [Tuan]|
+-------------------------------------------------------------+
| LEGEND: [G] Free  [B] Reserved  [R] Occupied  [Y] Cleaning  |
+-------------------------------------------------------------+
| +--------------+  +--------------+  +--------------+        |
| | T01      [G] |  | T02      [R] |  | T03      [R] |        |
| | 4 Seats      |  | 2 Seats      |  | 4 Seats      |        |
| | AVAILABLE    |  | Bill: 320k   |  | Cooking (12m)|        |
| +--------------+  +--------------+  +--------------+        |
|                                                             |
| +--------------+  +--------------+  +--------------+        |
| | T04      [B] |  | T05 (Active) |  | T06      [Y] |        |
| | 10 Seats     |  | 6 Seats  [R] |  | 4 Seats      |        |
| | Res: 19:00   |  | 3 Items Ready|  | CLEANING     |        |
| +--------------+  +--------------+  +--------------+        |
+-------------------------------------------------------------+
| QUICK ACTIONS ON SELECTED (TABLE 05):                       |
| [ TAKE ORDER ]  [ MERGE TABLE ]  [ TRANSFER ]  [ CHECK-IN ] |
| [ MARK TABLE CLEANED & RESET (AVAILABLE) ]                  |
+-------------------------------------------------------------+
```

#### SCR-WAIT-03: Dish-Ready Notification Drawer (Handheld Mobile PWA)
```text
+-------------------------------------------------------------+
| INCOMING DISH ALERTS (VIBRATION ACTIVE)                  [X]|
+-------------------------------------------------------------+
| [!] 19:42 - STATION 2 (GRILL)                               |
| Table 05: Grilled Ribeye Steak (x1)                         |
| Prep notes: Medium rare, garlic butter on side.             |
| [ PICKUP & MARK SERVED >>> ]                                |
+-------------------------------------------------------------+
| [!] 19:40 - STATION 4 (BAR)                                 |
| Table 02: Passionfruit Mocktail (x2)                        |
| [ PICKUP & MARK SERVED >>> ]                                |
+-------------------------------------------------------------+
| [ DISMISS ALL ALERTS ]                                      |
+-------------------------------------------------------------+
```

---

### 3.3. Kitchen Display System (KDS) Screens

#### SCR-KDS-01: FIFO Chronological Preparation Queue (Station Tablet / TV)
```text
+---------------------------------------------------------------------------------------------------+
| KDS - STATION 3 (HOT LINE) | ACTIVE TICKETS: 4           [Filter: All Stations v] [86 Item Modal] |
+---------------------------------------------------------------------------------------------------+
| TICKET #104 | T05 | 19:30   | TICKET #105 | T03 | 19:32   | TICKET #106 | T02 | 19:35   | PRIORITY VIP  |
| Elapsed: 12 mins (WARNING)  | Elapsed: 10 mins            | Elapsed: 7 mins             | T09 | Elapsed:4m|
|-----------------------------+-----------------------------+-----------------------------+---------------|
| [1x] Seafood Spicy Hotpot   | [2x] Sweet & Sour Pork Ribs | [1x] Braised Claypot Tofu   | [1x] Tom Yum  |
|   Note: Less spicy          |   Status: [ COOKING ]       |   Status: [ PENDING ]       |   [ COOKING ] |
|   Status: [ COOKING ]       |-----------------------------+-----------------------------+---------------|
|                             | [1x] Seafood Fried Rice     |                             |               |
| [BUMP 1/1 -> READY]         |   Status: [ PENDING ]       |                             |               |
|                             |                             |                             |               |
| [LOG SPOILAGE]              | [BUMP 1/2]  [BUMP ALL]      | [START COOKING]             | [BUMP READY]  |
+---------------------------------------------------------------------------------------------------+
```

#### SCR-KDS-02: 86 Out-of-Stock Management Modal (Tablet KDS Overlay)
```text
+--------------------------------------------------------------------+
| 86 ITEM MANAGEMENT (INSTANT MENU DISABLE)                       [X]|
+--------------------------------------------------------------------+
| Search ingredient or dish: [ Salmon...                           ] |
| +----------------------------------------------------------------+ |
| | Fresh Atlantic Salmon Fillet (Inventory: 0.2 kg)     [ 86 NOW ]| |
| | Grilled Salmon with Dill Sauce                       [ 86 NOW ]| |
| | Salmon Sashimi Platter                               [ 86 NOW ]| |
| +----------------------------------------------------------------+ |
| CURRENTLY 86'd DISHES (DISABLED ACROSS QR & WAITER APPS):          |
| • Fresh Oysters Rockefeller - Disabled at 18:45 by Chef Hung [UN-86|
+--------------------------------------------------------------------+
| [ CLOSE WINDOW ]                                                   |
+--------------------------------------------------------------------+
```

---

### 3.4. Cashier POS Screens

#### SCR-POS-01: Active Checkout Queue & Billing Desk (Desktop POS Terminal)
```text
+---------------------------------------------------------------------------------------------------+
| OPERLY POS TERMINAL | Cashier: Mai Le            [Shift: Evening] [Total Sales: 18,450,000 VND]   |
+---------------------------------------------------------------------------------------------------+
| TABLES AWAITING PAYMENT (2):                             | ACTIVE INVOICE: TABLE 08                       |
| +------------------------------------------------------+ | Customer Phone: [ 0912345678 ] [Verify Member] |
| | [!] T08 - Seated 1h 15m | Subtotal: 350,000 VND [SEL]| | Profile: Lan Anh Nguyen (Gold Tier - 10% Off)  |
| | [ ] T03 - Seated 0h 45m | Subtotal: 820,000 VND      | | Coupon Code:   [ HAPPYHOUR ] [Apply]           |
| +------------------------------------------------------+ |------------------------------------------------|
| ITEMS SUMMARY (ALL SERVED):                            | Subtotal (Food & Drinks):          350,000 VND |
| • 1x Grilled Salmon Steak                    180,000   | Gold Member Discount (-10%):       -35,000 VND |
| • 1x Caesar Salad                             90,000   | Coupon HAPPYHOUR (-10%):           -35,000 VND |
| • 2x Fresh Lime Soda                          80,000   | Cumulative Discount (-20% <= 40%): -70,000 VND |
|                                                        | Total Payable:                     280,000 VND |
|--------------------------------------------------------+------------------------------------------------|
| [ SPLIT BILL (EQUAL / BY ITEM) ]                       | [ PAY CASH (ROUNDED) ]   [ DYNAMIC VIETQR ]    |
+---------------------------------------------------------------------------------------------------+
```

#### SCR-POS-03: Dynamic VietQR Payment Modal (Desktop POS Terminal)
```text
+--------------------------------------------------------------------+
| SETTLE BILL VIA VIETQR TRANSFER (TABLE 08)                      [X]|
+--------------------------------------------------------------------+
| AMOUNT TO PAY: 280,000 VND  (Exact transfer amount)                |
| Beneficiary: OPERLY RESTAURANT (VietinBank - 102839482)            |
| Transfer Content: ORD1048 TBL08                                    |
|                                                                    |
|                   +-------------------------+                      |
|                   | [ ################### ] |                      |
|                   | [ ##### VIETQR ###### ] |                      |
|                   | [ ##### QR CODE ##### ] |                      |
|                   | [ ################### ] |                      |
|                   +-------------------------+                      |
|                                                                    |
| Status: Waiting for customer bank transfer... [Auto-listening]     |
+--------------------------------------------------------------------+
| [ MANUAL CHECK GATEWAY STATUS ]             [ CANCEL & BACK ]      |
+--------------------------------------------------------------------+
```

---

### 3.5. Restaurant Manager Screens

#### SCR-MGR-01: Executive BI & AI Predictive Analytics Dashboard (Desktop)
```text
+---------------------------------------------------------------------------------------------------+
| OPERLY MANAGER PORTAL | Branch: Da Nang Central                     [Today: 2026-09-20] [Nam Hoang]|
+---------------------------------------------------------------------------------------------------+
| [Overview] [Menu & BOM] [Inventory Stock] [Staff Rostering] [AI Forecasting] [Audit Trail]        |
+---------------------------------------------------------------------------------------------------+
| TODAY'S REAL-TIME METRICS:                                                                        |
| Gross Sales: 24,500,000 VND | Tables Served: 38 | Avg Ticket: 644,700 VND | Waste Loss: 145,000 VND|
+---------------------------------------------------------------------------------------------------+
| 7-DAY PREDICTIVE AI DEMAND & REVENUE FORECAST (ARIMA/Prophet Baseline):                            |
| Revenue                                                                                           |
| 35M |                                          *----* (Weekend Peak: 34M Projected)               |
| 25M |                 *-------*              /                                                    |
| 15M | *-------------/          \------------*                                                     |
|     +-----------------------------------------------------------------------> Date                |
|       Mon     Tue     Wed      Thu     Fri     Sat     Sun                                        |
|       [Confidence Interval: 95% | Expected Covers: 320 Guests | Model MAPE: 11.4%]                |
+---------------------------------------------------------------------------------------------------+
| AI PROCUREMENT & STAFFING RECOMMENDATIONS FOR SATURDAY:                                           |
| • Predicted Covers: 75 tables (+35% vs weekday). Required Floor Staff: 6 Waiters (Schedule 2 extra)|
| • Critical Prep Requisition: Order 15 kg Fresh Ribeye & 20 kg Tiger Prawns by Friday 14:00       |
+---------------------------------------------------------------------------------------------------+
```

#### SCR-MGR-02: Recipe Bill of Materials (BOM) Editor (Desktop)
```text
+---------------------------------------------------------------------------------------------------+
| RECIPE BILL OF MATERIALS (BOM) CONFIGURATOR | Dish: Grilled Ribeye Steak                          |
+---------------------------------------------------------------------------------------------------+
| Selling Price: [ 250,000 VND ]   Category: [ BBQ / Grill v ]   Station: [ Station 2 - Grill v ]   |
| Dish Image:    [ ribeye.jpg (Uploaded to Cloudinary) ] [Browse]                                   |
+---------------------------------------------------------------------------------------------------+
| INGREDIENT RECIPE SPECIFICATION (AUTOMATED STOCK DEPLETION AT 'COOKING' STATE):                   |
| +-----------------------------------------------------------------------------------------------+ |
| | Ingredient Name          | BOM Quantity | Unit   | Yield % | Est. Unit Cost | Line Cost       | |
| |--------------------------+--------------+--------+---------+----------------+-----------------| |
| | US Choice Ribeye Beef    | 300          | Grams  | 95%     | 400 VND/g      | 120,000 VND     | |
| | Fresh Garlic Butter      | 50           | Grams  | 100%    | 150 VND/g      |   7,500 VND     | |
| | Fresh Green Asparagus    | 100          | Grams  | 90%     | 120 VND/g      |  12,000 VND     | |
| +-----------------------------------------------------------------------------------------------+ |
| [ + Add Ingredient to BOM ]                                                                       |
| Theoretical Food Cost: 139,500 VND | Gross Margin: 44.2%                                          |
+---------------------------------------------------------------------------------------------------+
| [ SAVE RECIPE & ACTIVATE BOM DEPLETION ]                               [ CANCEL ]                 |
+---------------------------------------------------------------------------------------------------+
```

---

### 3.6. System Administrator Screens

#### SCR-ADM-01: User Provisioning & Instant Session Revocation (Desktop)
```text
+---------------------------------------------------------------------------------------------------+
| OPERLY ADMIN CONSOLE | Identity Governance & RBAC                          [Admin: Dinh Khoa Vu]  |
+---------------------------------------------------------------------------------------------------+
| STAFF ACCOUNTS DIRECTORY:                                                   [ + Create New User ] |
| +-----------------------------------------------------------------------------------------------+ |
| | Name            | Role        | Phone / Email    | Status    | Token Ver | Actions            | |
| |-----------------+-------------+------------------+-----------+-----------+--------------------| |
| | Minh Tuan Tran  | Waiter      | 0905111222       | Active    | 1         | [Edit] [SUSPEND]   | |
| | Chef Hung       | Kitchen     | 0905333444       | Active    | 1         | [Edit] [SUSPEND]   | |
| | Mai Le          | Cashier     | 0905555666       | Active    | 2         | [Edit] [SUSPEND]   | |
| | Van B           | Waiter      | 0905777888       | SUSPENDED | 3         | [Edit] [ACTIVATE]  | |
| +-----------------------------------------------------------------------------------------------+ |
| [!] When 'SUSPEND' is clicked, user's Token Version increments, triggering immediate session      |
| invalidation (401 Unauthorized) across all active mobile and desktop terminals.                   |
+---------------------------------------------------------------------------------------------------+
```

#### SCR-ADM-02: Immutable Audit Log Explorer (Desktop)
```text
+---------------------------------------------------------------------------------------------------+
| SYSTEM AUDIT TRAIL (READ-ONLY APPEND-ONLY LOGS)                                                   |
+---------------------------------------------------------------------------------------------------+
| Filter: [Event: All v]  [Actor: All v]  [Date: Last 24 Hours v]  [Search IP or ID...            ] |
| +-----------------------------------------------------------------------------------------------+ |
| | Timestamp (UTC)    | Actor ID      | Action Category | Client IP    | Details Snapshot        | |
| |--------------------+---------------+-----------------+--------------+-------------------------| |
| | 2026-09-20 19:48:12| MGR-NAM-01    | BILL_VOID       | 192.168.1.45 | Voided Dish #104 on T08 | |
| | 2026-09-20 19:30:05| CHEF-HUNG-01  | MENU_86_TOGGLE  | 192.168.1.80 | Set Salmon Sashimi: 86  | |
| | 2026-09-20 18:15:22| ADM-KHOA-01   | USER_SUSPENDED  | 192.168.1.10 | Suspended Staff ID: W-04| |
| +-----------------------------------------------------------------------------------------------+ |
| [ EXPORT AUDIT REPORT (CSV) ]                                        [ VERIFY LOG CHECKSUM ]      |
+---------------------------------------------------------------------------------------------------+
```

---

## 4. Layout Structure for Each Screen

Each client interface adheres to a strict responsive layout hierarchy:

```
+-----------------------------------------------------------------------------------------+
|                               GENERAL SCREEN LAYOUT ANATOMY                             |
+-----------------------------------------------------------------------------------------+
| [TOP HEADER / APP BAR] (Height: 56px - 64px)                                            |
| • Branding Logo | Actor Role Identity | Active Table/Station Context | Notification Badges|
+-----------------------------------------------------------------------------------------+
| [MAIN NAVIGATION / SUB-BAR] (Height: 40px - 48px)                                       |
| • Category Pills (Menu) | Floor Selector (Waiter) | Station Filter (KDS) | Admin NavTabs|
+-----------------------------------------------------------------------------------------+
| [CORE VIEWPORT CONTENT AREA] (Flexible Height / Scrollable Grid)                        |
| • Floor Plan Topology Canvas (Waiter)                                                   |
| • High-Contrast Ticket Column Layout (KDS)                                              |
| • Split Billing & Order Itemization Table (POS)                                         |
| • BI Chart & Recommender Widgets (Manager)                                              |
+-----------------------------------------------------------------------------------------+
| [BOTTOM CONTEXT DRAWER / FLOATING ACTION FOOTER] (Height: 56px - 72px)                   |
| • Sticky Cart Bar (Customer) | Quick Action Bar (Waiter) | Fast Tender Keys (Cashier)   |
+-----------------------------------------------------------------------------------------+
```

---

## 5. Navigation Between Screens

The diagram below outlines the information architecture and primary navigation transitions between screens:

```
+---------------------------------------------------------------------------------------------------+
|                                 OPERLY SCREEN TRANSITION GRAPH                                    |
+---------------------------------------------------------------------------------------------------+
  CUSTOMER FLOW:
  [SCR-CUST-01: Booking] --------(Deposit Mandate)-------> [SCR-CUST-02: Payment View]
         |                                                               |
    (QR Scan at Table)                                            (Booking Confirmed)
         v                                                               v
  [SCR-CUST-03: QR Menu & Cart] --(Order Placed)------------> [SCR-CUST-04: Progress Tracker]

  WAITER FLOW:
  [SCR-WAIT-01: Floor Map] <======(Ready Push Alert)=======> [SCR-WAIT-03: Ready Drawer]
         |
    (Select Table)
         v
  [SCR-WAIT-02: Assisted Order Sheet]

  KITCHEN FLOW:
  [SCR-KDS-01: FIFO Queue] <------(Click 86 Toggle)--------> [SCR-KDS-02: 86 Modal]
         |
    (Click Spoilage)
         v
  [SCR-KDS-03: Spoilage Logger]

  CASHIER FLOW:
  [SCR-POS-01: Checkout Queue] ---(Split Click)------------> [SCR-POS-02: Split Dialog]
         |                                                               |
    (Select VietQR)                                               (Select VietQR)
         v                                                               v
  [SCR-POS-03: Dynamic VietQR] <-----------------------------------------+

  MANAGER & ADMIN FLOW:
  [SCR-MGR-01: BI / AI Forecast] <---> [SCR-MGR-02: BOM Editor] <---> [SCR-MGR-03: Inventory]
  [SCR-ADM-01: RBAC Users]       <---> [SCR-ADM-02: Audit Trail]
+---------------------------------------------------------------------------------------------------+
```

---

## 6. Component Inventory

To ensure rapid, clean UI implementation in Chapter 6, the following standardized components are specified:

| Component Category | Component Name | Usage & Specifications |
| :--- | :--- | :--- |
| **Status Badges** | `TableStatusBadge` | Color-coded chips: Green (`Available`), Blue (`Reserved`), Red (`Occupied`), Yellow (`Cleaning`). |
| | `TicketStateBadge` | High-contrast chips: Grey (`Pending`), Orange (`Cooking`), Green (`Ready`), Blue (`Served`). |
| **Interactive Cards** | `MenuDishCard` | Image thumbnail, dish title, price, modifier expander, quick-add button ($48\times 48\text{px}$). |
| | `KDSTicketCard` | Full-width column card with timer, table label, station routing tag, and line item checkmarks. |
| **Input Controls** | `ModifierCheckboxGroup` | Single-choice radio or multi-choice checkbox for dish modifiers with price deltas. |
| | `GeofenceStatusIndicator` | Visual radar dot displaying GPS distance calculation and Wi-Fi BSSID verification status. |
| **Modals & Drawers** | `SplitBillModal` | Dual-column interactive item transfer dialog with equal or custom split toggles. |
| | `VietQRDisplayModal` | Center-stage high-contrast QR image renderer with countdown timer and manual status check button. |
| | `SpoilageLogModal` | Mandatory reason dropdown (Dropped, Overcooked, Expired) with replacement ticket toggle. |
| **Feedback Elements** | `AudioAlertChime` | WebAudio synthesized 500ms tone at 70dB triggered on inbound kitchen tickets. |
| | `ProgressStepper` | Linear 4-step progress tracker for customer order lifecycle. |

---

## 7. AI-Assisted Design Decisions

The interface integrates AI capabilities cleanly into the core workflows:

1. **Cart-Level Cross-Sell Carousel (`SCR-CUST-03`):**
   * *Placement:* Anchored immediately above the active cart drawer.
   * *Layout:* Horizontal swipeable carousel with 2–4 card recommendations generated by the Apriori association algorithm.
   * *Visual Styling:* Marked with a subtle badge (`Frequently Paired With`); avoids distracting full-screen popups.
2. **Predictive Shading on BI Forecasts (`SCR-MGR-01`):**
   * *Visualization:* Line chart with a solid line for historical sales, a dotted line for projected 7-day revenue, and a semi-transparent shaded envelope representing the $95\%$ confidence interval band.
   * *Actionable Insight Box:* Directly below the chart, automated text cards translate machine learning outputs into operational advice (e.g., *"Schedule 2 extra servers on Saturday evening"*).
3. **Automated Inventory Reorder Triggers (`SCR-MGR-03`):**
   * *Visual Flag:* Items whose current stock is lower than safety stock are highlighted in amber with a 1-click "Generate Purchase Order" shortcut.

---

## 8. Wireframe Review Notes

A structured evaluation of the wireframes against the PRD Non-Functional Requirements confirms:

* **Thumb-Zone Optimization:** In `SCR-CUST-03` and `SCR-WAIT-01`, critical action buttons (Submit Order, Mark Cleaned, Call Waiter) are pinned to the lower third of the screen to accommodate natural single-handed grip.
* **KDS Legibility at 2 Meters:** `SCR-KDS-01` maintains high-contrast dark/light card backgrounds and minimum 24pt typography for dish names, satisfying the kitchen line visibility requirement.
* **Cashier Settlement Efficiency:** The transition from `SCR-POS-01` to `SCR-POS-03` requires exactly 3 clicks for standard VietQR payment (Select Table $\rightarrow$ Apply Discount $\rightarrow$ Generate VietQR), well within the target threshold of $\le 4$ clicks.
* **Network & Offline Awareness:** All screens incorporate persistent connectivity indicators (e.g., *"Socket Connected"*, *"Reconnecting..."*).

---
*End of Document: 4.2 Wireframing.*
