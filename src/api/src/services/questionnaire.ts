import { eq, and, count } from "drizzle-orm";
import type { Database } from "../db/index.js";
import {
  questionnaireResponses,
  agents,
  policies,
  auditLogs,
  anomalies,
  a2aChannels,
  apiKeys,
  complianceFrameworks,
  complianceControls,
} from "../db/schema.js";
import type { QuestionnaireQuestion, QuestionnaireAnswer, QuestionnaireResponse } from "@agentgate/shared";

// Keyword categories for matching questions to answers
const KEYWORD_MAP: Record<string, string[]> = {
  access_control: ["access control", "authorization", "permissions", "least privilege", "rbac", "who can access"],
  audit: ["audit", "logging", "log", "trail", "record", "traceability", "monitoring"],
  encryption: ["encrypt", "cryptograph", "tls", "ssl", "at rest", "in transit", "data protection"],
  monitoring: ["monitor", "detect", "anomal", "alert", "incident", "behavioral"],
  identity: ["identity", "identif", "authenticat", "credential", "api key", "token", "mfa"],
  agents: ["agent", "ai agent", "bot", "autonomous", "ai system", "llm"],
  compliance: ["complian", "soc 2", "soc2", "iso 27001", "hipaa", "gdpr", "pci", "framework", "certif"],
  a2a: ["agent-to-agent", "a2a", "inter-agent", "communication between", "agent communication"],
  data: ["data", "pii", "personal information", "sensitive", "cardholder", "phi", "protected health"],
  policy: ["policy", "policies", "rule", "governance", "control"],
  vendor: ["vendor", "third-party", "third party", "supply chain", "external"],
  incident: ["incident", "breach", "response", "remediat"],
};

export class QuestionnaireService {
  constructor(private db: Database) {}

