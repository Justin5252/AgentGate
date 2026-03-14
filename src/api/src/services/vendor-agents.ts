import { eq, and, count, sql } from "drizzle-orm";
import type { Database } from "../db/index.js";
import { vendorAgents, vendorAgentAssessments } from "../db/schema.js";
import type {
  CreateVendorAgentRequest,
  UpdateVendorAgentRequest,
  CreateAssessmentRequest,
  RiskLevel,
  VendorAgentStats,
  AssessmentFinding,
} from "@agentgate/shared";

export class VendorAgentService {
  constructor(private db: Database) {}

  async list(tenantId: string) {
    const rows = await this.db
      .select()
      .from(vendorAgents)
      .where(eq(vendorAgents.tenantId, tenantId));
    return rows.map(this.formatAgent);
  }

  async get(id: string, tenantId?: string) {
    const conditions = tenantId
      ? and(eq(vendorAgents.id, id), eq(vendorAgents.tenantId, tenantId))
      : eq(vendorAgents.id, id);
    const [row] = await this.db
      .select()
      .from(vendorAgents)
      .where(conditions)
      .limit(1);
    return row ? this.formatAgent(row) : null;
  }

  async create(tenantId: string, data: CreateVendorAgentRequest) {
    const id = crypto.randomUUID();
    const riskScore = this.calculateRiskScore(data.complianceClaims ?? {}, data.dataAccess ?? [], false);
    const riskLevel = this.scoreToLevel(riskScore);

    await this.db.insert(vendorAgents).values({
      id,
      tenantId,
      vendorName: data.vendorName,
      agentName: data.agentName,
      description: data.description,
      vendorUrl: data.vendorUrl ?? null,
      contactEmail: data.contactEmail ?? null,
      capabilities: data.capabilities ?? [],
      dataAccess: data.dataAccess ?? [],
      riskScore,
      riskLevel,
      complianceClaims: data.complianceClaims ?? {},
      assessmentStatus: "not_assessed",
    });

    return this.get(id);
  }

  async update(id: string, data: UpdateVendorAgentRequest, tenantId?: string) {
    const existing = await this.get(id, tenantId);
    if (!existing) return null;

    const claims = data.complianceClaims ?? existing.complianceClaims;
    const dataAccess = data.dataAccess ?? existing.dataAccess;
    const riskScore = this.calculateRiskScore(claims, dataAccess, existing.lastAssessedAt !== null);
    const riskLevel = this.scoreToLevel(riskScore);

    await this.db
      .update(vendorAgents)
      .set({ ...data, riskScore, riskLevel, updatedAt: new Date() })
      .where(eq(vendorAgents.id, id));

    return this.get(id);
  }

  async remove(id: string, tenantId?: string) {
    if (tenantId) {
      const agent = await this.get(id, tenantId);
      if (!agent) return false;
    }
    await this.db.delete(vendorAgentAssessments).where(eq(vendorAgentAssessments.vendorAgentId, id));
    await this.db.delete(vendorAgents).where(eq(vendorAgents.id, id));
    return true;
  }

  async assess(vendorAgentId: string, tenantId: string, assessorId: string, data: CreateAssessmentRequest) {
    const agent = await this.get(vendorAgentId, tenantId);
    if (!agent) return null;

    // Auto-generate findings if none provided
    const findings: AssessmentFinding[] = data.findings ?? this.autoAssess(agent);
    const overallRiskScore = this.calculateRiskFromFindings(findings);
    const recommendation = this.scoreToRecommendation(overallRiskScore);

    const id = crypto.randomUUID();
    await this.db.insert(vendorAgentAssessments).values({
      id,
      vendorAgentId,
      tenantId,
      assessorId,
      assessmentType: data.assessmentType ?? "initial",
      findings,
      overallRiskScore,
      recommendation,
      notes: data.notes ?? null,
    });

    // Update agent
    const riskLevel = this.scoreToLevel(overallRiskScore);
    await this.db
      .update(vendorAgents)
      .set({
        riskScore: overallRiskScore,
        riskLevel,
        assessmentStatus: "assessed",
        lastAssessedAt: new Date(),
        nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        updatedAt: new Date(),
      })
      .where(eq(vendorAgents.id, vendorAgentId));

    const [row] = await this.db
      .select()
      .from(vendorAgentAssessments)
      .where(eq(vendorAgentAssessments.id, id))
      .limit(1);

    return {
      id: row.id,
      vendorAgentId: row.vendorAgentId,
      tenantId: row.tenantId,
      assessorId: row.assessorId,
      assessmentType: row.assessmentType,
      findings: row.findings,
      overallRiskScore: row.overallRiskScore,
      recommendation: row.recommendation,
      notes: row.notes,
      assessedAt: row.assessedAt?.toISOString() ?? "",
    };
  }

  async getAssessments(vendorAgentId: string, tenantId?: string) {
    const conditions = tenantId
      ? and(eq(vendorAgentAssessments.vendorAgentId, vendorAgentId), eq(vendorAgentAssessments.tenantId, tenantId))
      : eq(vendorAgentAssessments.vendorAgentId, vendorAgentId);
    const rows = await this.db
      .select()
      .from(vendorAgentAssessments)
      .where(conditions);

    return rows.map((r) => ({
      id: r.id,
      vendorAgentId: r.vendorAgentId,
      tenantId: r.tenantId,
      assessorId: r.assessorId,
      assessmentType: r.assessmentType,
      findings: r.findings,
      overallRiskScore: r.overallRiskScore,
      recommendation: r.recommendation,
      notes: r.notes,
      assessedAt: r.assessedAt?.toISOString() ?? "",
    }));
  }

