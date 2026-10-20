# Operly — Cashier Role Architectural Documentation & Feature Guide
**Document Identifier:** `DOC-PROTO-CSH-01`  
**Prototype Version:** `1.0.0 (Chapter 4.3 Interactive Prototype)`  
**Scope:** Cashier POS Terminal (`SCR-POS-01`, 3-Column Desktop Layout, Billing & Settlement)  
**Localization:** 100% Enterprise SaaS Standard English  

---

## 1. Executive Summary & Architectural Overview

The **Cashier POS Terminal** in Operly is the central financial checkout hub of the restaurant. Designed for high-speed, touch-friendly, error-resistant operations in fast-paced dining environments, the Cashier interface coordinates four key responsibilities:
1. **Queue Vigilance & Area Organization:** Tracking table statuses across dining rooms (Main Hall, VIP Suites, Takeaway) and identifying diners who have requested pre-print checks or are ready to settle.
2. **Strict Kitchen Policy Enforcement (PRD Rule 6 & EF-3.1):** Enforcing the mandatory kitchen policy gate that completely prevents checkout if any line items remain in `Cooking` or `Pending` state, protecting both guest satisfaction and food cost integrity.
3. **Loyalty & Discount Compliance (FR-011 & FR-008):** Processing diner phone lookup for tiered membership benefits, applying promotional coupon codes, and strictly enforcing the cumulative `40% maximum discount cap` (PRD Rule 7) with a dedicated escalation channel to the Duty Manager.
4. **Omnichannel Payment Settlement & Thermal Receipting:** Accommodating Cash with real-time change calculation and 1,000 VND rounding, EMV Smart POS Card Terminals, dynamic VietQR / NAPAS 247 with simulated webhook polling, and e-Wallets (MoMo, ZaloPay, ShopeePay), followed by 80mm fiscal receipt emission.

### Strict Scope & Architecture Boundaries
- **Strictly Frontend-Only:** 100% client-side state management implemented via React 18, Vite 5, and React Context (`useMockStore`). Zero backend endpoints, controllers, or database schema modifications were added.
- **Strict Role Isolation:** All newly created cashier components reside strictly in `prototype/src/components/cashier/`. Unrelated roles (`Customer QR`, `Kitchen KDS`, `Waiter Floor`, `Manager Portal`, `Administrator`) remain 100% intact and functional.
- **Enterprise SaaS Standards:** High-density 3-column desktop layout with iPad/tablet responsive fallbacks, 100% professional English nomenclature, sub-second optimistic UI feedback, and immutable audit logging.

---

