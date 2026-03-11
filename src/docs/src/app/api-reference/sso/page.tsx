import { EndpointCard } from "@/components/EndpointCard";
import { ParamTable, type Param } from "@/components/ParamTable";
import { Callout } from "@/components/Callout";

export default function SsoApiPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4 gradient-text">SSO API</h1>
      <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
        Configure SAML and OIDC single sign-on connections, manage SSO sessions,
        and handle SCIM token lifecycle for automated user provisioning.
      </p>

      <Callout type="info" title="Authentication required">
        All SSO endpoints require a valid API key with the <code style={{ color: "var(--blue)" }}>sso:read</code> or <code style={{ color: "var(--blue)" }}>sso:write</code> scope.
      </Callout>

      {/* --- Connections --- */}
      <section className="my-8">
        <h2 id="connections" className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>SSO Connections</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          SSO connections link a tenant to an external identity provider via SAML 2.0 or OpenID Connect.
        </p>

        {/* POST /api/v1/sso/connections */}
        <EndpointCard method="POST" path="/api/v1/sso/connections" description="Create a new SSO connection">
          <ParamTable title="Request Body" params={[
            { name: "tenantId", type: "string", required: true, description: "Tenant slug or ID to associate this connection with" },
            { name: "provider", type: "string", required: true, description: "Identity provider name (e.g. \"Okta\", \"Azure AD\", \"Google Workspace\")" },
            { name: "protocol", type: "enum", required: true, description: "\"saml\" or \"oidc\"" },
            { name: "config", type: "object", required: true, description: "Protocol-specific configuration (see below)" },
          ]} />
          <Callout type="tip" title="SAML config fields">
            For SAML: <code style={{ color: "var(--blue)" }}>entryPoint</code>, <code style={{ color: "var(--blue)" }}>issuer</code>, <code style={{ color: "var(--blue)" }}>cert</code> (X.509 PEM). For OIDC: <code style={{ color: "var(--blue)" }}>clientId</code>, <code style={{ color: "var(--blue)" }}>clientSecret</code>, <code style={{ color: "var(--blue)" }}>discoveryUrl</code>.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the created <code style={{ color: "var(--blue)" }}>SSOConnection</code> object with generated ID, ACS URL, and SP metadata URL.
          </p>
        </EndpointCard>

        {/* GET /api/v1/sso/connections */}
        <EndpointCard method="GET" path="/api/v1/sso/connections" description="List all SSO connections">
          <ParamTable title="Query Parameters" params={[
            { name: "tenantId", type: "string", description: "Filter by tenant slug or ID" },
            { name: "limit", type: "number", description: "Max results per page (default 20, max 100)" },
            { name: "offset", type: "number", description: "Number of results to skip (default 0)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a paginated array of <code style={{ color: "var(--blue)" }}>SSOConnection</code> objects.
          </p>
        </EndpointCard>

        {/* GET /api/v1/sso/connections/:id */}
        <EndpointCard method="GET" path="/api/v1/sso/connections/:id" description="Get a specific SSO connection">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The SSO connection's unique identifier" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the full <code style={{ color: "var(--blue)" }}>SSOConnection</code> object including configuration, status, and last sync time.
          </p>
        </EndpointCard>

        {/* PATCH /api/v1/sso/connections/:id */}
        <EndpointCard method="PATCH" path="/api/v1/sso/connections/:id" description="Update an SSO connection">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The SSO connection's unique identifier" },
          ]} />
          <ParamTable title="Request Body" params={[
            { name: "provider", type: "string", description: "Updated provider name" },
            { name: "config", type: "object", description: "Updated protocol-specific configuration" },
            { name: "enabled", type: "boolean", description: "Enable or disable the connection" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the updated <code style={{ color: "var(--blue)" }}>SSOConnection</code> object.
          </p>
        </EndpointCard>

        {/* DELETE /api/v1/sso/connections/:id */}
        <EndpointCard method="DELETE" path="/api/v1/sso/connections/:id" description="Delete an SSO connection">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The SSO connection's unique identifier" },
          ]} />
          <Callout type="warning" title="Active sessions">
            Deleting a connection does not terminate active SSO sessions. Use the session revocation endpoint to force logout affected users.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns <code style={{ color: "var(--blue)" }}>204 No Content</code> on success.
          </p>
        </EndpointCard>

        {/* POST /api/v1/sso/connections/:id/test */}
        <EndpointCard method="POST" path="/api/v1/sso/connections/:id/test" description="Test an SSO connection">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The SSO connection's unique identifier" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            Returns a test result:
          </p>
          <div className="rounded-lg p-4 font-mono text-sm" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--text-muted)" }}>{"{"}</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;success&quot;</span>: <span style={{ color: "var(--teal)" }}>true</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;latencyMs&quot;</span>: <span style={{ color: "var(--teal)" }}>234</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;details&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;Successfully connected to IdP metadata endpoint&quot;</span></div>
            <div style={{ color: "var(--text-muted)" }}>{"}"}</div>
          </div>
        </EndpointCard>
      </section>

      {/* --- Sessions --- */}
      <section className="my-8">
        <h2 id="sessions" className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>SSO Sessions</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Manage active SSO sessions across your tenants. Sessions are created when users authenticate via SAML or OIDC.
        </p>

        {/* GET /api/v1/sso/sessions */}
        <EndpointCard method="GET" path="/api/v1/sso/sessions" description="List SSO sessions">
          <ParamTable title="Query Parameters" params={[
            { name: "tenantId", type: "string", description: "Filter by tenant slug or ID" },
            { name: "active", type: "boolean", description: "Filter by active status (default: true)" },
            { name: "limit", type: "number", description: "Max results per page (default 20, max 100)" },
            { name: "offset", type: "number", description: "Number of results to skip (default 0)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a paginated array of session objects with user info, connection ID, IP address, and expiration time.
          </p>
        </EndpointCard>

        {/* DELETE /api/v1/sso/sessions/:id */}
        <EndpointCard method="DELETE" path="/api/v1/sso/sessions/:id" description="Revoke an SSO session">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The session's unique identifier" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns <code style={{ color: "var(--blue)" }}>204 No Content</code>. The user will be required to re-authenticate on their next request.
          </p>
        </EndpointCard>
      </section>

      {/* --- SSO Audit --- */}
      <section className="my-8">
        <h2 id="sso-audit" className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>SSO Audit Log</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          SSO-specific audit events including login attempts, session creation, and configuration changes.
        </p>

        {/* GET /api/v1/sso/audit */}
        <EndpointCard method="GET" path="/api/v1/sso/audit" description="Query SSO-specific audit events">
          <ParamTable title="Query Parameters" params={[
            { name: "tenantId", type: "string", description: "Filter by tenant slug or ID" },
            { name: "event", type: "string", description: "Filter by event type (e.g. \"login_success\", \"login_failure\", \"session_revoked\")" },
            { name: "from", type: "ISO 8601", description: "Start of time range (inclusive)" },
            { name: "to", type: "ISO 8601", description: "End of time range (exclusive)" },
            { name: "limit", type: "number", description: "Max results per page (default 20, max 100)" },
            { name: "offset", type: "number", description: "Number of results to skip (default 0)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a paginated array of SSO audit events with timestamp, event type, user, connection, and details.
          </p>
        </EndpointCard>
      </section>

      {/* --- SCIM Tokens --- */}
      <section className="my-8">
        <h2 id="scim-tokens" className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>SCIM Tokens</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Manage bearer tokens used by identity providers to authenticate SCIM 2.0 provisioning requests.
        </p>

        {/* GET /api/v1/sso/scim-tokens */}
        <EndpointCard method="GET" path="/api/v1/sso/scim-tokens" description="List SCIM provisioning tokens">
          <ParamTable title="Query Parameters" params={[
            { name: "tenantId", type: "string", description: "Filter by tenant slug or ID" },
            { name: "limit", type: "number", description: "Max results per page (default 20, max 100)" },
            { name: "offset", type: "number", description: "Number of results to skip (default 0)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a paginated array of SCIM token objects with masked token values.
          </p>
        </EndpointCard>

        {/* POST /api/v1/sso/scim-tokens */}
        <EndpointCard method="POST" path="/api/v1/sso/scim-tokens" description="Create a new SCIM provisioning token">
          <ParamTable title="Request Body" params={[
            { name: "tenantId", type: "string", required: true, description: "Tenant slug or ID this token will provision for" },
            { name: "name", type: "string", required: true, description: "Descriptive name for the token" },
          ]} />
          <Callout type="danger" title="Store the token now">
            The full SCIM token value is only returned in this response. Configure it in your IdP immediately.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the SCIM token object with the full bearer token value.
          </p>
        </EndpointCard>

        {/* DELETE /api/v1/sso/scim-tokens/:id */}
        <EndpointCard method="DELETE" path="/api/v1/sso/scim-tokens/:id" description="Revoke a SCIM provisioning token">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "UUIDv7", required: true, description: "The SCIM token's unique identifier" },
          ]} />
          <Callout type="warning" title="Provisioning impact">
            Revoking a SCIM token will prevent your IdP from syncing user and group changes. Create a replacement token and update your IdP before revoking.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns <code style={{ color: "var(--blue)" }}>204 No Content</code> on success.
          </p>
        </EndpointCard>
      </section>
    </div>
  );
}
