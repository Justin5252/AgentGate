import type {
  AgentIdentity,
  CreateAgentRequest,
  Policy,
  CreatePolicyRequest,
  AuditEntry,
  AuditQuery,
  AuthorizationRequest,
  AuthorizationDecision,
  ApiResponse,
} from "@agentgate/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.error?.message || `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  const json: ApiResponse<T> = await res.json();

  if (json.error) {
    throw new Error(json.error.message);
  }

  return json.data as T;
}

function toQueryString(params?: Record<string, unknown>): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (entries.length === 0) return "";
  const searchParams = new URLSearchParams();
  for (const [key, value] of entries) {
    searchParams.set(key, String(value));
  }
  return `?${searchParams.toString()}`;
}

// ─── Agents ────────────────────────────────────────────────────────

export async function fetchAgents(
  params?: Record<string, unknown>
): Promise<AgentIdentity[]> {
  return request<AgentIdentity[]>(`/api/v1/agents${toQueryString(params)}`);
}

export async function fetchAgent(id: string): Promise<AgentIdentity> {
  return request<AgentIdentity>(`/api/v1/agents/${id}`);
}

export async function createAgent(
  data: CreateAgentRequest
): Promise<AgentIdentity> {
  return request<AgentIdentity>("/api/v1/agents", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteAgent(id: string): Promise<void> {
  return request<void>(`/api/v1/agents/${id}`, {
    method: "DELETE",
  });
}

// ─── Policies ──────────────────────────────────────────────────────

export async function fetchPolicies(
  params?: Record<string, unknown>
): Promise<Policy[]> {
  return request<Policy[]>(`/api/v1/policies${toQueryString(params)}`);
}

export async function createPolicy(
  data: CreatePolicyRequest
): Promise<Policy> {
  return request<Policy>("/api/v1/policies", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deletePolicy(id: string): Promise<void> {
  return request<void>(`/api/v1/policies/${id}`, {
    method: "DELETE",
  });
}

// ─── Authorization ─────────────────────────────────────────────────

export async function authorizeAgent(
  req: AuthorizationRequest
): Promise<AuthorizationDecision> {
  return request<AuthorizationDecision>("/api/v1/authorize", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// ─── Audit ─────────────────────────────────────────────────────────

export async function fetchAuditLogs(
  params?: AuditQuery
): Promise<AuditEntry[]> {
  return request<AuditEntry[]>(
    `/api/v1/audit${toQueryString(params as Record<string, unknown>)}`
  );
}

export interface AuditStats {
  totalDecisions: number;
  allowCount: number;
  denyCount: number;
  escalateCount: number;
  avgDurationMs: number;
}

export async function fetchAuditStats(): Promise<AuditStats> {
  return request<AuditStats>("/api/v1/audit/stats");
}

// ─── Anomalies ──────────────────────────────────────────────────────

export interface Anomaly {
  id: string;
  agentId: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  details: Record<string, unknown>;
  detectedAt: string;
  resolved: boolean;
}

export interface AnomalyStats {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  unresolvedCount: number;
}

export async function fetchAnomalies(
  params?: { agentId?: string; type?: string; severity?: string; resolved?: string; limit?: number; offset?: number }
): Promise<Anomaly[]> {
  return request<Anomaly[]>(
    `/api/v1/anomalies${toQueryString(params as Record<string, unknown>)}`
  );
}

export async function fetchAnomalyStats(): Promise<AnomalyStats> {
  return request<AnomalyStats>("/api/v1/anomalies/stats");
}

export async function resolveAnomaly(id: string): Promise<Anomaly> {
  return request<Anomaly>(`/api/v1/anomalies/${id}/resolve`, {
    method: "PATCH",
  });
}

// ─── A2A ────────────────────────────────────────────────────────────

export interface A2ANode {
  agentId: string;
  agentName: string;
  incomingCount: number;
  outgoingCount: number;
}

export interface A2AEdge {
  source: string;
  target: string;
  requestCount: number;
  lastCommunication: string;
  status: "active" | "blocked";
}

export interface A2AGraph {
  nodes: A2ANode[];
  edges: A2AEdge[];
}

export interface A2AChannel {
  id: string;
  sourceAgentId: string;
  targetAgentId: string;
  allowedActions: string[];
  rateLimit: number;
  enabled: boolean;
  lastCommunication: string;
}

export interface A2ACommunication {
  id: string;
  sourceAgentId: string;
  targetAgentId: string;
  action: string;
  timestamp: string;
  status: string;
}

export interface A2AStats {
  activeChannels: number;
  totalCommunications24h: number;
  blockedChannels: number;
}

export async function fetchA2AGraph(): Promise<A2AGraph> {
  return request<A2AGraph>("/api/v1/a2a/graph");
}

export async function fetchA2AChannels(
  params?: { limit?: number; offset?: number }
): Promise<A2AChannel[]> {
  return request<A2AChannel[]>(
    `/api/v1/a2a/channels${toQueryString(params as Record<string, unknown>)}`
  );
}

export async function fetchA2ACommunications(
  params?: { sourceAgentId?: string; targetAgentId?: string; limit?: number; offset?: number }
): Promise<A2ACommunication[]> {
  return request<A2ACommunication[]>(
    `/api/v1/a2a/communications${toQueryString(params as Record<string, unknown>)}`
  );
}

export async function fetchA2AStats(): Promise<A2AStats> {
  return request<A2AStats>("/api/v1/a2a/stats");
}

// ─── Billing ──────────────────────────────────────────────────────

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  agentLimit: number;
  evalLimit: number;
  features: string[];
}

export interface Subscription {
  id: string;
  tenantId: string;
  plan: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
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

export async function fetchPlans(): Promise<Plan[]> {
  return request<Plan[]>("/api/v1/billing/plans");
}

export async function fetchSubscription(tenantId: string): Promise<Subscription> {
  return request<Subscription>(`/api/v1/billing/subscription/${tenantId}`);
}

export async function createCheckout(data: Record<string, unknown>): Promise<{ url: string }> {
  return request<{ url: string }>("/api/v1/billing/checkout", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Tenants ──────────────────────────────────────────────────────

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  createdAt: string;
}

export interface TenantUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export async function fetchTenant(id: string): Promise<Tenant> {
  return request<Tenant>(`/api/v1/tenants/${id}`);
}

export async function fetchTenantUsers(tenantId: string): Promise<TenantUser[]> {
  return request<TenantUser[]>(`/api/v1/tenants/${tenantId}/users`);
}

export async function fetchTenantUsage(tenantId: string): Promise<TenantUsage> {
  return request<TenantUsage>(`/api/v1/tenants/${tenantId}/usage`);
}

// ─── API Keys ─────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  ownerId: string;
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  key: string;
}

export async function fetchApiKeys(): Promise<ApiKey[]> {
  return request<ApiKey[]>("/api/v1/keys");
}

export async function createApiKey(data: { name: string; scopes?: string[] }): Promise<CreateApiKeyResponse> {
  return request<CreateApiKeyResponse>("/api/v1/keys", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function revokeApiKey(id: string): Promise<void> {
  return request<void>(`/api/v1/keys/${id}`, {
    method: "DELETE",
  });
}

// ─── SSO ──────────────────────────────────────────────────────────

export interface SSOConnection {
  id: string;
  tenantId: string;
  provider: string;
  protocol: string;
  enabled: boolean;
  enforced: boolean;
  defaultRole: string;
  jitProvisioning: boolean;
  attributeMapping: Record<string, string>;
  samlEntityId: string | null;
  samlSsoUrl: string | null;
  samlCertificate: string | null;
  samlMetadataUrl: string | null;
  oidcDiscoveryUrl: string | null;
  oidcClientId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SSOSession {
  id: string;
  tenantId: string;
  userId: string;
  provider: string;
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
  mappedRole: string;
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

export async function fetchSSOConnections(): Promise<SSOConnection[]> {
  return request<SSOConnection[]>("/api/v1/sso/connections");
}

export async function createSSOConnection(data: Record<string, unknown>): Promise<SSOConnection> {
  return request<SSOConnection>("/api/v1/sso/connections", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSSOConnection(id: string, data: Record<string, unknown>): Promise<SSOConnection> {
  return request<SSOConnection>(`/api/v1/sso/connections/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteSSOConnection(id: string): Promise<void> {
  return request<void>(`/api/v1/sso/connections/${id}`, { method: "DELETE" });
}

export async function testSSOConnection(id: string): Promise<SSOTestResult> {
  return request<SSOTestResult>(`/api/v1/sso/connections/${id}/test`, { method: "POST" });
}

export async function fetchSPMetadata(id: string): Promise<SPMetadata> {
  return request<SPMetadata>(`/api/v1/sso/connections/${id}/metadata`);
}

export async function fetchSSOSessions(): Promise<SSOSession[]> {
  return request<SSOSession[]>("/api/v1/sso/sessions");
}

export async function revokeSSOSession(id: string): Promise<void> {
  return request<void>(`/api/v1/sso/sessions/${id}`, { method: "DELETE" });
}

export async function fetchSCIMTokens(): Promise<SCIMToken[]> {
  return request<SCIMToken[]>("/api/v1/sso/scim-tokens");
}

export async function generateSCIMToken(connectionId: string): Promise<SCIMToken & { token: string }> {
  return request<SCIMToken & { token: string }>("/api/v1/sso/scim-tokens", {
    method: "POST",
    body: JSON.stringify({ connectionId }),
  });
}

export async function revokeSCIMToken(id: string): Promise<void> {
  return request<void>(`/api/v1/sso/scim-tokens/${id}`, { method: "DELETE" });
}

// ─── Auditor Portal ─────────────────────────────────────────────

export interface AuditorInvitation {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  status: "pending" | "active" | "expired" | "revoked";
  frameworkScopes: string[];
  tokenPrefix: string;
  expiresAt: string;
  lastAccessedAt: string | null;
  createdBy: string;
  createdAt: string;
  revokedAt: string | null;
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

export interface AuditorProfileData {
  id: string;
  email: string;
  name: string;
  tenantName: string;
  frameworkScopes: string[];
  expiresAt: string;
}

// Admin endpoints
export async function fetchAuditorInvitations(params?: { status?: string }): Promise<AuditorInvitation[]> {
  return request<AuditorInvitation[]>(`/api/v1/auditor${toQueryString(params as Record<string, unknown>)}`);
}

export async function createAuditorInvitation(data: {
  email: string;
  name: string;
  frameworkScopes: string[];
  expiresInDays?: number;
}): Promise<{ invitation: AuditorInvitation; token: string }> {
  return request<{ invitation: AuditorInvitation; token: string }>("/api/v1/auditor", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchAuditorInvitation(id: string): Promise<AuditorInvitation & { accessLogCount: number }> {
  return request<AuditorInvitation & { accessLogCount: number }>(`/api/v1/auditor/${id}`);
}

export async function revokeAuditorInvitation(id: string): Promise<void> {
  return request<void>(`/api/v1/auditor/${id}`, { method: "DELETE" });
}

export async function fetchAuditorAccessLogs(
  invitationId: string,
  params?: { limit?: number; offset?: number },
): Promise<AuditorAccessLog[]> {
  return request<AuditorAccessLog[]>(
    `/api/v1/auditor/${invitationId}/access-logs${toQueryString(params as Record<string, unknown>)}`,
  );
}

// ─── Remediation ────────────────────────────────────────────────

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
  source: "template" | "ai_generated";
  summary: string;
  steps: RemediationStep[];
  estimatedEffort: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "dismissed";
  createdAt: string;
  updatedAt: string;
}

export async function generateRemediation(
  frameworkId: string,
  controlId: string,
  forceRegenerate?: boolean,
): Promise<RemediationRecommendation> {
  return request<RemediationRecommendation>(
    `/api/v1/compliance/${frameworkId}/controls/${controlId}/remediation`,
    { method: "POST", body: JSON.stringify({ forceRegenerate }) },
  );
}

export async function generateFrameworkRemediations(
  frameworkId: string,
): Promise<{ frameworkId: string; generated: number; recommendations: RemediationRecommendation[] }> {
  return request(`/api/v1/compliance/${frameworkId}/remediation/generate`, { method: "POST" });
}

export async function fetchRemediations(
  frameworkId: string,
  status?: string,
): Promise<RemediationRecommendation[]> {
  const qs = status ? `?status=${status}` : "";
  return request<RemediationRecommendation[]>(`/api/v1/compliance/${frameworkId}/remediation${qs}`);
}

export async function updateRemediationStatus(
  recommendationId: string,
  status: string,
): Promise<{ id: string; status: string }> {
  return request(`/api/v1/compliance/remediation/${recommendationId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ─── Policy Suggestions ─────────────────────────────────────────

export interface PolicySuggestion {
  id: string;
  regulatoryUpdateId: string;
  policyId: string | null;
  policyName: string;
  suggestionType: "modify" | "create" | "review";
  description: string;
  suggestedChanges: Record<string, unknown>;
  impactLevel: "low" | "medium" | "high";
  status: "pending" | "approved" | "rejected" | "applied";
  reviewedBy: string | null;
  reviewedAt: string | null;
  appliedPolicyVersion: number | null;
  createdAt: string;
}

export async function analyzeRegulatoryUpdate(
  updateId: string,
): Promise<{ updateId: string; generated: number; suggestions: PolicySuggestion[] }> {
  return request(`/api/v1/compliance/regulatory-updates/${updateId}/analyze`, { method: "POST" });
}

export async function fetchPolicySuggestions(
  updateId: string,
  status?: string,
): Promise<PolicySuggestion[]> {
  const qs = status ? `?status=${status}` : "";
  return request<PolicySuggestion[]>(`/api/v1/compliance/regulatory-updates/${updateId}/suggestions${qs}`);
}

export async function reviewPolicySuggestion(
  suggestionId: string,
  status: "approved" | "rejected",
  reviewedBy?: string,
): Promise<{ id: string; status: string; reviewedBy: string }> {
  return request(`/api/v1/compliance/policy-suggestions/${suggestionId}`, {
    method: "PATCH",
    body: JSON.stringify({ status, reviewedBy }),
  });
}

export async function applyPolicySuggestion(
  suggestionId: string,
): Promise<{ id: string; status: string; appliedPolicyVersion: number }> {
  return request(`/api/v1/compliance/policy-suggestions/${suggestionId}/apply`, { method: "POST" });
}

// Auditor portal endpoints (use token in header)
function auditorRequest<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  return request<T>(path, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function fetchAuditorProfile(token: string): Promise<AuditorProfileData> {
  return auditorRequest<AuditorProfileData>("/api/v1/auditor/portal/profile", token);
}

export async function fetchAuditorFrameworks(token: string): Promise<any[]> {
  return auditorRequest<any[]>("/api/v1/auditor/portal/frameworks", token);
}

export async function fetchAuditorControls(token: string, frameworkId: string): Promise<any[]> {
  return auditorRequest<any[]>(`/api/v1/auditor/portal/frameworks/${frameworkId}/controls`, token);
}

export async function fetchAuditorEvidence(token: string, frameworkId: string, controlId?: string): Promise<any[]> {
  const qs = controlId ? `?controlId=${controlId}` : "";
  return auditorRequest<any[]>(`/api/v1/auditor/portal/frameworks/${frameworkId}/evidence${qs}`, token);
}

export async function fetchAuditorReports(token: string, frameworkId: string): Promise<any[]> {
  return auditorRequest<any[]>(`/api/v1/auditor/portal/frameworks/${frameworkId}/reports`, token);
}

export async function fetchAuditorReport(token: string, reportId: string): Promise<any> {
  return auditorRequest<any>(`/api/v1/auditor/portal/reports/${reportId}`, token);
}

export async function fetchAuditorGapAnalysis(token: string, frameworkId: string): Promise<any> {
  return auditorRequest<any>(`/api/v1/auditor/portal/frameworks/${frameworkId}/gap-analysis`, token);
}

export async function fetchAuditorAuditLogs(
  token: string,
  params?: { limit?: number; offset?: number },
): Promise<any[]> {
  return auditorRequest<any[]>(`/api/v1/auditor/portal/audit-logs${toQueryString(params as Record<string, unknown>)}`, token);
}

// ─── Policy Templates ─────────────────────────────────────────────

export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: {
    name: string;
    description: string;
    rules: Array<{
      name: string;
      effect: "allow" | "deny" | "escalate";
      priority: number;
      conditions: Array<{ field: string; operator: string; value: unknown }>;
    }>;
    targets: {
      actions?: string[];
      resources?: string[];
      agentIds?: string[];
      agentTags?: string[];
    };
    enabled: boolean;
  };
}

export async function fetchPolicyTemplates(category?: string): Promise<PolicyTemplate[]> {
  const qs = category ? `?category=${category}` : "";
  return request<PolicyTemplate[]>(`/api/v1/policy-templates${qs}`);
}

// ─── Trust Center ───────────────────────────────────────────────

export interface TrustCenterConfig {
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

export async function fetchTrustCenterConfig(): Promise<TrustCenterConfig> {
  return request<TrustCenterConfig>("/api/v1/trust-center/config");
}

export async function updateTrustCenterConfig(data: Partial<TrustCenterConfig>): Promise<TrustCenterConfig> {
  return request<TrustCenterConfig>("/api/v1/trust-center/config", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function enableTrustCenter(): Promise<TrustCenterConfig> {
  return request<TrustCenterConfig>("/api/v1/trust-center/config/enable", { method: "POST" });
}

export async function disableTrustCenter(): Promise<TrustCenterConfig> {
  return request<TrustCenterConfig>("/api/v1/trust-center/config/disable", { method: "POST" });
}

// ─── Questionnaire Automation ───────────────────────────────────

export interface QuestionnaireQuestion {
  id: string;
  question: string;
  category?: string;
}

export interface QuestionnaireAnswer {
  questionId: string;
  question: string;
  answer: string;
  confidence: "high" | "medium" | "low";
  supportingEvidence: string[];
  controlReferences: string[];
}

export interface QuestionnaireResponse {
  id: string;
  tenantId: string;
  questionnaireTitle: string;
  questions: QuestionnaireQuestion[];
  responses: QuestionnaireAnswer[];
  status: "draft" | "completed" | "exported";
  generatedAt: string;
  updatedAt: string;
}

export async function generateQuestionnaire(data: {
  title: string;
  questions: QuestionnaireQuestion[];
}): Promise<QuestionnaireResponse> {
  return request<QuestionnaireResponse>("/api/v1/questionnaire/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchQuestionnaires(): Promise<QuestionnaireResponse[]> {
  return request<QuestionnaireResponse[]>("/api/v1/questionnaire");
}

export async function fetchQuestionnaire(id: string): Promise<QuestionnaireResponse> {
  return request<QuestionnaireResponse>(`/api/v1/questionnaire/${id}`);
}

export async function exportQuestionnaire(id: string): Promise<QuestionnaireResponse> {
  return request<QuestionnaireResponse>(`/api/v1/questionnaire/${id}/export`, { method: "POST" });
}

// ─── Integrations ───────────────────────────────────────────────

export interface IntegrationConfig {
  id: string;
  tenantId: string;
  integrationType: string;
  enabled: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationSyncResult {
  pushed: number;
  pulled: number;
  errors: string[];
  syncedAt: string;
}

export async function fetchIntegrations(): Promise<IntegrationConfig[]> {
  return request<IntegrationConfig[]>("/api/v1/integrations");
}

export async function configureVanta(data: { apiKey: string; baseUrl?: string }): Promise<{ id: string; configured: boolean }> {
  return request("/api/v1/integrations/vanta/configure", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function pushToVanta(): Promise<IntegrationSyncResult> {
  return request<IntegrationSyncResult>("/api/v1/integrations/vanta/push", { method: "POST" });
}

export async function syncFromVanta(): Promise<IntegrationSyncResult> {
  return request<IntegrationSyncResult>("/api/v1/integrations/vanta/sync", { method: "POST" });
}

export async function fetchIntegrationStatus(type: string): Promise<{
  id: string;
  integrationType: string;
  enabled: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
}> {
  return request(`/api/v1/integrations/${type}/status`);
}

// ─── Vendor Agents ──────────────────────────────────────────────

export interface VendorAgent {
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
  riskLevel: "low" | "medium" | "high" | "critical";
  assessmentStatus: "not_assessed" | "in_progress" | "assessed" | "needs_review";
  complianceClaims: Record<string, boolean>;
  lastAssessedAt: string | null;
  nextReviewDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VendorAgentAssessment {
  id: string;
  vendorAgentId: string;
  tenantId: string;
  assessorId: string;
  assessmentType: string;
  findings: Array<{ category: string; finding: string; severity: string; status: string }>;
  overallRiskScore: number;
  recommendation: string;
  notes: string | null;
  assessedAt: string;
}

export interface VendorAgentStats {
  total: number;
  byRiskLevel: Record<string, number>;
  byAssessmentStatus: Record<string, number>;
  avgRiskScore: number;
  needsReview: number;
}

export async function fetchVendorAgents(): Promise<VendorAgent[]> {
  return request<VendorAgent[]>("/api/v1/vendor-agents");
}

export async function fetchVendorAgentStats(): Promise<VendorAgentStats> {
  return request<VendorAgentStats>("/api/v1/vendor-agents/stats");
}

export async function createVendorAgent(data: {
  vendorName: string;
  agentName: string;
  description: string;
  vendorUrl?: string;
  contactEmail?: string;
  capabilities?: string[];
  dataAccess?: string[];
  complianceClaims?: Record<string, boolean>;
}): Promise<VendorAgent> {
  return request<VendorAgent>("/api/v1/vendor-agents", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteVendorAgent(id: string): Promise<void> {
  return request<void>(`/api/v1/vendor-agents/${id}`, { method: "DELETE" });
}

export async function assessVendorAgent(id: string, data?: {
  assessmentType?: string;
  notes?: string;
}): Promise<VendorAgentAssessment> {
  return request<VendorAgentAssessment>(`/api/v1/vendor-agents/${id}/assess`, {
    method: "POST",
    body: JSON.stringify(data ?? {}),
  });
}

export async function fetchVendorAgentAssessments(id: string): Promise<VendorAgentAssessment[]> {
  return request<VendorAgentAssessment[]>(`/api/v1/vendor-agents/${id}/assessments`);
}
