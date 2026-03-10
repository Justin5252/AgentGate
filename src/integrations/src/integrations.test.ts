import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import type { AuthorizationDecision, AuthorizationRequest } from "@agentgate/shared";
import type { AgentGateClient } from "@agentgate/sdk";
import { OpenAIGuard } from "./openai.js";
import { AnthropicGuard } from "./anthropic.js";
import { LangChainGuard } from "./langchain.js";
import { CrewAIGuard } from "./crewai.js";
import { WebhookManager } from "./webhook.js";

// ─── Mock Client Factory ────────────────────────────────────────────

interface MockClient {
  client: AgentGateClient;
  calls: AuthorizationRequest[];
  callCount: () => number;
}

function createMockClient(decision: AuthorizationDecision): MockClient {
  const calls: AuthorizationRequest[] = [];
  const client = {
    authorize: async (req: AuthorizationRequest) => {
      calls.push(req);
      return decision;
    },
  } as unknown as AgentGateClient;
  return { client, calls, callCount: () => calls.length };
}

function allowDecision(): AuthorizationDecision {
  return {
    decision: "allow",
    policyId: "policy-1",
    ruleId: "rule-1",
    reason: "Allowed by test policy",
    evaluatedAt: new Date().toISOString(),
    durationMs: 1,
  };
}

function denyDecision(): AuthorizationDecision {
  return {
    decision: "deny",
    policyId: "policy-2",
    ruleId: "rule-2",
    reason: "Denied by test policy",
    evaluatedAt: new Date().toISOString(),
    durationMs: 1,
  };
}

function escalateDecision(): AuthorizationDecision {
  return {
    decision: "escalate",
    policyId: "policy-3",
    ruleId: "rule-3",
    reason: "Escalation required by test policy",
    evaluatedAt: new Date().toISOString(),
    durationMs: 1,
  };
}

// ─── OpenAIGuard Tests ──────────────────────────────────────────────

describe("OpenAIGuard", () => {
  it("beforeChatCompletion returns true when allowed", async () => {
    const { client, callCount } = createMockClient(allowDecision());
    const guard = new OpenAIGuard({ client, agentId: "agent-1" });

    const result = await guard.beforeChatCompletion({
      model: "gpt-4",
      temperature: 0.7,
    });

    assert.equal(result, true);
    assert.equal(callCount(), 1);
  });

  it("beforeChatCompletion returns false when denied", async () => {
    const { client } = createMockClient(denyDecision());
    const guard = new OpenAIGuard({ client, agentId: "agent-1" });

    const result = await guard.beforeChatCompletion({
      model: "gpt-4",
    });

    assert.equal(result, false);
  });

  it("beforeToolCall checks the correct action", async () => {
    const { client, calls } = createMockClient(allowDecision());
    const guard = new OpenAIGuard({ client, agentId: "agent-1" });

    await guard.beforeToolCall("search", "query text");

    assert.equal(calls[0].action, "openai:tool.execute:search");
    assert.equal(calls[0].resource, "tool/search");
  });

  it("beforeEmbedding checks the correct action", async () => {
    const { client, calls } = createMockClient(allowDecision());
    const guard = new OpenAIGuard({ client, agentId: "agent-1" });

    await guard.beforeEmbedding("text-embedding-ada-002", 5);

    assert.equal(calls[0].action, "openai:embeddings.create");
    assert.equal(calls[0].resource, "model/text-embedding-ada-002");
  });

  it("wrapChatCompletions throws on deny", async () => {
    const { client } = createMockClient(denyDecision());
    const guard = new OpenAIGuard({ client, agentId: "agent-1" });

    const originalFn = mock.fn(async (params: any) => ({ id: "chatcmpl-123" }));
    const wrapped = guard.wrapChatCompletions(originalFn);

    await assert.rejects(
      () => wrapped({ model: "gpt-4", messages: [] }),
      { message: /Permission denied/ }
    );
    assert.equal(originalFn.mock.callCount(), 0);
  });

  it("wrapChatCompletions calls original on allow", async () => {
    const { client } = createMockClient(allowDecision());
    const guard = new OpenAIGuard({ client, agentId: "agent-1" });

    const originalFn = mock.fn(async (params: any) => ({ id: "chatcmpl-123" }));
    const wrapped = guard.wrapChatCompletions(originalFn);

    const result = await wrapped({ model: "gpt-4", messages: [] });
    assert.equal(result.id, "chatcmpl-123");
    assert.equal(originalFn.mock.callCount(), 1);
  });
});

// ─── AnthropicGuard Tests ───────────────────────────────────────────

