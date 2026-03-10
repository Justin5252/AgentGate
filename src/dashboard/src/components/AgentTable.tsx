"use client";

import type { AgentIdentity, AgentStatus, RiskLevel } from "@agentgate/shared";

interface AgentTableProps {
  agents: AgentIdentity[];
}

const statusStyles: Record<AgentStatus, { bg: string; text: string; label: string }> = {
  active: { bg: "rgba(6, 214, 160, 0.12)", text: "var(--teal)", label: "Active" },
  suspended: { bg: "rgba(245, 158, 11, 0.12)", text: "var(--warning)", label: "Suspended" },
  revoked: { bg: "rgba(239, 68, 68, 0.12)", text: "var(--danger)", label: "Revoked" },
};

const riskStyles: Record<RiskLevel, { bg: string; text: string }> = {
  low: { bg: "rgba(6, 214, 160, 0.12)", text: "var(--teal)" },
  medium: { bg: "rgba(59, 130, 246, 0.12)", text: "var(--blue)" },
  high: { bg: "rgba(245, 158, 11, 0.12)", text: "var(--warning)" },
  critical: { bg: "rgba(239, 68, 68, 0.12)", text: "var(--danger)" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AgentTable({ agents }: AgentTableProps) {
  if (agents.length === 0) {
    return (
      <div
        className="rounded-xl border p-12 text-center"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <svg
          className="w-12 h-12 mx-auto mb-3"
          style={{ color: "var(--text-muted)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No agents registered yet
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className="border-b text-left"
              style={{ borderColor: "var(--border)" }}
            >
              <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Name
              </th>
              <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Status
              </th>
              <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Risk
              </th>
              <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Owner
              </th>
              <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Last Active
              </th>
              <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => {
              const status = statusStyles[agent.status];
              const risk = riskStyles[agent.riskLevel];
              return (
                <tr
                  key={agent.id}
                  className="border-b last:border-b-0 transition-colors duration-100 cursor-pointer"
                  style={{ borderColor: "var(--border)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-card-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                        {agent.name}
                      </p>
                      <p className="text-xs mt-0.5 font-mono" style={{ color: "var(--text-muted)" }}>
                        {agent.id.slice(0, 8)}...
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: status.bg, color: status.text }}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                      style={{ background: risk.bg, color: risk.text }}
                    >
                      {agent.riskLevel}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "var(--text-secondary)" }}>
                    {agent.ownerId}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "var(--text-secondary)" }}>
                    {formatDate(agent.lastActiveAt)}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "var(--text-secondary)" }}>
                    {formatDate(agent.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AgentTableSkeleton() {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="p-5 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
