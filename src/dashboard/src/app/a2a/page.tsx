"use client";

import { useEffect, useState } from "react";
import type { A2AGraph, A2AChannel, A2AStats } from "@/lib/api";
import { fetchA2AGraph, fetchA2AChannels, fetchA2AStats } from "@/lib/api";
import { mockA2AGraph, mockA2AChannels, mockA2AStats } from "@/lib/mock-data";
import { StatCard, StatCardSkeleton } from "@/components/StatCard";
import { A2AGraphVisualization, A2AGraphSkeleton } from "@/components/A2AGraph";

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

export default function A2APage() {
  const [graph, setGraph] = useState<A2AGraph | null>(null);
  const [channels, setChannels] = useState<A2AChannel[]>([]);
  const [stats, setStats] = useState<A2AStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [graphData, channelsData, statsData] = await Promise.all([
          fetchA2AGraph().catch(() => null),
          fetchA2AChannels().catch(() => null),
          fetchA2AStats().catch(() => null),
        ]);
        setGraph(graphData ?? mockA2AGraph);
        setChannels(channelsData ?? mockA2AChannels);
        setStats(statsData ?? mockA2AStats);
      } catch {
        setGraph(mockA2AGraph);
        setChannels(mockA2AChannels);
        setStats(mockA2AStats);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Build a name lookup from graph nodes
  const agentNames: Record<string, string> = {};
  if (graph) {
    for (const node of graph.nodes) {
      agentNames[node.agentId] = node.agentName;
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Agent-to-Agent Graph
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Visualize and manage inter-agent communication channels
        </p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Active Channels"
            value={stats?.activeChannels ?? 0}
            subtitle="Enabled connections"
            color="teal"
          />
          <StatCard
            title="Communications (24h)"
            value={stats?.totalCommunications24h ?? 0}
            subtitle="Inter-agent requests"
            color="blue"
          />
          <StatCard
            title="Blocked Channels"
            value={stats?.blockedChannels ?? 0}
            subtitle="Disabled connections"
            color={(stats?.blockedChannels ?? 0) > 0 ? "red" : "teal"}
          />
        </div>
      )}

      {/* Graph Visualization */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Communication Graph
        </h2>
        {loading || !graph ? (
          <A2AGraphSkeleton />
        ) : (
          <A2AGraphVisualization graph={graph} />
        )}
      </div>

      {/* Channel List Table */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Communication Channels
        </h2>
        {loading ? (
          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton h-4 flex-1" />
                  <div className="skeleton h-4 flex-1" />
                  <div className="skeleton h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            {/* Table header */}
            <div
              className="grid grid-cols-6 gap-4 px-4 py-3 text-xs font-medium uppercase tracking-wider border-b"
              style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
            >
              <span>Source Agent</span>
              <span>Target Agent</span>
              <span>Allowed Actions</span>
              <span>Rate Limit</span>
              <span>Status</span>
              <span>Last Comm.</span>
            </div>

            {/* Table rows */}
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="grid grid-cols-6 gap-4 px-4 py-3 text-sm border-b last:border-b-0 transition-colors duration-100"
                style={{ borderColor: "var(--border)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Source Agent */}
                <div className="flex items-center min-w-0">
                  <span className="truncate text-xs font-medium" style={{ color: "var(--blue)" }}>
                    {agentNames[channel.sourceAgentId] ?? channel.sourceAgentId}
                  </span>
                </div>

                {/* Target Agent */}
                <div className="flex items-center min-w-0">
                  <span className="truncate text-xs font-medium" style={{ color: "var(--teal)" }}>
                    {agentNames[channel.targetAgentId] ?? channel.targetAgentId}
                  </span>
                </div>

                {/* Allowed Actions */}
                <div className="flex flex-wrap items-center gap-1">
                  {channel.allowedActions.map((action) => (
                    <span
                      key={action}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {action}
                    </span>
                  ))}
                </div>

                {/* Rate Limit */}
                <div className="flex items-center">
                  <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
                    {channel.rateLimit}/min
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: channel.enabled
                        ? "rgba(6, 214, 160, 0.12)"
                        : "rgba(239, 68, 68, 0.12)",
                      color: channel.enabled ? "var(--teal)" : "var(--danger)",
                    }}
                  >
                    {channel.enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>

                {/* Last Communication */}
                <div className="flex items-center">
                  <span className="text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
                    {formatRelativeTime(channel.lastCommunication)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
