"use client";

import { useState } from "react";
import type { Policy } from "@agentgate/shared";

interface PolicyTableProps {
  policies: Policy[];
  onDelete?: (id: string) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function summarizeTargets(policy: Policy): string {
  const parts: string[] = [];
  if (policy.targets.agentIds?.length) {
    parts.push(`${policy.targets.agentIds.length} agent(s)`);
  }
  if (policy.targets.agentTags?.length) {
    parts.push(`${policy.targets.agentTags.length} tag(s)`);
  }
  if (policy.targets.resources?.length) {
    parts.push(`${policy.targets.resources.length} resource(s)`);
  }
  if (policy.targets.actions?.length) {
    parts.push(`${policy.targets.actions.length} action(s)`);
  }
  return parts.length > 0 ? parts.join(", ") : "All";
}

export function PolicyTable({ policies, onDelete }: PolicyTableProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (policies.length === 0) {
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
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No policies created yet
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
                Rules
              </th>
              <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Targets
              </th>
              <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Enabled
              </th>
              <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Version
              </th>
              <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Updated
              </th>
              <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => (
              <tr
                key={policy.id}
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
                      {policy.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {policy.description.length > 60
                        ? policy.description.slice(0, 60) + "..."
                        : policy.description}
                    </p>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold"
                    style={{
                      background: "rgba(59, 130, 246, 0.12)",
                      color: "var(--blue)",
                    }}
                  >
                    {policy.rules.length}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                  {summarizeTargets(policy)}
                </td>
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        background: policy.enabled ? "var(--teal)" : "var(--danger)",
                        boxShadow: policy.enabled
                          ? "0 0 6px rgba(6, 214, 160, 0.4)"
                          : "0 0 6px rgba(239, 68, 68, 0.4)",
                      }}
                    />
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {policy.enabled ? "On" : "Off"}
                    </span>
                  </span>
                </td>
                <td className="px-5 py-3.5" style={{ color: "var(--text-secondary)" }}>
                  v{policy.version}
                </td>
                <td className="px-5 py-3.5" style={{ color: "var(--text-secondary)" }}>
                  {formatDate(policy.updatedAt)}
                </td>
                <td className="px-5 py-3.5">
                  {deleteConfirmId === policy.id ? (
                    <span className="flex items-center gap-2">
                      <button
                        className="px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150"
                        style={{
                          background: "rgba(239, 68, 68, 0.15)",
                          color: "var(--danger)",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                        }}
                        onClick={() => {
                          onDelete?.(policy.id);
                          setDeleteConfirmId(null);
                        }}
                      >
                        Confirm?
                      </button>
                      <button
                        className="px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150"
                        style={{
                          color: "var(--text-muted)",
                        }}
                        onClick={() => setDeleteConfirmId(null)}
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      className="px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150"
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "var(--danger)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(policy.id);
                      }}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PolicyTableSkeleton() {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="p-5 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-10" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-10" />
            <div className="skeleton h-4 w-10" />
            <div className="skeleton h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