## 2. The 3-Column POS Terminal Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        OPERLY POS TERMINAL 01 (Cashier: Mai Le)                        │
├──────────────────────┬─────────────────────────────────┬───────────────────────────────┤
│ 📋 Column 1:         │ 🧾 Column 2:                    │ 💳 Column 3:                  │
│ Billing Queue        │ Active Invoice & Line Items     │ Settlement, Loyalty & Pay     │
├──────────────────────┼─────────────────────────────────┼───────────────────────────────┤
│ • Area Filters       │ • Table Header & Order Info     │ • Loyalty Phone Lookup        │
│   (Main Hall/VIP/Take│ • PRD Rule 6 Cooking Blocker    │   (FR-011: Gold/Silver/Plat)  │
│ • Live Search        │ • Line Item Status Badges       │ • Promo Coupon (FR-008)       │
│ • Status Badges      │   (Served / Ready / Cooking)    │ • PRD Rule 7 Cap Warning (40%)│
│   (Requested/Blocked)│ • Line-level Void Request       │ • Ledger Breakdown (Subtotal, │
│ • Table Subtotals    │ • Invoice Subtotal Summary      │   Discounts, VAT, Net Total)  │
│                      │ • Manager Override Shortcut     │ • Big "PROCEED TO PAYMENT" CTA│
└──────────────────────┴─────────────────────────────────┴───────────────────────────────┘
```

---

## 3. Detailed Component Breakdown (9 Modular Components)

All Cashier components are located in [`prototype/src/components/cashier/`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/cashier):

| Component File | Role & Functionality |
| :--- | :--- |
| [`CashierHeader.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/cashier/CashierHeader.jsx) | Terminal header bar featuring brand identity, cashier name (`Mai Le`), shift details (`Evening Shift`), live digital clock, pending settlement badge counter, live cumulative shift sales counter, and shortcuts for Settled Bills History and Prototype Reset. |
| [`CashierBillQueue.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/cashier/CashierBillQueue.jsx) | **Left Column:** Area navigation tabs (`All`, `Main Hall`, `VIP`, `Takeaway`), instant search bar (table name, order number, note), and interactive table cards with live subtotals, item counts, and status pills (`BILL REQUESTED`, `ALL SERVED`, `COOKING [BLOCKED]`). |
| [`CashierInvoicePanel.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/cashier/CashierInvoicePanel.jsx) | **Middle Column:** Detailed itemized bill breakdown. Displays dish name, preparation station, modifiers, unit price, quantity, line total, and state badges. Features a high-visibility warning banner when dishes are still in cooking/pending state (PRD Rule 6), and a line-level "Void" trigger to escalate unserved cancellations to the Duty Manager. |
| [`CashierSettlementPanel.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/cashier/CashierSettlementPanel.jsx) | **Right Column:** Financial settlement console. Implements Member Loyalty lookup (FR-011) with tier discount badges, promotional coupon voucher input (FR-008), automatic enforcement of the 40% cumulative discount cap (PRD Rule 7), financial ledger calculation, and the primary "PROCEED TO PAYMENT" action button. |
| [`CashierPaymentModal.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/cashier/CashierPaymentModal.jsx) | **4-Tab Settlement Modal:**<br>1. *Cash:* Quick denomination buttons (+50k, +100k, +200k, +500k, Exact), live change calculator, and 1,000 VND rounding.<br>2. *Card / POS:* PAX A920 terminal online simulation, scheme selector (Visa/Mastercard/JCB/Napas), and authorization trace generator.<br>3. *VietQR / VNPAY:* Dynamic VietQR card display, account details, and simulated bank webhook polling.<br>4. *e-Wallet:* MoMo, ZaloPay, ShopeePay with barcode scan simulation. |
| [`CashierReceiptModal.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/cashier/CashierReceiptModal.jsx) | **Thermal 80mm Receipt Slip:** Visual thermal paper simulation with paper tear styling, store fiscal metadata (Tax ID, address, phone), cashier name, itemized bill, discount breakdown, net total, payment reference, and simulated thermal print / e-invoice dispatch. |
| [`CashierApprovalRequestModal.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/cashier/CashierApprovalRequestModal.jsx) | **Manager Escalation Modal:** Enables cashiers to dispatch Void Dish and Discount Override requests directly into the Duty Manager Approvals Queue (`managerApprovals` in `useMockStore`). Captures table, amount, standard reason category, urgency, and free-form context. |
| [`CashierHistoryDrawer.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/cashier/CashierHistoryDrawer.jsx) | **Slide-Over Audit Drawer:** Displays all settled invoices during the active shift (`MOCK_CASHIER_SETTLED_HISTORY` + live settlements). Supports search, payment method filtering, summary totals, and re-printing past thermal receipts. |
| [`CashierEmptyState.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/cashier/CashierEmptyState.jsx) | Reusable visual empty state card displayed when all bills are settled or search filters return zero matches. |
| [`CashierLoadingSkeleton.jsx`](file:///e:/OPERLY/Operly---Restaurant-Operations-and-Profitability-Management/prototype/src/components/cashier/CashierLoadingSkeleton.jsx) | Reusable shimmer skeleton loaders for queue cards, invoice tables, and settlement panels. |

---

## 4. Key Business Rules & Policy Validations

### 1. Kitchen Readiness Blocker (PRD Rule 6 & EF-3.1)
- **Constraint:** A cashier cannot proceed to checkout if any dish associated with the table has a status of `Cooking` or `Pending`.
- **UI Behavior:**
  - Table card in the Billing Queue is highlighted with a red border and a `⏳ COOKING (BLOCKED)` badge.
  - Active invoice displays a prominent red warning banner: `⚠️ SETTLEMENT BLOCKED (PRD Rule 6)`.
  - The "PROCEED TO PAYMENT" button in the right panel is disabled with the label `⛔ BLOCKED: FOOD IS COOKING`.
  - Cashiers can either wait for kitchen/waiter bump to `Served`, or click the `Void` button on the cooking item to submit a Void request to the Duty Manager.

### 2. Cumulative Discount Cap (PRD Rule 7 & FR-008)
- **Constraint:** Maximum cumulative discount from membership tiers and promotional vouchers cannot exceed `40%`.
- **UI Behavior:**
  - If a Gold Member (10%) applies a VIP Promo (35%), the combined discount is 45%.
  - The settlement engine automatically caps the effective discount rate to `40%`.
  - An amber alert banner is rendered: `🛡️ PRD Rule 7 Cap Enforced: 40% Maximum`.
  - A button allows the cashier to dispatch a `Discount Override` request to the Duty Manager if authorization to exceed 40% is legitimately required.

### 3. Cash Rounding Policy (FR-008)
- **Constraint:** Cash payments are automatically rounded to the nearest `1,000 VND` in accordance with Vietnamese currency circulation standards.
- **UI Behavior:** Both the settlement panel and the cash calculator automatically round net payable totals and display `(Cash rounded to nearest 1k)`.

### 4. Seamless Escalation to Manager Role
- Submitting an escalation from `CashierApprovalRequestModal.jsx` immediately prepends the request to `managerApprovals` in `useMockStore`.
- Switching to the **👔 Manager** role immediately shows the new request under `⏳ Pending Approvals` with full requester details (`Mai Le - Cashier`), table name, and financial impact.

---

## 5. Verification & Testing Guide

To test and evaluate the Cashier Role in the interactive prototype:

### Step 1: Open POS Terminal
1. Open the interactive prototype in your browser (e.g. `http://localhost:5173`).
2. On the top evaluation harness bar, click **"💳 Cashier (SCR-POS-01)"**.

### Step 2: Test Area Filtering & Queue
1. In the left column, click the area filter pills: `Main Hall`, `VIP`, `Takeaway`, and `All`.
2. Notice the queue updates instantly. Click `Takeaway #101` and `VIP Suite 01` to view different orders.
3. Type `"T03"` in the search box: only Table 03 appears. Clear the search box.

### Step 3: Test PRD Rule 6 (Cooking Blocker)
1. In the Billing Queue, click **Table 03**:
   - Notice the card has a red left border and `⏳ COOKING` badge.
   - The middle invoice panel renders the red alert banner: `⚠️ SETTLEMENT BLOCKED (PRD Rule 6)`.
   - The right column CTA button is disabled: `⛔ BLOCKED: FOOD IS COOKING`.
2. On the line item `"Grilled Ribeye Steak"`, click the **"Void"** button:
   - The Manager Approval Request modal opens with `Void Dish`, `Table 03`, and item amount.
   - Click **"🚀 Dispatch to Manager Queue"**.
   - Notice the toast confirmation appears.

### Step 4: Test Loyalty Lookup & PRD Rule 7 (40% Discount Cap)
1. Select **Table 08** (all dishes served).
2. Under **"👤 LOYALTY MEMBER"**, enter or click quick pill `"Lan Anh (Gold)"` (phone `0912345678`):
   - Gold Member verified with 10% discount.
3. Under **"🏷️ PROMO COUPON"**, click quick voucher pill `"VIPMEGA (35%)"`:
   - Notice that 10% + 35% = 45%, but the effective discount is capped at **40%**.
   - The amber warning banner `🛡️ PRD Rule 7 Cap Enforced` appears.

### Step 5: Test Omnichannel Payment & Thermal Receipt
1. Click **"💳 PROCEED TO PAYMENT"**:
   - The 4-tab payment modal opens.
2. In the **Cash** tab:
   - Click quick cash button `+100k` or `500,000 VND`.
   - Observe live change calculation in green.
3. Switch to **Card / POS** tab:
   - Click **"💳 Simulate Card Tap / Chip"**. Watch the status turn to `✓ CARD AUTHORIZATION APPROVED!`.
4. Switch to **VietQR / VNPAY** tab:
   - View dynamic VietQR card and click **"⚡ Simulate Customer Bank App Push"**.
5. Click **"✓ CONFIRM SETTLEMENT & PRINT RECEIPT"**:
   - The payment completes.
   - The Table is transitioned to `Cleaning` status.
   - Shift Total Sales counter increments immediately.
   - The 80mm Thermal Receipt Preview opens with all fiscal data.
   - Click **"🖨️ Thermal Print"** to simulate printing.
   - Click **"✓ Done & Next Table"**.

### Step 6: Test Settled Bills History
1. In the top POS header, click **"📜 Settled History"**:
   - The slide-over drawer opens showing all settled checks.
   - Filter by payment method (`VietQR`, `Card`, `Cash`).
   - Click **"View Receipt"** on any past check to re-open the thermal slip.

---
*Authored by Lead Frontend UI/UX Architect for Operly Chapter 4.3 Interactive Prototype.*
