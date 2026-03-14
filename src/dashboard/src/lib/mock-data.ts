import type { AgentIdentity, Policy, AuditEntry } from "@agentgate/shared";
import type { AuditStats, Anomaly, AnomalyStats, A2AGraph, A2AChannel, A2AStats, Plan, Subscription, TenantUsage, ApiKey, TenantUser, SSOConnection, SSOSession, SCIMToken, SCIMGroup, AuditorInvitation, AuditorAccessLog, RemediationRecommendation, PolicySuggestion, PolicyTemplate } from "./api";

export const mockAgents: AgentIdentity[] = [
  {
    id: "019577a0-0000-7000-8000-000000000001",
    name: "code-review-bot",
    description: "Automated code review agent for pull requests",
    ownerId: "team-platform",
    status: "active",
    riskLevel: "medium",
    capabilities: ["read:repos", "write:comments", "read:pull-requests"],
    metadata: { provider: "github" },
    createdAt: "2026-02-15T10:00:00Z",
    updatedAt: "2026-03-08T14:30:00Z",
    lastActiveAt: "2026-03-10T09:15:00Z",
  },
  {
    id: "019577a0-0000-7000-8000-000000000002",
    name: "deploy-agent",
    description: "CI/CD deployment automation agent",
    ownerId: "team-devops",
    status: "active",
    riskLevel: "high",
    capabilities: ["deploy:production", "read:configs", "write:logs"],
    metadata: { provider: "internal" },
    createdAt: "2026-01-20T08:00:00Z",
    updatedAt: "2026-03-09T11:00:00Z",
    lastActiveAt: "2026-03-10T08:45:00Z",
  },
  {
    id: "019577a0-0000-7000-8000-000000000003",
    name: "data-scraper-v2",
    description: "Web scraping agent for market data",
    ownerId: "team-data",
    status: "suspended",
    riskLevel: "critical",
    capabilities: ["read:external", "write:database"],
    metadata: { reason: "rate-limit-exceeded" },
    createdAt: "2026-02-01T12:00:00Z",
    updatedAt: "2026-03-07T16:00:00Z",
    lastActiveAt: "2026-03-07T15:59:00Z",
  },
  {
    id: "019577a0-0000-7000-8000-000000000004",
    name: "customer-support-ai",
    description: "Customer support chatbot agent",
    ownerId: "team-support",
    status: "active",
    riskLevel: "low",
    capabilities: ["read:tickets", "write:responses", "read:knowledge-base"],
    metadata: { model: "gpt-4" },
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-03-10T07:00:00Z",
    lastActiveAt: "2026-03-10T10:30:00Z",
  },
  {
    id: "019577a0-0000-7000-8000-000000000005",
    name: "legacy-sync-agent",
    description: "Legacy system data synchronization",
    ownerId: "team-platform",
    status: "revoked",
    riskLevel: "medium",
    capabilities: ["read:legacy-db", "write:new-db"],
    metadata: {},
    createdAt: "2025-11-10T14:00:00Z",
    updatedAt: "2026-02-28T10:00:00Z",
    lastActiveAt: null,
  },
];

export const mockPolicies: Policy[] = [
  {
    id: "pol-001",
    name: "Production Deploy Guard",
    description: "Requires high-trust agents for production deployments",
    version: 3,
    rules: [
      {
        id: "rule-001",
        name: "Block critical risk",
        effect: "deny",
        priority: 1,
        conditions: [
          { field: "agent.riskLevel", operator: "equals", value: "critical" },
        ],
      },
      {
        id: "rule-002",
        name: "Escalate high risk",
        effect: "escalate",
        priority: 2,
        conditions: [
          { field: "agent.riskLevel", operator: "equals", value: "high" },
        ],
      },
    ],
    targets: {
      actions: ["deploy:production"],
      resources: ["infra:*"],
    },
    enabled: true,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-03-05T14:30:00Z",
  },
  {
    id: "pol-002",
    name: "Data Access Policy",
    description: "Controls access to sensitive customer data stores",
    version: 1,
    rules: [
      {
        id: "rule-003",
        name: "Allow read for low risk",
        effect: "allow",
        priority: 1,
        conditions: [
          { field: "agent.riskLevel", operator: "in", value: ["low", "medium"] },
          { field: "action", operator: "equals", value: "read" },
        ],
      },
      {
        id: "rule-004",
        name: "Deny write for all",
        effect: "deny",
        priority: 2,
        conditions: [
          { field: "action", operator: "equals", value: "write" },
        ],
      },
    ],
    targets: {
      resources: ["data:customers:*"],
      agentTags: ["data-team"],
    },
    enabled: true,
    createdAt: "2026-02-20T08:00:00Z",
    updatedAt: "2026-03-08T09:00:00Z",
  },
  {
    id: "pol-003",
    name: "External API Rate Limit",
    description: "Prevents agents from exceeding external API rate limits",
    version: 2,
    rules: [
      {
        id: "rule-005",
        name: "Throttle all external",
        effect: "escalate",
        priority: 1,
        conditions: [
          { field: "resource", operator: "matches", value: "^external:.*" },
        ],
      },
    ],
    targets: {
      actions: ["read:external", "write:external"],
    },
    enabled: false,
    createdAt: "2026-02-10T12:00:00Z",
    updatedAt: "2026-03-01T16:00:00Z",
  },
];

