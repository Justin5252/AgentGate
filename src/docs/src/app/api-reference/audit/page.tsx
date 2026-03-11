import { EndpointCard } from "@/components/EndpointCard";
import { ParamTable, type Param } from "@/components/ParamTable";
import { Callout } from "@/components/Callout";

export default function AuditApiPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4 gradient-text">Audit API</h1>
      <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
        Query the append-only audit trail that records every agent action, authorization decision,
        and administrative change. Export logs for compliance and analysis.
      </p>

      <Callout type="info" title="Authentication required">
        All Audit endpoints require a valid API key with the <code style={{ color: "var(--blue)" }}>audit:read</code> scope.
      </Callout>

      <Callout type="tip" title="Immutable records">
        Audit entries are append-only and cannot be modified or deleted. This guarantees a tamper-proof history for compliance requirements.
      </Callout>

      {/* GET /api/v1/audit */}
      <section className="my-8">
        <h2 id="query-audit" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Query Audit Log</h2>
        <EndpointCard method="GET" path="/api/v1/audit" description="Query audit log entries with filters">
          <ParamTable title="Query Parameters" params={[
            { name: "agentId", type: "UUIDv7", description: "Filter by agent ID" },
            { name: "action", type: "string", description: "Filter by action type (e.g. \"read\", \"write\", \"execute\")" },
            { name: "resource", type: "string", description: "Filter by resource identifier" },
            { name: "decision", type: "enum", description: "Filter by authorization decision: \"allow\" or \"deny\"" },
            { name: "from", type: "ISO 8601", description: "Start of time range (inclusive)" },
            { name: "to", type: "ISO 8601", description: "End of time range (exclusive)" },
            { name: "limit", type: "number", description: "Max results per page (default 20, max 100)" },
            { name: "offset", type: "number", description: "Number of results to skip (default 0)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a paginated array of <code style={{ color: "var(--blue)" }}>AuditEntry</code> objects, ordered newest-first.
            Each entry includes agent ID, action, resource, decision, matched policies, context, and timestamp.
          </p>
        </EndpointCard>
      </section>

      {/* GET /api/v1/audit/:id */}
      <section className="my-8">
        <h2 id="get-audit-entry" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Get Audit Entry</h2>
        <EndpointCard method="GET" path="/api/v1/audit/:id" description="Retrieve a single audit entry by ID">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The audit entry's unique identifier" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the full <code style={{ color: "var(--blue)" }}>AuditEntry</code> object including request context,
            evaluation details, matched policies, and timing information.
          </p>
        </EndpointCard>
      </section>

      {/* GET /api/v1/audit/export */}
      <section className="my-8">
        <h2 id="export-audit" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Export Audit Log</h2>
        <EndpointCard method="GET" path="/api/v1/audit/export" description="Export audit log as CSV or JSON for external analysis">
          <ParamTable title="Query Parameters" params={[
            { name: "format", type: "enum", description: "Export format: \"csv\" or \"json\" (default \"json\")" },
            { name: "from", type: "ISO 8601", description: "Start of time range (inclusive)" },
            { name: "to", type: "ISO 8601", description: "End of time range (exclusive)" },
          ]} />
          <Callout type="warning" title="Large exports">
            For time ranges spanning more than 30 days, the export is processed asynchronously. The response will include a <code style={{ color: "var(--blue)" }}>downloadUrl</code> that becomes available once processing completes.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            For small exports: returns the file directly with appropriate <code style={{ color: "var(--blue)" }}>Content-Type</code> header.
            For large exports: returns <code style={{ color: "var(--blue)" }}>{"{ downloadUrl, status, estimatedReadyAt }"}</code>.
          </p>
        </EndpointCard>
      </section>

      {/* GET /api/v1/audit/stats */}
      <section className="my-8">
        <h2 id="audit-stats" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Get Audit Statistics</h2>
        <EndpointCard method="GET" path="/api/v1/audit/stats" description="Get aggregated statistics from the audit log">
          <ParamTable title="Query Parameters" params={[
            { name: "from", type: "ISO 8601", description: "Start of time range (inclusive)" },
            { name: "to", type: "ISO 8601", description: "End of time range (exclusive)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            Returns aggregated statistics:
          </p>
          <div className="rounded-lg p-4 font-mono text-sm" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--text-muted)" }}>{"{"}</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;totalEvents&quot;</span>: <span style={{ color: "var(--teal)" }}>12847</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;allowedCount&quot;</span>: <span style={{ color: "var(--teal)" }}>11903</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;deniedCount&quot;</span>: <span style={{ color: "var(--teal)" }}>944</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;uniqueAgents&quot;</span>: <span style={{ color: "var(--teal)" }}>37</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;topActions&quot;</span>: [ ... ],</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;topResources&quot;</span>: [ ... ],</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;denyRate&quot;</span>: <span style={{ color: "var(--teal)" }}>0.0735</span></div>
            <div style={{ color: "var(--text-muted)" }}>{"}"}</div>
          </div>
        </EndpointCard>
      </section>
    </div>
  );
}
