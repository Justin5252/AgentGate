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
