import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import cookie from "@fastify/cookie";
import formbody from "@fastify/formbody";
import { createDb } from "./db/index.js";
import { PolicyEvaluator } from "@agentgate/engine";
import { agentRoutes } from "./routes/agents.js";
import { policyRoutes } from "./routes/policies.js";
import { authorizeRoutes } from "./routes/authorize.js";
import { auditRoutes } from "./routes/audit.js";
import { healthRoutes } from "./routes/health.js";
import { apiKeyRoutes } from "./routes/api-keys.js";
import { a2aRoutes } from "./routes/a2a.js";
import { complianceRoutes } from "./routes/compliance.js";
import { anomalyRoutes } from "./routes/anomalies.js";
import { billingRoutes } from "./routes/billing.js";
import { tenantRoutes } from "./routes/tenants.js";
import { ssoRoutes } from "./routes/sso.js";
import { authRoutes } from "./routes/auth.js";
import { scimRoutes } from "./routes/scim.js";
import { authMiddleware } from "./middleware/auth.js";
import { AnomalyDetector } from "./services/anomaly-detector.js";
import { BillingService } from "./services/billing.js";
import { UsageTracker } from "./services/usage-tracker.js";
import { ComplianceService } from "./services/compliance.js";
import { SSOService } from "./services/sso.js";
import type { Database } from "./db/index.js";

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
    evaluator: PolicyEvaluator;
    anomalyDetector: AnomalyDetector;
    billingService: BillingService;
    usageTracker: UsageTracker;
    complianceService: ComplianceService;
    ssoService: SSOService;
  }
}

export interface BuildServerOptions {
  databaseUrl: string;
}

