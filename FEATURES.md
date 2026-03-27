# VoltaWatch - Complete Feature Inventory

This document contains ALL features required for the VoltaWatch EV telemetry monitoring system, organized by layer.

---

## 1. DATABASE LAYER

### 1.1 Schema & Tables
- [ ] Users table with authentication fields
- [ ] Cars table with VIN, model, owner relationship
- [ ] Telemetry readings table with composite unique key (car_id, timestamp)
- [ ] Error codes enum (P0002, BATTERY_LOW, OVERHEAT, SENSOR_FAIL, etc.)
- [ ] Indexes for performance (car_id, timestamp, error_code)
- [ ] JSONB field for flexible raw telemetry data

### 1.2 Data Validation
- [ ] Voltage range validation (drop if < 250V)
- [ ] Required field validation (battery, RPM, GPS)
- [ ] Timestamp uniqueness per car
- [ ] Schema validation for JSON payloads
- [ ] Data type constraints

### 1.3 Security
- [ ] Row-level security (RLS) policies
- [ ] Owner-only access to car data
- [ ] Owner-only access to telemetry readings
- [ ] JWT claims integration for RLS
- [ ] Encrypted connections (SSL)

### 1.4 Performance & Maintenance
- [ ] Automatic updated_at triggers
- [ ] Time-series data partitioning (future: by month)
- [ ] Vacuum/cleanup jobs for old data
- [ ] Connection pooling configuration
- [ ] Query performance monitoring

---

## 2. DATA COLLECTION LAYER

### 2.1 Simulator Script
- [ ] Node-TS simulator hitting DB every 30 seconds
- [ ] Generate fake battery voltage data
- [ ] Generate fake RPM data
- [ ] Generate fake GPS coordinates (lat/long)
- [ ] Generate battery temperature
- [ ] Generate motor temperature
- [ ] Generate speed and odometer
- [ ] Generate charging status and power
- [ ] Simulate realistic driving/charging cycles
- [ ] Simulate error conditions periodically

### 2.2 WebSocket Bridge
- [ ] WebSocket server for car → BFF communication
- [ ] Connection authentication (JWT)
- [ ] Message validation before DB insert
- [ ] Connection state management
- [ ] Reconnection logic with exponential backoff
- [ ] Buffering for offline data
- [ ] Rate limiting per car
- [ ] Heartbeat/ping-pong for connection health

### 2.3 Data Ingestion Pipeline
- [ ] Telemetry ingestion endpoint (POST /api/telemetry)
- [ ] Batch ingestion support
- [ ] Duplicate detection and merging
- [ ] Out-of-order timestamp handling
- [ ] Data buffering and queuing
- [ ] Failed ingestion retry logic
- [ ] Ingestion metrics (success/failure rates)

---

## 3. BACKEND STACK (NestJS - Port 5000)

### 3.1 GraphQL API
- [ ] GraphQL schema definition
- [ ] Query: car(id) - get single car details
- [ ] Query: cars - list all cars for current user
- [ ] Query: telemetry(carId, timeRange) - get historical readings
- [ ] Query: latestReading(carId) - get most recent telemetry
- [ ] Subscription: liveTelemetry(carId) - real-time updates
- [ ] Mutation: upsertReading - insert/update telemetry
- [ ] Mutation: registerCar - add new car
- [ ] Mutation: updateCar - modify car details
- [ ] Mutation: deleteCar - remove car

### 3.2 Resolvers
- [ ] Car resolver with owner filtering
- [ ] Telemetry resolver with RLS enforcement
- [ ] User resolver for profile management
- [ ] DataLoader for N+1 query prevention
- [ ] Field-level resolvers for computed data
- [ ] Error handling and formatting

### 3.3 Services
- [ ] TelemetryService (CRUD operations)
- [ ] CarService (car management)
- [ ] UserService (user management)
- [ ] ValidationService (data validation)
- [ ] AlertService (error detection and notifications)
- [ ] AnalyticsService (data aggregation)

### 3.4 Data Validation Middleware
- [ ] NestJS interceptor for on-insert validation
- [ ] Voltage threshold check (< 250V = drop)
- [ ] Required field validation
- [ ] Schema validation against JSON schema
- [ ] Alert on missing fields
- [ ] Sanitization of input data

### 3.5 Database Integration
- [ ] PostgreSQL connection with Prisma/TypeORM
- [ ] Connection pooling
- [ ] Transaction support
- [ ] Migration system
- [ ] Seed data scripts
- [ ] Database health checks

---

## 4. BFF LAYER (NestJS - Port 3000)

### 4.1 Authentication & Authorization
- [ ] JWT guard middleware
- [ ] User login endpoint (POST /auth/login)
- [ ] User registration endpoint (POST /auth/register)
- [ ] Token refresh endpoint (POST /auth/refresh)
- [ ] Token validation
- [ ] Role-based access control (RBAC)
- [ ] API key management for agents

