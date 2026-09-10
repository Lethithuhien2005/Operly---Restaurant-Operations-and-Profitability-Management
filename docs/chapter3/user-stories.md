# 3.4 USER STORIES & ACCEPTANCE CRITERIA: OPERLY
## RESTAURANT OPERATIONS AND PROFITABILITY MANAGEMENT

* **Document:** User Stories and BDD Acceptance Criteria
* **Module:** Chapter 3 – Requirements Engineering (Section 3.4)
* **Status:** Finalized

---

## 1. User Story Catalog by Actor

```
+-----------------------------------------------------------------------------------------+
|                               USER STORY CATALOG SUMMARY                                |
+------------------------------------+----------------------------------------------------+
| Actor Role                         | Story IDs Covered                                  |
+------------------------------------+----------------------------------------------------+
| Customer                           | US-C01 to US-C06 (Reservations, Guest QR, AI Cart) |
| Waiter (Floor Staff)               | US-W01 to US-W05 (Floor map, Alerts, Table Reset)  |
| Kitchen Staff (Chefs / Cooks)      | US-K01 to US-K05 (FIFO KDS, Partial Bump, Spoilage)|
| Cashier                            | US-CS01 to US-CS05 (Split Bill, VietQR, Retry Check)|
| Restaurant Manager                 | US-M01 to US-M05 (Menu/BOM, AI Forecasts, Roster)  |
| System Administrator               | US-A01 to US-A03 (RBAC, Instant Revocation, Audits)|
+------------------------------------+----------------------------------------------------+
```

### 1.1. Customer Stories
* **US-C01:** As a prospective diner, I want to book a table online, choose my timeslot, and pre-order meals with an upfront deposit, so that our large party is guaranteed seating without waiting.
* **US-C02:** As a seated diner, I want to scan my table's QR code and immediately order food in Guest Mode without being forced to download an app or register an account, so that I can order quickly with zero friction.
* **US-C03:** As a diner sharing a table with friends, I want us all to scan the QR code and see items added to our shared cart in real time, so that we do not order duplicate dishes.
* **US-C04:** As a customer building my cart, I want the system to suggest complementary appetizers, sides, or beverages, so that I can easily discover well-paired dishes and complete my meal.
* **US-C05:** As a waiting diner, I want to see a live progress bar tracking my order from "Preparing" to "Cooking" and "Ready", so that I am kept informed about when my food will arrive.
* **US-C06:** As a recurring guest, I want to link my phone number during checkout to redeem loyalty points and member discounts, saving money on my meal.

### 1.2. Waiter (Floor Staff) Stories
* **US-W01:** As a floor server, I want to see a real-time color-coded table layout on my mobile device, so that I immediately know which tables are free, occupied, or awaiting busing.
* **US-W02:** As a floor server, I want to receive an instant vibrational push alert when the kitchen marks an item ready for one of my assigned tables, so that I can deliver the food while it is fresh and hot.
* **US-W03:** As a floor server, I want to enter orders and attach billable modifiers and special notes on behalf of walk-in or technology-averse guests, so that their requests flow accurately to the kitchen.
* **US-W04:** As a floor server, I want to merge two tables or transfer an order to another table in the app, so that the active bill matches the physical arrangement without data discrepancies.
* **US-W05:** As a floor server, I want to manually tap "Table Cleaned & Reset" on a table in `Cleaning` status, so that it becomes `Available` for the host to seat new guests.

### 1.3. Kitchen Staff Stories
* **US-K01:** As a line cook, I want incoming tickets displayed in chronological FIFO order on the KDS accompanied by an audible chime, so that we prepare food fairly based on arrival time.
* **US-K02:** As a cook, I want to tap on a ticket item to transition it from `Pending` to `Cooking` and `Ready`, so that waitstaff and diners receive immediate status updates.
* **US-K03:** As a cook, I want to partially fulfill a ticket line item (e.g., mark 1 of 2 steaks as `Ready` while the second is still `Cooking`), so that runners can serve hot items immediately without holding up the ticket.
* **US-K04:** As a head chef, I want to flag a dish as "86 / Out of Stock" directly from the KDS screen, so that the item is instantly greyed out on all QR menus and server devices.
* **US-K05:** As a cook, I want to log a dropped or burnt dish into the Spoilage Log, so that the kitchen can re-fire the dish while inventory waste is accurately recorded.

