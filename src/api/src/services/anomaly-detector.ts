import { eq, sql, desc, gte, and, count as drizzleCount } from "drizzle-orm";
import type { Database } from "../db/index.js";
import { schema } from "../db/index.js";
import type {
  Anomaly,
  AnomalyType,
  AnomalySeverity,
  AgentBehaviorProfile,
} from "@agentgate/shared";

export class AnomalyDetector {
  constructor(private db: Database) {}

  /**
   * Main entry point — called after every authorization decision.
   * Analyzes the request against the agent's behavior profile and returns detected anomalies.
   */
  async analyzeRequest(
    agentId: string,
    action: string,
    resource: string,
    decision: string,
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    const profile = await this.getProfile(agentId);

    // 1. Burst activity detection
    const burstAnomaly = await this.checkBurstActivity(agentId, profile);
    if (burstAnomaly) anomalies.push(burstAnomaly);

    // 2. High deny rate detection
    const denyRateAnomaly = await this.checkHighDenyRate(agentId, profile);
    if (denyRateAnomaly) anomalies.push(denyRateAnomaly);

    // 3. Unusual action detection
    const actionAnomaly = await this.checkUnusualAction(
      agentId,
      action,
      profile,
    );
    if (actionAnomaly) anomalies.push(actionAnomaly);

    // 4. Unusual resource detection
    const resourceAnomaly = this.checkUnusualResource(
      agentId,
      resource,
      profile,
    );
    if (resourceAnomaly) anomalies.push(resourceAnomaly);

    // 5. Unusual time detection
    const timeAnomaly = this.checkUnusualTime(agentId, profile);
    if (timeAnomaly) anomalies.push(timeAnomaly);

    // 6. Permission escalation detection
    if (decision === "deny") {
      const escalationAnomaly = await this.checkPermissionEscalation(agentId);
      if (escalationAnomaly) anomalies.push(escalationAnomaly);
    }

    return anomalies;
  }

  /**
   * Look up the agent's behavior profile from the agentProfiles table.
   */
  async getProfile(agentId: string): Promise<AgentBehaviorProfile | null> {
    const [row] = await this.db
      .select()
      .from(schema.agentProfiles)
      .where(eq(schema.agentProfiles.agentId, agentId))
      .limit(1);

    if (!row) return null;

    return {
      agentId: row.agentId,
      commonActions: row.commonActions ?? [],
      commonResources: row.commonResources ?? [],
      activeHours: row.activeHours ?? [],
      avgRequestsPerHour: row.avgRequestsPerHour ?? 0,
      avgDenyRate: row.avgDenyRate ?? 0,
      lastUpdated:
        row.lastUpdated?.toISOString() ?? new Date().toISOString(),
    };
  }

  /**
   * Rebuild the agent's behavior profile from audit_logs.
   */
  async updateProfile(agentId: string): Promise<void> {
    // Get the last 1000 entries for this agent
    const entries = await this.db
      .select()
      .from(schema.auditLogs)
      .where(eq(schema.auditLogs.agentId, agentId))
      .orderBy(desc(schema.auditLogs.timestamp))
      .limit(1000);

    if (entries.length === 0) return;

    // commonActions: top 10 most frequent actions
    const actionCounts = new Map<string, number>();
    for (const entry of entries) {
      actionCounts.set(entry.action, (actionCounts.get(entry.action) ?? 0) + 1);
    }
    const commonActions = [...actionCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([action]) => action);

    // commonResources: top 10 most frequent resource prefixes
    const resourceCounts = new Map<string, number>();
    for (const entry of entries) {
      // Extract prefix: take the first two segments of the resource path
      const parts = entry.resource.split("/").filter(Boolean);
      const prefix = "/" + parts.slice(0, Math.min(2, parts.length)).join("/");
      resourceCounts.set(prefix, (resourceCounts.get(prefix) ?? 0) + 1);
    }
    const commonResources = [...resourceCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([resource]) => resource);

    // activeHours: hours with > 5% of total activity
    const hourCounts = new Map<number, number>();
    for (const entry of entries) {
      if (entry.timestamp) {
        const hour = entry.timestamp.getUTCHours();
        hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
      }
    }
    const threshold = entries.length * 0.05;
    const activeHours = [...hourCounts.entries()]
      .filter(([, count]) => count > threshold)
      .map(([hour]) => hour)
      .sort((a, b) => a - b);

    // avgRequestsPerHour: total requests / hours since first request
    const timestamps = entries
      .map((e) => e.timestamp)
      .filter((t): t is Date => t !== null);
    let avgRequestsPerHour = 0;
    if (timestamps.length > 1) {
      const earliest = timestamps[timestamps.length - 1]!.getTime();
      const latest = timestamps[0]!.getTime();
      const hourSpan = Math.max((latest - earliest) / (1000 * 60 * 60), 1);
      avgRequestsPerHour = entries.length / hourSpan;
    }

    // avgDenyRate: deny count / total count
    const denyCount = entries.filter((e) => e.decision === "deny").length;
    const avgDenyRate = entries.length > 0 ? denyCount / entries.length : 0;

    // Upsert into agentProfiles table
    await this.db
      .insert(schema.agentProfiles)
      .values({
        agentId,
        commonActions,
        commonResources,
        activeHours,
        avgRequestsPerHour,
        avgDenyRate,
        lastUpdated: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.agentProfiles.agentId,
        set: {
          commonActions,
          commonResources,
          activeHours,
          avgRequestsPerHour,
          avgDenyRate,
          lastUpdated: new Date(),
        },
      });
  }