### 4.2 Security
- [ ] Rate limiting per IP (prevent abuse)
- [ ] CORS configuration (Volvo-origin only)
- [ ] Helmet.js security headers
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens for mutations

### 4.3 API Gateway
- [ ] Proxy to backend GraphQL (port 5000)
- [ ] Request logging and tracing
- [ ] Response caching
- [ ] Request/response transformation
- [ ] Error standardization
- [ ] API versioning support

### 4.4 Rate Limiting & Throttling
- [ ] Per-IP rate limits
- [ ] Per-user rate limits
- [ ] Configurable limits per endpoint
- [ ] Redis-based distributed rate limiting
- [ ] Rate limit headers in responses

---

## 5. MICRO-FRONTENDS

### 5.1 Dashboard Repo
- [ ] Real-time battery status widget
- [ ] Temperature gauge (battery + motor)
- [ ] Live map with GPS tracking
- [ ] RPM/speed indicators
- [ ] Charging status display
- [ ] Odometer reading
- [ ] Error/alert notifications panel
- [ ] Historical data charts (7-day view)
- [ ] GraphQL subscription for live updates
- [ ] Responsive grid layout
- [ ] Dark mode support

### 5.2 Settings Repo
- [ ] User login/logout flow
- [ ] Profile management
- [ ] API key generation and management
- [ ] Slash command toggle (enable/disable agentic features)
- [ ] Notification preferences
- [ ] Car management (add/edit/delete)
- [ ] Alert threshold configuration
- [ ] User preferences (units, timezone)

### 5.3 Module Federation
- [ ] Webpack 5 Module Federation setup
- [ ] Shared dependencies (React, React-DOM)
- [ ] Remote configuration for dashboard
- [ ] Remote configuration for settings
- [ ] Host app shell
- [ ] Routing integration (/dashboard, /settings)
- [ ] Shared authentication context
- [ ] Shared state management

### 5.4 Shared Components
- [ ] Design system / component library
- [ ] Shared UI components (buttons, cards, inputs)
- [ ] Shared hooks (useAuth, useWebSocket)
- [ ] Shared utilities (date formatting, unit conversion)
- [ ] Shared types/interfaces
- [ ] Theme provider

---

## 6. AGENTIC WORKFLOWS

### 6.1 /monitor-volta Command
- [ ] CLI/slash command interface
- [ ] Start monitoring job
- [ ] Subscribe to WebSocket for live data
- [ ] Detect voltage anomalies
- [ ] Detect battery critical states
- [ ] Detect temperature warnings
- [ ] Push warnings to Slack/Discord
- [ ] Log all alerts to database
- [ ] Alert summary report

### 6.2 /predict-degrade Command
- [ ] LLM integration (OpenAI/Anthropic)
- [ ] Fetch last 7 days of battery data
- [ ] Generate prompt for degradation prediction
- [ ] Ask: "When will battery hit 80% capacity?"
- [ ] Parse and log LLM response
- [ ] Store prediction in database
- [ ] Visualize prediction on dashboard
- [ ] Confidence interval calculation

### 6.3 Auto-Fix Mode
- [ ] Error code detection (e.g., P0002)
- [ ] Agent analyzes error context
- [ ] Generate YAML patch/fix
- [ ] Create GitHub branch
- [ ] Commit fix with description
- [ ] Open pull request automatically
- [ ] Tag relevant team members
- [ ] Run CI checks on PR

### 6.4 Agent Infrastructure
- [ ] Agent orchestration system
- [ ] LLM API integration with key rotation
- [ ] Agent cost tracking (tokens used)
- [ ] Agent duration logging
- [ ] Agent output storage
- [ ] Agent failure recovery
- [ ] Agent permission system

---

## 7. TESTING

### 7.1 Unit Tests
- [ ] Jest configuration
- [ ] GraphQL resolver tests
- [ ] Service layer tests (TelemetryService, CarService)
- [ ] Validation middleware tests
- [ ] Utility function tests
- [ ] Mock data generators
- [ ] Code coverage reporting (>80%)

### 7.2 E2E Tests
- [ ] Supertest setup
- [ ] BFF endpoint tests (auth, telemetry, cars)
- [ ] GraphQL query/mutation tests
- [ ] WebSocket connection tests
- [ ] Rate limiting tests
- [ ] CORS policy tests
- [ ] Authentication flow tests

### 7.3 Integration Tests
- [ ] Database integration tests
- [ ] External API integration tests (LLM)
- [ ] WebSocket integration tests
- [ ] Cache integration tests
- [ ] Queue integration tests

