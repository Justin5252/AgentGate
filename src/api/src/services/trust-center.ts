import { eq } from "drizzle-orm";
import type { Database } from "../db/index.js";
import {
  trustCenterConfigs,
  tenants,
  complianceFrameworks,
  complianceControls,
} from "../db/schema.js";
import type { TrustCenterPublicData, UpdateTrustCenterConfigRequest } from "@agentgate/shared";

export class TrustCenterService {
  constructor(private db: Database) {}

  async getConfig(tenantId: string) {
    const [config] = await this.db
      .select()
      .from(trustCenterConfigs)
      .where(eq(trustCenterConfigs.tenantId, tenantId))
      .limit(1);

    if (config) return this.formatConfig(config);

    // Create default config
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    const slug = tenant?.slug ?? tenantId;
    const id = crypto.randomUUID();
    await this.db.insert(trustCenterConfigs).values({
      id,
      tenantId,
      publicSlug: slug,
      enabled: false,
    });

    const [created] = await this.db
      .select()
      .from(trustCenterConfigs)
      .where(eq(trustCenterConfigs.id, id))
      .limit(1);

    return this.formatConfig(created);
  }

  async updateConfig(tenantId: string, update: UpdateTrustCenterConfigRequest) {
    const config = await this.getConfig(tenantId);

    // Validate inputs to prevent XSS/injection
    if (update.customLogo !== undefined && update.customLogo !== null) {
      if (!this.isValidHttpsUrl(update.customLogo)) {
        throw new Error("Custom logo must be a valid HTTPS URL");
      }
    }
    if (update.customAccentColor !== undefined && update.customAccentColor !== null) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(update.customAccentColor)) {
        throw new Error("Custom accent color must be a valid hex color (e.g. #3B82F6)");
      }
    }
    if (update.publicSlug !== undefined) {
      if (!/^[a-z0-9-]+$/.test(update.publicSlug) || update.publicSlug.length > 100) {
        throw new Error("Public slug must be lowercase alphanumeric with hyphens only");
      }
    }

    await this.db
      .update(trustCenterConfigs)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(trustCenterConfigs.tenantId, tenantId));

    return this.getConfig(tenantId);
  }

  private isValidHttpsUrl(url: string): boolean {
    try {
      const u = new URL(url);
      return u.protocol === "https:";
    } catch {
      return false;
    }
  }

  async setEnabled(tenantId: string, enabled: boolean) {
    await this.getConfig(tenantId); // ensure exists
    await this.db
      .update(trustCenterConfigs)
      .set({ enabled, updatedAt: new Date() })
      .where(eq(trustCenterConfigs.tenantId, tenantId));
    return this.getConfig(tenantId);
  }

  async getPublicTrustCenter(slug: string): Promise<TrustCenterPublicData | null> {
    const [config] = await this.db
      .select()
      .from(trustCenterConfigs)
      .where(eq(trustCenterConfigs.publicSlug, slug))
      .limit(1);

    if (!config || !config.enabled) return null;

    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, config.tenantId))
      .limit(1);

    if (!tenant) return null;

    // Get frameworks for this tenant
    const frameworks = await this.db
      .select()
      .from(complianceFrameworks)
      .where(eq(complianceFrameworks.tenantId, config.tenantId));

    const showList = config.showFrameworks as string[] | null;
    const filtered = showList && showList.length > 0
      ? frameworks.filter((f) => showList.includes(f.frameworkId))
      : frameworks;

    const frameworkSummaries = [];
    for (const fw of filtered) {
      const controls = await this.db
        .select()
        .from(complianceControls)
        .where(eq(complianceControls.frameworkDbId, fw.id));

      const passing = controls.filter((c) => c.status === "passing").length;
      const total = controls.length;
      const score = total > 0 ? Math.round((passing / total) * 100) : 0;

      frameworkSummaries.push({
        frameworkId: fw.frameworkId,
        name: fw.name,
        version: fw.version,
        complianceScore: score,
        totalControls: total,
        passingControls: passing,
        lastEvaluatedAt: fw.lastEvaluatedAt?.toISOString() ?? null,
      });
    }

    return {
      tenantName: tenant.name,
      title: config.customTitle ?? `${tenant.name} Trust Center`,
      description: config.customDescription ?? "Compliance and security status for our AI agent operations.",
      frameworks: frameworkSummaries,
      showComplianceScores: config.showComplianceScores,
      showLastAuditDate: config.showLastAuditDate,
      showControlSummary: config.showControlSummary,
      showBadges: config.showBadges,
      customLogo: config.customLogo,
      customAccentColor: config.customAccentColor,
      generatedAt: new Date().toISOString(),
    };
  }

  private formatConfig(row: typeof trustCenterConfigs.$inferSelect) {
    return {
      id: row.id,
      tenantId: row.tenantId,
      enabled: row.enabled,
      publicSlug: row.publicSlug,
      customTitle: row.customTitle,
      customDescription: row.customDescription,
      showFrameworks: (row.showFrameworks as string[]) ?? [],
      showComplianceScores: row.showComplianceScores,
      showLastAuditDate: row.showLastAuditDate,
      showControlSummary: row.showControlSummary,
      showBadges: row.showBadges,
      customLogo: row.customLogo,
      customAccentColor: row.customAccentColor,
      createdAt: row.createdAt?.toISOString() ?? "",
      updatedAt: row.updatedAt?.toISOString() ?? "",
    };
  }
}
