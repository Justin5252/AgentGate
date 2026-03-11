"use client";

import Link from "next/link";

const quickLinks = [
  {
    title: "Getting Started",
    href: "/getting-started",
    description: "Install the SDK and make your first API call in 5 minutes.",
    icon: "rocket",
  },
  {
    title: "API Reference",
    href: "/api-reference",
    description: "Complete reference for all REST API endpoints.",
    icon: "code",
  },
  {
    title: "SDKs",
    href: "/sdks/typescript",
    description: "TypeScript, Python, and Go client libraries.",
    icon: "package",
  },
  {
    title: "Integrations",
    href: "/integrations/openai",
    description: "OpenAI, Anthropic, LangChain, CrewAI, and webhooks.",
    icon: "puzzle",
  },
];

function IconRocket() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconPackage() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function IconPuzzle() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.452-.968-.899a1.67 1.67 0 0 0-3.085 0c-.166.447-.497.83-.968.899a.98.98 0 0 1-.837-.276l-1.611-1.611a2.408 2.408 0 0 1 0-3.408l1.568-1.568a.98.98 0 0 0 .289-.878 1.67 1.67 0 0 0-1.327-1.392c-.447-.166-.83-.497-.899-.968A.98.98 0 0 1 11.276 5l1.611-1.611a2.408 2.408 0 0 1 3.408 0L17.863 4.957a.98.98 0 0 0 .878.289 1.67 1.67 0 0 0 1.392-1.327c.166-.447.497-.83.968-.899A.98.98 0 0 1 21.377 3.296l1.611 1.611" />
      <path d="M4.561 16.15c.049-.322-.059-.648-.289-.878L2.704 13.704A2.408 2.408 0 0 1 2.704 10.296l1.611-1.611a.98.98 0 0 1 .837-.276c.47.07.802.452.968.899a1.67 1.67 0 0 0 3.085 0c.166-.447.497-.83.968-.899a.98.98 0 0 1 .837.276L12.621 10.296a2.408 2.408 0 0 1 0 3.408l-1.568 1.568a.98.98 0 0 0-.289.878 1.67 1.67 0 0 0 1.327 1.392c.447.166.83.497.899.968a.98.98 0 0 1-.276.837L11.103 20.958a2.408 2.408 0 0 1-3.408 0l-1.568-1.568a.98.98 0 0 0-.878-.289 1.67 1.67 0 0 0-1.392 1.327c-.166.447-.497.83-.968.899a.98.98 0 0 1-.837-.276L.44 19.44" />
    </svg>
  );
}

const iconMap: Record<string, () => React.JSX.Element> = {
  rocket: IconRocket,
  code: IconCode,
  package: IconPackage,
  puzzle: IconPuzzle,
};

export default function DocsHome() {
  return (
    <div>
      {/* Hero */}
      <section style={{ marginBottom: 48 }}>
        <h1
          className="gradient-text"
          style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}
        >
          AgentGate Documentation
        </h1>
        <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", maxWidth: 640, lineHeight: 1.7 }}>
          The identity and access control layer for AI agents. Manage agent identities, enforce fine-grained
          policies, audit every decision, and govern agent-to-agent communication — all through a single platform.
        </p>
      </section>

      {/* Quick Start Banner */}
      <section
        style={{
          marginBottom: 48,
          padding: "24px 28px",
          background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(6,214,160,0.08))",
          border: "1px solid var(--border)",
          borderRadius: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Quick Start
          </h2>
        </div>
        <p style={{ color: "var(--text-secondary)", margin: "0 0 16px 0", lineHeight: 1.6 }}>
          Get up and running in under 5 minutes. Install the SDK, register an agent, create a policy, and
          start enforcing permissions.
        </p>
        <Link
          href="/getting-started"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            background: "var(--blue)",
            color: "#fff",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: "0.9rem",
            textDecoration: "none",
            transition: "opacity 0.15s",
          }}
        >
          Get Started
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </section>

      {/* Quick Links Grid */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>
          Explore the Docs
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {quickLinks.map((link) => {
            const Icon = iconMap[link.icon];
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "block",
                  padding: 24,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  textDecoration: "none",
                  transition: "background 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-card-hover)";
                  e.currentTarget.style.borderColor = "var(--blue)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg-card)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                <div style={{ marginBottom: 14 }}>
                  <Icon />
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                  {link.title}
                </h3>
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                  {link.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Platform Overview */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
          What is AgentGate?
        </h2>
        <div style={{ color: "var(--text-secondary)", lineHeight: 1.8, maxWidth: 720 }}>
          <p style={{ marginBottom: 16 }}>
            AgentGate is the authorization layer purpose-built for AI agents. As organizations deploy autonomous
            agents across their infrastructure, the need for a centralized identity and permissions platform
            becomes critical. AgentGate provides that layer — think of it as{" "}
            <strong style={{ color: "var(--text-primary)" }}>Okta for AI agents</strong>.
          </p>
          <p style={{ marginBottom: 16 }}>
            Every agent gets a cryptographic identity with UUIDv7 identifiers. Policies combine role-based (RBAC)
            and attribute-based (ABAC) access control, evaluated in real time. Every authorization decision is
            recorded to an append-only audit trail for compliance. And with A2A governance, you can control how
            agents communicate with each other — enforcing rate limits, channel restrictions, and interaction graphs.
          </p>
          <p>
            AgentGate supports the tools you already use:{" "}
            <Link href="/integrations/openai" style={{ color: "var(--blue)" }}>OpenAI</Link>,{" "}
            <Link href="/integrations/anthropic" style={{ color: "var(--blue)" }}>Anthropic</Link>,{" "}
            <Link href="/integrations/langchain" style={{ color: "var(--blue)" }}>LangChain</Link>, and{" "}
            <Link href="/integrations/crewai" style={{ color: "var(--blue)" }}>CrewAI</Link> — with native
            SDKs for{" "}
            <Link href="/sdks/typescript" style={{ color: "var(--blue)" }}>TypeScript</Link>,{" "}
            <Link href="/sdks/python" style={{ color: "var(--blue)" }}>Python</Link>, and{" "}
            <Link href="/sdks/go" style={{ color: "var(--blue)" }}>Go</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
