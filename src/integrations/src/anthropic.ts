import { BaseIntegration, type IntegrationConfig } from "./base.js";

export interface AnthropicCallContext {
  model: string;
  messages?: Array<{ role: string; content: string }>;
  tools?: Array<{ name: string }>;
  maxTokens?: number;
}

export class AnthropicGuard extends BaseIntegration {
  async beforeMessage(params: AnthropicCallContext): Promise<boolean> {
    return this.checkPermission(
      "anthropic:messages.create",
      `model/${params.model}`,
      {
        model: params.model,
        hasTools: (params.tools?.length ?? 0) > 0,
        toolCount: params.tools?.length ?? 0,
        maxTokens: params.maxTokens,
      }
    );
  }

  async beforeToolUse(toolName: string, toolInput: Record<string, unknown>): Promise<boolean> {
    return this.checkPermission(
      `anthropic:tool.use:${toolName}`,
      `tool/${toolName}`,
      { toolInput }
    );
  }

  wrapMessages<T extends (...args: any[]) => any>(originalFn: T): T {
    const guard = this;
    return (async function(this: any, params: any, ...rest: any[]) {
      const allowed = await guard.beforeMessage({
        model: params.model,
        messages: params.messages,
        tools: params.tools,
        maxTokens: params.max_tokens,
      });
      if (!allowed) {
        throw new Error(`AgentGate: Permission denied for message with model ${params.model}`);
      }
      return originalFn.call(this, params, ...rest);
    }) as unknown as T;
  }
}
