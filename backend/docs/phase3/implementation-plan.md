# Phase 3 – Core Restaurant Modules Implementation Plan

## Overview
Phase 3 builds the core restaurant operational domain on top of the established Phase 1 (Foundation) and Phase 2 (Authentication & RBAC).
This implementation strictly follows NestJS modular architecture, Prisma ORM, global validation, and Swagger documentation standards.

---

## Detailed Task Checklist

### Pre-Implementation & Setup
- [x] Initial workspace inspection & git status review
- [x] Backend architecture, dependencies, and environment review
- [x] Verification of Phase 1 foundation and Phase 2 authentication & authorization
- [x] Compilation and test suite verification (`npm run test`: 17 passed)
- [x] Verification of PostgreSQL database connectivity (`operly_postgres_container` on port 5433)
- [x] Schema design for Restaurant and Branch integration and Table/Reservation associations
- [ ] Prisma migration for Phase 3 schema extensions (`restaurants`, `branches`, table & reservation associations)
- [ ] Regenerate Prisma client (`prisma generate`)

---

### Module 1: Restaurant and Branch Management
- [x] Data layer: Prisma models `Restaurant` and `Branch` with proper relational constraints
- [x] DTOs:
  - [x] `CreateRestaurantDto`, `UpdateRestaurantDto`
  - [x] `CreateBranchDto`, `UpdateBranchDto`
- [x] Services:
  - [x] `RestaurantsService` (CRUD, active status toggling)
  - [x] `BranchesService` (CRUD, restaurant relationship validation, branch-by-restaurant retrieval, cascade prevention)
- [x] Controllers & Endpoints:
  - [x] `POST /api/v1/restaurants` (Create restaurant)
  - [x] `GET /api/v1/restaurants` (List all restaurants, optional isActive filter)
  - [x] `GET /api/v1/restaurants/:id` (Get restaurant details with branches)
  - [x] `PATCH /api/v1/restaurants/:id` (Update restaurant)
  - [x] `DELETE /api/v1/restaurants/:id` (Delete restaurant - safety check for existing branches)
  - [x] `POST /api/v1/restaurants/:restaurantId/branches` (Create branch under restaurant)
  - [x] `GET /api/v1/restaurants/:restaurantId/branches` (Get all branches for a restaurant)
  - [x] `GET /api/v1/branches` (List all branches)
  - [x] `GET /api/v1/branches/:id` (Get branch by ID with table/restaurant info)
  - [x] `PATCH /api/v1/branches/:id` (Update branch)
  - [x] `DELETE /api/v1/branches/:id` (Delete branch - safety check for existing tables)
- [x] Documentation: `backend/docs/phase3/restaurant-branch.md`
- [x] Unit/Integration testing & build verification for Module 1

---

### Module 2: Table Management
- [x] Data layer: `Table` model with `branchId`, `floor`, `capacity`, `status`, `qrCodeToken`
- [x] DTOs:
  - [x] `CreateTableDto`, `UpdateTableDto`, `TableFilterDto` (TableQueryDto, UpdateTableStatusDto)
- [x] Service:
  - [x] `TablesService` (CRUD, branch validation, status lifecycle, QR code generation, retrieval by branch)
- [x] Controllers & Endpoints:
  - [x] `POST /api/v1/tables` (Create table assigned to branch)
  - [x] `GET /api/v1/tables` (List tables with branch, floor, status filters)
  - [x] `GET /api/v1/tables/:id` (Get table details including active sessions and reservations)
  - [x] `GET /api/v1/branches/:branchId/tables` (Get all tables for a specific branch)
  - [x] `PATCH /api/v1/tables/:id` (Update table information, capacity, status)
  - [x] `PATCH /api/v1/tables/:id/status` (Update table operational status: AVAILABLE, RESERVED, OCCUPIED, CLEANING)
  - [x] `DELETE /api/v1/tables/:id` (Delete table - prevent if active sessions or orders exist)
- [x] Documentation: `backend/docs/phase3/tables.md`
- [x] Unit/Integration testing & build verification for Module 2

---

### Module 3: Categories and Dishes (Menu Catalog)
- [x] Data layer: `Category` and `MenuItem` models
- [x] DTOs:
  - [x] `CreateCategoryDto`, `UpdateCategoryDto`
  - [x] `CreateDishDto`, `UpdateDishDto`, `DishQueryDto`, `ToggleAvailabilityDto`
