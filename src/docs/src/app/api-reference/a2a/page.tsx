import { EndpointCard } from "@/components/EndpointCard";
import { ParamTable, type Param } from "@/components/ParamTable";
import { Callout } from "@/components/Callout";

export default function A2aApiPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4 gradient-text">A2A Channels API</h1>
      <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
        Manage agent-to-agent communication channels and visualize the interaction graph.
        Channels define authorized communication paths between agents with configurable action filters and rate limits.
      </p>

      <Callout type="info" title="Authentication required">
        All A2A endpoints require a valid API key with the <code style={{ color: "var(--blue)" }}>a2a:read</code> or <code style={{ color: "var(--blue)" }}>a2a:write</code> scope.
      </Callout>

      {/* POST /api/v1/a2a/channels */}
      <section className="my-8">
        <h2 id="create-channel" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Create Channel</h2>
        <EndpointCard method="POST" path="/api/v1/a2a/channels" description="Create a new agent-to-agent communication channel">
          <ParamTable title="Request Body" params={[
            { name: "name", type: "string", required: true, description: "Human-readable channel name" },
            { name: "sourceAgentId", type: "UUIDv7", required: true, description: "The agent initiating communication" },
            { name: "targetAgentId", type: "UUIDv7", required: true, description: "The agent receiving communication" },
            { name: "allowedActions", type: "string[]", description: "Whitelist of actions permitted on this channel (default: all)" },
            { name: "rateLimit", type: "number", description: "Max requests per minute on this channel (default: 60)" },
          ]} />
          <Callout type="tip" title="Unidirectional channels">
            Channels are unidirectional. To allow bidirectional communication between two agents, create two channels with swapped source and target.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the created <code style={{ color: "var(--blue)" }}>A2AChannel</code> object with generated ID, status, and timestamps.
          </p>
        </EndpointCard>
      </section>

      {/* GET /api/v1/a2a/channels */}
      <section className="my-8">
        <h2 id="list-channels" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>List Channels</h2>
        <EndpointCard method="GET" path="/api/v1/a2a/channels" description="List all A2A communication channels">
          <ParamTable title="Query Parameters" params={[
            { name: "sourceAgentId", type: "UUIDv7", description: "Filter by source agent" },
            { name: "targetAgentId", type: "UUIDv7", description: "Filter by target agent" },
            { name: "limit", type: "number", description: "Max results per page (default 20, max 100)" },
            { name: "offset", type: "number", description: "Number of results to skip (default 0)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a paginated array of <code style={{ color: "var(--blue)" }}>A2AChannel</code> objects.
          </p>
        </EndpointCard>
      </section>

      {/* GET /api/v1/a2a/channels/:id */}
      <section className="my-8">
        <h2 id="get-channel" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Get Channel</h2>
        <EndpointCard method="GET" path="/api/v1/a2a/channels/:id" description="Get a specific A2A channel">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The channel's unique identifier" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the full <code style={{ color: "var(--blue)" }}>A2AChannel</code> object including source/target agent details, allowed actions, rate limit configuration, and usage statistics.
          </p>
        </EndpointCard>
      </section>

      {/* PATCH /api/v1/a2a/channels/:id */}
      <section className="my-8">
        <h2 id="update-channel" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Update Channel</h2>
        <EndpointCard method="PATCH" path="/api/v1/a2a/channels/:id" description="Update an A2A channel configuration">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The channel's unique identifier" },
          ]} />
          <ParamTable title="Request Body" params={[
            { name: "name", type: "string", description: "Updated channel name" },
            { name: "allowedActions", type: "string[]", description: "Updated action whitelist" },
            { name: "rateLimit", type: "number", description: "Updated rate limit (requests per minute)" },
            { name: "enabled", type: "boolean", description: "Enable or disable the channel" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the updated <code style={{ color: "var(--blue)" }}>A2AChannel</code> object.
          </p>
        </EndpointCard>
      </section>

      {/* DELETE /api/v1/a2a/channels/:id */}
      <section className="my-8">
        <h2 id="delete-channel" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Delete Channel</h2>
        <EndpointCard method="DELETE" path="/api/v1/a2a/channels/:id" description="Delete an A2A channel">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The channel's unique identifier" },
          ]} />
          <Callout type="warning" title="Communication disruption">
            Deleting a channel immediately prevents the source agent from communicating with the target agent through this path. Ensure the agents do not depend on this channel for critical operations.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns <code style={{ color: "var(--blue)" }}>204 No Content</code> on success.
          </p>
        </EndpointCard>
      </section>

      {/* GET /api/v1/a2a/graph */}
      <section className="my-8">
        <h2 id="interaction-graph" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Agent Interaction Graph</h2>
        <EndpointCard method="GET" path="/api/v1/a2a/graph" description="Get the complete agent interaction graph">
          <ParamTable title="Query Parameters" params={[
            { name: "includeDisabled", type: "boolean", description: "Include disabled channels in the graph (default false)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            Returns the full interaction graph as nodes (agents) and edges (channels):
          </p>
          <div className="rounded-lg p-4 font-mono text-sm" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--text-muted)" }}>{"{"}</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;nodes&quot;</span>: {"["}</div>
            <div className="ml-8" style={{ color: "var(--text-muted)" }}>{"{"} <span style={{ color: "var(--blue)" }}>&quot;id&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;01912c4a-...&quot;</span>, <span style={{ color: "var(--blue)" }}>&quot;name&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;Code Assistant&quot;</span>, <span style={{ color: "var(--blue)" }}>&quot;riskLevel&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;medium&quot;</span> {"}"},</div>
            <div className="ml-8" style={{ color: "var(--text-muted)" }}>...</div>
            <div className="ml-4">{"],"},</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;edges&quot;</span>: {"["}</div>
            <div className="ml-8" style={{ color: "var(--text-muted)" }}>{"{"} <span style={{ color: "var(--blue)" }}>&quot;source&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;01912c4a-...&quot;</span>, <span style={{ color: "var(--blue)" }}>&quot;target&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;01912c4b-...&quot;</span>, <span style={{ color: "var(--blue)" }}>&quot;channelId&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;01912c4c-...&quot;</span> {"}"},</div>
            <div className="ml-8" style={{ color: "var(--text-muted)" }}>...</div>
            <div className="ml-4">{"]"}</div>
            <div style={{ color: "var(--text-muted)" }}>{"}"}</div>
          </div>
          <Callout type="tip" title="Visualization">
            The graph data is compatible with common visualization libraries like D3.js, Cytoscape, and vis.js. The dashboard uses this endpoint to render the interactive agent topology view.
          </Callout>
        </EndpointCard>
      </section>
    </div>
  );
}
