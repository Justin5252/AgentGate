# AgentGate — AI Agent Identity & Permissions Platform

## Vision
The universal identity and access control layer for AI agents. Every company deploying AI agents needs a way to manage what those agents can access, when, and how. AgentGate is "Okta for AI agents."

## The Problem
- 81% of companies are deploying AI agents, but only 22% treat them as identity-bearing entities
- 88% of organizations have had security incidents from uncontrolled agent access
- AI agents bypass traditional IAM — they inherit user permissions or run as overprivileged service accounts
- No dominant player exists in this space (as of March 2026)
- Agent-to-agent (A2A) communication has near-zero visibility (only 24% of orgs can see it)

## The Solution
A platform that lets companies:
1. **Register** every AI agent as a first-class identity
2. **Define** granular, context-aware permissions (what data, which systems, under what conditions)
3. **Monitor** all agent actions and A2A communication in real time
4. **Enforce** policies automatically — block, throttle, or escalate to humans
5. **Audit** full agent activity trails for compliance

---

# Project Phases

## Phase 1: Foundation (Months 1-3)
**Goal:** Core identity engine + SDK + basic dashboard

### 1.1 Core Identity Engine (`src/engine/`)
- Agent identity registration and lifecycle management
- Unique agent IDs with cryptographic verification
- Agent metadata schema (owner, purpose, capabilities, risk level)
- Token issuance (short-lived JWTs for agent sessions)
- Permission resolution engine (role-based + attribute-based access control)

### 1.2 Policy Engine
- Policy definition language (YAML/JSON-based, human-readable)
- Context-aware rules (time, data sensitivity, action type, agent trust level)
- Allow/deny/escalate decision framework
- Policy versioning and rollback

### 1.3 API Layer (`src/api/`)
- REST API for agent registration, policy management, and audit queries
- gRPC endpoints for high-throughput agent authorization checks (<10ms latency target)
- Webhook system for real-time notifications (blocked actions, anomalies)

### 1.4 SDK v1 (`src/sdk/`)
- TypeScript/JavaScript SDK (first priority — covers most AI agent frameworks)
- Python SDK (second priority — covers LangChain, CrewAI, AutoGen, etc.)
- Simple integration: wrap existing agent code with 3-5 lines

### 1.5 Dashboard MVP (`src/dashboard/`)
- Agent registry view (all registered agents, status, last active)
- Policy editor (visual + code view)
- Real-time activity feed
- Basic analytics (requests/day, deny rate, top agents)

### Tech Stack — Phase 1
| Component       | Technology                          |
|-----------------|-------------------------------------|
| API Server      | Node.js + TypeScript + Fastify      |
| Policy Engine   | Rust (compiled to WASM for speed)   |
| Dashboard       | Next.js 15 + Tailwind + shadcn/ui   |
| Database        | PostgreSQL (agent registry + audit)  |
| Cache           | Redis (policy cache + rate limiting) |
| Auth            | Built-in (we ARE the auth product)   |
| Message Queue   | NATS (for real-time event streaming) |
| Monorepo        | Turborepo                           |

### Phase 1 Deliverables
- [x] Agent identity CRUD API
- [x] Policy definition schema + evaluation engine (31 tests)
- [x] JS/TS SDK with middleware pattern (12 tests)
- [x] Python SDK with LangChain/CrewAI middleware (14 tests)
- [x] Dashboard with agent registry + policy editor (6 pages)
- [x] Local dev environment (Docker Compose + Homebrew PostgreSQL)
- [x] Integration tests for policy engine
- [x] Landing page / marketing site
- [x] API key authentication system
- [x] Styled API root page with endpoint directory

---

## Phase 2: Intelligence & Integrations (Months 4-6)
**Goal:** Smart monitoring, major platform integrations, agent-to-agent controls

### 2.1 Integrations (`src/integrations/`)
- **LLM Providers:** OpenAI, Anthropic, Google AI, Azure OpenAI
- **Agent Frameworks:** LangChain, CrewAI, AutoGen, Semantic Kernel
- **Identity Providers:** Okta, Azure AD, Auth0 (sync human→agent ownership)
- **Cloud Platforms:** AWS IAM, GCP IAM, Azure RBAC (bridge agent permissions to cloud)
- **Data Stores:** Connect to databases/APIs the agents access for data-level policies

