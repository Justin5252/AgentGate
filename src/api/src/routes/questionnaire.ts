import type { FastifyInstance } from "fastify";
import { ErrorCodes } from "@agentgate/shared";
import type { QuestionnaireQuestion, QuestionnaireAnswer } from "@agentgate/shared";

export async function questionnaireRoutes(server: FastifyInstance) {
  // Generate answers for a questionnaire
  server.post<{
    Body: { title: string; questions: QuestionnaireQuestion[] };
  }>("/generate", async (request, reply) => {
    const tenantId = request.tenantId ?? "default";
    const { title, questions } = request.body;

    // Input validation
    if (!title || typeof title !== "string" || title.length > 200) {
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.VALIDATION_ERROR, message: "Title is required (max 200 chars)" },
      });
    }
    if (!Array.isArray(questions) || questions.length === 0 || questions.length > 100) {
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.VALIDATION_ERROR, message: "Questions array required (1-100 items)" },
      });
    }

    const result = await server.questionnaireService.generate(tenantId, title, questions);
    return { data: result, error: null };
  });

  // List past questionnaires
  server.get("/", async (request) => {
    const tenantId = request.tenantId ?? "default";
    const list = await server.questionnaireService.list(tenantId);
    return { data: list, error: null };
  });

  // Get specific questionnaire — tenant-scoped
  server.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const tenantId = request.tenantId ?? "default";
    const result = await server.questionnaireService.get(request.params.id, tenantId);
    if (!result) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.QUESTIONNAIRE_NOT_FOUND, message: "Questionnaire not found" },
      });
    }
    return { data: result, error: null };
  });

  // Update answers — tenant-scoped
  server.patch<{
    Params: { id: string };
    Body: { responses: QuestionnaireAnswer[] };
  }>("/:id", async (request, reply) => {
    const tenantId = request.tenantId ?? "default";
    const result = await server.questionnaireService.updateAnswers(request.params.id, tenantId, request.body.responses);
    if (!result) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.QUESTIONNAIRE_NOT_FOUND, message: "Questionnaire not found" },
      });
    }
    return { data: result, error: null };
  });

  // Export — tenant-scoped
  server.post<{ Params: { id: string } }>("/:id/export", async (request, reply) => {
    const tenantId = request.tenantId ?? "default";
    const result = await server.questionnaireService.exportQuestionnaire(request.params.id, tenantId);
    if (!result) {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.QUESTIONNAIRE_NOT_FOUND, message: "Questionnaire not found" },
      });
    }
    return { data: result, error: null };
  });
}
