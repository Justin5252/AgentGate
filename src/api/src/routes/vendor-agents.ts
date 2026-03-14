import type { FastifyInstance } from "fastify";
import { ErrorCodes } from "@agentgate/shared";
import type { CreateVendorAgentRequest, UpdateVendorAgentRequest, CreateAssessmentRequest } from "@agentgate/shared";

export async function vendorAgentRoutes(server: FastifyInstance) {
  // List vendor agents
  server.get("/", async (request) => {
    const tenantId = request.tenantId ?? "default";
    const list = await server.vendorAgentService.list(tenantId);
    return { data: list, error: null };
  });

  // Stats
  server.get("/stats", async (request) => {
    const tenantId = request.tenantId ?? "default";
    const stats = await server.vendorAgentService.getStats(tenantId);
    return { data: stats, error: null };
  });

  // Register vendor agent
  server.post<{ Body: CreateVendorAgentRequest }>("/", async (request) => {
    const tenantId = request.tenantId ?? "default";
    const result = await server.vendorAgentService.create(tenantId, request.body);
    return { data: result, error: null };
  });

  // Get vendor agent — tenant-scoped
  server.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const tenantId = request.tenantId ?? "default";
    const result = await server.vendorAgentService.get(request.params.id, tenantId);
    if (!result) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.VENDOR_AGENT_NOT_FOUND, message: "Vendor agent not found" },
      });
    }
    return { data: result, error: null };
  });

  // Update vendor agent — tenant-scoped
  server.patch<{ Params: { id: string }; Body: UpdateVendorAgentRequest }>("/:id", async (request, reply) => {
    const tenantId = request.tenantId ?? "default";
    const result = await server.vendorAgentService.update(request.params.id, request.body, tenantId);
    if (!result) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.VENDOR_AGENT_NOT_FOUND, message: "Vendor agent not found" },
      });
    }
    return { data: result, error: null };
  });

  // Delete vendor agent — tenant-scoped
  server.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const tenantId = request.tenantId ?? "default";
    const deleted = await server.vendorAgentService.remove(request.params.id, tenantId);
    if (!deleted) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.VENDOR_AGENT_NOT_FOUND, message: "Vendor agent not found" },
      });
    }
    return { data: { deleted: true }, error: null };
  });

  // Run assessment — tenant-scoped
  server.post<{ Params: { id: string }; Body: CreateAssessmentRequest }>("/:id/assess", async (request, reply) => {
    const tenantId = request.tenantId ?? "default";
    const assessorId = request.ssoSession?.userId ?? request.apiKey?.ownerId ?? "system";
    const result = await server.vendorAgentService.assess(request.params.id, tenantId, assessorId, request.body);
    if (!result) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.VENDOR_AGENT_NOT_FOUND, message: "Vendor agent not found" },
      });
    }
    return { data: result, error: null };
  });

  // Get assessments — tenant-scoped
  server.get<{ Params: { id: string } }>("/:id/assessments", async (request) => {
    const tenantId = request.tenantId ?? "default";
    const list = await server.vendorAgentService.getAssessments(request.params.id, tenantId);
    return { data: list, error: null };
  });
}