### 7.4 Agent Smoke Tests
- [ ] Send dummy telemetry data
- [ ] Verify Slack notification arrives
- [ ] Verify response time < 10 seconds
- [ ] Verify LLM prediction accuracy
- [ ] Verify auto-fix PR creation

### 7.5 Performance Tests
- [ ] Load testing (concurrent users)
- [ ] Stress testing (high telemetry volume)
- [ ] Database query performance
- [ ] WebSocket connection limits
- [ ] Memory leak detection

---

## 8. CI/CD PIPELINE

### 8.1 GitHub Actions Workflow
- [ ] Stage 1: Type checking (npm run type-check)
- [ ] Stage 2: Linting (npm run lint)
- [ ] Stage 3: Unit tests (npm test)
- [ ] Stage 4: E2E tests
- [ ] Stage 5: Docker build
- [ ] Stage 6: Push to GHCR (GitHub Container Registry)
- [ ] Stage 7: Deploy to Render/Fly (main branch only)
- [ ] Stage 8: Agent integration test (slash command < 10s)

### 8.2 Docker Configuration
- [ ] Multi-stage Dockerfile for backend
- [ ] Multi-stage Dockerfile for BFF
- [ ] Docker Compose for local development
- [ ] Environment variable management
- [ ] Health check endpoints
- [ ] Container optimization (layer caching)

### 8.3 Deployment
- [ ] Render.com deployment config
- [ ] Fly.io deployment config
- [ ] Database migration on deploy
- [ ] Zero-downtime deployment
- [ ] Rollback strategy
- [ ] Environment-specific configs (dev, staging, prod)

### 8.4 Code Quality
- [ ] ESLint configuration
- [ ] Prettier formatting
- [ ] Husky pre-commit hooks
- [ ] TypeScript strict mode
- [ ] Dependency vulnerability scanning
- [ ] License compliance checking

---

## 9. SECURITY

### 9.1 Secrets Management
- [ ] .env files (gitignored)
- [ ] .env.example template
- [ ] GitHub Secrets for CI/CD
- [ ] Environment variable validation on startup
- [ ] Secrets rotation policy
- [ ] Vault integration (future)

### 9.2 Row-Level Security
- [ ] PostgreSQL RLS policies
- [ ] Owner-only car access
- [ ] Owner-only telemetry access
- [ ] Admin role for support team
- [ ] Audit logging for data access

### 9.3 API Security
- [ ] JWT with short expiration (15min)
- [ ] Refresh token rotation
- [ ] API key rotation for agents
- [ ] HTTPS enforcement
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)

### 9.4 Agent Security
- [ ] LLM API key rotation
- [ ] Agent cannot call external APIs without approval
- [ ] Agent output sanitization
- [ ] Agent rate limiting
- [ ] Agent audit trail

---

## 10. OBSERVABILITY

### 10.1 Metrics
- [ ] Prometheus exporter on BFF
- [ ] Custom metrics (telemetry ingestion rate)
- [ ] API response times
- [ ] Database query times
- [ ] WebSocket connection count
- [ ] Error rates by endpoint
- [ ] Agent execution metrics

### 10.2 Dashboards
- [ ] Grafana dashboard setup
- [ ] System health overview
- [ ] Telemetry ingestion dashboard
- [ ] API performance dashboard
- [ ] Agent cost dashboard (tokens/cost)
- [ ] Alert dashboard

### 10.3 Logging
- [ ] Structured logging (JSON format)
- [ ] Log levels (debug, info, warn, error)
- [ ] Request ID tracing
- [ ] Slash command execution logs (duration, cost, output)
- [ ] Error stack traces
- [ ] Log aggregation (future: ELK/Loki)

### 10.4 Alerting
- [ ] Slack/Discord integration
- [ ] Critical error alerts
- [ ] Performance degradation alerts
- [ ] Agent failure alerts
- [ ] Database connection alerts
- [ ] Disk space alerts

---

## 11. DOCUMENTATION

### 11.1 Developer Documentation
- [ ] README.md with setup instructions
- [ ] Architecture overview
- [ ] API documentation (GraphQL schema docs)
- [ ] Database schema documentation
- [ ] Environment variables guide
- [ ] Contribution guidelines

### 11.2 User Documentation
- [ ] User manual for dashboard
- [ ] API usage examples
- [ ] Slash command reference
- [ ] Troubleshooting guide
- [ ] FAQ

### 11.3 Operations Documentation
- [ ] Deployment runbook
- [ ] Incident response guide
- [ ] Backup and recovery procedures
- [ ] Monitoring and alerting setup
- [ ] Database maintenance procedures

---

## TOTAL FEATURE COUNT: ~250+ features

This comprehensive list will be used by the `/plan` skill to generate user stories, sprints, and task breakdowns.
