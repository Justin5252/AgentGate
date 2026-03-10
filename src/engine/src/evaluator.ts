import type {
  AuthorizationRequest,
  AuthorizationDecision,
  Policy,
  PolicyCondition,
  PolicyEffect,
  PolicyRule,
} from "@agentgate/shared";
import { getNestedValue, globMatch } from "./utils.js";

interface MatchedRule {
  policyId: string;
  rule: PolicyRule;
}

/**
 * PolicyEvaluator — core engine that evaluates authorization requests
 * against a set of policies and returns allow/deny/escalate decisions.
 *
 * Stateless and pure: takes policies as input, produces decisions as output.
 */
export class PolicyEvaluator {
  /**
   * Evaluate an authorization request against a set of policies.
   *
   * 1. Filters policies to those targeting this agent/action/resource.
   * 2. Evaluates each matching policy's rules (highest priority first).
   * 3. Collects all matching rules, resolves conflicts (deny > escalate > allow).
   * 4. Returns a decision with timing information.
   */
  evaluate(
    request: AuthorizationRequest,
    policies: Policy[],
    agentTags?: string[],
  ): AuthorizationDecision {
    const startTime = performance.now();
    const evaluatedAt = new Date().toISOString();

    // Filter to enabled policies that target this request
    const applicablePolicies = policies.filter(
      (p) =>
        p.enabled &&
        this.matchesTarget(p, request.agentId, request.action, request.resource, agentTags),
    );

    // No applicable policies => default deny (secure by default)
    if (applicablePolicies.length === 0) {
      const durationMs = performance.now() - startTime;
      return {
        decision: "deny",
        policyId: null,
        ruleId: null,
        reason: "No applicable policies found — default deny",
        evaluatedAt,
        durationMs,
      };
    }

    const context = request.context ?? {};

    // Evaluate all rules across all applicable policies
    const matchedRules: MatchedRule[] = [];

    for (const policy of applicablePolicies) {
      // Sort rules by priority descending (highest priority first)
      const sortedRules = [...policy.rules].sort(
        (a, b) => b.priority - a.priority,
      );

      for (const rule of sortedRules) {
        // ALL conditions must be true for a rule to match
        const allConditionsMet =
          rule.conditions.length === 0 ||
          rule.conditions.every((condition) =>
            this.evaluateCondition(condition, context),
          );

        if (allConditionsMet) {
          matchedRules.push({ policyId: policy.id, rule });
        }
      }
    }

    // No rules matched in applicable policies => default deny
    if (matchedRules.length === 0) {
      const durationMs = performance.now() - startTime;
      return {
        decision: "deny",
        policyId: null,
        ruleId: null,
        reason: "No policy rules matched the request context — default deny",
        evaluatedAt,
        durationMs,
      };
    }

    // Conflict resolution: deny > escalate > allow
    const winner = this.resolveConflict(matchedRules);
    const durationMs = performance.now() - startTime;

    return {
      decision: winner.rule.effect,
      policyId: winner.policyId,
      ruleId: winner.rule.id,
      reason: `Matched rule "${winner.rule.name}" (effect: ${winner.rule.effect}, priority: ${winner.rule.priority})`,
      evaluatedAt,
      durationMs,
    };
  }

  /**
   * Evaluate a single condition against the request context.
   * The field uses dot notation to traverse the context object.
   */
  evaluateCondition(
    condition: PolicyCondition,
    context: Record<string, unknown>,
  ): boolean {
    const fieldValue = getNestedValue(context, condition.field);
    const condValue = condition.value;

    switch (condition.operator) {
      case "equals":
        return fieldValue === condValue;

      case "not_equals":
        return fieldValue !== condValue;

      case "contains": {
        if (typeof fieldValue === "string" && typeof condValue === "string") {
          return fieldValue.includes(condValue);
        }
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(condValue);
        }
        return false;
      }

      case "not_contains": {
        if (typeof fieldValue === "string" && typeof condValue === "string") {
          return !fieldValue.includes(condValue);
        }
        if (Array.isArray(fieldValue)) {
          return !fieldValue.includes(condValue);
        }
        return true;
      }

      case "in": {
        if (Array.isArray(condValue)) {
          return condValue.includes(fieldValue);
        }
        return false;
      }

      case "not_in": {
        if (Array.isArray(condValue)) {
          return !condValue.includes(fieldValue);
        }
        return true;
      }

      case "gt":
        return (
          typeof fieldValue === "number" &&
          typeof condValue === "number" &&
          fieldValue > condValue
        );

      case "lt":
        return (
          typeof fieldValue === "number" &&
          typeof condValue === "number" &&
          fieldValue < condValue
        );

      case "gte":
        return (
          typeof fieldValue === "number" &&
          typeof condValue === "number" &&
          fieldValue >= condValue
        );

      case "lte":
        return (
          typeof fieldValue === "number" &&
          typeof condValue === "number" &&
          fieldValue <= condValue
        );

      case "matches": {
        if (typeof fieldValue !== "string" || typeof condValue !== "string") {
          return false;
        }
        try {
          const regex = new RegExp(condValue);
          return regex.test(fieldValue);
        } catch {
          return false;
        }
      }

      default:
        return false;
    }
  }

  /**
   * Check if a policy's targets match the given agent, action, and resource.
   *
   * - If a target field is undefined/empty, it matches everything.
   * - agentIds: exact match on agentId.
   * - agentTags: any overlap between policy tags and agent tags.
   * - actions: glob match (supports "*" wildcard).
   * - resources: glob match (supports "*" wildcard).
   */
  matchesTarget(
    policy: Policy,
    agentId: string,
    action: string,
    resource: string,
    agentTags?: string[],
  ): boolean {
    const targets = policy.targets;

    // Check agent targeting (agentIds OR agentTags)
    const hasAgentIds = targets.agentIds && targets.agentIds.length > 0;
    const hasAgentTags = targets.agentTags && targets.agentTags.length > 0;

    if (hasAgentIds || hasAgentTags) {
      const matchesId = hasAgentIds && targets.agentIds!.includes(agentId);
      const matchesTags =
        hasAgentTags &&
        agentTags !== undefined &&
        agentTags.length > 0 &&
        targets.agentTags!.some((tag) => agentTags.includes(tag));

      if (!matchesId && !matchesTags) {
        return false;
      }
    }

    // Check action targeting
    if (targets.actions && targets.actions.length > 0) {
      const actionMatches = targets.actions.some((pattern) =>
        globMatch(pattern, action),
      );
      if (!actionMatches) {
        return false;
      }
    }

    // Check resource targeting
    if (targets.resources && targets.resources.length > 0) {
      const resourceMatches = targets.resources.some((pattern) =>
        globMatch(pattern, resource),
      );
      if (!resourceMatches) {
        return false;
      }
    }

    return true;
  }

  /**
   * Resolve conflicts among matched rules.
   * Priority: deny > escalate > allow.
   * Within the same effect, the highest-priority rule wins.
   */
  private resolveConflict(matchedRules: MatchedRule[]): MatchedRule {
    const effectRank: Record<PolicyEffect, number> = {
      deny: 3,
      escalate: 2,
      allow: 1,
    };

    // Sort by effect rank descending, then by priority descending
    const sorted = [...matchedRules].sort((a, b) => {
      const rankDiff = effectRank[b.rule.effect] - effectRank[a.rule.effect];
      if (rankDiff !== 0) return rankDiff;
      return b.rule.priority - a.rule.priority;
    });

    return sorted[0];
  }
}
