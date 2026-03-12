import { eq, and } from "drizzle-orm";
import type { Database } from "../db/index.js";
import {
  remediationRecommendations,
  complianceControls,
  complianceFrameworks,
} from "../db/schema.js";
import { FRAMEWORK_DEFS } from "./compliance.js";
import type { RemediationStep, RemediationStatus } from "@agentgate/shared";

// ─── Template Map ───────────────────────────────────────────────

interface TemplateRecommendation {
  summary: string;
  steps: RemediationStep[];
  estimatedEffort: "low" | "medium" | "high";
}

const REMEDIATION_TEMPLATES: Record<string, TemplateRecommendation> = {
  has_agents: {
    summary: "Register AI agents to establish identity management",
    steps: [
      { order: 1, title: "Navigate to Agents page", description: "Go to the Agents section in the AgentGate dashboard", actionType: "configure", actionTarget: "/agents", completed: false },
      { order: 2, title: "Create agent identity", description: "Click 'Register Agent' and provide name, description, and owner", actionType: "create", actionTarget: "agents", completed: false },
      { order: 3, title: "Set risk level", description: "Assign an appropriate risk level (low/medium/high/critical) based on the agent's capabilities", actionType: "configure", actionTarget: "agent.riskLevel", completed: false },
      { order: 4, title: "Define capabilities", description: "Specify the agent's permitted actions and resource scopes", actionType: "configure", actionTarget: "agent.capabilities", completed: false },
    ],
    estimatedEffort: "low",
  },
  has_policies: {
    summary: "Define access control policies to govern agent permissions",
    steps: [
      { order: 1, title: "Navigate to Policies page", description: "Go to the Policies section in the AgentGate dashboard", actionType: "configure", actionTarget: "/policies", completed: false },
      { order: 2, title: "Create deny/escalate rules", description: "Define rules that deny or escalate high-risk agent actions", actionType: "create", actionTarget: "policies", completed: false },
      { order: 3, title: "Set policy targets", description: "Configure which agents, resources, and actions the policy applies to", actionType: "configure", actionTarget: "policy.targets", completed: false },
      { order: 4, title: "Enable the policy", description: "Toggle the policy to enabled state so it takes effect on authorization requests", actionType: "configure", actionTarget: "policy.enabled", completed: false },
    ],
    estimatedEffort: "medium",
  },
  has_audit_logs: {
    summary: "Generate audit activity by routing agent requests through AgentGate",
    steps: [
      { order: 1, title: "Integrate SDK into agent code", description: "Install the AgentGate SDK and configure it with your API key", actionType: "configure", actionTarget: "sdk", completed: false },
      { order: 2, title: "Route authorization requests", description: "Ensure all agent actions call the /authorize endpoint before proceeding", actionType: "configure", actionTarget: "authorize", completed: false },
      { order: 3, title: "Verify audit entries", description: "Check the Audit Log page to confirm entries are being recorded", actionType: "review", actionTarget: "/audit", completed: false },
    ],
    estimatedEffort: "medium",
  },
  has_anomaly_detection: {
    summary: "Enable anomaly detection by building agent behavior profiles",
    steps: [
      { order: 1, title: "Generate baseline activity", description: "Ensure agents make at least 50 authorization requests to build behavior profiles", actionType: "manual", completed: false },
      { order: 2, title: "Verify behavior profiles", description: "Check that agent profiles show common actions, resources, and active hours", actionType: "review", actionTarget: "agent.profiles", completed: false },
      { order: 3, title: "Review anomaly detection", description: "Monitor the Anomalies page for detected behavioral deviations", actionType: "review", actionTarget: "/anomalies", completed: false },
    ],
    estimatedEffort: "medium",
  },
  has_a2a_channels: {
    summary: "Configure agent-to-agent communication channels",
    steps: [
      { order: 1, title: "Navigate to A2A page", description: "Go to the A2A Governance section in the dashboard", actionType: "configure", actionTarget: "/a2a", completed: false },
      { order: 2, title: "Define communication channels", description: "Create channels between agent pairs with allowed actions and data types", actionType: "create", actionTarget: "a2a.channels", completed: false },
      { order: 3, title: "Set rate limits", description: "Configure appropriate rate limits for each channel to prevent abuse", actionType: "configure", actionTarget: "channel.rateLimit", completed: false },
    ],
    estimatedEffort: "low",
  },
  has_api_keys: {
    summary: "Set up API key authentication for agent requests",
    steps: [
      { order: 1, title: "Navigate to Settings", description: "Go to the API Keys section in Settings", actionType: "configure", actionTarget: "/settings", completed: false },
      { order: 2, title: "Create API key", description: "Generate a new API key with appropriate scopes", actionType: "create", actionTarget: "apiKeys", completed: false },
      { order: 3, title: "Distribute securely", description: "Share the API key with agent operators through a secure channel", actionType: "manual", completed: false },
    ],
    estimatedEffort: "low",
  },
  manual_review: {
    summary: "Manual assessment required — document procedures and schedule review",
    steps: [
      { order: 1, title: "Document current procedures", description: "Write down existing processes and controls for this requirement", actionType: "manual", completed: false },
      { order: 2, title: "Schedule review meeting", description: "Set up a review meeting with the compliance team to assess the control", actionType: "manual", completed: false },
      { order: 3, title: "Collect supporting evidence", description: "Gather documentation, screenshots, and artifacts that demonstrate compliance", actionType: "manual", completed: false },
      { order: 4, title: "Submit evidence", description: "Upload collected evidence to the compliance evidence store", actionType: "create", actionTarget: "evidence", completed: false },
    ],
    estimatedEffort: "high",
  },
};

