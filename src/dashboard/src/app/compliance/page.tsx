"use client";

import { useState, useMemo } from "react";
import {
  mockFrameworks,
  mockComplianceControls,
  mockRegulatoryUpdates,
  mockScoreHistory,
} from "@/lib/mock-data";

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

export default function CompliancePage() {
  const [selectedFramework, setSelectedFramework] = useState("soc2");

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
        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
          Controls — {mockFrameworks.find((f) => f.frameworkId === selectedFramework)?.name ?? selectedFramework}
        </p>
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                {["Code", "Title", "Category", "Status", "Severity", "Evidence", "Auto"].map((h) => (
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
              {controls.map((ctrl) => (
                <tr
                  key={ctrl.id}
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
                </tr>
              ))}
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
          {mockRegulatoryUpdates.map((update) => (
            <div
              key={update.id}
              className="rounded-xl border p-4 flex items-start justify-between gap-4"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
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
          ))}
        </div>
      </div>
    </div>
  );
}
