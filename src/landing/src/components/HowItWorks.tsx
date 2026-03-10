"use client";

import GlowCard from "./GlowCard";

const steps = [
  {
    number: "01",
    title: "Register",
    description:
      "Give every AI agent a unique identity with capabilities, risk level, and ownership.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Define Policies",
    description:
      "Write human-readable rules: who can access what, when, and under what conditions.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Enforce & Monitor",
    description:
      "Every agent action is authorized in real-time and logged to an immutable audit trail.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="px-6 py-24" style={{ background: "var(--bg-card)" }}>
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
          Three Steps to{" "}
          <span className="gradient-text">Secure Every Agent</span>
        </h2>
        <p
          className="mx-auto mb-14 max-w-xl text-center text-base"
          style={{ color: "var(--text-secondary)" }}
        >
          From zero to fully governed AI agents in minutes, not months.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <GlowCard
              key={step.number}
              className="text-center"
            >
              {/* Step number */}
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,214,160,0.1))",
                  color: "var(--blue)",
                }}
              >
                {step.icon}
              </div>
              <div
                className="mb-2 text-xs font-bold tracking-widest uppercase"
                style={{ color: "var(--teal)" }}
              >
                Step {step.number}
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">
                {step.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {step.description}
              </p>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  );
}
