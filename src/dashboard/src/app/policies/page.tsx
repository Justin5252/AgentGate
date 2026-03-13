"use client";

import { useEffect, useState } from "react";
import type { Policy } from "@agentgate/shared";
import type { CreatePolicyRequest } from "@agentgate/shared";
import { fetchPolicies, createPolicy, deletePolicy, fetchPolicyTemplates } from "@/lib/api";
import type { PolicyTemplate } from "@/lib/api";
import { mockPolicies, mockPolicyTemplates } from "@/lib/mock-data";
import { PolicyTable, PolicyTableSkeleton } from "@/components/PolicyTable";

const inputStyle: React.CSSProperties = {
  background: "var(--bg-primary)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  borderRadius: "0.5rem",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 500,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "0.25rem",
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [templates, setTemplates] = useState<PolicyTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [enabled, setEnabled] = useState(true);

  // Rule fields
  const [ruleName, setRuleName] = useState("");
  const [ruleEffect, setRuleEffect] = useState<"allow" | "deny" | "escalate">("allow");
  const [rulePriority, setRulePriority] = useState("1");

  // Condition fields
  const [condField, setCondField] = useState("");
  const [condOperator, setCondOperator] = useState<"equals" | "not_equals" | "contains" | "in" | "matches">("equals");
  const [condValue, setCondValue] = useState("");

  // Target fields
  const [targetActions, setTargetActions] = useState("");
  const [targetResources, setTargetResources] = useState("");

  useEffect(() => {
    Promise.all([
      fetchPolicies().catch(() => mockPolicies),
      fetchPolicyTemplates().catch(() => mockPolicyTemplates),
    ]).then(([pols, tpls]) => {
      setPolicies(pols);
      setTemplates(tpls);
    }).finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setName("");
    setDescription("");
    setEnabled(true);
    setRuleName("");
    setRuleEffect("allow");
    setRulePriority("1");
    setCondField("");
    setCondOperator("equals");
    setCondValue("");
    setTargetActions("");
    setTargetResources("");
  }

  async function handleCreatePolicy() {
    const data: CreatePolicyRequest = {
      name,
      description,
      enabled,
      rules: [
        {
          name: ruleName,
          effect: ruleEffect,
          priority: Number(rulePriority),
          conditions: [
            {
              field: condField,
              operator: condOperator,
              value: condValue,
            },
          ],
        },
      ],
      targets: {
        actions: targetActions.split(",").map((s) => s.trim()).filter(Boolean),
        resources: targetResources.split(",").map((s) => s.trim()).filter(Boolean),
      },
    };

    try {
      const created = await createPolicy(data);
      setPolicies((prev) => [created, ...prev]);
      resetForm();
      setShowCreate(false);
    } catch {
      const now = new Date().toISOString();
      const mock: Policy = {
        id: `pol-${Date.now()}`,
        name: data.name,
        description: data.description,
        enabled: data.enabled ?? true,
        version: 1,
        rules: data.rules.map((r) => ({ ...r, id: crypto.randomUUID() })) as Policy["rules"],
        targets: data.targets,
        createdAt: now,
        updatedAt: now,
      };
      setPolicies((prev) => [mock, ...prev]);
      resetForm();
      setShowCreate(false);
    }
  }

  async function handleDeployTemplate(template: PolicyTemplate) {
    try {
      const created = await createPolicy(template.template as any);
      setPolicies((prev) => [created, ...prev]);
    } catch {
      const now = new Date().toISOString();
      const mock: Policy = {
        id: `pol-${Date.now()}`,
        name: template.template.name,
        description: template.template.description,
        enabled: template.template.enabled,
        version: 1,
        rules: template.template.rules.map((r) => ({ ...r, id: crypto.randomUUID() })) as Policy["rules"],
        targets: template.template.targets,
        createdAt: now,
        updatedAt: now,
      };
      setPolicies((prev) => [mock, ...prev]);
    }
  }

  async function handleDeletePolicy(id: string) {
    try {
      await deletePolicy(id);
    } catch {
      // optimistic — still remove from UI
    }
    setPolicies((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Policies
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Define access control rules for your agents
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:opacity-90"
          style={{
            background: "var(--teal)",
            color: "white",
            boxShadow: "0 0 12px rgba(6, 214, 160, 0.3)",
          }}
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? "Cancel" : "Create Policy"}
        </button>
      </div>

      {/* Create Policy Form */}
      {showCreate && (
        <div
          className="rounded-xl border p-6 flex flex-col gap-4"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            New Policy
          </h2>

          {/* Basic fields */}
          <div className="flex flex-col gap-4" style={{ maxWidth: "100%" }}>
            <div className="flex gap-4">
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rate Limit Policy"
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this policy"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Enabled toggle */}
            <div className="flex items-center gap-3">
              <label style={labelStyle}>Enabled</label>
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className="relative inline-flex items-center rounded-full transition-colors duration-200"
                style={{
                  width: "2.75rem",
                  height: "1.5rem",
                  background: enabled ? "var(--teal)" : "var(--border)",
                }}
              >
                <span
                  className="inline-block rounded-full transition-transform duration-200"
                  style={{
                    width: "1.125rem",
                    height: "1.125rem",
                    background: "white",
                    transform: enabled ? "translateX(1.375rem)" : "translateX(0.1875rem)",
                  }}
                />
              </button>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {enabled ? "On" : "Off"}
              </span>
            </div>
          </div>

          {/* Rule section */}
          <div
            className="rounded-lg border p-4 flex flex-col gap-3"
            style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}
          >
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Rule
            </h3>
            <div className="flex gap-4">
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>Rule Name</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Default Allow"
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Effect</label>
                <select
                  value={ruleEffect}
                  onChange={(e) => setRuleEffect(e.target.value as "allow" | "deny" | "escalate")}
                  style={inputStyle}
                >
                  <option value="allow">allow</option>
                  <option value="deny">deny</option>
                  <option value="escalate">escalate</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Priority</label>
                <input
                  type="number"
                  value={rulePriority}
                  onChange={(e) => setRulePriority(e.target.value)}
                  min={1}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Condition section */}
          <div
            className="rounded-lg border p-4 flex flex-col gap-3"
            style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}
          >
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Condition
            </h3>
            <div className="flex gap-4">
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>Field</label>
                <input
                  type="text"
                  value={condField}
                  onChange={(e) => setCondField(e.target.value)}
                  placeholder="agent.riskLevel"
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Operator</label>
                <select
                  value={condOperator}
                  onChange={(e) => setCondOperator(e.target.value as "equals" | "not_equals" | "contains" | "in" | "matches")}
                  style={inputStyle}
                >
                  <option value="equals">equals</option>
                  <option value="not_equals">not_equals</option>
                  <option value="contains">contains</option>
                  <option value="in">in</option>
                  <option value="matches">matches</option>
                </select>
              </div>
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>Value</label>
                <input
                  type="text"
                  value={condValue}
                  onChange={(e) => setCondValue(e.target.value)}
                  placeholder="e.g. low"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Targets section */}
          <div
            className="rounded-lg border p-4 flex flex-col gap-3"
            style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}
          >
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Targets
            </h3>
            <div className="flex gap-4">
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Actions (comma-separated)</label>
                <input
                  type="text"
                  value={targetActions}
                  onChange={(e) => setTargetActions(e.target.value)}
                  placeholder="read, write, execute"
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Resources (comma-separated)</label>
                <input
                  type="text"
                  value={targetResources}
                  onChange={(e) => setTargetResources(e.target.value)}
                  placeholder="db:*, api:users"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 hover:opacity-90"
              style={{
                background: "var(--teal)",
                color: "white",
                boxShadow: "0 0 12px rgba(6, 214, 160, 0.3)",
              }}
              onClick={handleCreatePolicy}
            >
              Create Policy
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <PolicyTableSkeleton />
      ) : (
        <PolicyTable policies={policies} onDelete={handleDeletePolicy} />
      )}

      {/* Policy Templates */}
      {!loading && templates.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Policy Templates
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Deploy pre-built policies with one click
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="rounded-xl border p-5 flex flex-col justify-between transition-all duration-150"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
                  e.currentTarget.style.boxShadow = "0 0 16px rgba(59, 130, 246, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {tpl.name}
                    </h3>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ background: "rgba(59, 130, 246, 0.12)", color: "var(--blue)" }}
                    >
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                    {tpl.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>{tpl.template.rules.length} rule{tpl.template.rules.length !== 1 ? "s" : ""}</span>
                    <span>&middot;</span>
                    <span>
                      {tpl.template.rules.map((r) => r.effect).filter((v, i, a) => a.indexOf(v) === i).join(", ")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeployTemplate(tpl)}
                  className="mt-4 w-full py-2 rounded-lg text-xs font-medium transition-opacity hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, var(--blue), #2563EB)",
                    color: "white",
                  }}
                >
                  Deploy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
