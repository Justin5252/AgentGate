"use client";

import GlowCard from "./GlowCard";

function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#06D6A0" : score >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1E293B" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
}

const frameworks = [
  {
    name: "SOC 2 Type II",
    description: "Trust Services Criteria for security and availability",
    score: 82,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    name: "ISO 27001:2022",
    description: "Information Security Management System standard",
    score: 71,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    name: "HIPAA",
    description: "Health data protection for AI agent workflows",
    score: 68,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    name: "GDPR",
    description: "EU data privacy regulation for AI data processing",
    score: 74,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    name: "PCI DSS v4.0",
    description: "Payment card security for agent-accessed data",
    score: 76,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    name: "EU AI Act",
    description: "Risk-based regulation for AI systems and agents",
    score: 63,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <circle cx="9" cy="9" r="1.5" fill="currentColor" />
        <circle cx="15" cy="9" r="1.5" fill="currentColor" />
        <path d="M9 15h6" />
      </svg>
    ),
  },
];

const capabilities = [
  {
    title: "Continuous Monitoring",
    description: "Controls evaluated in real-time, not just during annual audits",
  },
  {
    title: "Auto-Evidence Collection",
    description: "Agent audit trails, policy snapshots, and system logs collected automatically",
  },
  {
    title: "One-Click Reports",
    description: "Generate audit-ready compliance reports with findings and recommendations",
  },
  {
    title: "Gap Analysis",
    description: "See exactly where you stand and what's needed to reach compliance",
  },
  {
    title: "Regulatory Intelligence",
    description: "AI-powered tracking of new regulations and their impact on your systems",
  },
  {
    title: "Auditor Portal",
    description: "Give external auditors read-only access to your evidence vault",
  },
];

export default function Compliance() {
  return (
    <section id="compliance" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-14">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--blue)" }}
          >
            Compliance Autopilot
          </span>
          <h2 className="text-3xl font-bold md:text-4xl mb-4">
            Compliance on{" "}
            <span className="gradient-text">Autopilot</span>
          </h2>
          <p
            className="mx-auto max-w-2xl text-base"
            style={{ color: "var(--text-secondary)" }}
          >
            Leverage your existing audit trail to automate compliance across every
            major framework. One platform, continuous monitoring, zero manual
            evidence collection.
          </p>
        </div>

        {/* Framework Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {frameworks.map((fw) => (
            <GlowCard key={fw.name}>
              <div className="flex items-start justify-between mb-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{
                    background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,214,160,0.1))",
                    color: "var(--blue)",
                  }}
                >
                  {fw.icon}
                </div>
                <ScoreRing score={fw.score} />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">{fw.name}</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {fw.description}
              </p>
            </GlowCard>
          ))}
        </div>

        {/* Dashboard Mockup */}
        <div
          className="rounded-xl border p-6 mb-16 overflow-hidden"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ background: "#EF4444" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#F59E0B" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#06D6A0" }} />
            <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
              AgentGate Compliance Dashboard
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {/* Mini framework list */}
            <div className="col-span-1 space-y-2">
              {["SOC 2", "GDPR", "HIPAA", "PCI DSS"].map((name, i) => {
                const scores = [82, 74, 68, 76];
                const colors = ["#06D6A0", "#F59E0B", "#EF4444", "#F59E0B"];
                return (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-lg px-3 py-2"
                    style={{
                      background: i === 0 ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.02)",
                      border: i === 0 ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
                    }}
                  >
                    <span className="text-xs font-medium" style={{ color: i === 0 ? "var(--blue)" : "var(--text-secondary)" }}>{name}</span>
                    <span className="text-xs font-bold" style={{ color: colors[i] }}>{scores[i]}%</span>
                  </div>
                );
              })}
            </div>
            {/* Mini trend */}
            <div className="col-span-2 flex flex-col justify-center">
              <svg viewBox="0 0 300 80" className="w-full h-auto">
                <defs>
                  <linearGradient id="mockGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#06D6A0" />
                  </linearGradient>
                </defs>
                <polyline points="10,60 60,50 120,45 180,35 240,20 290,15" fill="none" stroke="url(#mockGrad)" strokeWidth="2.5" strokeLinecap="round" />
                {[
                  [10, 60], [60, 50], [120, 45], [180, 35], [240, 20], [290, 15],
                ].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="3" fill="#080D1B" stroke="url(#mockGrad)" strokeWidth="2" />
                ))}
              </svg>
            </div>
            {/* Mini status list */}
            <div className="col-span-1 space-y-2">
              {[
                { label: "Passing", count: 20, color: "#06D6A0" },
                { label: "Warning", count: 4, color: "#F59E0B" },
                { label: "Failing", count: 5, color: "#EF4444" },
                { label: "Pending", count: 3, color: "#64748B" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                  </div>
                  <span className="font-mono font-bold" style={{ color: item.color }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((cap) => (
            <div key={cap.title} className="flex gap-3">
              <div
                className="mt-1 flex-shrink-0 w-5 h-5 flex items-center justify-center"
                style={{ color: "var(--teal)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">{cap.title}</h4>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {cap.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