export const mockAuditEntries: AuditEntry[] = [
  {
    id: "aud-001",
    agentId: "019577a0-0000-7000-8000-000000000001",
    action: "read:pull-requests",
    resource: "repos/agentgate/main",
    decision: "allow",
    policyId: null,
    context: {},
    timestamp: "2026-03-10T10:30:00Z",
    durationMs: 2,
  },
  {
    id: "aud-002",
    agentId: "019577a0-0000-7000-8000-000000000002",
    action: "deploy:production",
    resource: "infra:k8s:prod-cluster",
    decision: "escalate",
    policyId: "pol-001",
    context: { environment: "production" },
    timestamp: "2026-03-10T10:28:00Z",
    durationMs: 5,
  },
  {
    id: "aud-003",
    agentId: "019577a0-0000-7000-8000-000000000003",
    action: "read:external",
    resource: "external:market-api",
    decision: "deny",
    policyId: "pol-003",
    context: { reason: "agent-suspended" },
    timestamp: "2026-03-10T10:25:00Z",
    durationMs: 1,
  },
  {
    id: "aud-004",
    agentId: "019577a0-0000-7000-8000-000000000004",
    action: "read:knowledge-base",
    resource: "data:kb:articles",
    decision: "allow",
    policyId: null,
    context: {},
    timestamp: "2026-03-10T10:22:00Z",
    durationMs: 3,
  },
  {
    id: "aud-005",
    agentId: "019577a0-0000-7000-8000-000000000004",
    action: "write:responses",
    resource: "tickets:TK-4521",
    decision: "allow",
    policyId: "pol-002",
    context: { ticketId: "TK-4521" },
    timestamp: "2026-03-10T10:20:00Z",
    durationMs: 4,
  },
  {
    id: "aud-006",
    agentId: "019577a0-0000-7000-8000-000000000002",
    action: "read:configs",
    resource: "infra:configs:prod",
    decision: "allow",
    policyId: null,
    context: {},
    timestamp: "2026-03-10T10:15:00Z",
    durationMs: 2,
  },
  {
    id: "aud-007",
    agentId: "019577a0-0000-7000-8000-000000000003",
    action: "write:database",
    resource: "data:customers:records",
    decision: "deny",
    policyId: "pol-002",
    context: { reason: "write-blocked" },
    timestamp: "2026-03-10T10:10:00Z",
    durationMs: 1,
  },
  {
    id: "aud-008",
    agentId: "019577a0-0000-7000-8000-000000000001",
    action: "write:comments",
    resource: "repos/agentgate/pr/42",
    decision: "allow",
    policyId: null,
    context: { prNumber: 42 },
    timestamp: "2026-03-10T10:05:00Z",
    durationMs: 3,
  },
  {
    id: "aud-009",
    agentId: "019577a0-0000-7000-8000-000000000002",
    action: "deploy:production",
    resource: "infra:k8s:staging",
    decision: "allow",
    policyId: "pol-001",
    context: { environment: "staging" },
    timestamp: "2026-03-10T09:55:00Z",
    durationMs: 6,
  },
  {
    id: "aud-010",
    agentId: "019577a0-0000-7000-8000-000000000004",
    action: "read:tickets",
    resource: "tickets:queue:support",
    decision: "allow",
    policyId: null,
    context: {},
    timestamp: "2026-03-10T09:50:00Z",
    durationMs: 2,
  },
  {
    id: "aud-011",
    agentId: "019577a0-0000-7000-8000-000000000003",
    action: "read:external",
    resource: "external:stock-api",
    decision: "deny",
    policyId: "pol-003",
    context: { reason: "rate-limit" },
    timestamp: "2026-03-10T09:45:00Z",
    durationMs: 1,
  },
  {
    id: "aud-012",
    agentId: "019577a0-0000-7000-8000-000000000001",
    action: "read:repos",
    resource: "repos/agentgate/src",
    decision: "allow",
    policyId: null,
    context: {},
    timestamp: "2026-03-10T09:40:00Z",
    durationMs: 2,
  },
];

export const mockAuditStats: AuditStats = {
  totalDecisions: 1247,
  allowCount: 1089,
  denyCount: 112,
  escalateCount: 46,
  avgDurationMs: 3.2,
};

// ─── Anomalies ──────────────────────────────────────────────────────

export const mockAnomalies: Anomaly[] = [
  {
    id: "anom-1",
    agentId: "agent-1",
    type: "burst_activity",
    severity: "high",
    description: "Agent exceeded 5x normal request rate in 5-minute window",
    details: { requestCount: 340, normalRate: 45 },
    detectedAt: "2026-03-10T19:30:00Z",
    resolved: false,
  },
  {
    id: "anom-2",
    agentId: "agent-3",
    type: "unusual_resource",
    severity: "medium",
    description: "Agent accessed resource pattern not seen in baseline behavior",
    details: { resource: "pii/employee-records", commonPatterns: ["analytics/*"] },
    detectedAt: "2026-03-10T18:45:00Z",
    resolved: false,
  },
  {
    id: "anom-3",
    agentId: "agent-2",
    type: "permission_escalation",
    severity: "critical",
    description: "Agent attempted to access admin resources after only accessing read-only resources",
    details: { attemptedResource: "admin/settings", previousPattern: "repos/*/read" },
    detectedAt: "2026-03-10T17:20:00Z",
    resolved: true,
  },
  {
    id: "anom-4",
    agentId: "agent-4",
    type: "unusual_time",
    severity: "low",
    description: "Agent active outside normal operating hours",
    details: { currentHour: 3, normalHours: [9, 10, 11, 12, 13, 14, 15, 16, 17] },
    detectedAt: "2026-03-10T03:15:00Z",
    resolved: false,
  },
  {
    id: "anom-5",
    agentId: "agent-1",
    type: "high_deny_rate",
    severity: "medium",
    description: "Agent deny rate spiked to 65% (baseline: 12%)",
    details: { currentDenyRate: 0.65, baselineDenyRate: 0.12 },
    detectedAt: "2026-03-10T16:00:00Z",
    resolved: false,
  },
];

export const mockAnomalyStats: AnomalyStats = {
  total: 23,
  byType: {
    burst_activity: 5,
    unusual_resource: 7,
    permission_escalation: 2,
    unusual_time: 4,
    high_deny_rate: 3,
    unusual_action: 2,
  },
  bySeverity: { critical: 2, high: 5, medium: 9, low: 7 },
  unresolvedCount: 18,
};

// ─── A2A ────────────────────────────────────────────────────────────

export const mockA2AGraph: A2AGraph = {
  nodes: [
    { agentId: "agent-1", agentName: "Customer Support Bot", incomingCount: 5, outgoingCount: 12 },
    { agentId: "agent-2", agentName: "Code Review Agent", incomingCount: 8, outgoingCount: 3 },
    { agentId: "agent-3", agentName: "Data Pipeline Agent", incomingCount: 15, outgoingCount: 7 },
    { agentId: "agent-4", agentName: "Sales Outreach Agent", incomingCount: 2, outgoingCount: 9 },
    { agentId: "agent-5", agentName: "Internal Wiki Agent", incomingCount: 10, outgoingCount: 1 },
  ],
  edges: [
    { source: "agent-1", target: "agent-5", requestCount: 45, lastCommunication: "2026-03-10T19:30:00Z", status: "active" },
    { source: "agent-3", target: "agent-1", requestCount: 23, lastCommunication: "2026-03-10T19:15:00Z", status: "active" },
    { source: "agent-4", target: "agent-1", requestCount: 12, lastCommunication: "2026-03-10T18:45:00Z", status: "active" },
    { source: "agent-2", target: "agent-3", requestCount: 8, lastCommunication: "2026-03-10T17:00:00Z", status: "blocked" },
    { source: "agent-1", target: "agent-3", requestCount: 34, lastCommunication: "2026-03-10T19:20:00Z", status: "active" },
    { source: "agent-4", target: "agent-3", requestCount: 5, lastCommunication: "2026-03-10T16:30:00Z", status: "active" },
  ],
};