### 2.2 Anomaly Detection
- Baseline normal agent behavior patterns
- Flag deviations (unusual data access, permission escalation attempts, off-hours activity)
- ML-based risk scoring per agent session
- Automated response: throttle, isolate, or kill agent sessions

### 2.3 Agent-to-Agent (A2A) Governance
- A2A communication registry (which agents can talk to which)
- Data flow policies (what data can pass between agents)
- Chain-of-custody tracking for multi-agent workflows
- Visualization of agent interaction graphs

### 2.4 SDK Expansion
- Go SDK
- Java SDK
- REST fallback for any language

### Phase 2 Deliverables
- [x] 5+ platform integrations (OpenAI, Anthropic, LangChain, CrewAI, Webhooks)
- [x] Anomaly detection engine (v1) — 6 detection checks, behavior profiling
- [x] A2A communication policies — channels, rate limiting, wildcard matching
- [x] Agent interaction graph visualization — SVG graph in dashboard
- [ ] Go + Java SDKs (deferred to Phase 3)
- [ ] SOC 2 Type I certification started

---

## Phase 3: Enterprise & Scale (Months 7-12)
**Goal:** Enterprise-grade features, self-serve onboarding, go-to-market

### 3.1 Enterprise Features
- Multi-tenant architecture
- SSO/SAML support
- Custom policy templates per industry
- Role-based dashboard access (admin, auditor, viewer)
- SLA guarantees (<5ms policy evaluation, 99.99% uptime)
- On-premise / private cloud deployment option
- Air-gapped mode for regulated industries

### 3.2 Self-Serve Platform
- Free tier: up to 5 agents, 10K policy evaluations/month
- Pro tier: unlimited agents, advanced analytics, integrations
- Enterprise tier: custom deployment, SLAs, dedicated support
- Developer portal with interactive docs, playground, and code samples

### 3.3 Advanced Analytics
- Compliance reporting dashboards
- Agent risk heatmaps
- Cost attribution (which agents consume the most resources)
- Executive summary reports (auto-generated)

### 3.4 Go-to-Market
- Developer-first launch (Product Hunt, Hacker News, dev communities)
- Open-source core SDK (build community, drive adoption)
- Enterprise sales motion for Fortune 500
- Partner program with AI agent framework makers
- Content: blog posts, case studies, "State of AI Agent Security" report

### Phase 3 Deliverables
- [x] Multi-tenant architecture — tenant CRUD, user management, usage tracking, tenant_id scoping
- [x] Self-serve signup + billing (Stripe) — checkout sessions, billing portal, webhooks, graceful degradation
- [x] Free/Pro/Enterprise tier implementation — plan limits, usage bars, upgrade flow in dashboard
- [x] Go SDK — zero dependencies, generics, retry logic, 17 tests
- [x] Enterprise dashboard — Settings page (org/API keys/team), Billing page (plans/usage)
- [x] Role-based dashboard access (admin, auditor, viewer) — RBAC types + UI
- [x] SSO/SAML support — Phase 3.5: SAML 2.0, OIDC, SCIM 2.0, session management
- [ ] SOC 2 Type II certification
- [x] Developer portal with interactive docs
- [ ] On-premise / private cloud deployment
- [ ] Public launch

---

## Phase 3.5: SSO/SAML, OIDC & SCIM 2.0
**Goal:** Enterprise SSO integration — no security team will adopt an identity platform that doesn't integrate with their own IdP

### 3.5.1 SAML 2.0
- SP-initiated flow via `@node-saml/node-saml`
- Tenant-slug-based URLs (`/auth/saml/:tenantSlug/acs`)
- SP metadata XML generation
- JIT user provisioning from SAML assertions

### 3.5.2 OIDC
- Authorization Code Flow + PKCE via `openid-client`
- Discovery endpoint auto-configuration
- Encrypted cookie state for PKCE code verifier

