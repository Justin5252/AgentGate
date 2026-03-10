import type { FastifyInstance } from "fastify";
import { randomBytes, createHash } from "node:crypto";
import { eq, desc } from "drizzle-orm";
import { schema } from "../db/index.js";
import type { ApiResponse } from "@agentgate/shared";
import { ErrorCodes } from "@agentgate/shared";

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

interface CreateApiKeyBody {
  name: string;
  ownerId: string;
  scopes?: string[];
}

interface ApiKeyResponse {
  id: string;
  name: string;
  key?: string; // Only included on creation
  keyPrefix: string;
  scopes: string[];
  ownerId: string;
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
}

export async function apiKeyRoutes(server: FastifyInstance) {
  // POST / — Create a new API key
  server.post("/", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const body = request.body as CreateApiKeyBody;

      if (!body.name || !body.ownerId) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: "Missing required fields: name, ownerId",
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(400).send(response);
      }

      // Generate key: ag_live_ + 32 random hex chars
      const rawKey = `ag_live_${randomBytes(16).toString("hex")}`;
      const keyHash = hashKey(rawKey);
      const keyPrefix = rawKey.substring(0, 12);

      const id = crypto.randomUUID();
      const now = new Date();
      const scopes = body.scopes ?? ["*"];

      const [inserted] = await server.db
        .insert(schema.apiKeys)
        .values({
          id,
          name: body.name,
          keyHash,
          keyPrefix,
          scopes,
          ownerId: body.ownerId,
          createdAt: now,
          revoked: false,
        })
        .returning();

      const response: ApiResponse<ApiKeyResponse> = {
        data: {
          id: inserted.id,
          name: inserted.name,
          key: rawKey, // Only time the full key is shown
          keyPrefix: inserted.keyPrefix,
          scopes: inserted.scopes ?? ["*"],
          ownerId: inserted.ownerId,
          createdAt: inserted.createdAt?.toISOString() ?? now.toISOString(),
          lastUsedAt: null,
          revoked: inserted.revoked,
        },
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(201).send(response);
    } catch (err) {
      server.log.error(err);
      const response: ApiResponse<null> = {
        data: null,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: "Failed to create API key",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // GET / — List API keys (prefix only, never the full key)
  server.get("/", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const rows = await server.db
        .select()
        .from(schema.apiKeys)
        .orderBy(desc(schema.apiKeys.createdAt));

      const data: ApiKeyResponse[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        keyPrefix: row.keyPrefix,
        scopes: row.scopes ?? ["*"],
        ownerId: row.ownerId,
        createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
        lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
        revoked: row.revoked,
      }));

      const response: ApiResponse<ApiKeyResponse[]> = {
        data,
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.send(response);
    } catch (err) {
      server.log.error(err);
      const response: ApiResponse<null> = {
        data: null,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: "Failed to list API keys",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // DELETE /:id — Revoke an API key (soft delete)
  server.delete("/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { id } = request.params as { id: string };

      const [existing] = await server.db
        .select()
        .from(schema.apiKeys)
        .where(eq(schema.apiKeys.id, id))
        .limit(1);

      if (!existing) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: `API key ${id} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      await server.db
        .update(schema.apiKeys)
        .set({ revoked: true })
        .where(eq(schema.apiKeys.id, id));

      const response: ApiResponse<{ revoked: true }> = {
        data: { revoked: true },
        error: null,
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.send(response);
    } catch (err) {
      server.log.error(err);
      const response: ApiResponse<null> = {
        data: null,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: "Failed to revoke API key",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });
}
