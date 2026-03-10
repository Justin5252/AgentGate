import type { FastifyInstance } from "fastify";
import { eq, and, sql, desc, gte, lte } from "drizzle-orm";
import { schema } from "../db/index.js";
import type {
  AuditEntry,
  ApiResponse,
  PolicyEffect,
} from "@agentgate/shared";
import { ErrorCodes } from "@agentgate/shared";

function rowToAuditEntry(
  row: typeof schema.auditLogs.$inferSelect,
): AuditEntry {
  return {
    id: row.id,
    agentId: row.agentId,
    action: row.action,
    resource: row.resource,
    decision: row.decision,
    policyId: row.policyId,
    context: row.context ?? {},
    timestamp: row.timestamp?.toISOString() ?? new Date().toISOString(),
    durationMs: row.durationMs,
  };
}

interface AuditStats {
  totalDecisions: number;
  allowCount: number;
  denyCount: number;
  escalateCount: number;
  topAgents: Array<{ agentId: string; count: number }>;
}

export async function auditRoutes(server: FastifyInstance) {
  // GET / — Query audit logs
  server.get("/", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const query = request.query as {
        agentId?: string;
        action?: string;
        resource?: string;
        decision?: string;
        startTime?: string;
        endTime?: string;
        limit?: string;
        offset?: string;
      };

      const limit = Math.min(parseInt(query.limit || "100", 10), 1000);
      const offset = parseInt(query.offset || "0", 10);

      const conditions = [];
      if (query.agentId) {
        conditions.push(eq(schema.auditLogs.agentId, query.agentId));
      }
      if (query.action) {
        conditions.push(eq(schema.auditLogs.action, query.action));
      }
      if (query.resource) {
        conditions.push(eq(schema.auditLogs.resource, query.resource));
      }
      if (query.decision) {
        conditions.push(
          eq(schema.auditLogs.decision, query.decision as PolicyEffect),
        );
      }
      if (query.startTime) {
        conditions.push(
          gte(schema.auditLogs.timestamp, new Date(query.startTime)),
        );
      }
      if (query.endTime) {
        conditions.push(
          lte(schema.auditLogs.timestamp, new Date(query.endTime)),
        );
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        server.db
          .select()
          .from(schema.auditLogs)
          .where(whereClause)
          .orderBy(desc(schema.auditLogs.timestamp))
          .limit(limit)
          .offset(offset),
        server.db
          .select({ count: sql<number>`count(*)::int` })
          .from(schema.auditLogs)
          .where(whereClause),
      ]);

      const total = countResult[0]?.count ?? 0;

      const response: ApiResponse<AuditEntry[]> = {
        data: rows.map(rowToAuditEntry),
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
          message: "Failed to query audit logs",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // GET /stats — Get audit statistics
  server.get("/stats", async (_request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [decisionCounts, topAgentsResult] = await Promise.all([
        server.db
          .select({
            decision: schema.auditLogs.decision,
            count: sql<number>`count(*)::int`,
          })
          .from(schema.auditLogs)
          .where(gte(schema.auditLogs.timestamp, twentyFourHoursAgo))
          .groupBy(schema.auditLogs.decision),
        server.db
          .select({
            agentId: schema.auditLogs.agentId,
            count: sql<number>`count(*)::int`,
          })
          .from(schema.auditLogs)
          .where(gte(schema.auditLogs.timestamp, twentyFourHoursAgo))
          .groupBy(schema.auditLogs.agentId)
          .orderBy(desc(sql`count(*)`))
          .limit(10),
      ]);

      let totalDecisions = 0;
      let allowCount = 0;
      let denyCount = 0;
      let escalateCount = 0;

      for (const row of decisionCounts) {
        totalDecisions += row.count;
        if (row.decision === "allow") allowCount = row.count;
        if (row.decision === "deny") denyCount = row.count;
        if (row.decision === "escalate") escalateCount = row.count;
      }

      const stats: AuditStats = {
        totalDecisions,
        allowCount,
        denyCount,
        escalateCount,
        topAgents: topAgentsResult.map((r) => ({
          agentId: r.agentId,
          count: r.count,
        })),
      };

      const response: ApiResponse<AuditStats> = {
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
          message: "Failed to get audit statistics",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });
}
