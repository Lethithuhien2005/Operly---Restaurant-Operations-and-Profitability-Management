# Module 4: Table Reservations

## 1. Feature Overview
Module 4 orchestrates customer dining reservations for the Operly platform. It coordinates booking requests, customer verification, optional deposit processing, seating capacity alignment, branch validation, and strict enforcement of the commercial 90-minute table conflict buffer (FR-003, Chapter 5 Section 5.5). In addition, it manages status transitions across `PENDING`, `CONFIRMED`, `COMPLETED`, and `CANCELLED`, automatically liberating reserved tables upon cancellation.

---

## 2. Implemented Backend Functionality
- **Reservation Creation**: Validates booking customer, restaurant branch, table capacity matching, and 90-minute conflict buffer window.
- **Conflict Buffer Enforcement**:
  - Automatically queries active reservations for the target table within a $\pm 90$-minute window ($[\text{reservationTime} - 90\text{m}, \text{reservationTime} + 90\text{m}]$).
  - Throws `409 Conflict` if an overlapping `PENDING` or `CONFIRMED` booking already exists.
- **Capacity Matching**:
  - Enforces that assigned table capacity must be greater than or equal to `partySize`.
- **Branch Relationship Alignment**:
  - Validates that the pre-assigned table belongs to the requested branch.
- **Reservation Listing & Querying**:
  - Multi-attribute query support for `branchId`, `tableId`, `customerId`, `status`, and specific calendar `date` (day window).
- **Reservation Details Retrieval**:
  - Comprehensive details including customer profile, assigned table, branch details, and associated dining session.
- **Reservation Modification**:
  - Allows party size or time updates with automatic re-validation of conflict buffer and table capacity.
- **Status Lifecycle Transitions**:
  - Transition from `PENDING` $\rightarrow$ `CONFIRMED` automatically marks the physical table status as `RESERVED`.
  - Terminal statuses: `CANCELLED` and `COMPLETED`.
- **Cancellation & Deposit Refund**:
  - Cancelling a reservation marks status as `CANCELLED`, records cancellation reasons, flags `depositStatus` as `REFUNDED` if a deposit was paid, and automatically frees the table back to `AVAILABLE` if no other confirmed bookings exist.

---

## 3. API Endpoints & HTTP Methods

| Method | Endpoint | Description | Auth / Roles | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/reservations` | Book a table reservation with buffer checks | Public / Customer / Staff | `201 Created` |
| `GET` | `/api/v1/reservations` | Query reservations (`?branchId=&tableId=&status=&date=`) | Public / Authenticated | `200 OK` |
| `GET` | `/api/v1/reservations/:id` | Get reservation details by UUID | Public / Authenticated | `200 OK` |
| `PATCH` | `/api/v1/reservations/:id` | Update booking details or reassign table | `ADMIN`, `MANAGER`, `CUSTOMER` | `200 OK` |
| `PATCH` | `/api/v1/reservations/:id/status` | Update status (`CONFIRMED`, `COMPLETED`, `CANCELLED`) | `ADMIN`, `MANAGER`, `WAITER` | `200 OK` |
| `PATCH` | `/api/v1/reservations/:id/cancel` | Cancel reservation with deposit refund | Public / Authenticated | `200 OK` |

---

## 4. Request and Response DTOs
- `CreateReservationDto`:
  - `customerId` (UUID, required)
  - `branchId` (UUID, optional)
  - `tableId` (UUID, optional)
  - `guestName` (string, required)
  - `guestPhone` (string, required)
  - `partySize` (integer 1-100, required)
  - `reservationTime` (ISO-8601 string, required)
  - `depositAmount` (number >= 0, optional)
  - `specialRequest` (string, optional)
- `UpdateReservationDto`: `PartialType(CreateReservationDto)`
- `UpdateReservationStatusDto`: `status` (`ReservationStatus` enum, required)
- `CancelReservationDto`: `reason` (string, optional)
- `ReservationQueryDto`: `branchId`, `tableId`, `customerId`, `status`, `date`

---

## 5. Database Models & Relationships
```prisma
model Reservation {
  id              String            @id @default(uuid()) @db.Uuid
  customerId      String            @map("customer_id") @db.Uuid
  branchId        String?           @map("branch_id") @db.Uuid
  guestName       String            @map("guest_name")
  guestPhone      String            @map("guest_phone")
  specialRequest  String?           @map("special_request")
  tableId         String?           @map("table_id") @db.Uuid
  partySize       Int               @map("party_size")
  reservationTime DateTime          @map("reservation_time")
  depositAmount   Decimal           @default(0) @map("deposit_amount") @db.Decimal(12, 2)
  depositStatus   DepositStatus     @default(PENDING) @map("deposit_status")
  status          ReservationStatus @default(PENDING)
  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")

  customer        User              @relation(fields: [customerId], references: [id])
  branch          Branch?           @relation(fields: [branchId], references: [id], onDelete: SetNull)
  table           Table?            @relation(fields: [tableId], references: [id])
  diningSession   DiningSession?

  @@map("reservations")
}
```

---

## 6. Validation and Business Rules
1. `customerId` must be a valid registered user in the database.
2. `reservationTime` must be a valid ISO-8601 date string.
3. If `tableId` is assigned:
   - `table.capacity >= partySize` is strictly enforced.
   - 90-minute conflict buffer: No existing `PENDING` or `CONFIRMED` reservation can overlap within 90 minutes.
4. Attempting to update or cancel an already `COMPLETED` or `CANCELLED` reservation returns `400 Bad Request`.
5. Cancellation releases the physical table back to `AVAILABLE` if no other bookings are scheduled.

---

## 7. Authentication and Authorization Requirements
- Public / Customer reservation booking (`POST /api/v1/reservations`) allows guests or authenticated users to place bookings.
- Status transitions restricted to `ADMIN`, `MANAGER`, and `WAITER`.
- Booking updates restricted to `ADMIN`, `MANAGER`, and owning `CUSTOMER`.

---

## 8. Important Files Created or Modified
- `backend/src/modules/reservations/dto/create-reservation.dto.ts`
- `backend/src/modules/reservations/dto/update-reservation.dto.ts`
- `backend/src/modules/reservations/dto/update-reservation-status.dto.ts`
- `backend/src/modules/reservations/dto/cancel-reservation.dto.ts`
- `backend/src/modules/reservations/dto/reservation-query.dto.ts`
- `backend/src/modules/reservations/reservations.service.ts`
- `backend/src/modules/reservations/reservations.controller.ts`
- `backend/src/modules/reservations/reservations.module.ts`
- `backend/src/modules/reservations/reservations.service.spec.ts`
- `backend/src/app.module.ts`: Registered `ReservationsModule`.
- `backend/src/app.controller.ts`: Removed placeholder mock endpoint.

---

## 9. Testing Performed and Results
- Unit testing with Vitest: 5 unit tests in `reservations.service.spec.ts` testing reservation creation, customer verification, capacity checks, 90-minute conflict buffer enforcement, and cancellation table recovery. All passed.
- Overall suite test: 41 passed tests across 7 test suites.
- TypeScript compiler verification via `nest build`: Passed with 0 errors.

---

## 10. Remaining Issues or Incomplete Functionality
None. Module 4 is completely implemented, verified, and documented.
