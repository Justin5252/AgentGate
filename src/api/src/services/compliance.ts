import { eq, count, sql } from "drizzle-orm";
import type { Database } from "../db/index.js";
import {
  complianceFrameworks,
  complianceControls,
  complianceEvidence,
  complianceReports,
  regulatoryUpdates,
  agents,
  policies,
  auditLogs,
  anomalies,
  a2aChannels,
} from "../db/schema.js";

// ─── Framework Definitions ───────────────────────────────────────

export interface FrameworkDef {
  id: string;
  name: string;
  version: string;
  description: string;
  controls: ControlDef[];
}

export interface ControlDef {
  controlCode: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  automatable: boolean;
  evaluator: string; // key for evaluation logic
}

export const FRAMEWORK_DEFS: Record<string, FrameworkDef> = {
  soc2: {
    id: "soc2",
    name: "SOC 2 Type II",
    version: "2024",
    description:
      "Service Organization Control 2 — Trust Services Criteria for security, availability, and confidentiality",
    controls: [
      { controlCode: "CC6.1", title: "Agent Identity Management", description: "All AI agents are registered with unique, verifiable identities", category: "Logical Access", severity: "high", automatable: true, evaluator: "has_agents" },
      { controlCode: "CC6.2", title: "Access Control Policies", description: "Granular policies govern what agents can access and when", category: "Logical Access", severity: "high", automatable: true, evaluator: "has_policies" },
      { controlCode: "CC6.3", title: "Authentication Controls", description: "API key authentication with SHA-256 hashing for all agent requests", category: "Logical Access", severity: "critical", automatable: true, evaluator: "has_api_keys" },
      { controlCode: "CC7.1", title: "Audit Logging", description: "All agent actions are logged with full context in append-only audit trail", category: "Monitoring", severity: "critical", automatable: true, evaluator: "has_audit_logs" },
      { controlCode: "CC7.2", title: "Anomaly Detection", description: "Automated detection of unusual agent behavior patterns", category: "Monitoring", severity: "high", automatable: true, evaluator: "has_anomaly_detection" },
      { controlCode: "CC7.3", title: "Incident Response", description: "Automated agent suspension on critical anomalies", category: "Monitoring", severity: "high", automatable: false, evaluator: "manual_review" },
      { controlCode: "CC8.1", title: "Data Encryption", description: "All data encrypted in transit (TLS) and at rest", category: "Encryption", severity: "critical", automatable: true, evaluator: "always_passing" },
      { controlCode: "CC9.1", title: "A2A Communication Controls", description: "Agent-to-agent communication governed by defined channels", category: "Communication", severity: "medium", automatable: true, evaluator: "has_a2a_channels" },
    ],
  },
  iso27001: {
    id: "iso27001",
    name: "ISO 27001:2022",
    version: "2022",
    description:
      "Information Security Management System (ISMS) standard for systematic security management",
    controls: [
      { controlCode: "A.5.1", title: "Information Security Policies", description: "Policies for AI agent access control are defined and enforced", category: "Organizational", severity: "high", automatable: true, evaluator: "has_policies" },
      { controlCode: "A.6.1", title: "Screening & Terms", description: "Agent identities verified and registered before activation", category: "People", severity: "medium", automatable: true, evaluator: "has_agents" },
      { controlCode: "A.8.1", title: "User Endpoint Devices", description: "Agent runtime environments are controlled and monitored", category: "Technological", severity: "high", automatable: false, evaluator: "manual_review" },
      { controlCode: "A.8.3", title: "Access Restriction", description: "Least-privilege access enforced for all AI agents", category: "Technological", severity: "critical", automatable: true, evaluator: "has_policies" },
      { controlCode: "A.8.5", title: "Secure Authentication", description: "Multi-factor authentication for management dashboard access", category: "Technological", severity: "high", automatable: false, evaluator: "manual_review" },
      { controlCode: "A.8.15", title: "Logging", description: "Comprehensive logging of all agent activities", category: "Technological", severity: "high", automatable: true, evaluator: "has_audit_logs" },
      { controlCode: "A.8.16", title: "Monitoring Activities", description: "Real-time monitoring of agent behavior anomalies", category: "Technological", severity: "high", automatable: true, evaluator: "has_anomaly_detection" },
      { controlCode: "A.8.24", title: "Cryptography", description: "Cryptographic controls for data protection", category: "Technological", severity: "critical", automatable: true, evaluator: "always_passing" },
    ],
  },
  hipaa: {
    id: "hipaa",
    name: "HIPAA",
    version: "2024",
    description:
      "Health Insurance Portability and Accountability Act — protecting health information in AI workflows",
    controls: [
      { controlCode: "§164.312(a)", title: "Access Control", description: "Technical controls to restrict agent access to ePHI", category: "Technical Safeguards", severity: "critical", automatable: true, evaluator: "has_policies" },
      { controlCode: "§164.312(b)", title: "Audit Controls", description: "Record and examine agent activity involving ePHI", category: "Technical Safeguards", severity: "critical", automatable: true, evaluator: "has_audit_logs" },
      { controlCode: "§164.312(c)", title: "Integrity Controls", description: "Protect ePHI from improper alteration by AI agents", category: "Technical Safeguards", severity: "high", automatable: true, evaluator: "has_policies" },
      { controlCode: "§164.312(d)", title: "Authentication", description: "Verify agent identity before granting access to ePHI", category: "Technical Safeguards", severity: "critical", automatable: true, evaluator: "has_api_keys" },
      { controlCode: "§164.312(e)", title: "Transmission Security", description: "Encrypt ePHI in transit between agents and systems", category: "Technical Safeguards", severity: "critical", automatable: true, evaluator: "always_passing" },
      { controlCode: "§164.308(a)(1)", title: "Risk Analysis", description: "Regular risk assessment of AI agent activities", category: "Administrative Safeguards", severity: "high", automatable: true, evaluator: "has_anomaly_detection" },
    ],
  },
  gdpr: {
    id: "gdpr",
    name: "GDPR",
    version: "2024",
    description:
      "General Data Protection Regulation — EU data privacy for AI agent data processing",
    controls: [
      { controlCode: "Art.5", title: "Data Processing Principles", description: "Agents process personal data lawfully, fairly, and transparently", category: "Principles", severity: "critical", automatable: true, evaluator: "has_policies" },
      { controlCode: "Art.22", title: "Automated Decision-Making", description: "Human oversight for significant agent decisions", category: "Data Subject Rights", severity: "high", automatable: true, evaluator: "has_policies" },
      { controlCode: "Art.25", title: "Data Protection by Design", description: "Privacy-by-design in agent architecture", category: "Controller Obligations", severity: "high", automatable: true, evaluator: "always_passing" },
      { controlCode: "Art.30", title: "Records of Processing", description: "Maintain records of all agent data processing activities", category: "Controller Obligations", severity: "high", automatable: true, evaluator: "has_audit_logs" },
      { controlCode: "Art.32", title: "Security of Processing", description: "Appropriate security measures for agent data handling", category: "Security", severity: "critical", automatable: true, evaluator: "has_api_keys" },
      { controlCode: "Art.33", title: "Breach Notification", description: "Detect and report agent-related data breaches within 72 hours", category: "Breach", severity: "critical", automatable: true, evaluator: "has_anomaly_detection" },
      { controlCode: "Art.35", title: "Data Protection Impact Assessment", description: "DPIA for high-risk agent processing activities", category: "Impact Assessment", severity: "high", automatable: false, evaluator: "manual_review" },
    ],
  },
  pci_dss: {
    id: "pci_dss",
    name: "PCI DSS v4.0",
    version: "4.0",
    description:
      "Payment Card Industry Data Security Standard for AI agents handling cardholder data",
    controls: [
      { controlCode: "Req.1", title: "Network Security Controls", description: "Network controls for agent communication boundaries", category: "Network", severity: "high", automatable: true, evaluator: "has_a2a_channels" },
      { controlCode: "Req.2", title: "Secure Configuration", description: "Secure defaults for agent configurations", category: "Configuration", severity: "high", automatable: true, evaluator: "has_agents" },
      { controlCode: "Req.7", title: "Restrict Access", description: "Limit agent access to cardholder data by business need", category: "Access Control", severity: "critical", automatable: true, evaluator: "has_policies" },
      { controlCode: "Req.8", title: "Identify & Authenticate", description: "Unique identity for every AI agent accessing systems", category: "Authentication", severity: "critical", automatable: true, evaluator: "has_agents" },
      { controlCode: "Req.10", title: "Log & Monitor", description: "Log all agent access to cardholder data environments", category: "Monitoring", severity: "critical", automatable: true, evaluator: "has_audit_logs" },
      { controlCode: "Req.12", title: "Security Policy", description: "Maintain agent security policies and procedures", category: "Policy", severity: "high", automatable: true, evaluator: "has_policies" },
    ],
  },
  eu_ai_act: {
    id: "eu_ai_act",
    name: "EU AI Act",
    version: "2024",
    description:
      "European Union Artificial Intelligence Act — risk-based regulation for AI systems including agents",
    controls: [
      { controlCode: "Art.9", title: "Risk Management System", description: "Continuous risk assessment for high-risk AI agents", category: "Risk Management", severity: "critical", automatable: true, evaluator: "has_anomaly_detection" },
      { controlCode: "Art.10", title: "Data Governance", description: "Quality standards for agent training and operational data", category: "Data", severity: "high", automatable: false, evaluator: "manual_review" },
      { controlCode: "Art.12", title: "Record-Keeping", description: "Automatic logging of AI agent operations for traceability", category: "Transparency", severity: "critical", automatable: true, evaluator: "has_audit_logs" },
      { controlCode: "Art.13", title: "Transparency", description: "Clear documentation of AI agent capabilities and limitations", category: "Transparency", severity: "high", automatable: true, evaluator: "has_agents" },
      { controlCode: "Art.14", title: "Human Oversight", description: "Human oversight mechanisms for AI agent decisions", category: "Human Oversight", severity: "critical", automatable: true, evaluator: "has_policies" },
      { controlCode: "Art.15", title: "Accuracy & Robustness", description: "AI agents meet accuracy and cybersecurity standards", category: "Technical", severity: "high", automatable: false, evaluator: "manual_review" },
    ],
  },
};

