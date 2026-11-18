# Phase 3 – Core Restaurant Modules

## Executive Summary
Phase 3 implements the foundational domain entities and business workflows for Operly – Restaurant Operations and Profitability Management.

### Covered Functional Modules (100% Completed)
1. **Restaurant and Branch Management**: Multi-unit enterprise structure, branch hierarchy, location attributes, cascade deletion prevention, and relation safety.
2. **Table Management**: Dine-in table registry, floor maps, seating capacities, automated QR-token generation, real-time operational status (AVAILABLE, RESERVED, OCCUPIED, CLEANING), and session/reservation deletion protection.
3. **Categories and Dishes**: Full F&B menu catalog, categorization, search/filtering, pagination, pricing, cost tracking, and real-time 86 out-of-stock toggles.
4. **Reservations**: Dining session pre-bookings, party size validation, table capacity matching, deposit tracking, commercial 90-minute conflict buffer enforcement, and cancellation lifecycle with table release.
5. **Orders and Order Items**: Atomic multi-item dining orders, database transaction safety (`$transaction`), server-side price calculation and snapshotting, table binding and automatic session opening, KDS preparation states (`PENDING`, `COOKING`, `READY`, `SERVED`, `REJECTED`), and cooking/served dish deletion safeguards.

---

## Architecture & Conventions
- **Framework**: NestJS (v12) with clean domain-driven modular architecture.
- **ORM & Database**: Prisma ORM with PostgreSQL.
- **Validation**: Global `ValidationPipe` with strict `class-validator` and `class-transformer`.
- **API Documentation**: OpenAPI / Swagger (`/api/docs`) with Bearer JWT auth integration.
- **Security & RBAC**: Reuses Phase 2 JWT strategy, `JwtAuthGuard`, `RolesGuard`, and `PermissionsGuard`.

---

## Verification Summary
- **Test Suite**: 45 unit/integration tests passing across 8 test suites (`npm run test`).
- **Compilation**: Full TypeScript production build succeeded with 0 errors (`npm run build`).
- **Database Schema**: Successfully migrated via `20261118131352_add_restaurants_and_branches`.
- **Zero Incompatible Changes**: Phase 1 foundation and Phase 2 authentication/RBAC fully preserved.

---

## Documentation Index
- [Implementation Checklist & Progress](./implementation-plan.md)
- [Module 1: Restaurant and Branch](./restaurant-branch.md)
- [Module 2: Tables](./tables.md)
- [Module 3: Categories and Dishes](./categories-dishes.md)
- [Module 4: Reservations](./reservations.md)
- [Module 5: Orders and Order Items](./orders-order-items.md)
