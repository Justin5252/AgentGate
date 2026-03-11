import { EndpointCard } from "@/components/EndpointCard";
import { ParamTable, type Param } from "@/components/ParamTable";
import { Callout } from "@/components/Callout";

export default function ScimApiPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4 gradient-text">SCIM 2.0 API</h1>
      <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
        RFC 7643/7644 compliant SCIM endpoints for automated user and group provisioning.
        Identity providers like Okta, Azure AD, and OneLogin use these endpoints to sync directory changes in real time.
      </p>

      <Callout type="warning" title="SCIM bearer tokens">
        SCIM endpoints use separate bearer tokens generated via the <a href="/api-reference/sso#scim-tokens" style={{ color: "var(--blue)", textDecoration: "underline" }}>SSO SCIM Tokens</a> endpoints. These are distinct from your regular API keys.
      </Callout>

      <div className="rounded-xl p-5 my-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Base Path</h3>
        <code className="text-sm font-mono" style={{ color: "var(--teal)" }}>
          /api/v1/scim/:tenantSlug
        </code>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          All SCIM endpoints are scoped to a specific tenant via the <code style={{ color: "var(--blue)" }}>tenantSlug</code> path segment.
        </p>
      </div>

      {/* --- Discovery --- */}
      <section className="my-8">
        <h2 id="discovery" className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Discovery Endpoints</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Standard SCIM discovery endpoints for service provider capabilities.
        </p>

        <EndpointCard method="GET" path="/api/v1/scim/:tenantSlug/ServiceProviderConfig" description="SCIM service provider configuration">
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the SCIM <code style={{ color: "var(--blue)" }}>ServiceProviderConfig</code> resource describing supported features:
            PATCH operations, bulk operations, filtering, sorting, change password, and authentication schemes.
          </p>
        </EndpointCard>

        <EndpointCard method="GET" path="/api/v1/scim/:tenantSlug/ResourceTypes" description="Supported SCIM resource types">
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns an array of supported resource types: <code style={{ color: "var(--blue)" }}>User</code> and <code style={{ color: "var(--blue)" }}>Group</code>.
          </p>
        </EndpointCard>

        <EndpointCard method="GET" path="/api/v1/scim/:tenantSlug/Schemas" description="SCIM schema definitions">
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the full SCIM schema definitions for User and Group resources, including all supported attributes and their mutability.
          </p>
        </EndpointCard>
      </section>

      {/* --- Users --- */}
      <section className="my-8">
        <h2 id="users" className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Users</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          SCIM user lifecycle management. Users are mapped to tenant members and can be provisioned, updated, and deactivated by your IdP.
        </p>

        {/* POST /Users */}
        <EndpointCard method="POST" path="/api/v1/scim/:tenantSlug/Users" description="Create a new user via SCIM">
          <ParamTable title="Request Body (SCIM User schema)" params={[
            { name: "userName", type: "string", required: true, description: "Unique user identifier (typically email)" },
            { name: "name", type: "object", required: true, description: "Name object with givenName, familyName, formatted" },
            { name: "emails", type: "Email[]", required: true, description: "Array of email objects with value, type, and primary flag" },
            { name: "displayName", type: "string", description: "Display name for the user" },
            { name: "active", type: "boolean", description: "Whether the user account is active (default true)" },
            { name: "externalId", type: "string", description: "External identifier from the IdP" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the created SCIM User resource with <code style={{ color: "var(--blue)" }}>201 Created</code> status and <code style={{ color: "var(--blue)" }}>Location</code> header.
          </p>
        </EndpointCard>

        {/* GET /Users */}
        <EndpointCard method="GET" path="/api/v1/scim/:tenantSlug/Users" description="List or filter users">
          <ParamTable title="Query Parameters" params={[
            { name: "filter", type: "string", description: "SCIM filter expression (e.g. 'userName eq \"alice@example.com\"')" },
            { name: "startIndex", type: "number", description: "1-based starting index (default 1)" },
            { name: "count", type: "number", description: "Max results to return (default 100)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a SCIM <code style={{ color: "var(--blue)" }}>ListResponse</code> with <code style={{ color: "var(--blue)" }}>totalResults</code>, <code style={{ color: "var(--blue)" }}>startIndex</code>, <code style={{ color: "var(--blue)" }}>itemsPerPage</code>, and <code style={{ color: "var(--blue)" }}>Resources</code> array.
          </p>
        </EndpointCard>

        {/* GET /Users/:id */}
        <EndpointCard method="GET" path="/api/v1/scim/:tenantSlug/Users/:id" description="Get a specific user">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "string", required: true, description: "The SCIM user ID" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the full SCIM User resource.
          </p>
        </EndpointCard>

        {/* PATCH /Users/:id */}
        <EndpointCard method="PATCH" path="/api/v1/scim/:tenantSlug/Users/:id" description="Partially update a user (SCIM PATCH)">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "string", required: true, description: "The SCIM user ID" },
          ]} />
          <ParamTable title="Request Body" params={[
            { name: "schemas", type: "string[]", required: true, description: "[\"urn:ietf:params:scim:api:messages:2.0:PatchOp\"]" },
            { name: "Operations", type: "PatchOp[]", required: true, description: "Array of SCIM patch operations (add, replace, remove)" },
          ]} />
          <Callout type="info" title="SCIM PATCH operations">
            Each operation contains <code style={{ color: "var(--blue)" }}>op</code> (&quot;add&quot;, &quot;replace&quot;, &quot;remove&quot;), optional <code style={{ color: "var(--blue)" }}>path</code>, and optional <code style={{ color: "var(--blue)" }}>value</code>. This is the primary method IdPs use to update attributes and deactivate users.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the updated SCIM User resource.
          </p>
        </EndpointCard>

        {/* PUT /Users/:id */}
        <EndpointCard method="PUT" path="/api/v1/scim/:tenantSlug/Users/:id" description="Replace a user entirely">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "string", required: true, description: "The SCIM user ID" },
          ]} />
          <ParamTable title="Request Body" params={[
            { name: "userName", type: "string", required: true, description: "Unique user identifier" },
            { name: "name", type: "object", required: true, description: "Name object with givenName, familyName" },
            { name: "emails", type: "Email[]", required: true, description: "Array of email objects" },
            { name: "active", type: "boolean", description: "Whether the user is active" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the replaced SCIM User resource. All attributes not included in the request body are reset to defaults.
          </p>
        </EndpointCard>

        {/* DELETE /Users/:id */}
        <EndpointCard method="DELETE" path="/api/v1/scim/:tenantSlug/Users/:id" description="Deactivate a user (soft delete)">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "string", required: true, description: "The SCIM user ID" },
          ]} />
          <Callout type="info" title="Soft delete">
            Per SCIM conventions, DELETE sets the user to <code style={{ color: "var(--blue)" }}>active: false</code> rather than permanently removing the record. The user can be reactivated via a PATCH operation.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns <code style={{ color: "var(--blue)" }}>204 No Content</code> on success.
          </p>
        </EndpointCard>
      </section>

      {/* --- Groups --- */}
      <section className="my-8">
        <h2 id="groups" className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Groups</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          SCIM group management for role-based access control. Groups can be mapped to AgentGate roles for automatic permission assignment.
        </p>

        {/* POST /Groups */}
        <EndpointCard method="POST" path="/api/v1/scim/:tenantSlug/Groups" description="Create a new group">
          <ParamTable title="Request Body (SCIM Group schema)" params={[
            { name: "displayName", type: "string", required: true, description: "Group display name" },
            { name: "members", type: "Member[]", description: "Array of member references with value (user ID) and display" },
            { name: "externalId", type: "string", description: "External identifier from the IdP" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the created SCIM Group resource with <code style={{ color: "var(--blue)" }}>201 Created</code> status.
          </p>
        </EndpointCard>

        {/* GET /Groups */}
        <EndpointCard method="GET" path="/api/v1/scim/:tenantSlug/Groups" description="List or filter groups">
          <ParamTable title="Query Parameters" params={[
            { name: "filter", type: "string", description: "SCIM filter expression (e.g. 'displayName eq \"Engineering\"')" },
            { name: "startIndex", type: "number", description: "1-based starting index (default 1)" },
            { name: "count", type: "number", description: "Max results to return (default 100)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a SCIM <code style={{ color: "var(--blue)" }}>ListResponse</code> with Group resources.
          </p>
        </EndpointCard>

        {/* GET /Groups/:id */}
        <EndpointCard method="GET" path="/api/v1/scim/:tenantSlug/Groups/:id" description="Get a specific group">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "string", required: true, description: "The SCIM group ID" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the full SCIM Group resource including members list.
          </p>
        </EndpointCard>

        {/* PATCH /Groups/:id */}
        <EndpointCard method="PATCH" path="/api/v1/scim/:tenantSlug/Groups/:id" description="Update a group (SCIM PATCH)">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "string", required: true, description: "The SCIM group ID" },
          ]} />
          <ParamTable title="Request Body" params={[
            { name: "schemas", type: "string[]", required: true, description: "[\"urn:ietf:params:scim:api:messages:2.0:PatchOp\"]" },
            { name: "Operations", type: "PatchOp[]", required: true, description: "Array of SCIM patch operations for adding/removing members or updating attributes" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the updated SCIM Group resource.
          </p>
        </EndpointCard>

        {/* DELETE /Groups/:id */}
        <EndpointCard method="DELETE" path="/api/v1/scim/:tenantSlug/Groups/:id" description="Delete a group">
          <ParamTable title="Path Parameters" params={[
            { name: "id", type: "string", required: true, description: "The SCIM group ID" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns <code style={{ color: "var(--blue)" }}>204 No Content</code> on success. All member associations are removed.
          </p>
        </EndpointCard>
      </section>
    </div>
  );
}
