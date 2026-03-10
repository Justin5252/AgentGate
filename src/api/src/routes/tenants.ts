import type { FastifyInstance } from "fastify";
import { eq, and, sql, desc } from "drizzle-orm";
import { schema } from "../db/index.js";
import type {
  CreateTenantRequest,
  CreateUserRequest,
  Tenant,
  TenantUser,
  TenantPlan,
  UserRole,
  TenantUsage,
  ApiResponse,
} from "@agentgate/shared";
import { ErrorCodes } from "@agentgate/shared";

// ─── Plan limits ────────────────────────────────────────────────────

const PLAN_LIMITS: Record<TenantPlan, { agentLimit: number; evalLimitPerMonth: number }> = {
  free: { agentLimit: 5, evalLimitPerMonth: 10_000 },
  pro: { agentLimit: -1, evalLimitPerMonth: 1_000_000 },
  enterprise: { agentLimit: -1, evalLimitPerMonth: -1 },
};

// ─── Row mappers ────────────────────────────────────────────────────

function rowToTenant(row: typeof schema.tenants.$inferSelect): Tenant {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    plan: row.plan,
    agentLimit: row.agentLimit,
    evalLimitPerMonth: row.evalLimitPerMonth,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

function rowToUser(row: typeof schema.tenantUsers.$inferSelect): TenantUser {
  return {
    id: row.id,
    tenantId: row.tenantId,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
  };
}

// ─── Routes ─────────────────────────────────────────────────────────

export async function tenantRoutes(server: FastifyInstance) {
  // POST / — Create tenant
  server.post("/", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const body = request.body as CreateTenantRequest;

      if (!body.name || !body.slug) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: "Missing required fields: name, slug",
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(400).send(response);
      }

      // Check slug uniqueness
      const [existing] = await server.db
        .select()
        .from(schema.tenants)
        .where(eq(schema.tenants.slug, body.slug))
        .limit(1);

      if (existing) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.TENANT_SLUG_TAKEN,
            message: `Slug "${body.slug}" is already taken`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(409).send(response);
      }

      const plan: TenantPlan = body.plan ?? "free";
      const limits = PLAN_LIMITS[plan];
      const id = crypto.randomUUID();
      const now = new Date();

      const [inserted] = await server.db
        .insert(schema.tenants)
        .values({
          id,
          name: body.name,
          slug: body.slug,
          plan,
          agentLimit: limits.agentLimit,
          evalLimitPerMonth: limits.evalLimitPerMonth,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      const response: ApiResponse<Tenant> = {
        data: rowToTenant(inserted),
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
          message: "Failed to create tenant",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // GET / — List tenants
  server.get("/", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const rows = await server.db
        .select()
        .from(schema.tenants)
        .orderBy(desc(schema.tenants.createdAt));

      const response: ApiResponse<Tenant[]> = {
        data: rows.map(rowToTenant),
        error: null,
        meta: {
          total: rows.length,
          requestId,
          durationMs: performance.now() - start,
        },
      };
      return reply.send(response);
    } catch (err) {
      server.log.error(err);
      const response: ApiResponse<null> = {
        data: null,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: "Failed to list tenants",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // GET /:id — Get tenant by ID (includes usage stats)
  server.get("/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { id } = request.params as { id: string };

      const [row] = await server.db
        .select()
        .from(schema.tenants)
        .where(eq(schema.tenants.id, id))
        .limit(1);

      if (!row) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.TENANT_NOT_FOUND,
            message: `Tenant ${id} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      const usage = await server.usageTracker.getUsage(id);

      const response: ApiResponse<Tenant & { usage: TenantUsage }> = {
        data: { ...rowToTenant(row), usage },
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
          message: "Failed to get tenant",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // PATCH /:id — Update tenant
  server.patch("/:id", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { id } = request.params as { id: string };
      const body = request.body as Partial<{ name: string; plan: TenantPlan; agentLimit: number; evalLimitPerMonth: number }>;

      const [existing] = await server.db
        .select()
        .from(schema.tenants)
        .where(eq(schema.tenants.id, id))
        .limit(1);

      if (!existing) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.TENANT_NOT_FOUND,
            message: `Tenant ${id} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      const updateValues: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (body.name !== undefined) updateValues.name = body.name;
      if (body.plan !== undefined) {
        updateValues.plan = body.plan;
        // Auto-apply plan limits unless explicitly overridden
        const limits = PLAN_LIMITS[body.plan];
        if (body.agentLimit === undefined) updateValues.agentLimit = limits.agentLimit;
        if (body.evalLimitPerMonth === undefined) updateValues.evalLimitPerMonth = limits.evalLimitPerMonth;
      }
      if (body.agentLimit !== undefined) updateValues.agentLimit = body.agentLimit;
      if (body.evalLimitPerMonth !== undefined) updateValues.evalLimitPerMonth = body.evalLimitPerMonth;

      const [updated] = await server.db
        .update(schema.tenants)
        .set(updateValues)
        .where(eq(schema.tenants.id, id))
        .returning();

      const response: ApiResponse<Tenant> = {
        data: rowToTenant(updated),
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
          message: "Failed to update tenant",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // POST /:id/users — Add user to tenant
  server.post("/:id/users", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { id: tenantId } = request.params as { id: string };
      const body = request.body as CreateUserRequest;

      if (!body.email || !body.name) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: "Missing required fields: email, name",
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(400).send(response);
      }

      // Check tenant exists
      const [tenant] = await server.db
        .select()
        .from(schema.tenants)
        .where(eq(schema.tenants.id, tenantId))
        .limit(1);

      if (!tenant) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.TENANT_NOT_FOUND,
            message: `Tenant ${tenantId} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      // Check user doesn't already exist in this tenant
      const [existingUser] = await server.db
        .select()
        .from(schema.tenantUsers)
        .where(
          and(
            eq(schema.tenantUsers.tenantId, tenantId),
            eq(schema.tenantUsers.email, body.email),
          ),
        )
        .limit(1);

      if (existingUser) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.USER_ALREADY_EXISTS,
            message: `User with email "${body.email}" already exists in this tenant`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(409).send(response);
      }

      const id = crypto.randomUUID();
      const role: UserRole = body.role ?? "member";
      const now = new Date();

      const [inserted] = await server.db
        .insert(schema.tenantUsers)
        .values({
          id,
          tenantId,
          email: body.email,
          name: body.name,
          role,
          createdAt: now,
        })
        .returning();

      const response: ApiResponse<TenantUser> = {
        data: rowToUser(inserted),
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
          message: "Failed to add user to tenant",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // GET /:id/users — List tenant users
  server.get("/:id/users", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { id: tenantId } = request.params as { id: string };

      // Check tenant exists
      const [tenant] = await server.db
        .select()
        .from(schema.tenants)
        .where(eq(schema.tenants.id, tenantId))
        .limit(1);

      if (!tenant) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.TENANT_NOT_FOUND,
            message: `Tenant ${tenantId} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      const rows = await server.db
        .select()
        .from(schema.tenantUsers)
        .where(eq(schema.tenantUsers.tenantId, tenantId))
        .orderBy(desc(schema.tenantUsers.createdAt));

      const response: ApiResponse<TenantUser[]> = {
        data: rows.map(rowToUser),
        error: null,
        meta: {
          total: rows.length,
          requestId,
          durationMs: performance.now() - start,
        },
      };
      return reply.send(response);
    } catch (err) {
      server.log.error(err);
      const response: ApiResponse<null> = {
        data: null,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: "Failed to list tenant users",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // PATCH /:id/users/:userId — Update user role
  server.patch("/:id/users/:userId", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { id: tenantId, userId } = request.params as { id: string; userId: string };
      const body = request.body as { role: UserRole };

      if (!body.role) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: "Missing required field: role",
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(400).send(response);
      }

      const [existing] = await server.db
        .select()
        .from(schema.tenantUsers)
        .where(
          and(
            eq(schema.tenantUsers.id, userId),
            eq(schema.tenantUsers.tenantId, tenantId),
          ),
        )
        .limit(1);

      if (!existing) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.USER_NOT_FOUND,
            message: `User ${userId} not found in tenant ${tenantId}`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      const [updated] = await server.db
        .update(schema.tenantUsers)
        .set({ role: body.role })
        .where(eq(schema.tenantUsers.id, userId))
        .returning();

      const response: ApiResponse<TenantUser> = {
        data: rowToUser(updated),
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
          message: "Failed to update user role",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // DELETE /:id/users/:userId — Remove user from tenant
  server.delete("/:id/users/:userId", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { id: tenantId, userId } = request.params as { id: string; userId: string };

      const [existing] = await server.db
        .select()
        .from(schema.tenantUsers)
        .where(
          and(
            eq(schema.tenantUsers.id, userId),
            eq(schema.tenantUsers.tenantId, tenantId),
          ),
        )
        .limit(1);

      if (!existing) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.USER_NOT_FOUND,
            message: `User ${userId} not found in tenant ${tenantId}`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      await server.db
        .delete(schema.tenantUsers)
        .where(eq(schema.tenantUsers.id, userId));

      const response: ApiResponse<{ removed: true }> = {
        data: { removed: true },
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
          message: "Failed to remove user from tenant",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });

  // GET /:id/usage — Get tenant usage stats
  server.get("/:id/usage", async (request, reply) => {
    const start = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const { id: tenantId } = request.params as { id: string };

      // Check tenant exists
      const [tenant] = await server.db
        .select()
        .from(schema.tenants)
        .where(eq(schema.tenants.id, tenantId))
        .limit(1);

      if (!tenant) {
        const response: ApiResponse<null> = {
          data: null,
          error: {
            code: ErrorCodes.TENANT_NOT_FOUND,
            message: `Tenant ${tenantId} not found`,
          },
          meta: { requestId, durationMs: performance.now() - start },
        };
        return reply.status(404).send(response);
      }

      const usage = await server.usageTracker.getUsage(tenantId);

      const response: ApiResponse<TenantUsage> = {
        data: usage,
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
          message: "Failed to get tenant usage",
        },
        meta: { requestId, durationMs: performance.now() - start },
      };
      return reply.status(500).send(response);
    }
  });
}
