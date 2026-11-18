# Module 2: Table Management

## 1. Feature Overview
Module 2 manages the physical dine-in floor topology across restaurant branches. It provides comprehensive CRUD for tables, association with restaurant branches, multi-attribute filtering (floor, capacity, branch, operational status), automated QR-code ordering token generation, table status transitions, and data integrity protection against premature deletion during active dining sessions or pending reservations.

---

## 2. Implemented Backend Functionality
- **Table Entity CRUD**: Creation, detailed retrieval (with active dining sessions and upcoming reservations), update, and protected deletion.
- **Branch Association**: Tables are linked to a specific restaurant branch via `branchId` (foreign key to `branches.id`).
- **Retrieval by Branch**: Specific endpoint to list all tables for a branch, ordered by floor and table number.
- **Operational Lifecycle Management**:
  - Direct transition between `AVAILABLE`, `RESERVED`, `OCCUPIED`, and `CLEANING`.
  - Used by Waiter, Cashier, and Manager roles.
- **Automated QR Code Token Generation**:
  - Automatically generates an ordering token (`QR-${tableNumber}-${uuid}`) if none is provided.
- **Referential Integrity & Session Protection**:
  - Prevents deleting a table if it has an active dining session in progress (`OPEN` or `PAYING`).
  - Prevents deleting a table if it has scheduled or pending reservations.

---

## 3. API Endpoints & HTTP Methods

| Method | Endpoint | Description | Auth / Roles | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/tables` | Create a new table assigned to a branch | `ADMIN`, `MANAGER` | `201 Created` |
| `GET` | `/api/v1/tables` | List tables with branch, floor, status filters | Public / Authenticated | `200 OK` |
| `GET` | `/api/v1/tables/:id` | Get table details by ID with active sessions | Public / Authenticated | `200 OK` |
| `GET` | `/api/v1/branches/:branchId/tables` | Retrieve all tables for a specific branch | Public / Authenticated | `200 OK` |
| `PATCH` | `/api/v1/tables/:id` | Update table details (capacity, floor, branch) | `ADMIN`, `MANAGER` | `200 OK` |
| `PATCH` | `/api/v1/tables/:id/status` | Update operational status (`AVAILABLE`, `RESERVED`, etc.) | `ADMIN`, `MANAGER`, `WAITER` | `200 OK` |
| `DELETE` | `/api/v1/tables/:id` | Delete table (blocked if active session/reservation) | `ADMIN`, `MANAGER` | `200 OK` |

---

## 4. Request and Response DTOs
- `CreateTableDto`:
  - `branchId` (UUID, optional)
  - `tableNumber` (string, required)
  - `floor` (integer between 1 and 10, required)
  - `capacity` (integer between 1 and 50, required)
  - `status` (`TableStatus` enum, optional, default `AVAILABLE`)
  - `qrCodeToken` (string, optional)
- `UpdateTableDto`: `PartialType(CreateTableDto)`
- `UpdateTableStatusDto`: `status` (`TableStatus` enum, required)
- `TableQueryDto`: `branchId` (UUID, optional), `floor` (integer, optional), `status` (enum, optional)

---

## 5. Database Models & Relationships
```prisma
model Table {
  id             String          @id @default(uuid()) @db.Uuid
  branchId       String?         @map("branch_id") @db.Uuid
  tableNumber    String          @unique @map("table_number")
  floor          Int
  capacity       Int
  status         TableStatus     @default(AVAILABLE)
  qrCodeToken    String          @unique @map("qr_code_token")
  createdAt      DateTime        @default(now()) @map("created_at")
  updatedAt      DateTime        @updatedAt @map("updated_at")

  branch         Branch?         @relation(fields: [branchId], references: [id], onDelete: SetNull)
  reservations   Reservation[]
  diningSessions DiningSession[]

  @@map("tables")
}
```

---

## 6. Validation and Business Rules
1. `tableNumber` must be unique across the restaurant.
2. If `branchId` is supplied, it must resolve to an existing branch in the database.
3. Seating capacity must be between 1 and 50 guests.
4. Floor must be between 1 and 10.
5. Deleting a table while a dining session is `OPEN` or `PAYING` is rejected with `400 Bad Request`.
6. Deleting a table with `PENDING` or `CONFIRMED` reservations is rejected with `400 Bad Request`.

---

## 7. Authentication and Authorization Requirements
- Create, general update, and delete endpoints protected with `@Roles(RoleName.ADMIN, RoleName.MANAGER)`.
- Status update endpoint accessible to `ADMIN`, `MANAGER`, and `WAITER` to support FOH floor operations.
- Table queries and branch table queries accessible to all staff and consumer clients.

---

## 8. Important Files Created or Modified
- `backend/src/modules/tables/dto/create-table.dto.ts`
- `backend/src/modules/tables/dto/update-table.dto.ts`
- `backend/src/modules/tables/dto/update-table-status.dto.ts`
- `backend/src/modules/tables/dto/table-query.dto.ts`
- `backend/src/modules/tables/tables.service.ts`
- `backend/src/modules/tables/tables.controller.ts`
- `backend/src/modules/tables/tables.module.ts`
- `backend/src/modules/tables/tables.service.spec.ts`
- `backend/src/app.module.ts`: Registered `TablesModule`.

---

## 9. Testing Performed and Results
- Unit testing with Vitest: 6 unit tests in `tables.service.spec.ts` covering table creation, branch linking, status updates, duplicate number rejection, and active session protection. All passed.
- Overall suite test: 29 tests passed across 5 test suites.
- TypeScript compiler verification via `nest build`: Passed with 0 errors.

---

## 10. Remaining Issues or Incomplete Functionality
None. Module 2 is completely implemented, verified, and documented.
