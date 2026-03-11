import type { FastifyInstance } from "fastify";
import type {
  CreateSSOConnectionRequest,
  UpdateSSOConnectionRequest,
  ApiResponse,
  SSOConnection,
  SSOSession,
  SCIMToken,
  SSOAuditEntry,
  SCIMGroup,
  SPMetadata,
  SSOTestResult,
} from "@agentgate/shared";
import { ErrorCodes } from "@agentgate/shared";

export async function ssoRoutes(server: FastifyInstance) {
  // Derive tenantId from the authenticated request
  function getTenantId(request: { tenantId?: string | null }): string | null {
    return request.tenantId ?? null;
  }

  // ─── Connections ─────────────────────────────────────────────────

  // GET /connections — List SSO connections for current tenant
  server.get("/connections", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    const tenantId = getTenantId(request);

    if (!tenantId) {
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.VALIDATION_ERROR, message: "Tenant context required" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    const connections = await server.ssoService.listConnections(tenantId);
    return reply.send({
      data: connections,
      error: null,
      meta: { total: connections.length, requestId, durationMs: performance.now() - start },
    } satisfies ApiResponse<SSOConnection[]>);
  });

  // POST /connections — Create SSO connection
  server.post("/connections", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    const tenantId = getTenantId(request);

    if (!tenantId) {
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.VALIDATION_ERROR, message: "Tenant context required" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    const body = request.body as CreateSSOConnectionRequest;
    if (!body.provider || !body.protocol) {
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.VALIDATION_ERROR, message: "Missing required fields: provider, protocol" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    try {
      const connection = await server.ssoService.createConnection(tenantId, body);
      await server.ssoService.logAudit(tenantId, "connection_created", {
        provider: body.provider,
        details: { connectionId: connection.id, protocol: body.protocol },
      });
      return reply.status(201).send({
        data: connection,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<SSOConnection>);
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to create SSO connection" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }
  });

  // GET /connections/:id — Get connection details
  server.get("/connections/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    const { id } = request.params as { id: string };

    const connection = await server.ssoService.getConnection(id);
    if (!connection) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.SSO_CONNECTION_NOT_FOUND, message: "SSO connection not found" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    return reply.send({
      data: connection,
      error: null,
      meta: { requestId, durationMs: performance.now() - start },
    } satisfies ApiResponse<SSOConnection>);
  });

  // PATCH /connections/:id — Update connection
  server.patch("/connections/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    const { id } = request.params as { id: string };
    const body = request.body as UpdateSSOConnectionRequest;
    const tenantId = getTenantId(request);

    // Enforcement requires enterprise plan
    if (body.enforced === true && tenantId) {
      const isEnterprise = await server.ssoService.isEnterprisePlan(tenantId);
      if (!isEnterprise) {
        return reply.status(403).send({
          data: null,
          error: { code: ErrorCodes.PLAN_UPGRADE_REQUIRED, message: "SSO enforcement requires Enterprise plan" },
          meta: { requestId, durationMs: performance.now() - start },
        } satisfies ApiResponse<null>);
      }
    }

    const connection = await server.ssoService.updateConnection(id, body);
    if (!connection) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.SSO_CONNECTION_NOT_FOUND, message: "SSO connection not found" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    if (tenantId) {
      await server.ssoService.logAudit(tenantId, "connection_updated", {
        provider: connection.provider,
        details: { connectionId: id, changes: Object.keys(body) },
      });
    }

    return reply.send({
      data: connection,
      error: null,
      meta: { requestId, durationMs: performance.now() - start },
    } satisfies ApiResponse<SSOConnection>);
  });

  // DELETE /connections/:id — Delete connection
  server.delete("/connections/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    const { id } = request.params as { id: string };
    const tenantId = getTenantId(request);

    const connection = await server.ssoService.getConnection(id);
    const deleted = await server.ssoService.deleteConnection(id);
    if (!deleted) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.SSO_CONNECTION_NOT_FOUND, message: "SSO connection not found" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    if (tenantId && connection) {
      await server.ssoService.logAudit(tenantId, "connection_deleted", {
        provider: connection.provider,
        details: { connectionId: id },
      });
    }

    return reply.send({
      data: { deleted: true },
      error: null,
      meta: { requestId, durationMs: performance.now() - start },
    } satisfies ApiResponse<{ deleted: boolean }>);
  });

  // POST /connections/:id/test — Test IdP connectivity
  server.post("/connections/:id/test", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    const { id } = request.params as { id: string };
    const tenantId = getTenantId(request);

    const result = await server.ssoService.testConnection(id);

    if (tenantId) {
      await server.ssoService.logAudit(tenantId, "connection_test", {
        details: { connectionId: id, success: result.success },
      });
    }

    return reply.send({
      data: result,
      error: null,
      meta: { requestId, durationMs: performance.now() - start },
    } satisfies ApiResponse<SSOTestResult>);
  });

  // GET /connections/:id/metadata — Download SP metadata XML
  server.get("/connections/:id/metadata", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    const { id } = request.params as { id: string };

    const connection = await server.ssoService.getConnection(id);
    if (!connection) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.SSO_CONNECTION_NOT_FOUND, message: "SSO connection not found" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    // Look up tenant slug
    const { eq } = await import("drizzle-orm");
    const { schema } = await import("../db/index.js");
    const [tenant] = await server.db
      .select()
      .from(schema.tenants)
      .where(eq(schema.tenants.id, connection.tenantId))
      .limit(1);

    const slug = tenant?.slug ?? "unknown";
    return reply.send({
      data: server.ssoService.getSPMetadata(slug),
      error: null,
      meta: { requestId, durationMs: performance.now() - start },
    } satisfies ApiResponse<SPMetadata>);
  });

  // ─── Sessions ────────────────────────────────────────────────────

  // GET /sessions — List active sessions
  server.get("/sessions", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    const tenantId = getTenantId(request);

    if (!tenantId) {
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.VALIDATION_ERROR, message: "Tenant context required" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    const sessions = await server.ssoService.listSessions(tenantId);
    return reply.send({
      data: sessions,
      error: null,
      meta: { total: sessions.length, requestId, durationMs: performance.now() - start },
    } satisfies ApiResponse<SSOSession[]>);
  });

  // DELETE /sessions/:id — Revoke a session
  server.delete("/sessions/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    const { id } = request.params as { id: string };
    const tenantId = getTenantId(request);

    const revoked = await server.ssoService.revokeSession(id);
    if (!revoked) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.SSO_CONNECTION_NOT_FOUND, message: "Session not found" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    if (tenantId) {
      await server.ssoService.logAudit(tenantId, "session_revoked", { details: { sessionId: id } });
    }

    return reply.send({
      data: { revoked: true },
      error: null,
      meta: { requestId, durationMs: performance.now() - start },
    } satisfies ApiResponse<{ revoked: boolean }>);
  });

  // ─── Audit ───────────────────────────────────────────────────────

  // GET /audit — SSO audit log
  server.get("/audit", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    const tenantId = getTenantId(request);
    const query = request.query as { limit?: string; offset?: string };

    if (!tenantId) {
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.VALIDATION_ERROR, message: "Tenant context required" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    const entries = await server.ssoService.queryAuditLog(
      tenantId,
      parseInt(query.limit ?? "50"),
      parseInt(query.offset ?? "0"),
    );

    return reply.send({
      data: entries,
      error: null,
      meta: { total: entries.length, requestId, durationMs: performance.now() - start },
    } satisfies ApiResponse<SSOAuditEntry[]>);
  });

  // ─── SCIM Tokens ────────────────────────────────────────────────

  // GET /scim-tokens — List SCIM tokens
  server.get("/scim-tokens", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    const tenantId = getTenantId(request);

    if (!tenantId) {
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.VALIDATION_ERROR, message: "Tenant context required" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    const tokens = await server.ssoService.listScimTokens(tenantId);
    return reply.send({
      data: tokens,
      error: null,
      meta: { total: tokens.length, requestId, durationMs: performance.now() - start },
    } satisfies ApiResponse<SCIMToken[]>);
  });

  // POST /scim-tokens — Generate SCIM token
  server.post("/scim-tokens", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    const tenantId = getTenantId(request);
    const body = request.body as { connectionId: string };

    if (!tenantId) {
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.VALIDATION_ERROR, message: "Tenant context required" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    if (!body.connectionId) {
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.VALIDATION_ERROR, message: "Missing required field: connectionId" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    try {
      const { token, record } = await server.ssoService.generateScimToken(tenantId, body.connectionId);
      await server.ssoService.logAudit(tenantId, "scim_token_generated", {
        details: { tokenId: record.id, connectionId: body.connectionId },
      });
      return reply.status(201).send({
        data: { ...record, token },
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<SCIMToken & { token: string }>);
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to generate SCIM token" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }
  });

  // DELETE /scim-tokens/:id — Revoke SCIM token
  server.delete("/scim-tokens/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    const { id } = request.params as { id: string };
    const tenantId = getTenantId(request);

    const revoked = await server.ssoService.revokeScimToken(id);
    if (!revoked) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.SCIM_TOKEN_INVALID, message: "SCIM token not found" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    if (tenantId) {
      await server.ssoService.logAudit(tenantId, "scim_token_revoked", { details: { tokenId: id } });
    }

    return reply.send({
      data: { revoked: true },
      error: null,
      meta: { requestId, durationMs: performance.now() - start },
    } satisfies ApiResponse<{ revoked: boolean }>);
  });
}
