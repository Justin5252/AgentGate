import type { FastifyInstance } from "fastify";
import { ErrorCodes } from "@agentgate/shared";
import type { IntegrationType } from "@agentgate/shared";

export async function integrationRoutes(server: FastifyInstance) {
  // List configured integrations
  server.get("/", async (request) => {
    const tenantId = request.tenantId ?? "default";
    const list = await server.integrationService.listIntegrations(tenantId);
    return { data: list, error: null };
  });

  // Configure Vanta integration
  server.post<{
    Body: { apiKey: string; baseUrl?: string };
  }>("/vanta/configure", async (request, reply) => {
    const tenantId = request.tenantId ?? "default";
    const { apiKey, baseUrl } = request.body;

    // Validate API key
    if (!apiKey || typeof apiKey !== "string" || apiKey.length < 10 || apiKey.length > 500) {
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.VALIDATION_ERROR, message: "Invalid API key format" },
      });
    }

    // Validate baseUrl to prevent SSRF — only allow vanta.com domains
    if (baseUrl) {
      try {
        const u = new URL(baseUrl);
        if (u.protocol !== "https:" || (!u.hostname.endsWith(".vanta.com") && u.hostname !== "api.vanta.com")) {
          return reply.status(400).send({
            data: null,
            error: { code: ErrorCodes.VALIDATION_ERROR, message: "Base URL must be an HTTPS vanta.com domain" },
          });
        }
      } catch {
        return reply.status(400).send({
          data: null,
          error: { code: ErrorCodes.VALIDATION_ERROR, message: "Invalid base URL" },
        });
      }
    }

    const result = await server.integrationService.configure(tenantId, "vanta", { apiKey, baseUrl });
    return { data: result, error: null };
  });

  // Push compliance data to Vanta
  server.post("/vanta/push", async (request) => {
    const tenantId = request.tenantId ?? "default";
    const result = await server.integrationService.pushToVanta(tenantId);
    return { data: result, error: null };
  });

  // Pull from Vanta
  server.post("/vanta/sync", async (request) => {
    const tenantId = request.tenantId ?? "default";
    const result = await server.integrationService.syncFromVanta(tenantId);
    return { data: result, error: null };
  });

  // Get integration status
  server.get<{ Params: { type: string } }>("/:type/status", async (request, reply) => {
    const tenantId = request.tenantId ?? "default";
    const status = await server.integrationService.getStatus(tenantId, request.params.type as IntegrationType);
    if (!status) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.INTEGRATION_NOT_CONFIGURED, message: "Integration not configured" },
      });
    }
    return { data: status, error: null };
  });
}
