import { eq, and } from "drizzle-orm";
import type { Database } from "../db/index.js";
import {
  policySuggestions,
  regulatoryUpdates,
  policies,
} from "../db/schema.js";
import { FRAMEWORK_DEFS } from "./compliance.js";
import type { SuggestedPolicyChange, PolicySuggestionStatus } from "@agentgate/shared";

// ─── Evaluator → Keywords Map ───────────────────────────────────

const EVALUATOR_KEYWORDS: Record<string, string[]> = {
  has_agents: ["agent", "identity", "register", "registration"],
  has_policies: ["policy", "access", "control", "permission", "authorization", "restrict"],
  has_audit_logs: ["audit", "log", "logging", "record", "trail", "monitor"],
  has_anomaly_detection: ["anomaly", "detection", "behavior", "risk", "monitor", "alert"],
  has_a2a_channels: ["a2a", "channel", "communication", "agent-to-agent", "inter-agent"],
  has_api_keys: ["api key", "authentication", "key", "credential", "token"],
  manual_review: ["review", "manual", "assessment", "procedure", "documentation"],
  always_passing: ["encryption", "tls", "cryptography"],
};

// ─── Policy Suggestion Service ──────────────────────────────────

export class PolicySuggestionService {
  constructor(private db: Database) {}

  async generateSuggestionsForUpdate(tenantId: string, updateId: string) {
    const [update] = await this.db
      .select()
      .from(regulatoryUpdates)
      .where(eq(regulatoryUpdates.id, updateId))
      .limit(1);

    if (!update) throw new Error("Regulatory update not found");

    // Delete any existing suggestions for this update
    await this.db
      .delete(policySuggestions)
      .where(
        and(
          eq(policySuggestions.regulatoryUpdateId, updateId),
          eq(policySuggestions.tenantId, tenantId),
        ),
      );

    const affectedControls = (update.affectedControls as string[]) ?? [];
    const frameworkId = update.frameworkId;

    // Map affected controls to evaluator types
    const evaluators = this.getEvaluatorsForControls(affectedControls, frameworkId);

    // Find related policies (scoped to tenant)
    const relatedPolicies = await this.findRelatedPolicies(tenantId, evaluators);

    const suggestions = [];

    if (relatedPolicies.length === 0) {
      // No matching policies — suggest creating a new one
      const suggestion = await this.createSuggestion(tenantId, updateId, {
        policyId: null,
        policyName: `Compliance: ${update.title.slice(0, 60)}`,
        suggestionType: "create",
        description: `No existing policies cover the affected controls. Create a new compliance policy to address: ${affectedControls.join(", ")}`,
        suggestedChanges: {
          newPolicy: {
            name: `Compliance: ${update.title.slice(0, 60)}`,
            description: `Auto-suggested policy for regulatory update: ${update.title}`,
            rules: [{
              name: "Escalate high-risk agents",
              effect: "escalate",
              priority: 1,
              conditions: [
                { field: "agent.riskLevel", operator: "in", value: ["high", "critical"] },
              ],
            }],
            targets: {
              resources: ["*"],
              actions: ["*"],
            },
          },
        },
        impactLevel: update.impactLevel,
      });
      suggestions.push(suggestion);
    } else {
      for (const match of relatedPolicies) {
        const suggestion = await this.generateSuggestion(
          tenantId,
          updateId,
          match.policy,
          update,
          evaluators,
        );
        suggestions.push(suggestion);
      }
    }

    return { updateId, generated: suggestions.length, suggestions };
  }

  async getSuggestions(tenantId: string, updateId: string, status?: string) {
    const conditions = [
      eq(policySuggestions.regulatoryUpdateId, updateId),
      eq(policySuggestions.tenantId, tenantId),
    ];
    if (status) {
      const validStatuses = ["pending", "approved", "rejected", "applied"];
      if (!validStatuses.includes(status)) return [];
      conditions.push(eq(policySuggestions.status, status as any));
    }

    const rows = await this.db
      .select()
      .from(policySuggestions)
      .where(and(...conditions));

    return rows.map((r) => this.formatSuggestion(r));
  }

