# Module 1: Restaurant and Branch Management

## 1. Feature Overview
Module 1 establishes the multi-unit enterprise foundation for the Operly platform. It supports managing top-level restaurant enterprise profiles and individual restaurant branches, validating parent-child relationships, enforcing referential integrity (preventing accidental cascade deletion when branches contain physical dining tables or reservations), and exposing endpoints for management and customer apps.

---

## 2. Implemented Backend Functionality
- **Restaurant Entity CRUD**: Creation, retrieval (with active filter), update, and protected deletion of restaurant enterprises.
- **Branch Entity CRUD**: Creation under a parent restaurant, retrieval by restaurant ID, full branch listing, updates, and protected deletion.
- **Relationship Validation**:
  - Validates that parent `restaurantId` exists before creating or reassigning a branch.
  - Enforces unique branch name within the same restaurant.
- **Cascade Deletion Safeguards**:
  - Prevents deleting a restaurant if any of its branches have active tables.
  - Prevents deleting a branch if it has registered tables or reservations.
- **RBAC Enforcement**:
  - `ADMIN` & `MANAGER` roles authorized for write operations (`POST`, `PATCH`, `DELETE`).
  - Read operations (`GET`) open for authenticated/authorized staff and client terminals.

---

## 3. API Endpoints & HTTP Methods

| Method | Endpoint | Description | Auth / Roles | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/restaurants` | Create a new restaurant enterprise | `ADMIN`, `MANAGER` | `201 Created` |
| `GET` | `/api/v1/restaurants` | List all restaurants (supports `?isActive=true/false`) | Public / Authenticated | `200 OK` |
| `GET` | `/api/v1/restaurants/:id` | Get restaurant details with its branches | Public / Authenticated | `200 OK` |
| `PATCH` | `/api/v1/restaurants/:id` | Update restaurant details | `ADMIN`, `MANAGER` | `200 OK` |
| `DELETE` | `/api/v1/restaurants/:id` | Delete restaurant (protected against active tables) | `ADMIN` only | `200 OK` |
| `POST` | `/api/v1/restaurants/:restaurantId/branches` | Create a branch under a specific restaurant | `ADMIN`, `MANAGER` | `201 Created` |
| `GET` | `/api/v1/restaurants/:restaurantId/branches` | Retrieve all branches for a restaurant | Public / Authenticated | `200 OK` |
| `POST` | `/api/v1/branches` | Create a new branch | `ADMIN`, `MANAGER` | `201 Created` |
| `GET` | `/api/v1/branches` | List branches (supports `?restaurantId=&isActive=`) | Public / Authenticated | `200 OK` |
| `GET` | `/api/v1/branches/:id` | Get branch details with its tables | Public / Authenticated | `200 OK` |
| `PATCH` | `/api/v1/branches/:id` | Update branch information | `ADMIN`, `MANAGER` | `200 OK` |
| `DELETE` | `/api/v1/branches/:id` | Delete branch (protected against table loss) | `ADMIN` only | `200 OK` |

---

## 4. Request and Response DTOs
- `CreateRestaurantDto`: `name` (required), `description`, `phone`, `email`, `address`, `isActive`
- `UpdateRestaurantDto`: `PartialType(CreateRestaurantDto)`
- `CreateBranchDto`: `restaurantId` (UUID, required), `name` (required), `address` (required), `phone`, `email`, `isActive`
- `CreateBranchNestedDto`: `name` (required), `address` (required), `phone`, `email`, `isActive`
- `UpdateBranchDto`: `PartialType(CreateBranchDto)`

---

## 5. Database Models & Relationships
```prisma
model Restaurant {
  id          String   @id @default(uuid()) @db.Uuid
  name        String
  description String?
  phone       String?
  email       String?
  address     String?
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  branches    Branch[]

  @@map("restaurants")
}

model Branch {
  id           String   @id @default(uuid()) @db.Uuid
  restaurantId String   @map("restaurant_id") @db.Uuid
  name         String
  address      String
  phone        String?
  email        String?
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  restaurant   Restaurant    @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  tables       Table[]
  reservations Reservation[]

  @@map("branches")
}
```

---

## 6. Validation and Business Rules
1. `name` is mandatory for both Restaurant and Branch, max length 100 characters.
2. `restaurantId` on Branch must be a valid UUID corresponding to an existing Restaurant.
3. Branch names must be unique within the same parent restaurant.
4. Attempting to delete a restaurant containing branches with tables will be blocked with `400 Bad Request`.
5. Attempting to delete a branch that has tables or reservations will be blocked with `400 Bad Request`.

---

## 7. Authentication and Authorization Requirements
- Global JWT Bearer token authentication via `JwtAuthGuard`.
- Role verification using `@Roles(RoleName.ADMIN, RoleName.MANAGER)` and `RolesGuard`.
- Public read access for consumer and floor client menus.

---

## 8. Important Files Created or Modified
- `backend/prisma/schema.prisma`: Added `Restaurant` and `Branch` models.
- `backend/prisma/migrations/20261118131352_add_restaurants_and_branches/migration.sql`: Schema migration.
- `backend/src/modules/restaurants/dto/create-restaurant.dto.ts`
- `backend/src/modules/restaurants/dto/update-restaurant.dto.ts`
- `backend/src/modules/restaurants/dto/create-branch.dto.ts`
- `backend/src/modules/restaurants/dto/update-branch.dto.ts`
- `backend/src/modules/restaurants/restaurants.service.ts`
- `backend/src/modules/restaurants/branches.service.ts`
- `backend/src/modules/restaurants/restaurants.controller.ts`
- `backend/src/modules/restaurants/branches.controller.ts`
- `backend/src/modules/restaurants/restaurants.module.ts`
- `backend/src/modules/restaurants/restaurants.service.spec.ts`
- `backend/src/app.module.ts`: Registered `RestaurantsModule`.

---

## 9. Testing Performed and Results
- Unit testing with Vitest: 6 unit tests in `restaurants.service.spec.ts` covering CRUD operations, parent restaurant verification, and deletion cascade protection. All passed.
- TypeScript compiler verification via `nest build`: Passed with 0 errors.

---

## 10. Remaining Issues or Incomplete Functionality
None. Module 1 is completely implemented, verified, and documented.
