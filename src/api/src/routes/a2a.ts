import type { FastifyInstance } from "fastify";
import { eq, and, sql, desc, gte, lte } from "drizzle-orm";
import { schema } from "../db/index.js";
import { globMatch } from "@agentgate/engine";
import type {
  A2AChannel,
  A2ACommunication,
  A2AGraph,
  A2AGraphNode,
  A2AGraphEdge,
  CreateA2AChannelRequest,
  ApiResponse,
  PolicyEffect,
} from "@agentgate/shared";
import { ErrorCodes } from "@agentgate/shared";

function rowToChannel(
  row: typeof schema.a2aChannels.$inferSelect,
): A2AChannel {
  return {
    id: row.id,
    sourceAgentId: row.sourceAgentId,
    targetAgentId: row.targetAgentId,
    allowedActions: row.allowedActions ?? ["*"],
    allowedDataTypes: row.allowedDataTypes ?? ["*"],
    maxRequestsPerMinute: row.maxRequestsPerMinute,
    enabled: row.enabled,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

function rowToCommunication(
  row: typeof schema.a2aCommunications.$inferSelect,
): A2ACommunication {
  return {
    id: row.id,
    channelId: row.channelId ?? "",
    sourceAgentId: row.sourceAgentId,
    targetAgentId: row.targetAgentId,
    action: row.action,
    dataType: row.dataType,
    decision: row.decision,
    timestamp: row.timestamp?.toISOString() ?? new Date().toISOString(),
    durationMs: row.durationMs,
  };
}

/**
 * Check if a value matches any pattern in a list (supports "*" wildcards).
 */
function matchesAny(patterns: string[], value: string): boolean {
  return patterns.some((pattern) => globMatch(pattern, value));
}

export async function a2aRoutes(server: FastifyInstance) {
  // ── Channel Management ──────────────────────────────────────────

  // POST /channels — Create A2A channel
  server.post("/channels", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const body = request.body as CreateA2AChannelRequest;

      if (!body.sourceAgentId || !body.targetAgentId) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message:
              "Missing required fields: sourceAgentId, targetAgentId",
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(400).send(response);
      }

      if (body.sourceAgentId === body.targetAgentId) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: "sourceAgentId and targetAgentId must be different",
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(400).send(response);
      }

      // Validate both agents exist
      const [sourceAgent, targetAgent] = await Promise.all([
        server.db
          .select()
          .from(schema.agents)
          .where(eq(schema.agents.id, body.sourceAgentId))
          .limit(1),
        server.db
          .select()
          .from(schema.agents)
          .where(eq(schema.agents.id, body.targetAgentId))
          .limit(1),
      ]);

      if (!sourceAgent[0]) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.AGENT_NOT_FOUND,
            message: `Source agent ${body.sourceAgentId} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      if (!targetAgent[0]) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.AGENT_NOT_FOUND,
            message: `Target agent ${body.targetAgentId} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      const id = crypto.randomUUID();
      const now = new Date();

      const [inserted] = await server.db
        .insert(schema.a2aChannels)
        .values({
          id,
          sourceAgentId: body.sourceAgentId,
          targetAgentId: body.targetAgentId,
          allowedActions: body.allowedActions ?? ["*"],
          allowedDataTypes: body.allowedDataTypes ?? ["*"],
          maxRequestsPerMinute: body.maxRequestsPerMinute ?? 60,
          enabled: true,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      const response: ApiResponse<A2AChannel> = {
        data: rowToChannel(inserted),
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(201).send(response);
    } catch (err: unknown) {
      server.log.error(err);

      // Handle unique constraint violation (duplicate channel)
      const errMsg =
        err instanceof Error ? err.message : String(err);
      if (errMsg.includes("a2a_channels_source_target_idx")) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.POLICY_CONFLICT,
            message:
              "A channel between these two agents already exists",
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(409).send(response);
      }

      const response: ApiResponse<null> = {
        data: null,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: "Failed to create A2A channel",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // GET /channels — List A2A channels
  server.get("/channels", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const query = request.query as {
        sourceAgentId?: string;
        targetAgentId?: string;
        enabled?: string;
        limit?: string;
        offset?: string;
      };

      const limit = Math.min(parseInt(query.limit || "50", 10), 200);
      const offset = parseInt(query.offset || "0", 10);

      const conditions = [];
      if (query.sourceAgentId) {
        conditions.push(
          eq(schema.a2aChannels.sourceAgentId, query.sourceAgentId),
        );
      }
      if (query.targetAgentId) {
        conditions.push(
          eq(schema.a2aChannels.targetAgentId, query.targetAgentId),
        );
      }
      if (query.enabled !== undefined) {
        conditions.push(
          eq(schema.a2aChannels.enabled, query.enabled === "true"),
        );
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        server.db
          .select()
          .from(schema.a2aChannels)
          .where(whereClause)
          .orderBy(desc(schema.a2aChannels.createdAt))
          .limit(limit)
          .offset(offset),
        server.db
          .select({ count: sql<number>`count(*)::int` })
          .from(schema.a2aChannels)
          .where(whereClause),
      ]);

      const total = countResult[0]?.count ?? 0;

      const response: ApiResponse<A2AChannel[]> = {
        data: rows.map(rowToChannel),
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
          message: "Failed to list A2A channels",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // GET /channels/:id — Get channel details
  server.get("/channels/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { id } = request.params as { id: string };

      const [row] = await server.db
        .select()
        .from(schema.a2aChannels)
        .where(eq(schema.a2aChannels.id, id))
        .limit(1);

      if (!row) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.AGENT_NOT_FOUND,
            message: `A2A channel ${id} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      const response: ApiResponse<A2AChannel> = {
        data: rowToChannel(row),
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
          message: "Failed to get A2A channel",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // PATCH /channels/:id — Update channel
  server.patch("/channels/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { id } = request.params as { id: string };
      const body = request.body as {
        enabled?: boolean;
        allowedActions?: string[];
        allowedDataTypes?: string[];
        maxRequestsPerMinute?: number;
      };

      const [existing] = await server.db
        .select()
        .from(schema.a2aChannels)
        .where(eq(schema.a2aChannels.id, id))
        .limit(1);

      if (!existing) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.AGENT_NOT_FOUND,
            message: `A2A channel ${id} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      const updateValues: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (body.enabled !== undefined) updateValues.enabled = body.enabled;
      if (body.allowedActions !== undefined)
        updateValues.allowedActions = body.allowedActions;
      if (body.allowedDataTypes !== undefined)
        updateValues.allowedDataTypes = body.allowedDataTypes;
      if (body.maxRequestsPerMinute !== undefined)
        updateValues.maxRequestsPerMinute = body.maxRequestsPerMinute;

      const [updated] = await server.db
        .update(schema.a2aChannels)
        .set(updateValues)
        .where(eq(schema.a2aChannels.id, id))
        .returning();

      const response: ApiResponse<A2AChannel> = {
        data: rowToChannel(updated),
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
          message: "Failed to update A2A channel",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // DELETE /channels/:id — Delete channel
  server.delete("/channels/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { id } = request.params as { id: string };

      const [existing] = await server.db
        .select()
        .from(schema.a2aChannels)
        .where(eq(schema.a2aChannels.id, id))
        .limit(1);

      if (!existing) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.AGENT_NOT_FOUND,
            message: `A2A channel ${id} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      await server.db
        .delete(schema.a2aChannels)
        .where(eq(schema.a2aChannels.id, id));

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
          message: "Failed to delete A2A channel",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // ── A2A Authorization ───────────────────────────────────────────

  // POST /authorize — Authorize agent-to-agent communication
  server.post("/authorize", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const body = request.body as {
        sourceAgentId: string;
        targetAgentId: string;
        action: string;
        dataType?: string;
        context?: Record<string, unknown>;
      };

      if (!body.sourceAgentId || !body.targetAgentId || !body.action) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message:
              "Missing required fields: sourceAgentId, targetAgentId, action",
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(400).send(response);
      }

      const dataType = body.dataType ?? "unknown";

      // Look up channel between these agents
      const [channel] = await server.db
        .select()
        .from(schema.a2aChannels)
        .where(
          and(
            eq(schema.a2aChannels.sourceAgentId, body.sourceAgentId),
            eq(schema.a2aChannels.targetAgentId, body.targetAgentId),
          ),
        )
        .limit(1);

      // Helper to log communication and respond
      const logAndRespond = async (
        decision: PolicyEffect,
        channelId: string | null,
        reason: string,
        statusCode: number,
      ) => {
        const durationMs = performance.now() - start;

        // Log the communication
        await server.db.insert(schema.a2aCommunications).values({
          id: crypto.randomUUID(),
          channelId,
          sourceAgentId: body.sourceAgentId,
          targetAgentId: body.targetAgentId,
          action: body.action,
          dataType,
          decision,
          durationMs,
          timestamp: new Date(),
        });

        const response: ApiResponse<{
          decision: PolicyEffect;
          channelId: string | null;
          reason: string;
          evaluatedAt: string;
          durationMs: number;
        }> = {
          data: {
            decision,
            channelId,
            reason,
            evaluatedAt: new Date().toISOString(),
            durationMs,
          },
          error:
            decision === "deny"
              ? {
                  code: ErrorCodes.AUTHORIZATION_DENIED,
                  message: reason,
                }
              : null,
          meta: { requestId, durationMs },
        };
        return reply.status(statusCode).send(response);
      };

      // No channel → deny
      if (!channel) {
        return logAndRespond(
          "deny",
          null,
          "No A2A channel exists between these agents",
          403,
        );
      }

      // Channel disabled → deny
      if (!channel.enabled) {
        return logAndRespond(
          "deny",
          channel.id,
          "A2A channel is disabled",
          403,
        );
      }

      // Check if action is allowed
      const allowedActions = channel.allowedActions ?? ["*"];
      if (!matchesAny(allowedActions, body.action)) {
        return logAndRespond(
          "deny",
          channel.id,
          `Action "${body.action}" is not allowed on this channel`,
          403,
        );
      }

      // Check if dataType is allowed
      const allowedDataTypes = channel.allowedDataTypes ?? ["*"];
      if (!matchesAny(allowedDataTypes, dataType)) {
        return logAndRespond(
          "deny",
          channel.id,
          `Data type "${dataType}" is not allowed on this channel`,
          403,
        );
      }

      // Check rate limit: count communications in the last minute
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const [rateResult] = await server.db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.a2aCommunications)
        .where(
          and(
            eq(schema.a2aCommunications.channelId, channel.id),
            gte(schema.a2aCommunications.timestamp, oneMinuteAgo),
          ),
        );

      const recentCount = rateResult?.count ?? 0;
      if (recentCount >= channel.maxRequestsPerMinute) {
        return logAndRespond(
          "deny",
          channel.id,
          `Rate limit exceeded: ${recentCount}/${channel.maxRequestsPerMinute} requests per minute`,
          429,
        );
      }

      // All checks passed → allow
      return logAndRespond("allow", channel.id, "Communication authorized", 200);
    } catch (err) {
      server.log.error(err);
      const response: ApiResponse<null> = {
        data: null,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: "Failed to evaluate A2A authorization",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // ── Graph & Analytics ───────────────────────────────────────────

  // GET /graph — Get A2A interaction graph
  server.get("/graph", async (_request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      // Get all channels with agent info
      const channels = await server.db
        .select()
        .from(schema.a2aChannels);

      // Collect unique agent IDs from channels
      const agentIds = new Set<string>();
      for (const ch of channels) {
        agentIds.add(ch.sourceAgentId);
        agentIds.add(ch.targetAgentId);
      }

      // Fetch agent names
      const agentMap = new Map<string, string>();
      if (agentIds.size > 0) {
        const agentRows = await server.db
          .select({ id: schema.agents.id, name: schema.agents.name })
          .from(schema.agents);
        for (const row of agentRows) {
          agentMap.set(row.id, row.name);
        }
      }

      // Count communications per channel
      const commCounts = await server.db
        .select({
          channelId: schema.a2aCommunications.channelId,
          count: sql<number>`count(*)::int`,
          lastComm: sql<string>`max(${schema.a2aCommunications.timestamp})`,
        })
        .from(schema.a2aCommunications)
        .groupBy(schema.a2aCommunications.channelId);

      const commMap = new Map<
        string,
        { count: number; lastComm: string }
      >();
      for (const row of commCounts) {
        if (row.channelId) {
          commMap.set(row.channelId, {
            count: row.count,
            lastComm: row.lastComm ?? new Date().toISOString(),
          });
        }
      }

      // Build incoming/outgoing counts per agent
      const incomingCounts = new Map<string, number>();
      const outgoingCounts = new Map<string, number>();
      for (const ch of channels) {
        outgoingCounts.set(
          ch.sourceAgentId,
          (outgoingCounts.get(ch.sourceAgentId) ?? 0) + 1,
        );
        incomingCounts.set(
          ch.targetAgentId,
          (incomingCounts.get(ch.targetAgentId) ?? 0) + 1,
        );
      }

      // Build nodes
      const nodes: A2AGraphNode[] = Array.from(agentIds).map(
        (agentId) => ({
          agentId,
          agentName: agentMap.get(agentId) ?? "Unknown",
          incomingCount: incomingCounts.get(agentId) ?? 0,
          outgoingCount: outgoingCounts.get(agentId) ?? 0,
        }),
      );

      // Build edges
      const edges: A2AGraphEdge[] = channels.map((ch) => {
        const commInfo = commMap.get(ch.id);
        return {
          source: ch.sourceAgentId,
          target: ch.targetAgentId,
          requestCount: commInfo?.count ?? 0,
          lastCommunication:
            commInfo?.lastComm ?? ch.createdAt?.toISOString() ?? new Date().toISOString(),
          status: ch.enabled ? ("active" as const) : ("blocked" as const),
        };
      });

      const response: ApiResponse<A2AGraph> = {
        data: { nodes, edges },
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
          message: "Failed to build A2A graph",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // GET /communications — Query A2A communication logs
  server.get("/communications", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const query = request.query as {
        sourceAgentId?: string;
        targetAgentId?: string;
        channelId?: string;
        decision?: string;
        startTime?: string;
        endTime?: string;
        limit?: string;
        offset?: string;
      };

      const limit = Math.min(parseInt(query.limit || "100", 10), 1000);
      const offset = parseInt(query.offset || "0", 10);

      const conditions = [];
      if (query.sourceAgentId) {
        conditions.push(
          eq(
            schema.a2aCommunications.sourceAgentId,
            query.sourceAgentId,
          ),
        );
      }
      if (query.targetAgentId) {
        conditions.push(
          eq(
            schema.a2aCommunications.targetAgentId,
            query.targetAgentId,
          ),
        );
      }
      if (query.channelId) {
        conditions.push(
          eq(schema.a2aCommunications.channelId, query.channelId),
        );
      }
      if (query.decision) {
        conditions.push(
          eq(
            schema.a2aCommunications.decision,
            query.decision as PolicyEffect,
          ),
        );
      }
      if (query.startTime) {
        conditions.push(
          gte(
            schema.a2aCommunications.timestamp,
            new Date(query.startTime),
          ),
        );
      }
      if (query.endTime) {
        conditions.push(
          lte(
            schema.a2aCommunications.timestamp,
            new Date(query.endTime),
          ),
        );
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        server.db
          .select()
          .from(schema.a2aCommunications)
          .where(whereClause)
          .orderBy(desc(schema.a2aCommunications.timestamp))
          .limit(limit)
          .offset(offset),
        server.db
          .select({ count: sql<number>`count(*)::int` })
          .from(schema.a2aCommunications)
          .where(whereClause),
      ]);

      const total = countResult[0]?.count ?? 0;

      const response: ApiResponse<A2ACommunication[]> = {
        data: rows.map(rowToCommunication),
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
          message: "Failed to query A2A communications",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // GET /stats — A2A statistics
  server.get("/stats", async (_request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [
        totalChannelsResult,
        activeChannelsResult,
        commDecisionCounts,
        topPairsResult,
        auditDenyCounts,
      ] = await Promise.all([
        // Total channels
        server.db
          .select({ count: sql<number>`count(*)::int` })
          .from(schema.a2aChannels),
        // Active channels
        server.db
          .select({ count: sql<number>`count(*)::int` })
          .from(schema.a2aChannels)
          .where(eq(schema.a2aChannels.enabled, true)),
        // A2A communication decisions (last 24h)
        server.db
          .select({
            decision: schema.a2aCommunications.decision,
            count: sql<number>`count(*)::int`,
          })
          .from(schema.a2aCommunications)
          .where(gte(schema.a2aCommunications.timestamp, twentyFourHoursAgo))
          .groupBy(schema.a2aCommunications.decision),
        // Top communicating pairs (last 24h)
        server.db
          .select({
            sourceAgentId: schema.a2aCommunications.sourceAgentId,
            targetAgentId: schema.a2aCommunications.targetAgentId,
            count: sql<number>`count(*)::int`,
          })
          .from(schema.a2aCommunications)
          .where(gte(schema.a2aCommunications.timestamp, twentyFourHoursAgo))
          .groupBy(
            schema.a2aCommunications.sourceAgentId,
            schema.a2aCommunications.targetAgentId,
          )
          .orderBy(desc(sql`count(*)`))
          .limit(10),
        // Regular audit deny count for comparison (last 24h)
        server.db
          .select({
            decision: schema.auditLogs.decision,
            count: sql<number>`count(*)::int`,
          })
          .from(schema.auditLogs)
          .where(gte(schema.auditLogs.timestamp, twentyFourHoursAgo))
          .groupBy(schema.auditLogs.decision),
      ]);

      const totalChannels = totalChannelsResult[0]?.count ?? 0;
      const activeChannels = activeChannelsResult[0]?.count ?? 0;

      let totalA2AComms = 0;
      let a2aDenyCount = 0;
      for (const row of commDecisionCounts) {
        totalA2AComms += row.count;
        if (row.decision === "deny") a2aDenyCount = row.count;
      }

      let totalAuditDecisions = 0;
      let auditDenyTotal = 0;
      for (const row of auditDenyCounts) {
        totalAuditDecisions += row.count;
        if (row.decision === "deny") auditDenyTotal = row.count;
      }

      const a2aDenyRate =
        totalA2AComms > 0 ? a2aDenyCount / totalA2AComms : 0;
      const regularDenyRate =
        totalAuditDecisions > 0
          ? auditDenyTotal / totalAuditDecisions
          : 0;

      interface A2AStats {
        totalChannels: number;
        activeChannels: number;
        totalCommunications24h: number;
        a2aDenyRate: number;
        regularDenyRate: number;
        topPairs: Array<{
          sourceAgentId: string;
          targetAgentId: string;
          count: number;
        }>;
      }

      const stats: A2AStats = {
        totalChannels,
        activeChannels,
        totalCommunications24h: totalA2AComms,
        a2aDenyRate: Math.round(a2aDenyRate * 10000) / 10000,
        regularDenyRate: Math.round(regularDenyRate * 10000) / 10000,
        topPairs: topPairsResult.map((r) => ({
          sourceAgentId: r.sourceAgentId,
          targetAgentId: r.targetAgentId,
          count: r.count,
        })),
      };

      const response: ApiResponse<A2AStats> = {
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
          message: "Failed to get A2A statistics",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });
}
