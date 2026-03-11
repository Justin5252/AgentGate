import Link from "next/link";
import { Callout } from "@/components/Callout";

const sectionStyle = { marginBottom: 56 };
const h2Style = { fontSize: "1.5rem", fontWeight: 700 as const, color: "var(--text-primary)", marginBottom: 16 };
const pStyle = { color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 16 };

export default function Concepts() {
  return (
    <div>
      <h1
        className="gradient-text"
        style={{ fontSize: "2.25rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}
      >
        Core Concepts
      </h1>
      <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: 48, maxWidth: 640, lineHeight: 1.7 }}>
        The building blocks of AgentGate. Understanding these concepts will help you design a secure,
        auditable, and scalable permissions layer for your AI agents.
      </p>

      {/* ---- Agent Identity ---- */}
      <section id="agent-identity" style={sectionStyle}>
        <h2 style={h2Style}>Agent Identity</h2>
        <p style={pStyle}>
          Every AI agent managed by AgentGate receives a unique, cryptographic identity. Identifiers use the
          UUIDv7 format, which embeds a millisecond-precision timestamp so that IDs are both globally unique
          and time-sortable. This makes it easy to trace agent activity chronologically without requiring
          a separate timestamp index.
        </p>
        <p style={pStyle}>
          An agent identity carries structured metadata: a human-readable{" "}
          <strong style={{ color: "var(--text-primary)" }}>name</strong>, an{" "}
          <strong style={{ color: "var(--text-primary)" }}>owner</strong> (the team or system that created it),
          a list of{" "}
          <strong style={{ color: "var(--text-primary)" }}>capabilities</strong> (the actions it may request),
          and a{" "}
          <strong style={{ color: "var(--text-primary)" }}>risk level</strong> (low, medium, high, or critical)
          that policies can use for attribute-based decisions.
        </p>
        <p style={pStyle}>
          Agents follow a lifecycle:{" "}
          <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>active</code>{" "}
          agents can request authorization normally.{" "}
          <code style={{ color: "var(--warning)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>suspended</code>{" "}
          agents are temporarily blocked — all authorization checks return deny until the agent is reactivated.{" "}
          <code style={{ color: "var(--danger)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>revoked</code>{" "}
          agents are permanently decommissioned and cannot be restored. Lifecycle transitions are recorded in
          the audit trail.
        </p>
        <Callout type="info">
          Agent identities are immutable once created. To change an agent&apos;s capabilities, create a new version
          of the agent and revoke the old one. This ensures a clean audit history.
        </Callout>
      </section>

      {/* ---- Policies ---- */}
      <section id="policies" style={sectionStyle}>
        <h2 style={h2Style}>Policies</h2>
        <p style={pStyle}>
          Policies are the core authorization primitive. AgentGate combines{" "}
          <strong style={{ color: "var(--text-primary)" }}>role-based access control (RBAC)</strong> with{" "}
          <strong style={{ color: "var(--text-primary)" }}>attribute-based access control (ABAC)</strong>,
          giving you the simplicity of roles with the precision of contextual conditions. A single policy
          can express rules like &quot;allow agents owned by the analytics team to read dashboards, but only
          if their risk level is low and the request originates from the corporate network.&quot;
        </p>
        <p style={pStyle}>
          Each policy contains an ordered array of{" "}
          <strong style={{ color: "var(--text-primary)" }}>rules</strong>. A rule specifies an{" "}
          <strong style={{ color: "var(--text-primary)" }}>effect</strong>{" "}
          (<code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>allow</code>,{" "}
          <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>deny</code>, or{" "}
          <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>escalate</code>),
          a set of <strong style={{ color: "var(--text-primary)" }}>actions</strong> it applies to, and optional{" "}
          <strong style={{ color: "var(--text-primary)" }}>conditions</strong> that must be satisfied. Conditions
          support comparison operators (<code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>$eq</code>,{" "}
          <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>$lte</code>,{" "}
          <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>$in</code>,{" "}
          <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>$regex</code>)
          that evaluate against agent metadata and request context at runtime.
        </p>
        <p style={pStyle}>
          The policy engine evaluates rules in order and returns the first matching decision. If no rule
          matches, the default decision is{" "}
          <code style={{ color: "var(--danger)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>deny</code>{" "}
          — a secure-by-default posture. The{" "}
          <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>escalate</code>{" "}
          effect pauses execution and routes the decision to a human reviewer, which is useful for
          high-risk or ambiguous actions that need manual approval.
        </p>
      </section>

      {/* ---- Multi-Tenancy ---- */}
      <section id="multi-tenancy" style={sectionStyle}>
        <h2 style={h2Style}>Multi-Tenancy</h2>
        <p style={pStyle}>
          AgentGate is built for multi-tenant architectures from the ground up. Every resource — agents,
          policies, audit entries, and configuration — is scoped to a{" "}
          <strong style={{ color: "var(--text-primary)" }}>tenant</strong>. Tenants are identified by a unique
          slug (e.g., <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>acme-corp</code>)
          and provide complete data isolation at the database level.
        </p>
        <p style={pStyle}>
          Tenant-level usage tracking gives you visibility into API call volume, agent counts, and policy
          evaluation throughput per tenant. This data feeds into billing, capacity planning, and compliance
          reporting. Quotas can be configured per tenant to prevent noisy neighbors from impacting platform
          performance.
        </p>
        <p style={pStyle}>
          API keys are always scoped to a single tenant, so there is no risk of cross-tenant data leakage
          through misconfigured keys. Platform administrators can manage multiple tenants from a single
          dashboard, while tenant admins only see their own data.
        </p>
      </section>

      {/* ---- Audit Trail ---- */}
      <section id="audit-trail" style={sectionStyle}>
        <h2 style={h2Style}>Audit Trail</h2>
        <p style={pStyle}>
          Every authorization decision made by AgentGate is recorded to an{" "}
          <strong style={{ color: "var(--text-primary)" }}>append-only audit log</strong>. This includes the
          agent ID, the requested action, the resource, the full evaluation context, the matched policy and
          rule, the decision effect, and a timestamp. Entries are immutable — they cannot be modified or
          deleted after creation.
        </p>
        <p style={pStyle}>
          The audit trail is designed for compliance from day one. Whether you need to demonstrate access
          controls for SOC 2 Type II, produce evidence for HIPAA audits, or satisfy GDPR accountability
          requirements, the audit log provides a complete, tamper-evident record of every decision.
          Retention policies can be configured per tenant.
        </p>
        <p style={pStyle}>
          The audit API supports rich querying: filter by agent, action, resource, effect, time range, or
          any combination. Results are paginated and sorted by timestamp. For high-volume environments,
          audit events can also be streamed to external systems via{" "}
          <Link href="/integrations/webhooks" style={{ color: "var(--blue)" }}>webhooks</Link>.
        </p>
        <Callout type="warning">
          The audit trail is append-only by design. Even platform administrators cannot delete or modify
          audit entries. Plan your retention policies accordingly.
        </Callout>
      </section>

      {/* ---- SSO & SCIM ---- */}
      <section id="sso-scim" style={sectionStyle}>
        <h2 style={h2Style}>SSO &amp; SCIM</h2>
        <p style={pStyle}>
          AgentGate integrates with enterprise identity providers through{" "}
          <strong style={{ color: "var(--text-primary)" }}>SAML 2.0</strong> and{" "}
          <strong style={{ color: "var(--text-primary)" }}>OpenID Connect (OIDC)</strong> for single sign-on.
          Human operators managing the dashboard authenticate through their existing IdP — Okta, Azure AD,
          Google Workspace, or any SAML/OIDC-compliant provider. No separate passwords to manage.
        </p>
        <p style={pStyle}>
          <strong style={{ color: "var(--text-primary)" }}>SCIM 2.0</strong> support enables automatic user and
          group provisioning. When an employee is added to a group in your IdP, they are automatically
          granted the corresponding permissions in AgentGate. When they are removed or deactivated, access
          is revoked immediately. This eliminates the drift between your directory and your agent governance
          platform.
        </p>
        <p style={pStyle}>
          <strong style={{ color: "var(--text-primary)" }}>Just-in-Time (JIT) provisioning</strong> creates
          AgentGate accounts on first login through SSO. Combined with SCIM group sync, this means zero
          manual user management — your IdP is the single source of truth for who can access the AgentGate
          dashboard and API.
        </p>
      </section>

      {/* ---- A2A Governance ---- */}
      <section id="a2a-governance" style={sectionStyle}>
        <h2 style={h2Style}>A2A Governance</h2>
        <p style={pStyle}>
          As agent systems grow, agents inevitably need to communicate with each other — sharing data,
          delegating tasks, or coordinating workflows. Without governance, these interactions become opaque
          and uncontrolled.{" "}
          <strong style={{ color: "var(--text-primary)" }}>Agent-to-Agent (A2A) governance</strong> gives you
          visibility and control over inter-agent communication.
        </p>
        <p style={pStyle}>
          A2A governance introduces{" "}
          <strong style={{ color: "var(--text-primary)" }}>channels</strong> — named, policy-controlled
          communication paths between agents. Each channel defines which agents can participate, what
          message types are allowed, and what rate limits apply. Channels can be unidirectional or
          bidirectional. All messages transiting a channel are logged to the audit trail.
        </p>
        <p style={pStyle}>
          The{" "}
          <strong style={{ color: "var(--text-primary)" }}>interaction graph</strong> provides a real-time
          visualization of agent-to-agent communication patterns. You can see which agents are talking
          to each other, how frequently, and through which channels. This graph powers anomaly detection
          — if an agent suddenly starts communicating with a new agent it has never interacted with before,
          that deviation can trigger an alert or automatically escalate to a human reviewer.
        </p>
      </section>

      {/* ---- Anomaly Detection ---- */}
      <section id="anomaly-detection" style={sectionStyle}>
        <h2 style={h2Style}>Anomaly Detection</h2>
        <p style={pStyle}>
          Static policies are necessary but not sufficient. Agents can behave in unexpected ways even within
          their granted permissions. AgentGate&apos;s anomaly detection system establishes{" "}
          <strong style={{ color: "var(--text-primary)" }}>behavioral baselines</strong> for each agent and
          continuously monitors for deviations. This provides a dynamic security layer on top of your
          static policies.
        </p>
        <p style={pStyle}>
          The system runs{" "}
          <strong style={{ color: "var(--text-primary)" }}>six detection checks</strong>: unusual request
          volume (rate anomaly), access to resources the agent has never touched before (resource anomaly),
          requests outside normal operating hours (temporal anomaly), requests from unexpected IP addresses
          or regions (geographic anomaly), new agent-to-agent communication patterns (graph anomaly), and
          rapid permission escalation attempts (privilege anomaly). Each check produces a risk score that
          contributes to an overall agent risk assessment.
        </p>
        <p style={pStyle}>
          When an anomaly is detected, AgentGate can respond automatically based on configurable thresholds:
          log a warning, temporarily suspend the agent, escalate the next authorization decision to a human
          reviewer, or trigger a{" "}
          <Link href="/integrations/webhooks" style={{ color: "var(--blue)" }}>webhook</Link>{" "}
          to your incident response system. Thresholds are tunable per agent and per check type to minimize
          false positives.
        </p>
        <Callout type="info">
          Anomaly detection learns from the first 7 days of agent activity to establish a baseline. During
          this learning period, anomalies are logged but do not trigger automated responses.
        </Callout>
      </section>

      {/* ---- Compliance ---- */}
      <section id="compliance" style={sectionStyle}>
        <h2 style={h2Style}>Compliance</h2>
        <p style={pStyle}>
          AgentGate provides built-in compliance support for{" "}
          <strong style={{ color: "var(--text-primary)" }}>six major frameworks</strong>: SOC 2 Type II,
          ISO 27001, HIPAA, GDPR, PCI DSS, and the EU AI Act. Each framework maps to a set of controls
          that AgentGate monitors continuously — access controls, audit logging, data isolation,
          encryption, and anomaly detection all produce evidence that maps directly to compliance
          requirements.
        </p>
        <p style={pStyle}>
          <strong style={{ color: "var(--text-primary)" }}>Continuous monitoring</strong> replaces
          point-in-time audits. Instead of scrambling to collect evidence before an audit, AgentGate
          maintains a real-time compliance posture dashboard that shows your current status against each
          framework. Controls are evaluated automatically, and gaps are flagged immediately so your team
          can remediate before they become audit findings.
        </p>
        <p style={pStyle}>
          <strong style={{ color: "var(--text-primary)" }}>Evidence collection</strong> is automatic.
          Audit trail exports, policy snapshots, access reviews, and anomaly detection reports can be
          generated on demand or on a schedule. Reports are available in PDF and JSON formats, ready to
          hand to auditors. For the EU AI Act specifically, AgentGate tracks agent risk classifications,
          human oversight decisions (via escalate), and maintains the transparency logs required for
          high-risk AI systems.
        </p>
        <Callout type="warning">
          Compliance features require the Enterprise plan. Contact{" "}
          <Link href="mailto:sales@agentgate.dev" style={{ color: "var(--blue)" }}>sales@agentgate.dev</Link>{" "}
          for pricing and to schedule a compliance review.
        </Callout>
      </section>
    </div>
  );
}
