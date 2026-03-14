"use client";

import { useEffect, useState } from "react";
import type { VendorAgent, VendorAgentStats } from "@/lib/api";
import {
  fetchVendorAgents,
  fetchVendorAgentStats,
  createVendorAgent,
  deleteVendorAgent,
  assessVendorAgent,
} from "@/lib/api";
import { mockVendorAgents, mockVendorAgentStats } from "@/lib/mock-data";

const COMPLIANCE_OPTIONS = [
  { key: "soc2", label: "SOC 2" },
  { key: "gdpr", label: "GDPR" },
  { key: "hipaa", label: "HIPAA" },
  { key: "iso27001", label: "ISO 27001" },
  { key: "pci_dss", label: "PCI DSS" },
  { key: "eu_ai_act", label: "EU AI Act" },
] as const;

function riskScoreColor(score: number): string {
  if (score <= 24) return "#06D6A0";
  if (score <= 49) return "#06D6A0";
  if (score <= 74) return "#F59E0B";
  return "#EF4444";
}

function riskScoreBg(score: number): string {
  if (score <= 24) return "rgba(6,214,160,0.15)";
  if (score <= 49) return "rgba(6,214,160,0.10)";
  if (score <= 74) return "rgba(245,158,11,0.15)";
  return "rgba(239,68,68,0.15)";
}

function riskLevelColor(level: string): string {
  switch (level) {
    case "low":
      return "#06D6A0";
    case "medium":
      return "#3B82F6";
    case "high":
      return "#F59E0B";
    case "critical":
      return "#EF4444";
    default:
      return "#64748B";
  }
}

function assessmentStatusLabel(status: string): string {
  switch (status) {
    case "not_assessed":
      return "Not Assessed";
    case "in_progress":
      return "In Progress";
    case "assessed":
      return "Assessed";
    case "needs_review":
      return "Needs Review";
    default:
      return status;
  }
}

function assessmentStatusColor(status: string): string {
  switch (status) {
    case "not_assessed":
      return "#64748B";
    case "in_progress":
      return "#3B82F6";
    case "assessed":
      return "#06D6A0";
    case "needs_review":
      return "#F59E0B";
    default:
      return "#64748B";
  }
}

