"use client";

import { useEffect, useState } from "react";
import type { AgentIdentity } from "@agentgate/shared";
import type { CreateAgentRequest, RiskLevel } from "@agentgate/shared";
import { fetchAgents, createAgent, deleteAgent } from "@/lib/api";
import { mockAgents } from "@/lib/mock-data";
import { AgentTable, AgentTableSkeleton } from "@/components/AgentTable";

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("low");
  const [capabilities, setCapabilities] = useState("");

  useEffect(() => {
    fetchAgents()
      .then(setAgents)
      .catch(() => setAgents(mockAgents))
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setOwnerId("");
    setRiskLevel("low");
    setCapabilities("");
  };

  const handleRegisterAgent = async () => {
    if (!name.trim()) return;
    const caps = capabilities
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const result = await createAgent({
        name: name.trim(),
        description: description.trim(),
        ownerId: ownerId.trim(),
        riskLevel,
        capabilities: caps,
      });
      setAgents((prev) => [result, ...prev]);
      resetForm();
      setShowRegister(false);
    } catch {
      // Mock fallback
      const mockAgent: AgentIdentity = {
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description.trim(),
        ownerId: ownerId.trim() || "admin",
        status: "active",
        riskLevel,
        capabilities: caps,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActiveAt: null,
      };
      setAgents((prev) => [mockAgent, ...prev]);
      resetForm();
      setShowRegister(false);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    try {
      await deleteAgent(id);
    } catch {
      // Optimistic update regardless
    }
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "revoked" as const } : a))
    );
  };

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
          onClick={() => setShowRegister(!showRegister)}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:opacity-90"
          style={{
            background: "var(--blue)",
            color: "white",
            boxShadow: "0 0 12px rgba(59, 130, 246, 0.3)",
          }}
        >
          {showRegister ? "Cancel" : "Register Agent"}
        </button>
      </div>

      {/* Register Form */}
      {showRegister && (
        <div
          className="rounded-xl border p-6 flex flex-col gap-4"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Register New Agent
          </h3>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. data-pipeline-agent"
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

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
              placeholder="Brief description of agent purpose"
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Owner ID
              </label>
              <input
                type="text"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                placeholder="e.g. team-platform"
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Risk Level
              </label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

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
              placeholder="Comma-separated, e.g. read-data, write-data, execute"
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleRegisterAgent}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:opacity-90"
              style={{
                background: "var(--blue)",
                color: "white",
                boxShadow: "0 0 12px rgba(59, 130, 246, 0.3)",
              }}
            >
              Register Agent
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

      {/* Table */}
      {loading ? <AgentTableSkeleton /> : <AgentTable agents={agents} onDelete={handleDeleteAgent} />}
    </div>
  );
}
