import { EndpointCard } from "@/components/EndpointCard";
import { ParamTable, type Param } from "@/components/ParamTable";
import { Callout } from "@/components/Callout";

export default function ComplianceApiPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4 gradient-text">Compliance API</h1>
      <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
        Compliance Autopilot &mdash; evaluate your agent infrastructure against regulatory frameworks,
        track control gaps, submit evidence, generate reports, and monitor your compliance score over time.
      </p>

      <Callout type="info" title="Authentication required">
        All Compliance endpoints require a valid API key with the <code style={{ color: "var(--blue)" }}>compliance:read</code> or <code style={{ color: "var(--blue)" }}>compliance:write</code> scope.
      </Callout>

      {/* --- Frameworks --- */}
      <section className="my-8">
        <h2 id="frameworks" className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Frameworks</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Manage compliance frameworks (SOC 2, ISO 27001, GDPR, NIST AI RMF, EU AI Act, etc.) and their associated controls.
        </p>

        {/* GET /api/v1/compliance */}
        <EndpointCard method="GET" path="/api/v1/compliance" description="List active compliance frameworks for the tenant">
          <ParamTable title="Query Parameters" params={[
            { name: "limit", type: "number", description: "Max results per page (default 20, max 100)" },
            { name: "offset", type: "number", description: "Number of results to skip (default 0)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a paginated array of activated framework objects with name, version, control count, and current compliance score.
          </p>
        </EndpointCard>

        {/* GET /api/v1/compliance/:frameworkId */}
        <EndpointCard method="GET" path="/api/v1/compliance/:frameworkId" description="Get framework details">
          <ParamTable title="Path Parameters" params={[
            { name: "frameworkId", type: "string", required: true, description: "The framework's unique identifier" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the full framework object including description, version, total controls, satisfied controls, compliance percentage, and last evaluation timestamp.
          </p>
        </EndpointCard>

        {/* GET /api/v1/compliance/:frameworkId/controls */}
        <EndpointCard method="GET" path="/api/v1/compliance/:frameworkId/controls" description="List controls for a framework">
          <ParamTable title="Path Parameters" params={[
            { name: "frameworkId", type: "string", required: true, description: "The framework's unique identifier" },
          ]} />
          <ParamTable title="Query Parameters" params={[
            { name: "status", type: "enum", description: "Filter by status: \"satisfied\", \"gap\", \"partial\", \"not_evaluated\"" },
            { name: "limit", type: "number", description: "Max results per page (default 20, max 100)" },
            { name: "offset", type: "number", description: "Number of results to skip (default 0)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a paginated array of control objects with ID, title, description, status, evidence count, and last evaluation result.
          </p>
        </EndpointCard>

        {/* POST /api/v1/compliance/:frameworkId/evaluate */}
        <EndpointCard method="POST" path="/api/v1/compliance/:frameworkId/evaluate" description="Run a compliance evaluation against a framework">
          <ParamTable title="Path Parameters" params={[
            { name: "frameworkId", type: "string", required: true, description: "The framework's unique identifier" },
          ]} />
          <Callout type="info" title="Automated evaluation">
            The evaluation engine automatically checks your agent policies, audit logs, SSO configuration, and submitted evidence against each control in the framework.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            Returns the evaluation result:
          </p>
          <div className="rounded-lg p-4 font-mono text-sm" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--text-muted)" }}>{"{"}</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;frameworkId&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;soc2-type2&quot;</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;score&quot;</span>: <span style={{ color: "var(--teal)" }}>0.84</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;totalControls&quot;</span>: <span style={{ color: "var(--teal)" }}>62</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;satisfied&quot;</span>: <span style={{ color: "var(--teal)" }}>52</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;gaps&quot;</span>: <span style={{ color: "var(--teal)" }}>7</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;partial&quot;</span>: <span style={{ color: "var(--teal)" }}>3</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;evaluatedAt&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;2026-03-11T10:30:00Z&quot;</span></div>
            <div style={{ color: "var(--text-muted)" }}>{"}"}</div>
          </div>
        </EndpointCard>

        {/* GET /api/v1/compliance/:frameworkId/gaps */}
        <EndpointCard method="GET" path="/api/v1/compliance/:frameworkId/gaps" description="Get compliance gaps for a framework">
          <ParamTable title="Path Parameters" params={[
            { name: "frameworkId", type: "string", required: true, description: "The framework's unique identifier" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns an array of gap objects, each containing the control ID, control title, gap description, severity, and recommended remediation steps.
          </p>
        </EndpointCard>

        {/* GET /api/v1/compliance/frameworks */}
        <EndpointCard method="GET" path="/api/v1/compliance/frameworks" description="List all available frameworks (including inactive)">
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns all frameworks in the AgentGate compliance library, including those not yet activated for your tenant. Each includes name, description, control count, and activation status.
          </p>
        </EndpointCard>

        {/* POST /api/v1/compliance/frameworks/:id/activate */}
        <EndpointCard method="POST" path="/api/v1/compliance/frameworks/:id/activate" description="Activate a compliance framework for your tenant">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "string", required: true, description: "The framework's unique identifier" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the activated framework with initial evaluation status. An automatic first evaluation is triggered in the background.
          </p>
        </EndpointCard>
      </section>

      {/* --- Evidence --- */}
      <section className="my-8">
        <h2 id="evidence" className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Evidence</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Submit and manage evidence artifacts that demonstrate compliance with specific controls. Evidence types include documents, screenshots, logs, and policy references.
        </p>

        {/* POST /api/v1/compliance/evidence */}
        <EndpointCard method="POST" path="/api/v1/compliance/evidence" description="Submit compliance evidence">
          <ParamTable title="Request Body" params={[
            { name: "controlId", type: "string", required: true, description: "The control this evidence supports" },
            { name: "type", type: "enum", required: true, description: "Evidence type: \"document\", \"screenshot\", \"log\", \"policy_ref\", \"external_link\"" },
            { name: "content", type: "string", required: true, description: "Evidence content (text, URL, or base64-encoded file)" },
            { name: "metadata", type: "object", description: "Additional metadata (title, description, source, date)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the created evidence object with generated ID and timestamp. The next evaluation will consider this evidence when assessing the associated control.
          </p>
        </EndpointCard>

        {/* GET /api/v1/compliance/evidence */}
        <EndpointCard method="GET" path="/api/v1/compliance/evidence" description="List compliance evidence">
          <ParamTable title="Query Parameters" params={[
            { name: "controlId", type: "string", description: "Filter by control ID" },
            { name: "type", type: "enum", description: "Filter by evidence type" },
            { name: "limit", type: "number", description: "Max results per page (default 20, max 100)" },
            { name: "offset", type: "number", description: "Number of results to skip (default 0)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a paginated array of evidence objects with control association, type, submission date, and submitter.
          </p>
        </EndpointCard>
      </section>

      {/* --- Reports --- */}
      <section className="my-8">
        <h2 id="reports" className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Reports</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Generate and retrieve compliance reports for auditors and stakeholders.
        </p>

        {/* POST /api/v1/compliance/reports */}
        <EndpointCard method="POST" path="/api/v1/compliance/reports" description="Generate a compliance report">
          <ParamTable title="Request Body" params={[
            { name: "frameworkId", type: "string", required: true, description: "The framework to generate a report for" },
            { name: "format", type: "enum", description: "Report format: \"pdf\", \"html\", or \"json\" (default \"pdf\")" },
          ]} />
          <Callout type="info" title="Asynchronous generation">
            Report generation is asynchronous. The response includes a report ID that can be polled for completion status.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            Returns:
          </p>
          <div className="rounded-lg p-4 font-mono text-sm" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--text-muted)" }}>{"{"}</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;id&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;rpt_01912c4a-...&quot;</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;status&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;generating&quot;</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;estimatedReadyAt&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;2026-03-11T10:32:00Z&quot;</span></div>
            <div style={{ color: "var(--text-muted)" }}>{"}"}</div>
          </div>
        </EndpointCard>

        {/* GET /api/v1/compliance/reports */}
        <EndpointCard method="GET" path="/api/v1/compliance/reports" description="List generated compliance reports">
          <ParamTable title="Query Parameters" params={[
            { name: "frameworkId", type: "string", description: "Filter by framework" },
            { name: "limit", type: "number", description: "Max results per page (default 20, max 100)" },
            { name: "offset", type: "number", description: "Number of results to skip (default 0)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a paginated array of report objects with status, format, framework, generation date, and download URL (when ready).
          </p>
        </EndpointCard>

        {/* GET /api/v1/compliance/reports/:id */}
        <EndpointCard method="GET" path="/api/v1/compliance/reports/:id" description="Get a specific compliance report">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "string", required: true, description: "The report's unique identifier" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the report object. If <code style={{ color: "var(--blue)" }}>status</code> is <code style={{ color: "var(--blue)" }}>&quot;ready&quot;</code>, includes a <code style={{ color: "var(--blue)" }}>downloadUrl</code> for the generated file.
          </p>
        </EndpointCard>
      </section>

      {/* --- Score --- */}
      <section className="my-8">
        <h2 id="score" className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Compliance Score</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Monitor your overall compliance posture and track score trends over time.
        </p>

        {/* GET /api/v1/compliance/score */}
        <EndpointCard method="GET" path="/api/v1/compliance/score" description="Get overall compliance score">
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            Returns the aggregate compliance score across all active frameworks:
          </p>
          <div className="rounded-lg p-4 font-mono text-sm" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--text-muted)" }}>{"{"}</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;overallScore&quot;</span>: <span style={{ color: "var(--teal)" }}>0.87</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;frameworks&quot;</span>: {"["}</div>
            <div className="ml-8" style={{ color: "var(--text-muted)" }}>{"{"} <span style={{ color: "var(--blue)" }}>&quot;id&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;soc2-type2&quot;</span>, <span style={{ color: "var(--blue)" }}>&quot;score&quot;</span>: <span style={{ color: "var(--teal)" }}>0.84</span> {"}"},</div>
            <div className="ml-8" style={{ color: "var(--text-muted)" }}>{"{"} <span style={{ color: "var(--blue)" }}>&quot;id&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;iso-27001&quot;</span>, <span style={{ color: "var(--blue)" }}>&quot;score&quot;</span>: <span style={{ color: "var(--teal)" }}>0.91</span> {"}"},</div>
            <div className="ml-8" style={{ color: "var(--text-muted)" }}>{"{"} <span style={{ color: "var(--blue)" }}>&quot;id&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;eu-ai-act&quot;</span>, <span style={{ color: "var(--blue)" }}>&quot;score&quot;</span>: <span style={{ color: "var(--teal)" }}>0.79</span> {"}"}</div>
            <div className="ml-4">{"],"},</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;totalGaps&quot;</span>: <span style={{ color: "var(--teal)" }}>14</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;evaluatedAt&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;2026-03-11T10:30:00Z&quot;</span></div>
            <div style={{ color: "var(--text-muted)" }}>{"}"}</div>
          </div>
        </EndpointCard>

        {/* GET /api/v1/compliance/score/trend */}
        <EndpointCard method="GET" path="/api/v1/compliance/score/trend" description="Get compliance score trend over time">
          <ParamTable title="Query Parameters" params={[
            { name: "from", type: "ISO 8601", description: "Start of time range (default: 30 days ago)" },
            { name: "to", type: "ISO 8601", description: "End of time range (default: now)" },
            { name: "interval", type: "enum", description: "Data point interval: \"day\", \"week\", \"month\" (default: \"day\")" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns an array of timestamped score data points for charting compliance score progression. Each point includes the overall score and per-framework breakdown.
          </p>
        </EndpointCard>
      </section>

      {/* --- Regulatory Updates --- */}
      <section className="my-8">
        <h2 id="regulatory-updates" className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Regulatory Updates</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Stay informed about regulatory changes that may affect your compliance posture. AgentGate monitors relevant regulatory bodies and surfaces updates that impact your active frameworks.
        </p>

        {/* GET /api/v1/compliance/regulatory-updates */}
        <EndpointCard method="GET" path="/api/v1/compliance/regulatory-updates" description="List regulatory updates">
          <ParamTable title="Query Parameters" params={[
            { name: "frameworkId", type: "string", description: "Filter by affected framework" },
            { name: "acknowledged", type: "boolean", description: "Filter by acknowledgment status" },
            { name: "limit", type: "number", description: "Max results per page (default 20, max 100)" },
            { name: "offset", type: "number", description: "Number of results to skip (default 0)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a paginated array of regulatory update objects with title, summary, affected frameworks, severity, publication date, and acknowledgment status.
          </p>
        </EndpointCard>

        {/* POST /api/v1/compliance/regulatory-updates/:id/acknowledge */}
        <EndpointCard method="POST" path="/api/v1/compliance/regulatory-updates/:id/acknowledge" description="Acknowledge a regulatory update">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "string", required: true, description: "The regulatory update's unique identifier" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the update with <code style={{ color: "var(--blue)" }}>acknowledged: true</code>, the acknowledging user, and timestamp.
          </p>
        </EndpointCard>
      </section>
    </div>
  );
}
