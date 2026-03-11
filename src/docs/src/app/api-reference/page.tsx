import { Callout } from "@/components/Callout";
import Link from "next/link";

const errorCodes = [
  { code: "VALIDATION_ERROR", status: "400", description: "Request body or query parameters failed validation" },
  { code: "UNAUTHORIZED", status: "401", description: "Missing or invalid API key" },
  { code: "FORBIDDEN", status: "403", description: "API key lacks required scope for this action" },
  { code: "NOT_FOUND", status: "404", description: "Requested resource does not exist" },
  { code: "RATE_LIMITED", status: "429", description: "Too many requests — retry after the period in Retry-After header" },
  { code: "INTERNAL_ERROR", status: "500", description: "Unexpected server error — contact support if persistent" },
];

const endpointGroups = [
  { href: "/api-reference/agents", title: "Agents", description: "Register, query, and manage AI agent identities" },
  { href: "/api-reference/policies", title: "Policies", description: "Create and evaluate access control policies" },
  { href: "/api-reference/audit", title: "Audit", description: "Query and export the append-only audit trail" },
  { href: "/api-reference/tenants", title: "Tenants", description: "Multi-tenant organization management" },
  { href: "/api-reference/api-keys", title: "API Keys", description: "Create, rotate, and revoke API keys" },
  { href: "/api-reference/sso", title: "SSO", description: "SAML / OIDC connection and session management" },
  { href: "/api-reference/scim", title: "SCIM 2.0", description: "Automated user and group provisioning (RFC 7643/7644)" },
  { href: "/api-reference/auth", title: "Auth Routes", description: "Public SAML/OIDC login flows and session endpoints" },
  { href: "/api-reference/anomaly-detection", title: "Anomaly Detection", description: "Behavioral profiling and anomaly alerts" },
  { href: "/api-reference/a2a", title: "A2A Channels", description: "Agent-to-agent communication channels and graph" },
  { href: "/api-reference/compliance", title: "Compliance", description: "Framework evaluation, evidence, and reporting" },
  { href: "/api-reference/billing", title: "Billing", description: "Plans, checkout, portal, and usage metering" },
];