export const mockA2AChannels: A2AChannel[] = [
  {
    id: "ch-1",
    sourceAgentId: "agent-1",
    targetAgentId: "agent-5",
    allowedActions: ["read:knowledge-base", "search:articles"],
    rateLimit: 100,
    enabled: true,
    lastCommunication: "2026-03-10T19:30:00Z",
  },
  {
    id: "ch-2",
    sourceAgentId: "agent-3",
    targetAgentId: "agent-1",
    allowedActions: ["write:tickets", "read:responses"],
    rateLimit: 50,
    enabled: true,
    lastCommunication: "2026-03-10T19:15:00Z",
  },
  {
    id: "ch-3",
    sourceAgentId: "agent-4",
    targetAgentId: "agent-1",
    allowedActions: ["read:customer-data"],
    rateLimit: 30,
    enabled: true,
    lastCommunication: "2026-03-10T18:45:00Z",
  },
  {
    id: "ch-4",
    sourceAgentId: "agent-2",
    targetAgentId: "agent-3",
    allowedActions: ["trigger:pipeline", "read:status"],
    rateLimit: 20,
    enabled: false,
    lastCommunication: "2026-03-10T17:00:00Z",
  },
  {
    id: "ch-5",
    sourceAgentId: "agent-1",
    targetAgentId: "agent-3",
    allowedActions: ["submit:data", "read:results"],
    rateLimit: 75,
    enabled: true,
    lastCommunication: "2026-03-10T19:20:00Z",
  },
  {
    id: "ch-6",
    sourceAgentId: "agent-4",
    targetAgentId: "agent-3",
    allowedActions: ["read:analytics"],
    rateLimit: 40,
    enabled: true,
    lastCommunication: "2026-03-10T16:30:00Z",
  },
];

export const mockA2AStats: A2AStats = {
  activeChannels: 5,
  totalCommunications24h: 127,
  blockedChannels: 1,
};

// ─── Billing & Settings ─────────────────────────────────────────────

export const mockPlans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "monthly",
    agentLimit: 5,
    evalLimit: 10000,
    features: ["5 agents", "10K evaluations/mo", "Community support", "JS & Python SDKs"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 499,
    interval: "monthly",
    agentLimit: -1,
    evalLimit: 1000000,
    features: ["Unlimited agents", "1M evaluations/mo", "All integrations", "Anomaly detection", "Priority support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 0,
    interval: "monthly",
    agentLimit: -1,
    evalLimit: -1,
    features: ["Unlimited everything", "On-premise deployment", "SSO/SAML", "Custom SLAs", "Dedicated CSM", "Compliance module"],
  },
];

export const mockSubscription: Subscription = {
  id: "sub-1",
  tenantId: "tenant-1",
  plan: "pro",
  status: "active",
  currentPeriodStart: "2026-03-01T00:00:00Z",
  currentPeriodEnd: "2026-04-01T00:00:00Z",
  cancelAtPeriodEnd: false,
};

export const mockUsage: TenantUsage = {
  tenantId: "tenant-1",
  agentCount: 5,
  agentLimit: -1,
  evalCountThisMonth: 45230,
  evalLimitPerMonth: 1000000,
  periodStart: "2026-03-01T00:00:00Z",
  periodEnd: "2026-04-01T00:00:00Z",
};

export const mockApiKeys: ApiKey[] = [
  { id: "key-1", name: "Production API Key", keyPrefix: "ag_live_a1b2", scopes: ["*"], ownerId: "admin", createdAt: "2026-02-15T00:00:00Z", lastUsedAt: "2026-03-10T19:30:00Z", revoked: false },
  { id: "key-2", name: "Development Key", keyPrefix: "ag_live_c3d4", scopes: ["*"], ownerId: "admin", createdAt: "2026-03-01T00:00:00Z", lastUsedAt: "2026-03-10T18:00:00Z", revoked: false },
  { id: "key-3", name: "CI/CD Pipeline", keyPrefix: "ag_live_e5f6", scopes: ["authorize"], ownerId: "ci-bot", createdAt: "2026-03-05T00:00:00Z", lastUsedAt: null, revoked: true },
];

export const mockTenantUsers: TenantUser[] = [
  { id: "user-1", tenantId: "tenant-1", email: "admin@company.com", name: "Admin User", role: "owner", createdAt: "2026-02-01T00:00:00Z", lastLoginAt: "2026-03-10T19:00:00Z" },
  { id: "user-2", tenantId: "tenant-1", email: "dev@company.com", name: "Dev Engineer", role: "admin", createdAt: "2026-02-10T00:00:00Z", lastLoginAt: "2026-03-10T17:00:00Z" },
  { id: "user-3", tenantId: "tenant-1", email: "auditor@company.com", name: "Security Auditor", role: "auditor", createdAt: "2026-03-01T00:00:00Z", lastLoginAt: "2026-03-09T10:00:00Z" },
];

// ─── Compliance ─────────────────────────────────────────────────

export interface MockFramework {
  id: string;
  frameworkId: string;
  name: string;
  version: string;
  description: string;
  totalControls: number;
  passingControls: number;
  failingControls: number;
  warningControls: number;
  complianceScore: number;
  lastEvaluatedAt: string;
  enabled: boolean;
  createdAt: string;
}

export interface MockControl {
  id: string;
  frameworkId: string;
  controlCode: string;
  title: string;
  description: string;
  category: string;
  status: string;
  severity: string;
  evidenceCount: number;
  lastEvaluatedAt: string;
  automatable: boolean;
}

export interface MockRegulatoryUpdate {
  id: string;
  frameworkId: string;
  title: string;
  description: string;
  effectiveDate: string;
  impactLevel: string;
  affectedControls: string[];
  source: string;
  publishedAt: string;
  acknowledged: boolean;
}