  async getStats(tenantId: string): Promise<VendorAgentStats> {
    const all = await this.list(tenantId);

    const byRiskLevel: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    const byAssessmentStatus: Record<string, number> = { not_assessed: 0, in_progress: 0, assessed: 0, needs_review: 0 };
    let totalScore = 0;
    let needsReview = 0;

    for (const a of all) {
      byRiskLevel[a.riskLevel] = (byRiskLevel[a.riskLevel] ?? 0) + 1;
      byAssessmentStatus[a.assessmentStatus] = (byAssessmentStatus[a.assessmentStatus] ?? 0) + 1;
      totalScore += a.riskScore;
      if (a.assessmentStatus === "needs_review" || a.assessmentStatus === "not_assessed") needsReview++;
    }

    return {
      total: all.length,
      byRiskLevel,
      byAssessmentStatus,
      avgRiskScore: all.length > 0 ? Math.round(totalScore / all.length) : 0,
      needsReview,
    };
  }

  // ─── Risk scoring ────────────────────────────────────────────

  private calculateRiskScore(claims: Record<string, boolean>, dataAccess: string[], hasAssessment: boolean): number {
    let score = 50; // base score

    // Compliance claims reduce risk
    const claimedFrameworks = Object.values(claims).filter(Boolean).length;
    score -= claimedFrameworks * 5; // each claimed framework reduces risk by 5

    // Broad data access increases risk
    const sensitiveKeywords = ["pii", "phi", "financial", "credentials", "secrets", "admin"];
    const sensitiveAccess = dataAccess.filter((d) => sensitiveKeywords.some((kw) => d.toLowerCase().includes(kw)));
    score += sensitiveAccess.length * 8;

    // More data access types = more risk
    score += Math.min(dataAccess.length * 3, 15);

    // No assessment = higher risk
    if (!hasAssessment) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  private calculateRiskFromFindings(findings: AssessmentFinding[]): number {
    if (findings.length === 0) return 30;
    const severityWeights = { critical: 25, high: 15, medium: 8, low: 3 };
    let score = 20; // base
    for (const f of findings) {
      if (f.status !== "mitigated") {
        score += severityWeights[f.severity] ?? 5;
      }
    }
    return Math.max(0, Math.min(100, score));
  }

  private scoreToLevel(score: number): RiskLevel {
    if (score >= 75) return "critical";
    if (score >= 50) return "high";
    if (score >= 25) return "medium";
    return "low";
  }

  private scoreToRecommendation(score: number): "approve" | "conditional" | "reject" | "review" {
    if (score >= 75) return "reject";
    if (score >= 50) return "conditional";
    if (score >= 25) return "review";
    return "approve";
  }

  private autoAssess(agent: ReturnType<VendorAgentService["formatAgent"]>): AssessmentFinding[] {
    const findings: AssessmentFinding[] = [];

    if (Object.values(agent.complianceClaims).filter(Boolean).length === 0) {
      findings.push({ category: "Compliance", finding: "No compliance certifications claimed", severity: "high", status: "open" });
    }

    if (agent.dataAccess.some((d: string) => ["pii", "phi", "financial"].some((kw) => d.toLowerCase().includes(kw)))) {
      findings.push({ category: "Data Access", finding: "Agent accesses sensitive data categories", severity: "high", status: "open" });
    }

    if (!agent.vendorUrl) {
      findings.push({ category: "Documentation", finding: "No vendor URL provided for verification", severity: "medium", status: "open" });
    }

    if (!agent.contactEmail) {
      findings.push({ category: "Contact", finding: "No vendor contact email for incident response", severity: "medium", status: "open" });
    }

    if (agent.capabilities.length > 5) {
      findings.push({ category: "Scope", finding: "Agent has broad capabilities scope", severity: "medium", status: "open" });
    }

    if (findings.length === 0) {
      findings.push({ category: "General", finding: "No immediate concerns identified", severity: "low", status: "mitigated" });
    }

    return findings;
  }

  private formatAgent(row: typeof vendorAgents.$inferSelect) {
    return {
      id: row.id,
      tenantId: row.tenantId,
      vendorName: row.vendorName,
      agentName: row.agentName,
      description: row.description,
      vendorUrl: row.vendorUrl,
      contactEmail: row.contactEmail,
      capabilities: (row.capabilities as string[]) ?? [],
      dataAccess: (row.dataAccess as string[]) ?? [],
      riskScore: row.riskScore,
      riskLevel: row.riskLevel as RiskLevel,
      assessmentStatus: row.assessmentStatus as any,
      complianceClaims: (row.complianceClaims as Record<string, boolean>) ?? {},
      lastAssessedAt: row.lastAssessedAt?.toISOString() ?? null,
      nextReviewDate: row.nextReviewDate?.toISOString() ?? null,
      notes: row.notes,
      createdAt: row.createdAt?.toISOString() ?? "",
      updatedAt: row.updatedAt?.toISOString() ?? "",
    };
  }
}
