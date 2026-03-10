import { BaseIntegration, type IntegrationConfig } from "./base.js";

export interface OpenAICallContext {
  model: string;
  messages?: Array<{ role: string; content: string }>;
  tools?: Array<{ function: { name: string } }>;
  temperature?: number;
}

export class OpenAIGuard extends BaseIntegration {
  /**
   * Check permission before making a chat completion request.
   * Action format: "openai:chat.completions.create"
   * Resource format: "model/{modelName}"
   */
  async beforeChatCompletion(params: OpenAICallContext): Promise<boolean> {
    return this.checkPermission(
      "openai:chat.completions.create",
      `model/${params.model}`,
      {
        model: params.model,
        hasTools: (params.tools?.length ?? 0) > 0,
        toolCount: params.tools?.length ?? 0,
        temperature: params.temperature,
      }
    );
  }

  /**
   * Check permission before a function/tool call is executed.
   */
  async beforeToolCall(toolName: string, toolInput: string): Promise<boolean> {
    return this.checkPermission(
      `openai:tool.execute:${toolName}`,
      `tool/${toolName}`,
      { toolInput }
    );
  }

  /**
   * Check permission before an embedding request.
   */
  async beforeEmbedding(model: string, inputCount: number): Promise<boolean> {
    return this.checkPermission(
      "openai:embeddings.create",
      `model/${model}`,
      { inputCount }
    );
  }

  /**
   * Wraps an OpenAI-like client's chat.completions.create method.
   * Returns a proxy function that checks permissions first.
   */
  wrapChatCompletions<T extends (...args: any[]) => any>(originalFn: T): T {
    const guard = this;
    return (async function(this: any, params: any, ...rest: any[]) {
      const allowed = await guard.beforeChatCompletion({
        model: params.model,
        messages: params.messages,
        tools: params.tools,
        temperature: params.temperature,
      });
      if (!allowed) {
        throw new Error(`AgentGate: Permission denied for chat completion with model ${params.model}`);
      }
      return originalFn.call(this, params, ...rest);
    }) as unknown as T;
  }
}