export default function ApiReferencePage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4 gradient-text">API Reference</h1>
      <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
        Complete reference for the AgentGate REST API. All endpoints follow consistent conventions for authentication, pagination, and error handling.
      </p>

      {/* Base URL */}
      <section className="my-8">
        <h2 id="base-url" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Base URL</h2>
        <div className="rounded-xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="mb-3">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Production</span>
            <code className="block mt-1 text-sm font-mono" style={{ color: "var(--teal)" }}>https://api.agentgate.dev</code>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Local Development</span>
            <code className="block mt-1 text-sm font-mono" style={{ color: "var(--teal)" }}>http://localhost:3100</code>
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="my-8">
        <h2 id="authentication" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Authentication</h2>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          All API requests require a Bearer token in the <code style={{ color: "var(--blue)" }}>Authorization</code> header. Generate API keys from the dashboard or via the API Keys endpoints.
        </p>
        <div className="rounded-xl p-5 font-mono text-sm" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
          <span style={{ color: "var(--text-muted)" }}>Authorization:</span>{" "}
          <span style={{ color: "var(--teal)" }}>Bearer ag_live_xxxxxxxxxxxxxxxx</span>
        </div>
        <Callout type="warning" title="Keep keys secure">
          API keys grant full access to the scopes assigned at creation. Never expose them in client-side code or public repositories.
        </Callout>
      </section>

      {/* Response Envelope */}
      <section className="my-8">
        <h2 id="response-envelope" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Response Envelope</h2>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          Every response is wrapped in a consistent envelope with three top-level keys:
        </p>
        <div className="rounded-xl p-5 font-mono text-sm leading-relaxed" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div style={{ color: "var(--text-muted)" }}>{"{"}</div>
          <div className="ml-4">
            <span style={{ color: "var(--blue)" }}>&quot;data&quot;</span><span style={{ color: "var(--text-muted)" }}>:</span>{" "}
            <span style={{ color: "var(--text-secondary)" }}>{"{ ... }  // The requested resource or array of resources"}</span>
          </div>
          <div className="ml-4">
            <span style={{ color: "var(--blue)" }}>&quot;error&quot;</span><span style={{ color: "var(--text-muted)" }}>:</span>{" "}
            <span style={{ color: "var(--text-secondary)" }}>{"null     // null on success, error object on failure"}</span>
          </div>
          <div className="ml-4">
            <span style={{ color: "var(--blue)" }}>&quot;meta&quot;</span><span style={{ color: "var(--text-muted)" }}>:</span>{" "}
            <span style={{ color: "var(--text-secondary)" }}>{"{ ... }  // Pagination info, request ID, timing"}</span>
          </div>
          <div style={{ color: "var(--text-muted)" }}>{"}"}</div>
        </div>
      </section>

      {/* Error Codes */}
      <section className="my-8">
        <h2 id="error-codes" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Error Codes</h2>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          When a request fails, the <code style={{ color: "var(--blue)" }}>error</code> field contains a structured error object:
        </p>
        <div className="rounded-xl p-5 font-mono text-sm leading-relaxed mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div style={{ color: "var(--text-muted)" }}>{"{"}</div>
          <div className="ml-4">
            <span style={{ color: "var(--blue)" }}>&quot;error&quot;</span><span style={{ color: "var(--text-muted)" }}>:</span>{" "}
            <span style={{ color: "var(--text-muted)" }}>{"{"}</span>
          </div>
          <div className="ml-8">
            <span style={{ color: "var(--blue)" }}>&quot;code&quot;</span><span style={{ color: "var(--text-muted)" }}>:</span>{" "}
            <span style={{ color: "var(--teal)" }}>&quot;VALIDATION_ERROR&quot;</span><span style={{ color: "var(--text-muted)" }}>,</span>
          </div>
          <div className="ml-8">
            <span style={{ color: "var(--blue)" }}>&quot;message&quot;</span><span style={{ color: "var(--text-muted)" }}>:</span>{" "}
            <span style={{ color: "var(--teal)" }}>&quot;Field &#39;name&#39; is required&quot;</span><span style={{ color: "var(--text-muted)" }}>,</span>
          </div>
          <div className="ml-8">
            <span style={{ color: "var(--blue)" }}>&quot;details&quot;</span><span style={{ color: "var(--text-muted)" }}>:</span>{" "}
            <span style={{ color: "var(--text-secondary)" }}>{"{ ... }  // Optional additional context"}</span>
          </div>
          <div className="ml-4" style={{ color: "var(--text-muted)" }}>{"}"}</div>
          <div style={{ color: "var(--text-muted)" }}>{"}"}</div>
        </div>
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--bg-card-hover)" }}>
                <th className="text-left px-4 py-2 font-medium" style={{ color: "var(--text-secondary)" }}>Code</th>
                <th className="text-left px-4 py-2 font-medium" style={{ color: "var(--text-secondary)" }}>HTTP Status</th>
                <th className="text-left px-4 py-2 font-medium" style={{ color: "var(--text-secondary)" }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {errorCodes.map((e) => (
                <tr key={e.code} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-4 py-2 font-mono text-xs" style={{ color: "var(--danger)" }}>{e.code}</td>
                  <td className="px-4 py-2 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{e.status}</td>
                  <td className="px-4 py-2" style={{ color: "var(--text-secondary)" }}>{e.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagination */}
      <section className="my-8">
        <h2 id="pagination" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Pagination</h2>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          List endpoints support offset-based pagination via <code style={{ color: "var(--blue)" }}>limit</code> and <code style={{ color: "var(--blue)" }}>offset</code> query parameters. The response <code style={{ color: "var(--blue)" }}>meta</code> object includes total count information.
        </p>
        <div className="rounded-xl p-5 font-mono text-sm leading-relaxed" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div style={{ color: "var(--text-muted)" }}>GET /api/v1/agents?limit=20&offset=40</div>
          <div className="mt-3" style={{ color: "var(--text-muted)" }}>{"{"}</div>
          <div className="ml-4">
            <span style={{ color: "var(--blue)" }}>&quot;data&quot;</span><span style={{ color: "var(--text-muted)" }}>:</span>{" "}
            <span style={{ color: "var(--text-secondary)" }}>[ ... ]</span><span style={{ color: "var(--text-muted)" }}>,</span>
          </div>
          <div className="ml-4">
            <span style={{ color: "var(--blue)" }}>&quot;meta&quot;</span><span style={{ color: "var(--text-muted)" }}>:</span>{" "}
            <span style={{ color: "var(--text-muted)" }}>{"{"}</span>
          </div>
          <div className="ml-8">
            <span style={{ color: "var(--blue)" }}>&quot;total&quot;</span><span style={{ color: "var(--text-muted)" }}>:</span>{" "}
            <span style={{ color: "var(--teal)" }}>142</span><span style={{ color: "var(--text-muted)" }}>,</span>
          </div>
          <div className="ml-8">
            <span style={{ color: "var(--blue)" }}>&quot;limit&quot;</span><span style={{ color: "var(--text-muted)" }}>:</span>{" "}
            <span style={{ color: "var(--teal)" }}>20</span><span style={{ color: "var(--text-muted)" }}>,</span>
          </div>
          <div className="ml-8">
            <span style={{ color: "var(--blue)" }}>&quot;offset&quot;</span><span style={{ color: "var(--text-muted)" }}>:</span>{" "}
            <span style={{ color: "var(--teal)" }}>40</span>
          </div>
          <div className="ml-4" style={{ color: "var(--text-muted)" }}>{"}"}</div>
          <div style={{ color: "var(--text-muted)" }}>{"}"}</div>
        </div>
        <Callout type="info" title="Default pagination">
          If not specified, <code style={{ color: "var(--blue)" }}>limit</code> defaults to <strong>20</strong> and <code style={{ color: "var(--blue)" }}>offset</code> defaults to <strong>0</strong>. Maximum limit is <strong>100</strong>.
        </Callout>
      </section>

      {/* Rate Limiting */}
      <section className="my-8">
        <h2 id="rate-limiting" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Rate Limiting</h2>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          API requests are rate-limited to <strong style={{ color: "var(--text-primary)" }}>100 requests per minute</strong> per API key by default. Enterprise plans support custom rate limits.
        </p>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          Rate limit information is included in every response via headers:
        </p>
        <div className="rounded-xl p-5 font-mono text-sm leading-relaxed" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div><span style={{ color: "var(--text-muted)" }}>X-RateLimit-Limit:</span> <span style={{ color: "var(--teal)" }}>100</span></div>
          <div><span style={{ color: "var(--text-muted)" }}>X-RateLimit-Remaining:</span> <span style={{ color: "var(--teal)" }}>87</span></div>
          <div><span style={{ color: "var(--text-muted)" }}>X-RateLimit-Reset:</span> <span style={{ color: "var(--teal)" }}>1711929600</span></div>
        </div>
      </section>

      {/* Endpoint Groups */}
      <section className="my-8">
        <h2 id="endpoints" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Endpoints</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          The API is organized into the following resource groups. Click any group to see full endpoint documentation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {endpointGroups.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="block rounded-xl p-5 transition-colors hover:bg-white/[0.02]"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{g.title}</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{g.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
