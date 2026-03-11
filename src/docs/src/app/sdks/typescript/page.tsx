"use client";

import { CodeBlock, type CodeTab } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { ParamTable, type Param } from "@/components/ParamTable";

/* ------------------------------------------------------------------ */
/*  Code Tabs                                                          */
/* ------------------------------------------------------------------ */

const installTabs: CodeTab[] = [
  {
    label: "npm",
    language: "bash",
    code: `npm install @agentgate/sdk`,
    content: (
      <code>
        <span className="code-function">npm</span> install @agentgate/sdk
      </code>
    ),
  },
  {
    label: "yarn",
    language: "bash",
    code: `yarn add @agentgate/sdk`,
    content: (
      <code>
        <span className="code-function">yarn</span> add @agentgate/sdk
      </code>
    ),
  },
  {
    label: "pnpm",
    language: "bash",
    code: `pnpm add @agentgate/sdk`,
    content: (
      <code>
        <span className="code-function">pnpm</span> add @agentgate/sdk
      </code>
    ),
  },
];

const initTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { AgentGateClient } from "@agentgate/sdk";

const gate = new AgentGateClient({
  baseUrl: "https://api.agentgate.dev",
  apiKey: process.env.AGENTGATE_KEY!,
});`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">{"{ AgentGateClient }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/sdk&quot;</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">gate</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">AgentGateClient</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">baseUrl</span><span className="code-operator">:</span> <span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,{"\n"}
        {"  "}<span className="code-property">apiKey</span><span className="code-operator">:</span> <span className="code-variable">process</span><span className="code-operator">.</span><span className="code-variable">env</span><span className="code-operator">.</span><span className="code-variable">AGENTGATE_KEY</span><span className="code-operator">!</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;
      </code>
    ),
  },
];

const initFullTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { AgentGateClient } from "@agentgate/sdk";

const gate = new AgentGateClient({
  baseUrl: "https://api.agentgate.dev",
  apiKey: process.env.AGENTGATE_KEY!,
  timeout: 15_000,   // 15 seconds
  retries: 3,
  onDecision: (decision) => {
    console.log(\`[\${decision.allowed ? "ALLOW" : "DENY"}] \${decision.action} on \${decision.resource}\`);
  },
});`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">{"{ AgentGateClient }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/sdk&quot;</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">gate</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">AgentGateClient</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">baseUrl</span><span className="code-operator">:</span> <span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,{"\n"}
        {"  "}<span className="code-property">apiKey</span><span className="code-operator">:</span> <span className="code-variable">process</span><span className="code-operator">.</span><span className="code-variable">env</span><span className="code-operator">.</span><span className="code-variable">AGENTGATE_KEY</span><span className="code-operator">!</span>,{"\n"}
        {"  "}<span className="code-property">timeout</span><span className="code-operator">:</span> <span className="code-variable">15_000</span>,{"   "}<span className="code-comment">// 15 seconds</span>{"\n"}
        {"  "}<span className="code-property">retries</span><span className="code-operator">:</span> <span className="code-variable">3</span>,{"\n"}
        {"  "}<span className="code-property">onDecision</span><span className="code-operator">:</span> <span className="code-operator">(</span><span className="code-variable">decision</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">log</span><span className="code-operator">(</span><span className="code-string">{"\"Decision:\""}</span>, <span className="code-variable">decision</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-operator">{"}"},</span>{"\n"}
        <span className="code-operator">{"})"}</span>;
      </code>
    ),
  },
];

const agentTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `// Create an agent
const agent = await gate.createAgent({
  name: "research-bot",
  type: "autonomous",
  ownerId: "team-ml",
  metadata: { model: "gpt-4", department: "research" },
});
console.log(agent.id); // UUIDv7

// Get an agent
const fetched = await gate.getAgent(agent.id);

// List agents with filters
const { agents, total } = await gate.listAgents({
  status: "active",
  ownerId: "team-ml",
  limit: 20,
  offset: 0,
});

// Update an agent
const updated = await gate.updateAgent(agent.id, {
  metadata: { model: "gpt-4-turbo", department: "research" },
});

// Revoke an agent
await gate.revokeAgent(agent.id);`,
    content: (
      <code>
        <span className="code-comment">// Create an agent</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">agent</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">createAgent</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">name</span><span className="code-operator">:</span> <span className="code-string">&quot;research-bot&quot;</span>,{"\n"}
        {"  "}<span className="code-property">type</span><span className="code-operator">:</span> <span className="code-string">&quot;autonomous&quot;</span>,{"\n"}
        {"  "}<span className="code-property">ownerId</span><span className="code-operator">:</span> <span className="code-string">&quot;team-ml&quot;</span>,{"\n"}
        {"  "}<span className="code-property">metadata</span><span className="code-operator">:</span> <span className="code-operator">{"{"}</span> <span className="code-property">model</span><span className="code-operator">:</span> <span className="code-string">&quot;gpt-4&quot;</span>, <span className="code-property">department</span><span className="code-operator">:</span> <span className="code-string">&quot;research&quot;</span> <span className="code-operator">{"}"}</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n"}
        <span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">log</span><span className="code-operator">(</span><span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">id</span><span className="code-operator">)</span>; <span className="code-comment">// UUIDv7</span>{"\n\n"}
        <span className="code-comment">// Get an agent</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">fetched</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">getAgent</span><span className="code-operator">(</span><span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">id</span><span className="code-operator">)</span>;{"\n\n"}
        <span className="code-comment">// List agents with filters</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">{"{ agents, total }"}</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">listAgents</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">status</span><span className="code-operator">:</span> <span className="code-string">&quot;active&quot;</span>,{"\n"}
        {"  "}<span className="code-property">ownerId</span><span className="code-operator">:</span> <span className="code-string">&quot;team-ml&quot;</span>,{"\n"}
        {"  "}<span className="code-property">limit</span><span className="code-operator">:</span> <span className="code-variable">20</span>,{"\n"}
        {"  "}<span className="code-property">offset</span><span className="code-operator">:</span> <span className="code-variable">0</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// Update an agent</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">updated</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">updateAgent</span><span className="code-operator">(</span><span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">id</span>, <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-property">metadata</span><span className="code-operator">:</span> <span className="code-operator">{"{"}</span> <span className="code-property">model</span><span className="code-operator">:</span> <span className="code-string">&quot;gpt-4-turbo&quot;</span>, <span className="code-property">department</span><span className="code-operator">:</span> <span className="code-string">&quot;research&quot;</span> <span className="code-operator">{"}"}</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// Revoke an agent</span>{"\n"}
        <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">revokeAgent</span><span className="code-operator">(</span><span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">id</span><span className="code-operator">)</span>;
      </code>
    ),
  },
];

const policyTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `// Create a policy
const policy = await gate.createPolicy({
  name: "allow-read-documents",
  effect: "allow",
  actions: ["read", "list"],
  resources: ["documents/*"],
  conditions: {
    "agent.metadata.department": { equals: "research" },
  },
});

// List policies
const { policies, total } = await gate.listPolicies({
  enabled: true,
  limit: 50,
  offset: 0,
});

// Update a policy
const updated = await gate.updatePolicy(policy.id, {
  actions: ["read", "list", "summarize"],
});

// Delete a policy
await gate.deletePolicy(policy.id);`,
    content: (
      <code>
        <span className="code-comment">// Create a policy</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">policy</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">createPolicy</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">name</span><span className="code-operator">:</span> <span className="code-string">&quot;allow-read-documents&quot;</span>,{"\n"}
        {"  "}<span className="code-property">effect</span><span className="code-operator">:</span> <span className="code-string">&quot;allow&quot;</span>,{"\n"}
        {"  "}<span className="code-property">actions</span><span className="code-operator">:</span> [<span className="code-string">&quot;read&quot;</span>, <span className="code-string">&quot;list&quot;</span>],{"\n"}
        {"  "}<span className="code-property">resources</span><span className="code-operator">:</span> [<span className="code-string">&quot;documents/*&quot;</span>],{"\n"}
        {"  "}<span className="code-property">conditions</span><span className="code-operator">:</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-string">&quot;agent.metadata.department&quot;</span><span className="code-operator">:</span> <span className="code-operator">{"{"}</span> <span className="code-property">equals</span><span className="code-operator">:</span> <span className="code-string">&quot;research&quot;</span> <span className="code-operator">{"}"}</span>,{"\n"}
        {"  "}<span className="code-operator">{"}"},</span>{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// List policies</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">{"{ policies, total }"}</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">listPolicies</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">enabled</span><span className="code-operator">:</span> <span className="code-keyword">true</span>,{"\n"}
        {"  "}<span className="code-property">limit</span><span className="code-operator">:</span> <span className="code-variable">50</span>,{"\n"}
        {"  "}<span className="code-property">offset</span><span className="code-operator">:</span> <span className="code-variable">0</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// Update a policy</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">updated</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">updatePolicy</span><span className="code-operator">(</span><span className="code-variable">policy</span><span className="code-operator">.</span><span className="code-property">id</span>, <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-property">actions</span><span className="code-operator">:</span> [<span className="code-string">&quot;read&quot;</span>, <span className="code-string">&quot;list&quot;</span>, <span className="code-string">&quot;summarize&quot;</span>],{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// Delete a policy</span>{"\n"}
        <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">deletePolicy</span><span className="code-operator">(</span><span className="code-variable">policy</span><span className="code-operator">.</span><span className="code-property">id</span><span className="code-operator">)</span>;
      </code>
    ),
  },
];

const authTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `// Quick boolean check
const allowed = await gate.can(agent.id, "read", "documents/report.pdf");

// Guard — throws AgentGateError on deny
try {
  await gate.guard(agent.id, "delete", "documents/report.pdf");
  // Proceed with deletion...
} catch (err) {
  console.error("Access denied:", err.message);
}

// Full authorization with detailed decision
const decision = await gate.authorize({
  agentId: agent.id,
  action: "write",
  resource: "documents/draft.md",
  context: {
    ip: "10.0.1.42",
    time: new Date().toISOString(),
  },
});

if (decision.allowed) {
  console.log("Matched policies:", decision.matchedPolicies);
} else {
  console.log("Denied reason:", decision.reason);
}`,
    content: (
      <code>
        <span className="code-comment">// Quick boolean check</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">allowed</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">can</span><span className="code-operator">(</span><span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">id</span>, <span className="code-string">&quot;read&quot;</span>, <span className="code-string">&quot;documents/report.pdf&quot;</span><span className="code-operator">)</span>;{"\n\n"}
        <span className="code-comment">// Guard -- throws AgentGateError on deny</span>{"\n"}
        <span className="code-keyword">try</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">guard</span><span className="code-operator">(</span><span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">id</span>, <span className="code-string">&quot;delete&quot;</span>, <span className="code-string">&quot;documents/report.pdf&quot;</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-comment">// Proceed with deletion...</span>{"\n"}
        <span className="code-operator">{"}"}</span> <span className="code-keyword">catch</span> <span className="code-operator">(</span><span className="code-variable">err</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">error</span><span className="code-operator">(</span><span className="code-string">&quot;Access denied:&quot;</span>, <span className="code-variable">err</span><span className="code-operator">.</span><span className="code-property">message</span><span className="code-operator">)</span>;{"\n"}
        <span className="code-operator">{"}"}</span>{"\n\n"}
        <span className="code-comment">// Full authorization with detailed decision</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">decision</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">authorize</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">agentId</span><span className="code-operator">:</span> <span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">id</span>,{"\n"}
        {"  "}<span className="code-property">action</span><span className="code-operator">:</span> <span className="code-string">&quot;write&quot;</span>,{"\n"}
        {"  "}<span className="code-property">resource</span><span className="code-operator">:</span> <span className="code-string">&quot;documents/draft.md&quot;</span>,{"\n"}
        {"  "}<span className="code-property">context</span><span className="code-operator">:</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-property">ip</span><span className="code-operator">:</span> <span className="code-string">&quot;10.0.1.42&quot;</span>,{"\n"}
        {"    "}<span className="code-property">time</span><span className="code-operator">:</span> <span className="code-keyword">new</span> <span className="code-type">Date</span><span className="code-operator">().</span><span className="code-function">toISOString</span><span className="code-operator">()</span>,{"\n"}
        {"  "}<span className="code-operator">{"}"},</span>{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-keyword">if</span> <span className="code-operator">(</span><span className="code-variable">decision</span><span className="code-operator">.</span><span className="code-property">allowed</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">log</span><span className="code-operator">(</span><span className="code-string">&quot;Matched policies:&quot;</span>, <span className="code-variable">decision</span><span className="code-operator">.</span><span className="code-property">matchedPolicies</span><span className="code-operator">)</span>;{"\n"}
        <span className="code-operator">{"}"}</span> <span className="code-keyword">else</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">log</span><span className="code-operator">(</span><span className="code-string">&quot;Denied reason:&quot;</span>, <span className="code-variable">decision</span><span className="code-operator">.</span><span className="code-property">reason</span><span className="code-operator">)</span>;{"\n"}
        <span className="code-operator">{"}"}</span>
      </code>
    ),
  },
];

const auditTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `const { entries, total } = await gate.queryAudit({
  agentId: agent.id,
  action: "write",
  allowed: false,
  from: "2026-03-01T00:00:00Z",
  to: "2026-03-11T23:59:59Z",
  limit: 100,
  offset: 0,
});

for (const entry of entries) {
  console.log(\`\${entry.timestamp} | \${entry.action} on \${entry.resource} => \${entry.allowed}\`);
}`,
    content: (
      <code>
        <span className="code-keyword">const</span> <span className="code-variable">{"{ entries, total }"}</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">queryAudit</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">agentId</span><span className="code-operator">:</span> <span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">id</span>,{"\n"}
        {"  "}<span className="code-property">action</span><span className="code-operator">:</span> <span className="code-string">&quot;write&quot;</span>,{"\n"}
        {"  "}<span className="code-property">allowed</span><span className="code-operator">:</span> <span className="code-keyword">false</span>,{"\n"}
        {"  "}<span className="code-property">from</span><span className="code-operator">:</span> <span className="code-string">&quot;2026-03-01T00:00:00Z&quot;</span>,{"\n"}
        {"  "}<span className="code-property">to</span><span className="code-operator">:</span> <span className="code-string">&quot;2026-03-11T23:59:59Z&quot;</span>,{"\n"}
        {"  "}<span className="code-property">limit</span><span className="code-operator">:</span> <span className="code-variable">100</span>,{"\n"}
        {"  "}<span className="code-property">offset</span><span className="code-operator">:</span> <span className="code-variable">0</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-keyword">for</span> <span className="code-operator">(</span><span className="code-keyword">const</span> <span className="code-variable">entry</span> <span className="code-keyword">of</span> <span className="code-variable">entries</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">log</span><span className="code-operator">(</span><span className="code-string">{"`${entry.timestamp} | ${entry.action} on ${entry.resource} => ${entry.allowed}`"}</span><span className="code-operator">)</span>;{"\n"}
        <span className="code-operator">{"}"}</span>
      </code>
    ),
  },
];

const middlewareTabs: CodeTab[] = [
  {
    label: "Express",
    language: "typescript",
    code: `import { createAgentMiddleware } from "@agentgate/sdk";

const agentAuth = createAgentMiddleware(gate, {
  extractAgentId: (req) => req.headers["x-agent-id"] as string,
  extractAction: (req) => req.method.toLowerCase(),
  extractResource: (req) => req.path,
});

app.use("/api/documents", agentAuth);`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">{"{ createAgentMiddleware }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/sdk&quot;</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">agentAuth</span> <span className="code-operator">=</span> <span className="code-function">createAgentMiddleware</span><span className="code-operator">(</span><span className="code-variable">gate</span>, <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-property">extractAgentId</span><span className="code-operator">:</span> <span className="code-operator">(</span><span className="code-variable">req</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-variable">req</span><span className="code-operator">.</span><span className="code-variable">headers</span>[<span className="code-string">&quot;x-agent-id&quot;</span>] <span className="code-keyword">as</span> <span className="code-type">string</span>,{"\n"}
        {"  "}<span className="code-property">extractAction</span><span className="code-operator">:</span> <span className="code-operator">(</span><span className="code-variable">req</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-variable">req</span><span className="code-operator">.</span><span className="code-variable">method</span><span className="code-operator">.</span><span className="code-function">toLowerCase</span><span className="code-operator">()</span>,{"\n"}
        {"  "}<span className="code-property">extractResource</span><span className="code-operator">:</span> <span className="code-operator">(</span><span className="code-variable">req</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-variable">req</span><span className="code-operator">.</span><span className="code-variable">path</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-variable">app</span><span className="code-operator">.</span><span className="code-function">use</span><span className="code-operator">(</span><span className="code-string">&quot;/api/documents&quot;</span>, <span className="code-variable">agentAuth</span><span className="code-operator">)</span>;
      </code>
    ),
  },
  {
    label: "Wrapper",
    language: "typescript",
    code: `import { withAuthorization } from "@agentgate/sdk";

const protectedHandler = withAuthorization(gate, {
  agentId: "agent-123",
  action: "execute",
  resource: "tasks/summarize",
}, async () => {
  // This only runs if authorized
  return await summarizeDocument();
});

const result = await protectedHandler();`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">{"{ withAuthorization }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/sdk&quot;</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">protectedHandler</span> <span className="code-operator">=</span> <span className="code-function">withAuthorization</span><span className="code-operator">(</span><span className="code-variable">gate</span>, <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-property">agentId</span><span className="code-operator">:</span> <span className="code-string">&quot;agent-123&quot;</span>,{"\n"}
        {"  "}<span className="code-property">action</span><span className="code-operator">:</span> <span className="code-string">&quot;execute&quot;</span>,{"\n"}
        {"  "}<span className="code-property">resource</span><span className="code-operator">:</span> <span className="code-string">&quot;tasks/summarize&quot;</span>,{"\n"}
        <span className="code-operator">{"},"}</span> <span className="code-keyword">async</span> <span className="code-operator">()</span> <span className="code-keyword">=&gt;</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-comment">// This only runs if authorized</span>{"\n"}
        {"  "}<span className="code-keyword">return</span> <span className="code-keyword">await</span> <span className="code-function">summarizeDocument</span><span className="code-operator">()</span>;{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">result</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-function">protectedHandler</span><span className="code-operator">()</span>;
      </code>
    ),
  },
];

const errorTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { AgentGateClient, AgentGateError } from "@agentgate/sdk";

try {
  await gate.guard("agent-123", "delete", "production/database");
} catch (err) {
  if (err instanceof AgentGateError) {
    console.error("Code:", err.code);       // "AUTHORIZATION_DENIED"
    console.error("Message:", err.message); // "Agent not permitted to delete production/database"
    console.error("Details:", err.details); // { matchedPolicies: [], reason: "..." }
  }
}`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">{"{ AgentGateClient, AgentGateError }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/sdk&quot;</span>;{"\n\n"}
        <span className="code-keyword">try</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">guard</span><span className="code-operator">(</span><span className="code-string">&quot;agent-123&quot;</span>, <span className="code-string">&quot;delete&quot;</span>, <span className="code-string">&quot;production/database&quot;</span><span className="code-operator">)</span>;{"\n"}
        <span className="code-operator">{"}"}</span> <span className="code-keyword">catch</span> <span className="code-operator">(</span><span className="code-variable">err</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-keyword">if</span> <span className="code-operator">(</span><span className="code-variable">err</span> <span className="code-keyword">instanceof</span> <span className="code-type">AgentGateError</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">error</span><span className="code-operator">(</span><span className="code-string">&quot;Code:&quot;</span>, <span className="code-variable">err</span><span className="code-operator">.</span><span className="code-property">code</span><span className="code-operator">)</span>;{"       "}<span className="code-comment">// &quot;AUTHORIZATION_DENIED&quot;</span>{"\n"}
        {"    "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">error</span><span className="code-operator">(</span><span className="code-string">&quot;Message:&quot;</span>, <span className="code-variable">err</span><span className="code-operator">.</span><span className="code-property">message</span><span className="code-operator">)</span>; <span className="code-comment">// &quot;Agent not permitted to...&quot;</span>{"\n"}
        {"    "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">error</span><span className="code-operator">(</span><span className="code-string">&quot;Details:&quot;</span>, <span className="code-variable">err</span><span className="code-operator">.</span><span className="code-property">details</span><span className="code-operator">)</span>; <span className="code-comment">{"// { matchedPolicies: [], reason: \"...\" }"}</span>{"\n"}
        {"  "}<span className="code-operator">{"}"}</span>{"\n"}
        <span className="code-operator">{"}"}</span>
      </code>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Param definitions                                                  */
/* ------------------------------------------------------------------ */

const clientParams: Param[] = [
  { name: "baseUrl", type: "string", required: true, description: "The AgentGate API base URL." },
  { name: "apiKey", type: "string", required: true, description: "Your API key for authentication." },
  { name: "timeout", type: "number", description: "Request timeout in milliseconds. Default: 10,000." },
  { name: "retries", type: "number", description: "Number of automatic retries on failure. Default: 2." },
  { name: "onDecision", type: "(decision: AuthorizationDecision) => void", description: "Global callback invoked after every authorization decision." },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function TypeScriptSDKPage() {
  return (
    <div>
      {/* Title */}
      <h1 className="gradient-text" style={{ fontSize: "2.25rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
        TypeScript SDK
      </h1>
      <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: 40, maxWidth: 640, lineHeight: 1.7 }}>
        The official TypeScript client for AgentGate. Manage agent identities, enforce policies, and query audit logs from any Node.js or edge runtime.
      </p>

      {/* Installation */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Installation</h2>
        <CodeBlock tabs={installTabs} />
        <Callout type="info" title="Requirements">
          Node.js 18+ or any runtime with a global <code style={{ color: "var(--blue)" }}>fetch</code> implementation.
        </Callout>
      </section>

      {/* Initialization */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Initialization</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Create a client instance with your API base URL and key. All methods return typed Promises.
        </p>
        <CodeBlock tabs={initTabs} />
      </section>

      {/* Client Options */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Client Options</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Pass additional options to customize timeout, retry behavior, and decision logging.
        </p>
        <ParamTable title="AgentGateClientOptions" params={clientParams} />
        <CodeBlock tabs={initFullTabs} />
      </section>

      {/* Agent Management */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Agent Management</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Every AI agent gets a unique UUIDv7 identity. Create, list, update, and revoke agents through the client.
        </p>
        <CodeBlock tabs={agentTabs} />
      </section>

      {/* Policy Management */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Policy Management</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Policies define what agents can and cannot do. Combine role-based and attribute-based conditions for fine-grained access control.
        </p>
        <CodeBlock tabs={policyTabs} />
      </section>

      {/* Authorization */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Authorization</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Three ways to check permissions, from simplest to most detailed:
        </p>
        <ul style={{ color: "var(--text-secondary)", lineHeight: 2, paddingLeft: 20, marginBottom: 16 }}>
          <li><code style={{ color: "var(--blue)" }}>can()</code> — returns a boolean.</li>
          <li><code style={{ color: "var(--blue)" }}>guard()</code> — throws <code style={{ color: "var(--teal)" }}>AgentGateError</code> on deny.</li>
          <li><code style={{ color: "var(--blue)" }}>authorize()</code> — returns the full <code style={{ color: "var(--teal)" }}>AuthorizationDecision</code> object.</li>
        </ul>
        <CodeBlock tabs={authTabs} />
      </section>

      {/* Audit Queries */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Audit Queries</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Every authorization decision is recorded to an append-only audit trail. Query it by agent, action, time range, or outcome.
        </p>
        <CodeBlock tabs={auditTabs} />
      </section>

      {/* Middleware */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Middleware</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Drop-in middleware for Express, Fastify, or any HTTP framework. The SDK also exports a <code style={{ color: "var(--blue)" }}>withAuthorization</code> wrapper for protecting individual functions.
        </p>
        <CodeBlock tabs={middlewareTabs} />
      </section>

      {/* Error Handling */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Error Handling</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          All errors thrown by the SDK are instances of <code style={{ color: "var(--blue)" }}>AgentGateError</code>, which includes a machine-readable <code style={{ color: "var(--teal)" }}>code</code>, a human-readable <code style={{ color: "var(--teal)" }}>message</code>, and optional <code style={{ color: "var(--teal)" }}>details</code>.
        </p>
        <CodeBlock tabs={errorTabs} />
      </section>

      {/* Retry & Timeout */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Retry &amp; Timeout</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 0 }}>
          The client automatically retries failed requests with exponential backoff. By default, it retries up to <strong style={{ color: "var(--text-primary)" }}>2 times</strong> with a <strong style={{ color: "var(--text-primary)" }}>10-second</strong> timeout per request. Both values are configurable via the <code style={{ color: "var(--blue)" }}>retries</code> and <code style={{ color: "var(--blue)" }}>timeout</code> options.
        </p>
        <Callout type="tip" title="Idempotency">
          All read operations (<code style={{ color: "var(--blue)" }}>getAgent</code>, <code style={{ color: "var(--blue)" }}>listAgents</code>, <code style={{ color: "var(--blue)" }}>can</code>, <code style={{ color: "var(--blue)" }}>queryAudit</code>) are safe to retry. Write operations are retried only on network errors, not on 4xx responses.
        </Callout>
      </section>
    </div>
  );
}
