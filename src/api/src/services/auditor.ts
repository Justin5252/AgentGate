import { eq, and, desc, lte } from "drizzle-orm";
import { schema } from "../db/index.js";
import { generateToken, hashToken } from "../lib/crypto.js";
import type { Database } from "../db/index.js";
import type {
  AuditorInvitation,
  CreateAuditorInvitationRequest,
  AuditorAccessLog,
  AuditorProfile,
} from "@agentgate/shared";

export class AuditorService {
  constructor(private db: Database) {}

  async createInvitation(
    tenantId: string,
    createdBy: string,
    req: CreateAuditorInvitationRequest,
  ): Promise<{ invitation: AuditorInvitation; token: string }> {
    const id = crypto.randomUUID();
    const rawToken = `aud_${generateToken(32)}`;
    const tokenH = hashToken(rawToken);
    const expiresInDays = req.expiresInDays ?? 30;
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    const [row] = await this.db
      .insert(schema.auditorInvitations)
      .values({
        id,
        tenantId,
        email: req.email,
        name: req.name,
        status: "pending",
        frameworkScopes: req.frameworkScopes,
        tokenHash: tokenH,
        tokenPrefix: rawToken.substring(0, 12),
        expiresAt,
        createdBy,
        createdAt: new Date(),
      })
      .returning();

    return {
      invitation: this.rowToInvitation(row),
      token: rawToken,
    };
  }

  async validateToken(
    token: string,
  ): Promise<{ valid: boolean; invitation?: AuditorInvitation }> {
    const tokenH = hashToken(token);
    const [row] = await this.db
      .select()
      .from(schema.auditorInvitations)
      .where(eq(schema.auditorInvitations.tokenHash, tokenH))
      .limit(1);

    if (!row) return { valid: false };
    if (row.status === "revoked") return { valid: false };
    if (new Date(row.expiresAt) < new Date()) {
      // Auto-expire
      if (row.status !== "expired") {
        await this.db
          .update(schema.auditorInvitations)
          .set({ status: "expired" })
          .where(eq(schema.auditorInvitations.id, row.id));
      }
      return { valid: false };
    }

    // Activate on first use
    if (row.status === "pending") {
      await this.db
        .update(schema.auditorInvitations)
        .set({ status: "active", lastAccessedAt: new Date() })
        .where(eq(schema.auditorInvitations.id, row.id));
      row.status = "active";
    } else {
      // Update lastAccessedAt fire-and-forget
      this.db
        .update(schema.auditorInvitations)
        .set({ lastAccessedAt: new Date() })
        .where(eq(schema.auditorInvitations.id, row.id))
        .then(() => {})
        .catch(() => {});
    }

    return { valid: true, invitation: this.rowToInvitation(row) };
  }

  async listInvitations(tenantId: string, status?: string): Promise<AuditorInvitation[]> {
    let query = this.db
      .select()
      .from(schema.auditorInvitations)
      .where(eq(schema.auditorInvitations.tenantId, tenantId))
      .orderBy(desc(schema.auditorInvitations.createdAt));

    if (status) {
      query = this.db
        .select()
        .from(schema.auditorInvitations)
        .where(
          and(
            eq(schema.auditorInvitations.tenantId, tenantId),
            eq(schema.auditorInvitations.status, status as any),
          ),
        )
        .orderBy(desc(schema.auditorInvitations.createdAt));
    }

    const rows = await query;
    return rows.map((r) => this.rowToInvitation(r));
  }

  async getInvitation(id: string): Promise<AuditorInvitation | null> {
    const [row] = await this.db
      .select()
      .from(schema.auditorInvitations)
      .where(eq(schema.auditorInvitations.id, id))
      .limit(1);
    return row ? this.rowToInvitation(row) : null;
  }

  async revokeInvitation(id: string): Promise<boolean> {
    const result = await this.db
      .update(schema.auditorInvitations)
      .set({ status: "revoked", revokedAt: new Date() })
      .where(eq(schema.auditorInvitations.id, id))
      .returning();
    return result.length > 0;
  }

  async logAccess(
    invitationId: string,
    tenantId: string,
    resource: string,
    action: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.db.insert(schema.auditorAccessLogs).values({
      id: crypto.randomUUID(),
      invitationId,
      tenantId,
      resource,
      action,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });
  }

  async getAccessLogs(
    opts: { invitationId?: string; tenantId?: string; limit?: number; offset?: number } = {},
  ): Promise<AuditorAccessLog[]> {
    const limit = opts.limit ?? 50;
    const offset = opts.offset ?? 0;

    let query;
    if (opts.invitationId) {
      query = this.db
        .select()
        .from(schema.auditorAccessLogs)
        .where(eq(schema.auditorAccessLogs.invitationId, opts.invitationId))
        .orderBy(desc(schema.auditorAccessLogs.timestamp))
        .limit(limit)
        .offset(offset);
    } else if (opts.tenantId) {
      query = this.db
        .select()
        .from(schema.auditorAccessLogs)
        .where(eq(schema.auditorAccessLogs.tenantId, opts.tenantId))
        .orderBy(desc(schema.auditorAccessLogs.timestamp))
        .limit(limit)
        .offset(offset);
    } else {
      query = this.db
        .select()
        .from(schema.auditorAccessLogs)
        .orderBy(desc(schema.auditorAccessLogs.timestamp))
        .limit(limit)
        .offset(offset);
    }

    const rows = await query;
    return rows.map((r) => this.rowToAccessLog(r));
  }

  checkFrameworkScope(invitation: AuditorInvitation, frameworkId: string): boolean {
    return invitation.frameworkScopes.includes(frameworkId) || invitation.frameworkScopes.includes("*");
  }

  async getProfile(invitation: AuditorInvitation): Promise<AuditorProfile> {
    const [tenant] = await this.db
      .select()
      .from(schema.tenants)
      .where(eq(schema.tenants.id, invitation.tenantId))
      .limit(1);

    return {
      id: invitation.id,
      email: invitation.email,
      name: invitation.name,
      tenantName: tenant?.name ?? "Unknown",
      frameworkScopes: invitation.frameworkScopes,
      expiresAt: invitation.expiresAt,
    };
  }

  private rowToInvitation(row: typeof schema.auditorInvitations.$inferSelect): AuditorInvitation {
    return {
      id: row.id,
      tenantId: row.tenantId,
      email: row.email,
      name: row.name,
      status: row.status,
      frameworkScopes: (row.frameworkScopes ?? []) as string[],
      tokenPrefix: row.tokenPrefix,
      expiresAt: row.expiresAt.toISOString(),
      lastAccessedAt: row.lastAccessedAt?.toISOString() ?? null,
      createdBy: row.createdBy,
      createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
      revokedAt: row.revokedAt?.toISOString() ?? null,
    };
  }

  private rowToAccessLog(row: typeof schema.auditorAccessLogs.$inferSelect): AuditorAccessLog {
    return {
      id: row.id,
      invitationId: row.invitationId,
      tenantId: row.tenantId,
      resource: row.resource,
      action: row.action,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      timestamp: row.timestamp?.toISOString() ?? new Date().toISOString(),
    };
  }
}
