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
    code: `npm install @agentgate/sdk @agentgate/integrations @anthropic-ai/sdk`,
    content: (
      <code>
        <span className="code-function">npm</span> install @agentgate/sdk @agentgate/integrations @anthropic-ai/sdk
      </code>
    ),
  },
];

const setupTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { AgentGateClient } from "@agentgate/sdk";
import { AnthropicGuard } from "@agentgate/integrations";
import Anthropic from "@anthropic-ai/sdk";

const gate = new AgentGateClient({
  baseUrl: "https://api.agentgate.dev",
  apiKey: process.env.AGENTGATE_KEY!,
});

const anthropic = new Anthropic();

const guard = new AnthropicGuard({
  client: gate,
  agentId: "agent-analyst-bot",
  defaultResource: "anthropic/messages",
  onDenied: (action, resource, reason) => {
    console.warn(\`Denied: \${action} on \${resource} — \${reason}\`);
  },
});`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">{"{ AgentGateClient }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/sdk&quot;</span>;{"\n"}
        <span className="code-keyword">import</span> <span className="code-variable">{"{ AnthropicGuard }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/integrations&quot;</span>;{"\n"}
        <span className="code-keyword">import</span> <span className="code-type">Anthropic</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@anthropic-ai/sdk&quot;</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">gate</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">AgentGateClient</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">baseUrl</span><span className="code-operator">:</span> <span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,{"\n"}
        {"  "}<span className="code-property">apiKey</span><span className="code-operator">:</span> <span className="code-variable">process</span><span className="code-operator">.</span><span className="code-variable">env</span><span className="code-operator">.</span><span className="code-variable">AGENTGATE_KEY</span><span className="code-operator">!</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">anthropic</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">Anthropic</span><span className="code-operator">()</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">guard</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">AnthropicGuard</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">client</span><span className="code-operator">:</span> <span className="code-variable">gate</span>,{"\n"}
        {"  "}<span className="code-property">agentId</span><span className="code-operator">:</span> <span className="code-string">&quot;agent-analyst-bot&quot;</span>,{"\n"}
        {"  "}<span className="code-property">defaultResource</span><span className="code-operator">:</span> <span className="code-string">&quot;anthropic/messages&quot;</span>,{"\n"}
        {"  "}<span className="code-property">onDenied</span><span className="code-operator">:</span> <span className="code-operator">(</span><span className="code-variable">action</span>, <span className="code-variable">resource</span>, <span className="code-variable">reason</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">warn</span><span className="code-operator">(</span><span className="code-string">{"`Denied: ${action} on ${resource} — ${reason}`"}</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-operator">{"}"},</span>{"\n"}
        <span className="code-operator">{"})"}</span>;
      </code>
    ),
  },
];

const beforeMessageTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `const allowed = await guard.beforeMessage({
  model: "claude-sonnet-4-20250514",
  messages: [{ role: "user", content: "Analyze this dataset" }],
  tools: [{ name: "query_database", description: "Run SQL queries" }],
  maxTokens: 4096,
});

if (allowed) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: "Analyze this dataset" }],
  });
}`,
    content: (
      <code>
        <span className="code-keyword">const</span> <span className="code-variable">allowed</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">guard</span><span className="code-operator">.</span><span className="code-function">beforeMessage</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">model</span><span className="code-operator">:</span> <span className="code-string">&quot;claude-sonnet-4-20250514&quot;</span>,{"\n"}
        {"  "}<span className="code-property">messages</span><span className="code-operator">:</span> [<span className="code-operator">{"{"}</span> <span className="code-property">role</span><span className="code-operator">:</span> <span className="code-string">&quot;user&quot;</span>, <span className="code-property">content</span><span className="code-operator">:</span> <span className="code-string">&quot;Analyze this dataset&quot;</span> <span className="code-operator">{"}"}</span>],{"\n"}
        {"  "}<span className="code-property">tools</span><span className="code-operator">:</span> [<span className="code-operator">{"{"}</span> <span className="code-property">name</span><span className="code-operator">:</span> <span className="code-string">&quot;query_database&quot;</span>, <span className="code-property">description</span><span className="code-operator">:</span> <span className="code-string">&quot;Run SQL queries&quot;</span> <span className="code-operator">{"}"}</span>],{"\n"}
        {"  "}<span className="code-property">maxTokens</span><span className="code-operator">:</span> <span className="code-variable">4096</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-keyword">if</span> <span className="code-operator">(</span><span className="code-variable">allowed</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-keyword">const</span> <span className="code-variable">response</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">anthropic</span><span className="code-operator">.</span><span className="code-variable">messages</span><span className="code-operator">.</span><span className="code-function">create</span><span className="code-operator">({"{"}</span>{"\n"}
        {"    "}<span className="code-property">model</span><span className="code-operator">:</span> <span className="code-string">&quot;claude-sonnet-4-20250514&quot;</span>,{"\n"}
        {"    "}<span className="code-property">max_tokens</span><span className="code-operator">:</span> <span className="code-variable">4096</span>,{"\n"}
        {"    "}<span className="code-property">messages</span><span className="code-operator">:</span> [<span className="code-operator">{"{"}</span> <span className="code-property">role</span><span className="code-operator">:</span> <span className="code-string">&quot;user&quot;</span>, <span className="code-property">content</span><span className="code-operator">:</span> <span className="code-string">&quot;Analyze this dataset&quot;</span> <span className="code-operator">{"}"}</span>],{"\n"}
        {"  "}<span className="code-operator">{"})"}</span>;{"\n"}
        <span className="code-operator">{"}"}</span>
      </code>
    ),
  },
];

const beforeToolUseTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `// When Claude returns a tool_use content block
const toolBlock = response.content.find((b) => b.type === "tool_use");

if (toolBlock) {
  const allowed = await guard.beforeToolUse(toolBlock.name, toolBlock.input);

  if (allowed) {
    const result = await executeTool(toolBlock.name, toolBlock.input);
  }
}`,
    content: (
      <code>
        <span className="code-comment">// When Claude returns a tool_use content block</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">toolBlock</span> <span className="code-operator">=</span> <span className="code-variable">response</span><span className="code-operator">.</span><span className="code-variable">content</span><span className="code-operator">.</span><span className="code-function">find</span><span className="code-operator">((</span><span className="code-variable">b</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-variable">b</span><span className="code-operator">.</span><span className="code-property">type</span> <span className="code-operator">===</span> <span className="code-string">&quot;tool_use&quot;</span><span className="code-operator">)</span>;{"\n\n"}
        <span className="code-keyword">if</span> <span className="code-operator">(</span><span className="code-variable">toolBlock</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-keyword">const</span> <span className="code-variable">allowed</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">guard</span><span className="code-operator">.</span><span className="code-function">beforeToolUse</span><span className="code-operator">(</span><span className="code-variable">toolBlock</span><span className="code-operator">.</span><span className="code-property">name</span>, <span className="code-variable">toolBlock</span><span className="code-operator">.</span><span className="code-property">input</span><span className="code-operator">)</span>;{"\n\n"}
        {"  "}<span className="code-keyword">if</span> <span className="code-operator">(</span><span className="code-variable">allowed</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-keyword">const</span> <span className="code-variable">result</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-function">executeTool</span><span className="code-operator">(</span><span className="code-variable">toolBlock</span><span className="code-operator">.</span><span className="code-property">name</span>, <span className="code-variable">toolBlock</span><span className="code-operator">.</span><span className="code-property">input</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-operator">{"}"}</span>{"\n"}
        <span className="code-operator">{"}"}</span>
      </code>
    ),
  },
];

const wrapTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `// Wrap the Anthropic messages API — recommended approach
const protectedCreate = guard.wrapMessages(
  anthropic.messages.create.bind(anthropic.messages)
);

// Now every call is automatically guarded
const response = await protectedCreate({
  model: "claude-sonnet-4-20250514",
  max_tokens: 4096,
  messages: [{ role: "user", content: "Summarize the quarterly report" }],
});

// If denied, throws AgentGateError instead of making the API call`,
    content: (
      <code>
        <span className="code-comment">// Wrap the Anthropic messages API -- recommended approach</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">protectedCreate</span> <span className="code-operator">=</span> <span className="code-variable">guard</span><span className="code-operator">.</span><span className="code-function">wrapMessages</span><span className="code-operator">(</span>{"\n"}
        {"  "}<span className="code-variable">anthropic</span><span className="code-operator">.</span><span className="code-variable">messages</span><span className="code-operator">.</span><span className="code-variable">create</span><span className="code-operator">.</span><span className="code-function">bind</span><span className="code-operator">(</span><span className="code-variable">anthropic</span><span className="code-operator">.</span><span className="code-variable">messages</span><span className="code-operator">)</span>{"\n"}
        <span className="code-operator">)</span>;{"\n\n"}
        <span className="code-comment">// Now every call is automatically guarded</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">response</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-function">protectedCreate</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">model</span><span className="code-operator">:</span> <span className="code-string">&quot;claude-sonnet-4-20250514&quot;</span>,{"\n"}
        {"  "}<span className="code-property">max_tokens</span><span className="code-operator">:</span> <span className="code-variable">4096</span>,{"\n"}
        {"  "}<span className="code-property">messages</span><span className="code-operator">:</span> [<span className="code-operator">{"{"}</span> <span className="code-property">role</span><span className="code-operator">:</span> <span className="code-string">&quot;user&quot;</span>, <span className="code-property">content</span><span className="code-operator">:</span> <span className="code-string">&quot;Summarize the quarterly report&quot;</span> <span className="code-operator">{"}"}</span>],{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// If denied, throws AgentGateError instead of making the API call</span>
      </code>
    ),
  },
];

const fullExampleTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { AgentGateClient } from "@agentgate/sdk";
import { AnthropicGuard } from "@agentgate/integrations";
import Anthropic from "@anthropic-ai/sdk";

const gate = new AgentGateClient({
  baseUrl: "https://api.agentgate.dev",
  apiKey: process.env.AGENTGATE_KEY!,
});

const anthropic = new Anthropic();

const guard = new AnthropicGuard({
  client: gate,
  agentId: "agent-analyst-bot",
  defaultResource: "anthropic/messages",
  onDenied: (action, resource, reason) => {
    console.warn(\`[DENIED] \${action} on \${resource}: \${reason}\`);
  },
  onEscalation: (action, resource, reason) => {
    console.warn(\`[ESCALATION] \${action} on \${resource}: \${reason}\`);
  },
});

// Wrap for automatic enforcement
const protectedCreate = guard.wrapMessages(
  anthropic.messages.create.bind(anthropic.messages)
);

// Use like the original API
const response = await protectedCreate({
  model: "claude-sonnet-4-20250514",
  max_tokens: 4096,
  system: "You are a financial analyst.",
  messages: [
    { role: "user", content: "What were the key revenue drivers in Q4?" },
  ],
  tools: [
    {
      name: "query_financials",
      description: "Query the financial database",
      input_schema: {
        type: "object",
        properties: { query: { type: "string" } },
      },
    },
  ],
});

// Handle tool use with authorization
for (const block of response.content) {
  if (block.type === "tool_use") {
    const allowed = await guard.beforeToolUse(block.name, block.input);
    if (allowed) {
      const result = await executeFinancialQuery(block.input);
      console.log("Tool result:", result);
    }
  }
}`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">{"{ AgentGateClient }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/sdk&quot;</span>;{"\n"}
        <span className="code-keyword">import</span> <span className="code-variable">{"{ AnthropicGuard }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/integrations&quot;</span>;{"\n"}
        <span className="code-keyword">import</span> <span className="code-type">Anthropic</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@anthropic-ai/sdk&quot;</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">gate</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">AgentGateClient</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">baseUrl</span><span className="code-operator">:</span> <span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,{"\n"}
        {"  "}<span className="code-property">apiKey</span><span className="code-operator">:</span> <span className="code-variable">process</span><span className="code-operator">.</span><span className="code-variable">env</span><span className="code-operator">.</span><span className="code-variable">AGENTGATE_KEY</span><span className="code-operator">!</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">anthropic</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">Anthropic</span><span className="code-operator">()</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">guard</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">AnthropicGuard</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">client</span><span className="code-operator">:</span> <span className="code-variable">gate</span>,{"\n"}
        {"  "}<span className="code-property">agentId</span><span className="code-operator">:</span> <span className="code-string">&quot;agent-analyst-bot&quot;</span>,{"\n"}
        {"  "}<span className="code-property">defaultResource</span><span className="code-operator">:</span> <span className="code-string">&quot;anthropic/messages&quot;</span>,{"\n"}
        {"  "}<span className="code-property">onDenied</span><span className="code-operator">:</span> <span className="code-operator">(</span><span className="code-variable">action</span>, <span className="code-variable">resource</span>, <span className="code-variable">reason</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">warn</span><span className="code-operator">(</span><span className="code-string">{"`[DENIED] ${action} on ${resource}: ${reason}`"}</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-operator">{"}"},</span>{"\n"}
        {"  "}<span className="code-property">onEscalation</span><span className="code-operator">:</span> <span className="code-operator">(</span><span className="code-variable">action</span>, <span className="code-variable">resource</span>, <span className="code-variable">reason</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">warn</span><span className="code-operator">(</span><span className="code-string">{"`[ESCALATION] ${action} on ${resource}: ${reason}`"}</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-operator">{"}"},</span>{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// Wrap for automatic enforcement</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">protectedCreate</span> <span className="code-operator">=</span> <span className="code-variable">guard</span><span className="code-operator">.</span><span className="code-function">wrapMessages</span><span className="code-operator">(</span>{"\n"}
        {"  "}<span className="code-variable">anthropic</span><span className="code-operator">.</span><span className="code-variable">messages</span><span className="code-operator">.</span><span className="code-variable">create</span><span className="code-operator">.</span><span className="code-function">bind</span><span className="code-operator">(</span><span className="code-variable">anthropic</span><span className="code-operator">.</span><span className="code-variable">messages</span><span className="code-operator">)</span>{"\n"}
        <span className="code-operator">)</span>;{"\n\n"}
        <span className="code-comment">// Use like the original API</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">response</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-function">protectedCreate</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">model</span><span className="code-operator">:</span> <span className="code-string">&quot;claude-sonnet-4-20250514&quot;</span>,{"\n"}
        {"  "}<span className="code-property">max_tokens</span><span className="code-operator">:</span> <span className="code-variable">4096</span>,{"\n"}
        {"  "}<span className="code-property">system</span><span className="code-operator">:</span> <span className="code-string">&quot;You are a financial analyst.&quot;</span>,{"\n"}
        {"  "}<span className="code-property">messages</span><span className="code-operator">:</span> [{"\n"}
        {"    "}<span className="code-operator">{"{"}</span> <span className="code-property">role</span><span className="code-operator">:</span> <span className="code-string">&quot;user&quot;</span>, <span className="code-property">content</span><span className="code-operator">:</span> <span className="code-string">&quot;What were the key revenue drivers in Q4?&quot;</span> <span className="code-operator">{"}"}</span>,{"\n"}
        {"  "}],{"\n"}
        {"  "}<span className="code-property">tools</span><span className="code-operator">:</span> [{"\n"}
        {"    "}<span className="code-operator">{"{"}</span>{"\n"}
        {"      "}<span className="code-property">name</span><span className="code-operator">:</span> <span className="code-string">&quot;query_financials&quot;</span>,{"\n"}
        {"      "}<span className="code-property">description</span><span className="code-operator">:</span> <span className="code-string">&quot;Query the financial database&quot;</span>,{"\n"}
        {"      "}<span className="code-property">input_schema</span><span className="code-operator">:</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"        "}<span className="code-property">type</span><span className="code-operator">:</span> <span className="code-string">&quot;object&quot;</span>,{"\n"}
        {"        "}<span className="code-property">properties</span><span className="code-operator">:</span> <span className="code-operator">{"{"}</span> <span className="code-property">query</span><span className="code-operator">:</span> <span className="code-operator">{"{"}</span> <span className="code-property">type</span><span className="code-operator">:</span> <span className="code-string">&quot;string&quot;</span> <span className="code-operator">{"}"}</span> <span className="code-operator">{"}"}</span>,{"\n"}
        {"      "}<span className="code-operator">{"}"},</span>{"\n"}
        {"    "}<span className="code-operator">{"}"},</span>{"\n"}
        {"  "}],{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// Handle tool use with authorization</span>{"\n"}
        <span className="code-keyword">for</span> <span className="code-operator">(</span><span className="code-keyword">const</span> <span className="code-variable">block</span> <span className="code-keyword">of</span> <span className="code-variable">response</span><span className="code-operator">.</span><span className="code-property">content</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-keyword">if</span> <span className="code-operator">(</span><span className="code-variable">block</span><span className="code-operator">.</span><span className="code-property">type</span> <span className="code-operator">===</span> <span className="code-string">&quot;tool_use&quot;</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-keyword">const</span> <span className="code-variable">allowed</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">guard</span><span className="code-operator">.</span><span className="code-function">beforeToolUse</span><span className="code-operator">(</span><span className="code-variable">block</span><span className="code-operator">.</span><span className="code-property">name</span>, <span className="code-variable">block</span><span className="code-operator">.</span><span className="code-property">input</span><span className="code-operator">)</span>;{"\n"}
        {"    "}<span className="code-keyword">if</span> <span className="code-operator">(</span><span className="code-variable">allowed</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"      "}<span className="code-keyword">const</span> <span className="code-variable">result</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-function">executeFinancialQuery</span><span className="code-operator">(</span><span className="code-variable">block</span><span className="code-operator">.</span><span className="code-property">input</span><span className="code-operator">)</span>;{"\n"}
        {"      "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">log</span><span className="code-operator">(</span><span className="code-string">&quot;Tool result:&quot;</span>, <span className="code-variable">result</span><span className="code-operator">)</span>;{"\n"}
        {"    "}<span className="code-operator">{"}"}</span>{"\n"}
        {"  "}<span className="code-operator">{"}"}</span>{"\n"}
        <span className="code-operator">{"}"}</span>
      </code>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Param definitions                                                  */
/* ------------------------------------------------------------------ */

const configParams: Param[] = [
  { name: "client", type: "AgentGateClient", required: true, description: "An initialized AgentGate client instance." },
  { name: "agentId", type: "string", required: true, description: "The agent identity to authorize against." },
  { name: "defaultResource", type: "string", description: "Fallback resource identifier when none is inferred from the call." },
  { name: "onDenied", type: "(action, resource, reason) => void", description: "Callback fired when an action is denied." },
  { name: "onEscalation", type: "(action, resource, reason) => void", description: "Callback fired when an action requires human escalation." },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function AnthropicIntegrationPage() {
  return (
    <div>
      {/* Title */}
      <h1 className="gradient-text" style={{ fontSize: "2.25rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
        Anthropic Integration
      </h1>
      <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: 40, maxWidth: 640, lineHeight: 1.7 }}>
        Guard every Anthropic API call with AgentGate policies. Enforce permissions on message creation and tool use before they reach the Claude API.
      </p>

      {/* Overview */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Overview</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          The <code style={{ color: "var(--blue)" }}>AnthropicGuard</code> intercepts Anthropic SDK calls and runs authorization checks against your AgentGate policies. Use manual checks for fine-grained control, or wrap the entire messages API for automatic enforcement.
        </p>
        <Callout type="tip" title="Recommended approach">
          Use <code style={{ color: "var(--blue)" }}>wrapMessages()</code> for the simplest setup. It wraps <code style={{ color: "var(--teal)" }}>anthropic.messages.create</code> so every call is automatically guarded.
        </Callout>
      </section>

      {/* Installation */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Installation</h2>
        <CodeBlock tabs={installTabs} />
      </section>

      {/* Setup */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Setup</h2>
        <CodeBlock tabs={setupTabs} />
      </section>

      {/* Configuration */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Configuration</h2>
        <ParamTable title="IntegrationConfig" params={configParams} />
      </section>

      {/* Before Message */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Before Message</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Check authorization before creating a message. The guard evaluates the model, messages, tools, and max tokens against your policies.
        </p>
        <CodeBlock tabs={beforeMessageTabs} />
      </section>

      {/* Before Tool Use */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Before Tool Use</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          When Claude returns a <code style={{ color: "var(--blue)" }}>tool_use</code> content block, check authorization before executing the tool. The tool name becomes the action and the input is passed as context.
        </p>
        <CodeBlock tabs={beforeToolUseTabs} />
      </section>

      {/* Wrap Messages */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Wrap Messages</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          The recommended approach. <code style={{ color: "var(--blue)" }}>wrapMessages()</code> returns a drop-in replacement for <code style={{ color: "var(--teal)" }}>anthropic.messages.create</code> that automatically runs authorization before every call.
        </p>
        <CodeBlock tabs={wrapTabs} />
        <Callout type="info" title="Behavior on deny">
          When authorization is denied, the wrapped function throws an <code style={{ color: "var(--blue)" }}>AgentGateError</code> instead of making the Anthropic API call. The original function is never invoked.
        </Callout>
      </section>

      {/* Full Example */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Full Example</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          A complete setup with automatic message guarding and manual tool-use authorization in a multi-turn agent loop.
        </p>
        <CodeBlock tabs={fullExampleTabs} />
      </section>
    </div>
  );
}