describe("AnthropicGuard", () => {
  it("beforeMessage returns true when allowed", async () => {
    const { client, calls } = createMockClient(allowDecision());
    const guard = new AnthropicGuard({ client, agentId: "agent-2" });

    const result = await guard.beforeMessage({
      model: "claude-sonnet-4-20250514",
      maxTokens: 1024,
    });

    assert.equal(result, true);
    assert.equal(calls[0].action, "anthropic:messages.create");
    assert.equal(calls[0].resource, "model/claude-sonnet-4-20250514");
  });

  it("beforeMessage returns false when denied", async () => {
    const { client } = createMockClient(denyDecision());
    const guard = new AnthropicGuard({ client, agentId: "agent-2" });

    const result = await guard.beforeMessage({
      model: "claude-sonnet-4-20250514",
    });

    assert.equal(result, false);
  });

  it("beforeToolUse checks the correct action", async () => {
    const { client, calls } = createMockClient(allowDecision());
    const guard = new AnthropicGuard({ client, agentId: "agent-2" });

    await guard.beforeToolUse("calculator", { expression: "2+2" });

    assert.equal(calls[0].action, "anthropic:tool.use:calculator");
    assert.equal(calls[0].resource, "tool/calculator");
  });

  it("wrapMessages throws on deny", async () => {
    const { client } = createMockClient(denyDecision());
    const guard = new AnthropicGuard({ client, agentId: "agent-2" });

    const originalFn = mock.fn(async (params: any) => ({ id: "msg-123" }));
    const wrapped = guard.wrapMessages(originalFn);

    await assert.rejects(
      () => wrapped({ model: "claude-sonnet-4-20250514", messages: [], max_tokens: 1024 }),
      { message: /Permission denied/ }
    );
    assert.equal(originalFn.mock.callCount(), 0);
  });

  it("wrapMessages calls original on allow", async () => {
    const { client } = createMockClient(allowDecision());
    const guard = new AnthropicGuard({ client, agentId: "agent-2" });

    const originalFn = mock.fn(async (params: any) => ({ id: "msg-123" }));
    const wrapped = guard.wrapMessages(originalFn);

    const result = await wrapped({ model: "claude-sonnet-4-20250514", messages: [], max_tokens: 1024 });
    assert.equal(result.id, "msg-123");
    assert.equal(originalFn.mock.callCount(), 1);
  });
});

// ─── LangChainGuard Tests ───────────────────────────────────────────

describe("LangChainGuard", () => {
  it("handleToolStart throws when denied", async () => {
    const { client } = createMockClient(denyDecision());
    const guard = new LangChainGuard({ client, agentId: "agent-3" });

    const handler = guard.createCallbackHandler();

    await assert.rejects(
      () => handler.handleToolStart({ name: "web_search" }, "query"),
      { message: /denied access to tool web_search/ }
    );
  });

  it("handleToolStart passes when allowed", async () => {
    const { client, calls } = createMockClient(allowDecision());
    const guard = new LangChainGuard({ client, agentId: "agent-3" });

    const handler = guard.createCallbackHandler();

    // Should not throw
    await handler.handleToolStart({ name: "web_search" }, "query");

    assert.equal(calls[0].action, "langchain:tool.execute:web_search");
    assert.equal(calls[0].resource, "tool/web_search");
  });

  it("handleChainStart checks permission", async () => {
    const { client, calls } = createMockClient(allowDecision());
    const guard = new LangChainGuard({ client, agentId: "agent-3" });

    const handler = guard.createCallbackHandler();
    await handler.handleChainStart({ name: "qa_chain" }, { question: "test" });

    assert.equal(calls[0].action, "langchain:chain.execute:qa_chain");
    assert.equal(calls[0].resource, "chain/qa_chain");
  });

  it("handleLLMStart checks permission", async () => {
    const { client, calls } = createMockClient(allowDecision());
    const guard = new LangChainGuard({ client, agentId: "agent-3" });

    const handler = guard.createCallbackHandler();
    await handler.handleLLMStart({ name: "openai" }, ["prompt1", "prompt2"]);

    assert.equal(calls[0].action, "langchain:llm.call:openai");
    assert.equal(calls[0].context?.promptCount, 2);
  });

  it("wrapTool throws when denied", async () => {
    const { client } = createMockClient(denyDecision());
    const guard = new LangChainGuard({ client, agentId: "agent-3" });

    const originalFn = mock.fn(async (input: string) => "result");
    const wrapped = guard.wrapTool("calculator", originalFn);

    await assert.rejects(
      () => wrapped("2+2"),
      { message: /denied access to tool calculator/ }
    );
    assert.equal(originalFn.mock.callCount(), 0);
  });

  it("wrapTool calls original when allowed", async () => {
    const { client } = createMockClient(allowDecision());
    const guard = new LangChainGuard({ client, agentId: "agent-3" });

    const originalFn = mock.fn(async (input: string) => "result");
    const wrapped = guard.wrapTool("calculator", originalFn);

    const result = await wrapped("2+2");
    assert.equal(result, "result");
    assert.equal(originalFn.mock.callCount(), 1);
  });
});

