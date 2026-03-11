import { EndpointCard } from "@/components/EndpointCard";
import { ParamTable, type Param } from "@/components/ParamTable";
import { Callout } from "@/components/Callout";

export default function PoliciesApiPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4 gradient-text">Policies API</h1>
      <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
        Define access control policies with composable rules, evaluate authorization requests in real time,
        and manage policy versions with rollback support.
      </p>

      <Callout type="info" title="Authentication required">
        All Policies endpoints require a valid API key with the <code style={{ color: "var(--blue)" }}>policies:read</code> or <code style={{ color: "var(--blue)" }}>policies:write</code> scope.
      </Callout>

      {/* POST /api/v1/policies */}
      <section className="my-8">
        <h2 id="create-policy" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Create Policy</h2>
        <EndpointCard method="POST" path="/api/v1/policies" description="Create a new access control policy">
          <ParamTable title="Request Body" params={[
            { name: "name", type: "string", required: true, description: "Unique policy name" },
            { name: "description", type: "string", description: "Human-readable description of what the policy controls" },
            { name: "rules", type: "Rule[]", required: true, description: "Array of rule objects defining conditions and effects" },
            { name: "priority", type: "number", description: "Evaluation priority (lower = evaluated first, default 100)" },
            { name: "enabled", type: "boolean", description: "Whether the policy is active (default true)" },
          ]} />
          <Callout type="tip" title="Rule structure">
            Each rule contains <code style={{ color: "var(--blue)" }}>effect</code> (&quot;allow&quot; or &quot;deny&quot;), <code style={{ color: "var(--blue)" }}>conditions</code> (matching criteria), and optional <code style={{ color: "var(--blue)" }}>reason</code> text. See the Concepts guide for full rule schema.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the created <code style={{ color: "var(--blue)" }}>Policy</code> object with generated ID, version number 1, and timestamps.
          </p>
        </EndpointCard>
      </section>

      {/* GET /api/v1/policies */}
      <section className="my-8">
        <h2 id="list-policies" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>List Policies</h2>
        <EndpointCard method="GET" path="/api/v1/policies" description="List all policies with optional filters">
          <ParamTable title="Query Parameters" params={[
            { name: "enabled", type: "boolean", description: "Filter by enabled/disabled status" },
            { name: "limit", type: "number", description: "Max results per page (default 20, max 100)" },
            { name: "offset", type: "number", description: "Number of results to skip (default 0)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a paginated array of <code style={{ color: "var(--blue)" }}>Policy</code> objects sorted by priority.
          </p>
        </EndpointCard>
      </section>

      {/* GET /api/v1/policies/:id */}
      <section className="my-8">
        <h2 id="get-policy" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Get Policy</h2>
        <EndpointCard method="GET" path="/api/v1/policies/:id" description="Retrieve a single policy by ID">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The policy's unique identifier" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the full <code style={{ color: "var(--blue)" }}>Policy</code> object including rules array, current version, and timestamps.
          </p>
        </EndpointCard>
      </section>

      {/* PATCH /api/v1/policies/:id */}
      <section className="my-8">
        <h2 id="update-policy" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Update Policy</h2>
        <EndpointCard method="PATCH" path="/api/v1/policies/:id" description="Update a policy (creates a new version)">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The policy's unique identifier" },
          ]} />
          <ParamTable title="Request Body" params={[
            { name: "name", type: "string", description: "Updated policy name" },
            { name: "description", type: "string", description: "Updated description" },
            { name: "rules", type: "Rule[]", description: "Updated rules array (replaces existing)" },
            { name: "priority", type: "number", description: "Updated evaluation priority" },
            { name: "enabled", type: "boolean", description: "Enable or disable the policy" },
          ]} />
          <Callout type="info" title="Versioning">
            Every update creates a new version. The previous version is preserved and can be restored via the rollback endpoint.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the updated <code style={{ color: "var(--blue)" }}>Policy</code> object with incremented version number.
          </p>
        </EndpointCard>
      </section>

      {/* DELETE /api/v1/policies/:id */}
      <section className="my-8">
        <h2 id="delete-policy" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Delete Policy</h2>
        <EndpointCard method="DELETE" path="/api/v1/policies/:id" description="Permanently delete a policy">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The policy's unique identifier" },
          ]} />
          <Callout type="warning" title="Permanent deletion">
            This permanently removes the policy and all its versions. Agents previously governed by this policy will no longer be evaluated against it.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns <code style={{ color: "var(--blue)" }}>204 No Content</code> on success.
          </p>
        </EndpointCard>
      </section>

      {/* POST /api/v1/authorize */}
      <section className="my-8">
        <h2 id="authorize" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Evaluate Authorization</h2>
        <EndpointCard method="POST" path="/api/v1/authorize" description="Evaluate all active policies against an authorization request">
          <ParamTable title="Request Body" params={[
            { name: "agentId", type: "UUIDv7", required: true, description: "The agent requesting authorization" },
            { name: "action", type: "string", required: true, description: "The action being requested (e.g. \"read\", \"write\", \"execute\")" },
            { name: "resource", type: "string", required: true, description: "The target resource identifier" },
            { name: "context", type: "object", description: "Additional context for rule evaluation (e.g. IP, time, custom attributes)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            Returns an authorization decision:
          </p>
          <div className="rounded-lg p-4 font-mono text-sm" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--text-muted)" }}>{"{"}</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;decision&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;allow&quot;</span> | <span style={{ color: "var(--teal)" }}>&quot;deny&quot;</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;matchedPolicies&quot;</span>: [ ... ],</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;reason&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;string&quot;</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;evaluationTimeMs&quot;</span>: <span style={{ color: "var(--teal)" }}>2.4</span></div>
            <div style={{ color: "var(--text-muted)" }}>{"}"}</div>
          </div>
          <Callout type="tip" title="Audit trail">
            Every authorization evaluation is automatically logged to the audit trail, regardless of the decision.
          </Callout>
        </EndpointCard>
      </section>

      {/* GET /api/v1/policies/:id/versions */}
      <section className="my-8">
        <h2 id="list-versions" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>List Policy Versions</h2>
        <EndpointCard method="GET" path="/api/v1/policies/:id/versions" description="List all versions of a policy">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The policy's unique identifier" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns an array of policy version snapshots, each containing the full rule set and metadata at that point in time. Ordered newest-first.
          </p>
        </EndpointCard>
      </section>

      {/* POST /api/v1/policies/:id/rollback */}
      <section className="my-8">
        <h2 id="rollback-policy" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Rollback Policy</h2>
        <EndpointCard method="POST" path="/api/v1/policies/:id/rollback" description="Rollback a policy to a previous version">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The policy's unique identifier" },
          ]} />
          <ParamTable title="Request Body" params={[
            { name: "version", type: "number", required: true, description: "The version number to rollback to" },
          ]} />
          <Callout type="warning" title="Creates a new version">
            Rollback does not delete versions. It creates a new version with the same rules as the target version, maintaining a complete history.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the policy with the restored rules and a new incremented version number.
          </p>
        </EndpointCard>
      </section>
    </div>
  );
}