- [x] Services:
  - [x] `CategoriesService` (CRUD, ordering, validation)
  - [x] `DishesService` (CRUD, category association, search, filtering by category/availability, pagination, 86 toggle)
- [x] Controllers & Endpoints:
  - [x] `POST /api/v1/categories` (Create category)
  - [x] `GET /api/v1/categories` (List categories)
  - [x] `GET /api/v1/categories/:id` (Get category with dishes)
  - [x] `PATCH /api/v1/categories/:id` (Update category)
  - [x] `DELETE /api/v1/categories/:id` (Delete category - safety check if dishes belong to it)
  - [x] `POST /api/v1/dishes` (Create dish in category)
  - [x] `GET /api/v1/dishes` (List dishes with search, categoryId, isAvailable filter, pagination)
  - [x] `GET /api/v1/dishes/:id` (Get dish details)
  - [x] `GET /api/v1/categories/:categoryId/dishes` (Get dishes by category)
  - [x] `PATCH /api/v1/dishes/:id` (Update dish)
  - [x] `PATCH /api/v1/dishes/:id/availability` (Toggle 86 / availability status)
  - [x] `DELETE /api/v1/dishes/:id` (Delete dish - soft or prevent if active order items exist)
- [x] Documentation: `backend/docs/phase3/categories-dishes.md`
- [x] Unit/Integration testing & build verification for Module 3

---

### Module 4: Reservations
- [x] Data layer: `Reservation` model with customer, branch, and table associations
- [x] DTOs:
  - [x] `CreateReservationDto`, `UpdateReservationDto`, `ReservationQueryDto`, `UpdateReservationStatusDto`, `CancelReservationDto`
- [x] Service:
  - [x] `ReservationsService` (Booking creation, deposit calculation, 90-min buffer conflict validation, table capacity matching, status transitions)
- [x] Controllers & Endpoints:
  - [x] `POST /api/v1/reservations` (Create reservation)
  - [x] `GET /api/v1/reservations` (List reservations with status, date, branch filters)
  - [x] `GET /api/v1/reservations/:id` (Get reservation details)
  - [x] `PATCH /api/v1/reservations/:id` (Update reservation details / table assignment)
  - [x] `PATCH /api/v1/reservations/:id/status` (Update status: PENDING, CONFIRMED, COMPLETED, CANCELLED)
  - [x] `PATCH /api/v1/reservations/:id/cancel` (Cancel reservation with refund rules)
- [x] Documentation: `backend/docs/phase3/reservations.md`
- [x] Unit/Integration testing & build verification for Module 4

---

### Module 5: Orders and Order Items
- [x] Data layer: `DiningSession`, `Order`, `OrderItem` models
- [x] DTOs:
  - [x] `CreateOrderDto`, `UpdateOrderDto`, `AddOrderItemsDto`, `UpdateOrderItemDto`, `UpdateOrderItemStatusDto`, `OrderQueryDto`
- [x] Service:
  - [x] `OrdersService` (Transaction-safe order creation, nested items, dynamic subtotal & total calculation, snapshotting menu item prices, item status transitions, session/table association)
- [x] Controllers & Endpoints:
  - [x] `POST /api/v1/orders` (Create order batch with items for a dining session or table)
  - [x] `GET /api/v1/orders` (List orders with status, session, date filters)
  - [x] `GET /api/v1/orders/:id` (Get order with nested items)
  - [x] `PATCH /api/v1/orders/:id` (Update order status)
  - [x] `POST /api/v1/orders/:id/items` (Add items to existing order)
  - [x] `PATCH /api/v1/orders/:id/items/:itemId` (Update item quantity or notes)
  - [x] `PATCH /api/v1/orders/:id/items/:itemId/status` (Update item status: PENDING, COOKING, READY, SERVED, REJECTED)
  - [x] `DELETE /api/v1/orders/:id/items/:itemId` (Remove order item - safety check for cooking status)
- [x] Documentation: `backend/docs/phase3/orders-order-items.md`
- [x] Unit/Integration testing & build verification for Module 5

---

### Final Integration & Verification
- [x] Full backend test run (`npm run test`: 45 passed across 8 suites)
- [x] TypeScript compilation (`npm run build`: 0 errors)
- [x] Verify Swagger UI endpoint generation (`/api/docs`)
- [x] Final updates to `backend/docs/phase3/README.md`
- [x] Final verification against all non-modification constraints