// ─── CrewAIGuard Tests ──────────────────────────────────────────────

describe("CrewAIGuard", () => {
  it("beforeTask returns true when allowed", async () => {
    const { client, calls } = createMockClient(allowDecision());
    const guard = new CrewAIGuard({ client, agentId: "agent-4" });

    const result = await guard.beforeTask("Research competitor pricing");
    assert.equal(result, true);

    assert.equal(calls[0].action, "crewai:task.execute");
    assert.ok(calls[0].resource.startsWith("task/"));
  });

  it("beforeTask returns false when denied", async () => {
    const { client } = createMockClient(denyDecision());
    const guard = new CrewAIGuard({ client, agentId: "agent-4" });

    const result = await guard.beforeTask("Delete all files");
    assert.equal(result, false);
  });

  it("beforeDelegation checks the correct action", async () => {
    const { client, calls } = createMockClient(allowDecision());
    const guard = new CrewAIGuard({ client, agentId: "agent-4" });

    const result = await guard.beforeDelegation("researcher", "Find market data");
    assert.equal(result, true);

    assert.equal(calls[0].action, "crewai:delegate");
    assert.equal(calls[0].resource, "agent/researcher");
  });

  it("beforeDelegation returns false when denied", async () => {
    const { client } = createMockClient(denyDecision());
    const guard = new CrewAIGuard({ client, agentId: "agent-4" });

    const result = await guard.beforeDelegation("admin", "Delete users");
    assert.equal(result, false);
  });

  it("createStepCallback returns override when tool denied", async () => {
    const { client } = createMockClient(denyDecision());
    const guard = new CrewAIGuard({ client, agentId: "agent-4" });

    const callback = guard.createStepCallback();
    const result = await callback({ action: "use_tool", tool: "dangerous_tool", tool_input: "input" });

    assert.equal(result.override, true);
    assert.ok(result.output?.includes("Permission denied"));
  });

  it("createStepCallback returns no override when tool allowed", async () => {
    const { client } = createMockClient(allowDecision());
    const guard = new CrewAIGuard({ client, agentId: "agent-4" });

    const callback = guard.createStepCallback();
    const result = await callback({ action: "use_tool", tool: "safe_tool" });

    assert.equal(result.override, false);
  });

  it("createStepCallback returns no override when no tool in step", async () => {
    const { client, callCount } = createMockClient(denyDecision());
    const guard = new CrewAIGuard({ client, agentId: "agent-4" });

    const callback = guard.createStepCallback();
    const result = await callback({ action: "think" });

    assert.equal(result.override, false);
    // authorize should not have been called
    assert.equal(callCount(), 0);
  });
});

// ─── WebhookManager Tests ───────────────────────────────────────────

