import { eq, sql, and, gte, lte } from "drizzle-orm";
import type { Database } from "../db/index.js";
import { schema } from "../db/index.js";
import type { TenantUsage } from "@agentgate/shared";

export class UsageTracker {
  constructor(private db: Database) {}

  /**
   * Check whether the tenant can create another agent (agent count < limit).
   * A limit of -1 means unlimited.
   */
  async checkAgentLimit(
    tenantId: string,
  ): Promise<{ allowed: boolean; current: number; limit: number }> {
    const [tenant] = await this.db
      .select({
        agentLimit: schema.tenants.agentLimit,
      })
      .from(schema.tenants)
      .where(eq(schema.tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      return { allowed: false, current: 0, limit: 0 };
    }

    const [result] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.agents)
      .where(eq(schema.agents.tenantId, tenantId));

    const current = result?.count ?? 0;
    const limit = tenant.agentLimit;

    // -1 means unlimited
    const allowed = limit === -1 || current < limit;

    return { allowed, current, limit };
  }

  /**
   * Check whether the tenant can perform another eval (audit log entry) this month.
   * A limit of -1 means unlimited.
   */
  async checkEvalLimit(
    tenantId: string,
  ): Promise<{ allowed: boolean; current: number; limit: number }> {
    const [tenant] = await this.db
      .select({
        evalLimitPerMonth: schema.tenants.evalLimitPerMonth,
      })
      .from(schema.tenants)
      .where(eq(schema.tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      return { allowed: false, current: 0, limit: 0 };
    }

    const { periodStart, periodEnd } = this.getCurrentPeriod();

    // Count audit_logs for agents belonging to this tenant in the current month
    const [result] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.auditLogs)
      .innerJoin(schema.agents, eq(schema.auditLogs.agentId, schema.agents.id))
      .where(
        and(
          eq(schema.agents.tenantId, tenantId),
          gte(schema.auditLogs.timestamp, new Date(periodStart)),
          lte(schema.auditLogs.timestamp, new Date(periodEnd)),
        ),
      );

    const current = result?.count ?? 0;
    const limit = tenant.evalLimitPerMonth;

    // -1 means unlimited
    const allowed = limit === -1 || current < limit;

    return { allowed, current, limit };
  }

  /**
   * Return the full usage stats for a tenant.
   */
  async getUsage(tenantId: string): Promise<TenantUsage> {
    const [tenant] = await this.db
      .select({
        agentLimit: schema.tenants.agentLimit,
        evalLimitPerMonth: schema.tenants.evalLimitPerMonth,
      })
      .from(schema.tenants)
      .where(eq(schema.tenants.id, tenantId))
      .limit(1);

    const { periodStart, periodEnd } = this.getCurrentPeriod();

    // Agent count
    const [agentResult] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.agents)
      .where(eq(schema.agents.tenantId, tenantId));

    const agentCount = agentResult?.count ?? 0;

    // Eval count this month (audit_logs via agents)
    const [evalResult] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.auditLogs)
      .innerJoin(schema.agents, eq(schema.auditLogs.agentId, schema.agents.id))
      .where(
        and(
          eq(schema.agents.tenantId, tenantId),
          gte(schema.auditLogs.timestamp, new Date(periodStart)),
          lte(schema.auditLogs.timestamp, new Date(periodEnd)),
        ),
      );

    const evalCountThisMonth = evalResult?.count ?? 0;

    return {
      tenantId,
      agentCount,
      agentLimit: tenant?.agentLimit ?? 0,
      evalCountThisMonth,
      evalLimitPerMonth: tenant?.evalLimitPerMonth ?? 0,
      periodStart,
      periodEnd,
    };
  }

  /**
   * Placeholder for future caching optimization.
   * Called after each authorization to track eval usage.
   */
  async incrementEvalCount(_tenantId: string): Promise<void> {
    // Currently a no-op — eval count is computed from audit_logs.
    // In the future, this can update a Redis counter or a materialized count
    // to avoid scanning audit_logs on every check.
  }

  // ─── Helpers ────────────────────────────────────────────────────────

  private getCurrentPeriod(): { periodStart: string; periodEnd: string } {
    const now = new Date();
    const periodStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    ).toISOString();
    const periodEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999),
    ).toISOString();
    return { periodStart, periodEnd };
  }
}
