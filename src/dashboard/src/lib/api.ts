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
