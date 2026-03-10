"use client";

import type { Anomaly } from "@/lib/api";

interface AnomalyListProps {
  anomalies: Anomaly[];
  onResolve?: (id: string) => void;
}

const severityStyles: Record<string, { bg: string; text: string; ring?: string }> = {
  critical: { bg: "rgba(239, 68, 68, 0.15)", text: "var(--danger)", ring: "0 0 8px rgba(239, 68, 68, 0.4)" },
  high: { bg: "rgba(239, 68, 68, 0.10)", text: "var(--danger)" },
  medium: { bg: "rgba(245, 158, 11, 0.12)", text: "var(--warning)" },
  low: { bg: "rgba(59, 130, 246, 0.12)", text: "var(--blue)" },
};

const typeLabels: Record<string, string> = {
  burst_activity: "Burst Activity",
  unusual_resource: "Unusual Resource",
  permission_escalation: "Permission Escalation",
  unusual_time: "Unusual Time",
  high_deny_rate: "High Deny Rate",
  unusual_action: "Unusual Action",
};

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AnomalyList({ anomalies, onResolve }: AnomalyListProps) {
  if (anomalies.length === 0) {
    return (
      <div
        className="rounded-xl border p-8 text-center"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <svg
          className="w-10 h-10 mx-auto mb-3"
          style={{ color: "var(--text-muted)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No anomalies found
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      {anomalies.map((anomaly) => {
        const severity = severityStyles[anomaly.severity] ?? severityStyles.low;
        return (
          <div
            key={anomaly.id}
            className="px-4 py-4 border-b last:border-b-0 transition-colors duration-100"
            style={{ borderColor: "var(--border)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-card-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div className="flex items-start gap-3">
              {/* Severity badge */}
              <span
                className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-0.5"
                style={{
                  background: severity.bg,
                  color: severity.text,
                  boxShadow: anomaly.severity === "critical" ? severity.ring : undefined,
                }}
              >
                {anomaly.severity === "critical" && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" style={{ background: "var(--danger)" }} />
                )}
                {anomaly.severity}
              </span>

              {/* Type badge */}
              <span
                className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium tracking-wider mt-0.5"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "var(--text-secondary)",
                }}
              >
                {typeLabels[anomaly.type] ?? anomaly.type}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {anomaly.description}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-xs">
                  <span className="font-mono" style={{ color: "var(--blue)" }}>
                    {anomaly.agentId}
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>&middot;</span>
                  <span style={{ color: "var(--text-muted)" }}>
                    {formatRelativeTime(anomaly.detectedAt)}
                  </span>
                  {anomaly.resolved && (
                    <>
                      <span style={{ color: "var(--text-muted)" }}>&middot;</span>
                      <span className="inline-flex items-center gap-1" style={{ color: "var(--teal)" }}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Resolved
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Resolve button */}
              {!anomaly.resolved && onResolve && (
                <button
                  onClick={() => onResolve(anomaly.id)}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                  style={{
                    background: "rgba(6, 214, 160, 0.10)",
                    color: "var(--teal)",
                    border: "1px solid rgba(6, 214, 160, 0.20)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(6, 214, 160, 0.20)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(6, 214, 160, 0.10)";
                  }}
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AnomalyListSkeleton() {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="skeleton h-5 w-16 rounded" />
            <div className="skeleton h-5 w-24 rounded" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