// ─── Compliance Service ──────────────────────────────────────────

export class ComplianceService {
  constructor(private db: Database) {}

  async initializeFramework(tenantId: string, frameworkId: string) {
    const def = FRAMEWORK_DEFS[frameworkId];
    if (!def) throw new Error(`Unknown framework: ${frameworkId}`);

    const dbId = crypto.randomUUID();
    await this.db.insert(complianceFrameworks).values({
      id: dbId,
      tenantId,
      frameworkId: def.id,
      name: def.name,
      version: def.version,
      description: def.description,
      enabled: true,
    });

    for (const ctrl of def.controls) {
      await this.db.insert(complianceControls).values({
        id: crypto.randomUUID(),
        frameworkDbId: dbId,
        frameworkId: def.id,
        controlCode: ctrl.controlCode,
        title: ctrl.title,
        description: ctrl.description,
        category: ctrl.category,
        status: "not_evaluated",
        severity: ctrl.severity,
        automatable: ctrl.automatable,
      });
    }

    return { id: dbId, frameworkId: def.id, name: def.name, controlCount: def.controls.length };
  }

  async evaluateFramework(tenantId: string, frameworkId: string) {
    const [fw] = await this.db
      .select()
      .from(complianceFrameworks)
      .where(eq(complianceFrameworks.frameworkId, frameworkId))
      .limit(1);

    if (!fw) throw new Error(`Framework ${frameworkId} not initialized`);

    const def = FRAMEWORK_DEFS[frameworkId];
    if (!def) throw new Error(`Unknown framework: ${frameworkId}`);

    // Gather platform state
    const state = await this.gatherPlatformState();

    const controls = await this.db
      .select()
      .from(complianceControls)
      .where(eq(complianceControls.frameworkDbId, fw.id));

    let passing = 0;
    let failing = 0;
    let warning = 0;

    for (const ctrl of controls) {
      const ctrlDef = def.controls.find((c) => c.controlCode === ctrl.controlCode);
      if (!ctrlDef) continue;

      const status = this.evaluateControl(ctrlDef.evaluator, state);

      if (status === "passing") passing++;
      else if (status === "failing") failing++;
      else if (status === "warning") warning++;

      await this.db
        .update(complianceControls)
        .set({ status, lastEvaluatedAt: new Date() })
        .where(eq(complianceControls.id, ctrl.id));
    }

    const total = controls.length;
    const score = total > 0 ? Math.round((passing / total) * 100) : 0;

    await this.db
      .update(complianceFrameworks)
      .set({ lastEvaluatedAt: new Date() })
      .where(eq(complianceFrameworks.id, fw.id));

    return {
      frameworkId,
      totalControls: total,
      passingControls: passing,
      failingControls: failing,
      warningControls: warning,
      complianceScore: score,
    };
  }

