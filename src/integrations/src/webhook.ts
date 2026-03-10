import type { AuthorizationDecision } from "@agentgate/shared";

export interface WebhookConfig {
  url: string;
  secret?: string;
  events: WebhookEvent[];
  headers?: Record<string, string>;
}

export type WebhookEvent = "decision.deny" | "decision.escalate" | "decision.allow" | "agent.created" | "agent.revoked" | "anomaly.detected";

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

export class WebhookManager {
  private webhooks: WebhookConfig[] = [];

  register(config: WebhookConfig): void {
    this.webhooks.push(config);
  }

  unregister(url: string): void {
    this.webhooks = this.webhooks.filter(w => w.url !== url);
  }

  async emit(event: WebhookEvent, data: Record<string, unknown>): Promise<void> {
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    const matchingWebhooks = this.webhooks.filter(w => w.events.includes(event));

    await Promise.allSettled(
      matchingWebhooks.map(async (webhook) => {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "User-Agent": "AgentGate-Webhooks/0.1",
          ...webhook.headers,
        };

        if (webhook.secret) {
          const encoder = new TextEncoder();
          const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(webhook.secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
          );
          const signature = await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(JSON.stringify(payload))
          );
          headers["X-AgentGate-Signature"] = Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
        }

        const response = await fetch(webhook.url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          console.error(`Webhook delivery failed to ${webhook.url}: ${response.status}`);
        }
      })
    );
  }

  /**
   * Creates a decision callback that fires webhooks on deny/escalate/allow.
   */
  createDecisionCallback() {
    return (decision: AuthorizationDecision) => {
      const event: WebhookEvent = `decision.${decision.decision}` as WebhookEvent;
      this.emit(event, {
        decision: decision.decision,
        policyId: decision.policyId,
        ruleId: decision.ruleId,
        reason: decision.reason,
        durationMs: decision.durationMs,
      });
    };
  }
}
