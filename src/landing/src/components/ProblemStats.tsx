"use client";

import GlowCard from "./GlowCard";

const stats = [
  {
    value: "88%",
    label: "of organizations have had AI agent security incidents",
  },
  {
    value: "78%",
    label: "of companies treat agents as human users, not independent entities",
  },
  {
    value: "0%",
    label: "of traditional IAM tools were designed for AI agents",
  },
];

export default function ProblemStats() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
          AI Agents Are the Biggest{" "}
          <span className="gradient-text">Security Gap</span> in Your Stack
        </h2>
        <p
          className="mx-auto mb-14 max-w-2xl text-center text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          AI agents are proliferating faster than security teams can govern
          them. They inherit user permissions, bypass traditional IAM, and
          operate with near-zero visibility.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <GlowCard key={stat.value} className="text-center">
              <div
                className="stat-number mb-3 text-5xl font-bold gradient-text"
              >
                {stat.value}
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {stat.label}
              </p>
            </GlowCard>
          ))}
        </div>

        <p
          className="mx-auto mt-10 max-w-3xl text-center text-sm leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          Traditional identity tools were built for humans clicking through
          web apps — not autonomous agents making thousands of API calls per
          minute. The governance gap is widening every day.
        </p>
      </div>
    </section>
  );
}
