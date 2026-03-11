import { EndpointCard } from "@/components/EndpointCard";
import { ParamTable, type Param } from "@/components/ParamTable";
import { Callout } from "@/components/Callout";

export default function AuthRoutesPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4 gradient-text">Auth Routes</h1>
      <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
        Public authentication endpoints for SAML and OIDC login flows, session management,
        and SP metadata. These routes are called by browsers and identity providers during the SSO handshake.
      </p>

      <Callout type="tip" title="No API key required">
        Auth routes are public endpoints and do not require API key authentication. They are called by browsers during login redirects and by IdPs during SAML/OIDC callbacks.
      </Callout>

      {/* --- SAML --- */}
      <section className="my-8">
        <h2 id="saml" className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>SAML 2.0</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Endpoints for the SAML 2.0 authentication flow. The login endpoint initiates SP-initiated SSO,
          the ACS endpoint receives the IdP response, and the metadata endpoint provides SP configuration.
        </p>

        {/* GET /api/v1/auth/saml/:tenantSlug/login */}
        <EndpointCard method="GET" path="/api/v1/auth/saml/:tenantSlug/login" description="Initiate SAML login (SP-initiated SSO)">
          <ParamTable title="Path Parameters" params={[
            { name: "tenantSlug", type: "string", required: true, description: "The tenant's unique slug" },
          ]} />
          <ParamTable title="Query Parameters" params={[
            { name: "returnTo", type: "string", description: "URL to redirect to after successful authentication" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a <code style={{ color: "var(--blue)" }}>302 Redirect</code> to the IdP&apos;s SAML login page with an encoded AuthnRequest.
          </p>
        </EndpointCard>

        {/* POST /api/v1/auth/saml/:tenantSlug/acs */}
        <EndpointCard method="POST" path="/api/v1/auth/saml/:tenantSlug/acs" description="SAML Assertion Consumer Service (ACS) callback">
          <ParamTable title="Path Parameters" params={[
            { name: "tenantSlug", type: "string", required: true, description: "The tenant's unique slug" },
          ]} />
          <ParamTable title="Request Body (form-encoded)" params={[
            { name: "SAMLResponse", type: "string", required: true, description: "Base64-encoded SAML response from the IdP" },
            { name: "RelayState", type: "string", description: "Opaque state value preserved through the SSO flow" },
          ]} />
          <Callout type="info" title="Called by the IdP">
            This endpoint is called by the identity provider after the user authenticates. It validates the SAML assertion, creates a session, and redirects to the application.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            On success: <code style={{ color: "var(--blue)" }}>302 Redirect</code> to the application with a session cookie set.
            On failure: <code style={{ color: "var(--blue)" }}>400 Bad Request</code> with error details.
          </p>
        </EndpointCard>

        {/* GET /api/v1/auth/saml/:tenantSlug/metadata */}
        <EndpointCard method="GET" path="/api/v1/auth/saml/:tenantSlug/metadata" description="Service Provider metadata XML">
          <ParamTable title="Path Parameters" params={[
            { name: "tenantSlug", type: "string", required: true, description: "The tenant's unique slug" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns XML with <code style={{ color: "var(--blue)" }}>Content-Type: application/xml</code>. Contains the SP entity ID, ACS URL, signing certificate, and supported name ID formats. Use this URL when configuring the AgentGate application in your IdP.
          </p>
        </EndpointCard>
      </section>

      {/* --- OIDC --- */}
      <section className="my-8">
        <h2 id="oidc" className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>OpenID Connect</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Endpoints for the OIDC Authorization Code flow. The login endpoint redirects to the IdP and the callback endpoint exchanges the authorization code for tokens.
        </p>

        {/* GET /api/v1/auth/oidc/:tenantSlug/login */}
        <EndpointCard method="GET" path="/api/v1/auth/oidc/:tenantSlug/login" description="Initiate OIDC login">
          <ParamTable title="Path Parameters" params={[
            { name: "tenantSlug", type: "string", required: true, description: "The tenant's unique slug" },
          ]} />
          <ParamTable title="Query Parameters" params={[
            { name: "returnTo", type: "string", description: "URL to redirect to after successful authentication" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a <code style={{ color: "var(--blue)" }}>302 Redirect</code> to the IdP&apos;s authorization endpoint with <code style={{ color: "var(--blue)" }}>code</code> response type, requested scopes, and a PKCE challenge.
          </p>
        </EndpointCard>

        {/* GET /api/v1/auth/oidc/:tenantSlug/callback */}
        <EndpointCard method="GET" path="/api/v1/auth/oidc/:tenantSlug/callback" description="OIDC authorization callback">
          <ParamTable title="Path Parameters" params={[
            { name: "tenantSlug", type: "string", required: true, description: "The tenant's unique slug" },
          ]} />
          <ParamTable title="Query Parameters" params={[
            { name: "code", type: "string", required: true, description: "Authorization code from the IdP" },
            { name: "state", type: "string", required: true, description: "State parameter for CSRF protection" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Exchanges the code for tokens, validates the ID token, creates a session, and returns a <code style={{ color: "var(--blue)" }}>302 Redirect</code> to the application with a session cookie.
          </p>
        </EndpointCard>
      </section>

      {/* --- Session Management --- */}
      <section className="my-8">
        <h2 id="sessions" className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Session Management</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Endpoints for refreshing and revoking SSO sessions. These are called by the application frontend to manage user sessions.
        </p>

        {/* POST /api/v1/auth/session/refresh */}
        <EndpointCard method="POST" path="/api/v1/auth/session/refresh" description="Refresh an SSO session">
          <ParamTable title="Request Body" params={[
            { name: "sessionToken", type: "string", required: true, description: "The current session token (from cookie or header)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            Returns a new session with extended expiration:
          </p>
          <div className="rounded-lg p-4 font-mono text-sm" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--text-muted)" }}>{"{"}</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;sessionToken&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;sess_xxxxxxxx&quot;</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;expiresAt&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;2026-03-12T10:00:00Z&quot;</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;user&quot;</span>: <span style={{ color: "var(--text-muted)" }}>{"{ ... }"}</span></div>
            <div style={{ color: "var(--text-muted)" }}>{"}"}</div>
          </div>
        </EndpointCard>

        {/* POST /api/v1/auth/session/logout */}
        <EndpointCard method="POST" path="/api/v1/auth/session/logout" description="Logout and revoke an SSO session">
          <ParamTable title="Request Body" params={[
            { name: "sessionToken", type: "string", required: true, description: "The session token to revoke" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns <code style={{ color: "var(--blue)" }}>204 No Content</code> on success. The session is immediately invalidated and the user will need to re-authenticate.
          </p>
          <Callout type="info" title="SLO support">
            If the SSO connection supports Single Logout (SLO), this endpoint also initiates a logout request to the IdP.
          </Callout>
        </EndpointCard>
      </section>
    </div>
  );
}
