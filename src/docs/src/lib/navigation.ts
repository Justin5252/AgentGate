export type NavItem = {
  title: string;
  href: string;
  children?: NavItem[];
};

export const navigation: NavItem[] = [
  { title: "Overview", href: "/" },
  { title: "Getting Started", href: "/getting-started" },
  {
    title: "API Reference",
    href: "/api-reference",
    children: [
      { title: "Agents", href: "/api-reference/agents" },
      { title: "Policies", href: "/api-reference/policies" },
      { title: "Audit", href: "/api-reference/audit" },
      { title: "Tenants", href: "/api-reference/tenants" },
      { title: "API Keys", href: "/api-reference/api-keys" },
      { title: "SSO", href: "/api-reference/sso" },
      { title: "SCIM", href: "/api-reference/scim" },
      { title: "Auth", href: "/api-reference/auth" },
      { title: "Anomaly Detection", href: "/api-reference/anomaly-detection" },
      { title: "A2A Channels", href: "/api-reference/a2a" },
      { title: "Compliance", href: "/api-reference/compliance" },
      { title: "Billing", href: "/api-reference/billing" },
    ],
  },
  {
    title: "SDKs",
    href: "/sdks",
    children: [
      { title: "TypeScript", href: "/sdks/typescript" },
      { title: "Python", href: "/sdks/python" },
      { title: "Go", href: "/sdks/go" },
    ],
  },
  {
    title: "Integrations",
    href: "/integrations",
    children: [
      { title: "OpenAI", href: "/integrations/openai" },
      { title: "Anthropic", href: "/integrations/anthropic" },
      { title: "LangChain", href: "/integrations/langchain" },
      { title: "CrewAI", href: "/integrations/crewai" },
      { title: "Webhooks", href: "/integrations/webhooks" },
    ],
  },
  { title: "Concepts", href: "/concepts" },
];
