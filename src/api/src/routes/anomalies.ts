import type { FastifyInstance } from "fastify";
import { eq, and, sql, desc, gte } from "drizzle-orm";
import { schema } from "../db/index.js";
import type {
  Anomaly,
  AnomalyType,
  AnomalySeverity,
  AgentBehaviorProfile,
  ApiResponse,
} from "@agentgate/shared";
import { ErrorCodes } from "@agentgate/shared";

function rowToAnomaly(
  row: typeof schema.anomalies.$inferSelect,
): Anomaly {
  return {
    id: row.id,
    agentId: row.agentId,
    type: row.type,
    severity: row.severity,
    description: row.description,
    details: row.details ?? {},
    detectedAt: row.detectedAt?.toISOString() ?? new Date().toISOString(),
    resolved: row.resolved,
  };
}

interface AnomalyStats {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  topAgents: Array<{ agentId: string; count: number }>;
}

export async function anomalyRoutes(server: FastifyInstance) {
  // GET / — List anomalies
  server.get("/", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const query = request.query as {
        agentId?: string;
        type?: string;
        severity?: string;
        resolved?: string;
        limit?: string;
        offset?: string;
      };

      const limit = Math.min(parseInt(query.limit || "100", 10), 1000);
      const offset = parseInt(query.offset || "0", 10);

      const conditions = [];
      if (query.agentId) {
        conditions.push(eq(schema.anomalies.agentId, query.agentId));
      }
      if (query.type) {
        conditions.push(
          eq(schema.anomalies.type, query.type as AnomalyType),
        );
      }
      if (query.severity) {
        conditions.push(
          eq(schema.anomalies.severity, query.severity as AnomalySeverity),
        );
      }
      if (query.resolved !== undefined) {
        conditions.push(
          eq(schema.anomalies.resolved, query.resolved === "true"),
        );
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        server.db
          .select()
          .from(schema.anomalies)
          .where(whereClause)
          .orderBy(desc(schema.anomalies.detectedAt))
          .limit(limit)
          .offset(offset),
        server.db
          .select({ count: sql<number>`count(*)::int` })
          .from(schema.anomalies)
          .where(whereClause),
      ]);

      const total = countResult[0]?.count ?? 0;

      const response: ApiResponse<Anomaly[]> = {
        data: rows.map(rowToAnomaly),
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
          message: "Failed to query anomalies",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // GET /stats — Anomaly statistics
  server.get("/stats", async (_request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [totalResult, typeCounts, severityCounts, topAgentsResult] =
        await Promise.all([
          server.db
            .select({ count: sql<number>`count(*)::int` })
            .from(schema.anomalies),
          server.db
            .select({
              type: schema.anomalies.type,
              count: sql<number>`count(*)::int`,
            })
            .from(schema.anomalies)
            .groupBy(schema.anomalies.type),
          server.db
            .select({
              severity: schema.anomalies.severity,
              count: sql<number>`count(*)::int`,
            })
            .from(schema.anomalies)
            .groupBy(schema.anomalies.severity),
          server.db
            .select({
              agentId: schema.anomalies.agentId,
              count: sql<number>`count(*)::int`,
            })
            .from(schema.anomalies)
            .where(gte(schema.anomalies.detectedAt, twentyFourHoursAgo))
            .groupBy(schema.anomalies.agentId)
            .orderBy(desc(sql`count(*)`))
            .limit(10),
        ]);

      const byType: Record<string, number> = {};
      for (const row of typeCounts) {
        byType[row.type] = row.count;
      }

      const bySeverity: Record<string, number> = {};
      for (const row of severityCounts) {
        bySeverity[row.severity] = row.count;
      }

      const stats: AnomalyStats = {
        total: totalResult[0]?.count ?? 0,
        byType,
        bySeverity,
        topAgents: topAgentsResult.map((r) => ({
          agentId: r.agentId,
          count: r.count,
        })),
      };

      const response: ApiResponse<AnomalyStats> = {
        data: stats,
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
          message: "Failed to get anomaly statistics",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // PATCH /:id/resolve — Mark anomaly as resolved
  server.patch("/:id/resolve", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { id } = request.params as { id: string };

      const [existing] = await server.db
        .select()
        .from(schema.anomalies)
        .where(eq(schema.anomalies.id, id))
        .limit(1);

      if (!existing) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: `Anomaly ${id} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      const [updated] = await server.db
        .update(schema.anomalies)
        .set({ resolved: true })
        .where(eq(schema.anomalies.id, id))
        .returning();

      const response: ApiResponse<Anomaly> = {
        data: rowToAnomaly(updated),
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
          message: "Failed to resolve anomaly",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // POST /profile/:agentId/rebuild — Trigger profile rebuild for an agent
  server.post("/profile/:agentId/rebuild", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { agentId } = request.params as { agentId: string };

      // Verify agent exists
      const [agent] = await server.db
        .select()
        .from(schema.agents)
        .where(eq(schema.agents.id, agentId))
        .limit(1);

      if (!agent) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.AGENT_NOT_FOUND,
            message: `Agent ${agentId} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      await server.anomalyDetector.updateProfile(agentId);

      const profile = await server.anomalyDetector.getProfile(agentId);

      const response: ApiResponse<AgentBehaviorProfile | null> = {
        data: profile,
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
          message: "Failed to rebuild agent profile",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });
}
