import type { FastifyInstance } from "fastify";
import { eq, sql, desc } from "drizzle-orm";
import { schema } from "../db/index.js";
import type {
  CreatePolicyRequest,
  UpdatePolicyRequest,
  Policy,
  PolicyRule,
  ApiResponse,
} from "@agentgate/shared";
import { ErrorCodes } from "@agentgate/shared";

function rowToPolicy(row: typeof schema.policies.$inferSelect): Policy {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    version: row.version,
    rules: row.rules,
    targets: row.targets,
    enabled: row.enabled,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

export async function policyRoutes(server: FastifyInstance) {
  // POST / — Create policy
  server.post("/", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const body = request.body as CreatePolicyRequest;

      if (!body.name || !body.description || !body.rules || !body.targets) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message:
              "Missing required fields: name, description, rules, targets",
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(400).send(response);
      }

      const id = crypto.randomUUID();
      const now = new Date();

      // Generate IDs for each rule
      const rulesWithIds: PolicyRule[] = body.rules.map((rule) => ({
        ...rule,
        id: crypto.randomUUID(),
      }));

      const [inserted] = await server.db
        .insert(schema.policies)
        .values({
          id,
          name: body.name,
          description: body.description,
          version: 1,
          rules: rulesWithIds,
          targets: body.targets,
          enabled: body.enabled ?? true,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      const response: ApiResponse<Policy> = {
        data: rowToPolicy(inserted),
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(201).send(response);
    } catch (err) {
      server.log.error(err);
      const response: ApiResponse<null> = {
        data: null,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: "Failed to create policy",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // GET / — List policies
  server.get("/", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const query = request.query as {
        enabled?: string;
        limit?: string;
        offset?: string;
      };

      const limit = Math.min(parseInt(query.limit || "50", 10), 200);
      const offset = parseInt(query.offset || "0", 10);

      const whereClause =
        query.enabled !== undefined
          ? eq(schema.policies.enabled, query.enabled === "true")
          : undefined;

      const [rows, countResult] = await Promise.all([
        server.db
          .select()
          .from(schema.policies)
          .where(whereClause)
          .orderBy(desc(schema.policies.createdAt))
          .limit(limit)
          .offset(offset),
        server.db
          .select({ count: sql<number>`count(*)::int` })
          .from(schema.policies)
          .where(whereClause),
      ]);

      const total = countResult[0]?.count ?? 0;

      const response: ApiResponse<Policy[]> = {
        data: rows.map(rowToPolicy),
        error: null,
        meta: {
          total,
          limit,
          offset,
          requestId,
          durationMs: performance.now() - start,
        },
      };
      return reply.send(response);
    } catch (err) {
      server.log.error(err);
      const response: ApiResponse<null> = {
        data: null,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: "Failed to list policies",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // GET /:id — Get policy by ID
  server.get("/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { id } = request.params as { id: string };

      const [row] = await server.db
        .select()
        .from(schema.policies)
        .where(eq(schema.policies.id, id))
        .limit(1);

      if (!row) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.POLICY_NOT_FOUND,
            message: `Policy ${id} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      const response: ApiResponse<Policy> = {
        data: rowToPolicy(row),
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
          message: "Failed to get policy",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // PATCH /:id — Update policy
  server.patch("/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { id } = request.params as { id: string };
      const body = request.body as UpdatePolicyRequest;

      const [existing] = await server.db
        .select()
        .from(schema.policies)
        .where(eq(schema.policies.id, id))
        .limit(1);

      if (!existing) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.POLICY_NOT_FOUND,
            message: `Policy ${id} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      const updateValues: Record<string, unknown> = {
        updatedAt: new Date(),
        version: existing.version + 1,
      };
      if (body.name !== undefined) updateValues.name = body.name;
      if (body.description !== undefined)
        updateValues.description = body.description;
      if (body.enabled !== undefined) updateValues.enabled = body.enabled;
      if (body.targets !== undefined) updateValues.targets = body.targets;
      if (body.rules !== undefined) {
        // Generate IDs for new rules
        const rulesWithIds: PolicyRule[] = body.rules.map((rule) => ({
          ...rule,
          id: crypto.randomUUID(),
        }));
        updateValues.rules = rulesWithIds;
      }

      const [updated] = await server.db
        .update(schema.policies)
        .set(updateValues)
        .where(eq(schema.policies.id, id))
        .returning();

      const response: ApiResponse<Policy> = {
        data: rowToPolicy(updated),
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
          message: "Failed to update policy",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // DELETE /:id — Hard delete
  server.delete("/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { id } = request.params as { id: string };

      const [existing] = await server.db
        .select()
        .from(schema.policies)
        .where(eq(schema.policies.id, id))
        .limit(1);

      if (!existing) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.POLICY_NOT_FOUND,
            message: `Policy ${id} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      await server.db
        .delete(schema.policies)
        .where(eq(schema.policies.id, id));

      const response: ApiResponse<{ deleted: true }> = {
        data: { deleted: true },
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
          message: "Failed to delete policy",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });
}