export const mockFrameworks: MockFramework[] = [
  {
    id: "fw-1", frameworkId: "soc2", name: "SOC 2 Type II", version: "2024",
    description: "Service Organization Control 2 — Trust Services Criteria",
    totalControls: 8, passingControls: 6, failingControls: 1, warningControls: 1,
    complianceScore: 82, lastEvaluatedAt: "2026-03-10T18:00:00Z", enabled: true, createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "fw-2", frameworkId: "gdpr", name: "GDPR", version: "2024",
    description: "General Data Protection Regulation — EU data privacy",
    totalControls: 7, passingControls: 5, failingControls: 1, warningControls: 1,
    complianceScore: 74, lastEvaluatedAt: "2026-03-10T18:00:00Z", enabled: true, createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "fw-3", frameworkId: "hipaa", name: "HIPAA", version: "2024",
    description: "Health Insurance Portability and Accountability Act",
    totalControls: 6, passingControls: 4, failingControls: 1, warningControls: 1,
    complianceScore: 68, lastEvaluatedAt: "2026-03-10T18:00:00Z", enabled: true, createdAt: "2026-02-10T10:00:00Z",
  },
  {
    id: "fw-4", frameworkId: "iso27001", name: "ISO 27001:2022", version: "2022",
    description: "Information Security Management System standard",
    totalControls: 8, passingControls: 5, failingControls: 2, warningControls: 1,
    complianceScore: 71, lastEvaluatedAt: "2026-03-10T18:00:00Z", enabled: false, createdAt: "2026-02-20T10:00:00Z",
  },
  {
    id: "fw-5", frameworkId: "hitrust_csf", name: "HITRUST CSF", version: "11.3",
    description: "HITRUST Common Security Framework for AI agent operations",
    totalControls: 7, passingControls: 5, failingControls: 1, warningControls: 1,
    complianceScore: 71, lastEvaluatedAt: "2026-03-10T18:00:00Z", enabled: false, createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "fw-6", frameworkId: "cmmc_2", name: "CMMC 2.0", version: "2.0",
    description: "Cybersecurity Maturity Model Certification for DoD AI agents",
    totalControls: 7, passingControls: 4, failingControls: 2, warningControls: 1,
    complianceScore: 57, lastEvaluatedAt: "2026-03-10T18:00:00Z", enabled: false, createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "fw-7", frameworkId: "nis2", name: "NIS2 Directive", version: "2024",
    description: "EU Network and Information Security Directive 2",
    totalControls: 6, passingControls: 4, failingControls: 1, warningControls: 1,
    complianceScore: 67, lastEvaluatedAt: "2026-03-10T18:00:00Z", enabled: false, createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "fw-8", frameworkId: "dora", name: "DORA", version: "2025",
    description: "Digital Operational Resilience Act for financial sector AI",
    totalControls: 6, passingControls: 4, failingControls: 1, warningControls: 1,
    complianceScore: 67, lastEvaluatedAt: "2026-03-10T18:00:00Z", enabled: false, createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "fw-9", frameworkId: "cyber_essentials", name: "Cyber Essentials", version: "2024",
    description: "UK baseline security controls for AI agent infrastructure",
    totalControls: 5, passingControls: 3, failingControls: 1, warningControls: 1,
    complianceScore: 60, lastEvaluatedAt: "2026-03-10T18:00:00Z", enabled: false, createdAt: "2026-03-01T10:00:00Z",
  },
];

export const mockComplianceControls: MockControl[] = [
  { id: "ctrl-1", frameworkId: "soc2", controlCode: "CC6.1", title: "Agent Identity Management", description: "All AI agents are registered with unique identities", category: "Logical Access", status: "passing", severity: "high", evidenceCount: 3, lastEvaluatedAt: "2026-03-10T18:00:00Z", automatable: true },
  { id: "ctrl-2", frameworkId: "soc2", controlCode: "CC6.2", title: "Access Control Policies", description: "Granular policies govern agent permissions", category: "Logical Access", status: "passing", severity: "high", evidenceCount: 2, lastEvaluatedAt: "2026-03-10T18:00:00Z", automatable: true },
  { id: "ctrl-3", frameworkId: "soc2", controlCode: "CC6.3", title: "Authentication Controls", description: "API key auth with SHA-256 hashing", category: "Logical Access", status: "passing", severity: "critical", evidenceCount: 4, lastEvaluatedAt: "2026-03-10T18:00:00Z", automatable: true },
  { id: "ctrl-4", frameworkId: "soc2", controlCode: "CC7.1", title: "Audit Logging", description: "All agent actions logged with full context", category: "Monitoring", status: "passing", severity: "critical", evidenceCount: 5, lastEvaluatedAt: "2026-03-10T18:00:00Z", automatable: true },
  { id: "ctrl-5", frameworkId: "soc2", controlCode: "CC7.2", title: "Anomaly Detection", description: "Automated detection of unusual agent behavior", category: "Monitoring", status: "passing", severity: "high", evidenceCount: 2, lastEvaluatedAt: "2026-03-10T18:00:00Z", automatable: true },
  { id: "ctrl-6", frameworkId: "soc2", controlCode: "CC7.3", title: "Incident Response", description: "Automated agent suspension on critical anomalies", category: "Monitoring", status: "warning", severity: "high", evidenceCount: 1, lastEvaluatedAt: "2026-03-10T18:00:00Z", automatable: false },
  { id: "ctrl-7", frameworkId: "soc2", controlCode: "CC8.1", title: "Data Encryption", description: "All data encrypted in transit and at rest", category: "Encryption", status: "passing", severity: "critical", evidenceCount: 2, lastEvaluatedAt: "2026-03-10T18:00:00Z", automatable: true },
  { id: "ctrl-8", frameworkId: "soc2", controlCode: "CC9.1", title: "Third-Party Risk Assessment", description: "External integrations assessed for security", category: "Vendor Management", status: "failing", severity: "high", evidenceCount: 0, lastEvaluatedAt: "2026-03-10T18:00:00Z", automatable: false },
  // GDPR controls
  { id: "ctrl-9", frameworkId: "gdpr", controlCode: "Art.5", title: "Data Processing Principles", description: "Agents process data lawfully and transparently", category: "Principles", status: "passing", severity: "critical", evidenceCount: 3, lastEvaluatedAt: "2026-03-10T18:00:00Z", automatable: true },
  { id: "ctrl-10", frameworkId: "gdpr", controlCode: "Art.22", title: "Automated Decision-Making", description: "Human oversight for significant agent decisions", category: "Data Subject Rights", status: "passing", severity: "high", evidenceCount: 2, lastEvaluatedAt: "2026-03-10T18:00:00Z", automatable: true },
  { id: "ctrl-11", frameworkId: "gdpr", controlCode: "Art.25", title: "Privacy by Design", description: "Privacy-by-design in agent architecture", category: "Controller Obligations", status: "passing", severity: "high", evidenceCount: 1, lastEvaluatedAt: "2026-03-10T18:00:00Z", automatable: true },
  { id: "ctrl-12", frameworkId: "gdpr", controlCode: "Art.30", title: "Records of Processing", description: "Records of all agent data processing", category: "Controller Obligations", status: "passing", severity: "high", evidenceCount: 4, lastEvaluatedAt: "2026-03-10T18:00:00Z", automatable: true },
  { id: "ctrl-13", frameworkId: "gdpr", controlCode: "Art.32", title: "Security of Processing", description: "Appropriate security measures for data handling", category: "Security", status: "passing", severity: "critical", evidenceCount: 3, lastEvaluatedAt: "2026-03-10T18:00:00Z", automatable: true },
  { id: "ctrl-14", frameworkId: "gdpr", controlCode: "Art.33", title: "Breach Notification", description: "Detect and report breaches within 72 hours", category: "Breach", status: "warning", severity: "critical", evidenceCount: 1, lastEvaluatedAt: "2026-03-10T18:00:00Z", automatable: true },
  { id: "ctrl-15", frameworkId: "gdpr", controlCode: "Art.35", title: "Data Protection Impact Assessment", description: "DPIA for high-risk agent processing", category: "Impact Assessment", status: "failing", severity: "high", evidenceCount: 0, lastEvaluatedAt: "2026-03-10T18:00:00Z", automatable: false },
];

