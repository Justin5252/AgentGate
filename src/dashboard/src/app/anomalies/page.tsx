"use client";

import { useEffect, useState, useMemo } from "react";
import type { Anomaly, AnomalyStats } from "@/lib/api";
import { fetchAnomalies, fetchAnomalyStats, resolveAnomaly } from "@/lib/api";
import type { Anomaly as AnomalyType } from "@/lib/api";
import { mockAnomalies, mockAnomalyStats } from "@/lib/mock-data";
import { StatCard, StatCardSkeleton } from "@/components/StatCard";
import { AnomalyList, AnomalyListSkeleton } from "@/components/AnomalyList";
import { useWebSocket } from "@/lib/useWebSocket";
import { LiveIndicator } from "@/components/LiveIndicator";
import { useToast } from "@/components/Toast";

const severityOptions = ["all", "critical", "high", "medium", "low"];
const typeOptions = [
  "all",
  "burst_activity",
  "unusual_resource",
  "permission_escalation",
  "unusual_time",
  "high_deny_rate",
  "unusual_action",
];

const typeLabels: Record<string, string> = {
  all: "All Types",
  burst_activity: "Burst Activity",
  unusual_resource: "Unusual Resource",
  permission_escalation: "Permission Escalation",
  unusual_time: "Unusual Time",
  high_deny_rate: "High Deny Rate",
  unusual_action: "Unusual Action",
};

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [stats, setStats] = useState<AnomalyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState("all");
  const [type, setType] = useState("all");
  const [showResolved, setShowResolved] = useState(false);
  const { connected, lastMessage } = useWebSocket("anomalies");
  const { addToast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        const [anomalyData, statsData] = await Promise.all([
          fetchAnomalies().catch(() => null),
          fetchAnomalyStats().catch(() => null),
        ]);
        setAnomalies(anomalyData ?? mockAnomalies);
        setStats(statsData ?? mockAnomalyStats);
      } catch {
        setAnomalies(mockAnomalies);
        setStats(mockAnomalyStats);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredAnomalies = useMemo(() => {
    return anomalies.filter((a) => {
      if (severity !== "all" && a.severity !== severity) return false;
      if (type !== "all" && a.type !== type) return false;
      if (!showResolved && a.resolved) return false;
      return true;
    });
  }, [anomalies, severity, type, showResolved]);

  const handleResolve = async (id: string) => {
    try {
      await resolveAnomaly(id);
    } catch {
      // Fall through to local state update
    }
    setAnomalies((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
  };

  // Listen for real-time anomalies
  useEffect(() => {
    if (lastMessage?.channel === "anomalies" && lastMessage.data) {
      const anomaly = lastMessage.data as AnomalyType;
      setAnomalies((prev) => [anomaly, ...prev]);
      if (anomaly.severity === "critical") {
        addToast(`Critical anomaly: ${anomaly.description}`, "error");
      } else if (anomaly.severity === "high") {
        addToast(`High severity anomaly: ${anomaly.description}`, "warning");
      }
    }
  }, [lastMessage, addToast]);

  const criticalCount = stats?.bySeverity?.critical ?? 0;
  const highCount = stats?.bySeverity?.high ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Anomaly Detection
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Monitor unusual agent behavior and potential threats
          </p>
        </div>
        <LiveIndicator connected={connected} />
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Anomalies"
            value={stats?.total ?? 0}
            subtitle="All time"
            color="blue"
          />
          <StatCard
            title="Unresolved"
            value={stats?.unresolvedCount ?? 0}
            subtitle="Needs attention"
            color={(stats?.unresolvedCount ?? 0) > 0 ? "red" : "teal"}
          />
          <StatCard
            title="Critical"
            value={criticalCount}
            subtitle="Highest severity"
            color={criticalCount > 0 ? "red" : "teal"}
          />
          <StatCard
            title="High"
            value={highCount}
            subtitle="Elevated severity"
            color={highCount > 0 ? "yellow" : "teal"}
          />
        </div>
      )}

      {/* Filter Bar */}
      <div
        className="flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        {/* Severity dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            Severity
          </label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium outline-none"
            style={{
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            {severityOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "all" ? "All Severities" : opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Type dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium outline-none"
            style={{
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            {typeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {typeLabels[opt] ?? opt}
              </option>
            ))}
          </select>
        </div>

        {/* Show resolved toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            Show resolved
          </label>
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="relative w-9 h-5 rounded-full transition-colors duration-200"
            style={{
              background: showResolved ? "var(--teal)" : "var(--border)",
            }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform duration-200"
              style={{
                background: "var(--text-primary)",
                transform: showResolved ? "translateX(16px)" : "translateX(0)",
              }}
            />
          </button>
        </div>
      </div>

      {/* Anomaly List */}
      {loading ? (
        <AnomalyListSkeleton />
      ) : (
        <AnomalyList anomalies={filteredAnomalies} onResolve={handleResolve} />
      )}
    </div>
  );
}
