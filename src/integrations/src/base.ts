import type { AgentGateClient } from "@agentgate/sdk";

export interface IntegrationConfig {
  client: AgentGateClient;
  agentId: string;
  defaultResource?: string;
  onDenied?: (action: string, resource: string, reason: string) => void;
  onEscalation?: (action: string, resource: string, reason: string) => void;
}

export abstract class BaseIntegration {
  protected client: AgentGateClient;
  protected agentId: string;
  protected defaultResource: string;
  protected onDenied?: (action: string, resource: string, reason: string) => void;
  protected onEscalation?: (action: string, resource: string, reason: string) => void;

  constructor(config: IntegrationConfig) {
    this.client = config.client;
    this.agentId = config.agentId;
    this.defaultResource = config.defaultResource || "*";
    this.onDenied = config.onDenied;
    this.onEscalation = config.onEscalation;
  }

  protected async checkPermission(action: string, resource?: string, context?: Record<string, unknown>): Promise<boolean> {
    const decision = await this.client.authorize({
      agentId: this.agentId,
      action,
      resource: resource || this.defaultResource,
      context,
    });

    if (decision.decision === "deny") {
      this.onDenied?.(action, resource || this.defaultResource, decision.reason);
      return false;
    }
    if (decision.decision === "escalate") {
      this.onEscalation?.(action, resource || this.defaultResource, decision.reason);
      return false;
    }
    return true;
  }
}
