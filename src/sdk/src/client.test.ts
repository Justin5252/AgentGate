import { describe, it, beforeEach, afterEach, mock } from "node:test";
import { strict as assert } from "node:assert";
import { AgentGateClient } from "./client.js";
import { AgentGateError } from "./errors.js";
import type { ApiResponse, AuthorizationDecision } from "@agentgate/shared";

// Helper to create a mock Response
function mockResponse<T>(body: ApiResponse<T>, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "OK",
    json: async () => body,
    headers: new Headers(),
    redirected: false,
    type: "basic" as Response["type"],
    url: "",
    clone: () => mockResponse(body, status),
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    text: async () => JSON.stringify(body),
    bytes: async () => new Uint8Array(),
  } as Response;
}

const allowDecision: AuthorizationDecision = {
  decision: "allow",
  policyId: "policy-1",
  ruleId: "rule-1",
  reason: "Agent is authorized",
  evaluatedAt: "2026-03-10T00:00:00Z",
  durationMs: 5,
};

const denyDecision: AuthorizationDecision = {
  decision: "deny",
  policyId: "policy-2",
  ruleId: "rule-2",
  reason: "Agent lacks required capability",
  evaluatedAt: "2026-03-10T00:00:00Z",
  durationMs: 3,
};

describe("AgentGateClient", () => {
  const originalFetch = globalThis.fetch;
  let mockFetch: ReturnType<typeof mock.fn>;

  beforeEach(() => {
    mockFetch = mock.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should construct with options", () => {
    const client = new AgentGateClient({
      baseUrl: "https://api.agentgate.dev",
      apiKey: "test-key",
      timeout: 5000,
      retries: 3,
    });
    assert.ok(client);
  });

  it("should strip trailing slashes from baseUrl", async () => {
    const client = new AgentGateClient({
      baseUrl: "https://api.agentgate.dev///",
      apiKey: "test-key",
      retries: 0,
    });

    mockFetch.mock.mockImplementation(async (url: string) => {
      assert.ok(
        !url.includes("///"),
        "URL should not contain trailing slashes from baseUrl",
      );
      return mockResponse<AuthorizationDecision>({
        data: allowDecision,
        error: null,
      });
    });

    await client.authorize({
      agentId: "agent-1",
      action: "read",
      resource: "documents",
    });

    assert.equal(mockFetch.mock.callCount(), 1);
  });

  it("should authorize and return a decision", async () => {
    const client = new AgentGateClient({
      baseUrl: "https://api.agentgate.dev",
      apiKey: "test-key",
      retries: 0,
    });

    mockFetch.mock.mockImplementation(async () =>
      mockResponse<AuthorizationDecision>({
        data: allowDecision,
        error: null,
      }),
    );

    const decision = await client.authorize({
      agentId: "agent-1",
      action: "read",
      resource: "documents",
    });

    assert.equal(decision.decision, "allow");
    assert.equal(decision.policyId, "policy-1");
    assert.equal(decision.reason, "Agent is authorized");
  });

  it("should invoke onDecision callback", async () => {
    let captured: AuthorizationDecision | null = null;

    const client = new AgentGateClient({
      baseUrl: "https://api.agentgate.dev",
      apiKey: "test-key",
      retries: 0,
      onDecision: (d) => {
        captured = d;
      },
    });

    mockFetch.mock.mockImplementation(async () =>
      mockResponse<AuthorizationDecision>({
        data: allowDecision,
        error: null,
      }),
    );

    await client.authorize({
      agentId: "agent-1",
      action: "read",
      resource: "documents",
    });

    assert.ok(captured);
    assert.equal((captured as AuthorizationDecision).decision, "allow");
  });

  it("can() should return true for allow", async () => {
    const client = new AgentGateClient({
      baseUrl: "https://api.agentgate.dev",
      apiKey: "test-key",
      retries: 0,
    });

    mockFetch.mock.mockImplementation(async () =>
      mockResponse<AuthorizationDecision>({
        data: allowDecision,
        error: null,
      }),
    );

    const result = await client.can("agent-1", "read", "documents");
    assert.equal(result, true);
  });

  it("can() should return false for deny", async () => {
    const client = new AgentGateClient({
      baseUrl: "https://api.agentgate.dev",
      apiKey: "test-key",
      retries: 0,
    });

    mockFetch.mock.mockImplementation(async () =>
      mockResponse<AuthorizationDecision>({
        data: denyDecision,
        error: null,
      }),
    );

    const result = await client.can("agent-1", "write", "documents");
    assert.equal(result, false);
  });

  it("guard() should not throw for allow", async () => {
    const client = new AgentGateClient({
      baseUrl: "https://api.agentgate.dev",
      apiKey: "test-key",
      retries: 0,
    });

    mockFetch.mock.mockImplementation(async () =>
      mockResponse<AuthorizationDecision>({
        data: allowDecision,
        error: null,
      }),
    );

    await assert.doesNotReject(async () => {
      await client.guard("agent-1", "read", "documents");
    });
  });

  it("guard() should throw AgentGateError for deny", async () => {
    const client = new AgentGateClient({
      baseUrl: "https://api.agentgate.dev",
      apiKey: "test-key",
      retries: 0,
    });

    mockFetch.mock.mockImplementation(async () =>
      mockResponse<AuthorizationDecision>({
        data: denyDecision,
        error: null,
      }),
    );

    await assert.rejects(
      async () => {
        await client.guard("agent-1", "write", "documents");
      },
      (error: unknown) => {
        assert.ok(error instanceof AgentGateError);
        assert.equal(error.code, "AUTHORIZATION_DENIED");
        assert.ok(error.message.includes("agent-1"));
        return true;
      },
    );
  });

  it("should throw AgentGateError for API errors", async () => {
    const client = new AgentGateClient({
      baseUrl: "https://api.agentgate.dev",
      apiKey: "test-key",
      retries: 0,
    });

    mockFetch.mock.mockImplementation(async () =>
      mockResponse(
        {
          data: null,
          error: {
            code: "AGENT_NOT_FOUND",
            message: "Agent not found",
            details: { agentId: "unknown" },
          },
        },
        404,
      ),
    );

    await assert.rejects(
      async () => {
        await client.getAgent("unknown");
      },
      (error: unknown) => {
        assert.ok(error instanceof AgentGateError);
        assert.equal(error.code, "AGENT_NOT_FOUND");
        assert.equal(error.message, "Agent not found");
        assert.deepEqual(error.details, { agentId: "unknown" });
        return true;
      },
    );
  });

  it("should send Authorization header with API key", async () => {
    const client = new AgentGateClient({
      baseUrl: "https://api.agentgate.dev",
      apiKey: "my-secret-key",
      retries: 0,
    });

    mockFetch.mock.mockImplementation(
      async (_url: string, init: RequestInit) => {
        const headers = init.headers as Record<string, string>;
        assert.equal(headers["Authorization"], "Bearer my-secret-key");
        return mockResponse<AuthorizationDecision>({
          data: allowDecision,
          error: null,
        });
      },
    );

    await client.authorize({
      agentId: "agent-1",
      action: "read",
      resource: "documents",
    });
  });

  it("should retry on network failure then succeed", async () => {
    const client = new AgentGateClient({
      baseUrl: "https://api.agentgate.dev",
      apiKey: "test-key",
      retries: 2,
    });

    let callCount = 0;
    mockFetch.mock.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        throw new Error("Network error");
      }
      return mockResponse<AuthorizationDecision>({
        data: allowDecision,
        error: null,
      });
    });

    const decision = await client.authorize({
      agentId: "agent-1",
      action: "read",
      resource: "documents",
    });

    assert.equal(decision.decision, "allow");
    assert.equal(callCount, 2);
  });

  it("should exhaust retries and throw on persistent failure", async () => {
    const client = new AgentGateClient({
      baseUrl: "https://api.agentgate.dev",
      apiKey: "test-key",
      retries: 1,
    });

    let callCount = 0;
    mockFetch.mock.mockImplementation(async () => {
      callCount++;
      throw new Error("Network error");
    });

    await assert.rejects(
      async () => {
        await client.authorize({
          agentId: "agent-1",
          action: "read",
          resource: "documents",
        });
      },
      (error: unknown) => {
        assert.ok(error instanceof AgentGateError);
        assert.equal(error.code, "NETWORK_ERROR");
        return true;
      },
    );

    // 1 initial attempt + 1 retry = 2
    assert.equal(callCount, 2);
  });
});
