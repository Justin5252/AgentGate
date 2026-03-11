import { EndpointCard } from "@/components/EndpointCard";
import { ParamTable, type Param } from "@/components/ParamTable";
import { Callout } from "@/components/Callout";

export default function TenantsApiPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4 gradient-text">Tenants API</h1>
      <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
        Manage multi-tenant organizations. Each tenant provides isolated namespaces for agents, policies,
        and audit data with independent usage tracking and member management.
      </p>

      <Callout type="info" title="Authentication required">
        All Tenants endpoints require a valid API key with the <code style={{ color: "var(--blue)" }}>tenants:read</code> or <code style={{ color: "var(--blue)" }}>tenants:write</code> scope.
      </Callout>

      {/* POST /api/v1/tenants */}
      <section className="my-8">
        <h2 id="create-tenant" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Create Tenant</h2>
        <EndpointCard method="POST" path="/api/v1/tenants" description="Create a new tenant organization">
          <ParamTable title="Request Body" params={[
            { name: "name", type: "string", required: true, description: "Human-readable organization name" },
            { name: "slug", type: "string", required: true, description: "URL-safe unique identifier (lowercase, hyphens allowed)" },
            { name: "plan", type: "string", description: "Billing plan ID (default: \"free\")" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the created <code style={{ color: "var(--blue)" }}>Tenant</code> object with slug, plan details, and timestamps.
          </p>
        </EndpointCard>
      </section>

      {/* GET /api/v1/tenants */}
      <section className="my-8">
        <h2 id="list-tenants" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>List Tenants</h2>
        <EndpointCard method="GET" path="/api/v1/tenants" description="List all tenants accessible to the current API key">
          <ParamTable title="Query Parameters" params={[
            { name: "limit", type: "number", description: "Max results per page (default 20, max 100)" },
            { name: "offset", type: "number", description: "Number of results to skip (default 0)" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns a paginated array of <code style={{ color: "var(--blue)" }}>Tenant</code> objects.
          </p>
        </EndpointCard>
      </section>

      {/* GET /api/v1/tenants/:slug */}
      <section className="my-8">
        <h2 id="get-tenant" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Get Tenant</h2>
        <EndpointCard method="GET" path="/api/v1/tenants/:slug" description="Retrieve a tenant by its slug">
          <ParamTable title="Path Parameters" params={[
            { name: "slug", type: "string", required: true, description: "The tenant's unique slug" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the full <code style={{ color: "var(--blue)" }}>Tenant</code> object including plan, member count, and configuration.
          </p>
        </EndpointCard>
      </section>

      {/* PATCH /api/v1/tenants/:slug */}
      <section className="my-8">
        <h2 id="update-tenant" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Update Tenant</h2>
        <EndpointCard method="PATCH" path="/api/v1/tenants/:slug" description="Update a tenant's properties">
          <ParamTable title="Path Parameters" params={[
            { name: "slug", type: "string", required: true, description: "The tenant's unique slug" },
          ]} />
          <ParamTable title="Request Body" params={[
            { name: "name", type: "string", description: "Updated organization name" },
            { name: "plan", type: "string", description: "Updated billing plan ID" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the updated <code style={{ color: "var(--blue)" }}>Tenant</code> object.
          </p>
        </EndpointCard>
      </section>

      {/* DELETE /api/v1/tenants/:slug */}
      <section className="my-8">
        <h2 id="delete-tenant" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Delete Tenant</h2>
        <EndpointCard method="DELETE" path="/api/v1/tenants/:slug" description="Permanently delete a tenant and all its data">
          <ParamTable title="Path Parameters" params={[
            { name: "slug", type: "string", required: true, description: "The tenant's unique slug" },
          ]} />
          <Callout type="danger" title="Destructive action">
            Deleting a tenant permanently removes all associated agents, policies, audit data, SSO connections, and member associations. This action cannot be undone.
          </Callout>
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns <code style={{ color: "var(--blue)" }}>204 No Content</code> on success.
          </p>
        </EndpointCard>
      </section>

      {/* GET /api/v1/tenants/:slug/usage */}
      <section className="my-8">
        <h2 id="tenant-usage" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Get Tenant Usage</h2>
        <EndpointCard method="GET" path="/api/v1/tenants/:slug/usage" description="Get usage statistics for a tenant">
          <ParamTable title="Path Parameters" params={[
            { name: "slug", type: "string", required: true, description: "The tenant's unique slug" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            Returns current billing period usage:
          </p>
          <div className="rounded-lg p-4 font-mono text-sm" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--text-muted)" }}>{"{"}</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;agents&quot;</span>: <span style={{ color: "var(--teal)" }}>24</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;policies&quot;</span>: <span style={{ color: "var(--teal)" }}>12</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;evaluationsThisMonth&quot;</span>: <span style={{ color: "var(--teal)" }}>48230</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;auditEventsThisMonth&quot;</span>: <span style={{ color: "var(--teal)" }}>48230</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;members&quot;</span>: <span style={{ color: "var(--teal)" }}>8</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;plan&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;pro&quot;</span>,</div>
            <div className="ml-4"><span style={{ color: "var(--blue)" }}>&quot;billingPeriodEnd&quot;</span>: <span style={{ color: "var(--teal)" }}>&quot;2026-04-01T00:00:00Z&quot;</span></div>
            <div style={{ color: "var(--text-muted)" }}>{"}"}</div>
          </div>
        </EndpointCard>
      </section>

      {/* GET /api/v1/tenants/:slug/members */}
      <section className="my-8">
        <h2 id="list-members" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>List Tenant Members</h2>
        <EndpointCard method="GET" path="/api/v1/tenants/:slug/members" description="List all members of a tenant">
          <ParamTable title="Path Parameters" params={[
            { name: "slug", type: "string", required: true, description: "The tenant's unique slug" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns an array of member objects containing user ID, role, email, and join date.
          </p>
        </EndpointCard>
      </section>

      {/* POST /api/v1/tenants/:slug/members */}
      <section className="my-8">
        <h2 id="add-member" className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Add Tenant Member</h2>
        <EndpointCard method="POST" path="/api/v1/tenants/:slug/members" description="Add a user as a member of the tenant">
          <ParamTable title="Path Parameters" params={[
            { name: "slug", type: "string", required: true, description: "The tenant's unique slug" },
          ]} />
          <ParamTable title="Request Body" params={[
            { name: "userId", type: "string", required: true, description: "User ID to add as a member" },
            { name: "role", type: "string", required: true, description: "Member role: \"owner\", \"admin\", \"member\", or \"viewer\"" },
          ]} />
          <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>Response</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Returns the created membership object with user details and assigned role.
          </p>
        </EndpointCard>
      </section>
    </div>
  );
}
