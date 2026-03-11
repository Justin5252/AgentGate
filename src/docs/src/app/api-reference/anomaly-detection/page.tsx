import { EndpointCard } from "@/components/EndpointCard";
import { ParamTable, type Param } from "@/components/ParamTable";
import { Callout } from "@/components/Callout";

export default function AnomalyDetectionApiPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4 gradient-text">Anomaly Detection API</h1>
      <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
        Behavioral profiling and anomaly detection for AI agents. The system builds a baseline profile of each
        agent&apos;s normal behavior and flags deviations across six dimensions: velocity, resource access patterns,
        time-of-day, geolocation, action sequences, and privilege escalation.
      </p>

      <Callout type="info" title="Authentication required">
        All Anomaly Detection endpoints require a valid API key with the <code style={{ color: "var(--blue)" }}>anomalies:read</code> or <code style={{ color: "var(--blue)" }}>anomalies:write</code> scope.
      </Callout>

      {/* POST /api/v1/anomalies/check */}
      <section className="my-8">
        <h2 id="check" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Run Anomaly Check</h2>
        <EndpointCard method="POST" path="/api/v1/anomalies/check" description="Run anomaly detection checks on an agent action">
          <ParamTable title="Request Body" params={[
            { name: "agentId", type: "UUIDv7", required: true, description: "The agent to check" },
            { name: "action", type: "string", required: true, description: "The action being performed" },
            { name: "resource", type: "string", required: true, description: "The target resource" },
            { name: "context", type: "object", description: "Additional context (IP address, geo, timestamp, etc.)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            Returns an anomaly assessment:
          </p>
          <div className="rounded-lg p-4 font-mono text-sm" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--text-muted)" }}>{"{"}</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;isAnomaly&quot;</span>: <span style={{ color: "var(--teal)" }}>true</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;score&quot;</span>: <span style={{ color: "var(--teal)" }}>0.87</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;severity&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;high&quot;</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;checks&quot;</span>: {"["}</div>
            <div className="ml-8" style={{ color: "var(--text-muted)" }}>{"{"} <span style={{ color: "var(--blue)" }}>&quot;name&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;velocity&quot;</span>, <span style={{ color: "var(--blue)" }}>&quot;passed&quot;</span>: <span style={{ color: "var(--teal)" }}>false</span>, <span style={{ color: "var(--blue)" }}>&quot;detail&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;3x above normal rate&quot;</span> {"}"},</div>
            <div className="ml-8" style={{ color: "var(--text-muted)" }}>{"{"} <span style={{ color: "var(--blue)" }}>&quot;name&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;resource_access&quot;</span>, <span style={{ color: "var(--blue)" }}>&quot;passed&quot;</span>: <span style={{ color: "var(--teal)" }}>true</span> {"}"},</div>
            <div className="ml-8" style={{ color: "var(--text-muted)" }}>{"{"} <span style={{ color: "var(--blue)" }}>&quot;name&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;time_of_day&quot;</span>, <span style={{ color: "var(--blue)" }}>&quot;passed&quot;</span>: <span style={{ color: "var(--teal)" }}>false</span>, <span style={{ color: "var(--blue)" }}>&quot;detail&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;Outside normal hours&quot;</span> {"}"},</div>
            <div className="ml-8" style={{ color: "var(--text-muted)" }}>...</div>
            <div className="ml-4">{"]"},</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;recommendation&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;Review agent activity and consider temporary suspension&quot;</span></div>
            <div style={{ color: "var(--text-muted)" }}>{"}"}</div>
          </div>
          <Callout type="tip" title="Inline with authorization">
            For real-time protection, call the anomaly check endpoint alongside the <code style={{ color: "var(--blue)" }}>/authorize</code> endpoint, or configure policies to automatically run anomaly checks during evaluation.
          </Callout>
        </EndpointCard>
      </section>

      {/* GET /api/v1/anomalies/profiles */}
      <section className="my-8">
        <h2 id="list-profiles" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>List Behavior Profiles</h2>
        <EndpointCard method="GET" path="/api/v1/anomalies/profiles" description="List all agent behavior profiles">
          <ParamTable title="Query Parameters" params={[
            { name: "limit", type: "number", description: "Max results per page (default 20, max 100)" },
            { name: "offset", type: "number", description: "Number of results to skip (default 0)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a paginated array of behavior profiles. Each profile summarizes an agent&apos;s baseline behavior patterns including typical actions, resources accessed, active hours, and request velocity.
          </p>
        </EndpointCard>
      </section>

      {/* GET /api/v1/anomalies/profiles/:agentId */}
      <section className="my-8">
        <h2 id="get-profile" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Get Agent Profile</h2>
        <EndpointCard method="GET" path="/api/v1/anomalies/profiles/:agentId" description="Get the behavior profile for a specific agent">
          <ParamTable title="Path Parameters" params={[
            { name: "agentId", type: "UUIDv7", required: true, description: "The agent's unique identifier" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            Returns the detailed behavior profile:
          </p>
          <div className="rounded-lg p-4 font-mono text-sm" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--text-muted)" }}>{"{"}</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;agentId&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;01912c4a-...&quot;</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;baselineBuilt&quot;</span>: <span style={{ color: "var(--teal)" }}>true</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;dataPoints&quot;</span>: <span style={{ color: "var(--teal)" }}>4821</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;typicalActions&quot;</span>: [<span style={{ color: "var(--teal)" }}>&quot;read&quot;</span>, <span style={{ color: "var(--teal)" }}>&quot;search&quot;</span>],</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;typicalResources&quot;</span>: [<span style={{ color: "var(--teal)" }}>&quot;documents/*&quot;</span>, <span style={{ color: "var(--teal)" }}>&quot;search/*&quot;</span>],</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;activeHours&quot;</span>: {"{"} <span style={{ color: "var(--blue)" }}>&quot;start&quot;</span>: <span style={{ color: "var(--teal)" }}>8</span>, <span style={{ color: "var(--blue)" }}>&quot;end&quot;</span>: <span style={{ color: "var(--teal)" }}>18</span> {"}"},</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;avgRequestsPerMinute&quot;</span>: <span style={{ color: "var(--teal)" }}>12.4</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;lastUpdated&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;2026-03-11T09:00:00Z&quot;</span></div>
            <div style={{ color: "var(--text-muted)" }}>{"}"}</div>
          </div>
          <Callout type="info" title="Baseline learning">
            Profiles require at least 100 data points before the baseline is considered reliable. New agents will have <code style={{ color: "var(--blue)" }}>baselineBuilt: false</code> until enough data is collected.
          </Callout>
        </EndpointCard>
      </section>

      {/* GET /api/v1/anomalies/alerts */}
      <section className="my-8">
        <h2 id="list-alerts" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>List Anomaly Alerts</h2>
        <EndpointCard method="GET" path="/api/v1/anomalies/alerts" description="List anomaly alerts">
          <ParamTable title="Query Parameters" params={[
            { name: "agentId", type: "UUIDv7", description: "Filter by agent ID" },
            { name: "severity", type: "enum", description: "Filter by severity: \"low\", \"medium\", \"high\", \"critical\"" },
            { name: "from", type: "ISO 8601", description: "Start of time range (inclusive)" },
            { name: "to", type: "ISO 8601", description: "End of time range (exclusive)" },
            { name: "limit", type: "number", description: "Max results per page (default 20, max 100)" },
            { name: "offset", type: "number", description: "Number of results to skip (default 0)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a paginated array of anomaly alert objects, each containing the anomaly score, failed checks, severity, timestamp, and current status (open, acknowledged, dismissed).
          </p>
        </EndpointCard>
      </section>

      {/* PATCH /api/v1/anomalies/alerts/:id */}
      <section className="my-8">
        <h2 id="update-alert" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Update Alert</h2>
        <EndpointCard method="PATCH" path="/api/v1/anomalies/alerts/:id" description="Acknowledge or dismiss an anomaly alert">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The alert's unique identifier" },
          ]} />
          <ParamTable title="Request Body" params={[
            { name: "status", type: "enum", required: true, description: "\"acknowledged\" or \"dismissed\"" },
            { name: "note", type: "string", description: "Optional note explaining the status change" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the updated alert object with the new status, the acting user, and timestamp.
          </p>
        </EndpointCard>
      </section>
    </div>
  );
}
