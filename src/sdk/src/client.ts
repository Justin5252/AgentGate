import type {
  AgentIdentity,
  CreateAgentRequest,
  UpdateAgentRequest,
  Policy,
  CreatePolicyRequest,
  AuthorizationRequest,
  AuthorizationDecision,
  AuditEntry,
  AuditQuery,
  ApiResponse,
  AgentStatus,
} from "@agentgate/shared";
import { AgentGateError } from "./errors.js";

export interface AgentGateClientOptions {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
  retries?: number;
  onDecision?: (decision: AuthorizationDecision) => void;
}

export class AgentGateClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;
  private readonly retries: number;
  private readonly onDecision?: (decision: AuthorizationDecision) => void;

  constructor(options: AgentGateClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.apiKey = options.apiKey;
    this.timeout = options.timeout ?? 10_000;
    this.retries = options.retries ?? 2;
    this.onDecision = options.onDecision;
  }

  // ─── Internal HTTP ───────────────────────────────────────────────

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string | number | boolean | undefined>,
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      if (attempt > 0) {
        // Exponential backoff: 200ms, 400ms, 800ms, ...
        const delay = 200 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url.toString(), {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const json = (await response.json()) as ApiResponse<T>;
        return json;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry if the request was intentionally aborted (timeout)
        if (controller.signal.aborted) {
          throw new AgentGateError(
            "TIMEOUT",
            `Request timed out after ${this.timeout}ms`,
          );
        }

        // Only retry on network errors, not on final attempt
        if (attempt === this.retries) {
          throw new AgentGateError(
            "NETWORK_ERROR",
            `Request failed after ${this.retries + 1} attempts: ${lastError.message}`,
          );
        }
      }
    }

    // Unreachable, but TypeScript needs it
    throw new AgentGateError(
      "NETWORK_ERROR",
      `Request failed: ${lastError?.message}`,
    );
  }

  private unwrap<T>(response: ApiResponse<T>): T {
    if (response.error) {
      throw new AgentGateError(
        response.error.code,
        response.error.message,
        response.error.details,
      );
    }
    return response.data as T;
  }

  // ─── Agents ──────────────────────────────────────────────────────

  async createAgent(data: CreateAgentRequest): Promise<AgentIdentity> {
    const response = await this.request<AgentIdentity>(
      "POST",
      "/api/v1/agents",
      data,
    );
    return this.unwrap(response);
  }

  async getAgent(id: string): Promise<AgentIdentity> {
    const response = await this.request<AgentIdentity>(
      "GET",
      `/api/v1/agents/${id}`,
    );
    return this.unwrap(response);
  }

  async listAgents(
    options?: {
      status?: AgentStatus;
      ownerId?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ agents: AgentIdentity[]; total: number }> {
    const response = await this.request<{
      agents: AgentIdentity[];
      total: number;
    }>(
      "GET",
      "/api/v1/agents",
      undefined,
      options as Record<string, string | number | boolean | undefined>,
    );
    return this.unwrap(response);
  }

  async updateAgent(
    id: string,
    data: UpdateAgentRequest,
  ): Promise<AgentIdentity> {
    const response = await this.request<AgentIdentity>(
      "PATCH",
      `/api/v1/agents/${id}`,
      data,
    );
    return this.unwrap(response);
  }

  async revokeAgent(id: string): Promise<void> {
    const response = await this.request<void>(
      "DELETE",
      `/api/v1/agents/${id}`,
    );
    this.unwrap(response);
  }

  // ─── Policies ────────────────────────────────────────────────────

  async createPolicy(data: CreatePolicyRequest): Promise<Policy> {
    const response = await this.request<Policy>(
      "POST",
      "/api/v1/policies",
      data,
    );
    return this.unwrap(response);
  }

  async getPolicy(id: string): Promise<Policy> {
    const response = await this.request<Policy>(
      "GET",
      `/api/v1/policies/${id}`,
    );
    return this.unwrap(response);
  }

  async listPolicies(
    options?: {
      enabled?: boolean;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ policies: Policy[]; total: number }> {
    const response = await this.request<{
      policies: Policy[];
      total: number;
    }>(
      "GET",
      "/api/v1/policies",
      undefined,
      options as Record<string, string | number | boolean | undefined>,
    );
    return this.unwrap(response);
  }

  async updatePolicy(
    id: string,
    data: Record<string, unknown>,
  ): Promise<Policy> {
    const response = await this.request<Policy>(
      "PATCH",
      `/api/v1/policies/${id}`,
      data,
    );
    return this.unwrap(response);
  }

  async deletePolicy(id: string): Promise<void> {
    const response = await this.request<void>(
      "DELETE",
      `/api/v1/policies/${id}`,
    );
    this.unwrap(response);
  }

  // ─── Authorization ───────────────────────────────────────────────

  async authorize(
    request: AuthorizationRequest,
  ): Promise<AuthorizationDecision> {
    const response = await this.request<AuthorizationDecision>(
      "POST",
      "/api/v1/authorize",
      request,
    );
    const decision = this.unwrap(response);

    if (this.onDecision) {
      this.onDecision(decision);
    }

    return decision;
  }

  async can(
    agentId: string,
    action: string,
    resource: string,
    context?: Record<string, unknown>,
  ): Promise<boolean> {
    const decision = await this.authorize({
      agentId,
      action,
      resource,
      context,
    });
    return decision.decision === "allow";
  }

  async guard(
    agentId: string,
    action: string,
    resource: string,
    context?: Record<string, unknown>,
  ): Promise<void> {
    const decision = await this.authorize({
      agentId,
      action,
      resource,
      context,
    });
    if (decision.decision !== "allow") {
      throw new AgentGateError(
        "AUTHORIZATION_DENIED",
        `Agent ${agentId} is not authorized to ${action} on ${resource}: ${decision.reason}`,
        {
          decision: decision.decision,
          policyId: decision.policyId,
          ruleId: decision.ruleId,
          reason: decision.reason,
        },
      );
    }
  }

  // ─── Audit ───────────────────────────────────────────────────────

  async queryAudit(
    query: AuditQuery,
  ): Promise<{ entries: AuditEntry[]; total: number }> {
    const response = await this.request<{
      entries: AuditEntry[];
      total: number;
    }>(
      "GET",
      "/api/v1/audit",
      undefined,
      query as Record<string, string | number | boolean | undefined>,
    );
    return this.unwrap(response);
  }
}
