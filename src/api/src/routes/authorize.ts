import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { schema } from "../db/index.js";
import type {
  AuthorizationRequest,
  AuthorizationDecision,
  Policy,
  ApiResponse,
} from "@agentgate/shared";
import { ErrorCodes } from "@agentgate/shared";

export async function authorizeRoutes(server: FastifyInstance) {
  // POST /authorize — Evaluate an authorization request
  server.post("/authorize", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const body = request.body as AuthorizationRequest;

      if (!body.agentId || !body.action || !body.resource) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: "Missing required fields: agentId, action, resource",
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(400).send(response);
      }

      // Validate the agent exists and is active
      const [agent] = await server.db
        .select()
        .from(schema.agents)
        .where(eq(schema.agents.id, body.agentId))
        .limit(1);

      if (!agent) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.AGENT_NOT_FOUND,
            message: `Agent ${body.agentId} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      if (agent.status === "suspended") {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.AGENT_SUSPENDED,
            message: `Agent ${body.agentId} is suspended`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(403).send(response);
      }

      if (agent.status === "revoked") {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.AGENT_REVOKED,
            message: `Agent ${body.agentId} is revoked`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(403).send(response);
      }

      // Fetch all enabled policies
      const policyRows = await server.db
        .select()
        .from(schema.policies)
        .where(eq(schema.policies.enabled, true));

      // Map DB rows to Policy objects
      const policiesForEval: Policy[] = policyRows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        version: row.version,
        rules: row.rules,
        targets: row.targets,
        enabled: row.enabled,
        createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
        updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
      }));

      // Evaluate
      const evalStart = performance.now();
      const decision = server.evaluator.evaluate(body, policiesForEval);
      const evalDurationMs = performance.now() - evalStart;

      // Update the decision's durationMs to reflect only engine evaluation time
      const finalDecision: AuthorizationDecision = {
        ...decision,
        durationMs: evalDurationMs,
      };

      // Log to audit_logs (fire-and-forget for speed, but await to ensure consistency)
      await server.db.insert(schema.auditLogs).values({
        id: crypto.randomUUID(),
        agentId: body.agentId,
        action: body.action,
        resource: body.resource,
        decision: finalDecision.decision,
        policyId: finalDecision.policyId,
        ruleId: finalDecision.ruleId,
        context: body.context ?? {},
        durationMs: evalDurationMs,
        timestamp: new Date(),
      });

      // Update agent's last active timestamp (fire-and-forget)
      server.db
        .update(schema.agents)
        .set({ lastActiveAt: new Date() })
        .where(eq(schema.agents.id, body.agentId))
        .then(() => {})
        .catch((err) => server.log.error(err, "Failed to update lastActiveAt"));

      const response: ApiResponse<AuthorizationDecision> = {
        data: finalDecision,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.send(response);
    } catch (err) {
      server.log.error(err);
      const response: ApiResponse<null> = {
        data: null,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: "Authorization evaluation failed",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });
}