  async generate(tenantId: string, title: string, questions: QuestionnaireQuestion[]): Promise<QuestionnaireResponse> {
    const state = await this.gatherState(tenantId);
    const responses: QuestionnaireAnswer[] = questions.map((q) => this.answerQuestion(q, state));

    const id = crypto.randomUUID();
    await this.db.insert(questionnaireResponses).values({
      id,
      tenantId,
      questionnaireTitle: title,
      questions,
      responses,
      status: "completed",
    });

    const [row] = await this.db
      .select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.id, id))
      .limit(1);

    return this.formatResponse(row);
  }

  async list(tenantId: string): Promise<QuestionnaireResponse[]> {
    const rows = await this.db
      .select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.tenantId, tenantId));
    return rows.map(this.formatResponse);
  }

  async get(id: string, tenantId?: string): Promise<QuestionnaireResponse | null> {
    const [row] = await this.db
      .select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.id, id))
      .limit(1);
    if (!row) return null;
    if (tenantId && row.tenantId !== tenantId) return null;
    return this.formatResponse(row);
  }

  async updateAnswers(id: string, tenantId: string, responses: QuestionnaireAnswer[]) {
    const existing = await this.get(id, tenantId);
    if (!existing) return null;
    await this.db
      .update(questionnaireResponses)
      .set({ responses, updatedAt: new Date() })
      .where(eq(questionnaireResponses.id, id));
    return this.get(id, tenantId);
  }

  async exportQuestionnaire(id: string, tenantId: string) {
    const existing = await this.get(id, tenantId);
    if (!existing) return null;
    await this.db
      .update(questionnaireResponses)
      .set({ status: "exported", updatedAt: new Date() })
      .where(eq(questionnaireResponses.id, id));
    return this.get(id, tenantId);
  }

  // ─── Private helpers ─────────────────────────────────────────

  private async gatherState(tenantId: string) {
    // Tenant-scoped counts where possible, global for tables without tenantId
    const [agentCount] = await this.db.select({ count: count() }).from(agents).where(eq(agents.tenantId, tenantId));
    const [policyCount] = await this.db.select({ count: count() }).from(policies).where(eq(policies.tenantId, tenantId));
    const [auditCount] = await this.db.select({ count: count() }).from(auditLogs);
    const [anomalyCount] = await this.db.select({ count: count() }).from(anomalies);
    const [channelCount] = await this.db.select({ count: count() }).from(a2aChannels);
    const [keyCount] = await this.db.select({ count: count() }).from(apiKeys).where(eq(apiKeys.tenantId, tenantId));

    const frameworks = await this.db.select().from(complianceFrameworks).where(eq(complianceFrameworks.tenantId, tenantId));
    const frameworkNames = frameworks.map((f) => f.name);

    let totalControls = 0;
    let passingControls = 0;
    for (const fw of frameworks) {
      const controls = await this.db.select().from(complianceControls).where(eq(complianceControls.frameworkDbId, fw.id));
      totalControls += controls.length;
      passingControls += controls.filter((c) => c.status === "passing").length;
    }

    return {
      agentCount: Number(agentCount?.count ?? 0),
      policyCount: Number(policyCount?.count ?? 0),
      auditLogCount: Number(auditCount?.count ?? 0),
      anomalyCount: Number(anomalyCount?.count ?? 0),
      a2aChannelCount: Number(channelCount?.count ?? 0),
      apiKeyCount: Number(keyCount?.count ?? 0),
      frameworkNames,
      frameworkCount: frameworks.length,
      totalControls,
      passingControls,
      complianceScore: totalControls > 0 ? Math.round((passingControls / totalControls) * 100) : 0,
    };
  }

  private answerQuestion(q: QuestionnaireQuestion, state: ReturnType<QuestionnaireService["gatherState"]> extends Promise<infer T> ? T : never): QuestionnaireAnswer {
    const lower = q.question.toLowerCase();
    const matched = this.matchCategories(lower);
    const evidence: string[] = [];
    const controlRefs: string[] = [];
    let answer = "";
    let confidence: "high" | "medium" | "low" = "medium";

    if (matched.includes("identity") || matched.includes("agents")) {
      answer += `AgentGate manages ${state.agentCount} registered AI agents, each with a unique UUIDv7 identity, lifecycle status tracking, risk-level classification, and capability declarations. `;
      evidence.push(`${state.agentCount} registered agents`);
      controlRefs.push("CC6.1", "IA.L2-3.5.1");
      confidence = state.agentCount > 0 ? "high" : "low";
    }

    if (matched.includes("access_control") || matched.includes("policy")) {
      answer += `Access is governed by ${state.policyCount} granular policies with condition-based rules (allow/deny/escalate), target scoping by agent, resource, and action. All authorization decisions are evaluated in real-time by our policy engine. `;
      evidence.push(`${state.policyCount} active policies`);
      controlRefs.push("CC6.2", "A.5.1", "Art.5");
      confidence = state.policyCount > 0 ? "high" : "low";
    }

    if (matched.includes("audit")) {
      answer += `We maintain an append-only audit trail with ${state.auditLogCount} entries, recording every agent action, resource accessed, authorization decision, policy applied, and response time. Logs are immutable and queryable. `;
      evidence.push(`${state.auditLogCount} audit log entries`);
      controlRefs.push("CC7.1", "AU.L2-3.3.1", "Art.30");
      confidence = state.auditLogCount > 0 ? "high" : "medium";
    }

    if (matched.includes("monitoring") || matched.includes("incident")) {
      answer += `Real-time anomaly detection monitors all agent behavior with 6 detection types: burst activity, high deny rate, unusual actions, unusual resources, unusual timing, and permission escalation. ${state.anomalyCount} anomalies have been detected and tracked. `;
      evidence.push(`${state.anomalyCount} anomalies detected`, "6 anomaly detection types");
      controlRefs.push("CC7.2", "Art.9");
      confidence = state.anomalyCount > 0 ? "high" : "medium";
    }

    if (matched.includes("encryption")) {
      answer += "All data is encrypted in transit using TLS 1.2+ and API keys are stored as SHA-256 hashes. Session tokens use cryptographic hashing. Database connections use SSL. ";
      evidence.push("TLS encryption", "SHA-256 key hashing");
      controlRefs.push("CC8.1", "A.8.24");
      confidence = "high";
    }

    if (matched.includes("a2a")) {
      answer += `Agent-to-agent communication is governed through ${state.a2aChannelCount} defined channels, each with allowed actions, data types, and rate limits. All inter-agent requests are logged. `;
      evidence.push(`${state.a2aChannelCount} A2A channels`);
      controlRefs.push("CC9.1", "Req.1");
      confidence = state.a2aChannelCount > 0 ? "high" : "low";
    }

    if (matched.includes("compliance")) {
      answer += `AgentGate maintains compliance across ${state.frameworkCount} frameworks (${state.frameworkNames.join(", ")}), with ${state.passingControls} of ${state.totalControls} controls passing (${state.complianceScore}% overall score). Continuous automated evaluation, evidence collection, gap analysis, and remediation recommendations are available. `;
      evidence.push(`${state.frameworkCount} frameworks`, `${state.complianceScore}% compliance score`);
      confidence = state.frameworkCount > 0 ? "high" : "low";
    }

    if (matched.includes("data")) {
      answer += "Data classification and access controls are enforced through policy rules. Agents are scoped to specific resources and actions. Sensitive data access requires explicit policy authorization and is fully audited. ";
      evidence.push("Policy-based data access control");
      controlRefs.push("Art.5", "Req.7", "§164.312(a)");
      confidence = "medium";
    }

    // Fallback for unmatched
    if (!answer) {
      answer = `AgentGate is an AI agent identity and permissions platform managing ${state.agentCount} agents with ${state.policyCount} policies, ${state.auditLogCount} audit log entries, compliance across ${state.frameworkCount} frameworks, and real-time anomaly detection. For specific details on this topic, please contact our security team.`;
      confidence = "low";
    }

    return {
      questionId: q.id,
      question: q.question,
      answer: answer.trim(),
      confidence,
      supportingEvidence: evidence,
      controlReferences: [...new Set(controlRefs)],
    };
  }

  private matchCategories(text: string): string[] {
    const matched: string[] = [];
    for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
      if (keywords.some((kw) => text.includes(kw))) {
        matched.push(category);
      }
    }
    return matched;
  }

  private formatResponse(row: typeof questionnaireResponses.$inferSelect): QuestionnaireResponse {
    return {
      id: row.id,
      tenantId: row.tenantId,
      questionnaireTitle: row.questionnaireTitle,
      questions: row.questions,
      responses: row.responses,
      status: row.status,
      generatedAt: row.generatedAt?.toISOString() ?? "",
      updatedAt: row.updatedAt?.toISOString() ?? "",
    };
  }
}
