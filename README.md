# VoltaWatch – Full Features & Pipeline Plan

## One. Data Collection Layer

- **Simulator script**: Node-TS file that hits your DB every thirty seconds, drops fake telemetry: battery, RPM, GPS.
- **WebSocket bridge**: car → BFF → Postgres. No direct car-to-DB talk.

## Two. Data Validation Pipeline

- **On-insert middleware** (Nest interceptor) runs: voltage < two-hundred-fifty volts? Drop it.
- **Schema validation**: Postgres enums for error codes, JSON-schema for payloads.
- **Alert** if any field missing—agent catches that, not you.

## Three. Backend Stack

- **Nest JS server** on port five-thousand.
- **GraphQL schema**: query car(id), subscription liveTelemetry(carId).
- **Mutation upsertReading**: merges duplicates on timestamp + carId.

## Four. BFF Layer

- **Second Nest app** on port three-thousand.
- **JWT guard**, rate-limit per IP, CORS only Volvo-origin allowed.
- All traffic funnels here, even agent calls.

## Five. Micro-Frontends

- **Dashboard repo**: shows grid—battery, temp, map.
- **Settings repo**: login, API keys, slash-command toggle.
- **Federation**: both remotes load on /dashboard and /settings.

## Six. Agentic Workflows

- **Slash monitor-volta**: starts job, subscribes to socket, pushes warnings.
- **Slash predict-degrade**: asks LLM "given last seven days, when will battery hit eighty percent?", logs answer.
- **Auto-fix mode**: if error-code = P-zero-zero-two (fake), agent writes YAML patch, opens PR.

## Seven. Testing

- **Unit**: Jest for resolvers, services.
- **E2E**: Supertest hits BFF, checks status.
- **Agent smoke**: script sends dummy data, checks Slack ping lands.

## Eight. CI/CD

**GitHub Actions**:
1. stage one: npm run type-check
2. stage two: npm run lint
3. stage three: npm test
4. stage four: docker build, push to ghcr
5. stage five: deploy to Render/Fly if main branch
6. stage six: run agent integration—slash command must answer in ten seconds.

## Nine. Security Bits

- Secrets in .env, never commit.
- Row-level policy: only owner sees own car.
- Agent can't call external LLM without key rotation.

## Ten. Observability

- Prometheus exporter on BFF, dashboard in Grafana.
- Every slash command logs duration, cost, output.