  async reviewSuggestion(tenantId: string, id: string, status: "approved" | "rejected", reviewedBy: string) {
    const [existing] = await this.db
      .select()
      .from(policySuggestions)
      .where(
        and(
          eq(policySuggestions.id, id),
          eq(policySuggestions.tenantId, tenantId),
        ),
      )
      .limit(1);

    if (!existing) return null;

    await this.db
      .update(policySuggestions)
      .set({
        status,
        reviewedBy,
        reviewedAt: new Date(),
      })
      .where(eq(policySuggestions.id, id));

    return { id, status, reviewedBy };
  }

  async applySuggestion(tenantId: string, id: string) {
    const [suggestion] = await this.db
      .select()
      .from(policySuggestions)
      .where(
        and(
          eq(policySuggestions.id, id),
          eq(policySuggestions.tenantId, tenantId),
        ),
      )
      .limit(1);

    if (!suggestion) throw new Error("Suggestion not found");
    if (suggestion.status !== "approved") throw new Error("Suggestion must be approved before applying");
    if (suggestion.appliedPolicyVersion) throw new Error("Suggestion already applied");

    const changes = suggestion.suggestedChanges as SuggestedPolicyChange;
    let appliedVersion = 1;

    if (suggestion.policyId && !changes.newPolicy) {
      // Modify existing policy — increment version
      const [policy] = await this.db
        .select()
        .from(policies)
        .where(eq(policies.id, suggestion.policyId))
        .limit(1);

      if (policy) {
        const newVersion = policy.version + 1;
        const currentRules = policy.rules as any[];

        let updatedRules = [...currentRules];
        if (changes.rulesToAdd) {
          for (const rule of changes.rulesToAdd) {
            updatedRules.push({
              id: crypto.randomUUID(),
              ...rule,
            });
          }
        }
        if (changes.rulesToRemove) {
          updatedRules = updatedRules.filter((r) => !changes.rulesToRemove!.includes(r.id));
        }

        await this.db
          .update(policies)
          .set({
            version: newVersion,
            rules: updatedRules,
            updatedAt: new Date(),
          })
          .where(eq(policies.id, suggestion.policyId));

        appliedVersion = newVersion;
      }
    } else if (changes.newPolicy) {
      // Create new policy
      const newId = crypto.randomUUID();
      await this.db.insert(policies).values({
        id: newId,
        name: changes.newPolicy.name,
        description: changes.newPolicy.description,
        version: 1,
        rules: changes.newPolicy.rules.map((r) => ({
          id: crypto.randomUUID(),
          ...r,
        })),
        targets: changes.newPolicy.targets,
        enabled: true,
        tenantId: suggestion.tenantId,
      });
      appliedVersion = 1;
    }

    await this.db
      .update(policySuggestions)
      .set({
        status: "applied",
        appliedPolicyVersion: appliedVersion,
      })
      .where(eq(policySuggestions.id, id));

    return { id, status: "applied", appliedPolicyVersion: appliedVersion };
  }

  // ─── Private helpers ───────────────────────────────────────────

  private getEvaluatorsForControls(controlCodes: string[], frameworkId: string): string[] {
    const def = FRAMEWORK_DEFS[frameworkId];
    if (!def) return [];

    const evaluators = new Set<string>();
    for (const code of controlCodes) {
      const ctrl = def.controls.find((c) => c.controlCode === code);
      if (ctrl) evaluators.add(ctrl.evaluator);
    }
    return [...evaluators];
  }

  private async findRelatedPolicies(tenantId: string, evaluators: string[]) {
    const allPolicies = await this.db
      .select()
      .from(policies)
      .where(eq(policies.tenantId, tenantId));

    const keywords = new Set<string>();
    for (const ev of evaluators) {
      const kw = EVALUATOR_KEYWORDS[ev];
      if (kw) kw.forEach((k) => keywords.add(k.toLowerCase()));
    }

    const matches: Array<{ policy: typeof allPolicies[number]; reasons: string[] }> = [];

    for (const policy of allPolicies) {
      const reasons: string[] = [];
      const searchText = [
        policy.name,
        policy.description,
        JSON.stringify(policy.targets),
        JSON.stringify(policy.rules),
      ].join(" ").toLowerCase();

      for (const kw of keywords) {
        if (searchText.includes(kw)) {
          reasons.push(`matches keyword "${kw}"`);
        }
      }

      if (reasons.length > 0) {
        matches.push({ policy, reasons });
      }
    }

    return matches;
  }

