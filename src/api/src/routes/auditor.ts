import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type {
  ApiResponse,
  AuditorInvitation,
  AuditorAccessLog,
  AuditorProfile,
  CreateAuditorInvitationRequest,
} from "@agentgate/shared";
import { ErrorCodes } from "@agentgate/shared";

function rejectAuditor(request: FastifyRequest, reply: FastifyReply, requestId: string, start: number): boolean {
  if (request.authMethod === "auditor_token") {
    reply.status(403).send({
      data: null,
      error: { code: ErrorCodes.AUDITOR_WRITE_DENIED, message: "Auditor tokens cannot access admin endpoints" },
      meta: { requestId, durationMs: performance.now() - start },
    } satisfies ApiResponse<null>);
    return true;
  }
  return false;
}

function getTenantId(request: FastifyRequest): string | null {
  return request.tenantId ?? null;
}

export async function auditorRoutes(server: FastifyInstance) {
  // ═══════════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS (reject auditor_token auth)
  // ═══════════════════════════════════════════════════════════════

  // POST / — Create auditor invitation
  server.post("/", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    if (rejectAuditor(request, reply, requestId, start)) return;

    const tenantId = getTenantId(request);
    if (!tenantId) {
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.VALIDATION_ERROR, message: "Tenant context required" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    const body = request.body as CreateAuditorInvitationRequest;
    if (!body.email || !body.name || !body.frameworkScopes?.length) {
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.VALIDATION_ERROR, message: "email, name, and frameworkScopes are required" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    const createdBy = request.ssoSession?.userId ?? request.apiKey?.ownerId ?? "admin";
    const result = await server.auditorService.createInvitation(tenantId, createdBy, body);

    return reply.status(201).send({
      data: { invitation: result.invitation, token: result.token },
      error: null,
      meta: { requestId, durationMs: performance.now() - start },
    } satisfies ApiResponse<{ invitation: AuditorInvitation; token: string }>);
  });

  // GET / — List auditor invitations
  server.get("/", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    if (rejectAuditor(request, reply, requestId, start)) return;

    const tenantId = getTenantId(request);
    if (!tenantId) {
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.VALIDATION_ERROR, message: "Tenant context required" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    const { status } = request.query as { status?: string };
    const invitations = await server.auditorService.listInvitations(tenantId, status);

    return reply.send({
      data: invitations,
      error: null,
      meta: { total: invitations.length, requestId, durationMs: performance.now() - start },
    } satisfies ApiResponse<AuditorInvitation[]>);
  });

  // GET /:id — Get single invitation
  server.get("/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    if (rejectAuditor(request, reply, requestId, start)) return;

    const { id } = request.params as { id: string };
    // Don't match portal routes
    if (id === "portal") return;

    const invitation = await server.auditorService.getInvitation(id);
    if (!invitation) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.AUDITOR_INVITATION_NOT_FOUND, message: "Invitation not found" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    const logs = await server.auditorService.getAccessLogs({ invitationId: id, limit: 1 });

    return reply.send({
      data: { ...invitation, accessLogCount: logs.length },
      error: null,
      meta: { requestId, durationMs: performance.now() - start },
    });
  });

  // DELETE /:id — Revoke invitation
  server.delete("/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    if (rejectAuditor(request, reply, requestId, start)) return;

    const { id } = request.params as { id: string };
    const revoked = await server.auditorService.revokeInvitation(id);
    if (!revoked) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.AUDITOR_INVITATION_NOT_FOUND, message: "Invitation not found" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    return reply.send({
      data: { revoked: true },
      error: null,
      meta: { requestId, durationMs: performance.now() - start },
    });
  });

  // GET /:id/access-logs — Access logs for invitation
  server.get("/:id/access-logs", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    if (rejectAuditor(request, reply, requestId, start)) return;

    const { id } = request.params as { id: string };
    const { limit, offset } = request.query as { limit?: string; offset?: string };
    const logs = await server.auditorService.getAccessLogs({
      invitationId: id,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });

    return reply.send({
      data: logs,
      error: null,
      meta: { total: logs.length, requestId, durationMs: performance.now() - start },
    } satisfies ApiResponse<AuditorAccessLog[]>);
  });

  // ═══════════════════════════════════════════════════════════════
  // PORTAL ENDPOINTS (require auditor_token, scope-checked, logged)
  // ═══════════════════════════════════════════════════════════════

  function requireAuditor(request: FastifyRequest, reply: FastifyReply, requestId: string, start: number): boolean {
    if (request.authMethod !== "auditor_token" || !request.auditorInvitation) {
      reply.status(401).send({
        data: null,
        error: { code: ErrorCodes.TOKEN_INVALID, message: "Auditor token required" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
      return false;
    }
    return true;
  }

  async function logAndCheckScope(
    request: FastifyRequest,
    reply: FastifyReply,
    requestId: string,
    start: number,
    resource: string,
    action: string,
    frameworkId?: string,
  ): Promise<boolean> {
    const inv = request.auditorInvitation!;

    // Log access
    server.auditorService
      .logAccess(inv.id, inv.tenantId, resource, action, request.ip, request.headers["user-agent"])
      .catch((err) => server.log.error(err, "Failed to log auditor access"));

    // Check scope if frameworkId provided
    if (frameworkId) {
      const invitation = await server.auditorService.getInvitation(inv.id);
      if (!invitation || !server.auditorService.checkFrameworkScope(invitation, frameworkId)) {
        reply.status(403).send({
          data: null,
          error: { code: ErrorCodes.AUDITOR_SCOPE_DENIED, message: "Framework not in auditor scope" },
          meta: { requestId, durationMs: performance.now() - start },
        } satisfies ApiResponse<null>);
        return false;
      }
    }

    return true;
  }

  // GET /portal/profile — Auditor's own profile
  server.get("/portal/profile", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    if (!requireAuditor(request, reply, requestId, start)) return;

    const inv = request.auditorInvitation!;
    const invitation = await server.auditorService.getInvitation(inv.id);
    if (!invitation) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.AUDITOR_INVITATION_NOT_FOUND, message: "Invitation not found" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    const profile = await server.auditorService.getProfile(invitation);

    server.auditorService
      .logAccess(inv.id, inv.tenantId, "portal/profile", "view", request.ip, request.headers["user-agent"])
      .catch((err) => server.log.error(err, "Failed to log auditor access"));

    return reply.send({
      data: profile,
      error: null,
      meta: { requestId, durationMs: performance.now() - start },
    } satisfies ApiResponse<AuditorProfile>);
  });

  // GET /portal/frameworks — Scoped frameworks list
  server.get("/portal/frameworks", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    if (!requireAuditor(request, reply, requestId, start)) return;

    if (!(await logAndCheckScope(request, reply, requestId, start, "portal/frameworks", "list"))) return;

    const inv = request.auditorInvitation!;
    const tenantId = inv.tenantId;
    const allFrameworks = await server.complianceService.getFrameworks(tenantId);

    // Filter to only scoped frameworks
    const invitation = await server.auditorService.getInvitation(inv.id);
    const scoped = allFrameworks.filter((f) =>
      invitation ? server.auditorService.checkFrameworkScope(invitation, f.frameworkId) : false,
    );

    return reply.send({
      data: scoped,
      error: null,
      meta: { total: scoped.length, requestId, durationMs: performance.now() - start },
    });
  });

  // GET /portal/frameworks/:fid/controls — Controls for framework
  server.get("/portal/frameworks/:fid/controls", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    if (!requireAuditor(request, reply, requestId, start)) return;

    const { fid } = request.params as { fid: string };
    if (!(await logAndCheckScope(request, reply, requestId, start, `portal/frameworks/${fid}/controls`, "list", fid)))
      return;

    const controls = await server.complianceService.getControls(fid);

    return reply.send({
      data: controls,
      error: null,
      meta: { total: controls.length, requestId, durationMs: performance.now() - start },
    });
  });

  // GET /portal/frameworks/:fid/evidence — Evidence for framework
  server.get("/portal/frameworks/:fid/evidence", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    if (!requireAuditor(request, reply, requestId, start)) return;

    const { fid } = request.params as { fid: string };
    if (!(await logAndCheckScope(request, reply, requestId, start, `portal/frameworks/${fid}/evidence`, "list", fid)))
      return;

    const { controlId } = request.query as { controlId?: string };

    // getEvidence takes a controlId; if provided filter by it, otherwise get all controls' evidence
    let evidence: any[] = [];
    if (controlId) {
      evidence = await server.complianceService.getEvidence(controlId);
    } else {
      // Get all controls for this framework, then gather evidence for each
      const controls = await server.complianceService.getControls(fid);
      for (const ctrl of controls) {
        const ctrlEvidence = await server.complianceService.getEvidence(ctrl.id);
        evidence.push(...ctrlEvidence);
      }
    }

    return reply.send({
      data: evidence,
      error: null,
      meta: { total: evidence.length, requestId, durationMs: performance.now() - start },
    });
  });

  // GET /portal/frameworks/:fid/reports — Reports for framework
  server.get("/portal/frameworks/:fid/reports", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    if (!requireAuditor(request, reply, requestId, start)) return;

    const { fid } = request.params as { fid: string };
    if (!(await logAndCheckScope(request, reply, requestId, start, `portal/frameworks/${fid}/reports`, "list", fid)))
      return;

    const reports = await server.complianceService.getReports(fid);

    return reply.send({
      data: reports,
      error: null,
      meta: { total: reports.length, requestId, durationMs: performance.now() - start },
    });
  });

  // GET /portal/reports/:reportId — Single report detail
  server.get("/portal/reports/:reportId", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    if (!requireAuditor(request, reply, requestId, start)) return;

    const { reportId } = request.params as { reportId: string };
    const report = await server.complianceService.getReport(reportId);

    if (!report) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.REPORT_NOT_FOUND, message: "Report not found" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    // Validate framework scope
    const inv = request.auditorInvitation!;
    const invitation = await server.auditorService.getInvitation(inv.id);
    if (!invitation || !server.auditorService.checkFrameworkScope(invitation, report.frameworkId)) {
      return reply.status(403).send({
        data: null,
        error: { code: ErrorCodes.AUDITOR_SCOPE_DENIED, message: "Framework not in auditor scope" },
        meta: { requestId, durationMs: performance.now() - start },
      } satisfies ApiResponse<null>);
    }

    server.auditorService
      .logAccess(inv.id, inv.tenantId, `portal/reports/${reportId}`, "view", request.ip, request.headers["user-agent"])
      .catch((err) => server.log.error(err, "Failed to log auditor access"));

    return reply.send({
      data: report,
      error: null,
      meta: { requestId, durationMs: performance.now() - start },
    });
  });

  // GET /portal/frameworks/:fid/gap-analysis — Gap analysis
  server.get("/portal/frameworks/:fid/gap-analysis", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    if (!requireAuditor(request, reply, requestId, start)) return;

    const { fid } = request.params as { fid: string };
    if (!(await logAndCheckScope(request, reply, requestId, start, `portal/frameworks/${fid}/gap-analysis`, "view", fid)))
      return;

    const tenantId = request.auditorInvitation!.tenantId;
    const gaps = await server.complianceService.getGapAnalysis(tenantId, fid);

    return reply.send({
      data: gaps,
      error: null,
      meta: { requestId, durationMs: performance.now() - start },
    });
  });

  // GET /portal/audit-logs — Agent activity audit logs (read-only)
  server.get("/portal/audit-logs", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    if (!requireAuditor(request, reply, requestId, start)) return;

    if (!(await logAndCheckScope(request, reply, requestId, start, "portal/audit-logs", "list"))) return;

    const { limit, offset } = request.query as { limit?: string; offset?: string };

    // Query audit logs from the main audit log table
    const { eq, desc } = await import("drizzle-orm");
    const { schema } = await import("../db/index.js");

    const rows = await server.db
      .select()
      .from(schema.auditLogs)
      .orderBy(desc(schema.auditLogs.timestamp))
      .limit(limit ? parseInt(limit) : 50)
      .offset(offset ? parseInt(offset) : 0);

    const entries = rows.map((r) => ({
      id: r.id,
      agentId: r.agentId,
      action: r.action,
      resource: r.resource,
      decision: r.decision,
      policyId: r.policyId,
      timestamp: r.timestamp?.toISOString() ?? new Date().toISOString(),
      durationMs: r.durationMs,
    }));

    return reply.send({
      data: entries,
      error: null,
      meta: { total: entries.length, requestId, durationMs: performance.now() - start },
    });
  });
}
