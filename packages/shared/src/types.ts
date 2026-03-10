// ─── Agent Identity ───────────────────────────────────────────────

export type AgentId = string; // UUIDv7

export type AgentStatus = "active" | "suspended" | "revoked";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface AgentIdentity {
  id: AgentId;
  name: string;
  description: string;
  ownerId: string;
  status: AgentStatus;
  riskLevel: RiskLevel;
  capabilities: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string | null;
}

export interface CreateAgentRequest {
  name: string;
  description: string;
  ownerId: string;
  capabilities?: string[];
  riskLevel?: RiskLevel;
  metadata?: Record<string, unknown>;
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  status?: AgentStatus;
  riskLevel?: RiskLevel;
  capabilities?: string[];
  metadata?: Record<string, unknown>;
}

// ─── Agent Tokens ─────────────────────────────────────────────────

export interface AgentToken {
  token: string;
  agentId: AgentId;
  expiresAt: string;
  scopes: string[];
}

export interface TokenRequest {
  agentId: AgentId;
  scopes?: string[];
  ttlSeconds?: number;
}

// ─── Policies ─────────────────────────────────────────────────────

export type PolicyEffect = "allow" | "deny" | "escalate";

export type PolicyOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "in"
  | "not_in"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "matches"; // regex

export interface PolicyCondition {
  field: string;
  operator: PolicyOperator;
  value: unknown;
}

export interface PolicyRule {
  id: string;
  name: string;
  description?: string;
  effect: PolicyEffect;
  priority: number;
  conditions: PolicyCondition[];
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  version: number;
  rules: PolicyRule[];
  targets: PolicyTarget;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyTarget {
  agentIds?: AgentId[];
  agentTags?: string[];
  resources?: string[];
  actions?: string[];
}

export interface CreatePolicyRequest {
  name: string;
  description: string;
  rules: Omit<PolicyRule, "id">[];
  targets: PolicyTarget;
  enabled?: boolean;
}

export interface UpdatePolicyRequest {
  name?: string;
  description?: string;
  rules?: Omit<PolicyRule, "id">[];
  targets?: PolicyTarget;
  enabled?: boolean;
}

// ─── Authorization ────────────────────────────────────────────────

export interface AuthorizationRequest {
  agentId: AgentId;
  action: string;
  resource: string;
  context?: Record<string, unknown>;
}

export interface AuthorizationDecision {
  decision: PolicyEffect;
  policyId: string | null;
  ruleId: string | null;
  reason: string;
  evaluatedAt: string;
  durationMs: number;
}

// ─── Audit Log ────────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  agentId: AgentId;
  action: string;
  resource: string;
  decision: PolicyEffect;
  policyId: string | null;
  context: Record<string, unknown>;
  timestamp: string;
  durationMs: number;
}

export interface AuditQuery {
  agentId?: AgentId;
  action?: string;
  resource?: string;
  decision?: PolicyEffect;
  startTime?: string;
  endTime?: string;
  limit?: number;
  offset?: number;
}

// ─── API Envelope ─────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  total?: number;
  limit?: number;
  offset?: number;
  requestId: string;
  durationMs: number;
}

// ─── Anomaly Detection ────────────────────────────────────────────

export type AnomalyType =
  | "unusual_action"
  | "unusual_resource"
  | "unusual_time"
  | "high_deny_rate"
  | "burst_activity"
  | "new_resource_pattern"
  | "permission_escalation";

export type AnomalySeverity = "low" | "medium" | "high" | "critical";

export interface Anomaly {
  id: string;
  agentId: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  details: Record<string, unknown>;
  detectedAt: string;
  resolved: boolean;
}

export interface AgentBehaviorProfile {
  agentId: string;
  commonActions: string[];
  commonResources: string[];
  activeHours: number[];  // 0-23, hours when agent is typically active
  avgRequestsPerHour: number;
  avgDenyRate: number;
  lastUpdated: string;
}

export interface AnomalyAlert {
  anomaly: Anomaly;
  agentName: string;
  recommendedAction: "monitor" | "throttle" | "suspend" | "notify";
}

// ─── Agent-to-Agent (A2A) Governance ──────────────────────────────

export interface A2AChannel {
  id: string;
  sourceAgentId: string;
  targetAgentId: string;
  allowedActions: string[];
  allowedDataTypes: string[];
  maxRequestsPerMinute: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateA2AChannelRequest {
  sourceAgentId: string;
  targetAgentId: string;
  allowedActions?: string[];
  allowedDataTypes?: string[];
  maxRequestsPerMinute?: number;
}

export interface A2ACommunication {
  id: string;
  channelId: string;
  sourceAgentId: string;
  targetAgentId: string;
  action: string;
  dataType: string;
  decision: PolicyEffect;
  timestamp: string;
  durationMs: number;
}

export interface A2AGraphNode {
  agentId: string;
  agentName: string;
  incomingCount: number;
  outgoingCount: number;
}

export interface A2AGraphEdge {
  source: string;
  target: string;
  requestCount: number;
  lastCommunication: string;
  status: "active" | "blocked";
}

export interface A2AGraph {
  nodes: A2AGraphNode[];
  edges: A2AGraphEdge[];
}

// ─── Multi-Tenancy & RBAC ─────────────────────────────────────────

export type TenantPlan = "free" | "pro" | "enterprise";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
  agentLimit: number;
  evalLimitPerMonth: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  plan?: TenantPlan;
}

