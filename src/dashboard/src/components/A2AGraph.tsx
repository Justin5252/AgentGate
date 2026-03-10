"use client";

import { useState, useMemo } from "react";
import type { A2AGraph as A2AGraphType } from "@/lib/api";

interface A2AGraphProps {
  graph: A2AGraphType;
}

const GRAPH_SIZE = 600;
const CENTER = GRAPH_SIZE / 2;
const RADIUS = 220;
const NODE_RADIUS_BASE = 28;

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function A2AGraphVisualization({ graph }: A2AGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const count = graph.nodes.length;
    graph.nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      positions[node.agentId] = {
        x: CENTER + RADIUS * Math.cos(angle),
        y: CENTER + RADIUS * Math.sin(angle),
      };
    });
    return positions;
  }, [graph.nodes]);

  const maxConnections = useMemo(() => {
    return Math.max(...graph.nodes.map((n) => n.incomingCount + n.outgoingCount), 1);
  }, [graph.nodes]);

  const maxRequestCount = useMemo(() => {
    return Math.max(...graph.edges.map((e) => e.requestCount), 1);
  }, [graph.edges]);

  const connectedEdges = useMemo(() => {
    if (!hoveredNode) return new Set<number>();
    const set = new Set<number>();
    graph.edges.forEach((edge, i) => {
      if (edge.source === hoveredNode || edge.target === hoveredNode) {
        set.add(i);
      }
    });
    return set;
  }, [hoveredNode, graph.edges]);

  const connectedNodes = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const set = new Set<string>([hoveredNode]);
    graph.edges.forEach((edge) => {
      if (edge.source === hoveredNode) set.add(edge.target);
      if (edge.target === hoveredNode) set.add(edge.source);
    });
    return set;
  }, [hoveredNode, graph.edges]);

  return (
    <div
      className="rounded-xl border p-6 overflow-hidden"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="flex justify-center">
        <svg
          width={GRAPH_SIZE}
          height={GRAPH_SIZE}
          viewBox={`0 0 ${GRAPH_SIZE} ${GRAPH_SIZE}`}
          className="max-w-full h-auto"
        >
          {/* Edges */}
          {graph.edges.map((edge, i) => {
            const from = nodePositions[edge.source];
            const to = nodePositions[edge.target];
            if (!from || !to) return null;

            const isHighlighted = hoveredNode ? connectedEdges.has(i) : true;
            const opacity = hoveredNode ? (isHighlighted ? 1 : 0.1) : 0.6;
            const strokeWidth = 1 + (edge.requestCount / maxRequestCount) * 3;
            const color = edge.status === "blocked" ? "var(--danger)" : "var(--teal)";

            // Calculate midpoint offset for curved edges
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const offsetX = (-dy / len) * 20;
            const offsetY = (dx / len) * 20;

            return (
              <g key={`edge-${i}`}>
                <path
                  d={`M ${from.x} ${from.y} Q ${midX + offsetX} ${midY + offsetY} ${to.x} ${to.y}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                  strokeLinecap="round"
                  style={{ transition: "opacity 0.2s" }}
                />
                {/* Arrow */}
                <circle
                  cx={to.x + (from.x - to.x) * 0.15}
                  cy={to.y + (from.y - to.y) * 0.15}
                  r={2.5}
                  fill={color}
                  opacity={opacity}
                  style={{ transition: "opacity 0.2s" }}
                />
                {/* Request count label on hover */}
                {isHighlighted && hoveredNode && (
                  <text
                    x={midX + offsetX * 0.8}
                    y={midY + offsetY * 0.8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="var(--text-secondary)"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {edge.requestCount}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {graph.nodes.map((node) => {
            const pos = nodePositions[node.agentId];
            if (!pos) return null;

            const totalConnections = node.incomingCount + node.outgoingCount;
            const nodeRadius = NODE_RADIUS_BASE + (totalConnections / maxConnections) * 12;
            const isHighlighted = hoveredNode ? connectedNodes.has(node.agentId) : true;
            const isHovered = hoveredNode === node.agentId;
            const opacity = hoveredNode ? (isHighlighted ? 1 : 0.2) : 1;

            // Truncate name
            const displayName = node.agentName.length > 14
              ? node.agentName.slice(0, 12) + "..."
              : node.agentName;

            return (
              <g
                key={node.agentId}
                style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                opacity={opacity}
                onMouseEnter={() => setHoveredNode(node.agentId)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Glow ring */}
                {isHovered && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius + 6}
                    fill="none"
                    stroke="var(--teal)"
                    strokeWidth={2}
                    opacity={0.4}
                  />
                )}

                {/* Node ring */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius + 2}
                  fill="none"
                  stroke="var(--teal)"
                  strokeWidth={2}
                  opacity={0.6}
                />

                {/* Node background */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius}
                  fill="var(--bg-card)"
                  stroke="var(--border)"
                  strokeWidth={1}
                />

                {/* Agent name */}
                <text
                  x={pos.x}
                  y={pos.y - 6}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--text-primary)"
                  fontSize="9"
                  fontWeight="600"
                >
                  {displayName}
                </text>

                {/* Connection counts */}
                <text
                  x={pos.x}
                  y={pos.y + 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--text-muted)"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {node.incomingCount}in / {node.outgoingCount}out
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 rounded" style={{ background: "var(--teal)" }} />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 rounded" style={{ background: "var(--danger)" }} />
          <span>Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Line thickness = request volume</span>
        </div>
      </div>
    </div>
  );
}

export function A2AGraphSkeleton() {
  return (
    <div
      className="rounded-xl border p-6"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="flex justify-center">
        <div className="skeleton" style={{ width: GRAPH_SIZE, height: GRAPH_SIZE, borderRadius: "50%" }} />
      </div>
    </div>
  );
}