// ─── Remediation Service ────────────────────────────────────────

export class RemediationService {
  constructor(private db: Database) {}

  async getRecommendation(
    tenantId: string,
    controlId: string,
    frameworkId: string,
    forceRegenerate?: boolean,
  ) {
    if (!forceRegenerate) {
      const [existing] = await this.db
        .select()
        .from(remediationRecommendations)
        .where(
          and(
            eq(remediationRecommendations.controlId, controlId),
            eq(remediationRecommendations.frameworkId, frameworkId),
            eq(remediationRecommendations.tenantId, tenantId),
          ),
        )
        .limit(1);

      if (existing) {
        return this.formatRecommendation(existing);
      }
    }

    // Find control's evaluator type from framework defs
    const evaluator = this.getEvaluatorForControl(controlId, frameworkId);
    if (!evaluator) return null;

    const template = this.generateTemplateRecommendation(evaluator);
    if (!template) return null;

    // Delete old recommendation if regenerating
    if (forceRegenerate) {
      await this.db
        .delete(remediationRecommendations)
        .where(
          and(
            eq(remediationRecommendations.controlId, controlId),
            eq(remediationRecommendations.frameworkId, frameworkId),
            eq(remediationRecommendations.tenantId, tenantId),
          ),
        );
    }

    const id = crypto.randomUUID();
    const now = new Date();
    await this.db.insert(remediationRecommendations).values({
      id,
      controlId,
      frameworkId,
      tenantId,
      source: "template",
      summary: template.summary,
      steps: template.steps,
      estimatedEffort: template.estimatedEffort,
      status: "pending",
      evaluatorContext: { evaluator },
      createdAt: now,
      updatedAt: now,
    });

    return {
      id,
      controlId,
      frameworkId,
      source: "template" as const,
      summary: template.summary,
      steps: template.steps,
      estimatedEffort: template.estimatedEffort,
      status: "pending" as const,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  async generateFrameworkRecommendations(tenantId: string, frameworkId: string) {
    const [fw] = await this.db
      .select()
      .from(complianceFrameworks)
      .where(eq(complianceFrameworks.frameworkId, frameworkId))
      .limit(1);

    if (!fw) throw new Error(`Framework ${frameworkId} not initialized`);

    const controls = await this.db
      .select()
      .from(complianceControls)
      .where(eq(complianceControls.frameworkDbId, fw.id));

    const failingControls = controls.filter(
      (c) => c.status === "failing" || c.status === "warning",
    );

    const results = [];
    for (const ctrl of failingControls) {
      const rec = await this.getRecommendation(tenantId, ctrl.id, frameworkId);
      if (rec) results.push(rec);
    }

    return { frameworkId, generated: results.length, recommendations: results };
  }

  async listRecommendations(tenantId: string, frameworkId: string, status?: string) {
    const conditions = [
      eq(remediationRecommendations.frameworkId, frameworkId),
      eq(remediationRecommendations.tenantId, tenantId),
    ];
    if (status) {
      const validStatuses = ["pending", "in_progress", "completed", "dismissed"];
      if (!validStatuses.includes(status)) return [];
      conditions.push(eq(remediationRecommendations.status, status as any));
    }

    const rows = await this.db
      .select()
      .from(remediationRecommendations)
      .where(and(...conditions));

    return rows.map((r) => this.formatRecommendation(r));
  }

  async updateStatus(tenantId: string, id: string, status: RemediationStatus) {
    const [existing] = await this.db
      .select()
      .from(remediationRecommendations)
      .where(
        and(
          eq(remediationRecommendations.id, id),
          eq(remediationRecommendations.tenantId, tenantId),
        ),
      )
      .limit(1);

    if (!existing) return null;

    await this.db
      .update(remediationRecommendations)
      .set({ status, updatedAt: new Date() })
      .where(eq(remediationRecommendations.id, id));

    return { id, status };
  }

  // ─── Private helpers ───────────────────────────────────────────

  private getEvaluatorForControl(controlId: string, frameworkId: string): string | null {
    const def = FRAMEWORK_DEFS[frameworkId];
    if (!def) return null;

    // controlId might be a UUID from DB — we need to look up the controlCode
    // We'll check both controlCode match and fall through to DB lookup
    for (const ctrl of def.controls) {
      if (ctrl.controlCode === controlId) return ctrl.evaluator;
    }

    // If controlId is a UUID, we need the controlCode — caller should handle
    return null;
  }

  async getEvaluatorForControlFromDb(controlId: string, frameworkId: string): Promise<string | null> {
    const [ctrl] = await this.db
      .select()
      .from(complianceControls)
      .where(eq(complianceControls.id, controlId))
      .limit(1);

    if (!ctrl) return null;

    const def = FRAMEWORK_DEFS[frameworkId];
    if (!def) return null;

    const ctrlDef = def.controls.find((c) => c.controlCode === ctrl.controlCode);
    return ctrlDef?.evaluator ?? null;
  }

  private generateTemplateRecommendation(evaluator: string): TemplateRecommendation | null {
    return REMEDIATION_TEMPLATES[evaluator] ?? null;
  }

  private formatRecommendation(row: any) {
    return {
      id: row.id,
      controlId: row.controlId,
      frameworkId: row.frameworkId,
      source: row.source,
      summary: row.summary,
      steps: row.steps,
      estimatedEffort: row.estimatedEffort,
      status: row.status,
      createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
      updatedAt: row.updatedAt?.toISOString?.() ?? row.updatedAt,
    };
  }
}
