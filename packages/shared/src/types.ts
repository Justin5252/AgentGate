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
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
