"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchAuditorAuditLogs } from "@/lib/api";

interface AuditLogEntry {
  id: string;
  agentId: string;
  action: string;
  resource: string;
  decision: string;
  policyId: string | null;
  timestamp: string;
  durationMs: number;
}

export default function AuditorAuditPage() {
  const { auditorToken, auditorProfile } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    if (!auditorToken) return;
    async function load() {
      try {
        const data = await fetchAuditorAuditLogs(auditorToken!, { limit: pageSize, offset: page * pageSize });
        setLogs(data);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      }
      setLoading(false);
    }
    load();
  }, [auditorToken, page]);

  const decisionColors: Record<string, string> = {
    allow: "#06D6A0",
    deny: "#EF4444",
    escalate: "#FBBF24",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Audit Log</h1>
            <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: "rgba(59,130,246,0.1)", color: "var(--blue)" }}>
              Read Only
            </span>
          </div>
          {auditorProfile && (
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Agent activity log — viewing as {auditorProfile.name}
            </p>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Timestamp</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Agent</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Action</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Resource</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Decision</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>Loading...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>No audit log entries</td>
              </tr>
            ) : (
              logs.map((entry) => (
                <tr key={entry.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="px-4 py-2 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm font-mono" style={{ color: "var(--text-secondary)" }}>
                    {entry.agentId.substring(0, 12)}...
                  </td>
                  <td className="px-4 py-2 text-sm" style={{ color: "var(--text-primary)" }}>{entry.action}</td>
                  <td className="px-4 py-2 text-sm font-mono" style={{ color: "var(--text-secondary)" }}>{entry.resource}</td>
                  <td className="px-4 py-2">
                    <span className="text-xs font-medium" style={{ color: decisionColors[entry.decision] ?? "var(--text-secondary)" }}>
                      {entry.decision}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs" style={{ color: "var(--text-muted)" }}>{entry.durationMs.toFixed(1)}ms</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-30"
          style={{ color: "var(--text-secondary)", background: "rgba(255,255,255,0.05)" }}
        >
          Previous
        </button>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>Page {page + 1}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={logs.length < pageSize}
          className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-30"
          style={{ color: "var(--text-secondary)", background: "rgba(255,255,255,0.05)" }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
