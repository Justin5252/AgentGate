"use client";

import { useEffect, useState } from "react";
import type { AgentIdentity, Policy, AuditEntry } from "@agentgate/shared";
import { fetchAgents, fetchPolicies, fetchAuditLogs, fetchAuditStats, fetchAnomalies, fetchAnomalyStats } from "@/lib/api";
import type { AuditStats, Anomaly, AnomalyStats } from "@/lib/api";
import { mockAgents, mockPolicies, mockAuditEntries, mockAuditStats, mockAnomalies, mockAnomalyStats } from "@/lib/mock-data";
import { StatCard, StatCardSkeleton } from "@/components/StatCard";
import { AuditFeed, AuditFeedSkeleton } from "@/components/AuditFeed";
import Link from "next/link";

export default function DashboardPage() {
  const [agents, setAgents] = useState<AgentIdentity[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [auditStats, setAuditStats] = useState<AuditStats | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [anomalyStats, setAnomalyStats] = useState<AnomalyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [agentsData, policiesData, entriesData, statsData, anomalyData, anomalyStatsData] =
          await Promise.all([
            fetchAgents().catch(() => null),
            fetchPolicies().catch(() => null),
            fetchAuditLogs({ limit: 20 }).catch(() => null),
            fetchAuditStats().catch(() => null),
            fetchAnomalies({ limit: 3 }).catch(() => null),
            fetchAnomalyStats().catch(() => null),
          ]);

        setAgents(agentsData ?? mockAgents);
        setPolicies(policiesData ?? mockPolicies);
        setAuditEntries(entriesData ?? mockAuditEntries);
        setAuditStats(statsData ?? mockAuditStats);
        setAnomalies(anomalyData ?? mockAnomalies.slice(0, 3));
        setAnomalyStats(anomalyStatsData ?? mockAnomalyStats);
      } catch {
        // Fall back to mock data
        setAgents(mockAgents);
        setPolicies(mockPolicies);
        setAuditEntries(mockAuditEntries);
        setAuditStats(mockAuditStats);
        setAnomalies(mockAnomalies.slice(0, 3));
        setAnomalyStats(mockAnomalyStats);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const activeAgents = agents.filter((a) => a.status === "active").length;
  const activePolicies = policies.filter((p) => p.enabled).length;
  const totalDecisions = auditStats?.totalDecisions ?? 0;
  const denyRate =
    totalDecisions > 0
      ? ((auditStats?.denyCount ?? 0) / totalDecisions) * 100
      : 0;

  const denyRateColor: "red" | "yellow" | "teal" =
    denyRate > 10 ? "red" : denyRate > 5 ? "yellow" : "teal";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Overview of your agent ecosystem
        </p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Agents"
            value={agents.length}
            subtitle={`${activeAgents} active`}
            color="blue"
          />
          <StatCard
            title="Active Policies"
            value={activePolicies}
            subtitle={`${policies.length} total`}
            color="teal"
          />
          <StatCard
            title="Decisions Today"
            value={totalDecisions.toLocaleString()}
            subtitle={`${auditStats?.avgDurationMs ?? 0}ms avg`}
            color="blue"
          />
          <StatCard
            title="Deny Rate"
            value={`${denyRate.toFixed(1)}%`}
            subtitle={`${auditStats?.denyCount ?? 0} denied`}
            color={denyRateColor}
          />
          <StatCard
            title="Anomalies"
            value={anomalyStats?.unresolvedCount ?? 0}
            subtitle="Unresolved"
            color={(anomalyStats?.unresolvedCount ?? 0) > 0 ? "red" : "teal"}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audit Feed */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Recent Activity
          </h2>
          {loading ? (
            <AuditFeedSkeleton />
          ) : (
            <AuditFeed entries={auditEntries} />
          )}
        </div>

        {/* Quick Stats */}
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Decision Breakdown
          </h2>
          <div
            className="rounded-xl border p-5 space-y-5"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="skeleton h-3 w-20" />
                    <div className="skeleton h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <DecisionBar
                  label="Allowed"
                  count={auditStats?.allowCount ?? 0}
                  total={totalDecisions}
                  color="var(--teal)"
                />
                <DecisionBar
                  label="Denied"
                  count={auditStats?.denyCount ?? 0}
                  total={totalDecisions}
                  color="var(--danger)"
                />
                <DecisionBar
                  label="Escalated"
                  count={auditStats?.escalateCount ?? 0}
                  total={totalDecisions}
                  color="var(--warning)"
                />

                <div className="pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "var(--text-muted)" }}>Avg Response</span>
                    <span className="font-mono" style={{ color: "var(--text-primary)" }}>
                      {auditStats?.avgDurationMs ?? 0}ms
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--text-muted)" }}>Total Decisions</span>
                    <span className="font-mono" style={{ color: "var(--text-primary)" }}>
                      {totalDecisions.toLocaleString()}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Anomalies */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Recent Anomalies
          </h2>
          <Link
            href="/anomalies"
            className="text-xs font-medium transition-colors"
            style={{ color: "var(--blue)" }}
          >
            View all &rarr;
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border p-4"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <div className="space-y-3">
                  <div className="skeleton h-4 w-16 rounded" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {anomalies.slice(0, 3).map((anomaly) => (
              <RecentAnomalyCard key={anomaly.id} anomaly={anomaly} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DecisionBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span style={{ color: "var(--text-secondary)" }}>{label}</span>
        <span className="font-mono" style={{ color: "var(--text-primary)" }}>
          {count.toLocaleString()} ({pct.toFixed(1)}%)
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: "var(--bg-primary)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: color,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}

const anomalySeverityStyles: Record<string, { bg: string; text: string }> = {
  critical: { bg: "rgba(239, 68, 68, 0.15)", text: "var(--danger)" },
  high: { bg: "rgba(239, 68, 68, 0.10)", text: "var(--danger)" },
  medium: { bg: "rgba(245, 158, 11, 0.12)", text: "var(--warning)" },
  low: { bg: "rgba(59, 130, 246, 0.12)", text: "var(--blue)" },
};

function formatAnomalyTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function RecentAnomalyCard({ anomaly }: { anomaly: Anomaly }) {
  const severity = anomalySeverityStyles[anomaly.severity] ?? anomalySeverityStyles.low;

  return (
    <Link href="/anomalies">
      <div
        className="rounded-xl border p-4 transition-all duration-200 group"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = severity.text;
          e.currentTarget.style.boxShadow = `0 0 16px ${severity.text}15`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={{ background: severity.bg, color: severity.text }}
          >
            {anomaly.severity}
          </span>
          <span className="text-[11px] tabular-nums ml-auto" style={{ color: "var(--text-muted)" }}>
            {formatAnomalyTime(anomaly.detectedAt)}
          </span>
        </div>
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>
          {anomaly.description}
        </p>
        <div className="mt-2 text-xs font-mono" style={{ color: "var(--blue)" }}>
          {anomaly.agentId}
        </div>
      </div>
    </Link>
  );
}