  async getFrameworks(tenantId: string) {
    const frameworks = await this.db
      .select()
      .from(complianceFrameworks)
      .where(eq(complianceFrameworks.tenantId, tenantId));

    const results = [];
    for (const fw of frameworks) {
      const controls = await this.db
        .select()
        .from(complianceControls)
        .where(eq(complianceControls.frameworkDbId, fw.id));

      const passing = controls.filter((c) => c.status === "passing").length;
      const failing = controls.filter((c) => c.status === "failing").length;
      const warn = controls.filter((c) => c.status === "warning").length;
      const total = controls.length;
      const score = total > 0 ? Math.round((passing / total) * 100) : 0;

      results.push({
        id: fw.id,
        frameworkId: fw.frameworkId,
        name: fw.name,
        version: fw.version,
        description: fw.description,
        totalControls: total,
        passingControls: passing,
        failingControls: failing,
        warningControls: warn,
        complianceScore: score,
        lastEvaluatedAt: fw.lastEvaluatedAt?.toISOString() ?? null,
        enabled: fw.enabled,
        createdAt: fw.createdAt?.toISOString() ?? null,
      });
    }
    return results;
  }

  async getControls(frameworkId: string) {
    const [fw] = await this.db
      .select()
      .from(complianceFrameworks)
      .where(eq(complianceFrameworks.frameworkId, frameworkId))
      .limit(1);

    if (!fw) return [];

    const controls = await this.db
      .select()
      .from(complianceControls)
      .where(eq(complianceControls.frameworkDbId, fw.id));

    const results = [];
    for (const ctrl of controls) {
      const [evCount] = await this.db
        .select({ count: count() })
        .from(complianceEvidence)
        .where(eq(complianceEvidence.controlId, ctrl.id));

      results.push({
        id: ctrl.id,
        frameworkId: ctrl.frameworkId,
        controlCode: ctrl.controlCode,
        title: ctrl.title,
        description: ctrl.description,
        category: ctrl.category,
        status: ctrl.status,
        severity: ctrl.severity,
        evidenceCount: evCount?.count ?? 0,
        lastEvaluatedAt: ctrl.lastEvaluatedAt?.toISOString() ?? null,
        remediationSteps: ctrl.remediationSteps,
        automatable: ctrl.automatable,
      });
    }
    return results;
  }

