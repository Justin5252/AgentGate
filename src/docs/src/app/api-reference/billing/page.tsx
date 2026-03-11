import { EndpointCard } from "@/components/EndpointCard";
import { ParamTable, type Param } from "@/components/ParamTable";
import { Callout } from "@/components/Callout";

export default function BillingApiPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4 gradient-text">Billing API</h1>
      <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
        Manage subscription plans, create checkout sessions, access the billing portal,
        and monitor usage for your tenant. Billing is powered by Stripe.
      </p>

      <Callout type="info" title="Authentication required">
        All Billing endpoints require a valid API key with the <code style={{ color: "var(--blue)" }}>billing:read</code> or <code style={{ color: "var(--blue)" }}>billing:write</code> scope.
      </Callout>

      {/* GET /api/v1/billing/plans */}
      <section className="my-8">
        <h2 id="list-plans" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>List Plans</h2>
        <EndpointCard method="GET" path="/api/v1/billing/plans" description="List all available subscription plans">
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            Returns an array of plan objects:
          </p>
          <div className="rounded-lg p-4 font-mono text-sm" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--text-muted)" }}>{"["}</div>
            <div className="ml-4" style={{ color: "var(--text-muted)" }}>{"{"}</div>
            <div className="ml-8"><span style={{ color: "var(--blue)" }}>&quot;id&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;free&quot;</span>,</div>
            <div className="ml-8"><span style={{ color: "var(--blue)" }}>&quot;name&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;Free&quot;</span>,</div>
            <div className="ml-8"><span style={{ color: "var(--blue)" }}>&quot;price&quot;</span>: <span style={{ color: "var(--teal)" }}>0</span>,</div>
            <div className="ml-8"><span style={{ color: "var(--blue)" }}>&quot;interval&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;month&quot;</span>,</div>
            <div className="ml-8"><span style={{ color: "var(--blue)" }}>&quot;limits&quot;</span>: {"{"}</div>
            <div className="ml-12"><span style={{ color: "var(--blue)" }}>&quot;agents&quot;</span>: <span style={{ color: "var(--teal)" }}>5</span>,</div>
            <div className="ml-12"><span style={{ color: "var(--blue)" }}>&quot;evaluationsPerMonth&quot;</span>: <span style={{ color: "var(--teal)" }}>1000</span>,</div>
            <div className="ml-12"><span style={{ color: "var(--blue)" }}>&quot;policies&quot;</span>: <span style={{ color: "var(--teal)" }}>10</span>,</div>
            <div className="ml-12"><span style={{ color: "var(--blue)" }}>&quot;members&quot;</span>: <span style={{ color: "var(--teal)" }}>3</span></div>
            <div className="ml-8">{"}"},</div>
            <div className="ml-8"><span style={{ color: "var(--blue)" }}>&quot;features&quot;</span>: [<span style={{ color: "var(--teal)" }}>&quot;basic_policies&quot;</span>, <span style={{ color: "var(--teal)" }}>&quot;audit_7d&quot;</span>]</div>
            <div className="ml-4" style={{ color: "var(--text-muted)" }}>{"}"},{" ..."}</div>
            <div style={{ color: "var(--text-muted)" }}>{"]"}</div>
          </div>
          <Callout type="tip" title="Available plans">
            AgentGate offers four tiers: <strong>Free</strong> (development), <strong>Pro</strong> ($49/mo), <strong>Team</strong> ($199/mo), and <strong>Enterprise</strong> (custom pricing with SSO, SCIM, compliance, and dedicated support).
          </Callout>
        </EndpointCard>
      </section>

      {/* POST /api/v1/billing/checkout */}
      <section className="my-8">
        <h2 id="create-checkout" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Create Checkout Session</h2>
        <EndpointCard method="POST" path="/api/v1/billing/checkout" description="Create a Stripe Checkout session for plan upgrade">
          <ParamTable title="Request Body" params={[
            { name: "planId", type: "string", required: true, description: "The plan ID to subscribe to (e.g. \"pro\", \"team\", \"enterprise\")" },
            { name: "tenantSlug", type: "string", required: true, description: "The tenant to apply the subscription to" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            Returns a checkout session with a redirect URL:
          </p>
          <div className="rounded-lg p-4 font-mono text-sm" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--text-muted)" }}>{"{"}</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;sessionId&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;cs_live_xxxxxxxx&quot;</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;url&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;https://checkout.stripe.com/c/pay/cs_live_...&quot;</span></div>
            <div style={{ color: "var(--text-muted)" }}>{"}"}</div>
          </div>
          <Callout type="info" title="Browser redirect">
            Redirect the user&apos;s browser to the returned <code style={{ color: "var(--blue)" }}>url</code> to complete the payment flow in Stripe Checkout. After completion, the user is redirected back to your application.
          </Callout>
        </EndpointCard>
      </section>

      {/* GET /api/v1/billing/portal */}
      <section className="my-8">
        <h2 id="billing-portal" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Get Billing Portal URL</h2>
        <EndpointCard method="GET" path="/api/v1/billing/portal" description="Get a link to the Stripe billing portal">
          <ParamTable title="Query Parameters" params={[
            { name: "tenantSlug", type: "string", required: true, description: "The tenant to manage billing for" },
            { name: "returnUrl", type: "string", description: "URL to redirect to after leaving the portal" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            Returns the portal URL:
          </p>
          <div className="rounded-lg p-4 font-mono text-sm" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--text-muted)" }}>{"{"}</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;url&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;https://billing.stripe.com/p/session/...&quot;</span></div>
            <div style={{ color: "var(--text-muted)" }}>{"}"}</div>
          </div>
          <p className="text-sm mt-3" style={{ color: "var(--text-secondary)" }}>
            The billing portal allows users to view invoices, update payment methods, change plans, and cancel subscriptions without any custom UI.
          </p>
        </EndpointCard>
      </section>

      {/* GET /api/v1/billing/usage */}
      <section className="my-8">
        <h2 id="usage" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Get Usage Stats</h2>
        <EndpointCard method="GET" path="/api/v1/billing/usage" description="Get current billing period usage statistics">
          <ParamTable title="Query Parameters" params={[
            { name: "tenantSlug", type: "string", required: true, description: "The tenant to get usage for" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            Returns current period usage against plan limits:
          </p>
          <div className="rounded-lg p-4 font-mono text-sm" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--text-muted)" }}>{"{"}</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;plan&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;pro&quot;</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;billingPeriod&quot;</span>: {"{"}</div>
            <div className="ml-8"><span style={{ color: "var(--blue)" }}>&quot;start&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;2026-03-01T00:00:00Z&quot;</span>,</div>
            <div className="ml-8"><span style={{ color: "var(--blue)" }}>&quot;end&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;2026-04-01T00:00:00Z&quot;</span></div>
            <div className="ml-4">{"},"},</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;usage&quot;</span>: {"{"}</div>
            <div className="ml-8"><span style={{ color: "var(--blue)" }}>&quot;agents&quot;</span>: {"{"} <span style={{ color: "var(--blue)" }}>&quot;current&quot;</span>: <span style={{ color: "var(--teal)" }}>18</span>, <span style={{ color: "var(--blue)" }}>&quot;limit&quot;</span>: <span style={{ color: "var(--teal)" }}>50</span> {"}"},</div>
            <div className="ml-8"><span style={{ color: "var(--blue)" }}>&quot;evaluations&quot;</span>: {"{"} <span style={{ color: "var(--blue)" }}>&quot;current&quot;</span>: <span style={{ color: "var(--teal)" }}>32450</span>, <span style={{ color: "var(--blue)" }}>&quot;limit&quot;</span>: <span style={{ color: "var(--teal)" }}>100000</span> {"}"},</div>
            <div className="ml-8"><span style={{ color: "var(--blue)" }}>&quot;policies&quot;</span>: {"{"} <span style={{ color: "var(--blue)" }}>&quot;current&quot;</span>: <span style={{ color: "var(--teal)" }}>12</span>, <span style={{ color: "var(--blue)" }}>&quot;limit&quot;</span>: <span style={{ color: "var(--teal)" }}>50</span> {"}"},</div>
            <div className="ml-8"><span style={{ color: "var(--blue)" }}>&quot;members&quot;</span>: {"{"} <span style={{ color: "var(--blue)" }}>&quot;current&quot;</span>: <span style={{ color: "var(--teal)" }}>8</span>, <span style={{ color: "var(--blue)" }}>&quot;limit&quot;</span>: <span style={{ color: "var(--teal)" }}>25</span> {"}"}</div>
            <div className="ml-4">{"}"}</div>
            <div style={{ color: "var(--text-muted)" }}>{"}"}</div>
          </div>
          <Callout type="warning" title="Approaching limits">
            When usage reaches 80% of any limit, a warning event is emitted via webhooks. At 100%, new resources of that type are blocked until the plan is upgraded.
          </Callout>
        </EndpointCard>
      </section>
    </div>
  );
}
