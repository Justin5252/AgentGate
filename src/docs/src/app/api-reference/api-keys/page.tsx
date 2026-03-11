import { EndpointCard } from "@/components/EndpointCard";
import { ParamTable, type Param } from "@/components/ParamTable";
import { Callout } from "@/components/Callout";

export default function ApiKeysPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4 gradient-text">API Keys</h1>
      <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
        Create, list, rotate, and revoke API keys. Keys are scoped to specific permissions and can have
        optional expiration dates for enhanced security.
      </p>

      <Callout type="info" title="Authentication required">
        All API Keys endpoints require a valid API key with the <code style={{ color: "var(--blue)" }}>keys:read</code> or <code style={{ color: "var(--blue)" }}>keys:write</code> scope.
      </Callout>

      <Callout type="warning" title="Key visibility">
        The full API key value is only returned once at creation time (and on rotation). Store it securely &mdash; it cannot be retrieved later. Only a masked prefix is shown in subsequent requests.
      </Callout>

      {/* POST /api/v1/keys */}
      <section className="my-8">
        <h2 id="create-key" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Create API Key</h2>
        <EndpointCard method="POST" path="/api/v1/keys" description="Generate a new API key">
          <ParamTable title="Request Body" params={[
            { name: "name", type: "string", required: true, description: "Descriptive name for the key (e.g. \"Production Backend\")" },
            { name: "scopes", type: "string[]", description: "Permission scopes (e.g. [\"agents:read\", \"policies:write\"]). Defaults to all scopes." },
            { name: "expiresAt", type: "ISO 8601", description: "Optional expiration timestamp. Key becomes invalid after this time." },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            Returns the key object including the full key value:
          </p>
          <div className="rounded-lg p-4 font-mono text-sm" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--text-muted)" }}>{"{"}</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;id&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;01912c4a-...&quot;</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;name&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;Production Backend&quot;</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;key&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;ag_live_xxxxxxxxxxxxxxxxxxxxxxxx&quot;</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;scopes&quot;</span>: [<span style={{ color: "var(--teal)" }}>&quot;agents:read&quot;</span>, <span style={{ color: "var(--teal)" }}>&quot;policies:write&quot;</span>],</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;expiresAt&quot;</span>: <span style={{ color: "var(--teal)" }}>null</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;createdAt&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;2026-03-11T10:00:00Z&quot;</span></div>
            <div style={{ color: "var(--text-muted)" }}>{"}"}</div>
          </div>
          <Callout type="danger" title="Store the key now">
            The <code style={{ color: "var(--blue)" }}>key</code> field is only included in this response. Copy and store it in a secure location immediately.
          </Callout>
        </EndpointCard>
      </section>

      {/* GET /api/v1/keys */}
      <section className="my-8">
        <h2 id="list-keys" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>List API Keys</h2>
        <EndpointCard method="GET" path="/api/v1/keys" description="List all API keys for the current tenant">
          <ParamTable title="Query Parameters" params={[
            { name: "limit", type: "number", description: "Max results per page (default 20, max 100)" },
            { name: "offset", type: "number", description: "Number of results to skip (default 0)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a paginated array of API key objects. The <code style={{ color: "var(--blue)" }}>key</code> field is masked (only the prefix is shown, e.g. <code style={{ color: "var(--blue)" }}>ag_live_xxxx...xxxx</code>).
          </p>
        </EndpointCard>
      </section>

      {/* GET /api/v1/keys/:id */}
      <section className="my-8">
        <h2 id="get-key" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Get API Key</h2>
        <EndpointCard method="GET" path="/api/v1/keys/:id" description="Get details for a specific API key">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The API key's unique identifier" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the key object with masked key value, scopes, last used timestamp, and status.
          </p>
        </EndpointCard>
      </section>

      {/* DELETE /api/v1/keys/:id */}
      <section className="my-8">
        <h2 id="revoke-key" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Revoke API Key</h2>
        <EndpointCard method="DELETE" path="/api/v1/keys/:id" description="Permanently revoke an API key">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The API key's unique identifier" },
          ]} />
          <Callout type="warning" title="Immediate effect">
            Revoking a key takes effect immediately. Any in-flight requests using this key will fail with <code style={{ color: "var(--blue)" }}>401 Unauthorized</code>.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns <code style={{ color: "var(--blue)" }}>204 No Content</code> on success.
          </p>
        </EndpointCard>
      </section>

      {/* POST /api/v1/keys/:id/rotate */}
      <section className="my-8">
        <h2 id="rotate-key" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Rotate API Key</h2>
        <EndpointCard method="POST" path="/api/v1/keys/:id/rotate" description="Rotate an API key (invalidate old, issue new)">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The API key's unique identifier" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            Returns a new key object with a fresh key value. The old key is immediately invalidated. Name, scopes, and expiration are preserved.
          </p>
          <Callout type="tip" title="Zero-downtime rotation">
            For zero-downtime key rotation, create a new key first, update your services, then revoke the old key. The rotate endpoint is best for immediate rotation when the old key may be compromised.
          </Callout>
        </EndpointCard>
      </section>
    </div>
  );
}
