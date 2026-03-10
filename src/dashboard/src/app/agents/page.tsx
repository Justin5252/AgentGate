"use client";

import { useEffect, useState } from "react";
import type { AgentIdentity } from "@agentgate/shared";
import { fetchAgents } from "@/lib/api";
import { mockAgents } from "@/lib/mock-data";
import { AgentTable, AgentTableSkeleton } from "@/components/AgentTable";

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentIdentity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents()
      .then(setAgents)
      .catch(() => setAgents(mockAgents))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Agents
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage registered AI agent identities
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:opacity-90"
          style={{
            background: "var(--blue)",
            color: "white",
            boxShadow: "0 0 12px rgba(59, 130, 246, 0.3)",
          }}
        >
          Register Agent
        </button>
      </div>

      {/* Table */}
      {loading ? <AgentTableSkeleton /> : <AgentTable agents={agents} />}
    </div>
  );
}