export async function buildServer(options: BuildServerOptions) {
  const server = Fastify({
    logger: {
      transport: {
        target: "pino-pretty",
        options: { translateTime: "HH:MM:ss Z", ignore: "pid,hostname" },
      },
    },
  });

  // Register plugins
  await server.register(cors, {
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:3200", "http://localhost:3300", "http://localhost:3400"],
    credentials: true,
  });
  await server.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    // Stricter limits for sensitive endpoints
    keyGenerator: (request) => {
      return request.ip;
    },
  });
  await server.register(cookie, {
    secret: process.env.COOKIE_SECRET ?? "dev-cookie-secret",
  });
  await server.register(formbody);

  // Database & engine
  const { db } = createDb(options.databaseUrl);
  const evaluator = new PolicyEvaluator();

  const anomalyDetector = new AnomalyDetector(db);
  const billingService = new BillingService(db);
  const usageTracker = new UsageTracker(db);
  const complianceService = new ComplianceService(db);
  const ssoService = new SSOService(db);

  server.decorate("db", db);
  server.decorate("evaluator", evaluator);
  server.decorate("anomalyDetector", anomalyDetector);
  server.decorate("billingService", billingService);
  server.decorate("usageTracker", usageTracker);
  server.decorate("complianceService", complianceService);
  server.decorate("ssoService", ssoService);

  // Register auth middleware (must come before routes)
  await server.register(authMiddleware);

  // Root route — styled HTML for browsers, JSON for API clients
  server.get("/", async (request, reply) => {
    const accept = request.headers.accept || "";
    if (accept.includes("text/html")) {
      reply.type("text/html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AgentGate API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #050A15; color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .container { max-width: 640px; width: 100%; padding: 2rem; }
    .logo { display: flex; align-items: center; gap: 12px; margin-bottom: 2rem; }
    .logo-icon { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #3B82F6, #06D6A0); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; }
    h1 { font-size: 1.5rem; font-weight: 700; }
    .badge { display: inline-block; background: rgba(6,214,160,0.1); border: 1px solid rgba(6,214,160,0.3); color: #06D6A0; padding: 2px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; margin-left: 8px; }
    .desc { color: #94A3B8; margin-bottom: 2rem; font-size: 0.95rem; line-height: 1.6; }
    .section-title { color: #64748B; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem; }
    .endpoints { background: #080D1B; border: 1px solid #1E293B; border-radius: 12px; overflow: hidden; margin-bottom: 1.5rem; }
    .endpoint { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #1E293B; transition: background 0.15s; }
    .endpoint:last-child { border-bottom: none; }
    .endpoint:hover { background: #0C1224; }
    .endpoint-name { font-weight: 600; font-size: 0.9rem; }
    .endpoint-path { color: #3B82F6; font-family: "SF Mono", "Fira Code", Menlo, monospace; font-size: 0.8rem; }
    .endpoint a { color: #3B82F6; text-decoration: none; }
    .endpoint a:hover { text-decoration: underline; }
    .method { display: inline-block; background: rgba(59,130,246,0.15); color: #3B82F6; padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 700; font-family: monospace; margin-right: 6px; }
    .method.post { background: rgba(6,214,160,0.15); color: #06D6A0; }
    .status { display: flex; align-items: center; gap: 8px; color: #94A3B8; font-size: 0.8rem; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #06D6A0; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .footer { color: #64748B; font-size: 0.75rem; text-align: center; margin-top: 2rem; }
    .footer a { color: #3B82F6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <div class="logo-icon">AG</div>
      <div>
        <h1>AgentGate API <span class="badge">v0.1.0</span></h1>
      </div>
    </div>
    <p class="desc">The identity and access control layer for AI agents. Register agents, define policies, authorize actions, and monitor everything.</p>

    <div class="status"><div class="status-dot"></div> API is operational</div>

    <br />
    <div class="section-title">Core Endpoints</div>
    <div class="endpoints">
      <div class="endpoint">
        <span class="endpoint-name"><span class="method">GET</span> Agents</span>
        <span class="endpoint-path"><a href="/api/v1/agents">/api/v1/agents</a></span>
      </div>
      <div class="endpoint">
        <span class="endpoint-name"><span class="method">GET</span> Policies</span>
        <span class="endpoint-path"><a href="/api/v1/policies">/api/v1/policies</a></span>
      </div>
      <div class="endpoint">
        <span class="endpoint-name"><span class="method post">POST</span> Authorize</span>
        <span class="endpoint-path">/api/v1/authorize</span>
      </div>
      <div class="endpoint">
        <span class="endpoint-name"><span class="method">GET</span> Audit Log</span>
        <span class="endpoint-path"><a href="/api/v1/audit">/api/v1/audit</a></span>
      </div>
    </div>

    <div class="section-title">Intelligence</div>
    <div class="endpoints">
      <div class="endpoint">
        <span class="endpoint-name"><span class="method">GET</span> Anomalies</span>
        <span class="endpoint-path"><a href="/api/v1/anomalies">/api/v1/anomalies</a></span>
      </div>
      <div class="endpoint">
        <span class="endpoint-name"><span class="method">GET</span> A2A Channels</span>
        <span class="endpoint-path"><a href="/api/v1/a2a/channels">/api/v1/a2a/channels</a></span>
      </div>
      <div class="endpoint">
        <span class="endpoint-name"><span class="method">GET</span> A2A Graph</span>
        <span class="endpoint-path"><a href="/api/v1/a2a/graph">/api/v1/a2a/graph</a></span>
      </div>
    </div>

    <div class="section-title">Compliance</div>
    <div class="endpoints">
      <div class="endpoint">
        <span class="endpoint-name"><span class="method">GET</span> Frameworks</span>
        <span class="endpoint-path"><a href="/api/v1/compliance">/api/v1/compliance</a></span>
      </div>
      <div class="endpoint">
        <span class="endpoint-name"><span class="method">GET</span> Regulatory Updates</span>
        <span class="endpoint-path"><a href="/api/v1/compliance/regulatory-updates">/api/v1/compliance/regulatory-updates</a></span>
      </div>
    </div>

    <div class="section-title">SSO & Identity</div>
    <div class="endpoints">
      <div class="endpoint">
        <span class="endpoint-name"><span class="method">GET</span> SSO Connections</span>
        <span class="endpoint-path"><a href="/api/v1/sso/connections">/api/v1/sso/connections</a></span>
      </div>
      <div class="endpoint">
        <span class="endpoint-name"><span class="method">GET</span> SSO Sessions</span>
        <span class="endpoint-path"><a href="/api/v1/sso/sessions">/api/v1/sso/sessions</a></span>
      </div>
      <div class="endpoint">
        <span class="endpoint-name"><span class="method">GET</span> SSO Audit Log</span>
        <span class="endpoint-path"><a href="/api/v1/sso/audit">/api/v1/sso/audit</a></span>
      </div>
      <div class="endpoint">
        <span class="endpoint-name"><span class="method">GET</span> SCIM Tokens</span>
        <span class="endpoint-path"><a href="/api/v1/sso/scim-tokens">/api/v1/sso/scim-tokens</a></span>
      </div>
    </div>

    <div class="section-title">Management</div>
    <div class="endpoints">
      <div class="endpoint">
        <span class="endpoint-name"><span class="method">GET</span> API Keys</span>
        <span class="endpoint-path"><a href="/api/v1/keys">/api/v1/keys</a></span>
      </div>
      <div class="endpoint">
        <span class="endpoint-name"><span class="method">GET</span> Health</span>
        <span class="endpoint-path"><a href="/health">/health</a></span>
      </div>
    </div>

    <div class="footer">
      <a href="http://localhost:3200">Open Dashboard</a> &middot; <a href="http://localhost:3300">Landing Page</a>
    </div>
  </div>
</body>
</html>`);
      return;
    }
    return {
      name: "AgentGate API",
      version: "0.1.0",
      description: "AI Agent Identity & Permissions Platform",
      health: "/health",
      endpoints: {
        agents: "/api/v1/agents",
        policies: "/api/v1/policies",
        authorize: "/api/v1/authorize",
        audit: "/api/v1/audit",
        anomalies: "/api/v1/anomalies",
        a2a: "/api/v1/a2a",
        keys: "/api/v1/keys",
        tenants: "/api/v1/tenants",
        compliance: "/api/v1/compliance",
        sso: "/api/v1/sso",
        auth: "/api/v1/auth",
        scim: "/api/v1/scim/:tenantSlug",
      },
    };
  });

  // Register routes
  await server.register(healthRoutes);
  await server.register(apiKeyRoutes, { prefix: "/api/v1/keys" });
  await server.register(agentRoutes, { prefix: "/api/v1/agents" });
  await server.register(policyRoutes, { prefix: "/api/v1/policies" });
  await server.register(authorizeRoutes, { prefix: "/api/v1" });
  await server.register(auditRoutes, { prefix: "/api/v1/audit" });
  await server.register(a2aRoutes, { prefix: "/api/v1/a2a" });
  await server.register(anomalyRoutes, { prefix: "/api/v1/anomalies" });
  await server.register(billingRoutes, { prefix: "/api/v1/billing" });
  await server.register(tenantRoutes, { prefix: "/api/v1/tenants" });
  await server.register(complianceRoutes, { prefix: "/api/v1/compliance" });
  await server.register(ssoRoutes, { prefix: "/api/v1/sso" });
  await server.register(authRoutes, { prefix: "/api/v1/auth" });
  await server.register(scimRoutes, { prefix: "/api/v1/scim/:tenantSlug" });

  return server;
}
