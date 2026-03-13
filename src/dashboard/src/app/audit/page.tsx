"use client";

import { useEffect, useState, useCallback } from "react";
import type { AuditEntry, PolicyEffect } from "@agentgate/shared";
import { fetchAuditLogs } from "@/lib/api";
import { mockAuditEntries } from "@/lib/mock-data";
import { AuditFeed, AuditFeedSkeleton } from "@/components/AuditFeed";
import { useWebSocket } from "@/lib/useWebSocket";
import { LiveIndicator } from "@/components/LiveIndicator";

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentFilter, setAgentFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [decisionFilter, setDecisionFilter] = useState<PolicyEffect | "">("");
  const { connected, lastMessage } = useWebSocket("audit");

  useEffect(() => {
    fetchAuditLogs({ limit: 50 })
      .then(setEntries)
      .catch(() => setEntries(mockAuditEntries))
      .finally(() => setLoading(false));
  }, []);

  const filteredEntries = useCallback(() => {
    return entries.filter((entry) => {
      if (agentFilter && !entry.agentId.toLowerCase().includes(agentFilter.toLowerCase())) {
        return false;
      }
      if (actionFilter && !entry.action.toLowerCase().includes(actionFilter.toLowerCase())) {
        return false;
      }
      if (decisionFilter && entry.decision !== decisionFilter) {
        return false;
      }
      return true;
    });
  }, [entries, agentFilter, actionFilter, decisionFilter]);

  // Listen for real-time audit entries
  useEffect(() => {
    if (lastMessage?.channel === "audit" && lastMessage.data) {
      const entry = lastMessage.data as AuditEntry;
      setEntries((prev) => [entry, ...prev]);
    }
  }, [lastMessage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Audit Log
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Complete record of all authorization decisions
          </p>
        </div>
        <LiveIndicator connected={connected} />
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap gap-3 p-4 rounded-xl border"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <input
          type="text"
          placeholder="Filter by Agent ID..."
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none focus:ring-1"
          style={{
            background: "var(--bg-primary)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        />
        <input
          type="text"
          placeholder="Filter by action..."
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none focus:ring-1"
          style={{
            background: "var(--bg-primary)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        />
        <select
          value={decisionFilter}
          onChange={(e) => setDecisionFilter(e.target.value as PolicyEffect | "")}
          className="px-3 py-2 rounded-lg text-sm border outline-none focus:ring-1"
          style={{
            background: "var(--bg-primary)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        >
          <option value="">All decisions</option>
          <option value="allow">Allow</option>
          <option value="deny">Deny</option>
          <option value="escalate">Escalate</option>
        </select>
        {(agentFilter || actionFilter || decisionFilter) && (
          <button
            onClick={() => {
              setAgentFilter("");
              setActionFilter("");
              setDecisionFilter("");
            }}
            className="px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Feed */}
      {loading ? (
        <AuditFeedSkeleton />
      ) : (
        <>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Showing {filteredEntries().length} of {entries.length} entries
          </p>
          <AuditFeed entries={filteredEntries()} />
        </>
      )}
    </div>
  );
}
