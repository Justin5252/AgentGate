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
  }
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export const authMiddleware = fp(async function authMiddlewarePlugin(server: FastifyInstance) {
  server.addHook(
    "onRequest",
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Skip auth for health endpoint
      if (request.url === "/health") {
        return;
      }

      const authHeader = request.headers.authorization;
      const isDev = process.env.NODE_ENV === "development";

      // In dev mode, if no Authorization header is provided, allow through
      if (isDev && !authHeader) {
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

      const apiKey = match[1];
      const keyHash = hashKey(apiKey);

      // Look up the key by hash
      const [keyRecord] = await server.db
        .select()
        .from(schema.apiKeys)
        .where(eq(schema.apiKeys.keyHash, keyHash))
        .limit(1);

      if (!keyRecord || keyRecord.revoked) {
        return reply.status(401).send({
          error: {
            code: ErrorCodes.TOKEN_INVALID,
            message: "Invalid or revoked API key",
          },
        });
      }

      // Attach key record to request
      request.apiKey = keyRecord;

      // Update last_used_at fire-and-forget
      server.db
        .update(schema.apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(schema.apiKeys.id, keyRecord.id))
        .then(() => {})
        .catch((err) =>
          server.log.error(err, "Failed to update API key lastUsedAt"),
        );
    },
  );
});
