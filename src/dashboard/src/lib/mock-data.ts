import type { AgentIdentity, Policy, AuditEntry } from "@agentgate/shared";
import type { AuditStats, Anomaly, AnomalyStats, A2AGraph, A2AChannel, A2AStats, Plan, Subscription, TenantUsage, ApiKey, TenantUser } from "./api";

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

export const mockScoreHistory = [
  { date: "2026-01-15", score: 45 },
  { date: "2026-01-30", score: 52 },
  { date: "2026-02-15", score: 61 },
  { date: "2026-02-28", score: 68 },
  { date: "2026-03-10", score: 82 },
];