  async collectEvidence(
    tenantId: string,
    controlId: string,
    frameworkId: string,
    evidence: { title: string; description: string; sourceSystem: string; type?: string; data?: Record<string, unknown> },
  ) {
    const id = crypto.randomUUID();
    await this.db.insert(complianceEvidence).values({
      id,
      controlId,
      frameworkId,
      tenantId,
      type: evidence.type ?? "manual",
      title: evidence.title,
      description: evidence.description,
      sourceSystem: evidence.sourceSystem,
      data: evidence.data ?? {},
      verified: false,
    });
    return { id };
  }

  async getEvidence(controlId: string) {
    return this.db
      .select()
      .from(complianceEvidence)
      .where(eq(complianceEvidence.controlId, controlId));
  }

  async generateReport(tenantId: string, frameworkId: string, generatedBy: string) {
    const controls = await this.getControls(frameworkId);
    const total = controls.length;
    const passing = controls.filter((c) => c.status === "passing").length;
    const score = total > 0 ? Math.round((passing / total) * 100) : 0;

    const findings = controls.map((ctrl) => ({
      controlCode: ctrl.controlCode,
      controlTitle: ctrl.title,
      status: ctrl.status,
      finding:
        ctrl.status === "passing"
          ? "Control is operating effectively."
          : ctrl.status === "failing"
            ? "Control requires remediation — not meeting requirements."
            : ctrl.status === "warning"
              ? "Control is partially implemented — needs attention."
              : "Control has not been evaluated.",
      recommendation:
        ctrl.status === "passing"
          ? "Continue monitoring."
          : "Review and implement remediation steps.",
      severity: ctrl.severity,
    }));

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const id = crypto.randomUUID();
    await this.db.insert(complianceReports).values({
      id,
      frameworkId,
      tenantId,
      title: `${FRAMEWORK_DEFS[frameworkId]?.name ?? frameworkId} Compliance Report`,
      generatedBy,
      periodStart,
      periodEnd: now,
      overallScore: score,
      summary: `Compliance assessment completed with an overall score of ${score}%. ${passing} of ${total} controls are passing.`,
      findings: findings as unknown as Record<string, unknown>[],
      status: "draft",
    });

    return {
      id,
      frameworkId,
      overallScore: score,
      totalControls: total,
      passingControls: passing,
      findingsCount: findings.length,
    };
  }

  async getReports(frameworkId: string) {
    return this.db
      .select()
      .from(complianceReports)
      .where(eq(complianceReports.frameworkId, frameworkId));
  }