export type UserRole = "owner" | "admin" | "member" | "auditor" | "viewer";

export interface TenantUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role?: UserRole;
}

export interface TenantUsage {
  tenantId: string;
  agentCount: number;
  agentLimit: number;
  evalCountThisMonth: number;
  evalLimitPerMonth: number;
  periodStart: string;
  periodEnd: string;
}

// ─── Billing ──────────────────────────────────────────────────────

export type BillingInterval = "monthly" | "yearly";

export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  interval: BillingInterval;
  agentLimit: number;
  evalLimit: number;
  features: string[];
}

export interface Subscription {
  id: string;
  tenantId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  plan: string;
  status: "active" | "past_due" | "canceled" | "trialing";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export interface CreateCheckoutRequest {
  tenantId: string;
  plan: string;
  interval?: BillingInterval;
  successUrl: string;
  cancelUrl: string;
}

export interface BillingPortalRequest {
  tenantId: string;
  returnUrl: string;
}

// ─── Compliance Autopilot ────────────────────────────────────────

export type ComplianceFrameworkId = "soc2" | "iso27001" | "hipaa" | "gdpr" | "pci_dss" | "eu_ai_act";

export type ControlStatus = "passing" | "failing" | "warning" | "not_evaluated" | "not_applicable";

export type EvidenceType = "automatic" | "manual" | "agent_audit" | "policy_snapshot" | "system_log";

export interface ComplianceFramework {
  id: string;
  frameworkId: ComplianceFrameworkId;
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

export interface ComplianceControl {
  id: string;
  frameworkId: ComplianceFrameworkId;
  controlCode: string;
  title: string;
  description: string;
  category: string;
  status: ControlStatus;
  severity: "low" | "medium" | "high" | "critical";
  evidenceCount: number;
  lastEvaluatedAt: string;
  remediationSteps?: string[];
  automatable: boolean;
}

export interface ComplianceEvidence {
  id: string;
  controlId: string;
  frameworkId: ComplianceFrameworkId;
  type: EvidenceType;
  title: string;
  description: string;
  sourceSystem: string;
  collectedAt: string;
  expiresAt: string | null;
  data: Record<string, unknown>;
  verified: boolean;
}

export interface ComplianceReport {
  id: string;
  frameworkId: ComplianceFrameworkId;
  title: string;
  generatedAt: string;
  generatedBy: string;
  periodStart: string;
  periodEnd: string;
  overallScore: number;
  summary: string;
  findings: ComplianceFinding[];
  status: "draft" | "final" | "shared";
}

export interface ComplianceFinding {
  controlCode: string;
  controlTitle: string;
  status: ControlStatus;
  finding: string;
  recommendation: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface ComplianceScoreHistory {
  frameworkId: ComplianceFrameworkId;
  scores: { date: string; score: number }[];
}

export interface RegulatoryUpdate {
  id: string;
  frameworkId: ComplianceFrameworkId;
  title: string;
  description: string;
  effectiveDate: string;
  impactLevel: "low" | "medium" | "high";
  affectedControls: string[];
  source: string;
  publishedAt: string;
  acknowledged: boolean;
}

export interface GapAnalysis {
  frameworkId: ComplianceFrameworkId;
  totalControls: number;
  assessed: number;
  gaps: GapItem[];
  overallReadiness: number;
}

export interface GapItem {
  controlCode: string;
  controlTitle: string;
  currentState: string;
  requiredState: string;
  effort: "low" | "medium" | "high";
  priority: number;
}

// ─── Error Codes ──────────────────────────────────────────────────

export const ErrorCodes = {
  AGENT_NOT_FOUND: "AGENT_NOT_FOUND",
  AGENT_SUSPENDED: "AGENT_SUSPENDED",
  AGENT_REVOKED: "AGENT_REVOKED",
  POLICY_NOT_FOUND: "POLICY_NOT_FOUND",
  POLICY_CONFLICT: "POLICY_CONFLICT",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  AUTHORIZATION_DENIED: "AUTHORIZATION_DENIED",
  ESCALATION_REQUIRED: "ESCALATION_REQUIRED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  ANOMALY_DETECTED: "ANOMALY_DETECTED",
  AGENT_THROTTLED: "AGENT_THROTTLED",
  TENANT_NOT_FOUND: "TENANT_NOT_FOUND",
  TENANT_LIMIT_REACHED: "TENANT_LIMIT_REACHED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  TENANT_SLUG_TAKEN: "TENANT_SLUG_TAKEN",
  FRAMEWORK_NOT_FOUND: "FRAMEWORK_NOT_FOUND",
  CONTROL_NOT_FOUND: "CONTROL_NOT_FOUND",
  EVIDENCE_NOT_FOUND: "EVIDENCE_NOT_FOUND",
  REPORT_NOT_FOUND: "REPORT_NOT_FOUND",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
