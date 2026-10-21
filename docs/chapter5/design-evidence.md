# DESIGN EVIDENCE AND TRACEABILITY SPECIFICATION
## PROJECT: OPERLY – RESTAURANT OPERATIONS AND PROFITABILITY MANAGEMENT

* **Document Identifier:** `DOC-CH5-EVID-01`
* **Module:** Chapter 5 – AI in Software Design and Architecture
* **Status:** Finalized (Academic Baseline)
* **Date:** October 21, 2026

---

## 1. Inventory of Inspected Source Files

All architectural assessments, system models, database designs, and API contracts documented in Chapter 5 are grounded strictly in the verified source files within the Operly workspace:

```
+---------------------------------------------------------------------------------------------------+
|                               INSPECTED REPOSITORY SOURCE ARTIFACTS                               |
+---------------------------------------------------+-----------------------------------------------+
| Workspace File Path                               | Architectural Scope & Business Domain Provided|
+---------------------------------------------------+-----------------------------------------------+
| `prototype/package.json`                          | Verified dependencies: React 18.3.1, Vite     |
|                                                   | 5.4.2, Lucide React; zero server frameworks   |
+---------------------------------------------------+-----------------------------------------------+
| `prototype/src/store/mockStore.jsx`               | Synchronized multi-role reactive state engine |
|                                                   | (861 lines of code): Shared table cart, KDS   |
|                                                   | status bump, BOM depletion, token versioning  |
+---------------------------------------------------+-----------------------------------------------+
| `prototype/src/mock/data.js`                      | Canonical mock domain models (583 lines):     |
|                                                   | Menu items, modifiers, tables, KDS tickets,   |
|                                                   | members, coupons, recipe BOMs, staff accounts |
+---------------------------------------------------+-----------------------------------------------+
| `prototype/src/screens/`                          | 9 verified production-grade screen components:|
| - `CustomerQRMenuScreen.jsx` & `CustomerProgress` | SCR-CUST-03, SCR-CUST-04 (Guest QR & Stepper) |
| - `KitchenKDSScreen.jsx`                          | SCR-KDS-01, SCR-KDS-02 (FIFO queue, 86 modal) |
| - `WaiterFloorScreen.jsx`                         | SCR-WAIT-01, SCR-WAIT-03 (Floor map, Drawer)  |
| - `CashierPOSScreen.jsx`                          | SCR-POS-01, SCR-POS-03 (POS Bill, VietQR)     |
| - `ManagerPortalScreen.jsx`                       | SCR-MGR-01, SCR-MGR-02 (BI Forecast, BOM Form)|
| - `AdminConsoleScreen.jsx`                        | SCR-ADM-01, SCR-ADM-02 (RBAC directory, Logs) |
+---------------------------------------------------+-----------------------------------------------+
| `prototype/docs/MANAGER_ROLE_FEATURES.md`         | Managerial portal architectural guide:        |
|                                                   | 3 operational pillars, urgent approvals queue |
+---------------------------------------------------+-----------------------------------------------+
| `docs/chapter3/prd-draft.md`                      | Initial stakeholder proposal (Baseline)       |
| `docs/chapter3/product-requirements.md`           | Product Requirements Specification v1.1 (SRS) |
| `docs/chapter3/feature-specification.md`          | Architectural Feature Specifications (10 feats)|
| `docs/chapter3/user-stories.md`                   | Role-based User Stories and acceptance criteria|
+---------------------------------------------------+-----------------------------------------------+
| `docs/chapter4/user-flow.md`                      | Detailed User Flows (7 primary journeys)      |
| `docs/chapter4/wireframing.md`                    | Low-Fidelity wireframe specifications         |
| `docs/chapter4/prototyping.md`                    | Interactive prototype implementation report   |
| `docs/chapter4/ai-design-review.md`               | AI-assisted design review and verified audit  |
+---------------------------------------------------+-----------------------------------------------+
```

---

## 2. Empirical Evidence for Core Architectural Decisions

| Architectural Decision | Repository State | Documentary & Codebase Evidence | Classification & Rationale |
| :--- | :--- | :--- | :--- |
| **Modular Monolith Target Architecture** | Currently client-only React 18 prototype; zero backend Nest.js folders. | `feature-specification.md` (Section 1) specifies a centralized NestJS backend with relational PostgreSQL for ACID restaurant transactions. | **Target Production Architecture** (Adopted over microservices to avoid distributed transaction failures and excessive cloud operational overhead). |
| **Dual-Protocol Hybrid Communication** | `mockStore.jsx` simulates real-time push events via custom toasts and synchronous state updates. | `product-requirements.md` (FR-003, FR-007, NFR-3.1) mandates cross-terminal propagation latency $\le 2.0\text{ s}$. | **Target Production Architecture** (Verified behaviorally in the interactive prototype). |
| **BOM Raw Stock Depletion at `Cooking` Status** | `advanceTicketItemStatus()` in `mockStore.jsx` (line 312) executes stock depletion only when `nextStatus === 'Cooking'`. | `product-requirements.md` (FR-009) & `feature-specification.md` (SPEC-INV-007): Mandatory stock decrement upon transition to `Cooking`. | **Implemented & Code-Verified Decision.** |
| **Instant Session Revocation via `token_version`** | `toggleStaffStatus()` in `mockStore.jsx` (line 735) automatically increments `tokenVersion` (1 $\rightarrow$ 2) upon suspension. | `feature-specification.md` (SPEC-AUTH-001) & `prototyping.md` (Section 4.3.4): Database token version check to reject suspended staff immediately. | **Implemented & Code-Verified Decision.** |
| **Cumulative Discount Ceiling Clamped at 40%** | Mathematical clamping logic in `CashierPOSScreen.jsx` strictly caps combined discounts at 40%. | `product-requirements.md` (FR-008, Rule 7): Cumulative member + coupon discount ceiling $\le 40\%$. | **Implemented & Code-Verified Decision.** |
| **Unserved Dish Settlement Gate** | Settlement button disabled in `CashierPOSScreen.jsx` if items remain in `Cooking` status. | `product-requirements.md` (FR-008, Rule 6): Prevents billing unserved or actively cooking items without manager void. | **Implemented & Code-Verified Decision.** |

