import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import type {
  AuthorizationRequest,
  Policy,
  PolicyCondition,
} from "@agentgate/shared";
import { PolicyEvaluator } from "./evaluator.js";
import { getNestedValue, globMatch } from "./utils.js";

function makePolicy(overrides: Partial<Policy> & Pick<Policy, "id" | "rules" | "targets">): Policy {
  return {
    name: "Test Policy",
    description: "A test policy",
    version: 1,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeRequest(overrides?: Partial<AuthorizationRequest>): AuthorizationRequest {
  return {
    agentId: "agent-1",
    action: "read",
    resource: "documents/readme.md",
    ...overrides,
  };
}

describe("PolicyEvaluator", () => {
  const evaluator = new PolicyEvaluator();

  describe("evaluate()", () => {
    it("should allow when an allow policy matches", () => {
      const policy = makePolicy({
        id: "policy-1",
        targets: { agentIds: ["agent-1"], actions: ["read"], resources: ["documents/*"] },
        rules: [
          {
            id: "rule-1",
            name: "Allow read",
            effect: "allow",
            priority: 10,
            conditions: [],
          },
        ],
      });

      const decision = evaluator.evaluate(makeRequest(), [policy]);

      assert.equal(decision.decision, "allow");
      assert.equal(decision.policyId, "policy-1");
      assert.equal(decision.ruleId, "rule-1");
      assert.ok(decision.durationMs >= 0);
      assert.ok(decision.evaluatedAt);
    });

    it("should deny when a deny policy matches", () => {
      const policy = makePolicy({
        id: "policy-deny",
        targets: { agentIds: ["agent-1"], actions: ["*"], resources: ["*"] },
        rules: [
          {
            id: "rule-deny",
            name: "Deny all",
            effect: "deny",
            priority: 10,
            conditions: [],
          },
        ],
      });

      const decision = evaluator.evaluate(makeRequest(), [policy]);

      assert.equal(decision.decision, "deny");
      assert.equal(decision.policyId, "policy-deny");
      assert.equal(decision.ruleId, "rule-deny");
    });

    it("should default to deny when no policies match", () => {
      const decision = evaluator.evaluate(makeRequest(), []);

      assert.equal(decision.decision, "deny");
      assert.equal(decision.policyId, null);
      assert.equal(decision.ruleId, null);
      assert.ok(decision.reason.includes("default deny"));
    });

    it("should deny override allow (conflict resolution)", () => {
      const allowPolicy = makePolicy({
        id: "policy-allow",
        targets: { agentIds: ["agent-1"], actions: ["read"], resources: ["*"] },
        rules: [
          {
            id: "rule-allow",
            name: "Allow read",
            effect: "allow",
            priority: 100,
            conditions: [],
          },
        ],
      });

      const denyPolicy = makePolicy({
        id: "policy-deny",
        targets: { agentIds: ["agent-1"], actions: ["read"], resources: ["*"] },
        rules: [
          {
            id: "rule-deny",
            name: "Deny read",
            effect: "deny",
            priority: 1, // lower priority, but deny still wins
            conditions: [],
          },
        ],
      });

      const decision = evaluator.evaluate(makeRequest(), [allowPolicy, denyPolicy]);

      assert.equal(decision.decision, "deny");
      assert.equal(decision.policyId, "policy-deny");
      assert.equal(decision.ruleId, "rule-deny");
    });

    it("should escalate when configured", () => {
      const policy = makePolicy({
        id: "policy-esc",
        targets: { agentIds: ["agent-1"], actions: ["delete"], resources: ["*"] },
        rules: [
          {
            id: "rule-esc",
            name: "Escalate deletes",
            effect: "escalate",
            priority: 10,
            conditions: [],
          },
        ],
      });

      const request = makeRequest({ action: "delete", resource: "documents/important.doc" });
      const decision = evaluator.evaluate(request, [policy]);

      assert.equal(decision.decision, "escalate");
      assert.equal(decision.policyId, "policy-esc");
      assert.equal(decision.ruleId, "rule-esc");
    });

    it("should skip disabled policies", () => {
      const policy = makePolicy({
        id: "policy-disabled",
        enabled: false,
        targets: { agentIds: ["agent-1"], actions: ["*"], resources: ["*"] },
        rules: [
          {
            id: "rule-1",
            name: "Allow all",
            effect: "allow",
            priority: 10,
            conditions: [],
          },
        ],
      });

      const decision = evaluator.evaluate(makeRequest(), [policy]);

      assert.equal(decision.decision, "deny");
      assert.equal(decision.policyId, null);
    });

    it("should evaluate conditions from context", () => {
      const policy = makePolicy({
        id: "policy-cond",
        targets: { agentIds: ["agent-1"], actions: ["read"], resources: ["*"] },
        rules: [
          {
            id: "rule-cond",
            name: "Allow if env is production",
            effect: "allow",
            priority: 10,
            conditions: [
              { field: "environment", operator: "equals", value: "production" },
            ],
          },
        ],
      });

      // Should allow when condition matches
      const request1 = makeRequest({ context: { environment: "production" } });
      const decision1 = evaluator.evaluate(request1, [policy]);
      assert.equal(decision1.decision, "allow");

      // Should deny when condition doesn't match (no rules match -> default deny)
      const request2 = makeRequest({ context: { environment: "staging" } });
      const decision2 = evaluator.evaluate(request2, [policy]);
      assert.equal(decision2.decision, "deny");
      assert.equal(decision2.policyId, null);
    });

    it("should match policies by agentTags", () => {
      const policy = makePolicy({
        id: "policy-tags",
        targets: { agentTags: ["billing", "finance"], actions: ["read"], resources: ["*"] },
        rules: [
          {
            id: "rule-tags",
            name: "Allow billing agents",
            effect: "allow",
            priority: 10,
            conditions: [],
          },
        ],
      });

      // Agent with matching tag
      const decision1 = evaluator.evaluate(makeRequest(), [policy], ["billing"]);
      assert.equal(decision1.decision, "allow");

      // Agent without matching tag
      const decision2 = evaluator.evaluate(makeRequest(), [policy], ["engineering"]);
      assert.equal(decision2.decision, "deny");
      assert.equal(decision2.policyId, null);
    });

    it("should handle multiple policies with different priorities", () => {
      const lowPriorityAllow = makePolicy({
        id: "policy-low",
        targets: { agentIds: ["agent-1"], actions: ["read"], resources: ["*"] },
        rules: [
          {
            id: "rule-low",
            name: "Low priority allow",
            effect: "allow",
            priority: 1,
            conditions: [],
          },
        ],
      });

      const highPriorityAllow = makePolicy({
        id: "policy-high",
        targets: { agentIds: ["agent-1"], actions: ["read"], resources: ["*"] },
        rules: [
          {
            id: "rule-high",
            name: "High priority allow",
            effect: "allow",
            priority: 100,
            conditions: [],
          },
        ],
      });

      const decision = evaluator.evaluate(makeRequest(), [lowPriorityAllow, highPriorityAllow]);

      assert.equal(decision.decision, "allow");
      // Both are "allow", so highest priority wins
      assert.equal(decision.ruleId, "rule-high");
      assert.equal(decision.policyId, "policy-high");
    });

    it("should default deny when rules exist but none match conditions", () => {
      const policy = makePolicy({
        id: "policy-nomatch",
        targets: { agentIds: ["agent-1"], actions: ["read"], resources: ["*"] },
        rules: [
          {
            id: "rule-nomatch",
            name: "Allow only if x > 10",
            effect: "allow",
            priority: 10,
            conditions: [
              { field: "x", operator: "gt", value: 10 },
            ],
          },
        ],
      });

      const request = makeRequest({ context: { x: 5 } });
      const decision = evaluator.evaluate(request, [policy]);

      assert.equal(decision.decision, "deny");
      assert.equal(decision.policyId, null);
    });

    it("should treat empty target fields as matching all", () => {
      const policy = makePolicy({
        id: "policy-open",
        targets: {}, // no targets = matches all
        rules: [
          {
            id: "rule-open",
            name: "Open allow",
            effect: "allow",
            priority: 10,
            conditions: [],
          },
        ],
      });

      const decision = evaluator.evaluate(makeRequest(), [policy]);

      assert.equal(decision.decision, "allow");
      assert.equal(decision.policyId, "policy-open");
    });

    it("escalate should override allow but not deny", () => {
      const allowPolicy = makePolicy({
        id: "policy-allow",
        targets: { agentIds: ["agent-1"], actions: ["*"], resources: ["*"] },
        rules: [
          {
            id: "rule-allow",
            name: "Allow",
            effect: "allow",
            priority: 100,
            conditions: [],
          },
        ],
      });

      const escalatePolicy = makePolicy({
        id: "policy-esc",
        targets: { agentIds: ["agent-1"], actions: ["*"], resources: ["*"] },
        rules: [
          {
            id: "rule-esc",
            name: "Escalate",
            effect: "escalate",
            priority: 1,
            conditions: [],
          },
        ],
      });

      const decision = evaluator.evaluate(makeRequest(), [allowPolicy, escalatePolicy]);
      assert.equal(decision.decision, "escalate");

      // Now add a deny — deny should win over escalate
      const denyPolicy = makePolicy({
        id: "policy-deny",
        targets: { agentIds: ["agent-1"], actions: ["*"], resources: ["*"] },
        rules: [
          {
            id: "rule-deny",
            name: "Deny",
            effect: "deny",
            priority: 1,
            conditions: [],
          },
        ],
      });

      const decision2 = evaluator.evaluate(makeRequest(), [allowPolicy, escalatePolicy, denyPolicy]);
      assert.equal(decision2.decision, "deny");
    });
  });

  describe("evaluateCondition()", () => {
    it("equals / not_equals", () => {
      const ctx = { status: "active", count: 5 };

      assert.equal(
        evaluator.evaluateCondition({ field: "status", operator: "equals", value: "active" }, ctx),
        true,
      );
      assert.equal(
        evaluator.evaluateCondition({ field: "status", operator: "equals", value: "inactive" }, ctx),
        false,
      );
      assert.equal(
        evaluator.evaluateCondition({ field: "status", operator: "not_equals", value: "inactive" }, ctx),
        true,
      );
      assert.equal(
        evaluator.evaluateCondition({ field: "status", operator: "not_equals", value: "active" }, ctx),
        false,
      );
    });

    it("contains / not_contains (string)", () => {
      const ctx = { name: "hello-world" };

      assert.equal(
        evaluator.evaluateCondition({ field: "name", operator: "contains", value: "world" }, ctx),
        true,
      );
      assert.equal(
        evaluator.evaluateCondition({ field: "name", operator: "contains", value: "foo" }, ctx),
        false,
      );
      assert.equal(
        evaluator.evaluateCondition({ field: "name", operator: "not_contains", value: "foo" }, ctx),
        true,
      );
      assert.equal(
        evaluator.evaluateCondition({ field: "name", operator: "not_contains", value: "world" }, ctx),
        false,
      );
    });

    it("contains / not_contains (array)", () => {
      const ctx = { tags: ["admin", "billing"] };

      assert.equal(
        evaluator.evaluateCondition({ field: "tags", operator: "contains", value: "admin" }, ctx),
        true,
      );
      assert.equal(
        evaluator.evaluateCondition({ field: "tags", operator: "contains", value: "ops" }, ctx),
        false,
      );
      assert.equal(
        evaluator.evaluateCondition({ field: "tags", operator: "not_contains", value: "ops" }, ctx),
        true,
      );
    });

    it("in / not_in", () => {
      const ctx = { role: "editor" };

      assert.equal(
        evaluator.evaluateCondition(
          { field: "role", operator: "in", value: ["admin", "editor"] },
          ctx,
        ),
        true,
      );
      assert.equal(
        evaluator.evaluateCondition(
          { field: "role", operator: "in", value: ["admin", "viewer"] },
          ctx,
        ),
        false,
      );
      assert.equal(
        evaluator.evaluateCondition(
          { field: "role", operator: "not_in", value: ["admin", "viewer"] },
          ctx,
        ),
        true,
      );
      assert.equal(
        evaluator.evaluateCondition(
          { field: "role", operator: "not_in", value: ["admin", "editor"] },
          ctx,
        ),
        false,
      );
    });

    it("gt / lt / gte / lte", () => {
      const ctx = { score: 75 };

      assert.equal(
        evaluator.evaluateCondition({ field: "score", operator: "gt", value: 50 }, ctx),
        true,
      );
      assert.equal(
        evaluator.evaluateCondition({ field: "score", operator: "gt", value: 75 }, ctx),
        false,
      );
      assert.equal(
        evaluator.evaluateCondition({ field: "score", operator: "gte", value: 75 }, ctx),
        true,
      );
      assert.equal(
        evaluator.evaluateCondition({ field: "score", operator: "lt", value: 100 }, ctx),
        true,
      );
      assert.equal(
        evaluator.evaluateCondition({ field: "score", operator: "lt", value: 75 }, ctx),
        false,
      );
      assert.equal(
        evaluator.evaluateCondition({ field: "score", operator: "lte", value: 75 }, ctx),
        true,
      );
    });

    it("matches (regex)", () => {
      const ctx = { email: "user@example.com" };

      assert.equal(
        evaluator.evaluateCondition(
          { field: "email", operator: "matches", value: "^.+@example\\.com$" },
          ctx,
        ),
        true,
      );
      assert.equal(
        evaluator.evaluateCondition(
          { field: "email", operator: "matches", value: "^.+@other\\.com$" },
          ctx,
        ),
        false,
      );
    });

    it("matches with invalid regex returns false", () => {
      const ctx = { value: "test" };

      assert.equal(
        evaluator.evaluateCondition(
          { field: "value", operator: "matches", value: "[invalid" },
          ctx,
        ),
        false,
      );
    });

    it("returns false for numeric operators on non-numeric values", () => {
      const ctx = { name: "hello" };

      assert.equal(
        evaluator.evaluateCondition({ field: "name", operator: "gt", value: 5 }, ctx),
        false,
      );
    });
  });

  describe("matchesTarget()", () => {
    it("should match by agentId", () => {
      const policy = makePolicy({
        id: "p1",
        targets: { agentIds: ["agent-1", "agent-2"] },
        rules: [],
      });

      assert.equal(evaluator.matchesTarget(policy, "agent-1", "read", "foo"), true);
      assert.equal(evaluator.matchesTarget(policy, "agent-3", "read", "foo"), false);
    });

    it("should match by agentTags", () => {
      const policy = makePolicy({
        id: "p1",
        targets: { agentTags: ["admin"] },
        rules: [],
      });

      assert.equal(evaluator.matchesTarget(policy, "agent-x", "read", "foo", ["admin"]), true);
      assert.equal(evaluator.matchesTarget(policy, "agent-x", "read", "foo", ["user"]), false);
      assert.equal(evaluator.matchesTarget(policy, "agent-x", "read", "foo"), false);
    });

    it("should match actions with glob patterns", () => {
      const policy = makePolicy({
        id: "p1",
        targets: { actions: ["read*"] },
        rules: [],
      });

      assert.equal(evaluator.matchesTarget(policy, "agent-1", "read", "foo"), true);
      assert.equal(evaluator.matchesTarget(policy, "agent-1", "read_all", "foo"), true);
      assert.equal(evaluator.matchesTarget(policy, "agent-1", "write", "foo"), false);
    });

    it("should match resources with glob patterns", () => {
      const policy = makePolicy({
        id: "p1",
        targets: { resources: ["documents/*"] },
        rules: [],
      });

      assert.equal(
        evaluator.matchesTarget(policy, "agent-1", "read", "documents/readme.md"),
        true,
      );
      assert.equal(
        evaluator.matchesTarget(policy, "agent-1", "read", "images/photo.png"),
        false,
      );
    });

    it("should match wildcard * for actions", () => {
      const policy = makePolicy({
        id: "p1",
        targets: { actions: ["*"] },
        rules: [],
      });

      assert.equal(evaluator.matchesTarget(policy, "agent-1", "anything", "foo"), true);
    });

    it("should match all when target field is empty", () => {
      const policy = makePolicy({
        id: "p1",
        targets: {},
        rules: [],
      });

      assert.equal(evaluator.matchesTarget(policy, "agent-1", "write", "secrets/key"), true);
    });
  });
});

describe("Utils", () => {
  describe("getNestedValue()", () => {
    it("should resolve dot-notation paths", () => {
      const obj = {
        request: {
          headers: {
            authorization: "Bearer token123",
          },
        },
        level: 5,
      };

      assert.equal(getNestedValue(obj, "request.headers.authorization"), "Bearer token123");
      assert.equal(getNestedValue(obj, "level"), 5);
      assert.equal(getNestedValue(obj, "request.headers.missing"), undefined);
      assert.equal(getNestedValue(obj, "nonexistent.path"), undefined);
    });

    it("should handle null/undefined in path", () => {
      const obj = { a: null } as Record<string, unknown>;
      assert.equal(getNestedValue(obj, "a.b.c"), undefined);
    });
  });

  describe("globMatch()", () => {
    it("should match simple wildcards", () => {
      assert.equal(globMatch("documents/*", "documents/readme.md"), true);
      assert.equal(globMatch("documents/*", "images/photo.png"), false);
      assert.equal(globMatch("*", "anything"), true);
      assert.equal(globMatch("*.txt", "readme.txt"), true);
      assert.equal(globMatch("*.txt", "readme.md"), false);
    });

    it("should match exact strings", () => {
      assert.equal(globMatch("read", "read"), true);
      assert.equal(globMatch("read", "write"), false);
    });

    it("should handle special regex characters in pattern", () => {
      assert.equal(globMatch("file.txt", "file.txt"), true);
      assert.equal(globMatch("file.txt", "filextxt"), false);
    });
  });
});