export const mockRegulatoryUpdates: MockRegulatoryUpdate[] = [
  { id: "reg-1", frameworkId: "eu_ai_act", title: "EU AI Act — High-Risk AI Systems Requirements", description: "New requirements for AI agent transparency and human oversight take effect.", effectiveDate: "2026-08-01T00:00:00Z", impactLevel: "high", affectedControls: ["Art.9", "Art.14"], source: "Official Journal of the EU", publishedAt: "2026-02-15T00:00:00Z", acknowledged: false },
  { id: "reg-2", frameworkId: "gdpr", title: "GDPR — Updated Guidance on AI Decision-Making", description: "European Data Protection Board issues guidance on automated decision-making by AI agents.", effectiveDate: "2026-06-01T00:00:00Z", impactLevel: "medium", affectedControls: ["Art.22", "Art.35"], source: "EDPB Guidelines", publishedAt: "2026-01-20T00:00:00Z", acknowledged: true },
  { id: "reg-3", frameworkId: "soc2", title: "AICPA — AI Agent Trust Services Criteria Supplement", description: "New supplemental criteria for organizations using AI agents in service delivery.", effectiveDate: "2026-07-01T00:00:00Z", impactLevel: "medium", affectedControls: ["CC6.1", "CC6.2", "CC7.1"], source: "AICPA", publishedAt: "2026-03-01T00:00:00Z", acknowledged: false },
];

export const mockRemediations: RemediationRecommendation[] = [
  {
    id: "rem-1",
    controlId: "ctrl-8",
    frameworkId: "soc2",
    source: "template",
    summary: "Configure agent-to-agent communication channels",
    steps: [
      { order: 1, title: "Navigate to A2A page", description: "Go to the A2A Governance section in the dashboard", actionType: "configure", actionTarget: "/a2a", completed: false },
      { order: 2, title: "Define communication channels", description: "Create channels between agent pairs with allowed actions and data types", actionType: "create", actionTarget: "a2a.channels", completed: false },
      { order: 3, title: "Set rate limits", description: "Configure appropriate rate limits for each channel to prevent abuse", actionType: "configure", actionTarget: "channel.rateLimit", completed: false },
    ],
    estimatedEffort: "low",
    status: "pending",
    createdAt: "2026-03-10T18:00:00Z",
    updatedAt: "2026-03-10T18:00:00Z",
  },
  {
    id: "rem-2",
    controlId: "ctrl-6",
    frameworkId: "soc2",
    source: "template",
    summary: "Manual assessment required — document procedures and schedule review",
    steps: [
      { order: 1, title: "Document current procedures", description: "Write down existing processes and controls for this requirement", actionType: "manual", completed: true },
      { order: 2, title: "Schedule review meeting", description: "Set up a review meeting with the compliance team", actionType: "manual", completed: false },
      { order: 3, title: "Collect supporting evidence", description: "Gather documentation, screenshots, and artifacts", actionType: "manual", completed: false },
      { order: 4, title: "Submit evidence", description: "Upload collected evidence to the compliance evidence store", actionType: "create", actionTarget: "evidence", completed: false },
    ],
    estimatedEffort: "high",
    status: "in_progress",
    createdAt: "2026-03-09T10:00:00Z",
    updatedAt: "2026-03-10T14:00:00Z",
  },
  {
    id: "rem-3",
    controlId: "ctrl-15",
    frameworkId: "gdpr",
    source: "template",
    summary: "Manual assessment required — document procedures and schedule review",
    steps: [
      { order: 1, title: "Document current procedures", description: "Write down existing DPIA processes", actionType: "manual", completed: false },
      { order: 2, title: "Schedule review meeting", description: "Set up a review with the data protection officer", actionType: "manual", completed: false },
      { order: 3, title: "Collect supporting evidence", description: "Gather DPIA documentation and risk assessments", actionType: "manual", completed: false },
      { order: 4, title: "Submit evidence", description: "Upload collected evidence to the compliance evidence store", actionType: "create", actionTarget: "evidence", completed: false },
    ],
    estimatedEffort: "high",
    status: "pending",
    createdAt: "2026-03-10T18:00:00Z",
    updatedAt: "2026-03-10T18:00:00Z",
  },
];

