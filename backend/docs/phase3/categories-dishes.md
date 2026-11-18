# Module 3: Categories and Dishes (Menu Catalog)

## 1. Feature Overview
Module 3 implements the restaurant's culinary catalog. It supports creating, organizing, searching, pricing, and managing availability for all categories and food/beverage dishes. The module enforces referential integrity between categories and dishes, provides high-performance pagination and search, and integrates the critical "86" out-of-stock toggle (SPEC-KDS-002) for real-time kitchen operations.

---

## 2. Implemented Backend Functionality
- **Category Entity CRUD**: Create, list with ordering, retrieve with child dishes, update, and protected deletion.
- **Dish Entity CRUD**: Create with category validation, list with multi-parameter search/filter/pagination, retrieve with recipe BOM details, update, and protected deletion.
- **Category Association & Retrieval**:
  - Validates that `categoryId` exists upon dish creation or category reassignment.
  - Dedicated endpoint to retrieve all dishes belonging to a category (`/api/v1/categories/:categoryId/dishes`).
- **Search, Filtering, and Pagination**:
  - Case-insensitive substring matching against dish `name` and `description`.
  - Filter by `categoryId`, `isAvailable` (86 status), and `isRecommendable` (AI Apriori eligibility).
  - Standardized pagination output (`items`, `total`, `page`, `limit`, `totalPages`).
- **Real-Time 86 Availability Toggle**:
  - Dedicated endpoint `PATCH /api/v1/dishes/:id/availability` to instantly toggle item availability across menus.
- **Referential Integrity Protection**:
  - Prevents deleting a category if it contains child dishes (`menuItems`).
  - Prevents deleting a dish if it has historical or active references in `order_items`.

---

## 3. API Endpoints & HTTP Methods

| Method | Endpoint | Description | Auth / Roles | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/categories` | Create a new menu category | `ADMIN`, `MANAGER` | `201 Created` |
| `GET` | `/api/v1/categories` | List categories (supports `?isActive=`) | Public / Authenticated | `200 OK` |
| `GET` | `/api/v1/categories/:id` | Get category details with child dishes | Public / Authenticated | `200 OK` |
| `PATCH` | `/api/v1/categories/:id` | Update category details | `ADMIN`, `MANAGER` | `200 OK` |
| `DELETE` | `/api/v1/categories/:id` | Delete category (blocked if contains dishes) | `ADMIN`, `MANAGER` | `200 OK` |
| `GET` | `/api/v1/categories/:categoryId/dishes` | List dishes for a category | Public / Authenticated | `200 OK` |
| `POST` | `/api/v1/dishes` | Create dish / menu item | `ADMIN`, `MANAGER`, `CHEF` | `201 Created` |
| `GET` | `/api/v1/dishes` | Search and paginate dishes (`?search=&categoryId=&isAvailable=&page=&limit=`) | Public / Authenticated | `200 OK` |
| `GET` | `/api/v1/dishes/:id` | Get dish details by UUID | Public / Authenticated | `200 OK` |
| `PATCH` | `/api/v1/dishes/:id` | Update dish pricing and metadata | `ADMIN`, `MANAGER`, `CHEF` | `200 OK` |
| `PATCH` | `/api/v1/dishes/:id/availability` | 86 out-of-stock toggle | `ADMIN`, `MANAGER`, `CHEF`, `WAITER` | `200 OK` |
| `DELETE` | `/api/v1/dishes/:id` | Delete dish (blocked if referenced in orders) | `ADMIN`, `MANAGER` | `200 OK` |

*Note: `/api/v1/menu-items` is mapped as an alias to `/api/v1/dishes` for full backward and specification compatibility.*

---

## 4. Request and Response DTOs
- `CreateCategoryDto`: `name` (required), `displayOrder` (optional, default 0), `isActive` (optional, default true)
- `UpdateCategoryDto`: `PartialType(CreateCategoryDto)`
- `CreateDishDto`:
  - `categoryId` (UUID, required)
  - `name` (string, required)
  - `description` (string, optional)
  - `price` (number >= 0, required)
  - `costPrice` (number >= 0, optional)
  - `imageUrl` (string, optional)
  - `isAvailable` (boolean, optional, default true)
  - `isRecommendable` (boolean, optional, default true)
- `UpdateDishDto`: `PartialType(CreateDishDto)`
- `DishQueryDto`: extends `PaginationQueryDto` with `categoryId`, `isAvailable`, `isRecommendable`
- `ToggleAvailabilityDto`: `isAvailable` (boolean, required)

---

## 5. Database Models & Relationships
```prisma
model Category {
  id           String     @id @default(uuid()) @db.Uuid
  name         String
  displayOrder Int        @default(0) @map("display_order")
  isActive     Boolean    @default(true) @map("is_active")
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")

  menuItems    MenuItem[]

  @@map("categories")
}