### 1.4. Cashier Stories
* **US-CS01:** As a cashier, I want to see a visual queue of tables requesting settlement, so that I can finalize customer bills promptly without making patrons wait.
* **US-CS02:** As a cashier, I want to look up a customer's phone number to apply their membership tier discount automatically, ensuring loyal guests receive their correct benefits.
* **US-CS03:** As a cashier, I want to divide an active check equally across party members or split it item-by-item, so that shared dining parties can settle their portions independently.
* **US-CS04:** As a cashier, I want to render a dynamic VietQR code on the customer-facing screen matching the exact bill total, so that customers can execute instant mobile bank transfers without manual typing errors.
* **US-CS05:** As a cashier, I want a "Check Payment Status" retry button on the POS interface, so that if a bank webhook is delayed, I can query the payment gateway manually before holding up the customer.

### 1.5. Restaurant Manager Stories
* **US-M01:** As a manager, I want to create and update menu items, upload photos, set pricing, and configure ingredient Bill of Materials (BOM), so that food costs and inventory are automatically tracked.
* **US-M02:** As a manager, I want to inspect a 7-day predictive AI forecast of revenue and customer covers, so that I can purchase raw ingredients and schedule labor shifts proactively.
* **US-M03:** As a manager, I want to receive real-time dashboard notifications when an ingredient drops below its minimum threshold, so that I can approve procurement before stock runs out.
* **US-M04:** As a manager, I want to build weekly employee rosters and verify mobile GPS/Wi-Fi attendance punches, ensuring adequate shift coverage and accurate payroll hours.
* **US-M05:** As a manager, I want to authorize ticket voids and refund transactions via a secure manager passcode, preventing internal theft and unaccounted revenue leaks.

### 1.6. System Administrator Stories
* **US-A01:** As an administrator, I want to create user accounts and bind them to specific RBAC roles, ensuring employees cannot access modules outside their professional domain.
* **US-A02:** As an administrator, I want to invalidate an employee's active session immediately upon account suspension, ensuring revoking access is instantaneous.
* **US-A03:** As an administrator, I want to inspect an immutable, append-only system audit log, so that all sensitive operational overrides (voids, price alterations, permission changes) are fully traceable.

---

## 2. Acceptance Criteria (BDD Given-When-Then Scenarios)

### Scenario 1: Online Table Reservation with Mandatory Deposit & Cancellation Tier
```gherkin
Feature: Online Table Reservation & Deposit Handling
  Scenario: Customer reserves a table with large pre-order value
    Given a customer navigates to the Online Reservation portal
    And selects a booking for 10 guests at 19:00 on Saturday
    And selects pre-ordered dishes totaling 1,600,000 VND
    When the customer clicks "Proceed to Confirmation"
    Then the system calculates a mandatory deposit of 640,000 VND (max(40% * 1,600,000, 10 * 50,000))
    And locks the target physical table provisionally for 10 minutes
    When payment is confirmed via payment gateway webhook
    Then the reservation status transitions to "Confirmed"
    And the table is locked against conflicting bookings between 17:30 and 20:30 (90-minute buffer)
    And an SMS/Email confirmation is dispatched with a unique Booking Code.

  Scenario: Customer cancels reservation under tiered refund policy
    Given a confirmed reservation with a paid deposit of 600,000 VND scheduled for 19:00 Friday
    When the customer cancels at 10:00 Thursday (> 24 hours prior)
    Then the system triggers an automatic 100% refund (minus 2% gateway processing fee)
    When the customer cancels at 09:00 Friday (10 hours prior, between 6 and 24 hours)
    Then the system triggers a 50% refund (300,000 VND)
    When the customer cancels at 17:00 Friday (< 6 hours prior) or fails to show up by 19:20 (20-min grace period)
    Then the reservation switches to "No-Show", 0% deposit is refunded, and the table is released to walk-in guests.
```