export const mockPolicySuggestions: PolicySuggestion[] = [
  {
    id: "ps-1",
    regulatoryUpdateId: "reg-1",
    policyId: "pol-001",
    policyName: "Production Deploy Guard",
    suggestionType: "modify",
    description: "Add escalation rules to \"Production Deploy Guard\" for high-risk agents in response to: EU AI Act — High-Risk AI Systems Requirements",
    suggestedChanges: {
      rulesToAdd: [{
        name: "Compliance: Escalate high-risk (eu_ai_act)",
        effect: "escalate",
        priority: 0,
        conditions: [{ field: "agent.riskLevel", operator: "in", value: ["high", "critical"] }],
      }],
    },
    impactLevel: "high",
    status: "pending",
    reviewedBy: null,
    reviewedAt: null,
    appliedPolicyVersion: null,
    createdAt: "2026-03-10T19:00:00Z",
  },
  {
    id: "ps-2",
    regulatoryUpdateId: "reg-3",
    policyId: "pol-002",
    policyName: "Data Access Policy",
    suggestionType: "modify",
    description: "Update \"Data Access Policy\" to add monitoring conditions for compliance with: AICPA — AI Agent Trust Services Criteria Supplement",
    suggestedChanges: {
      rulesToAdd: [{
        name: "Compliance: Monitor (soc2)",
        effect: "escalate",
        priority: 5,
        conditions: [{ field: "agent.riskLevel", operator: "equals", value: "critical" }],
      }],
    },
    impactLevel: "medium",
    status: "approved",
    reviewedBy: "admin@company.com",
    reviewedAt: "2026-03-10T20:00:00Z",
    appliedPolicyVersion: null,
    createdAt: "2026-03-10T19:30:00Z",
  },
  {
    id: "ps-3",
    regulatoryUpdateId: "reg-2",
    policyId: null,
    policyName: "Compliance: GDPR — Updated Guidance on AI Decision-Making",
    suggestionType: "create",
    description: "No existing policies cover the affected controls. Create a new compliance policy to address: Art.22, Art.35",
    suggestedChanges: {
      newPolicy: {
        name: "Compliance: GDPR AI Decision-Making",
        description: "Auto-suggested policy for GDPR automated decision-making guidance",
        rules: [{ name: "Escalate high-risk agents", effect: "escalate", priority: 1, conditions: [{ field: "agent.riskLevel", operator: "in", value: ["high", "critical"] }] }],
        targets: { resources: ["*"], actions: ["*"] },
      },
    },
    impactLevel: "medium",
    status: "pending",
    reviewedBy: null,
    reviewedAt: null,
    appliedPolicyVersion: null,
    createdAt: "2026-03-10T19:00:00Z",
  },
];

export const mockScoreHistory = [
  { date: "2026-01-15", score: 45 },
  { date: "2026-01-30", score: 52 },
  { date: "2026-02-15", score: 61 },
  { date: "2026-02-28", score: 68 },
  { date: "2026-03-10", score: 82 },
];

// ─── SSO ──────────────────────────────────────────────────────────

export const mockSSOConnections: SSOConnection[] = [
  {
    id: "sso-1",
    tenantId: "tenant-1",
    provider: "okta",
    protocol: "saml",
    enabled: true,
    enforced: false,
    defaultRole: "member",
    jitProvisioning: true,
    attributeMapping: { email: "emailAddress", name: "displayName" },
    samlEntityId: "https://company.okta.com/app/entity-id",
    samlSsoUrl: "https://company.okta.com/app/sso/saml",
    samlCertificate: "MIIDpDCCAoygAwIBA...",
    samlMetadataUrl: "https://company.okta.com/app/metadata",
    oidcDiscoveryUrl: null,
    oidcClientId: null,
    createdAt: "2026-03-05T10:00:00Z",
    updatedAt: "2026-03-10T14:00:00Z",
  },
];

export const mockSSOSessions: SSOSession[] = [
  {
    id: "sess-1",
    tenantId: "tenant-1",
    userId: "user-1",
    provider: "okta",
    expiresAt: "2026-03-11T03:00:00Z",
    revokedAt: null,
    createdAt: "2026-03-10T19:00:00Z",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0",
  },
  {
    id: "sess-2",
    tenantId: "tenant-1",
    userId: "user-2",
    provider: "okta",
    expiresAt: "2026-03-11T01:00:00Z",
    revokedAt: null,
    createdAt: "2026-03-10T17:00:00Z",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0",
  },
];

export const mockSCIMTokens: SCIMToken[] = [
  {
    id: "scim-tok-1",
    tenantId: "tenant-1",
    connectionId: "sso-1",
    tokenPrefix: "scim_a1b2c3d4",
    revoked: false,
    createdAt: "2026-03-05T10:00:00Z",
    lastUsedAt: "2026-03-10T18:30:00Z",
  },
];

export const mockSCIMGroups: SCIMGroup[] = [
  {
    id: "grp-1",
    tenantId: "tenant-1",
    connectionId: "sso-1",
    externalGroupId: "okta-engineering",
    displayName: "Engineering",
    mappedRole: "admin",
    createdAt: "2026-03-05T10:00:00Z",
    updatedAt: "2026-03-10T14:00:00Z",
  },
  {
    id: "grp-2",
    tenantId: "tenant-1",
    connectionId: "sso-1",
    externalGroupId: "okta-security",
    displayName: "Security Team",
    mappedRole: "auditor",
    createdAt: "2026-03-06T10:00:00Z",
    updatedAt: "2026-03-10T14:00:00Z",
  },
];

// ─── Auditor Portal ─────────────────────────────────────────────

export const mockAuditorInvitations: AuditorInvitation[] = [
  {
    id: "aud-inv-1",
    tenantId: "tenant-1",
    email: "jane.smith@auditfirm.com",
    name: "Jane Smith",
    status: "active",
    frameworkScopes: ["soc2", "gdpr"],
    tokenPrefix: "aud_a1b2c3d4",
    expiresAt: "2026-04-10T00:00:00Z",
    lastAccessedAt: "2026-03-10T14:30:00Z",
    createdBy: "user-1",
    createdAt: "2026-03-01T10:00:00Z",
    revokedAt: null,
  },
  {
    id: "aud-inv-2",
    tenantId: "tenant-1",
    email: "bob.jones@compliance.co",
    name: "Bob Jones",
    status: "pending",
    frameworkScopes: ["hipaa"],
    tokenPrefix: "aud_e5f6g7h8",
    expiresAt: "2026-04-15T00:00:00Z",
    lastAccessedAt: null,
    createdBy: "user-1",
    createdAt: "2026-03-08T09:00:00Z",
    revokedAt: null,
  },
  {
    id: "aud-inv-3",
    tenantId: "tenant-1",
    email: "old.auditor@expired.com",
    name: "Old Auditor",
    status: "expired",
    frameworkScopes: ["soc2"],
    tokenPrefix: "aud_x9y0z1a2",
    expiresAt: "2026-02-28T00:00:00Z",
    lastAccessedAt: "2026-02-25T11:00:00Z",
    createdBy: "user-1",
    createdAt: "2026-01-29T10:00:00Z",
    revokedAt: null,
  },
];

