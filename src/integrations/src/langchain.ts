import { BaseIntegration, type IntegrationConfig } from "./base.js";

export interface ToolStartEvent {
  name: string;
  input: string;
  metadata?: Record<string, unknown>;
}

export interface ChainStartEvent {
  name: string;
  inputs: Record<string, unknown>;
}

export class LangChainGuard extends BaseIntegration {
  /**
   * Returns a LangChain-compatible callback handler object.
   * Plug this into any chain, agent, or tool's callbacks array.
   */
  createCallbackHandler() {
    const guard = this;
    return {
      handleToolStart: async (_tool: { name: string }, input: string, _runId?: string, _parentRunId?: string, tags?: string[]) => {
        const toolName = _tool.name;
        const allowed = await guard.checkPermission(
          `langchain:tool.execute:${toolName}`,
          `tool/${toolName}`,
          { input, tags }
        );
        if (!allowed) {
          throw new Error(`AgentGate: Agent ${guard.agentId} denied access to tool ${toolName}`);
        }
      },
      handleChainStart: async (chain: { name: string }, inputs: Record<string, unknown>) => {
        await guard.checkPermission(
          `langchain:chain.execute:${chain.name}`,
          `chain/${chain.name}`,
          { inputs }
        );
      },
      handleLLMStart: async (_llm: { name: string }, prompts: string[]) => {
        await guard.checkPermission(
          `langchain:llm.call:${_llm.name}`,
          `llm/${_llm.name}`,
          { promptCount: prompts.length }
        );
      },
      handleRetrieverStart: async (_retriever: { name: string }, query: string) => {
        await guard.checkPermission(
          `langchain:retriever.query:${_retriever.name}`,
          `retriever/${_retriever.name}`,
          { query }
        );
      },
    };
  }

  /**
   * Wraps a LangChain tool's invoke function with permission checks.
   */
  wrapTool<T extends (...args: any[]) => any>(toolName: string, invokeFn: T): T {
    const guard = this;
    return (async function(this: any, input: any, ...rest: any[]) {
      const allowed = await guard.checkPermission(
        `langchain:tool.execute:${toolName}`,
        `tool/${toolName}`,
        { input: typeof input === "string" ? input : JSON.stringify(input) }
      );
      if (!allowed) {
        throw new Error(`AgentGate: Agent ${guard.agentId} denied access to tool ${toolName}`);
      }
      return invokeFn.call(this, input, ...rest);
    }) as unknown as T;
  }
}
