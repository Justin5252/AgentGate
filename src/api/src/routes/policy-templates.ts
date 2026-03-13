import type { FastifyInstance } from "fastify";
import type { ApiResponse } from "@agentgate/shared";
import { getTemplates, getTemplateById } from "../services/policy-templates.js";
import type { PolicyTemplate } from "../services/policy-templates.js";

export async function policyTemplateRoutes(server: FastifyInstance) {
  // GET / — List all policy templates
  server.get("/", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    const query = request.query as { category?: string };
    const templates = getTemplates(query.category);

    const response: ApiResponse<PolicyTemplate[]> = {
      data: templates,
      error: null,
      meta: { requestId, durationMs: performance.now() - start },
    };
    return reply.send(response);
  });

  // GET /:id — Get a single policy template
  server.get("/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    const { id } = request.params as { id: string };
    const template = getTemplateById(id);

    if (!template) {
      const response: ApiResponse<null> = {
        data: null,
        error: { code: "NOT_FOUND", message: `Template ${id} not found` },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(404).send(response);
    }

    const response: ApiResponse<PolicyTemplate> = {
      data: template,
      error: null,
      meta: { requestId, durationMs: performance.now() - start },
    };
    return reply.send(response);
  });
}