export const mockAuditorAccessLogs: AuditorAccessLog[] = [
  {
    id: "alog-1",
    invitationId: "aud-inv-1",
    tenantId: "tenant-1",
    resource: "portal/frameworks",
    action: "list",
    ipAddress: "203.0.113.42",
    userAgent: "Mozilla/5.0",
    timestamp: "2026-03-10T14:30:00Z",
  },
  {
    id: "alog-2",
    invitationId: "aud-inv-1",
    tenantId: "tenant-1",
    resource: "portal/frameworks/soc2/controls",
    action: "list",
    ipAddress: "203.0.113.42",
    userAgent: "Mozilla/5.0",
    timestamp: "2026-03-10T14:28:00Z",
  },
  {
    id: "alog-3",
    invitationId: "aud-inv-1",
    tenantId: "tenant-1",
    resource: "portal/frameworks/soc2/evidence",
    action: "list",
    ipAddress: "203.0.113.42",
    userAgent: "Mozilla/5.0",
    timestamp: "2026-03-10T14:25:00Z",
  },
  {
    id: "alog-4",
    invitationId: "aud-inv-1",
    tenantId: "tenant-1",
    resource: "portal/profile",
    action: "view",
    ipAddress: "203.0.113.42",
    userAgent: "Mozilla/5.0",
    timestamp: "2026-03-10T14:20:00Z",
  },
];

// ─── Policy Templates ─────────────────────────────────────────────

// ─── Trust Center ────────────────────────────────────────────────

export interface MockTrustCenterConfig {
  id: string;
  tenantId: string;
  enabled: boolean;
  publicSlug: string;
  customTitle: string | null;
  customDescription: string | null;
  showFrameworks: string[];
  showComplianceScores: boolean;
  showLastAuditDate: boolean;
  showControlSummary: boolean;
  showBadges: boolean;
  customLogo: string | null;
  customAccentColor: string | null;
  createdAt: string;
  updatedAt: string;
}

export const mockTrustCenterConfig: MockTrustCenterConfig = {
  id: "tc-1",
  tenantId: "tenant-1",
  enabled: true,
  publicSlug: "acme-corp",
  customTitle: "Acme Corp Trust Center",
  customDescription: "Transparency into our AI agent security and compliance posture.",
  showFrameworks: ["soc2", "gdpr", "hipaa"],
  showComplianceScores: true,
  showLastAuditDate: true,
  showControlSummary: true,
  showBadges: true,
  customLogo: null,
  customAccentColor: null,
  createdAt: "2026-03-01T10:00:00Z",
  updatedAt: "2026-03-10T14:00:00Z",
};

// ─── Questionnaire ────────────────────────────────────────────────

export interface MockQuestionnaire {
  id: string;
  tenantId: string;
  questionnaireTitle: string;
  questions: Array<{ id: string; question: string; category?: string }>;
  responses: Array<{ questionId: string; question: string; answer: string; confidence: string; supportingEvidence: string[]; controlReferences: string[] }>;
  status: string;
  generatedAt: string;
  updatedAt: string;
}

export const mockQuestionnaires: MockQuestionnaire[] = [
  {
    id: "q-1",
    tenantId: "tenant-1",
    questionnaireTitle: "Prospect Security Review — Q1 2026",
    questions: [
      { id: "q1", question: "How do you manage AI agent identities?", category: "Identity" },
      { id: "q2", question: "What audit logging is in place for agent actions?", category: "Audit" },
      { id: "q3", question: "What compliance frameworks do you support?", category: "Compliance" },
    ],
    responses: [
      { questionId: "q1", question: "How do you manage AI agent identities?", answer: "AgentGate manages 5 registered AI agents, each with a unique UUIDv7 identity, lifecycle status tracking, risk-level classification, and capability declarations.", confidence: "high", supportingEvidence: ["5 registered agents"], controlReferences: ["CC6.1", "IA.L2-3.5.1"] },
      { questionId: "q2", question: "What audit logging is in place for agent actions?", answer: "We maintain an append-only audit trail recording every agent action, resource accessed, authorization decision, policy applied, and response time. Logs are immutable and queryable.", confidence: "high", supportingEvidence: ["1247 audit log entries"], controlReferences: ["CC7.1", "AU.L2-3.3.1", "Art.30"] },
      { questionId: "q3", question: "What compliance frameworks do you support?", answer: "AgentGate maintains compliance across 4 frameworks (SOC 2 Type II, GDPR, HIPAA, ISO 27001:2022), with continuous automated evaluation, evidence collection, gap analysis, and remediation recommendations.", confidence: "high", supportingEvidence: ["4 frameworks", "82% compliance score"], controlReferences: [] },
    ],
    status: "completed",
    generatedAt: "2026-03-10T15:00:00Z",
    updatedAt: "2026-03-10T15:00:00Z",
  },
];

// ─── Vendor Agents ────────────────────────────────────────────────

