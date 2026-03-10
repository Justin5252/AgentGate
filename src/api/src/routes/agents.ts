import type { FastifyInstance } from "fastify";
import { eq, and, sql, desc } from "drizzle-orm";
import { schema } from "../db/index.js";
import type {
  CreateAgentRequest,
  UpdateAgentRequest,
  AgentIdentity,
  ApiResponse,
  AgentStatus,
} from "@agentgate/shared";
import { ErrorCodes } from "@agentgate/shared";

function rowToAgent(row: typeof schema.agents.$inferSelect): AgentIdentity {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    ownerId: row.ownerId,
    status: row.status,
    riskLevel: row.riskLevel,
    capabilities: row.capabilities ?? [],
    metadata: row.metadata ?? {},
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
    lastActiveAt: row.lastActiveAt?.toISOString() ?? null,
  };
}

export async function agentRoutes(server: FastifyInstance) {
  // POST / — Create agent
  server.post("/", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const body = request.body as CreateAgentRequest;

      if (!body.name || !body.description || !body.ownerId) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: "Missing required fields: name, description, ownerId",
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(400).send(response);
      }

      const id = crypto.randomUUID();
      const now = new Date();

      const [inserted] = await server.db
        .insert(schema.agents)
        .values({
          id,
          name: body.name,
          description: body.description,
          ownerId: body.ownerId,
          status: "active",
          riskLevel: body.riskLevel ?? "medium",
          capabilities: body.capabilities ?? [],
          metadata: body.metadata ?? {},
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      const response: ApiResponse<AgentIdentity> = {
        data: rowToAgent(inserted),
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
          message: "Failed to create agent",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // GET / — List agents
  server.get("/", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const query = request.query as {
        status?: string;
        ownerId?: string;
        limit?: string;
        offset?: string;
      };

      const limit = Math.min(parseInt(query.limit || "50", 10), 200);
      const offset = parseInt(query.offset || "0", 10);

      const conditions = [];
      if (query.status) {
        conditions.push(eq(schema.agents.status, query.status as AgentStatus));
      }
      if (query.ownerId) {
        conditions.push(eq(schema.agents.ownerId, query.ownerId));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        server.db
          .select()
          .from(schema.agents)
          .where(whereClause)
          .orderBy(desc(schema.agents.createdAt))
          .limit(limit)
          .offset(offset),
        server.db
          .select({ count: sql<number>`count(*)::int` })
          .from(schema.agents)
          .where(whereClause),
      ]);

      const total = countResult[0]?.count ?? 0;

      const response: ApiResponse<AgentIdentity[]> = {
        data: rows.map(rowToAgent),
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
          message: "Failed to list agents",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // GET /:id — Get agent by ID
  server.get("/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { id } = request.params as { id: string };

      const [row] = await server.db
        .select()
        .from(schema.agents)
        .where(eq(schema.agents.id, id))
        .limit(1);

      if (!row) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.AGENT_NOT_FOUND,
            message: `Agent ${id} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      const response: ApiResponse<AgentIdentity> = {
        data: rowToAgent(row),
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
          message: "Failed to get agent",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // PATCH /:id — Update agent
  server.patch("/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { id } = request.params as { id: string };
      const body = request.body as UpdateAgentRequest;

      // Check agent exists
      const [existing] = await server.db
        .select()
        .from(schema.agents)
        .where(eq(schema.agents.id, id))
        .limit(1);

      if (!existing) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.AGENT_NOT_FOUND,
            message: `Agent ${id} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      const updateValues: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (body.name !== undefined) updateValues.name = body.name;
      if (body.description !== undefined)
        updateValues.description = body.description;
      if (body.status !== undefined) updateValues.status = body.status;
      if (body.riskLevel !== undefined) updateValues.riskLevel = body.riskLevel;
      if (body.capabilities !== undefined)
        updateValues.capabilities = body.capabilities;
      if (body.metadata !== undefined) updateValues.metadata = body.metadata;

      const [updated] = await server.db
        .update(schema.agents)
        .set(updateValues)
        .where(eq(schema.agents.id, id))
        .returning();

      const response: ApiResponse<AgentIdentity> = {
        data: rowToAgent(updated),
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
          message: "Failed to update agent",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // DELETE /:id — Soft delete (set status to "revoked")
  server.delete("/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { id } = request.params as { id: string };

      const [existing] = await server.db
        .select()
        .from(schema.agents)
        .where(eq(schema.agents.id, id))
        .limit(1);

      if (!existing) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.AGENT_NOT_FOUND,
            message: `Agent ${id} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      await server.db
        .update(schema.agents)
        .set({ status: "revoked", updatedAt: new Date() })
        .where(eq(schema.agents.id, id));

      const response: ApiResponse<{ revoked: true }> = {
        data: { revoked: true },
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
          message: "Failed to delete agent",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });
}
