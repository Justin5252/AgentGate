import { eq, and, desc, isNull, lte } from "drizzle-orm";
import { schema } from "../db/index.js";
import { encryptSecret, decryptSecret, signSessionToken, verifySessionToken, generateToken, hashToken } from "../lib/crypto.js";
import type { Database } from "../db/index.js";
import type {
  SSOConnection,
  CreateSSOConnectionRequest,
  UpdateSSOConnectionRequest,
  SSOSession,
  SCIMToken,
  SCIMGroup,
  SPMetadata,
  SSOTestResult,
  SSOAuditEntry,
  SSOProvider,
  SSOEventType,
  UserRole,
  ProvisionMethod,
} from "@agentgate/shared";

export class SSOService {
  constructor(private db: Database) {}

  // ─── Connection CRUD ─────────────────────────────────────────────

  async createConnection(tenantId: string, req: CreateSSOConnectionRequest): Promise<SSOConnection> {
    const id = crypto.randomUUID();
    const now = new Date();

    let oidcClientSecretEncrypted: string | null = null;
    if (req.oidcClientSecret) {
      try {
        oidcClientSecretEncrypted = encryptSecret(req.oidcClientSecret);
      } catch {
        // In dev without encryption key, store plaintext prefixed
        oidcClientSecretEncrypted = `plain:${req.oidcClientSecret}`;
      }
    }

    const [row] = await this.db
      .insert(schema.ssoConnections)
      .values({
        id,
        tenantId,
        provider: req.provider,
        protocol: req.protocol,
        enabled: false,
        enforced: false,
        defaultRole: req.defaultRole ?? "member",
        jitProvisioning: req.jitProvisioning ?? true,
        attributeMapping: req.attributeMapping ?? {},
        samlEntityId: req.samlEntityId ?? null,
        samlSsoUrl: req.samlSsoUrl ?? null,
        samlCertificate: req.samlCertificate ?? null,
        samlMetadataUrl: req.samlMetadataUrl ?? null,
        oidcDiscoveryUrl: req.oidcDiscoveryUrl ?? null,
        oidcClientId: req.oidcClientId ?? null,
        oidcClientSecretEncrypted,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return this.rowToConnection(row);
  }

  async getConnection(id: string): Promise<SSOConnection | null> {
    const [row] = await this.db
      .select()
      .from(schema.ssoConnections)
      .where(eq(schema.ssoConnections.id, id))
      .limit(1);
    return row ? this.rowToConnection(row) : null;
  }

  async listConnections(tenantId: string): Promise<SSOConnection[]> {
    const rows = await this.db
      .select()
      .from(schema.ssoConnections)
      .where(eq(schema.ssoConnections.tenantId, tenantId))
      .orderBy(desc(schema.ssoConnections.createdAt));
    return rows.map((r) => this.rowToConnection(r));
  }

  async getConnectionByTenantSlug(tenantSlug: string): Promise<{ connection: SSOConnection; tenantId: string } | null> {
    const [tenant] = await this.db
      .select()
      .from(schema.tenants)
      .where(eq(schema.tenants.slug, tenantSlug))
      .limit(1);
    if (!tenant) return null;

    const [row] = await this.db
      .select()
      .from(schema.ssoConnections)
      .where(and(eq(schema.ssoConnections.tenantId, tenant.id), eq(schema.ssoConnections.enabled, true)))
      .limit(1);
    if (!row) return null;

    return { connection: this.rowToConnection(row), tenantId: tenant.id };
  }

  async updateConnection(id: string, req: UpdateSSOConnectionRequest): Promise<SSOConnection | null> {
    const existing = await this.getConnection(id);
    if (!existing) return null;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (req.enabled !== undefined) updates.enabled = req.enabled;
    if (req.enforced !== undefined) updates.enforced = req.enforced;
    if (req.defaultRole !== undefined) updates.defaultRole = req.defaultRole;
    if (req.jitProvisioning !== undefined) updates.jitProvisioning = req.jitProvisioning;
    if (req.attributeMapping !== undefined) updates.attributeMapping = req.attributeMapping;
    if (req.samlEntityId !== undefined) updates.samlEntityId = req.samlEntityId;
    if (req.samlSsoUrl !== undefined) updates.samlSsoUrl = req.samlSsoUrl;
    if (req.samlCertificate !== undefined) updates.samlCertificate = req.samlCertificate;
    if (req.samlMetadataUrl !== undefined) updates.samlMetadataUrl = req.samlMetadataUrl;
    if (req.oidcDiscoveryUrl !== undefined) updates.oidcDiscoveryUrl = req.oidcDiscoveryUrl;
    if (req.oidcClientId !== undefined) updates.oidcClientId = req.oidcClientId;
    if (req.oidcClientSecret !== undefined) {
      try {
        updates.oidcClientSecretEncrypted = encryptSecret(req.oidcClientSecret);
      } catch {
        updates.oidcClientSecretEncrypted = `plain:${req.oidcClientSecret}`;
      }
    }

    const [row] = await this.db
      .update(schema.ssoConnections)
      .set(updates)
      .where(eq(schema.ssoConnections.id, id))
      .returning();

    return this.rowToConnection(row);
  }

  async deleteConnection(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.ssoConnections)
      .where(eq(schema.ssoConnections.id, id))
      .returning();
    return result.length > 0;
  }

  async testConnection(id: string): Promise<SSOTestResult> {
    const conn = await this.getConnection(id);
    if (!conn) return { success: false, message: "Connection not found" };

    if (conn.protocol === "saml") {
      if (!conn.samlSsoUrl || !conn.samlCertificate) {
        return { success: false, message: "SAML SSO URL and certificate are required" };
      }
      return { success: true, message: "SAML configuration is valid", details: { ssoUrl: conn.samlSsoUrl, entityId: conn.samlEntityId } };
    }

    if (conn.protocol === "oidc") {
      if (!conn.oidcDiscoveryUrl || !conn.oidcClientId) {
        return { success: false, message: "OIDC discovery URL and client ID are required" };
      }
      // Attempt to fetch discovery document
      try {
        const res = await fetch(conn.oidcDiscoveryUrl);
        if (!res.ok) return { success: false, message: `Discovery endpoint returned ${res.status}` };
        const doc = await res.json() as Record<string, unknown>;
        return {
          success: true,
          message: "OIDC discovery endpoint reachable",
          details: {
            issuer: doc.issuer,
            authorizationEndpoint: doc.authorization_endpoint,
            tokenEndpoint: doc.token_endpoint,
          },
        };
      } catch (err) {
        return { success: false, message: `Failed to reach OIDC discovery endpoint: ${(err as Error).message}` };
      }
    }

    return { success: false, message: "Unknown protocol" };
  }

  // ─── SP Metadata ─────────────────────────────────────────────────

  getSPMetadata(tenantSlug: string): SPMetadata {
    const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3100";
    return {
      entityId: `${baseUrl}/api/v1/auth/saml/${tenantSlug}/metadata`,
      acsUrl: `${baseUrl}/api/v1/auth/saml/${tenantSlug}/acs`,
      metadataUrl: `${baseUrl}/api/v1/auth/saml/${tenantSlug}/metadata`,
    };
  }

  generateSPMetadataXml(tenantSlug: string): string {
    const meta = this.getSPMetadata(tenantSlug);
    return `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
  entityID="${meta.entityId}">
  <md:SPSSODescriptor
    AuthnRequestsSigned="false"
    WantAssertionsSigned="true"
    protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
    <md:AssertionConsumerService
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="${meta.acsUrl}"
      index="0"
      isDefault="true"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;
  }

  // ─── SAML Flow ───────────────────────────────────────────────────

  buildSamlLoginUrl(connection: SSOConnection, tenantSlug: string): string {
    const meta = this.getSPMetadata(tenantSlug);
    const requestId = `_${crypto.randomUUID()}`;
    const issueInstant = new Date().toISOString();
    // SP-initiated: redirect to IdP SSO URL with SAMLRequest
    const authnRequest = `<samlp:AuthnRequest
      xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
      xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
      ID="${requestId}"
      Version="2.0"
      IssueInstant="${issueInstant}"
      Destination="${connection.samlSsoUrl}"
      AssertionConsumerServiceURL="${meta.acsUrl}"
      ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
      <saml:Issuer>${meta.entityId}</saml:Issuer>
    </samlp:AuthnRequest>`;

    const encoded = Buffer.from(authnRequest).toString("base64");
    const separator = connection.samlSsoUrl!.includes("?") ? "&" : "?";
    return `${connection.samlSsoUrl}${separator}SAMLRequest=${encodeURIComponent(encoded)}`;
  }

  // ─── OIDC Flow ───────────────────────────────────────────────────

  async buildOidcLoginUrl(connection: SSOConnection, tenantSlug: string, state: string, codeVerifier: string): Promise<string> {
    const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3100";
    const redirectUri = `${baseUrl}/api/v1/auth/oidc/${tenantSlug}/callback`;

    // Generate code challenge from verifier (S256)
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    const codeChallenge = Buffer.from(digest)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Try to use discovery URL, or fall back to manual construction
    let authorizationEndpoint: string;
    if (connection.oidcDiscoveryUrl) {
      try {
        const res = await fetch(connection.oidcDiscoveryUrl);
        const doc = await res.json() as { authorization_endpoint: string };
        authorizationEndpoint = doc.authorization_endpoint;
      } catch {
        authorizationEndpoint = connection.oidcDiscoveryUrl.replace("/.well-known/openid-configuration", "/authorize");
      }
    } else {
      throw new Error("OIDC discovery URL is required");
    }

    const params = new URLSearchParams({
      response_type: "code",
      client_id: connection.oidcClientId!,
      redirect_uri: redirectUri,
      scope: "openid email profile",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return `${authorizationEndpoint}?${params.toString()}`;
  }

  // ─── Sessions ────────────────────────────────────────────────────

  async createSession(tenantId: string, userId: string, provider: SSOProvider, ipAddress?: string, userAgent?: string): Promise<{ token: string; session: SSOSession }> {
    const sessionId = crypto.randomUUID();
    const ttl = parseInt(process.env.SSO_SESSION_TTL ?? "28800", 10);
    const expiresAt = new Date(Date.now() + ttl * 1000);

    const token = signSessionToken({ sessionId, userId, tenantId, provider });
    const tokenH = hashToken(token);

    const [row] = await this.db
      .insert(schema.ssoSessions)
      .values({
        id: sessionId,
        tenantId,
        userId,
        tokenHash: tokenH,
        provider,
        expiresAt,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
      })
      .returning();

    return {
      token,
      session: this.rowToSession(row),
    };
  }

  async validateSession(token: string): Promise<{ valid: boolean; session?: SSOSession; userId?: string; tenantId?: string }> {
    try {
      const payload = verifySessionToken(token);
      const tokenH = hashToken(token);

      const [row] = await this.db
        .select()
        .from(schema.ssoSessions)
        .where(eq(schema.ssoSessions.tokenHash, tokenH))
        .limit(1);

      if (!row) return { valid: false };
      if (row.revokedAt) return { valid: false };
      if (new Date(row.expiresAt) < new Date()) return { valid: false };

      return {
        valid: true,
        session: this.rowToSession(row),
        userId: payload.userId,
        tenantId: payload.tenantId,
      };
    } catch {
      return { valid: false };
    }
  }

  async revokeSession(sessionId: string): Promise<boolean> {
    const result = await this.db
      .update(schema.ssoSessions)
      .set({ revokedAt: new Date() })
      .where(eq(schema.ssoSessions.id, sessionId))
      .returning();
    return result.length > 0;
  }

  async listSessions(tenantId: string): Promise<SSOSession[]> {
    const rows = await this.db
      .select()
      .from(schema.ssoSessions)
      .where(and(eq(schema.ssoSessions.tenantId, tenantId), isNull(schema.ssoSessions.revokedAt)))
      .orderBy(desc(schema.ssoSessions.createdAt));
    return rows.map((r) => this.rowToSession(r));
  }

  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.db
      .delete(schema.ssoSessions)
      .where(lte(schema.ssoSessions.expiresAt, new Date()))
      .returning();
    return result.length;
  }

  // ─── JIT Provisioning ───────────────────────────────────────────

  async jitProvisionUser(
    tenantId: string,
    email: string,
    name: string,
    externalId: string | null,
    role: UserRole,
    method: ProvisionMethod = "jit",
  ): Promise<string> {
    // Try to find existing user by email
    const [existing] = await this.db
      .select()
      .from(schema.tenantUsers)
      .where(and(eq(schema.tenantUsers.tenantId, tenantId), eq(schema.tenantUsers.email, email)))
      .limit(1);

    if (existing) {
      // Update existing user
      await this.db
        .update(schema.tenantUsers)
        .set({
          name,
          externalId: externalId ?? existing.externalId,
          lastLoginAt: new Date(),
          deactivatedAt: null, // Reactivate if was deactivated
        })
        .where(eq(schema.tenantUsers.id, existing.id));
      return existing.id;
    }

    // Create new user
    const userId = crypto.randomUUID();
    await this.db
      .insert(schema.tenantUsers)
      .values({
        id: userId,
        tenantId,
        email,
        name,
        role,
        externalId,
        provisionedVia: method,
        createdAt: new Date(),
      });
    return userId;
  }

  // ─── SCIM Tokens ────────────────────────────────────────────────

  async generateScimToken(tenantId: string, connectionId: string): Promise<{ token: string; record: SCIMToken }> {
    const rawToken = `scim_${generateToken(32)}`;
    const tokenH = hashToken(rawToken);
    const id = crypto.randomUUID();

    const [row] = await this.db
      .insert(schema.scimTokens)
      .values({
        id,
        tenantId,
        connectionId,
        tokenHash: tokenH,
        tokenPrefix: rawToken.substring(0, 12),
        revoked: false,
      })
      .returning();

    return {
      token: rawToken,
      record: this.rowToScimToken(row),
    };
  }

  async validateScimToken(token: string): Promise<{ valid: boolean; tenantId?: string; connectionId?: string }> {
    const tokenH = hashToken(token);
    const [row] = await this.db
      .select()
      .from(schema.scimTokens)
      .where(eq(schema.scimTokens.tokenHash, tokenH))
      .limit(1);

    if (!row || row.revoked) return { valid: false };

    // Update last used
    this.db
      .update(schema.scimTokens)
      .set({ lastUsedAt: new Date() })
      .where(eq(schema.scimTokens.id, row.id))
      .then(() => {})
      .catch(() => {});

    return { valid: true, tenantId: row.tenantId, connectionId: row.connectionId };
  }

  async revokeScimToken(id: string): Promise<boolean> {
    const result = await this.db
      .update(schema.scimTokens)
      .set({ revoked: true })
      .where(eq(schema.scimTokens.id, id))
      .returning();
    return result.length > 0;
  }

  async listScimTokens(tenantId: string): Promise<SCIMToken[]> {
    const rows = await this.db
      .select()
      .from(schema.scimTokens)
      .where(eq(schema.scimTokens.tenantId, tenantId))
      .orderBy(desc(schema.scimTokens.createdAt));
    return rows.map((r) => this.rowToScimToken(r));
  }

  // ─── SCIM Groups ────────────────────────────────────────────────

  async upsertScimGroup(tenantId: string, connectionId: string, externalGroupId: string, displayName: string, mappedRole?: UserRole): Promise<SCIMGroup> {
    const [existing] = await this.db
      .select()
      .from(schema.scimGroups)
      .where(and(
        eq(schema.scimGroups.tenantId, tenantId),
        eq(schema.scimGroups.connectionId, connectionId),
        eq(schema.scimGroups.externalGroupId, externalGroupId),
      ))
      .limit(1);

    if (existing) {
      const [updated] = await this.db
        .update(schema.scimGroups)
        .set({ displayName, updatedAt: new Date(), ...(mappedRole ? { mappedRole } : {}) })
        .where(eq(schema.scimGroups.id, existing.id))
        .returning();
      return this.rowToScimGroup(updated);
    }

    const id = crypto.randomUUID();
    const [row] = await this.db
      .insert(schema.scimGroups)
      .values({
        id,
        tenantId,
        connectionId,
        externalGroupId,
        displayName,
        mappedRole: mappedRole ?? "member",
      })
      .returning();
    return this.rowToScimGroup(row);
  }

  async getScimGroup(id: string): Promise<SCIMGroup | null> {
    const [row] = await this.db
      .select()
      .from(schema.scimGroups)
      .where(eq(schema.scimGroups.id, id))
      .limit(1);
    return row ? this.rowToScimGroup(row) : null;
  }

  async listScimGroups(tenantId: string): Promise<SCIMGroup[]> {
    const rows = await this.db
      .select()
      .from(schema.scimGroups)
      .where(eq(schema.scimGroups.tenantId, tenantId))
      .orderBy(desc(schema.scimGroups.createdAt));
    return rows.map((r) => this.rowToScimGroup(r));
  }

  async deleteScimGroup(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.scimGroups)
      .where(eq(schema.scimGroups.id, id))
      .returning();
    return result.length > 0;
  }

  // ─── Enforcement ─────────────────────────────────────────────────

  async isEnforced(tenantId: string): Promise<boolean> {
    const [conn] = await this.db
      .select()
      .from(schema.ssoConnections)
      .where(and(eq(schema.ssoConnections.tenantId, tenantId), eq(schema.ssoConnections.enforced, true)))
      .limit(1);
    return !!conn;
  }

  async isEnterprisePlan(tenantId: string): Promise<boolean> {
    const [tenant] = await this.db
      .select()
      .from(schema.tenants)
      .where(eq(schema.tenants.id, tenantId))
      .limit(1);
    return tenant?.plan === "enterprise";
  }

  // ─── Audit ───────────────────────────────────────────────────────

  async logAudit(tenantId: string, event: SSOEventType, opts?: {
    userId?: string;
    provider?: SSOProvider;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<void> {
    await this.db.insert(schema.ssoAuditLogs).values({
      id: crypto.randomUUID(),
      tenantId,
      userId: opts?.userId ?? null,
      event,
      provider: opts?.provider ?? null,
      details: opts?.details ?? {},
      ipAddress: opts?.ipAddress ?? null,
    });
  }

  async queryAuditLog(tenantId: string, limit: number = 50, offset: number = 0): Promise<SSOAuditEntry[]> {
    const rows = await this.db
      .select()
      .from(schema.ssoAuditLogs)
      .where(eq(schema.ssoAuditLogs.tenantId, tenantId))
      .orderBy(desc(schema.ssoAuditLogs.createdAt))
      .limit(limit)
      .offset(offset);
    return rows.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      userId: r.userId,
      event: r.event,
      provider: r.provider,
      details: (r.details ?? {}) as Record<string, unknown>,
      ipAddress: r.ipAddress,
      createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(),
    }));
  }

  // ─── Row mappers ─────────────────────────────────────────────────

  private rowToConnection(row: typeof schema.ssoConnections.$inferSelect): SSOConnection {
    return {
      id: row.id,
      tenantId: row.tenantId,
      provider: row.provider,
      protocol: row.protocol,
      enabled: row.enabled,
      enforced: row.enforced,
      defaultRole: row.defaultRole,
      jitProvisioning: row.jitProvisioning,
      attributeMapping: (row.attributeMapping ?? {}) as Record<string, string>,
      samlEntityId: row.samlEntityId,
      samlSsoUrl: row.samlSsoUrl,
      samlCertificate: row.samlCertificate,
      samlMetadataUrl: row.samlMetadataUrl,
      oidcDiscoveryUrl: row.oidcDiscoveryUrl,
      oidcClientId: row.oidcClientId,
      oidcClientSecretEncrypted: null, // Never expose encrypted secret
      createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  private rowToSession(row: typeof schema.ssoSessions.$inferSelect): SSOSession {
    return {
      id: row.id,
      tenantId: row.tenantId,
      userId: row.userId,
      provider: row.provider,
      expiresAt: row.expiresAt.toISOString(),
      revokedAt: row.revokedAt?.toISOString() ?? null,
      createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
    };
  }

  private rowToScimToken(row: typeof schema.scimTokens.$inferSelect): SCIMToken {
    return {
      id: row.id,
      tenantId: row.tenantId,
      connectionId: row.connectionId,
      tokenPrefix: row.tokenPrefix,
      revoked: row.revoked,
      createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
      lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
    };
  }

  private rowToScimGroup(row: typeof schema.scimGroups.$inferSelect): SCIMGroup {
    return {
      id: row.id,
      tenantId: row.tenantId,
      connectionId: row.connectionId,
      externalGroupId: row.externalGroupId,
      displayName: row.displayName,
      mappedRole: row.mappedRole,
      createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}
