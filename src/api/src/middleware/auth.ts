import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { schema } from "../db/index.js";
import { ErrorCodes } from "@agentgate/shared";

export type ApiKeyRecord = typeof schema.apiKeys.$inferSelect;

declare module "fastify" {
  interface FastifyRequest {
    apiKey?: ApiKeyRecord;
    tenantId?: string | null;
    ssoSession?: { userId: string; tenantId: string; sessionId: string };
    authMethod?: "api_key" | "sso_session" | "none";
  }
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export const authMiddleware = fp(async function authMiddlewarePlugin(server: FastifyInstance) {
  server.addHook(
    "onRequest",
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Skip auth for health endpoint and root page
      if (request.url === "/health" || request.url === "/") {
        return;
      }

      // Skip auth for Stripe webhooks (verified by signature instead)
      if (request.url === "/api/v1/billing/webhook" && request.method === "POST") {
        return;
      }

      // Skip auth for SSO auth endpoints (public) and SCIM endpoints (own auth)
      if (request.url.startsWith("/api/v1/auth/") || request.url.startsWith("/api/v1/scim/")) {
        request.authMethod = "none";
        return;
      }

      const authHeader = request.headers.authorization;
      const isDev = process.env.NODE_ENV !== "production";

      // In non-production mode, if no Authorization header is provided, allow through
      // WARNING: Ensure NODE_ENV=production in production deployments
      if (isDev && !authHeader) {
        request.authMethod = "none";
        return;
      }

      // If no auth header in non-dev mode, reject
      if (!authHeader) {
        return reply.status(401).send({
          error: {
            code: ErrorCodes.TOKEN_INVALID,
            message: "Invalid or revoked API key",
          },
        });
      }

      // Extract Bearer token
      const match = authHeader.match(/^Bearer\s+(.+)$/i);
      if (!match) {
        return reply.status(401).send({
          error: {
            code: ErrorCodes.TOKEN_INVALID,
            message: "Invalid or revoked API key",
          },
        });
      }

      const token = match[1];
      const keyHash = hashKey(token);

      // Try API key lookup first
      const [keyRecord] = await server.db
        .select()
        .from(schema.apiKeys)
        .where(eq(schema.apiKeys.keyHash, keyHash))
        .limit(1);

      if (keyRecord && !keyRecord.revoked) {
        // Authenticated via API key
        request.apiKey = keyRecord;
        request.tenantId = keyRecord.tenantId ?? null;
        request.authMethod = "api_key";

        // Update last_used_at fire-and-forget
        server.db
          .update(schema.apiKeys)
          .set({ lastUsedAt: new Date() })
          .where(eq(schema.apiKeys.id, keyRecord.id))
          .then(() => {})
          .catch((err) =>
            server.log.error(err, "Failed to update API key lastUsedAt"),
          );
        return;
      }

      // Try SSO session token
      if (server.ssoService) {
        const result = await server.ssoService.validateSession(token);
        if (result.valid && result.session) {
          request.ssoSession = {
            userId: result.session.userId,
            tenantId: result.session.tenantId,
            sessionId: result.session.id,
          };
          request.tenantId = result.session.tenantId;
          request.authMethod = "sso_session";
          return;
        }
      }

      return reply.status(401).send({
        error: {
          code: ErrorCodes.TOKEN_INVALID,
          message: "Invalid or revoked API key",
        },
      });
    },
  );
});