  private async generateSuggestion(
    tenantId: string,
    updateId: string,
    policy: any,
    update: any,
    evaluators: string[],
  ) {
    const impactLevel = update.impactLevel as string;
    const hasAccessEvaluators = evaluators.some((e) =>
      ["has_policies", "has_agents", "has_api_keys"].includes(e),
    );

    let suggestedChanges: SuggestedPolicyChange;
    let description: string;
    let suggestionType: "modify" | "create" | "review";

    if (impactLevel === "high" && hasAccessEvaluators) {
      // High impact + access-related: suggest escalation rules
      description = `Add escalation rules to "${policy.name}" for high-risk agents in response to: ${update.title}`;
      suggestionType = "modify";
      suggestedChanges = {
        rulesToAdd: [{
          name: `Compliance: Escalate high-risk (${update.frameworkId})`,
          effect: "escalate",
          priority: 0,
          conditions: [
            { field: "agent.riskLevel", operator: "in", value: ["high", "critical"] },
          ],
        }],
      };
    } else if (impactLevel === "medium") {
      // Medium impact: suggest adding monitoring conditions
      description = `Update "${policy.name}" to add monitoring conditions for compliance with: ${update.title}`;
      suggestionType = "modify";
      suggestedChanges = {
        rulesToAdd: [{
          name: `Compliance: Monitor (${update.frameworkId})`,
          effect: "escalate",
          priority: 5,
          conditions: [
            { field: "agent.riskLevel", operator: "equals", value: "critical" },
          ],
        }],
      };
    } else {
      // Low impact: review only
      description = `Review "${policy.name}" for alignment with: ${update.title}. No rule changes suggested.`;
      suggestionType = "review";
      suggestedChanges = {};
    }

    return this.createSuggestion(tenantId, updateId, {
      policyId: policy.id,
      policyName: policy.name,
      suggestionType,
      description,
      suggestedChanges,
      impactLevel,
    });
  }

  private async createSuggestion(
    tenantId: string,
    updateId: string,
    data: {
      policyId: string | null;
      policyName: string;
      suggestionType: string;
      description: string;
      suggestedChanges: SuggestedPolicyChange;
      impactLevel: string;
    },
  ) {
    const id = crypto.randomUUID();
    await this.db.insert(policySuggestions).values({
      id,
      regulatoryUpdateId: updateId,
      tenantId,
      policyId: data.policyId,
      policyName: data.policyName,
      suggestionType: data.suggestionType,
      description: data.description,
      suggestedChanges: data.suggestedChanges,
      impactLevel: data.impactLevel,
      status: "pending",
    });

    return {
      id,
      regulatoryUpdateId: updateId,
      policyId: data.policyId,
      policyName: data.policyName,
      suggestionType: data.suggestionType,
      description: data.description,
      suggestedChanges: data.suggestedChanges,
      impactLevel: data.impactLevel,
      status: "pending" as const,
      reviewedBy: null,
      reviewedAt: null,
      appliedPolicyVersion: null,
      createdAt: new Date().toISOString(),
    };
  }

  private formatSuggestion(row: any) {
    return {
      id: row.id,
      regulatoryUpdateId: row.regulatoryUpdateId,
      policyId: row.policyId,
      policyName: row.policyName,
      suggestionType: row.suggestionType,
      description: row.description,
      suggestedChanges: row.suggestedChanges,
      impactLevel: row.impactLevel,
      status: row.status,
      reviewedBy: row.reviewedBy,
      reviewedAt: row.reviewedAt?.toISOString?.() ?? row.reviewedAt,
      appliedPolicyVersion: row.appliedPolicyVersion,
      createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
    };
  }
}
