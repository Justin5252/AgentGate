"use client";

import { useState, useMemo, Fragment } from "react";
import {
  mockFrameworks,
  mockComplianceControls,
  mockRegulatoryUpdates,
  mockScoreHistory,
  mockRemediations,
  mockPolicySuggestions,
} from "@/lib/mock-data";
import type { RemediationRecommendation, PolicySuggestion } from "@/lib/api";

const statusColors: Record<string, string> = {
  passing: "#06D6A0",
  failing: "#EF4444",
  warning: "#F59E0B",
  not_evaluated: "#64748B",
  not_applicable: "#475569",
};

const statusLabels: Record<string, string> = {
  passing: "Passing",
  failing: "Failing",
  warning: "Warning",
  not_evaluated: "Not Evaluated",
  not_applicable: "N/A",
};

const severityColors: Record<string, string> = {
  critical: "#EF4444",
  high: "#F59E0B",
  medium: "#3B82F6",
  low: "#64748B",
};

const impactColors: Record<string, string> = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#3B82F6",
};

const remediationStatusColors: Record<string, string> = {
  pending: "#F59E0B",
  in_progress: "#3B82F6",
  completed: "#06D6A0",
  dismissed: "#64748B",
};

const suggestionTypeColors: Record<string, string> = {
  modify: "#3B82F6",
  create: "#06D6A0",
  review: "#F59E0B",
};

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = size > 80 ? 8 : 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#06D6A0" : score >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#1E293B"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

function ScoreTrendChart({ data }: { data: { date: string; score: number }[] }) {
  if (data.length === 0) return null;
  const width = 500;
  const height = 160;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minScore = Math.max(0, Math.min(...data.map((d) => d.score)) - 10);
  const maxScore = Math.min(100, Math.max(...data.map((d) => d.score)) + 10);

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((d.score - minScore) / (maxScore - minScore)) * chartH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].filter((v) => v >= minScore && v <= maxScore).map((v) => {
        const y = padding.top + chartH - ((v - minScore) / (maxScore - minScore)) * chartH;
        return (
          <g key={v}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#1E293B" strokeWidth={1} />
            <text x={padding.left - 8} y={y + 4} fill="#64748B" fontSize={10} textAnchor="end">{v}</text>
          </g>
        );
      })}
      {/* Date labels */}
      {data.map((d, i) => (
        <text
          key={d.date}
          x={padding.left + (i / (data.length - 1)) * chartW}
          y={height - 5}
          fill="#64748B"
          fontSize={9}
          textAnchor="middle"
        >
          {d.date.slice(5)}
        </text>
      ))}
      {/* Line */}
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06D6A0" />
        </linearGradient>
      </defs>
      <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth={2.5} strokeLinecap="round" />
      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#080D1B" stroke="url(#lineGrad)" strokeWidth={2} />
      ))}
    </svg>
  );
}

