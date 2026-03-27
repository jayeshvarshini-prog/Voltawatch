# VoltaWatch - EV Telemetry Monitoring System

Full-stack TypeScript monorepo for electric vehicle telemetry monitoring with GraphQL, BFF layer, and micro-frontend architecture.

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐
│  Dashboard (FE) │      │  Settings (FE)  │
│   Port: 8080    │      │   Port: 8081    │
│  (Micro-FE #1)  │      │  (Micro-FE #2)  │
└────────┬────────┘      └────────┬────────┘
         │                        │
         └──────────┬─────────────┘
                    │ REST API
              ┌─────▼─────────────┐
              │       BFF         │
              │    Port: 3000     │
              │  Apollo Client    │ ← Hits GraphQL
              └─────┬─────────────┘
                    │ GraphQL
              ┌─────▼─────────────┐
              │     Backend       │
              │    Port: 5000     │
              │  NestJS + GraphQL │
              └─────┬─────────────┘
                    │ SQL
              ┌─────▼─────────────┐
              │   PostgreSQL DB   │
              │  Production Data  │
              └───────────────────┘
```

## 📁 Project Structure

```
voltawatch/
├── apps/
│   ├── backend/              # NestJS + GraphQL server (port 5000)
│   │   ├── src/
│   │   │   ├── cars/        # Car resolver, service, entity
│   │   │   ├── telemetry/   # Telemetry resolver, service, entity
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── bff/                  # Backend for Frontend (port 3000)
│   │   ├── src/
│   │   │   ├── graphql-client/  # Apollo Client setup
│   │   │   ├── cars/            # REST endpoints for cars
│   │   │   ├── telemetry/       # REST endpoints for telemetry
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── dashboard/            # React micro-frontend (port 8080)
│   │   ├── src/             # Battery gauge, telemetry chart, metric cards
│   │   ├── webpack.config.js # Module Federation (exposes ./App)
│   │   └── package.json
│   │
│   └── settings/             # React micro-frontend (port 8081)
│       ├── src/             # Login/register, car CRUD, profile
│       ├── webpack.config.js # Module Federation (exposes ./App)
│       └── package.json
│
├── packages/
│   └── shared/               # Shared TypeScript types
│       ├── src/
│       │   └── index.ts     # Car, TelemetryReading, FaultCode types
│       ├── package.json
│       └── tsconfig.json
│
├── database/
│   ├── schema.sql            # PostgreSQL schema with indexes
│   ├── seed.sql              # Production EV snapshot data
│   └── migrations/           # Future migrations
│
├── skills/
│   └── plan.md               # Agile planning skill (/plan)
│
├── FEATURES.md               # Complete feature inventory (~250 features)
├── package.json              # Root workspace config
├── tsconfig.json             # Root TypeScript config
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## ✨ Features

### 🗄️ Database Layer (PostgreSQL)
- **Production EV snapshot** with real-world fields:
  - Current mileage, battery health %, estimated range
  - Last service date
  - Temperature readings (battery, motor, cabin)
  - Fault codes array
- **Performance indexes** on battery health & range for fast queries
- **Row-level security (RLS)** for multi-tenant data isolation
- **Seed data**: 5 cars, 3 users, ~500 telemetry readings with realistic patterns

### ⚙️ Backend (NestJS + GraphQL - Port 5000)
- **GraphQL API** with playground enabled
- **Queries**:
  - `cars` - List all cars
  - `car(id)` - Get single car details
  - `telemetry(carId, limit)` - Get historical readings
  - `latestReading(carId)` - Get most recent data
- **Subscriptions** (ready for live updates)
- **PostgreSQL connection** with connection pooling
- **TypeScript entities** with decorators

### 🔌 BFF Layer (NestJS + Apollo Client - Port 3000)
- **Apollo Client** configured to hit GraphQL backend
- **REST API** for micro-frontends:
  - `GET /api/cars` - All cars
  - `GET /api/cars/:id` - Single car
  - `GET /api/telemetry/:carId` - Telemetry data
  - `GET /api/telemetry/:carId/latest` - Latest reading
- **CORS** configured for micro-frontends on ports 8080/8081
- **Simple, clean code** - no overengineering

### 📦 Shared Package
- **TypeScript types** shared across all apps:
  - `Car` interface (id, vin, model, mileage, battery health, etc.)
  - `TelemetryReading` interface (voltage, temps, GPS, faults, etc.)
  - `FaultCode` enum (P0001, BATTERY_LOW, OVERHEAT, etc.)
  - `User` interface
- **Single source of truth** for type definitions

### 🎯 Agile Planning Skill
- `/plan` skill for sprint planning
- Breaks down FEATURES.md into user stories
- Generates roadmaps and backlogs

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (for native fetch support)
- PostgreSQL database (Supabase, Neon, or local)
- npm or yarn

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd voltawatch
npm install
```

### 2. Database Setup

**Option A: Supabase (Recommended - Free)**
1. Create account at https://supabase.com
2. Create new project named "voltawatch"
3. Get connection string from Settings → Database
4. Copy to `.env` file

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL
# Create database: voltawatch
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your database URL:
```env
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

### 4. Run Migrations

```bash
# Apply schema
npm run db:migrate

# Load production snapshot data (5 cars, ~500 readings)
npm run db:seed
```

### 5. Start Development Servers

```bash
# Run all services together
npm run dev

# OR run individually:
npm run dev:backend    # GraphQL server on port 5000
npm run dev:bff        # BFF on port 3000
npm run dev:dashboard  # Dashboard on port 8080 (when built)
npm run dev:settings   # Settings on port 8081 (when built)
```

### 6. Test the APIs

**GraphQL Playground**: http://localhost:5000/graphql

```graphql
query GetCars {
  cars {
    id
    vin
    model
    year
    currentMileage
    batteryHealthPercentage
    estimatedRangeKm
    lastServiceDate
  }
}

query GetTelemetry {
  telemetry(carId: "650e8400-e29b-41d4-a716-446655440000", limit: 10) {
    timestamp
    batteryPercentage
    batteryVoltage
    faultCodes
    isCharging
  }
}

query GetLatestReading {
  latestReading(carId: "650e8400-e29b-41d4-a716-446655440000") {
    batteryPercentage
    speedKmh
    currentMileage
  }
}
```

**BFF REST API**: http://localhost:3000/api/cars

```bash
# Get all cars
curl http://localhost:3000/api/cars

# Get specific car
curl http://localhost:3000/api/cars/650e8400-e29b-41d4-a716-446655440000

# Get telemetry
curl "http://localhost:3000/api/telemetry/650e8400-e29b-41d4-a716-446655440000?limit=50"

# Get latest reading
curl http://localhost:3000/api/telemetry/650e8400-e29b-41d4-a716-446655440000/latest
```

## 📊 Production Snapshot Data

The seed file includes realistic EV data:

### Cars (5 Total)
| Model | VIN | Mileage | Battery Health | Range | Faults |
|-------|-----|---------|----------------|-------|--------|
| Volvo EX90 | VOLVO12345EX90001 | 15,420 km | 94.5% | 425 km | None |
| Volvo C40 | VOLVO98765C40R001 | 28,750 km | 88.2% | 380 km | None |
| Tesla Model 3 | TESLA12345MODEL3 | 12,340 km | 97.8% | 520 km | Battery Low (historical) |
| Polestar 2 | POLESTAR234567890 | 45,600 km | 82.1% | 350 km | Overheat (historical) |
| Rivian R1T | RIVIAN12345R1T001 | 9,870 km | 99.2% | 480 km | None |

### Telemetry Patterns
- **~500 readings** spread across last 24 hours
- **Realistic scenarios**:
  - Normal driving/charging cycles
  - Battery warnings (voltage drop)
  - Motor overheating event
  - Charging sessions
- **GPS coordinates** from real locations (SF, LA, NYC, Seattle, Denver)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | TypeScript 5.3+ |
| **Backend** | NestJS 10 + GraphQL (Apollo Server) |
| **Database** | PostgreSQL 14+ |
| **BFF** | NestJS 10 + Apollo Client |
| **Frontend** | React 18 + Webpack 5 Module Federation |
| **Monorepo** | npm workspaces |
| **ORM** | Raw SQL with `pg` (lightweight) |

## 📝 Available Scripts

```bash
# Development
npm run dev                  # Run all services
npm run dev:backend          # Backend only
npm run dev:bff              # BFF only
npm run dev:dashboard        # Dashboard only
npm run dev:settings         # Settings only

# Database
npm run db:migrate           # Apply schema
npm run db:seed              # Load seed data

# Build
npm run build                # Build all workspaces

# Test
npm run test                 # Run tests in all workspaces
```

## 🎯 Agile Planning

Use the `/plan` skill to break down features:

```bash
# Create a sprint plan
/plan create-sprint 1

# Break down a category
/plan breakdown backend

# Generate full roadmap
/plan roadmap

# Create prioritized backlog
/plan backlog
```

See `FEATURES.md` for the complete feature inventory (~250 features).

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `PORT` | Backend GraphQL port | `5000` |
| `BFF_PORT` | BFF REST API port | `3000` |
| `GRAPHQL_ENDPOINT` | Backend GraphQL URL for BFF | `http://localhost:5000/graphql` |
| `ALLOWED_ORIGIN` | CORS allowed origin | `http://localhost:8080` |
| `NODE_ENV` | Environment | `development` |

## 🏗️ Next Steps

### Phase 1: Core Backend ✅
- [x] PostgreSQL schema with production fields
- [x] Seed data with realistic EV snapshots
- [x] NestJS + GraphQL backend
- [x] BFF with Apollo Client
- [x] Shared TypeScript types

### Phase 2: Frontend ✅
- [x] Dashboard micro-frontend (React + Webpack 5 Module Federation, port 8080)
- [x] Settings micro-frontend (React + Webpack 5 Module Federation, port 8081)
- [x] Real-time telemetry display via WebSocket
- [x] Historical charts (battery %, speed, motor temp) with Recharts
- [x] JWT authentication (login/register) with localStorage persistence
- [x] Car management CRUD (add, edit, delete vehicles)
- [x] Battery gauge SVG widget, fault code panel, metric cards

### Phase 3: Advanced Features
- [x] WebSocket gateway for live telemetry (BFF /ws/telemetry)
- [x] JWT authentication (backend + BFF)
- [x] Telemetry simulator script
- [ ] Agentic workflows (/monitor-volta, /predict-degrade)
- [x] CI/CD pipeline (GitHub Actions)
- [x] Docker deployment

## 📄 License

MIT

## 🤝 Contributing

See `FEATURES.md` for the complete feature list and use `/plan` to create user stories.

---

**Built with ❤️ for electric vehicle fleet monitoring**
