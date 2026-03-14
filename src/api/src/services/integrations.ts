import { eq, and } from "drizzle-orm";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import type { Database } from "../db/index.js";
import { integrationConfigs } from "../db/schema.js";
import type { IntegrationType, IntegrationSyncResult } from "@agentgate/shared";
import { ComplianceService } from "./compliance.js";

// Require encryption key in production; allow dev fallback only when explicitly opted in
const RAW_KEY = process.env.INTEGRATION_ENCRYPTION_KEY;
if (!RAW_KEY && process.env.NODE_ENV === "production") {
  throw new Error("INTEGRATION_ENCRYPTION_KEY environment variable is required in production");
}
const KEY_SOURCE = RAW_KEY ?? "dev-only-integration-key-not-for-prod";
// Derive a proper 32-byte key using scrypt
const DERIVED_KEY = scryptSync(KEY_SOURCE, "agentgate-integration-salt", 32);

function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", DERIVED_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text: string): string {
  const [ivHex, encrypted] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv("aes-256-cbc", DERIVED_KEY, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export class IntegrationService {
  constructor(
    private db: Database,
    private complianceService: ComplianceService,
  ) {}

  async listIntegrations(tenantId: string) {
    const configs = await this.db
      .select()
      .from(integrationConfigs)
      .where(eq(integrationConfigs.tenantId, tenantId));

    return configs.map((c) => ({
      id: c.id,
      tenantId: c.tenantId,
      integrationType: c.integrationType,
      enabled: c.enabled,
      lastSyncAt: c.lastSyncAt?.toISOString() ?? null,
      lastSyncStatus: c.lastSyncStatus,
      createdAt: c.createdAt?.toISOString() ?? "",
      updatedAt: c.updatedAt?.toISOString() ?? "",
    }));
  }

  async configure(tenantId: string, integrationType: IntegrationType, config: { apiKey: string; baseUrl?: string }) {
    const encrypted = encrypt(JSON.stringify(config));

    // Upsert
    const [existing] = await this.db
      .select()
      .from(integrationConfigs)
      .where(and(eq(integrationConfigs.tenantId, tenantId), eq(integrationConfigs.integrationType, integrationType)))
      .limit(1);

    if (existing) {
      await this.db
        .update(integrationConfigs)
        .set({ configEncrypted: encrypted, enabled: true, updatedAt: new Date() })
        .where(eq(integrationConfigs.id, existing.id));
      return { id: existing.id, configured: true };
    }

    const id = crypto.randomUUID();
    await this.db.insert(integrationConfigs).values({
      id,
      tenantId,
      integrationType,
      configEncrypted: encrypted,
      enabled: true,
    });

    return { id, configured: true };
  }

  async getStatus(tenantId: string, integrationType: IntegrationType) {
    const [config] = await this.db
      .select()
      .from(integrationConfigs)
      .where(and(eq(integrationConfigs.tenantId, tenantId), eq(integrationConfigs.integrationType, integrationType)))
      .limit(1);

    if (!config) return null;

    return {
      id: config.id,
      integrationType: config.integrationType,
      enabled: config.enabled,
      lastSyncAt: config.lastSyncAt?.toISOString() ?? null,
      lastSyncStatus: config.lastSyncStatus,
    };
  }

  async pushToVanta(tenantId: string): Promise<IntegrationSyncResult> {
    const [config] = await this.db
      .select()
      .from(integrationConfigs)
      .where(and(eq(integrationConfigs.tenantId, tenantId), eq(integrationConfigs.integrationType, "vanta")))
      .limit(1);

    if (!config || !config.enabled) {
      return { pushed: 0, pulled: 0, errors: ["Vanta integration not configured"], syncedAt: new Date().toISOString() };
    }

    const creds = JSON.parse(decrypt(config.configEncrypted));
    const baseUrl = creds.baseUrl ?? "https://api.vanta.com";

    // Gather compliance data to push
    const frameworks = await this.complianceService.getFrameworks(tenantId);
    const errors: string[] = [];
    let pushed = 0;

    for (const fw of frameworks) {
      try {
        const response = await fetch(`${baseUrl}/v1/resources/custom_evidence`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${creds.apiKey}`,
          },
          body: JSON.stringify({
            title: `AgentGate: ${fw.name} Compliance`,
            description: `AI Agent compliance status — ${fw.complianceScore}% score, ${fw.passingControls}/${fw.totalControls} controls passing`,
            type: "CUSTOM",
            body: {
              source: "agentgate",
              frameworkId: fw.frameworkId,
              complianceScore: fw.complianceScore,
              passingControls: fw.passingControls,
              totalControls: fw.totalControls,
              lastEvaluatedAt: fw.lastEvaluatedAt,
            },
          }),
        });

        if (response.ok) {
          pushed++;
        } else {
          errors.push(`Failed to push ${fw.name}: ${response.status}`);
        }
      } catch (err: unknown) {
        errors.push(`Failed to push ${fw.name}: integration error`);
      }
    }

    const syncedAt = new Date();
    await this.db
      .update(integrationConfigs)
      .set({
        lastSyncAt: syncedAt,
        lastSyncStatus: errors.length > 0 ? "partial" : "success",
        updatedAt: syncedAt,
      })
      .where(eq(integrationConfigs.id, config.id));

    return { pushed, pulled: 0, errors, syncedAt: syncedAt.toISOString() };
  }

  async syncFromVanta(tenantId: string): Promise<IntegrationSyncResult> {
    const [config] = await this.db
      .select()
      .from(integrationConfigs)
      .where(and(eq(integrationConfigs.tenantId, tenantId), eq(integrationConfigs.integrationType, "vanta")))
      .limit(1);

    if (!config || !config.enabled) {
      return { pushed: 0, pulled: 0, errors: ["Vanta integration not configured"], syncedAt: new Date().toISOString() };
    }

    const creds = JSON.parse(decrypt(config.configEncrypted));
    const baseUrl = creds.baseUrl ?? "https://api.vanta.com";
    const errors: string[] = [];
    let pulled = 0;

    try {
      const response = await fetch(`${baseUrl}/v1/resources/tests`, {
        headers: { Authorization: `Bearer ${creds.apiKey}` },
      });

      if (response.ok) {
        const data = await response.json() as Record<string, unknown>;
        const results = data?.results;
        pulled = Array.isArray(results) ? results.length : 0;
      } else {
        errors.push(`Failed to pull tests: ${response.status}`);
      }
    } catch (err: unknown) {
      errors.push("Vanta sync error: connection failed");
    }

    const syncedAt = new Date();
    await this.db
      .update(integrationConfigs)
      .set({
        lastSyncAt: syncedAt,
        lastSyncStatus: errors.length > 0 ? "error" : "success",
        updatedAt: syncedAt,
      })
      .where(eq(integrationConfigs.id, config.id));

    return { pushed: 0, pulled, errors, syncedAt: syncedAt.toISOString() };
  }
}
