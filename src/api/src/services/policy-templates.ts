export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: {
    name: string;
    description: string;
    rules: Array<{
      name: string;
      effect: "allow" | "deny" | "escalate";
      priority: number;
      conditions: Array<{
        field: string;
        operator: string;
        value: unknown;
      }>;
    }>;
    targets: {
      actions?: string[];
      resources?: string[];
      agentIds?: string[];
      agentTags?: string[];
    };
    enabled: boolean;
  };
}

export const policyTemplates: PolicyTemplate[] = [
  {
    id: "tpl-rate-limiting",
    name: "Rate Limiting Guard",
    description: "Prevents agents from exceeding request rate thresholds by escalating high-frequency actions",
    category: "security",
    template: {
      name: "Rate Limiting Guard",
      description: "Escalate when agents perform actions at high frequency",
      rules: [
        {
          name: "Escalate burst activity",
          effect: "escalate",
          priority: 1,
          conditions: [
            { field: "context.requestsPerMinute", operator: "gt", value: 60 },
          ],
        },
      ],
      targets: { actions: ["*"], resources: ["*"] },
      enabled: true,
    },
  },
  {
    id: "tpl-data-access-control",
    name: "Data Access Control",
    description: "Restricts access to sensitive data stores based on agent risk level",
    category: "data-protection",
    template: {
      name: "Data Access Control",
      description: "Deny high-risk agents from accessing PII and sensitive data stores",
      rules: [
        {
          name: "Deny critical risk agents",
          effect: "deny",
          priority: 1,
          conditions: [
            { field: "agent.riskLevel", operator: "equals", value: "critical" },
          ],
        },
        {
          name: "Escalate high risk agents",
          effect: "escalate",
          priority: 2,
          conditions: [
            { field: "agent.riskLevel", operator: "equals", value: "high" },
          ],
        },
      ],
      targets: { resources: ["data:pii:*", "data:sensitive:*"] },
      enabled: true,
    },
  },
  {
    id: "tpl-time-based-access",
    name: "Time-Based Access",
    description: "Restricts agent operations to business hours only",
    category: "operational",
    template: {
      name: "Time-Based Access",
      description: "Escalate agent actions outside business hours (UTC 9-17)",
      rules: [
        {
          name: "Escalate outside business hours",
          effect: "escalate",
          priority: 1,
          conditions: [
            { field: "context.hour", operator: "not_in", value: [9, 10, 11, 12, 13, 14, 15, 16, 17] },
          ],
        },
      ],
      targets: { actions: ["deploy:*", "write:*"] },
      enabled: true,
    },
  },
  {
    id: "tpl-resource-scoping",
    name: "Resource Scoping",
    description: "Limits agents to their designated resource namespaces only",
    category: "access-control",
    template: {
      name: "Resource Scoping",
      description: "Deny agents from accessing resources outside their namespace",
      rules: [
        {
          name: "Deny cross-namespace access",
          effect: "deny",
          priority: 1,
          conditions: [
            { field: "resource", operator: "not_contains", value: "agent.namespace" },
          ],
        },
      ],
      targets: { actions: ["*"] },
      enabled: true,
    },
  },
  {
    id: "tpl-read-only-agents",
    name: "Read-Only Agents",
    description: "Restricts specified agents to read-only operations across all resources",
    category: "access-control",
    template: {
      name: "Read-Only Agents",
      description: "Deny all write and delete operations for tagged agents",
      rules: [
        {
          name: "Deny writes",
          effect: "deny",
          priority: 1,
          conditions: [
            { field: "action", operator: "matches", value: "^(write|delete|deploy):.*" },
          ],
        },
      ],
      targets: { agentTags: ["read-only"], resources: ["*"] },
      enabled: true,
    },
  },
];

export function getTemplates(category?: string): PolicyTemplate[] {
  if (category) {
    return policyTemplates.filter((t) => t.category === category);
  }
  return policyTemplates;
}

export function getTemplateById(id: string): PolicyTemplate | undefined {
  return policyTemplates.find((t) => t.id === id);
}
