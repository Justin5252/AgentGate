"use client";

import CodeBlock from "./CodeBlock";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-32 pb-20">
      {/* Background gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.12), rgba(6,214,160,0.05), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
          style={{
            borderColor: "rgba(59,130,246,0.3)",
            background: "rgba(59,130,246,0.05)",
            color: "var(--blue)",
          }}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: "var(--teal)" }}
          />
          Now in Early Access
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          The Identity Layer{" "}
          <br className="hidden md:block" />
          for{" "}
          <span className="gradient-text">AI Agents</span>
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto mb-10 max-w-2xl text-lg md:text-xl leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Every AI agent in your company needs an identity. AgentGate gives you
          control over what they can access, when, and why.
        </p>

        {/* CTA buttons */}
        <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#"
            className="rounded-lg px-8 py-3 text-base font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, var(--blue), #2563EB)",
              boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
            }}
          >
            Get Started Free
          </a>
          <a
            href="#"
            className="rounded-lg border px-8 py-3 text-base font-semibold transition-colors hover:bg-white/5"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            View Documentation
          </a>
        </div>

        {/* Code block */}
        <CodeBlock />
      </div>
    </section>
  );
}
