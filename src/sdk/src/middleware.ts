import type { AgentGateClient } from "./client.js";

/**
 * Creates an authorization middleware function for agent pipelines.
 * Returns an async function that calls `client.guard()` — throws if not authorized.
 */
export function createAgentMiddleware(
  client: AgentGateClient,
  agentId: string,
): (
  action: string,
  resource: string,
  context?: Record<string, unknown>,
) => Promise<void> {
  return async (
    action: string,
    resource: string,
    context?: Record<string, unknown>,
  ) => {
    await client.guard(agentId, action, resource, context);
  };
}

/**
 * Higher-order function that wraps an async function with an authorization check.
 * The wrapped function only executes if the agent is authorized for the given action/resource.
 */
export function withAuthorization<TArgs extends unknown[], TResult>(
  client: AgentGateClient,
  agentId: string,
  fn: (action: string, resource: string, ...args: TArgs) => Promise<TResult>,
): (action: string, resource: string, ...args: TArgs) => Promise<TResult> {
  return async (
    action: string,
    resource: string,
    ...args: TArgs
  ): Promise<TResult> => {
    await client.guard(agentId, action, resource);
    return fn(action, resource, ...args);
  };
}

/**
 * Creates an object shaped like a LangChain tool callback handler
 * that checks authorization before tool execution.
 */
export function createLangChainTool(
  client: AgentGateClient,
  agentId: string,
): {
  handleToolStart: (
    tool: { name: string },
    input: string,
  ) => Promise<void>;
} {
  return {
    handleToolStart: async (
      tool: { name: string },
      input: string,
    ): Promise<void> => {
      await client.guard(agentId, "tool:execute", tool.name, {
        toolInput: input,
      });
    },
  };
}