  /**
   * Determine the recommended action based on anomaly severity and type.
   */
  async getRecommendedAction(
    anomaly: Anomaly,
  ): Promise<"monitor" | "throttle" | "suspend" | "notify"> {
    if (anomaly.severity === "critical") return "suspend";

    if (anomaly.type === "permission_escalation") return "notify";

    if (anomaly.severity === "high") {
      if (anomaly.type === "burst_activity") return "throttle";
      return "throttle";
    }

    if (anomaly.severity === "medium") return "notify";

    return "monitor";
  }

  /**
   * Insert an anomaly into the database.
   */
  async saveAnomaly(anomaly: Omit<Anomaly, "id">): Promise<Anomaly> {
    const id = crypto.randomUUID();
    const full: Anomaly = { id, ...anomaly };

    await this.db.insert(schema.anomalies).values({
      id: full.id,
      agentId: full.agentId,
      type: full.type,
      severity: full.severity,
      description: full.description,
      details: full.details,
      detectedAt: new Date(full.detectedAt),
      resolved: full.resolved,
    });

    return full;
  }

  // ─── Private check methods ──────────────────────────────────────

  private async checkBurstActivity(
    agentId: string,
    profile: AgentBehaviorProfile | null,
  ): Promise<Anomaly | null> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const [result] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.auditLogs)
      .where(
        and(
          eq(schema.auditLogs.agentId, agentId),
          gte(schema.auditLogs.timestamp, fiveMinutesAgo),
        ),
      );

    const recentCount = result?.count ?? 0;

    // 5 minutes = 1/12 of an hour. Threshold is 5x the expected rate per 5 minutes.
    const avgPer5Min = profile ? profile.avgRequestsPerHour / 12 : 10;
    const threshold = Math.max(avgPer5Min * 5, 10); // minimum threshold of 10

    if (recentCount > threshold) {
      return this.buildAnomaly(agentId, "burst_activity", "high", {
        description: `Agent made ${recentCount} requests in 5 minutes (threshold: ${Math.round(threshold)})`,
        recentCount,
        threshold: Math.round(threshold),
        avgRequestsPerHour: profile?.avgRequestsPerHour ?? 0,
      });
    }

    return null;
  }

  private async checkHighDenyRate(
    agentId: string,
    profile: AgentBehaviorProfile | null,
  ): Promise<Anomaly | null> {
    const lastDecisions = await this.db
      .select({ decision: schema.auditLogs.decision })
      .from(schema.auditLogs)
      .where(eq(schema.auditLogs.agentId, agentId))
      .orderBy(desc(schema.auditLogs.timestamp))
      .limit(20);

    if (lastDecisions.length < 5) return null; // not enough data

    const denyCount = lastDecisions.filter((d) => d.decision === "deny").length;
    const denyRate = denyCount / lastDecisions.length;
    const baselineDenyRate = profile?.avgDenyRate ?? 0;

    if (denyRate > 0.5 && baselineDenyRate < 0.2) {
      return this.buildAnomaly(agentId, "high_deny_rate", "medium", {
        description: `Deny rate ${(denyRate * 100).toFixed(0)}% over last ${lastDecisions.length} decisions (baseline: ${(baselineDenyRate * 100).toFixed(0)}%)`,
        currentDenyRate: denyRate,
        baselineDenyRate,
        sampleSize: lastDecisions.length,
      });
    }

    return null;
  }

  private async checkUnusualAction(
    agentId: string,
    action: string,
    profile: AgentBehaviorProfile | null,
  ): Promise<Anomaly | null> {
    if (!profile) return null;

    if (!profile.commonActions.includes(action)) {
      // Determine severity: check how long the agent has been active
      const [firstEntry] = await this.db
        .select({ timestamp: schema.auditLogs.timestamp })
        .from(schema.auditLogs)
        .where(eq(schema.auditLogs.agentId, agentId))
        .orderBy(schema.auditLogs.timestamp)
        .limit(1);

      const hoursActive = firstEntry?.timestamp
        ? (Date.now() - firstEntry.timestamp.getTime()) / (1000 * 60 * 60)
        : 0;

      const severity: AnomalySeverity = hoursActive > 24 ? "medium" : "low";

      return this.buildAnomaly(agentId, "unusual_action", severity, {
        description: `Action "${action}" is not in the agent's common actions`,
        action,
        commonActions: profile.commonActions,
        hoursActive: Math.round(hoursActive),
      });
    }

    return null;
  }

  private checkUnusualResource(
    agentId: string,
    resource: string,
    profile: AgentBehaviorProfile | null,
  ): Anomaly | null {
    if (!profile || profile.commonResources.length === 0) return null;

    const matchesKnownPattern = profile.commonResources.some((prefix) =>
      resource.startsWith(prefix),
    );

    if (!matchesKnownPattern) {
      return this.buildAnomaly(agentId, "unusual_resource", "low", {
        description: `Resource "${resource}" does not match any known resource patterns`,
        resource,
        commonResources: profile.commonResources,
      });
    }

    return null;
  }

  private checkUnusualTime(
    agentId: string,
    profile: AgentBehaviorProfile | null,
  ): Anomaly | null {
    if (!profile || profile.activeHours.length === 0) return null;

    const currentHour = new Date().getUTCHours();

    if (!profile.activeHours.includes(currentHour)) {
      return this.buildAnomaly(agentId, "unusual_time", "low", {
        description: `Request at UTC hour ${currentHour} is outside the agent's typical active hours`,
        currentHour,
        activeHours: profile.activeHours,
      });
    }

    return null;
  }

  private async checkPermissionEscalation(
    agentId: string,
  ): Promise<Anomaly | null> {
    // Check last 100 decisions (excluding the current one which just got denied)
    const lastDecisions = await this.db
      .select({ decision: schema.auditLogs.decision })
      .from(schema.auditLogs)
      .where(eq(schema.auditLogs.agentId, agentId))
      .orderBy(desc(schema.auditLogs.timestamp))
      .limit(100);

    // Skip the most recent entry (the one that was just denied)
    const previousDecisions = lastDecisions.slice(1);

    if (previousDecisions.length === 0) return null;

    const hadPreviousDenies = previousDecisions.some(
      (d) => d.decision === "deny",
    );

    if (!hadPreviousDenies) {
      return this.buildAnomaly(
        agentId,
        "permission_escalation",
        "high",
        {
          description:
            "Agent was denied for the first time after a clean history of allowed requests",
          previousDecisionCount: previousDecisions.length,
        },
      );
    }

    return null;
  }

  private buildAnomaly(
    agentId: string,
    type: AnomalyType,
    severity: AnomalySeverity,
    details: Record<string, unknown> & { description: string },
  ): Anomaly {
    return {
      id: "", // will be set by saveAnomaly
      agentId,
      type,
      severity,
      description: details.description,
      details,
      detectedAt: new Date().toISOString(),
      resolved: false,
    };
  }
}
