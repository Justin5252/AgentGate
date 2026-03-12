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

// ─── SSO / SAML / OIDC ───────────────────────────────────────────

export type SSOProvider = "okta" | "azure_ad" | "google" | "onelogin" | "custom_saml" | "custom_oidc";

export type SSOProtocol = "saml" | "oidc";

export type SSOEventType =
  | "sso_login_success"
  | "sso_login_failure"
  | "sso_logout"
  | "session_created"
  | "session_revoked"
  | "session_expired"
  | "connection_created"
  | "connection_updated"
  | "connection_deleted"
  | "connection_test"
  | "scim_user_created"
  | "scim_user_updated"
  | "scim_user_deactivated"
  | "scim_group_created"
  | "scim_group_updated"
  | "scim_group_deleted"
  | "scim_token_generated"
  | "scim_token_revoked"
  | "enforcement_enabled"
  | "enforcement_disabled";

export type ProvisionMethod = "manual" | "scim" | "jit";

export interface SSOConnection {
  id: string;
  tenantId: string;
  provider: SSOProvider;
  protocol: SSOProtocol;
  enabled: boolean;
  enforced: boolean;
  defaultRole: UserRole;
  jitProvisioning: boolean;
  attributeMapping: Record<string, string>;
  // SAML fields
  samlEntityId: string | null;
  samlSsoUrl: string | null;
  samlCertificate: string | null;
  samlMetadataUrl: string | null;
  // OIDC fields
  oidcDiscoveryUrl: string | null;
  oidcClientId: string | null;
  oidcClientSecretEncrypted: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSSOConnectionRequest {
  provider: SSOProvider;
  protocol: SSOProtocol;
  defaultRole?: UserRole;
  jitProvisioning?: boolean;
  attributeMapping?: Record<string, string>;
  // SAML
  samlEntityId?: string;
  samlSsoUrl?: string;
  samlCertificate?: string;
  samlMetadataUrl?: string;
  // OIDC
  oidcDiscoveryUrl?: string;
  oidcClientId?: string;
  oidcClientSecret?: string;
}

export interface UpdateSSOConnectionRequest {
  enabled?: boolean;
  enforced?: boolean;
  defaultRole?: UserRole;
  jitProvisioning?: boolean;
  attributeMapping?: Record<string, string>;
  samlEntityId?: string;
  samlSsoUrl?: string;
  samlCertificate?: string;
  samlMetadataUrl?: string;
  oidcDiscoveryUrl?: string;
  oidcClientId?: string;
  oidcClientSecret?: string;
}

export interface SSOSession {
  id: string;
  tenantId: string;
  userId: string;
  provider: SSOProvider;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface SCIMToken {
  id: string;
  tenantId: string;
  connectionId: string;
  tokenPrefix: string;
  revoked: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface SCIMGroup {
  id: string;
  tenantId: string;
  connectionId: string;
  externalGroupId: string;
  displayName: string;
  mappedRole: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface SPMetadata {
  entityId: string;
  acsUrl: string;
  metadataUrl: string;
}

export interface SSOTestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface SSOAuditEntry {
  id: string;
  tenantId: string;
  userId: string | null;
  event: SSOEventType;
  provider: SSOProvider | null;
  details: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
}

// ─── Auditor Portal ─────────────────────────────────────────────

export type AuditorInvitationStatus = "pending" | "active" | "expired" | "revoked";

export interface AuditorInvitation {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  status: AuditorInvitationStatus;
  frameworkScopes: string[];
  tokenPrefix: string;
  expiresAt: string;
  lastAccessedAt: string | null;
  createdBy: string;
  createdAt: string;
  revokedAt: string | null;
}

export interface CreateAuditorInvitationRequest {
  email: string;
  name: string;
  frameworkScopes: string[];
  expiresInDays?: number;
}

export interface AuditorAccessLog {
  id: string;
  invitationId: string;
  tenantId: string;
  resource: string;
  action: string;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
}

export interface AuditorProfile {
  id: string;
  email: string;
  name: string;
  tenantName: string;
  frameworkScopes: string[];
  expiresAt: string;
}

// ─── Remediation Recommendations ──────────────────────────────────

export type RemediationSource = "template" | "ai_generated";

export type RemediationStatus = "pending" | "in_progress" | "completed" | "dismissed";

export interface RemediationStep {
  order: number;
  title: string;
  description: string;
  actionType: "configure" | "create" | "review" | "manual";
  actionTarget?: string;
  completed: boolean;
}

export interface RemediationRecommendation {
  id: string;
  controlId: string;
  frameworkId: string;
  source: RemediationSource;
  summary: string;
  steps: RemediationStep[];
  estimatedEffort: "low" | "medium" | "high";
  status: RemediationStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Policy Suggestions ──────────────────────────────────────────

export type PolicySuggestionStatus = "pending" | "approved" | "rejected" | "applied";

export interface SuggestedPolicyChange {
  rulesToAdd?: Array<{ name: string; effect: PolicyEffect; priority: number; conditions: PolicyCondition[] }>;
  rulesToRemove?: string[];
  conditionUpdates?: Array<{ ruleId: string; conditions: PolicyCondition[] }>;
  newPolicy?: { name: string; description: string; rules: Array<{ name: string; effect: PolicyEffect; priority: number; conditions: PolicyCondition[] }>; targets: PolicyTarget };
}

export interface PolicySuggestion {
  id: string;
  regulatoryUpdateId: string;
  policyId: string | null;
  policyName: string;
  suggestionType: "modify" | "create" | "review";
  description: string;
  suggestedChanges: SuggestedPolicyChange;
  impactLevel: "low" | "medium" | "high";
  status: PolicySuggestionStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  appliedPolicyVersion: number | null;
  createdAt: string;
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
  SSO_NOT_CONFIGURED: "SSO_NOT_CONFIGURED",
  SSO_CONNECTION_NOT_FOUND: "SSO_CONNECTION_NOT_FOUND",
  SSO_REQUIRED: "SSO_REQUIRED",
  SSO_INVALID_RESPONSE: "SSO_INVALID_RESPONSE",
  SCIM_TOKEN_INVALID: "SCIM_TOKEN_INVALID",
  SCIM_RESOURCE_NOT_FOUND: "SCIM_RESOURCE_NOT_FOUND",
  PLAN_UPGRADE_REQUIRED: "PLAN_UPGRADE_REQUIRED",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  SESSION_REVOKED: "SESSION_REVOKED",
  AUDITOR_INVITATION_NOT_FOUND: "AUDITOR_INVITATION_NOT_FOUND",
  AUDITOR_INVITATION_EXPIRED: "AUDITOR_INVITATION_EXPIRED",
  AUDITOR_INVITATION_REVOKED: "AUDITOR_INVITATION_REVOKED",
  AUDITOR_SCOPE_DENIED: "AUDITOR_SCOPE_DENIED",
  AUDITOR_WRITE_DENIED: "AUDITOR_WRITE_DENIED",
  RECOMMENDATION_NOT_FOUND: "RECOMMENDATION_NOT_FOUND",
  SUGGESTION_NOT_FOUND: "SUGGESTION_NOT_FOUND",
  SUGGESTION_NOT_APPROVED: "SUGGESTION_NOT_APPROVED",
  SUGGESTION_ALREADY_APPLIED: "SUGGESTION_ALREADY_APPLIED",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
