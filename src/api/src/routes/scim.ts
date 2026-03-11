import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { eq, and, like } from "drizzle-orm";
import { schema } from "../db/index.js";
import type { UserRole } from "@agentgate/shared";
import {
  SCIM_SCHEMAS,
  scimListResponse,
  scimError,
  toScimUser,
  toScimGroup,
  SERVICE_PROVIDER_CONFIG,
  RESOURCE_TYPES,
  SCHEMA_DEFINITIONS,
} from "../lib/scim-schemas.js";

// SCIM bearer token auth hook
async function scimAuth(
  server: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<{ tenantId: string; connectionId: string } | null> {
  const authHeader = request.headers.authorization;
  const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    reply.status(401).send(scimError(401, "Missing or invalid bearer token"));
    return null;
  }

  const result = await server.ssoService.validateScimToken(token);
  if (!result.valid || !result.tenantId || !result.connectionId) {
    reply.status(401).send(scimError(401, "Invalid SCIM token"));
    return null;
  }

  return { tenantId: result.tenantId, connectionId: result.connectionId };
}

export async function scimRoutes(server: FastifyInstance) {
  // All SCIM routes use the tenantSlug param
  // SCIM auth is handled per-route via preHandler

  // ─── Discovery Endpoints ─────────────────────────────────────────

  server.get("/ServiceProviderConfig", async (_request, reply) => {
    return reply.send(SERVICE_PROVIDER_CONFIG);
  });

  server.get("/Schemas", async (_request, reply) => {
    return reply.send(scimListResponse(SCHEMA_DEFINITIONS, SCHEMA_DEFINITIONS.length));
  });

  server.get("/ResourceTypes", async (_request, reply) => {
    return reply.send(scimListResponse(RESOURCE_TYPES, RESOURCE_TYPES.length));
  });

  // ─── Users ───────────────────────────────────────────────────────

  // GET /Users — List or filter users
  server.get("/Users", async (request, reply) => {
    const auth = await scimAuth(server, request, reply);
    if (!auth) return;

    const query = request.query as { filter?: string; startIndex?: string; count?: string };
    const startIndex = parseInt(query.startIndex ?? "1", 10);
    const count = parseInt(query.count ?? "100", 10);

    let users: (typeof schema.tenantUsers.$inferSelect)[];
    if (query.filter) {
      // Basic SCIM filter support: userName eq "email@example.com"
      const emailMatch = query.filter.match(/userName\s+eq\s+"([^"]+)"/);
      const externalIdMatch = query.filter.match(/externalId\s+eq\s+"([^"]+)"/);

      if (emailMatch) {
        users = await server.db
          .select()
          .from(schema.tenantUsers)
          .where(and(eq(schema.tenantUsers.tenantId, auth.tenantId), eq(schema.tenantUsers.email, emailMatch[1])))
          .limit(count);
      } else if (externalIdMatch) {
        users = await server.db
          .select()
          .from(schema.tenantUsers)
          .where(and(eq(schema.tenantUsers.tenantId, auth.tenantId), eq(schema.tenantUsers.externalId, externalIdMatch[1])))
          .limit(count);
      } else {
        users = [];
      }
    } else {
      users = await server.db
        .select()
        .from(schema.tenantUsers)
        .where(eq(schema.tenantUsers.tenantId, auth.tenantId))
        .limit(count)
        .offset(startIndex - 1);
    }

    const scimUsers = users.map((u) =>
      toScimUser({
        id: u.id,
        email: u.email,
        name: u.name,
        externalId: u.externalId,
        active: !u.deactivatedAt,
        role: u.role,
        createdAt: u.createdAt?.toISOString(),
      }),
    );

    return reply.send(scimListResponse(scimUsers, scimUsers.length, startIndex));
  });

  // POST /Users — Create user
  server.post("/Users", async (request, reply) => {
    const auth = await scimAuth(server, request, reply);
    if (!auth) return;

    const body = request.body as {
      schemas: string[];
      userName: string;
      externalId?: string;
      name?: { givenName?: string; familyName?: string };
      displayName?: string;
      emails?: { value: string; primary?: boolean }[];
      active?: boolean;
      roles?: { value: string }[];
    };

    const email = body.userName ?? body.emails?.[0]?.value;
    if (!email) {
      return reply.status(400).send(scimError(400, "userName (email) is required"));
    }

    const name = body.displayName ??
      [body.name?.givenName, body.name?.familyName].filter(Boolean).join(" ") ??
      email.split("@")[0];

    const role = (body.roles?.[0]?.value as UserRole) ?? "member";

    // Check if user exists
    const [existing] = await server.db
      .select()
      .from(schema.tenantUsers)
      .where(and(eq(schema.tenantUsers.tenantId, auth.tenantId), eq(schema.tenantUsers.email, email)))
      .limit(1);

    if (existing) {
      return reply.status(409).send(scimError(409, "User already exists", "uniqueness"));
    }

    const userId = crypto.randomUUID();
    const now = new Date();

    await server.db.insert(schema.tenantUsers).values({
      id: userId,
      tenantId: auth.tenantId,
      email,
      name,
      role,
      externalId: body.externalId ?? null,
      provisionedVia: "scim",
      createdAt: now,
    });

    await server.ssoService.logAudit(auth.tenantId, "scim_user_created", {
      details: { userId, email, externalId: body.externalId },
    });

    return reply.status(201).send(
      toScimUser({
        id: userId,
        email,
        name,
        externalId: body.externalId,
        active: true,
        role,
        createdAt: now.toISOString(),
      }),
    );
  });

  // GET /Users/:id — Get user
  server.get("/Users/:id", async (request, reply) => {
    const auth = await scimAuth(server, request, reply);
    if (!auth) return;

    const { id } = request.params as { id: string };

    const [user] = await server.db
      .select()
      .from(schema.tenantUsers)
      .where(and(eq(schema.tenantUsers.id, id), eq(schema.tenantUsers.tenantId, auth.tenantId)))
      .limit(1);

    if (!user) {
      return reply.status(404).send(scimError(404, "User not found"));
    }

    return reply.send(
      toScimUser({
        id: user.id,
        email: user.email,
        name: user.name,
        externalId: user.externalId,
        active: !user.deactivatedAt,
        role: user.role,
        createdAt: user.createdAt?.toISOString(),
      }),
    );
  });

  // PUT /Users/:id — Replace user
  server.put("/Users/:id", async (request, reply) => {
    const auth = await scimAuth(server, request, reply);
    if (!auth) return;

    const { id } = request.params as { id: string };
    const body = request.body as {
      userName?: string;
      externalId?: string;
      name?: { givenName?: string; familyName?: string };
      displayName?: string;
      active?: boolean;
      roles?: { value: string }[];
    };

    const [existing] = await server.db
      .select()
      .from(schema.tenantUsers)
      .where(and(eq(schema.tenantUsers.id, id), eq(schema.tenantUsers.tenantId, auth.tenantId)))
      .limit(1);

    if (!existing) {
      return reply.status(404).send(scimError(404, "User not found"));
    }

    const name = body.displayName ??
      [body.name?.givenName, body.name?.familyName].filter(Boolean).join(" ") ??
      existing.name;

    const updates: Record<string, unknown> = {
      name,
      externalId: body.externalId ?? existing.externalId,
    };

    if (body.active === false) {
      updates.deactivatedAt = new Date();
    } else if (body.active === true) {
      updates.deactivatedAt = null;
    }

    if (body.roles?.[0]?.value) {
      updates.role = body.roles[0].value;
    }

    const [updated] = await server.db
      .update(schema.tenantUsers)
      .set(updates)
      .where(eq(schema.tenantUsers.id, id))
      .returning();

    await server.ssoService.logAudit(auth.tenantId, "scim_user_updated", {
      details: { userId: id, changes: Object.keys(updates) },
    });

    return reply.send(
      toScimUser({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        externalId: updated.externalId,
        active: !updated.deactivatedAt,
        role: updated.role,
        createdAt: updated.createdAt?.toISOString(),
      }),
    );
  });

  // PATCH /Users/:id — Update user (SCIM Patch)
  server.patch("/Users/:id", async (request, reply) => {
    const auth = await scimAuth(server, request, reply);
    if (!auth) return;

    const { id } = request.params as { id: string };
    const body = request.body as {
      schemas: string[];
      Operations: Array<{ op: string; path?: string; value?: unknown }>;
    };

    const [existing] = await server.db
      .select()
      .from(schema.tenantUsers)
      .where(and(eq(schema.tenantUsers.id, id), eq(schema.tenantUsers.tenantId, auth.tenantId)))
      .limit(1);

    if (!existing) {
      return reply.status(404).send(scimError(404, "User not found"));
    }

    const updates: Record<string, unknown> = {};

    for (const op of body.Operations ?? []) {
      if (op.op === "replace" || op.op === "Replace") {
        if (op.path === "active") {
          if (op.value === false || op.value === "false") {
            updates.deactivatedAt = new Date();
          } else {
            updates.deactivatedAt = null;
          }
        } else if (op.path === "displayName" || op.path === "name.formatted") {
          updates.name = op.value;
        } else if (op.path === "externalId") {
          updates.externalId = op.value;
        } else if (op.path === "roles") {
          const roles = op.value as Array<{ value: string }>;
          if (roles?.[0]?.value) updates.role = roles[0].value;
        } else if (!op.path && typeof op.value === "object") {
          // Bulk replace
          const val = op.value as Record<string, unknown>;
          if (val.active === false) updates.deactivatedAt = new Date();
          if (val.active === true) updates.deactivatedAt = null;
          if (val.displayName) updates.name = val.displayName;
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      const [updated] = await server.db
        .update(schema.tenantUsers)
        .set(updates)
        .where(eq(schema.tenantUsers.id, id))
        .returning();

      if (updates.deactivatedAt) {
        await server.ssoService.logAudit(auth.tenantId, "scim_user_deactivated", {
          details: { userId: id },
        });
      } else {
        await server.ssoService.logAudit(auth.tenantId, "scim_user_updated", {
          details: { userId: id, changes: Object.keys(updates) },
        });
      }

      return reply.send(
        toScimUser({
          id: updated.id,
          email: updated.email,
          name: updated.name,
          externalId: updated.externalId,
          active: !updated.deactivatedAt,
          role: updated.role,
          createdAt: updated.createdAt?.toISOString(),
        }),
      );
    }

    // No changes, return existing
    return reply.send(
      toScimUser({
        id: existing.id,
        email: existing.email,
        name: existing.name,
        externalId: existing.externalId,
        active: !existing.deactivatedAt,
        role: existing.role,
        createdAt: existing.createdAt?.toISOString(),
      }),
    );
  });

  // DELETE /Users/:id — Deactivate user (soft delete)
  server.delete("/Users/:id", async (request, reply) => {
    const auth = await scimAuth(server, request, reply);
    if (!auth) return;

    const { id } = request.params as { id: string };

    const [existing] = await server.db
      .select()
      .from(schema.tenantUsers)
      .where(and(eq(schema.tenantUsers.id, id), eq(schema.tenantUsers.tenantId, auth.tenantId)))
      .limit(1);

    if (!existing) {
      return reply.status(404).send(scimError(404, "User not found"));
    }

    await server.db
      .update(schema.tenantUsers)
      .set({ deactivatedAt: new Date() })
      .where(eq(schema.tenantUsers.id, id));

    await server.ssoService.logAudit(auth.tenantId, "scim_user_deactivated", {
      details: { userId: id, email: existing.email },
    });

    return reply.status(204).send();
  });

  // ─── Groups ──────────────────────────────────────────────────────

  // GET /Groups — List groups
  server.get("/Groups", async (request, reply) => {
    const auth = await scimAuth(server, request, reply);
    if (!auth) return;

    const groups = await server.ssoService.listScimGroups(auth.tenantId);
    const scimGroups = groups.map((g) =>
      toScimGroup({
        id: g.id,
        externalGroupId: g.externalGroupId,
        displayName: g.displayName,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      }),
    );
    return reply.send(scimListResponse(scimGroups, scimGroups.length));
  });

  // POST /Groups — Create group
  server.post("/Groups", async (request, reply) => {
    const auth = await scimAuth(server, request, reply);
    if (!auth) return;

    const body = request.body as {
      schemas: string[];
      externalId?: string;
      displayName: string;
    };

    if (!body.displayName) {
      return reply.status(400).send(scimError(400, "displayName is required"));
    }

    const group = await server.ssoService.upsertScimGroup(
      auth.tenantId,
      auth.connectionId,
      body.externalId ?? body.displayName,
      body.displayName,
    );

    await server.ssoService.logAudit(auth.tenantId, "scim_group_created", {
      details: { groupId: group.id, displayName: body.displayName },
    });

    return reply.status(201).send(
      toScimGroup({
        id: group.id,
        externalGroupId: group.externalGroupId,
        displayName: group.displayName,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      }),
    );
  });

  // GET /Groups/:id — Get group
  server.get("/Groups/:id", async (request, reply) => {
    const auth = await scimAuth(server, request, reply);
    if (!auth) return;

    const { id } = request.params as { id: string };
    const group = await server.ssoService.getScimGroup(id);

    if (!group) {
      return reply.status(404).send(scimError(404, "Group not found"));
    }

    return reply.send(
      toScimGroup({
        id: group.id,
        externalGroupId: group.externalGroupId,
        displayName: group.displayName,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      }),
    );
  });

  // PUT /Groups/:id — Replace group
  server.put("/Groups/:id", async (request, reply) => {
    const auth = await scimAuth(server, request, reply);
    if (!auth) return;

    const { id } = request.params as { id: string };
    const body = request.body as { displayName: string; externalId?: string };

    const existing = await server.ssoService.getScimGroup(id);
    if (!existing) {
      return reply.status(404).send(scimError(404, "Group not found"));
    }

    const updated = await server.ssoService.upsertScimGroup(
      auth.tenantId,
      auth.connectionId,
      body.externalId ?? existing.externalGroupId,
      body.displayName,
    );

    await server.ssoService.logAudit(auth.tenantId, "scim_group_updated", {
      details: { groupId: id, displayName: body.displayName },
    });

    return reply.send(
      toScimGroup({
        id: updated.id,
        externalGroupId: updated.externalGroupId,
        displayName: updated.displayName,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      }),
    );
  });

  // PATCH /Groups/:id — Update group
  server.patch("/Groups/:id", async (request, reply) => {
    const auth = await scimAuth(server, request, reply);
    if (!auth) return;

    const { id } = request.params as { id: string };
    const existing = await server.ssoService.getScimGroup(id);

    if (!existing) {
      return reply.status(404).send(scimError(404, "Group not found"));
    }

    const body = request.body as {
      schemas: string[];
      Operations: Array<{ op: string; path?: string; value?: unknown }>;
    };

    let displayName = existing.displayName;
    for (const op of body.Operations ?? []) {
      if ((op.op === "replace" || op.op === "Replace") && op.path === "displayName") {
        displayName = op.value as string;
      }
    }

    const updated = await server.ssoService.upsertScimGroup(
      auth.tenantId,
      auth.connectionId,
      existing.externalGroupId,
      displayName,
    );

    await server.ssoService.logAudit(auth.tenantId, "scim_group_updated", {
      details: { groupId: id },
    });

    return reply.send(
      toScimGroup({
        id: updated.id,
        externalGroupId: updated.externalGroupId,
        displayName: updated.displayName,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      }),
    );
  });

  // DELETE /Groups/:id — Delete group
  server.delete("/Groups/:id", async (request, reply) => {
    const auth = await scimAuth(server, request, reply);
    if (!auth) return;

    const { id } = request.params as { id: string };
    const deleted = await server.ssoService.deleteScimGroup(id);

    if (!deleted) {
      return reply.status(404).send(scimError(404, "Group not found"));
    }

    await server.ssoService.logAudit(auth.tenantId, "scim_group_deleted", {
      details: { groupId: id },
    });

    return reply.status(204).send();
  });
}