### 3.5.3 SCIM 2.0
- RFC 7643/7644 compliant user/group sync
- Separate bearer token auth (SCIM tokens don't grant API access)
- User create/update/deactivate (soft delete)
- Group CRUD with role mapping

### 3.5.4 Session Management
- JWT sessions signed with server secret, stored in DB for revocation
- 8-hour default lifetime, configurable via `SSO_SESSION_TTL`
- Dual auth in middleware: API key OR SSO session token

### 3.5.5 Dashboard SSO Tab
- Provider selector (Okta, Azure AD, Google Workspace, OneLogin, Custom SAML/OIDC)
- Configuration forms for SAML and OIDC
- Connection test, enable/disable toggle, SSO enforcement (enterprise-only)
- SCIM token management and group-to-role mapping table

### Phase 3.5 Deliverables
- [x] 5 new DB tables (sso_connections, sso_sessions, scim_tokens, scim_groups, sso_audit_logs)
- [x] Crypto helpers (AES-256-GCM encryption, JWT sessions, token generation)
- [x] SSO service (connection CRUD, SAML/OIDC flows, session management, JIT provisioning, SCIM tokens)
- [x] SSO management API (connections, sessions, audit, SCIM tokens)
- [x] Public auth routes (SAML login/ACS/metadata, OIDC login/callback, session refresh/logout)
- [x] SCIM 2.0 endpoints (Users, Groups, discovery — RFC 7644 compliant)
- [x] Auth middleware updated for dual API key + SSO session auth
- [x] Dashboard SSO settings tab with provider config, SCIM management
- [x] 6 supported providers: Okta, Azure AD, Google Workspace, OneLogin, Custom SAML, Custom OIDC
- [x] Enterprise plan gate on SSO enforcement only

---

## Phase 4: Compliance Autopilot Integration (Months 12-18)
**Goal:** Expand AgentGate into universal compliance — Idea #3 on the roadmap

### 4.1 Vision
Leverage the audit trail, policy engine, and integrations already built in AgentGate to power a broader compliance automation product. AgentGate already monitors agent behavior — extending this to monitor *all* system activity for compliance is a natural evolution.

### 4.2 Compliance Engine
- Framework library: SOC 2, ISO 27001, HIPAA, GDPR, PCI DSS, EU AI Act
- Continuous control monitoring (not just periodic audits)
- Auto-evidence collection from connected systems
- Gap analysis: map current state → framework requirements
- Remediation recommendations (AI-generated)

### 4.3 Audit Readiness
- One-click audit report generation
- Evidence vault (immutable, timestamped)
- Auditor portal (read-only access for external auditors)
- Compliance score tracking over time

### 4.4 Regulatory Intelligence
- AI-powered regulation tracker (new laws, amendments, deadlines)
- Impact analysis: "This new regulation affects these 3 systems and 12 agents"
- Auto-update policies when regulations change

### Phase 4 Deliverables
- [x] Compliance engine — 6 frameworks (SOC 2, ISO 27001, HIPAA, GDPR, PCI DSS, EU AI Act) with 42 real controls
- [x] Control evaluation — live checks against AgentGate platform state (agents, policies, audit logs, anomaly detection, A2A channels)
- [x] Evidence collection API — manual + automatic evidence with immutable vault
- [x] One-click report generation — auto-generated compliance reports with findings
- [x] Gap analysis — assess current state vs. framework requirements
- [x] Score tracking — compliance score trend over time
- [x] Regulatory intelligence — regulatory update tracker with acknowledge workflow
- [x] 16 compliance API endpoints — CRUD for frameworks, controls, evidence, reports, gaps, updates
- [x] Dashboard compliance page — score rings, framework cards, controls table, trend chart, regulatory alerts
- [x] Landing page section — Compliance Autopilot with 6 framework cards, dashboard mockup, capabilities, $299/mo add-on pricing
- [x] AI-generated remediation recommendations — template-based per evaluator type, CRUD API, expandable fix panel in dashboard
- [x] Auditor portal (read-only access for external auditors)
- [x] Auto-update policies when regulations change — keyword matching, policy suggestion generation, approve/reject/apply workflow

### 4.5 Why This Works as Phase 4
- AgentGate's audit trail is already 80% of what compliance needs
- Same customers buying agent security also need compliance tooling
- Massive upsell opportunity within existing accounts
- Compliance is mandatory spend — recession-proof revenue
- Positions AgentGate as the "trust layer" for all enterprise AI

---

## Phase 5: Interactive Dashboard, CLI, Templates, Streaming (Month 18-20)
**Goal:** Production-ready dashboard + developer tools
**Status: COMPLETE**

- All dashboard buttons wired with real API calls + mock fallbacks
- WebSocket streaming: real-time notifications via ws-manager
- CLI tool (@agentgate/cli): 7 commands (init, status, agents, policies, authorize, audit, templates)
- Policy templates: 5 pre-built templates with deploy UI
- All 9 packages build clean, 76 tests passing

---

## Phase 6: Vanta-Competitive Features (Month 20-22)
**Goal:** Enterprise compliance parity with Vanta + AI-agent-specific differentiation
**Status: COMPLETE**

### 6.1 Framework Expansion (11 total, 73 controls)
- HITRUST CSF v11.3 (7 controls) — healthcare/enterprise certification
- CMMC 2.0 (7 controls) — DoD/defense contractor requirements
- NIS2 Directive (6 controls) — EU cybersecurity mandate
- DORA (6 controls) — EU financial sector resilience
- Cyber Essentials (5 controls) — UK baseline security

### 6.2 Trust Center
- Public-facing compliance page per tenant (no auth required)
- Configurable: select frameworks, custom branding, toggle scores/badges
- Public URL: `/api/v1/trust-center/:slug`
- Dashboard admin page for configuration

### 6.3 Questionnaire Automation
- Keyword-matching engine auto-answers security questionnaires
- Answers generated from live platform data (agent count, policies, compliance scores)
- Confidence scoring, supporting evidence, control references
- Export workflow for sales teams

### 6.4 Vanta Integration
- Push compliance evidence to Vanta via API
- Pull Vanta test results for unified visibility
- Encrypted API key storage (AES-256-CBC with scrypt key derivation)
- SSRF protection: baseUrl restricted to vanta.com domains

### 6.5 Third-Party Agent Risk Assessment
- Register vendor agents with capabilities, data access scopes
- Auto-assessment: risk scoring from compliance claims, data sensitivity, scope
- Risk levels (0-100) → recommendations (approve/conditional/reject)
- Assessment history with findings tracking

### 6.6 Security Audit (March 14, 2026)
- Tenant isolation fixes: all services scoped by tenantId
- Encryption hardened: require env var in production, scrypt key derivation
- Input validation: slug, logo URL, accent color, questionnaire limits
- SSRF protection on Vanta baseUrl
- Error messages sanitized — no credential leakage
- XSS prevention: HTTPS-only logo URLs, hex color validation

### Phase 6 Deliverables
- 5 new DB tables (31 total): trust_center_configs, questionnaire_responses, integration_configs, vendor_agents, vendor_agent_assessments
- 4 new API route files, 4 new services, 4 new dashboard pages
- VantaIntegration class in integrations package
- All 9 packages build clean, all tests passing

---

# Architecture Overview

```
                    ┌─────────────────────────┐
                    │     AgentGate Cloud      │
                    │  ┌───────────────────┐   │
                    │  │    Dashboard UI    │   │
                    │  └────────┬──────────┘   │
                    │           │               │
                    │  ┌────────▼──────────┐   │
                    │  │     REST API       │   │
                    │  │   (Management)     │   │
                    │  └────────┬──────────┘   │
                    │           │               │
  AI Agents ───────►  ┌────────▼──────────┐   │
  (via SDK)        │  │   Policy Engine    │◄──┤── Policy Store (Postgres)
                   │  │  (Rust/WASM)       │   │
                   │  └────────┬──────────┘   │
                   │           │               │
                   │  ┌────────▼──────────┐   │
                   │  │   Audit Logger     │   │
                   │  │  (Event Stream)    │   │
                   │  └────────┬──────────┘   │
                   │           │               │
                   │  ┌────────▼──────────┐   │
                   │  │ Anomaly Detection  │   │
                   │  │    (Phase 2)       │   │
                   │  └───────────────────┘   │
                   └─────────────────────────┘

  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ JS/TS SDK│  │Python SDK│  │  Go SDK  │
  └──────────┘  └──────────┘  └──────────┘
```

# Local Development — Apps & Ports

AgentGate is a **monorepo with 4 separate Next.js/Fastify apps**, each running on its own port. They are independent processes — navigating between them means navigating to a different `localhost` port in dev (in production they'd be different subdomains or paths behind a reverse proxy).

| App | Port | Package | Purpose | Start Command |
|-----|------|---------|---------|---------------|
| **API** | 3100 | `src/api` | Fastify REST API server, all backend logic | `npm run dev --workspace=@agentgate/api` |
| **Dashboard** | 3200 | `src/dashboard` | Admin dashboard (agents, policies, compliance, etc.) | `npm run dev --workspace=@agentgate/dashboard` |
| **Landing** | 3300 | `src/landing` | Marketing / public-facing website | `npm run dev --workspace=@agentgate/landing` |
| **Docs** | 3400 | `src/docs` | Developer documentation portal | `npm run dev --workspace=@agentgate/docs` |

### Key things to know
- **Each app is its own Next.js instance.** A `<Link href="/">` inside the docs app goes to the docs homepage, NOT the dashboard. To cross between apps in dev, you navigate to the other port (e.g. `http://localhost:3200`).
- **The Dashboard talks to the API** via `http://localhost:3100/api/v1/...`. When the API is not running, the dashboard falls back to mock data so the UI still renders.
- **The Auditor Portal** is a sub-route of the dashboard (`/auditor/*`), not a separate app. Auditors access it via the same port 3200.
- **In production**, all apps would sit behind a reverse proxy (e.g. Nginx, Cloudflare) with routing like:
  - `app.agentgate.io` → Dashboard
  - `api.agentgate.io` → API
  - `docs.agentgate.io` → Docs
  - `agentgate.io` → Landing
- **Database:** PostgreSQL on port 5432 (`postgresql://localhost:5432/agentgate`). Start with `brew services start postgresql@17`.

# Revenue Model

| Tier       | Price         | Includes                                          |
|------------|---------------|---------------------------------------------------|
| Free       | $0/mo         | 5 agents, 10K evals/mo, community support          |
| Pro        | $499/mo       | Unlimited agents, 1M evals/mo, integrations, email |
| Enterprise | Custom        | On-prem, SLA, SSO, dedicated CSM, custom policies  |
| Compliance | Add-on $299/mo| Phase 4 compliance autopilot module                |

# Target Customers
1. **Immediate (Phase 1-2):** AI-forward startups and mid-market companies using LangChain/CrewAI/AutoGen
2. **Growth (Phase 3):** Enterprise companies with 50+ AI agents in production
3. **Expansion (Phase 4):** Any regulated company (finance, healthcare, government)

# Competitive Landscape (March 2026)
- **No dominant player** in AI agent identity specifically
- Okta/Auth0 — focused on human identity, bolt-on agent support is weak
- Noma Security — agent access control but security-only, no identity layer
- Gravitee — API gateway with some agent monitoring, not identity-first
- **Our edge:** Purpose-built for agents as first-class identities, not retrofitted

# Key Metrics to Track
- Agents registered (total + monthly growth)
- Policy evaluations per second (performance)
- Mean time to detect anomaly (MTTD)
- SDK adoption (downloads, active integrations)
- Customer acquisition cost (CAC) vs. lifetime value (LTV)
- Net revenue retention (NRR) — target >130%

# Team (Ideal Early Hires)
1. **Founding Engineer — Backend/Infra** (Rust + Node.js, distributed systems)
2. **Founding Engineer — Full Stack** (Next.js + TypeScript, dashboard + SDK)
3. **Security Engineer** (IAM background, compliance knowledge)
4. **Developer Advocate** (SDK adoption, docs, community)

---

*Last updated: March 14, 2026*
*Status: Phase 6 complete — Vanta-Competitive Features (11 frameworks, Trust Center, Questionnaire Automation, Vanta Integration, Vendor Agent Risk)*
