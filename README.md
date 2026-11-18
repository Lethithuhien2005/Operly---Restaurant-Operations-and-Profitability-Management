# 🍽️ Restaurant Operations Management System (OPERLY)

> A comprehensive, real-time single-branch restaurant operations management system integrated with AI recommendations, revenue forecasting, QR ordering, and automated inventory control.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [User Roles & Permissions](#-user-roles--permissions-rbac)
- [Functional Modules](#-functional-modules--core-user-stories)
- [Business Rules](#-business-rules)
- [Database Schema & Data Flow](#-database-schema--data-flow)
- [Installation & Setup](#-installation--setup)
- [API Documentation](#-api-documentation-summary)
- [Non-Functional Requirements & Security](#-non-functional-requirements--security)
- [Project Roadmap](#-project-roadmap)
- [License](#-license)

---

## 📌 Overview

Traditional restaurant operational workflows face severe bottlenecks, including slow communication, paper-based order errors, labor inefficiencies during peak hours, out-of-sync inventory and table statuses, and a lack of data-driven forecasting tools.

**OPERLY (v1.0)** digitizes restaurant operations in real time. It bridges the gap between customers (online and dine-in), waiters, kitchen chefs, cashiers, and restaurant managers.

### 🎯 Key Business Objectives

| Objective                             | Description                                                                                                     |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **100% Operational Digitization**     | Eliminate paper-based order recording and manual handoffs.                                                      |
| **40%+ Reduction in Order Lead Time** | Achieve sub-second status synchronization between dine-in tables, kitchen displays, and waiters via WebSockets. |
| **Data Consistency**                  | Instantly synchronize table layouts, stock inventory, and billing records.                                      |
| **Data-Driven Management**            | Provide AI-powered cross-selling recommendations and time-series demand/revenue forecasting.                    |
| **Customer Retention**                | Integrate a multi-tier loyalty program with targeted discounts and point accumulation.                          |

---

## ✨ Key Features

### 1. QR Code Dine-in Ordering & AI Recommendations

- Scan QR codes at restaurant tables to access the interactive digital menu.
- Smart item pairing recommendations (e.g., ordering BBQ suggests side dishes and beverages).
- Real-time dish order progress:

  `Created → Cooking → Ready → Served`

### 2. Online Reservation & Deposit Gateway

- Book tables by selecting timeslots and guest counts.
- Pre-order dishes online.
- Automatically enforce a minimum **40% deposit** for pre-orders exceeding **1,000,000 VND**.

### 3. Real-time Table Management

- Visual table map organized by floor and area.
- Four real-time table states:
  - Available
  - Reserved
  - Occupied
  - Cleaning
- Table merging (B01 + B02) and splitting without order corruption.

### 4. Kitchen Queue Display (KDS)

- FIFO (First-In, First-Out) real-time kitchen queue.
- Audio alerts for incoming orders.
- Quick status updates: Pending → Cooking → Ready.
- High-priority order tagging.
- Emergency out-of-stock alerts.

### 5. Point-of-Sale (POS) & Billing

- Visual checkout queue.
- Automated membership discounts (Bronze, Silver, Gold).
- Coupon code validation.
- Bill splitting by item or headcount.
- Two-phase billing:
  - Pre-print bill.
  - Official fiscal receipt.

### 6. Automated Inventory Control

- Automatically deduct raw materials based on recipe specifications upon order completion.
- Minimum stock threshold alerts.
- Stock-in and purchase order management.

### 7. Employee Scheduling & Attendance

- Shift scheduling with collision detection.
- Mobile check-in/check-out verified through GPS geofencing.

### 8. AI Analytics & Executive Dashboard

- Sales velocity and best-selling dish analytics.
- Shift labor cost visualization using Recharts.
- AI-powered foot traffic and revenue forecasting.

---

## 🏗️ System Architecture

```text
                         +-----------------------------------+
                         |           Client Layer            |
                         +-----------------------------------+
                                          |
        +----------------------+----------+----------------------+
        |                      |          |                      |
 [Customer Web App]   [Waiter Mobile] [Chef KDS Dashboard] [POS / Admin Web]
  (React / Next.js)    (React Native)   (React Dashboard)  (React / Next.js)
        |                      |          |                      |
        +----------------------+----------+----------------------+
                                          |
                                    HTTP / WebSocket
                                          |
                                          v
                         +-----------------------------------+
                         |       API Gateway & Middleware    |
                         |      JWT Auth, RBAC, Rate Limit    |
                         +-----------------------------------+
                                          |
                                          v
                         +-----------------------------------+
                         |          Backend Services         |
                         |         Node.js / Express         |
                         +-----------------------------------+
                              /           |            \
                             v            v             v
                     +-------------+ +-----------+ +----------------+
                     |  Database   | | WebSocket | | AI Analytics   |
                     | PostgreSQL  | |  Socket.IO| | Python /       |
                     | / MongoDB   | |           | | Scikit-learn   |
                     +-------------+ +-----------+ +----------------+
```

---

## 🧪 Tech Stack

### Frontend & Mobile

| Technology                  | Purpose                                        |
| --------------------------- | ---------------------------------------------- |
| React.js / Next.js          | Customer, POS, KDS, and Admin web applications |
| React Native / Expo         | Waiter mobile application                      |
| TailwindCSS                 | UI styling                                     |
| Recharts                    | Data visualization                             |
| Lucide Icons                | Interface icons                                |
| Redux Toolkit / React Query | State management and data fetching             |
| Socket.IO Client            | Real-time communication                        |

### Backend & Microservices

| Technology          | Purpose                 |
| ------------------- | ----------------------- |
| Node.js             | Runtime environment     |
| Express.js / NestJS | Backend framework       |
| TypeScript          | Type-safe development   |
| Socket.IO           | Real-time communication |
| JWT                 | Authentication          |
| Bcrypt              | Password hashing        |

### AI Engine & Data Processing

| Technology                     | Purpose                        |
| ------------------------------ | ------------------------------ |
| Python / FastAPI               | AI service                     |
| Collaborative Filtering        | Recommendation system          |
| Association Rule Mining        | Cross-selling recommendations  |
| Prophet / ARIMA / Holt-Winters | Revenue and demand forecasting |

### Database & Storage

| Technology           | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| PostgreSQL / MongoDB | Relational / NoSQL database                      |
| Redis                | Cache, session management, and Socket.IO adapter |
| Cloudinary           | Image and media storage                          |

---

## 👥 User Roles & Permissions (RBAC)

OPERLY implements strict Role-Based Access Control (RBAC).

| Role         | Access Level & Key Responsibilities                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| **Customer** | Browse menus, place QR orders, track food progress, reserve tables, and participate in the loyalty program.  |
| **Waiter**   | View table layouts, assist ordering, check in reservations, merge/split tables, and request pre-print bills. |
| **Chef**     | Receive FIFO kitchen queues, update cooking statuses, trigger out-of-stock alerts, and prioritize dishes.    |
| **Cashier**  | Manage POS checkout, apply loyalty discounts, process payments, and split bills.                             |
| **Manager**  | Manage menus, inventory approvals, employee schedules, AI forecasts, and promotions.                         |
| **Admin**    | Configure the system, manage RBAC permissions and user accounts, and view audit logs.                        |

---

## 📋 Functional Modules & Core User Stories

### 1. Customer Module (9 Stories Total)

- Member registration and login with phone number validation and JWT authentication.
- Online reservation and deposit payment.
- QR dine-in ordering.
- AI-powered cross-selling recommendations.
- Real-time order progress tracking without page reload.

### 2. Waiter Module (10 Stories Total)

- Real-time interactive table map.
- Reservation check-in.
- Proxy ordering with custom item notes.
- Table merging and splitting.
- Pre-print bill requests.

### 3. Kitchen Module (7 Stories Total)

- Real-time FIFO kitchen queue with audio notifications.
- Dish processing status updates.
- Out-of-stock alerts.
- Order item rejection with reasons.
- High-priority order management.

### 4. Cashier Module (7 Stories Total)

- Checkout queue monitoring.
- Loyalty and discount integration.
- Multi-payment and final billing.
- Bill splitting by items or headcount.
- Refund and void transaction management with manager authorization.

### 5. Manager Module (12 Stories Total)

- Menu and price management.
- Inventory control and stock-in approval.
- Employee scheduling with collision detection.
- AI analytics dashboard.
- Promotions and special events.

### 6. Admin Module (6 Stories Total)

- User and RBAC management.
- Immutable audit logging for sensitive actions, including price overrides, voids, and refunds.

---

## ⚖️ Business Rules

1. **Reservation Anti-Collision Rule:** Physical tables cannot have overlapping reservations within a 90-minute window.
2. **Order Lifecycle Rule:** An order item cannot enter Cooking status until the order has been confirmed.
3. **Payment Completion Rule:** Cashiers cannot finalize an order as Paid unless all associated items are Served or officially rejected/canceled.
4. **Financial Modification Rule:** Financial changes, including menu price changes, payment voids, and refunds, require Manager authorization.
5. **Inventory Safety Rule:** Low-stock alerts must be dispatched to the Manager dashboard. Auto-ordering for dependent recipes is restricted when the Chef confirms an item is out of stock.

---

## 🗄️ Database Schema & Data Flow

### Primary Entities & Relationships

| Entity Relationship                       | Description                                               |
| ----------------------------------------- | --------------------------------------------------------- |
| User (1) — (N) Order                      | One user can create multiple orders.                      |
| User (1) — (1) Role                       | Each user is assigned a role.                             |
| Area (1) — (N) Table                      | One area contains multiple tables.                        |
| Table (1) — (N) Order                     | A table can be associated with multiple orders over time. |
| Order (1) — (N) OrderItem                 | One order contains multiple order items.                  |
| MenuItem (1) — (N) Recipe                 | A menu item can have multiple recipe ingredients.         |
| Recipe (N) — (1) InventoryItem            | Recipe records reference inventory items.                 |
| User (1) — (1) LoyaltyAccount             | A user has a loyalty account.                             |
| LoyaltyAccount (1) — (N) PointTransaction | One loyalty account has multiple point transactions.      |

---

## 💻 Installation & Setup

### Prerequisites

- Node.js v18.x or higher
- npm / yarn / pnpm
- PostgreSQL v14+ or MongoDB v6+
- Redis v6+
- Python v3.9+ (for AI module)

### 1. Environment Setup

Clone the repository:

```bash
git clone https://github.com/your-org/operly.git
cd backend
```

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5433/operly_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_secret_key_here
REFRESH_TOKEN_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Engine Endpoint
AI_SERVICE_URL=http://localhost:8000
```

### 2. Backend Installation

```bash
cd backend
npm install

npm run migrate
npm run seed
npm run dev
```

### 3. Frontend Installation

```bash
cd frontend
npm install
npm run dev
```

### 4. AI Engine Setup

```bash
cd ai-service

python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload --port 8000
```

---

## 🔌 API Documentation Summary

**Base URL:** `/api/v1`

### Authentication & RBAC

| Method | Endpoint              | Description                  |
| ------ | --------------------- | ---------------------------- |
| POST   | `/auth/register`      | Customer account creation    |
| POST   | `/auth/login`         | User login                   |
| POST   | `/auth/refresh-token` | Refresh expired access token |

### Tables & Reservations

| Method | Endpoint                     | Description                        |
| ------ | ---------------------------- | ---------------------------------- |
| GET    | `/tables`                    | Get real-time table statuses       |
| POST   | `/reservations`              | Create reservation with pre-orders |
| POST   | `/reservations/:id/check-in` | Check in a reservation             |

### Menu & QR Ordering

| Method | Endpoint                  | Description                            |
| ------ | ------------------------- | -------------------------------------- |
| GET    | `/menu`                   | Fetch menu items with category filters |
| POST   | `/orders`                 | Place a new order                      |
| POST   | `/orders/recommendations` | Get AI-recommended menu items          |

### Kitchen Display

| Method | Endpoint                          | Description                   |
| ------ | --------------------------------- | ----------------------------- |
| GET    | `/kitchen/queue`                  | Get active FIFO kitchen queue |
| PATCH  | `/kitchen/items/:id/status`       | Update dish processing status |
| POST   | `/kitchen/items/:id/out-of-stock` | Mark a dish as out of stock   |

### POS & Billing

| Method | Endpoint          | Description                            |
| ------ | ----------------- | -------------------------------------- |
| GET    | `/checkout/queue` | Get unpaid checkout orders             |
| POST   | `/checkout/split` | Split an invoice                       |
| POST   | `/checkout/pay`   | Complete payment and release the table |

---

## 🔒 Non-Functional Requirements & Security

- **HTTPS Enforcement:** Encrypt all production HTTP communications using SSL/TLS.
- **Password Hashing:** Hash passwords using bcrypt with a salt round factor of at least 10.
- **Token Security:** Use short-lived JWT access tokens (15 minutes) and HttpOnly, SameSite refresh tokens.
- **Real-time Performance:** Target Socket.IO synchronization latency below 2 seconds.
- **Responsiveness:** Support desktop, tablet, and mobile interfaces.
- **Auditability:** Record sensitive financial and inventory mutations in read-only audit logs.

---

## 🛣️ Project Roadmap

- [ ] **Phase 1 (v1.0):** Single-branch operational digitization, QR ordering, KDS, POS, basic inventory, and core RBAC.
- [ ] **Phase 2 (v1.1):** Advanced AI model fine-tuning with multi-seasonal demand forecasting.
- [ ] **Phase 3 (v2.0):** Multi-branch support, chain management dashboard, and centralized inventory logistics.
- [ ] **Phase 4 (v2.1):** Direct integration with Tax Department e-invoicing (VAT) services.

---

## 📄 License

This project is proprietary software created for OPERLY Operational Software. All rights reserved.