export interface MockVendorAgent {
  id: string;
  tenantId: string;
  vendorName: string;
  agentName: string;
  description: string;
  vendorUrl: string | null;
  contactEmail: string | null;
  capabilities: string[];
  dataAccess: string[];
  riskScore: number;
  riskLevel: string;
  assessmentStatus: string;
  complianceClaims: Record<string, boolean>;
  lastAssessedAt: string | null;
  nextReviewDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const mockVendorAgents: MockVendorAgent[] = [
  {
    id: "va-1",
    tenantId: "tenant-1",
    vendorName: "OpenAI",
    agentName: "GPT-4 Assistant",
    description: "Customer-facing assistant powered by GPT-4",
    vendorUrl: "https://openai.com",
    contactEmail: "security@openai.com",
    capabilities: ["read:customer-data", "write:responses", "read:knowledge-base"],
    dataAccess: ["pii", "customer-tickets"],
    riskScore: 45,
    riskLevel: "medium",
    assessmentStatus: "assessed",
    complianceClaims: { soc2: true, gdpr: true, hipaa: false },
    lastAssessedAt: "2026-03-05T10:00:00Z",
    nextReviewDate: "2026-06-05T10:00:00Z",
    notes: "Annual SOC 2 report reviewed. GDPR DPA in place.",
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-03-05T10:00:00Z",
  },
  {
    id: "va-2",
    tenantId: "tenant-1",
    vendorName: "Anthropic",
    agentName: "Claude Code Review",
    description: "Automated code review agent",
    vendorUrl: "https://anthropic.com",
    contactEmail: "trust@anthropic.com",
    capabilities: ["read:repos", "write:comments"],
    dataAccess: ["source-code"],
    riskScore: 30,
    riskLevel: "medium",
    assessmentStatus: "assessed",
    complianceClaims: { soc2: true, gdpr: true },
    lastAssessedAt: "2026-03-08T10:00:00Z",
    nextReviewDate: "2026-06-08T10:00:00Z",
    notes: null,
    createdAt: "2026-02-15T10:00:00Z",
    updatedAt: "2026-03-08T10:00:00Z",
  },
  {
    id: "va-3",
    tenantId: "tenant-1",
    vendorName: "DataBot Inc",
    agentName: "Market Scraper v3",
    description: "Third-party data aggregation agent",
    vendorUrl: null,
    contactEmail: null,
    capabilities: ["read:external", "write:database", "read:financial"],
    dataAccess: ["financial", "market-data", "pii"],
    riskScore: 72,
    riskLevel: "high",
    assessmentStatus: "needs_review",
    complianceClaims: {},
    lastAssessedAt: "2026-01-15T10:00:00Z",
    nextReviewDate: "2026-03-15T10:00:00Z",
    notes: "No compliance certifications. Broad data access.",
    createdAt: "2026-01-10T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "va-4",
    tenantId: "tenant-1",
    vendorName: "InternalTools",
    agentName: "Deployment Bot",
    description: "Internal CI/CD deployment agent from vendor",
    vendorUrl: "https://internaltools.dev",
    contactEmail: "support@internaltools.dev",
    capabilities: ["deploy:production", "read:configs"],
    dataAccess: ["infrastructure"],
    riskScore: 55,
    riskLevel: "high",
    assessmentStatus: "not_assessed",
    complianceClaims: { soc2: true },
    lastAssessedAt: null,
    nextReviewDate: null,
    notes: null,
    createdAt: "2026-03-10T10:00:00Z",
    updatedAt: "2026-03-10T10:00:00Z",
  },
];

export const mockVendorAgentStats = {
  total: 4,
  byRiskLevel: { low: 0, medium: 2, high: 2, critical: 0 },
  byAssessmentStatus: { not_assessed: 1, in_progress: 0, assessed: 2, needs_review: 1 },
  avgRiskScore: 51,
  needsReview: 2,
};

// ─── Integration Configs ─────────────────────────────────────────

export interface MockIntegrationConfig {
  id: string;
  tenantId: string;
  integrationType: string;
  enabled: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export const mockIntegrations: MockIntegrationConfig[] = [
  {
    id: "int-1",
    tenantId: "tenant-1",
    integrationType: "vanta",
    enabled: true,
    lastSyncAt: "2026-03-10T16:00:00Z",
    lastSyncStatus: "success",
    createdAt: "2026-03-05T10:00:00Z",
    updatedAt: "2026-03-10T16:00:00Z",
  },
];

export const mockPolicyTemplates: PolicyTemplate[] = [
  {
    id: "tpl-rate-limiting",
    name: "Rate Limiting Guard",
    description: "Prevents agents from exceeding request rate thresholds by escalating high-frequency actions",
    category: "security",
    template: {
      name: "Rate Limiting Guard",
      description: "Escalate when agents perform actions at high frequency",
      rules: [{ name: "Escalate burst activity", effect: "escalate", priority: 1, conditions: [{ field: "context.requestsPerMinute", operator: "gt", value: 60 }] }],
      targets: { actions: ["*"], resources: ["*"] },
      enabled: true,
    },
  },
  {
    id: "tpl-data-access-control",
    name: "Data Access Control",
    description: "Restricts access to sensitive data stores based on agent risk level",
    category: "data-protection",
    template: {
      name: "Data Access Control",
      description: "Deny high-risk agents from accessing PII and sensitive data stores",
      rules: [
        { name: "Deny critical risk agents", effect: "deny", priority: 1, conditions: [{ field: "agent.riskLevel", operator: "equals", value: "critical" }] },
        { name: "Escalate high risk agents", effect: "escalate", priority: 2, conditions: [{ field: "agent.riskLevel", operator: "equals", value: "high" }] },
      ],
      targets: { resources: ["data:pii:*", "data:sensitive:*"] },
      enabled: true,
    },
  },
  {
    id: "tpl-time-based-access",
    name: "Time-Based Access",
    description: "Restricts agent operations to business hours only",
    category: "operational",
    template: {
      name: "Time-Based Access",
      description: "Escalate agent actions outside business hours (UTC 9-17)",
      rules: [{ name: "Escalate outside business hours", effect: "escalate", priority: 1, conditions: [{ field: "context.hour", operator: "not_in", value: [9, 10, 11, 12, 13, 14, 15, 16, 17] }] }],
      targets: { actions: ["deploy:*", "write:*"] },
      enabled: true,
    },
  },
  {
    id: "tpl-resource-scoping",
    name: "Resource Scoping",
    description: "Limits agents to their designated resource namespaces only",
    category: "access-control",
    template: {
      name: "Resource Scoping",
      description: "Deny agents from accessing resources outside their namespace",
      rules: [{ name: "Deny cross-namespace access", effect: "deny", priority: 1, conditions: [{ field: "resource", operator: "not_contains", value: "agent.namespace" }] }],
      targets: { actions: ["*"] },
      enabled: true,
    },
  },
  {
    id: "tpl-read-only-agents",
    name: "Read-Only Agents",
    description: "Restricts specified agents to read-only operations across all resources",
    category: "access-control",
    template: {
      name: "Read-Only Agents",
      description: "Deny all write and delete operations for tagged agents",
      rules: [{ name: "Deny writes", effect: "deny", priority: 1, conditions: [{ field: "action", operator: "matches", value: "^(write|delete|deploy):.*" }] }],
      targets: { agentTags: ["read-only"], resources: ["*"] },
      enabled: true,
    },
  },
];
