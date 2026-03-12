"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchAuditorFrameworks, fetchAuditorControls } from "@/lib/api";

interface Framework {
  id: string;
  frameworkId: string;
  name: string;
  description: string;
  totalControls: number;
  passingControls: number;
  failingControls: number;
  warningControls: number;
  complianceScore: number;
  lastEvaluatedAt: string;
}

interface Control {
  id: string;
  frameworkId: string;
  controlCode: string;
  title: string;
  description: string;
  category: string;
  status: string;
  severity: string;
  evidenceCount: number;
  lastEvaluatedAt: string;
}

export default function AuditorCompliancePage() {
  const { auditorToken, auditorProfile } = useAuth();
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auditorToken) return;
    async function load() {
      try {
        const fws = await fetchAuditorFrameworks(auditorToken!);
        setFrameworks(fws);
        if (fws.length > 0) {
          setSelectedFramework(fws[0].frameworkId);
        }
      } catch (err) {
        console.error("Failed to load frameworks:", err);
      }
      setLoading(false);
    }
    load();
  }, [auditorToken]);

  useEffect(() => {
    if (!auditorToken || !selectedFramework) return;
    async function loadControls() {
      try {
        const ctrls = await fetchAuditorControls(auditorToken!, selectedFramework!);
        setControls(ctrls);
      } catch (err) {
        console.error("Failed to load controls:", err);
      }
    }
    loadControls();
  }, [auditorToken, selectedFramework]);

  const statusColors: Record<string, string> = {
    passing: "#06D6A0",
    failing: "#EF4444",
    warning: "#FBBF24",
    not_evaluated: "#94A3B8",
    not_applicable: "#64748B",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--blue)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Compliance Overview</h1>
            <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: "rgba(59,130,246,0.1)", color: "var(--blue)" }}>
              Read Only
            </span>
          </div>
          {auditorProfile && (
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Viewing as {auditorProfile.name} ({auditorProfile.tenantName})
            </p>
          )}
        </div>
      </div>

      {/* Framework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {frameworks.map((fw) => (
          <button
            key={fw.frameworkId}
            onClick={() => setSelectedFramework(fw.frameworkId)}
            className="text-left p-4 rounded-xl border transition-all"
            style={{
              background: selectedFramework === fw.frameworkId ? "rgba(59,130,246,0.08)" : "var(--bg-card)",
              borderColor: selectedFramework === fw.frameworkId ? "var(--blue)" : "var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{fw.name}</h3>
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={fw.complianceScore >= 80 ? "#06D6A0" : fw.complianceScore >= 60 ? "#FBBF24" : "#EF4444"} strokeWidth="3" strokeDasharray={`${fw.complianceScore}, 100`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: "var(--text-primary)" }}>{fw.complianceScore}%</span>
              </div>
            </div>
            <div className="flex gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
              <span style={{ color: "#06D6A0" }}>{fw.passingControls} passing</span>
              <span style={{ color: "#EF4444" }}>{fw.failingControls} failing</span>
              <span style={{ color: "#FBBF24" }}>{fw.warningControls} warning</span>
            </div>
          </button>
        ))}
      </div>

      {/* Controls Table */}
      {selectedFramework && (
        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Controls — {frameworks.find((f) => f.frameworkId === selectedFramework)?.name}
            </h2>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="text-left px-4 py-2 text-xs font-medium uppercase" style={{ color: "var(--text-muted)" }}>Code</th>
                <th className="text-left px-4 py-2 text-xs font-medium uppercase" style={{ color: "var(--text-muted)" }}>Title</th>
                <th className="text-left px-4 py-2 text-xs font-medium uppercase" style={{ color: "var(--text-muted)" }}>Category</th>
                <th className="text-left px-4 py-2 text-xs font-medium uppercase" style={{ color: "var(--text-muted)" }}>Status</th>
                <th className="text-left px-4 py-2 text-xs font-medium uppercase" style={{ color: "var(--text-muted)" }}>Severity</th>
                <th className="text-left px-4 py-2 text-xs font-medium uppercase" style={{ color: "var(--text-muted)" }}>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {controls.map((ctrl) => (
                <tr key={ctrl.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="px-4 py-2 text-sm font-mono" style={{ color: "var(--blue)" }}>{ctrl.controlCode}</td>
                  <td className="px-4 py-2 text-sm" style={{ color: "var(--text-primary)" }}>{ctrl.title}</td>
                  <td className="px-4 py-2 text-sm" style={{ color: "var(--text-secondary)" }}>{ctrl.category}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ color: statusColors[ctrl.status] ?? "#94A3B8" }}>
                      {ctrl.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs" style={{ color: "var(--text-secondary)" }}>{ctrl.severity}</td>
                  <td className="px-4 py-2 text-sm" style={{ color: "var(--text-secondary)" }}>{ctrl.evidenceCount}</td>
                </tr>
              ))}
              {controls.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>No controls found for this framework</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