### Scenario 2: Friction-Free QR Dine-In with Shared Table Cart & AI Recommender
```gherkin
Feature: Contactless QR Dining and AI Upselling
  Scenario: Two diners at the same table add items to a shared live cart
    Given Guest A and Guest B are seated at physical Table 05
    And both scan Table 05's cryptographic QR code on their mobile devices
    When Guest A enters in Guest Mode and adds 1 "Seafood Spicy Hotpot" to the cart
    Then Guest B's phone updates the shared cart in real time (< 1 second via WebSocket)
    And the AI module displays a "Frequently Paired With" card with "US Beef Slices (+80,000 VND)"
    When Guest B taps "Add US Beef Slices"
    Then Guest A's screen updates immediately reflecting both items
    When either guest taps "Submit Order"
    Then an Order ID is created for Table 05
    And Table 05's indicator transitions to "Occupied" on floor staff terminals within 2 seconds
    And the order ticket appears on the Kitchen KDS with an audible chime (500ms at 70dB).
```

### Scenario 3: KDS Progression, Partial Fulfillment & BOM Inventory Depletion
```gherkin
Feature: Kitchen Queue Progression and Inventory Deductions
  Scenario: Kitchen transitions order items and performs partial line-item fulfillment
    Given the KDS displays an order for Table 05 with 2 portions of "Grilled Ribeye Steak" in "Pending"
    When the line cook taps the item to move it to "Cooking"
    Then the system immediately decrements inventory: 600g Raw Ribeye and 100g Garlic Butter
    And the customer progress indicator displays "Cooking"
    When the line cook taps "Partial Complete: 1/2"
    Then the item splits into 1 "Ready" plate and 1 remaining "Cooking" plate
    And the floor waiter assigned to Table 05 receives a vibration/push alert for the ready plate
    When the second steak is accidentally dropped in the kitchen
    Then the cook flags the item as "Spoiled / Dropped"
    And the system logs an entry in the Kitchen Spoilage Log
    And decrements additional stock for the replacement steak without altering the customer's bill.
```

### Scenario 4: Bill Settlement, Cash Rounding, Split Billing & VietQR
```gherkin
Feature: Checkout Settlement and Split Billing
  Scenario: Cashier splits a 350,000 VND bill equally among 3 diners
    Given Table 08 has completed dining with all items in "Served" state
    And the gross invoice balance is 350,000 VND
    When the cashier selects "Split Bill: Equal (3 Guests)"
    Then the system divides the bill into three sub-bills: 116,666 VND, 116,667 VND, and 116,667 VND
    When Guest 1 pays via Cash
    Then the system rounds Guest 1's payment to 117,000 VND (nearest 1,000 VND)
    When Guest 2 provides a Gold Member phone number and pays via VietQR
    Then the system applies a 10% discount to Guest 2's sub-bill (105,000 VND)
    And renders a dynamic VietQR image pre-filled with 105,000 VND
    When all three sub-bills transition to "Paid"
    Then Table 08 transitions to yellow "Cleaning"
    And remains in "Cleaning" until a floor server taps "Table Cleaned & Reset", returning it to "Available".
```

### Scenario 5: Staff Attendance Verification & Indoor Wi-Fi Fallback
```gherkin
Feature: Staff Attendance Geofencing
  Scenario: Employee clocks in with poor indoor GPS reception
    Given Waiter Tuan Tran arrives for an 08:00 shift (Restaurant GPS: 16.0544, 108.2022)
    When Tuan opens the mobile app inside the basement dining room at 07:55
    And the device GPS horizontal accuracy is reported as +-80m (> 50m threshold)
    Then the system automatically triggers the Wi-Fi fallback validation
    And inspects the client's current connection BSSID and public IP address
    When the BSSID matches the restaurant's whitelisted router hardware address
    Then the clock-in is approved
    And logged in the database with an "Indoor Wi-Fi Verified" status tag.
```

---
*End of Document: 3.4 User Stories & Acceptance Criteria.*
