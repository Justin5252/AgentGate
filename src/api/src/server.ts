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
import type { Database } from "./db/index.js";

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
    evaluator: PolicyEvaluator;
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

  server.decorate("db", db);
  server.decorate("evaluator", evaluator);

  // Register routes
  await server.register(healthRoutes);
  await server.register(agentRoutes, { prefix: "/api/v1/agents" });
  await server.register(policyRoutes, { prefix: "/api/v1/policies" });
  await server.register(authorizeRoutes, { prefix: "/api/v1" });
  await server.register(auditRoutes, { prefix: "/api/v1/audit" });

  return server;
}
