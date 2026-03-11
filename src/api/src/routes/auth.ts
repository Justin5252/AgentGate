import type { FastifyInstance } from "fastify";
import { generateToken, hashToken } from "../lib/crypto.js";
import { ErrorCodes } from "@agentgate/shared";

export async function authRoutes(server: FastifyInstance) {
  // ─── SAML ────────────────────────────────────────────────────────

  // GET /saml/:tenantSlug/login — Redirect to IdP
  server.get("/saml/:tenantSlug/login", async (request, reply) => {
    const { tenantSlug } = request.params as { tenantSlug: string };

    const result = await server.ssoService.getConnectionByTenantSlug(tenantSlug);
    if (!result || result.connection.protocol !== "saml") {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.SSO_NOT_CONFIGURED, message: "SAML SSO not configured for this organization" },
        meta: { requestId: crypto.randomUUID(), durationMs: 0 },
      });
    }

    const loginUrl = server.ssoService.buildSamlLoginUrl(result.connection, tenantSlug);
    return reply.redirect(loginUrl);
  });

  // POST /saml/:tenantSlug/acs — SAML Assertion Consumer Service
  server.post("/saml/:tenantSlug/acs", async (request, reply) => {
    const { tenantSlug } = request.params as { tenantSlug: string };

    const result = await server.ssoService.getConnectionByTenantSlug(tenantSlug);
    if (!result || result.connection.protocol !== "saml") {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.SSO_NOT_CONFIGURED, message: "SAML SSO not configured" },
        meta: { requestId: crypto.randomUUID(), durationMs: 0 },
      });
    }

    const { connection, tenantId } = result;
    const body = request.body as Record<string, string>;
    const samlResponse = body.SAMLResponse;

    if (!samlResponse) {
      await server.ssoService.logAudit(tenantId, "sso_login_failure", {
        provider: connection.provider,
        details: { reason: "Missing SAMLResponse" },
        ipAddress: request.ip,
      });
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.SSO_INVALID_RESPONSE, message: "Missing SAMLResponse" },
        meta: { requestId: crypto.randomUUID(), durationMs: 0 },
      });
    }

    try {
      // Decode the SAML response to extract user attributes
      const decoded = Buffer.from(samlResponse, "base64").toString("utf8");

      // Extract email and name from SAML assertion
      const emailMatch = decoded.match(/emailAddress[^>]*>([^<]+)</);
      const nameMatch = decoded.match(/displayName[^>]*>([^<]+)</) || decoded.match(/givenName[^>]*>([^<]+)</);
      const externalIdMatch = decoded.match(/NameID[^>]*>([^<]+)</);

      const email = emailMatch?.[1];
      const name = nameMatch?.[1] ?? email?.split("@")[0] ?? "SSO User";
      const externalId = externalIdMatch?.[1] ?? email;

      if (!email) {
        await server.ssoService.logAudit(tenantId, "sso_login_failure", {
          provider: connection.provider,
          details: { reason: "Could not extract email from SAML assertion" },
          ipAddress: request.ip,
        });
        return reply.status(400).send({
          data: null,
          error: { code: ErrorCodes.SSO_INVALID_RESPONSE, message: "Could not extract email from SAML response" },
          meta: { requestId: crypto.randomUUID(), durationMs: 0 },
        });
      }

      // JIT provisioning
      let userId: string;
      if (connection.jitProvisioning) {
        userId = await server.ssoService.jitProvisionUser(
          tenantId, email, name, externalId ?? null, connection.defaultRole, "jit",
        );
      } else {
        // Look up existing user
        const { eq, and } = await import("drizzle-orm");
        const { schema } = await import("../db/index.js");
        const [user] = await server.db
          .select()
          .from(schema.tenantUsers)
          .where(and(eq(schema.tenantUsers.tenantId, tenantId), eq(schema.tenantUsers.email, email)))
          .limit(1);
        if (!user) {
          return reply.status(403).send({
            data: null,
            error: { code: ErrorCodes.USER_NOT_FOUND, message: "User not found. Contact your administrator." },
            meta: { requestId: crypto.randomUUID(), durationMs: 0 },
          });
        }
        userId = user.id;
      }

      // Create session
      const { token } = await server.ssoService.createSession(
        tenantId, userId, connection.provider, request.ip, request.headers["user-agent"],
      );

      await server.ssoService.logAudit(tenantId, "sso_login_success", {
        userId,
        provider: connection.provider,
        details: { email, method: "saml" },
        ipAddress: request.ip,
      });

      // Redirect to dashboard with session token
      const dashboardUrl = process.env.DASHBOARD_URL ?? "http://localhost:3200";
      return reply.redirect(`${dashboardUrl}/auth/callback?token=${encodeURIComponent(token)}`);
    } catch (err) {
      server.log.error(err, "SAML ACS processing error");
      await server.ssoService.logAudit(tenantId, "sso_login_failure", {
        provider: connection.provider,
        details: { reason: (err as Error).message },
        ipAddress: request.ip,
      });
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.SSO_INVALID_RESPONSE, message: "Failed to process SAML response" },
        meta: { requestId: crypto.randomUUID(), durationMs: 0 },
      });
    }
  });

  // GET /saml/:tenantSlug/metadata — SP metadata XML
  server.get("/saml/:tenantSlug/metadata", async (request, reply) => {
    const { tenantSlug } = request.params as { tenantSlug: string };
    const xml = server.ssoService.generateSPMetadataXml(tenantSlug);
    return reply.type("application/xml").send(xml);
  });

  // ─── OIDC ────────────────────────────────────────────────────────

  // GET /oidc/:tenantSlug/login — Redirect to OIDC provider
  server.get("/oidc/:tenantSlug/login", async (request, reply) => {
    const { tenantSlug } = request.params as { tenantSlug: string };

    const result = await server.ssoService.getConnectionByTenantSlug(tenantSlug);
    if (!result || result.connection.protocol !== "oidc") {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.SSO_NOT_CONFIGURED, message: "OIDC SSO not configured for this organization" },
        meta: { requestId: crypto.randomUUID(), durationMs: 0 },
      });
    }

    const state = generateToken(16);
    const codeVerifier = generateToken(32);

    // Store state and code verifier in encrypted cookies
    reply.setCookie("sso_state", state, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });
    reply.setCookie("sso_verifier", codeVerifier, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
    });

    try {
      const loginUrl = await server.ssoService.buildOidcLoginUrl(result.connection, tenantSlug, state, codeVerifier);
      return reply.redirect(loginUrl);
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.SSO_INVALID_RESPONSE, message: "Failed to build OIDC login URL" },
        meta: { requestId: crypto.randomUUID(), durationMs: 0 },
      });
    }
  });

  // GET /oidc/:tenantSlug/callback — OIDC callback
  server.get("/oidc/:tenantSlug/callback", async (request, reply) => {
    const { tenantSlug } = request.params as { tenantSlug: string };
    const query = request.query as { code?: string; state?: string; error?: string };

    if (query.error) {
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.SSO_INVALID_RESPONSE, message: `OIDC error: ${query.error}` },
        meta: { requestId: crypto.randomUUID(), durationMs: 0 },
      });
    }

    const result = await server.ssoService.getConnectionByTenantSlug(tenantSlug);
    if (!result || result.connection.protocol !== "oidc") {
      return reply.status(404).send({
        data: null,
        error: { code: ErrorCodes.SSO_NOT_CONFIGURED, message: "OIDC SSO not configured" },
        meta: { requestId: crypto.randomUUID(), durationMs: 0 },
      });
    }

    const { connection, tenantId } = result;

    // Validate state
    const cookies = request.cookies as Record<string, string>;
    const savedState = cookies?.sso_state;
    const codeVerifier = cookies?.sso_verifier;

    if (!savedState || savedState !== query.state) {
      await server.ssoService.logAudit(tenantId, "sso_login_failure", {
        provider: connection.provider,
        details: { reason: "State mismatch" },
        ipAddress: request.ip,
      });
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.SSO_INVALID_RESPONSE, message: "Invalid state parameter" },
        meta: { requestId: crypto.randomUUID(), durationMs: 0 },
      });
    }

    if (!query.code) {
      return reply.status(400).send({
        data: null,
        error: { code: ErrorCodes.SSO_INVALID_RESPONSE, message: "Missing authorization code" },
        meta: { requestId: crypto.randomUUID(), durationMs: 0 },
      });
    }

    try {
      // Discover token endpoint
      let tokenEndpoint: string;
      let userinfoEndpoint: string;
      if (connection.oidcDiscoveryUrl) {
        const res = await fetch(connection.oidcDiscoveryUrl);
        const doc = await res.json() as { token_endpoint: string; userinfo_endpoint: string };
        tokenEndpoint = doc.token_endpoint;
        userinfoEndpoint = doc.userinfo_endpoint;
      } else {
        throw new Error("Discovery URL required");
      }

      // Exchange code for tokens
      const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3100";
      const redirectUri = `${baseUrl}/api/v1/auth/oidc/${tenantSlug}/callback`;

      const tokenRes = await fetch(tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: query.code,
          redirect_uri: redirectUri,
          client_id: connection.oidcClientId!,
          code_verifier: codeVerifier ?? "",
        }).toString(),
      });

      if (!tokenRes.ok) {
        const errBody = await tokenRes.text();
        throw new Error(`Token exchange failed: ${tokenRes.status} ${errBody}`);
      }

      const tokens = await tokenRes.json() as { access_token: string; id_token?: string };

      // Fetch userinfo
      const userInfoRes = await fetch(userinfoEndpoint, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!userInfoRes.ok) throw new Error("Failed to fetch userinfo");
      const userInfo = await userInfoRes.json() as { email: string; name?: string; sub?: string };

      const email = userInfo.email;
      const name = userInfo.name ?? email.split("@")[0];
      const externalId = userInfo.sub ?? email;

      if (!email) {
        throw new Error("Email not returned from userinfo endpoint");
      }

      // JIT provisioning
      let userId: string;
      if (connection.jitProvisioning) {
        userId = await server.ssoService.jitProvisionUser(
          tenantId, email, name, externalId, connection.defaultRole, "jit",
        );
      } else {
        const { eq, and } = await import("drizzle-orm");
        const { schema } = await import("../db/index.js");
        const [user] = await server.db
          .select()
          .from(schema.tenantUsers)
          .where(and(eq(schema.tenantUsers.tenantId, tenantId), eq(schema.tenantUsers.email, email)))
          .limit(1);
        if (!user) {
          return reply.status(403).send({
            data: null,
            error: { code: ErrorCodes.USER_NOT_FOUND, message: "User not found. Contact your administrator." },
            meta: { requestId: crypto.randomUUID(), durationMs: 0 },
          });
        }
        userId = user.id;
      }

      // Create session
      const { token } = await server.ssoService.createSession(
        tenantId, userId, connection.provider, request.ip, request.headers["user-agent"],
      );

      await server.ssoService.logAudit(tenantId, "sso_login_success", {
        userId,
        provider: connection.provider,
        details: { email, method: "oidc" },
        ipAddress: request.ip,
      });

      // Clear SSO cookies
      reply.clearCookie("sso_state", { path: "/" });
      reply.clearCookie("sso_verifier", { path: "/" });

      const dashboardUrl = process.env.DASHBOARD_URL ?? "http://localhost:3200";
      return reply.redirect(`${dashboardUrl}/auth/callback?token=${encodeURIComponent(token)}`);
    } catch (err) {
      server.log.error(err, "OIDC callback error");
      await server.ssoService.logAudit(tenantId, "sso_login_failure", {
        provider: connection.provider,
        details: { reason: (err as Error).message },
        ipAddress: request.ip,
      });
      return reply.status(500).send({
        data: null,
        error: { code: ErrorCodes.SSO_INVALID_RESPONSE, message: "OIDC authentication failed" },
        meta: { requestId: crypto.randomUUID(), durationMs: 0 },
      });
    }
  });

  // ─── Session Management ──────────────────────────────────────────

  // POST /session/refresh — Refresh session token
  server.post("/session/refresh", async (request, reply) => {
    const authHeader = request.headers.authorization;
    const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!token) {
      return reply.status(401).send({
        data: null,
        error: { code: ErrorCodes.TOKEN_INVALID, message: "Missing session token" },
        meta: { requestId: crypto.randomUUID(), durationMs: 0 },
      });
    }

    const validation = await server.ssoService.validateSession(token);
    if (!validation.valid || !validation.session) {
      return reply.status(401).send({
        data: null,
        error: { code: ErrorCodes.SESSION_EXPIRED, message: "Session invalid or expired" },
        meta: { requestId: crypto.randomUUID(), durationMs: 0 },
      });
    }

    // Revoke old session, create new one
    await server.ssoService.revokeSession(validation.session.id);
    const { token: newToken, session } = await server.ssoService.createSession(
      validation.session.tenantId,
      validation.session.userId,
      validation.session.provider,
      request.ip,
      request.headers["user-agent"],
    );

    return reply.send({
      data: { token: newToken, session },
      error: null,
      meta: { requestId: crypto.randomUUID(), durationMs: 0 },
    });
  });

  // POST /session/logout — Revoke session
  server.post("/session/logout", async (request, reply) => {
    const authHeader = request.headers.authorization;
    const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!token) {
      return reply.status(401).send({
        data: null,
        error: { code: ErrorCodes.TOKEN_INVALID, message: "Missing session token" },
        meta: { requestId: crypto.randomUUID(), durationMs: 0 },
      });
    }

    const validation = await server.ssoService.validateSession(token);
    if (validation.valid && validation.session) {
      await server.ssoService.revokeSession(validation.session.id);
      await server.ssoService.logAudit(validation.session.tenantId, "sso_logout", {
        userId: validation.session.userId,
        provider: validation.session.provider,
        ipAddress: request.ip,
      });
    }

    return reply.send({
      data: { loggedOut: true },
      error: null,
      meta: { requestId: crypto.randomUUID(), durationMs: 0 },
    });
  });
}
