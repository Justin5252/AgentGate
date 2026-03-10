"use client";

import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer>
      {/* CTA Section */}
      <section
        className="px-6 py-24"
        style={{ background: "var(--bg-card)" }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to secure your{" "}
            <span className="gradient-text">AI agents</span>?
          </h2>
          <p
            className="mb-8 text-base"
            style={{ color: "var(--text-secondary)" }}
          >
            Join the early access program and be first to govern your agent
            fleet.
          </p>

          <form
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-lg border px-4 py-3 text-sm outline-none transition-colors focus:border-blue-500/50"
              style={{
                background: "var(--bg-primary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
            <button
              type="submit"
              className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 whitespace-nowrap"
              style={{
                background:
                  "linear-gradient(135deg, var(--blue), #2563EB)",
                boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
              }}
            >
              Get Early Access
            </button>
          </form>
        </div>
      </section>

      {/* Footer links */}
      <div
        className="border-t px-6 py-8"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--blue), var(--teal))",
              }}
            >
              AG
            </div>
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              AgentGate
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {["Docs", "GitHub", "Blog", "Status", "Twitter"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: "var(--text-muted)" }}
                >
                  {link}
                </a>
              )
            )}
          </div>

          {/* Copyright */}
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            &copy; 2026 AgentGate
          </p>
        </div>
      </div>
    </footer>
  );
}