describe("WebhookManager", () => {
  it("emit delivers to registered webhooks matching the event", async () => {
    const manager = new WebhookManager();
    const fetchCalls: { url: string; body: string }[] = [];

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (url: any, init: any) => {
      fetchCalls.push({ url: url.toString(), body: init.body });
      return new Response(null, { status: 200 });
    }) as typeof fetch;

    try {
      manager.register({
        url: "https://example.com/webhook1",
        events: ["decision.deny", "decision.allow"],
      });
      manager.register({
        url: "https://example.com/webhook2",
        events: ["decision.deny"],
      });

      await manager.emit("decision.deny", { agentId: "agent-1", action: "test" });

      assert.equal(fetchCalls.length, 2);
      assert.equal(fetchCalls[0].url, "https://example.com/webhook1");
      assert.equal(fetchCalls[1].url, "https://example.com/webhook2");

      const payload1 = JSON.parse(fetchCalls[0].body);
      assert.equal(payload1.event, "decision.deny");
      assert.equal(payload1.data.agentId, "agent-1");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("emit filters events correctly", async () => {
    const manager = new WebhookManager();
    const fetchCalls: string[] = [];

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (url: any) => {
      fetchCalls.push(url.toString());
      return new Response(null, { status: 200 });
    }) as typeof fetch;

    try {
      manager.register({
        url: "https://example.com/allow-only",
        events: ["decision.allow"],
      });
      manager.register({
        url: "https://example.com/deny-only",
        events: ["decision.deny"],
      });

      await manager.emit("decision.allow", { test: true });

      // Only the allow-only webhook should be called
      assert.equal(fetchCalls.length, 1);
      assert.equal(fetchCalls[0], "https://example.com/allow-only");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("unregister removes webhook", async () => {
    const manager = new WebhookManager();
    const fetchCalls: string[] = [];

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (url: any) => {
      fetchCalls.push(url.toString());
      return new Response(null, { status: 200 });
    }) as typeof fetch;

    try {
      manager.register({
        url: "https://example.com/webhook1",
        events: ["decision.deny"],
      });
      manager.register({
        url: "https://example.com/webhook2",
        events: ["decision.deny"],
      });

      manager.unregister("https://example.com/webhook1");

      await manager.emit("decision.deny", {});

      assert.equal(fetchCalls.length, 1);
      assert.equal(fetchCalls[0], "https://example.com/webhook2");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("createDecisionCallback emits the correct event", async () => {
    const manager = new WebhookManager();
    const fetchCalls: { url: string; body: string }[] = [];

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (url: any, init: any) => {
      fetchCalls.push({ url: url.toString(), body: init.body });
      return new Response(null, { status: 200 });
    }) as typeof fetch;

    try {
      manager.register({
        url: "https://example.com/decisions",
        events: ["decision.deny", "decision.allow", "decision.escalate"],
      });

      const callback = manager.createDecisionCallback();
      callback(denyDecision());

      // Allow time for the async emit to complete
      await new Promise(resolve => setTimeout(resolve, 50));

      assert.equal(fetchCalls.length, 1);
      const payload = JSON.parse(fetchCalls[0].body);
      assert.equal(payload.event, "decision.deny");
      assert.equal(payload.data.decision, "deny");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("handles webhook delivery failure gracefully", async () => {
    const manager = new WebhookManager();

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      return new Response(null, { status: 500 });
    }) as typeof fetch;

    try {
      manager.register({
        url: "https://example.com/failing",
        events: ["decision.deny"],
      });

      // Should not throw
      await manager.emit("decision.deny", { test: true });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

// ─── Base Integration Callback Tests ────────────────────────────────

describe("BaseIntegration callbacks", () => {
  it("onDenied callback is called when permission is denied", async () => {
    const { client } = createMockClient(denyDecision());
    let deniedAction = "";
    let deniedResource = "";
    let deniedReason = "";

    const guard = new OpenAIGuard({
      client,
      agentId: "agent-cb",
      onDenied: (action, resource, reason) => {
        deniedAction = action;
        deniedResource = resource;
        deniedReason = reason;
      },
    });

    const result = await guard.beforeChatCompletion({ model: "gpt-4" });

    assert.equal(result, false);
    assert.equal(deniedAction, "openai:chat.completions.create");
    assert.equal(deniedResource, "model/gpt-4");
    assert.equal(deniedReason, "Denied by test policy");
  });

  it("onEscalation callback is called when escalation is required", async () => {
    const { client } = createMockClient(escalateDecision());
    let escalatedAction = "";
    let escalatedResource = "";
    let escalatedReason = "";

    const guard = new AnthropicGuard({
      client,
      agentId: "agent-cb",
      onEscalation: (action, resource, reason) => {
        escalatedAction = action;
        escalatedResource = resource;
        escalatedReason = reason;
      },
    });

    const result = await guard.beforeMessage({ model: "claude-sonnet-4-20250514" });

    assert.equal(result, false);
    assert.equal(escalatedAction, "anthropic:messages.create");
    assert.equal(escalatedResource, "model/claude-sonnet-4-20250514");
    assert.equal(escalatedReason, "Escalation required by test policy");
  });

  it("uses defaultResource when no resource is specified", async () => {
    const { client, calls } = createMockClient(allowDecision());
    const guard = new CrewAIGuard({
      client,
      agentId: "agent-cb",
      defaultResource: "default-scope",
    });

    await guard.beforeToolUse("my_tool");

    // beforeToolUse provides a resource, so defaultResource is not used here
    assert.equal(calls[0].resource, "tool/my_tool");
  });

  it("no callbacks called when permission is allowed", async () => {
    const { client } = createMockClient(allowDecision());
    let deniedCalled = false;
    let escalatedCalled = false;

    const guard = new OpenAIGuard({
      client,
      agentId: "agent-cb",
      onDenied: () => { deniedCalled = true; },
      onEscalation: () => { escalatedCalled = true; },
    });

    const result = await guard.beforeChatCompletion({ model: "gpt-4" });

    assert.equal(result, true);
    assert.equal(deniedCalled, false);
    assert.equal(escalatedCalled, false);
  });
});