function RemediationPanel({ rec, onStatusChange }: { rec: RemediationRecommendation; onStatusChange: (id: string, status: string) => void }) {
  return (
    <div className="px-4 py-4 space-y-3" style={{ background: "rgba(59,130,246,0.03)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: `${remediationStatusColors[rec.status]}15`, color: remediationStatusColors[rec.status] }}
          >
            {rec.status.replace("_", " ")}
          </span>
          <span
            className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: "rgba(100,116,139,0.15)", color: "#94A3B8" }}
          >
            {rec.source === "template" ? "Template" : "AI Generated"}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Effort: {rec.estimatedEffort}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={rec.status}
            onChange={(e) => onStatusChange(rec.id, e.target.value)}
            className="text-xs rounded-lg px-2 py-1 border"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>
      <p className="text-sm font-medium text-white">{rec.summary}</p>
      <div className="space-y-2">
        {rec.steps.map((step) => (
          <div key={step.order} className="flex items-start gap-3">
            <div
              className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
              style={{
                borderColor: step.completed ? "#06D6A0" : "#475569",
                background: step.completed ? "rgba(6,214,160,0.1)" : "transparent",
              }}
            >
              {step.completed && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#06D6A0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white">{step.title}</span>
                <span
                  className="inline-flex px-1.5 py-0.5 rounded text-xs"
                  style={{ background: "rgba(100,116,139,0.15)", color: "#64748B", fontSize: "10px" }}
                >
                  {step.actionType}
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuggestionCard({
  suggestion,
  onReview,
  onApply,
}: {
  suggestion: PolicySuggestion;
  onReview: (id: string, status: "approved" | "rejected") => void;
  onApply: (id: string) => void;
}) {
  const changes = suggestion.suggestedChanges as Record<string, any>;
  const rules = changes.rulesToAdd ?? changes.newPolicy?.rules ?? [];

  return (
    <div
      className="rounded-lg border p-4 mt-2"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
        opacity: suggestion.status === "rejected" ? 0.5 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: `${suggestionTypeColors[suggestion.suggestionType]}15`, color: suggestionTypeColors[suggestion.suggestionType] }}
            >
              {suggestion.suggestionType}
            </span>
            <span
              className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: `${impactColors[suggestion.impactLevel]}15`, color: impactColors[suggestion.impactLevel] }}
            >
              {suggestion.impactLevel} impact
            </span>
            {suggestion.status !== "pending" && (
              <span
                className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  background: suggestion.status === "approved" ? "rgba(6,214,160,0.15)" : suggestion.status === "applied" ? "rgba(59,130,246,0.15)" : "rgba(100,116,139,0.15)",
                  color: suggestion.status === "approved" ? "#06D6A0" : suggestion.status === "applied" ? "#3B82F6" : "#64748B",
                }}
              >
                {suggestion.status}
              </span>
            )}
          </div>
          <h5 className="text-sm font-medium text-white">{suggestion.policyName}</h5>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{suggestion.description}</p>

          {/* Preview suggested rules */}
          {rules.length > 0 && (
            <div className="mt-2 space-y-1">
              {rules.map((rule: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-2 py-1 rounded text-xs font-mono"
                  style={{ background: "rgba(100,116,139,0.1)" }}
                >
                  <span style={{ color: rule.effect === "escalate" ? "#F59E0B" : rule.effect === "deny" ? "#EF4444" : "#06D6A0" }}>
                    {rule.effect}
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>{rule.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {suggestion.status === "pending" && (
            <>
              <button
                onClick={() => onReview(suggestion.id, "approved")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-90"
                style={{ background: "rgba(6,214,160,0.15)", color: "#06D6A0" }}
              >
                Approve
              </button>
              <button
                onClick={() => onReview(suggestion.id, "rejected")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-90"
                style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}
              >
                Reject
              </button>
            </>
          )}
          {suggestion.status === "approved" && !suggestion.appliedPolicyVersion && (
            <button
              onClick={() => onApply(suggestion.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}
            >
              Apply
            </button>
          )}
          {suggestion.status === "applied" && (
            <span className="text-xs" style={{ color: "#06D6A0" }}>
              v{suggestion.appliedPolicyVersion}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CompliancePage() {
  const [selectedFramework, setSelectedFramework] = useState("soc2");
  const [expandedControl, setExpandedControl] = useState<string | null>(null);
  const [remediations, setRemediations] = useState<RemediationRecommendation[]>(mockRemediations);
  const [suggestions, setSuggestions] = useState<PolicySuggestion[]>(mockPolicySuggestions);
  const [expandedUpdate, setExpandedUpdate] = useState<string | null>(null);

  const enabledFrameworks = mockFrameworks.filter((f) => f.enabled);
  const aggregateScore =
    enabledFrameworks.length > 0
      ? Math.round(enabledFrameworks.reduce((sum, f) => sum + f.complianceScore, 0) / enabledFrameworks.length)
      : 0;

  const controls = useMemo(
    () => mockComplianceControls.filter((c) => c.frameworkId === selectedFramework),
    [selectedFramework],
  );

  const unacknowledgedUpdates = mockRegulatoryUpdates.filter((u) => !u.acknowledged);

  function handleRemediationStatusChange(id: string, status: string) {
    setRemediations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: status as any, updatedAt: new Date().toISOString() } : r)),
    );
  }

  function handleGenerateRecommendations() {
    // In production this calls the API; mock just shows existing
    alert("In production, this generates recommendations for all failing controls via POST /:frameworkId/remediation/generate");
  }

  function getRemediationForControl(controlId: string): RemediationRecommendation | undefined {
    return remediations.find((r) => r.controlId === controlId && r.frameworkId === selectedFramework);
  }

  function handleSuggestionReview(id: string, status: "approved" | "rejected") {
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status, reviewedBy: "admin@company.com", reviewedAt: new Date().toISOString() }
          : s,
      ),
    );
  }

  function handleSuggestionApply(id: string) {
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: "applied" as const, appliedPolicyVersion: 2 } : s,
      ),
    );
  }

  function handleAnalyzeImpact(updateId: string) {
    setExpandedUpdate(expandedUpdate === updateId ? null : updateId);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Compliance Autopilot</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Continuous compliance monitoring across all frameworks
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, var(--blue), #2563EB)" }}
        >
          + Add Framework
        </button>
      </div>

      {/* Overall Score + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Ring */}
        <div
          className="rounded-xl border p-6 flex flex-col items-center justify-center"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
            Overall Compliance
          </p>
          <div className="relative">
            <ScoreRing score={aggregateScore} size={140} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: aggregateScore >= 80 ? "#06D6A0" : aggregateScore >= 60 ? "#F59E0B" : "#EF4444" }}>
                {aggregateScore}%
              </span>
            </div>
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
            {enabledFrameworks.length} framework{enabledFrameworks.length !== 1 ? "s" : ""} active
          </p>
        </div>

        {/* Score Trend */}
        <div
          className="rounded-xl border p-6 lg:col-span-2"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
            Compliance Score Trend
          </p>
          <ScoreTrendChart data={mockScoreHistory} />
        </div>
      </div>

      {/* Framework Cards */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
          Frameworks
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockFrameworks.map((fw) => {
            const isSelected = fw.frameworkId === selectedFramework;
            return (
              <div
                key={fw.id}
                className="rounded-xl border p-5 cursor-pointer transition-all"
                style={{
                  background: "var(--bg-card)",
                  borderColor: isSelected ? "rgba(59,130,246,0.5)" : "var(--border)",
                  boxShadow: isSelected ? "0 0 20px rgba(59,130,246,0.1)" : undefined,
                  opacity: fw.enabled ? 1 : 0.5,
                }}
                onClick={() => setSelectedFramework(fw.frameworkId)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{fw.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {fw.description}
                    </p>
                  </div>
                  <div className="relative flex-shrink-0 ml-3">
                    <ScoreRing score={fw.complianceScore} size={50} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold" style={{ color: fw.complianceScore >= 80 ? "#06D6A0" : fw.complianceScore >= 60 ? "#F59E0B" : "#EF4444" }}>
                        {fw.complianceScore}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Control counts */}
                <div className="flex items-center gap-4 text-xs">
                  <span style={{ color: "#06D6A0" }}>{fw.passingControls} passing</span>
                  <span style={{ color: "#EF4444" }}>{fw.failingControls} failing</span>
                  <span style={{ color: "#F59E0B" }}>{fw.warningControls} warning</span>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "#1E293B" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${fw.complianceScore}%`,
                      background: `linear-gradient(90deg, ${fw.complianceScore >= 80 ? "#06D6A0" : fw.complianceScore >= 60 ? "#F59E0B" : "#EF4444"}, ${fw.complianceScore >= 80 ? "#34D399" : fw.complianceScore >= 60 ? "#FBBF24" : "#F87171"})`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {fw.totalControls} controls &middot; v{fw.version}
                  </span>
                  {!fw.enabled && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(100,116,139,0.2)", color: "#64748B" }}
                    >
                      Disabled
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Controls — {mockFrameworks.find((f) => f.frameworkId === selectedFramework)?.name ?? selectedFramework}
          </p>
          <button
            onClick={handleGenerateRecommendations}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-white/5"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            Generate Recommendations
          </button>
        </div>
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                {["Code", "Title", "Category", "Status", "Severity", "Evidence", "Auto", "Remediation"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {controls.map((ctrl) => {
                const rec = getRemediationForControl(ctrl.id);
                const isExpanded = expandedControl === ctrl.id;
                const needsRemediation = ctrl.status === "failing" || ctrl.status === "warning";

                return (
                  <Fragment key={ctrl.id}>
                    <tr
                      className="border-b transition-colors hover:bg-white/[0.02]"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--blue)" }}>
                        {ctrl.controlCode}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                        {ctrl.title}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        {ctrl.category}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: `${statusColors[ctrl.status]}15`,
                            color: statusColors[ctrl.status],
                          }}
                        >
                          {statusLabels[ctrl.status] ?? ctrl.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: `${severityColors[ctrl.severity]}15`,
                            color: severityColors[ctrl.severity],
                          }}
                        >
                          {ctrl.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                        {ctrl.evidenceCount}
                      </td>
                      <td className="px-4 py-3">
                        {ctrl.automatable ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06D6A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {needsRemediation ? (
                          <button
                            onClick={() => setExpandedControl(isExpanded ? null : ctrl.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                            style={{
                              background: rec
                                ? `${remediationStatusColors[rec.status]}15`
                                : "rgba(239,68,68,0.15)",
                              color: rec
                                ? remediationStatusColors[rec.status]
                                : "#EF4444",
                            }}
                          >
                            {rec ? rec.status.replace("_", " ") : "Fix"}
                          </button>
                        ) : (
                          <span className="text-xs" style={{ color: "#06D6A0" }}>
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && rec && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <RemediationPanel rec={rec} onStatusChange={handleRemediationStatusChange} />
                        </td>
                      </tr>
                    )}
                    {isExpanded && !rec && needsRemediation && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <div className="px-4 py-4" style={{ background: "rgba(59,130,246,0.03)" }}>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                              No recommendation generated yet. Click &quot;Generate Recommendations&quot; above or use the API:
                              <code className="ml-1 text-xs" style={{ color: "var(--blue)" }}>
                                POST /compliance/{selectedFramework}/controls/{ctrl.id}/remediation
                              </code>
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regulatory Updates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Regulatory Updates
          </p>
          {unacknowledgedUpdates.length > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}
            >
              {unacknowledgedUpdates.length} unacknowledged
            </span>
          )}
        </div>
        <div className="space-y-3">
          {mockRegulatoryUpdates.map((update) => {
            const updateSuggestions = suggestions.filter((s) => s.regulatoryUpdateId === update.id);
            const isExpanded = expandedUpdate === update.id;

            return (
              <div key={update.id}>
                <div
                  className="rounded-xl border p-4"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: `${impactColors[update.impactLevel]}15`,
                            color: impactColors[update.impactLevel],
                          }}
                        >
                          {update.impactLevel} impact
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {update.frameworkId.toUpperCase().replace("_", " ")}
                        </span>
                      </div>
                      <h4 className="font-medium text-white text-sm">{update.title}</h4>
                      <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                        {update.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                        <span>Effective: {new Date(update.effectiveDate).toLocaleDateString()}</span>
                        <span>Source: {update.source}</span>
                        <span>Affects: {update.affectedControls.join(", ")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAnalyzeImpact(update.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-90"
                        style={{
                          background: isExpanded ? "rgba(59,130,246,0.15)" : "linear-gradient(135deg, #3B82F6, #2563EB)",
                          color: isExpanded ? "#3B82F6" : "white",
                        }}
                      >
                        {isExpanded ? "Hide" : "Analyze Impact"}
                      </button>
                      {!update.acknowledged ? (
                        <button
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-white/5"
                          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-xs" style={{ color: "#06D6A0" }}>
                          Acknowledged
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded suggestions */}
                  {isExpanded && (
                    <div className="mt-4 space-y-2">
                      {updateSuggestions.length > 0 ? (
                        <>
                          <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                            Policy Suggestions ({updateSuggestions.length})
                          </p>
                          {updateSuggestions.map((s) => (
                            <SuggestionCard
                              key={s.id}
                              suggestion={s}
                              onReview={handleSuggestionReview}
                              onApply={handleSuggestionApply}
                            />
                          ))}
                        </>
                      ) : (
                        <p className="text-xs py-2" style={{ color: "var(--text-muted)" }}>
                          No policy suggestions generated yet. In production, clicking &quot;Analyze Impact&quot; calls
                          <code className="ml-1" style={{ color: "var(--blue)" }}>
                            POST /compliance/regulatory-updates/{update.id}/analyze
                          </code>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