  async getReport(reportId: string) {
    const [report] = await this.db
      .select()
      .from(complianceReports)
      .where(eq(complianceReports.id, reportId))
      .limit(1);
    return report ?? null;
  }

  async getGapAnalysis(tenantId: string, frameworkId: string) {
    const controls = await this.getControls(frameworkId);
    const gaps = controls
      .filter((c) => c.status !== "passing" && c.status !== "not_applicable")
      .map((c, i) => ({
        controlCode: c.controlCode,
        controlTitle: c.title,
        currentState: c.status === "failing" ? "Not implemented" : c.status === "warning" ? "Partially implemented" : "Not assessed",
        requiredState: "Fully implemented and operational",
        effort: c.automatable ? ("low" as const) : ("high" as const),
        priority: i + 1,
      }));

    const total = controls.length;
    const passing = controls.filter((c) => c.status === "passing").length;

    return {
      frameworkId,
      totalControls: total,
      assessed: controls.filter((c) => c.status !== "not_evaluated").length,
      gaps,
      overallReadiness: total > 0 ? Math.round((passing / total) * 100) : 0,
    };
  }

  async getScoreHistory(_tenantId: string, frameworkId: string) {
    // In production this would query historical snapshots.
    // For now return last-30-day simulated trend based on current score.
    const controls = await this.getControls(frameworkId);
    const total = controls.length;
    const passing = controls.filter((c) => c.status === "passing").length;
    const currentScore = total > 0 ? Math.round((passing / total) * 100) : 0;

    const scores = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      scores.push({
        date: d.toISOString().split("T")[0],
        score: Math.max(0, currentScore - i * 8 + Math.floor(Math.random() * 5)),
      });
    }
    return { frameworkId, scores };
  }

  async getRegulatoryUpdates(frameworkId?: string) {
    if (frameworkId) {
      return this.db
        .select()
        .from(regulatoryUpdates)
        .where(eq(regulatoryUpdates.frameworkId, frameworkId));
    }
    return this.db.select().from(regulatoryUpdates);
  }

  async acknowledgeUpdate(updateId: string) {
    await this.db
      .update(regulatoryUpdates)
      .set({ acknowledged: true })
      .where(eq(regulatoryUpdates.id, updateId));
  }

  getAvailableFrameworks() {
    return Object.values(FRAMEWORK_DEFS).map((f) => ({
      frameworkId: f.id,
      name: f.name,
      version: f.version,
      description: f.description,
      controlCount: f.controls.length,
    }));
  }

  // ─── Private helpers ─────────────────────────────────────────────

  private async gatherPlatformState() {
    const [agentCount] = await this.db.select({ count: count() }).from(agents);
    const [policyCount] = await this.db.select({ count: count() }).from(policies);
    const [auditCount] = await this.db.select({ count: count() }).from(auditLogs);
    const [anomalyCount] = await this.db.select({ count: count() }).from(anomalies);
    const [channelCount] = await this.db.select({ count: count() }).from(a2aChannels);

    return {
      hasAgents: (agentCount?.count ?? 0) > 0,
      hasPolicies: (policyCount?.count ?? 0) > 0,
      hasAuditLogs: (auditCount?.count ?? 0) > 0,
      hasAnomalyDetection: (anomalyCount?.count ?? 0) > 0,
      hasA2AChannels: (channelCount?.count ?? 0) > 0,
      hasApiKeys: true, // Auth middleware is always active
    };
  }

  private evaluateControl(
    evaluator: string,
    state: {
      hasAgents: boolean;
      hasPolicies: boolean;
      hasAuditLogs: boolean;
      hasAnomalyDetection: boolean;
      hasA2AChannels: boolean;
      hasApiKeys: boolean;
    },
  ): string {
    switch (evaluator) {
      case "has_agents":
        return state.hasAgents ? "passing" : "failing";
      case "has_policies":
        return state.hasPolicies ? "passing" : "failing";
      case "has_audit_logs":
        return state.hasAuditLogs ? "passing" : "failing";
      case "has_anomaly_detection":
        return state.hasAnomalyDetection ? "passing" : "warning";
      case "has_a2a_channels":
        return state.hasA2AChannels ? "passing" : "warning";
      case "has_api_keys":
        return state.hasApiKeys ? "passing" : "failing";
      case "always_passing":
        return "passing";
      case "manual_review":
        return "warning";
      default:
        return "not_evaluated";
    }
  }
}