---

## 3. Pattern Implementation vs. Proposed Enhancements Matrix

| Pattern Name | Status in Prototype | Status in Target Nest.js Backend | Concrete Code Location / Evidence |
| :--- | :---: | :---: | :--- |
| **State Management (Context Engine)** | Fully Implemented (100%) | Replaced by HTTP API & Redis | `prototype/src/store/mockStore.jsx` serves as the centralized source of truth |
| **Dependency Injection (DI)** | Not Applicable (React JSX) | Proposed Core Pattern (100%) | Fundamental paradigm of NestJS (`@Injectable()` services and controllers) |
| **Repository Pattern** | Not Applicable | Proposed Core Pattern (100%) | Encapsulates TypeORM / Prisma database interactions from domain services |
| **Service Layer Pattern** | Partially Simulated | Proposed Core Pattern (100%) | Encapsulates business logic into dedicated classes (`OrderService`, `BomService`) |
| **Strategy Pattern** | Simulated via conditionals | Proposed Core Pattern (100%) | Interchangeable settlement algorithms (`VietQrStrategy`, `CashRoundingStrategy`) |
| **Observer / Event-Driven Pattern** | Simulated via state listeners | Proposed Core Pattern (`EventEmitter2`)| Event decouplers (`order.created`, `kds.bumped`, `inventory.depleted`) |
| **Token Versioning Pattern** | Fully Implemented (State Logic)| Proposed Guard Implementation | `AdminConsoleScreen.jsx` & `mockStore.jsx` (`tokenVersion` increment logic) |

---

## 4. Origin of Data Models and API Endpoint Contracts

1. **Database Schema Baseline:**
   * The workspace does **not currently contain raw `.sql` or `schema.prisma` files**.
   * All database tables, columns, constraints, foreign keys, and indexes documented in Chapter 5.4 were synthesized by formalizing and normalizing the rich mock data entities found in `prototype/src/mock/data.js` (`MOCK_MENU_ITEMS`, `MOCK_INITIAL_TABLES`, `MOCK_INITIAL_KDS_TICKETS`, `MOCK_MEMBERS`, `MOCK_RECIPE_BOM`, `MOCK_STAFF_ACCOUNTS`, `MOCK_AUDIT_LOGS`, `MOCK_MANAGER_APPROVALS`).
2. **API Endpoint Baseline:**
   * The repository does **not currently contain backend REST controllers**.
   * The API catalog in Chapter 5.5 was constructed via a direct 1-to-1 functional mapping of the state mutation actions in `mockStore.jsx` (e.g., `submitCustomerOrder` $\rightarrow$ `POST /api/v1/orders`, `advanceTicketItemStatus` $\rightarrow$ `PATCH /api/v1/kds/tickets/:id/items/:itemId/status`), integrated with the formal specifications in `docs/chapter3/feature-specification.md`.

---

## 5. Technical Assumptions, Limitations, and Manual Human Verification

1. **Deployment Architecture Assumptions:**
   * Assumes production deployment utilizes Docker containers running Node.js (NestJS), PostgreSQL 16, and Redis 7 within a unified private subnet to achieve the required sub-2.0s operational event latency.
2. **Current Technical Gaps:**
   * The current workspace only contains the client-side React 18 prototype (`prototype/`). Server-side NestJS code, database migrations, and integration test suites remain to be implemented in subsequent development phases (Chapter 6).
   * Machine learning components (Apriori pairing rules and 7-day ARIMA forecasts) currently operate on deterministic mock baselines (`MOCK_AI_PAIRINGS`, `MOCK_AI_FORECAST`) rather than active Python/Node.js inference pipelines.
3. **Items Requiring Manual Human Verification:**
   * Concurrency load testing on the Socket.IO cluster when handling over 500 concurrent connections across 50 active tables.
   * Cryptographic verification of incoming bank webhook callbacks (HMAC-SHA256 signature verification) for live VietQR production deployment.
   * Hardware thermal profiling for wall-mounted KDS tablets in high-heat commercial kitchen environments.
