import { EndpointCard } from "@/components/EndpointCard";
import { ParamTable, type Param } from "@/components/ParamTable";
import { Callout } from "@/components/Callout";

export default function AgentsApiPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4 gradient-text">Agents API</h1>
      <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
        Register, query, update, and revoke AI agent identities. Every agent in AgentGate is assigned a
        UUIDv7 identifier and tracked throughout its lifecycle.
      </p>

      <Callout type="info" title="Authentication required">
        All Agents endpoints require a valid API key with the <code style={{ color: "var(--blue)" }}>agents:read</code> or <code style={{ color: "var(--blue)" }}>agents:write</code> scope.
      </Callout>

      {/* POST /api/v1/agents */}
      <section className="my-8">
        <h2 id="create-agent" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Create Agent</h2>
        <EndpointCard method="POST" path="/api/v1/agents" description="Register a new AI agent">
          <ParamTable title="Request Body" params={[
            { name: "name", type: "string", required: true, description: "Human-readable agent name" },
            { name: "owner", type: "string", required: true, description: "Owner identifier (user ID or team slug)" },
            { name: "capabilities", type: "string[]", description: "List of agent capabilities (e.g. \"web-search\", \"code-exec\")" },
            { name: "riskLevel", type: "enum", description: "\"low\" | \"medium\" | \"high\" | \"critical\" \u2014 defaults to \"medium\"" },
            { name: "metadata", type: "object", description: "Arbitrary key-value pairs for custom attributes" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the created <code style={{ color: "var(--blue)" }}>AgentIdentity</code> object with a generated UUIDv7 <code style={{ color: "var(--blue)" }}>id</code>, <code style={{ color: "var(--blue)" }}>status: &quot;active&quot;</code>, and timestamps.
          </p>
        </EndpointCard>
      </section>

      {/* GET /api/v1/agents */}
      <section className="my-8">
        <h2 id="list-agents" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>List Agents</h2>
        <EndpointCard method="GET" path="/api/v1/agents" description="List all registered agents with optional filters">
          <ParamTable title="Query Parameters" params={[
            { name: "status", type: "string", description: "Filter by status: \"active\", \"suspended\", or \"revoked\"" },
            { name: "ownerId", type: "string", description: "Filter by owner identifier" },
            { name: "limit", type: "number", description: "Max results per page (default 20, max 100)" },
            { name: "offset", type: "number", description: "Number of results to skip (default 0)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a paginated array of <code style={{ color: "var(--blue)" }}>AgentIdentity</code> objects in <code style={{ color: "var(--blue)" }}>data</code>, with <code style={{ color: "var(--blue)" }}>meta.total</code> for total count.
          </p>
        </EndpointCard>
      </section>

      {/* GET /api/v1/agents/:id */}
      <section className="my-8">
        <h2 id="get-agent" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Get Agent</h2>
        <EndpointCard method="GET" path="/api/v1/agents/:id" description="Retrieve a single agent by ID">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The agent's unique identifier" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the full <code style={{ color: "var(--blue)" }}>AgentIdentity</code> object including capabilities, risk level, metadata, and timestamps.
          </p>
        </EndpointCard>
      </section>

      {/* PATCH /api/v1/agents/:id */}
      <section className="my-8">
        <h2 id="update-agent" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Update Agent</h2>
        <EndpointCard method="PATCH" path="/api/v1/agents/:id" description="Update an existing agent's properties">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The agent's unique identifier" },
          ]} />
          <ParamTable title="Request Body" params={[
            { name: "name", type: "string", description: "Updated agent name" },
            { name: "capabilities", type: "string[]", description: "Updated capabilities list (replaces existing)" },
            { name: "riskLevel", type: "enum", description: "\"low\" | \"medium\" | \"high\" | \"critical\"" },
            { name: "metadata", type: "object", description: "Updated metadata (merged with existing)" },
            { name: "status", type: "enum", description: "\"active\" | \"suspended\" \u2014 use DELETE to revoke" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the updated <code style={{ color: "var(--blue)" }}>AgentIdentity</code> object.
          </p>
        </EndpointCard>
      </section>

      {/* DELETE /api/v1/agents/:id */}
      <section className="my-8">
        <h2 id="revoke-agent" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Revoke Agent</h2>
        <EndpointCard method="DELETE" path="/api/v1/agents/:id" description="Revoke an agent (sets status to revoked)">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The agent's unique identifier" },
          ]} />
          <Callout type="warning" title="Irreversible action">
            Revoking an agent sets its status to <code style={{ color: "var(--blue)" }}>&quot;revoked&quot;</code> permanently. All future policy evaluations for this agent will be denied. The agent record is retained for audit purposes.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the agent with <code style={{ color: "var(--blue)" }}>status: &quot;revoked&quot;</code> and a <code style={{ color: "var(--blue)" }}>revokedAt</code> timestamp.
          </p>
        </EndpointCard>
      </section>

      {/* GET /api/v1/agents/search */}
      <section className="my-8">
        <h2 id="search-agents" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Search Agents</h2>
        <EndpointCard method="GET" path="/api/v1/agents/search" description="Full-text search across agent names, owners, and capabilities">
          <ParamTable title="Query Parameters" params={[
            { name: "q", type: "string", required: true, description: "Search term to match against agent name, owner, and capabilities" },
            { name: "limit", type: "number", description: "Max results per page (default 20, max 100)" },
            { name: "offset", type: "number", description: "Number of results to skip (default 0)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a paginated array of matching <code style={{ color: "var(--blue)" }}>AgentIdentity</code> objects, ordered by relevance.
          </p>
        </EndpointCard>
      </section>
    </div>
  );
}