model MenuItem {
  id                  String              @id @default(uuid()) @db.Uuid
  categoryId          String              @map("category_id") @db.Uuid
  name                String
  description         String?
  price               Decimal             @db.Decimal(12, 2)
  costPrice           Decimal?            @map("cost_price") @db.Decimal(12, 2)
  imageUrl            String?             @map("image_url")
  isAvailable         Boolean             @default(true) @map("is_available")
  isRecommendable     Boolean             @default(true) @map("is_recommendable")
  createdAt           DateTime            @default(now()) @map("created_at")
  updatedAt           DateTime            @updatedAt @map("updated_at")

  category            Category            @relation(fields: [categoryId], references: [id])
  orderItems          OrderItem[]
  recipes             Recipe[]
  dishProfitabilities DishProfitability[]

  @@map("menu_items")
}
```

---

## 6. Validation and Business Rules
1. Category name must be unique.
2. Dishes must be assigned to an existing `categoryId`.
3. Pricing must be non-negative (`min: 0`).
4. Categories containing active dishes cannot be deleted (`400 Bad Request`).
5. Dishes referenced in existing order items cannot be deleted (`400 Bad Request`); staff must use the 86 availability toggle instead.

---

## 7. Authentication and Authorization Requirements
- Category write actions: restricted to `ADMIN` and `MANAGER`.
- Dish creation and pricing updates: restricted to `ADMIN`, `MANAGER`, and `CHEF`.
- 86 Out-of-Stock toggle: accessible to `ADMIN`, `MANAGER`, `CHEF`, and `WAITER` for rapid operational response.
- Read catalog endpoints: open to customers and all staff roles.

---

## 8. Important Files Created or Modified
- `backend/src/modules/menu/dto/create-category.dto.ts`
- `backend/src/modules/menu/dto/update-category.dto.ts`
- `backend/src/modules/menu/dto/create-dish.dto.ts`
- `backend/src/modules/menu/dto/update-dish.dto.ts`
- `backend/src/modules/menu/dto/dish-query.dto.ts`
- `backend/src/modules/menu/dto/toggle-availability.dto.ts`
- `backend/src/modules/menu/categories.service.ts`
- `backend/src/modules/menu/dishes.service.ts`
- `backend/src/modules/menu/categories.controller.ts`
- `backend/src/modules/menu/dishes.controller.ts`
- `backend/src/modules/menu/menu.module.ts`
- `backend/src/modules/menu/menu.service.spec.ts`
- `backend/src/app.module.ts`: Registered `MenuModule`.
- `backend/src/app.controller.ts`: Replaced mock menu items placeholder endpoints with real handlers in `DishesController`.

---

## 9. Testing Performed and Results
- Unit testing with Vitest: 7 unit tests in `menu.service.spec.ts` covering category uniqueness, dish creation, 86 toggle, and relation deletion protection. All passed.
- Overall suite test: 36 passed tests across 6 test suites.
- TypeScript compiler verification via `nest build`: Passed with 0 errors.

---

## 10. Remaining Issues or Incomplete Functionality
None. Module 3 is completely implemented, verified, and documented.
