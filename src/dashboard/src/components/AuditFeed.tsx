"use client";

import type { AuditEntry, PolicyEffect } from "@agentgate/shared";

interface AuditFeedProps {
  entries: AuditEntry[];
}

const decisionStyles: Record<PolicyEffect, { bg: string; text: string; label: string }> = {
  allow: { bg: "rgba(6, 214, 160, 0.12)", text: "var(--teal)", label: "Allow" },
  deny: { bg: "rgba(239, 68, 68, 0.12)", text: "var(--danger)", label: "Deny" },
  escalate: { bg: "rgba(245, 158, 11, 0.12)", text: "var(--warning)", label: "Escalate" },
};

function formatTimestamp(dateStr: string): string {
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

export function AuditFeed({ entries }: AuditFeedProps) {
  if (entries.length === 0) {
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
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No audit entries yet
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
    >
      {entries.map((entry) => {
        const decision = decisionStyles[entry.decision];
        return (
          <div
            key={entry.id}
            className="px-4 py-3 flex items-center gap-3 transition-colors duration-100 border-b last:border-b-0"
            style={{ borderColor: "var(--border)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-card-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {/* Decision badge */}
            <span
              className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
              style={{ background: decision.bg, color: decision.text }}
            >
              {decision.label}
            </span>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-mono truncate" style={{ color: "var(--blue)" }}>
                  {entry.agentId.slice(0, 8)}
                </span>
                <span style={{ color: "var(--text-muted)" }}>&middot;</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {entry.action}
                </span>
                <span style={{ color: "var(--text-muted)" }}>&rarr;</span>
                <span className="truncate" style={{ color: "var(--text-secondary)" }}>
                  {entry.resource}
                </span>
              </div>
            </div>

            {/* Timestamp */}
            <span className="shrink-0 text-[11px] tabular-nums" style={{ color: "var(--text-muted)" }}>
              {formatTimestamp(entry.timestamp)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AuditFeedSkeleton() {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="p-4 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton h-5 w-14 rounded" />
            <div className="skeleton h-4 flex-1" />
            <div className="skeleton h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
