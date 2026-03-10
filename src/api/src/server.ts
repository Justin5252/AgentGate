import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { createDb } from "./db/index.js";
import { PolicyEvaluator } from "@agentgate/engine";
import { agentRoutes } from "./routes/agents.js";
import { policyRoutes } from "./routes/policies.js";
import { authorizeRoutes } from "./routes/authorize.js";
import { auditRoutes } from "./routes/audit.js";
import { healthRoutes } from "./routes/health.js";
import { apiKeyRoutes } from "./routes/api-keys.js";
import { a2aRoutes } from "./routes/a2a.js";
import { anomalyRoutes } from "./routes/anomalies.js";
import { authMiddleware } from "./middleware/auth.js";
import { AnomalyDetector } from "./services/anomaly-detector.js";
import type { Database } from "./db/index.js";

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
    evaluator: PolicyEvaluator;
    anomalyDetector: AnomalyDetector;
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
  await server.register(cors, { origin: true });
  await server.register(rateLimit, { max: 100, timeWindow: "1 minute" });

  // Database & engine
  const { db } = createDb(options.databaseUrl);
  const evaluator = new PolicyEvaluator();

  const anomalyDetector = new AnomalyDetector(db);

  server.decorate("db", db);
  server.decorate("evaluator", evaluator);
  server.decorate("anomalyDetector", anomalyDetector);

  // Register auth middleware (must come before routes)
  await server.register(authMiddleware);

  // Root route
  server.get("/", async () => ({
    name: "AgentGate API",
    version: "0.1.0",
    description: "AI Agent Identity & Permissions Platform",
    docs: "/api/v1",
    health: "/health",
    endpoints: {
      agents: "/api/v1/agents",
      policies: "/api/v1/policies",
      authorize: "/api/v1/authorize",
      audit: "/api/v1/audit",
      anomalies: "/api/v1/anomalies",
      a2a: "/api/v1/a2a",
      keys: "/api/v1/keys",
    },
  }));

  // Register routes
  await server.register(healthRoutes);
  await server.register(apiKeyRoutes, { prefix: "/api/v1/keys" });
  await server.register(agentRoutes, { prefix: "/api/v1/agents" });
  await server.register(policyRoutes, { prefix: "/api/v1/policies" });
  await server.register(authorizeRoutes, { prefix: "/api/v1" });
  await server.register(auditRoutes, { prefix: "/api/v1/audit" });
  await server.register(a2aRoutes, { prefix: "/api/v1/a2a" });
  await server.register(anomalyRoutes, { prefix: "/api/v1/anomalies" });

  return server;
}