export default function VendorAgentsPage() {
  const [agents, setAgents] = useState<VendorAgent[]>([]);
  const [stats, setStats] = useState<VendorAgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [assessingId, setAssessingId] = useState<string | null>(null);

  // Form state
  const [vendorName, setVendorName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [description, setDescription] = useState("");
  const [vendorUrl, setVendorUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [capabilities, setCapabilities] = useState("");
  const [dataAccess, setDataAccess] = useState("");
  const [complianceClaims, setComplianceClaims] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      fetchVendorAgents().catch(() => mockVendorAgents as unknown as VendorAgent[]),
      fetchVendorAgentStats().catch(() => mockVendorAgentStats as VendorAgentStats),
    ])
      .then(([a, s]) => {
        setAgents(a);
        setStats(s);
      })
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setVendorName("");
    setAgentName("");
    setDescription("");
    setVendorUrl("");
    setContactEmail("");
    setCapabilities("");
    setDataAccess("");
    setComplianceClaims({});
  };

  const handleRegister = async () => {
    if (!vendorName.trim() || !agentName.trim()) return;

    const caps = capabilities
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const da = dataAccess
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      vendorName: vendorName.trim(),
      agentName: agentName.trim(),
      description: description.trim(),
      vendorUrl: vendorUrl.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      capabilities: caps,
      dataAccess: da,
      complianceClaims,
    };

    try {
      const result = await createVendorAgent(payload);
      setAgents((prev) => [result, ...prev]);
      setStats((prev) =>
        prev ? { ...prev, total: prev.total + 1, byAssessmentStatus: { ...prev.byAssessmentStatus, not_assessed: (prev.byAssessmentStatus.not_assessed ?? 0) + 1 } } : prev,
      );
    } catch {
      // Mock fallback
      const mockAgent: VendorAgent = {
        id: `va-${Date.now()}`,
        tenantId: "tenant-1",
        vendorName: vendorName.trim(),
        agentName: agentName.trim(),
        description: description.trim(),
        vendorUrl: vendorUrl.trim() || null,
        contactEmail: contactEmail.trim() || null,
        capabilities: caps,
        dataAccess: da,
        riskScore: 0,
        riskLevel: "low",
        assessmentStatus: "not_assessed",
        complianceClaims,
        lastAssessedAt: null,
        nextReviewDate: null,
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAgents((prev) => [mockAgent, ...prev]);
      setStats((prev) =>
        prev ? { ...prev, total: prev.total + 1, byAssessmentStatus: { ...prev.byAssessmentStatus, not_assessed: (prev.byAssessmentStatus.not_assessed ?? 0) + 1 } } : prev,
      );
    }

    resetForm();
    setShowRegister(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVendorAgent(id);
    } catch {
      // Optimistic removal regardless
    }
    setAgents((prev) => prev.filter((a) => a.id !== id));
    setStats((prev) => (prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev));
  };

  const handleAssess = async (id: string) => {
    setAssessingId(id);
    try {
      const result = await assessVendorAgent(id);
      setAgents((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                riskScore: result.overallRiskScore,
                riskLevel:
                  result.overallRiskScore <= 24
                    ? "low"
                    : result.overallRiskScore <= 49
                      ? "medium"
                      : result.overallRiskScore <= 74
                        ? "high"
                        : "critical",
                assessmentStatus: "assessed" as const,
                lastAssessedAt: result.assessedAt,
              }
            : a,
        ),
      );
    } catch {
      // Mock assessment
      const score = Math.floor(Math.random() * 80) + 10;
      setAgents((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                riskScore: score,
                riskLevel:
                  score <= 24
                    ? ("low" as const)
                    : score <= 49
                      ? ("medium" as const)
                      : score <= 74
                        ? ("high" as const)
                        : ("critical" as const),
                assessmentStatus: "assessed" as const,
                lastAssessedAt: new Date().toISOString(),
              }
            : a,
        ),
      );
    }
    setAssessingId(null);
  };

  const toggleClaim = (key: string) => {
    setComplianceClaims((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Computed stats (use live data if available)
  const totalVendors = stats?.total ?? agents.length;
  const avgRiskScore = stats?.avgRiskScore ?? (agents.length > 0 ? Math.round(agents.reduce((s, a) => s + a.riskScore, 0) / agents.length) : 0);
  const needsReview = stats?.needsReview ?? agents.filter((a) => a.assessmentStatus === "needs_review" || a.assessmentStatus === "not_assessed").length;
  const assessed = stats?.byAssessmentStatus?.assessed ?? agents.filter((a) => a.assessmentStatus === "assessed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Vendor Agents
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage and assess third-party AI agent risk
          </p>
        </div>
        <button
          onClick={() => setShowRegister(!showRegister)}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:opacity-90"
          style={{
            background: "var(--blue)",
            color: "white",
            boxShadow: "0 0 12px rgba(59, 130, 246, 0.3)",
          }}
        >
          {showRegister ? "Cancel" : "Register Vendor Agent"}
        </button>
      </div>

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Vendors", value: totalVendors, color: "var(--blue)" },
            { label: "Avg Risk Score", value: avgRiskScore, color: riskScoreColor(avgRiskScore) },
            { label: "Needs Review", value: needsReview, color: "#F59E0B" },
            { label: "Assessed", value: assessed, color: "var(--teal)" },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl border p-5"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                {card.label}
              </p>
              <p className="text-3xl font-bold mt-2" style={{ color: card.color }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Register Form */}
      {showRegister && (
        <div
          className="rounded-xl border p-6 flex flex-col gap-4"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Register New Vendor Agent
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vendor Name */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Vendor Name *
              </label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. OpenAI"
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Agent Name */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Agent Name *
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g. GPT-4 Assistant"
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the vendor agent's purpose"
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vendor URL */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Vendor URL
              </label>
              <input
                type="url"
                value={vendorUrl}
                onChange={(e) => setVendorUrl(e.target.value)}
                placeholder="https://vendor.com"
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Contact Email */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="security@vendor.com"
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Capabilities */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Capabilities
              </label>
              <input
                type="text"
                value={capabilities}
                onChange={(e) => setCapabilities(e.target.value)}
                placeholder="Comma-separated, e.g. read:data, write:responses"
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Data Access */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Data Access
              </label>
              <input
                type="text"
                value={dataAccess}
                onChange={(e) => setDataAccess(e.target.value)}
                placeholder="Comma-separated, e.g. pii, financial, source-code"
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {/* Compliance Claims */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Compliance Claims
            </label>
            <div className="flex flex-wrap gap-3">
              {COMPLIANCE_OPTIONS.map((opt) => (
                <label
                  key={opt.key}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={!!complianceClaims[opt.key]}
                    onChange={() => toggleClaim(opt.key)}
                    className="rounded"
                    style={{ accentColor: "var(--blue)" }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleRegister}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:opacity-90"
              style={{
                background: "var(--blue)",
                color: "white",
                boxShadow: "0 0 12px rgba(59, 130, 246, 0.3)",
              }}
            >
              Register Vendor Agent
            </button>
            <button
              onClick={() => {
                setShowRegister(false);
                resetForm();
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 hover:opacity-80"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div
          className="rounded-xl border overflow-hidden animate-pulse"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-lg"
                style={{ background: "var(--border)" }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Vendor Agents Table */}
      {!loading && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  {[
                    "Vendor Name",
                    "Agent Name",
                    "Risk Score",
                    "Risk Level",
                    "Assessment Status",
                    "Compliance Claims",
                    "Last Assessed",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No vendor agents registered yet. Click &quot;Register
                      Vendor Agent&quot; to get started.
                    </td>
                  </tr>
                ) : (
                  agents.map((agent) => {
                    const claimKeys = Object.entries(
                      agent.complianceClaims,
                    ).filter(([, v]) => v);
                    const claimLabel = (key: string) => {
                      const found = COMPLIANCE_OPTIONS.find(
                        (o) => o.key === key,
                      );
                      return found ? found.label : key.toUpperCase();
                    };

                    return (
                      <tr
                        key={agent.id}
                        className="border-b transition-colors hover:bg-white/[0.02]"
                        style={{ borderColor: "var(--border)" }}
                      >
                        {/* Vendor Name */}
                        <td
                          className="px-4 py-3 font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {agent.vendorName}
                        </td>

                        {/* Agent Name */}
                        <td
                          className="px-4 py-3"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {agent.agentName}
                        </td>

                        {/* Risk Score */}
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums"
                            style={{
                              background: riskScoreBg(agent.riskScore),
                              color: riskScoreColor(agent.riskScore),
                              minWidth: "36px",
                            }}
                          >
                            {agent.riskScore}
                          </span>
                        </td>

                        {/* Risk Level */}
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                            style={{
                              background: `${riskLevelColor(agent.riskLevel)}15`,
                              color: riskLevelColor(agent.riskLevel),
                            }}
                          >
                            {agent.riskLevel}
                          </span>
                        </td>

                        {/* Assessment Status */}
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                            style={{
                              background: `${assessmentStatusColor(agent.assessmentStatus)}15`,
                              color: assessmentStatusColor(
                                agent.assessmentStatus,
                              ),
                            }}
                          >
                            {assessmentStatusLabel(agent.assessmentStatus)}
                          </span>
                        </td>

                        {/* Compliance Claims */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {claimKeys.length === 0 ? (
                              <span
                                className="text-xs"
                                style={{ color: "var(--text-muted)" }}
                              >
                                None
                              </span>
                            ) : (
                              claimKeys.map(([key]) => (
                                <span
                                  key={key}
                                  className="inline-flex px-1.5 py-0.5 rounded text-xs font-medium"
                                  style={{
                                    background: "rgba(59,130,246,0.10)",
                                    color: "var(--blue)",
                                  }}
                                >
                                  {claimLabel(key)}
                                </span>
                              ))
                            )}
                          </div>
                        </td>

                        {/* Last Assessed */}
                        <td
                          className="px-4 py-3 text-xs whitespace-nowrap"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {agent.lastAssessedAt
                            ? new Date(agent.lastAssessedAt).toLocaleDateString()
                            : "Never"}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAssess(agent.id)}
                              disabled={assessingId === agent.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-90 disabled:opacity-50"
                              style={{
                                background:
                                  "linear-gradient(135deg, var(--blue), #2563EB)",
                                color: "white",
                              }}
                            >
                              {assessingId === agent.id
                                ? "Assessing..."
                                : "Assess"}
                            </button>
                            <button
                              onClick={() => handleDelete(agent.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-90"
                              style={{
                                background: "rgba(239,68,68,0.15)",
                                color: "#EF4444",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
