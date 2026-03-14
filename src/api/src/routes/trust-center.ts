import type { FastifyInstance } from "fastify";
import { ErrorCodes } from "@agentgate/shared";

export async function trustCenterRoutes(server: FastifyInstance) {
  // Public endpoint — no auth required
  server.get<{ Params: { slug: string } }>("/:slug", async (request, reply) => {
    const data = await server.trustCenterService.getPublicTrustCenter(request.params.slug);
    if (!data) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.TRUST_CENTER_NOT_FOUND, message: "Trust center not found or disabled" },
      });
    }
    return { data, error: null };
  });

  // Admin endpoints — require auth
  server.get("/config", async (request) => {
    const tenantId = request.tenantId ?? "default";
    const config = await server.trustCenterService.getConfig(tenantId);
    return { data: config, error: null };
  });

  server.put<{ Body: Record<string, unknown> }>("/config", async (request) => {
    const tenantId = request.tenantId ?? "default";
    const config = await server.trustCenterService.updateConfig(tenantId, request.body as any);
    return { data: config, error: null };
  });

  server.post("/config/enable", async (request) => {
    const tenantId = request.tenantId ?? "default";
    const config = await server.trustCenterService.setEnabled(tenantId, true);
    return { data: config, error: null };
  });

  server.post("/config/disable", async (request) => {
    const tenantId = request.tenantId ?? "default";
    const config = await server.trustCenterService.setEnabled(tenantId, false);
    return { data: config, error: null };
  });
}
