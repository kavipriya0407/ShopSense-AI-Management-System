# ShopSense: AI-Powered Multi-Vendor E-Commerce Analytics Platform

> **"Turn E-Commerce Data Into Smarter Decisions."**  
> ShopSense unites modern multi-vendor commerce, business intelligence, machine learning forecasting, and generative AI into one intelligent platform.

[![ShopSense CI](https://github.com/shopsense/shopsense-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/shopsense/shopsense-ai)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Database](https://img.shields.io/badge/Database-PostgreSQL_%7C_SQLite-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Platform Highlights

ShopSense is built as a complete, working, production-style web platform combining high-performance e-commerce with analytics and machine learning:

1. **Multi-Vendor Storefront**:
   - Customer catalog search, faceted category/price/rating filters, wishlist cards, product detail galleries, and shopping cart.
   - Interactive checkout simulation with address capture and instant transaction generation.
   - Real-time customer order tracking timelines (`CONFIRMED` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED`).

2. **Vendor Intelligence Portal**:
   - Real-time Business Intelligence dashboard with gross revenue, order volume, Average Order Value (AOV), and conversion rate metrics.
   - Multi-axis Recharts: Revenue & profit trends, merchandise category sales, and top product velocity.
   - **Marketplace Benchmarking**: Live statistical comparison of vendor metrics against aggregate platform peer averages.

3. **Machine Learning & Statistical Forecasting**:
   - **Demand & Sales Forecasting**: Triple exponential smoothing (**Holt-Winters algorithm**) modeling day-of-week seasonality, trend damping, and 95% confidence intervals across 7-day, 30-day, and 90-day horizons.
   - **Safety Stock Restocking Recommendations**: Automatically calculates supply buffer lead times based on projected sales trajectory.
   - **Customer RFM Segmentation**: Classifies customer cohorts into **VIP**, **High Value**, **Regular**, **Occasional**, **New**, and **At Risk** with predictive Customer Lifetime Value (CLV).
   - **Recommendation Engine**: Dual collaborative and content-based cosine similarity engine powering *"Recommended For You"* and *"Similar Products"* carousels.

4. **Generative AI & Natural Language Processing**:
   - **RAG AI Shopping Assistant**: Conversational assistant indexing the live catalog. Customer questions like *"What is the best laptop for video editing under ₹1,20,000?"* retrieve exact database records and generate grounded answers with interactive, clickable product cards.
   - **Safe Text-to-SQL AI Data Analyst**: Translates natural language questions into safe, read-only SQL queries. AST parser strictly blocks `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, and `TRUNCATE`, executing safe queries and rendering interactive Bar, Line, Pie, and Table charts.
   - **AI Product Copywriting Generator**: Automatically writes high-converting descriptions, SEO titles, search tags, and keywords.
   - **Automated Anomaly Detection**: Diagnoses category sales drops, inventory turnover risks, and margin leaders.
   - **Aspect-Based Review Sentiment**: Classifies review polarity (Positive / Neutral / Negative) and extracts specific praises (battery, build) and complaints (transit delay) into *"Customer Voice"*.

5. **Real-Time WebSockets & Notifications**:
   - Live WebSocket stream (`/api/ws/notifications`) instantly alerting vendors and admins with toast notifications upon new order placement.

6. **Automated Reporting & CSV Exports**:
   - Filterable Sales, Revenue, Inventory, and Customer reports with 1-click CSV download.

7. **Superadmin Platform Command Center**:
   - Global GMV volume, platform take-rate commission revenue, merchant verification toggles, and system telemetry (database latency in ms, dialect bindings, and active WebSocket sessions).

8. **Dual AI Strategy**:
   - Cloud AI enabled via `GEMINI_API_KEY` (Google Gemini 1.5 Flash) or `OPENAI_API_KEY`.
   - **Intelligent Local Deterministic Fallback**: If external API keys are absent, all RAG search, Text-to-SQL analysis, and sentiment features operate out-of-the-box offline without crashing or requiring API credits.

---

## 🔑 Demo Accounts & 1-Click Quick Login

The database is seeded with realistic test data across 108 products, 11 vendors, 105 customers, and 540 orders.

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@shopsense.com` | `ShopSense@123` | `/admin/dashboard` |
| **Vendor** | `vendor@shopsense.com` | `ShopSense@123` | `/vendor/dashboard` |
| **Customer** | `customer@shopsense.com` | `ShopSense@123` | `/` (Storefront) |

> 💡 **Quick Login**: The Login screen features 1-click demo switcher buttons for instant access without manual typing.

---

## 🏗️ Architecture & Technology Stack

```
                              ┌─────────────────────────────────────────┐
                              │      ShopSense Frontend (React 19)      │
                              │  TypeScript • Tailwind CSS • Recharts   │
                              └───────────────────┬─────────────────────┘
                                                  │ REST APIs & WebSockets
                                                  ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           FastAPI Application Layer                               │
│  ┌───────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐  │
│  │ JWT Authentication    │ │ Store & Order APIs     │ │ Real-Time WebSocket Hub│  │
│  └───────────────────────┘ └────────────────────────┘ └────────────────────────┘  │
│  ┌───────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐  │
│  │ BI Analytics Engine   │ │ Holt-Winters Forecast  │ │ Customer RFM Engine    │  │
│  └───────────────────────┘ └────────────────────────┘ └────────────────────────┘  │
│  ┌───────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐  │
│  │ RAG Shopping Assistant│ │ Safe Text-to-SQL (AST) │ │ Aspect Sentiment (NLP) │  │
│  └───────────────────────┘ └────────────────────────┘ └────────────────────────┘  │
└─────────────────────────────────────────┬─────────────────────────────────────────┘
                                          │ SQLAlchemy ORM
                                          ▼
                ┌───────────────────────────────────────────────────┐
                │          Database Layer (SQLite / PostgreSQL)     │
                │ 16+ Normalized Models, Indexes, Constraints, Logs │
                └───────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
ShopSense-AI/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Navbar, Footer, CartDrawer, ThemeToggle, Skeletons
│   │   │   ├── customer/         # ProductCard, Search, Filters
│   │   │   ├── vendor/           # VendorSidebar, InventoryModals
│   │   │   └── admin/            # AdminSidebar, HealthCards
│   │   ├── contexts/             # AuthContext, CartContext, ThemeContext, WebSocketContext
│   │   ├── pages/
│   │   │   ├── customer/         # HomePage, ProductsPage, ProductDetailPage, Categories, Checkout, Orders, Assistant
│   │   │   ├── vendor/           # Dashboard, Products, Inventory, Orders, Customers, Analytics, Forecasting, Reviews, AI Analyst, Reports, Profile
│   │   │   ├── admin/            # Dashboard, Vendors, Customers, Products, Transactions, Analytics, Health
│   │   │   ├── auth/             # LoginPage, RegisterPage
│   │   │   └── MilestonesPage.tsx# Interactive Milestone Progress
│   │   ├── services/             # api.ts (Typed API Client)
│   │   └── types/                # TypeScript Interfaces
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/
│   ├── app/
│   │   ├── api/                  # 18 Modular REST & WebSocket Routers
│   │   ├── core/                 # PBKDF2 Security, Deps, WebSocket Manager
│   │   ├── database/             # SQLAlchemy Engine & SessionLocal
│   │   ├── models/               # 16 Database Models
│   │   ├── schemas/              # Pydantic Request/Response Models
│   │   ├── analytics/            # BI Calculations & RFM Segmentation
│   │   ├── ml/                   # Holt-Winters Forecasting, Recommender, Sentiment
│   │   ├── ai/                   # RAG Engine, Safe Text-to-SQL, Product Copywriter, Insights
│   │   └── seed/                 # Realistic Data Seeder (108 Products, 540 Orders)
│   ├── tests/                    # Backend Test Runner & Pytest Suite
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Quickstart Guide

### Option 1: Run Locally (Fastest Development Setup)

#### Step 1: Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt

# Run seed data script (populates 108 products, 11 vendors, 540 orders)
python -m app.seed.seed_data

# Start FastAPI backend server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend will be live at `http://localhost:8000`  
Swagger API Docs: `http://localhost:8000/docs`

#### Step 2: Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend will be live at `http://localhost:5173`

---

### Option 2: Run via Docker Compose

```bash
# Build and launch all 4 services: PostgreSQL, Redis, FastAPI Backend, React Frontend
docker-compose up --build
```
- Storefront & Dashboards: `http://localhost:3000`
- FastAPI Backend: `http://localhost:8000`
- Swagger API Documentation: `http://localhost:8000/docs`

---

## 🧪 Testing & Quality Assurance

To execute the automated backend test suite:
```bash
cd backend
python -m tests.run_tests
```

**Verified Test Coverage**:
- `[PASS]` Password Hashing & JWT Validation (PBKDF2 HMAC SHA-256)
- `[PASS]` API Root & Health Check
- `[PASS]` Category Catalog Retrieval
- `[PASS]` Product Search, Filtering, and Pagination
- `[PASS]` Text-to-SQL AST Safety & Anti-Injection Guardrails
- `[PASS]` Role-Based Demo Authentication (Admin, Vendor, Customer)
- `[PASS]` System Health & Database Integrity Check
- `[PASS]` AI Recommendation Engine API

Frontend production build verification:
```bash
cd frontend
npm run build
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```ini
# Application
PROJECT_NAME="ShopSense"
SECRET_KEY="your-secure-jwt-secret"

# Database (SQLite by default, or PostgreSQL)
DATABASE_URL="sqlite:///./shopsense.db"
# DATABASE_URL="postgresql://shopsense:shopsense_password@localhost:5432/shopsensedb"

# Optional Cloud AI (Local deterministic fallback is used if omitted)
GEMINI_API_KEY=""
OPENAI_API_KEY=""
```

---

## 🎯 Important URLs & Navigation Guide

| Page | URL | Purpose |
| :--- | :--- | :--- |
| **Customer Storefront** | `/` | Hero, categories, trending products, metrics counter |
| **Product Catalog** | `/products` | Filterable catalog with search, price slider, and pagination |
| **Product Details** | `/products/:id` | High-res view, AI description, review sentiment, similar products |
| **RAG AI Assistant** | `/assistant` | Conversational RAG shopping assistant with product cards |
| **AI Recommendations** | `/recommendations` | Personalized recommendation engine grid |
| **Milestones Tracker** | `/milestones` | Milestones 1 to 4 architecture and execution progress |
| **Vendor BI Dashboard** | `/vendor/dashboard` | Revenue area trends, category donuts, benchmarks |
| **Vendor Inventory** | `/vendor/inventory` | Stock turnover, low stock warnings, restock modal |
| **Vendor Orders** | `/vendor/orders` | Order management and status transitions |
| **Vendor Customer RFM**| `/vendor/customers` | RFM segmentation cohorts and buyer CLV |
| **Vendor Forecasting** | `/vendor/forecasting`| 7/30/90-day Holt-Winters demand forecasting |
| **Review Sentiment** | `/vendor/reviews` | Customer Voice NLP pros/cons analytics |
| **AI Data Analyst** | `/vendor/ai-analyst` | Safe Text-to-SQL query engine with interactive charts |
| **AI Insights** | `/vendor/ai-recommendations`| Automated anomaly diagnosis and opportunity detection |
| **Automated Reports** | `/vendor/reports` | Summary reports with 1-click CSV export |
| **Admin Control Hub** | `/admin/dashboard` | Platform GMV, commission take-rates, vendor audit |
| **System Health** | `/admin/health` | Round-trip database ping latency and telemetry |
| **Swagger API Docs** | `http://localhost:8000/docs` | Interactive OpenAPI / Swagger documentation |

---

## 📜 License
This project is licensed under the MIT License. Developed for advanced engineering demonstration and production-grade deployment.
