import type { FastifyInstance } from "fastify";
import type { ApiResponse } from "@agentgate/shared";
import { ErrorCodes } from "@agentgate/shared";

export async function complianceRoutes(server: FastifyInstance) {
  // GET / — List frameworks for tenant
  server.get("/", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const tenantId = (request as any).tenantId ?? "default";
      const frameworks = await server.complianceService.getFrameworks(tenantId);
      const response: ApiResponse<typeof frameworks> = {
        data: frameworks,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.send(response);
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to list frameworks" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // GET /available — List all framework definitions (not yet initialized)
  server.get("/available", async (_request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    const available = server.complianceService.getAvailableFrameworks();
    return reply.send({
      data: available,
      error: null,
      meta: { requestId, durationMs: performance.now() - start },
    });
  });

  // POST /:frameworkId/initialize — Initialize a framework
  server.post("/:frameworkId/initialize", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const { frameworkId } = request.params as { frameworkId: string };
      const tenantId = (request as any).tenantId ?? "default";
      const result = await server.complianceService.initializeFramework(tenantId, frameworkId);
      return reply.status(201).send({
        data: result,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.VALIDATION_ERROR, message: "Invalid request" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // POST /:frameworkId/evaluate — Evaluate all controls
  server.post("/:frameworkId/evaluate", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const { frameworkId } = request.params as { frameworkId: string };
      const tenantId = (request as any).tenantId ?? "default";
      const result = await server.complianceService.evaluateFramework(tenantId, frameworkId);
      return reply.send({
        data: result,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.FRAMEWORK_NOT_FOUND, message: "Framework not found or not initialized" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // GET /:frameworkId/controls — List controls
  server.get("/:frameworkId/controls", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const { frameworkId } = request.params as { frameworkId: string };
      const controls = await server.complianceService.getControls(frameworkId);
      return reply.send({
        data: controls,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to list controls" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // POST /:frameworkId/evidence — Submit evidence
  server.post("/:frameworkId/evidence", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const { frameworkId } = request.params as { frameworkId: string };
      const tenantId = (request as any).tenantId ?? "default";
      const body = request.body as {
        controlId: string;
        title: string;
        description: string;
        sourceSystem: string;
        data?: Record<string, unknown>;
      };
      const result = await server.complianceService.collectEvidence(
        tenantId,
        body.controlId,
        frameworkId,
        body,
      );
      return reply.status(201).send({
        data: result,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to submit evidence" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // GET /:frameworkId/evidence — List evidence for a control (query: controlId)
  server.get("/:frameworkId/evidence", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const query = request.query as { controlId?: string };
      if (!query.controlId) {
        return reply.status(400).send({
          data: null,
          error: { code: ErrorCodes.VALIDATION_ERROR, message: "controlId query param required" },
          meta: { requestId, durationMs: performance.now() - start },
        });
      }
      const evidence = await server.complianceService.getEvidence(query.controlId);
      return reply.send({
        data: evidence,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to list evidence" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // POST /:frameworkId/reports/generate — Generate report
  server.post("/:frameworkId/reports/generate", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const { frameworkId } = request.params as { frameworkId: string };
      const tenantId = (request as any).tenantId ?? "default";
      const body = request.body as { generatedBy?: string } | undefined;
      const result = await server.complianceService.generateReport(
        tenantId,
        frameworkId,
        body?.generatedBy ?? "system",
      );
      return reply.status(201).send({
        data: result,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to generate report" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // GET /:frameworkId/reports — List reports
  server.get("/:frameworkId/reports", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const { frameworkId } = request.params as { frameworkId: string };
      const reports = await server.complianceService.getReports(frameworkId);
      return reply.send({
        data: reports,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to list reports" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // GET /reports/:reportId — Get single report
  server.get("/reports/:reportId", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const { reportId } = request.params as { reportId: string };
      const report = await server.complianceService.getReport(reportId);
      if (!report) {
        return reply.status(404).send({
          data: null,
          error: { code: ErrorCodes.REPORT_NOT_FOUND, message: "Report not found" },
          meta: { requestId, durationMs: performance.now() - start },
        });
      }
      return reply.send({
        data: report,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to get report" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // GET /:frameworkId/gap-analysis — Gap analysis
  server.get("/:frameworkId/gap-analysis", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const { frameworkId } = request.params as { frameworkId: string };
      const tenantId = (request as any).tenantId ?? "default";
      const gaps = await server.complianceService.getGapAnalysis(tenantId, frameworkId);
      return reply.send({
        data: gaps,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to get gap analysis" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // GET /:frameworkId/score-history — Score history
  server.get("/:frameworkId/score-history", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const { frameworkId } = request.params as { frameworkId: string };
      const tenantId = (request as any).tenantId ?? "default";
      const history = await server.complianceService.getScoreHistory(tenantId, frameworkId);
      return reply.send({
        data: history,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to get score history" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // GET /regulatory-updates — List regulatory updates
  server.get("/regulatory-updates", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const query = request.query as { frameworkId?: string };
      const updates = await server.complianceService.getRegulatoryUpdates(query.frameworkId);
      return reply.send({
        data: updates,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to list regulatory updates" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // POST /regulatory-updates/:updateId/acknowledge — Acknowledge update
  server.post("/regulatory-updates/:updateId/acknowledge", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const { updateId } = request.params as { updateId: string };
      await server.complianceService.acknowledgeUpdate(updateId);
      return reply.send({
        data: { acknowledged: true },
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to acknowledge update" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // ─── Remediation Endpoints ─────────────────────────────────────

  // POST /:frameworkId/controls/:controlId/remediation — Generate/get recommendation
  server.post("/:frameworkId/controls/:controlId/remediation", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const { frameworkId, controlId } = request.params as { frameworkId: string; controlId: string };
      const tenantId = (request as any).tenantId ?? "default";
      const body = request.body as { forceRegenerate?: boolean } | undefined;

      // Resolve evaluator from DB since controlId is a UUID
      const evaluator = await server.remediationService.getEvaluatorForControlFromDb(controlId, frameworkId);
      if (!evaluator) {
        return reply.status(404).send({
          data: null,
          error: { code: ErrorCodes.CONTROL_NOT_FOUND, message: "Control not found" },
          meta: { requestId, durationMs: performance.now() - start },
        });
      }

      const result = await server.remediationService.getRecommendation(
        tenantId, controlId, frameworkId, body?.forceRegenerate,
      );
      return reply.send({
        data: result,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to generate recommendation" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // POST /:frameworkId/remediation/generate — Batch generate for all failing controls
  server.post("/:frameworkId/remediation/generate", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const { frameworkId } = request.params as { frameworkId: string };
      const tenantId = (request as any).tenantId ?? "default";
      const result = await server.remediationService.generateFrameworkRecommendations(tenantId, frameworkId);
      return reply.send({
        data: result,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to generate recommendations" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // GET /:frameworkId/remediation — List recommendations
  server.get("/:frameworkId/remediation", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const { frameworkId } = request.params as { frameworkId: string };
      const tenantId = (request as any).tenantId ?? "default";
      const query = request.query as { status?: string };
      const result = await server.remediationService.listRecommendations(tenantId, frameworkId, query.status);
      return reply.send({
        data: result,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to list recommendations" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // PATCH /remediation/:recommendationId — Update status
  server.patch("/remediation/:recommendationId", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const { recommendationId } = request.params as { recommendationId: string };
      const tenantId = (request as any).tenantId ?? "default";
      const body = request.body as { status?: string } | undefined;
      if (!body?.status) {
        return reply.status(400).send({
          data: null,
          error: { code: ErrorCodes.VALIDATION_ERROR, message: "status is required" },
          meta: { requestId, durationMs: performance.now() - start },
        });
      }
      const validStatuses = ["pending", "in_progress", "completed", "dismissed"];
      if (!validStatuses.includes(body.status)) {
        return reply.status(400).send({
          data: null,
          error: { code: ErrorCodes.VALIDATION_ERROR, message: `status must be one of: ${validStatuses.join(", ")}` },
          meta: { requestId, durationMs: performance.now() - start },
        });
      }
      const result = await server.remediationService.updateStatus(tenantId, recommendationId, body.status as any);
      if (!result) {
        return reply.status(404).send({
          data: null,
          error: { code: ErrorCodes.RECOMMENDATION_NOT_FOUND, message: "Recommendation not found" },
          meta: { requestId, durationMs: performance.now() - start },
        });
      }
      return reply.send({
        data: result,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to update recommendation" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // ─── Policy Suggestion Endpoints ───────────────────────────────

  // POST /regulatory-updates/:updateId/analyze — Generate policy suggestions
  server.post("/regulatory-updates/:updateId/analyze", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const { updateId } = request.params as { updateId: string };
      const tenantId = (request as any).tenantId ?? "default";
      const result = await server.policySuggestionService.generateSuggestionsForUpdate(tenantId, updateId);
      return reply.send({
        data: result,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to analyze regulatory update" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // GET /regulatory-updates/:updateId/suggestions — List suggestions
  server.get("/regulatory-updates/:updateId/suggestions", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const { updateId } = request.params as { updateId: string };
      const tenantId = (request as any).tenantId ?? "default";
      const query = request.query as { status?: string };
      const result = await server.policySuggestionService.getSuggestions(tenantId, updateId, query.status);
      return reply.send({
        data: result,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to list suggestions" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // PATCH /policy-suggestions/:suggestionId — Review (approve/reject)
  server.patch("/policy-suggestions/:suggestionId", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const { suggestionId } = request.params as { suggestionId: string };
      const tenantId = (request as any).tenantId ?? "default";
      const body = request.body as { status?: string; reviewedBy?: string } | undefined;
      if (!body?.status || !["approved", "rejected"].includes(body.status)) {
        return reply.status(400).send({
          data: null,
          error: { code: ErrorCodes.VALIDATION_ERROR, message: "status must be 'approved' or 'rejected'" },
          meta: { requestId, durationMs: performance.now() - start },
        });
      }
      const result = await server.policySuggestionService.reviewSuggestion(
        tenantId, suggestionId, body.status as "approved" | "rejected", body.reviewedBy ?? "admin",
      );
      if (!result) {
        return reply.status(404).send({
          data: null,
          error: { code: ErrorCodes.SUGGESTION_NOT_FOUND, message: "Suggestion not found" },
          meta: { requestId, durationMs: performance.now() - start },
        });
      }
      return reply.send({
        data: result,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Failed to review suggestion" },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });

  // POST /policy-suggestions/:suggestionId/apply — Apply approved suggestion
  server.post("/policy-suggestions/:suggestionId/apply", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    try {
      const { suggestionId } = request.params as { suggestionId: string };
      const tenantId = (request as any).tenantId ?? "default";
      const result = await server.policySuggestionService.applySuggestion(tenantId, suggestionId);
      return reply.send({
        data: result,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      });
    } catch (err: any) {
      server.log.error(err);
      const internalMsg = err.message ?? "";
      let code: string = ErrorCodes.INTERNAL_ERROR;
      let status = 500;
      let message = "Failed to apply suggestion";
      if (internalMsg.includes("not found")) { code = ErrorCodes.SUGGESTION_NOT_FOUND; status = 404; message = "Suggestion not found"; }
      else if (internalMsg.includes("approved")) { code = ErrorCodes.SUGGESTION_NOT_APPROVED; status = 400; message = "Suggestion must be approved before applying"; }
      else if (internalMsg.includes("already applied")) { code = ErrorCodes.SUGGESTION_ALREADY_APPLIED; status = 409; message = "Suggestion has already been applied"; }
      return reply.status(status).send({
        data: null,
        error: { code, message },
        meta: { requestId, durationMs: performance.now() - start },
      });
    }
  });
}
