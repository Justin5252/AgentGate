# AgentGate

AI Agent Identity & Permissions Platform — "Okta for AI agents."

## Tech Stack
- **Monorepo:** Turborepo with npm workspaces
- **API:** Node.js + TypeScript + Fastify
- **Policy Engine:** Rust compiled to WASM
- **Dashboard:** Next.js 15 + Tailwind + shadcn/ui
- **Database:** PostgreSQL
- **Cache:** Redis
- **Message Queue:** NATS
- **SDKs:** TypeScript, Python, Go, Java

## Project Structure
- `src/api/` — REST + gRPC API server
- `src/dashboard/` — Next.js admin dashboard
- `src/sdk/` — Client SDKs for agent integration
- `src/engine/` — Core policy evaluation engine (Rust/WASM)
- `src/integrations/` — Platform connectors (LLM providers, IdPs, cloud)
- `packages/` — Shared packages (types, utils, config)
- `docs/` — Documentation and ADRs
- `tests/` — Integration and E2E tests
- `scripts/` — Dev and deployment scripts

## Conventions
- TypeScript strict mode everywhere
- All API endpoints return consistent `{ data, error, meta }` envelope
- Policy definitions use YAML format
- Agent IDs are UUIDv7 (time-sortable)
- All agent actions are logged to audit trail (append-only)
