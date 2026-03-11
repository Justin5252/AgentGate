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
    code: `npm install @agentgate/sdk @agentgate/integrations openai`,
    content: (
      <code>
        <span className="code-function">npm</span> install @agentgate/sdk @agentgate/integrations openai
      </code>
    ),
  },
];

const setupTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { AgentGateClient } from "@agentgate/sdk";
import { OpenAIGuard } from "@agentgate/integrations";
import OpenAI from "openai";

const gate = new AgentGateClient({
  baseUrl: "https://api.agentgate.dev",
  apiKey: process.env.AGENTGATE_KEY!,
});

const openai = new OpenAI();

const guard = new OpenAIGuard({
  client: gate,
  agentId: "agent-research-bot",
  defaultResource: "openai/chat",
  onDenied: (action, resource, reason) => {
    console.warn(\`Denied: \${action} on \${resource} — \${reason}\`);
  },
});`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">{"{ AgentGateClient }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/sdk&quot;</span>;{"\n"}
        <span className="code-keyword">import</span> <span className="code-variable">{"{ OpenAIGuard }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/integrations&quot;</span>;{"\n"}
        <span className="code-keyword">import</span> <span className="code-type">OpenAI</span> <span className="code-keyword">from</span> <span className="code-string">&quot;openai&quot;</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">gate</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">AgentGateClient</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">baseUrl</span><span className="code-operator">:</span> <span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,{"\n"}
        {"  "}<span className="code-property">apiKey</span><span className="code-operator">:</span> <span className="code-variable">process</span><span className="code-operator">.</span><span className="code-variable">env</span><span className="code-operator">.</span><span className="code-variable">AGENTGATE_KEY</span><span className="code-operator">!</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">openai</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">OpenAI</span><span className="code-operator">()</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">guard</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">OpenAIGuard</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">client</span><span className="code-operator">:</span> <span className="code-variable">gate</span>,{"\n"}
        {"  "}<span className="code-property">agentId</span><span className="code-operator">:</span> <span className="code-string">&quot;agent-research-bot&quot;</span>,{"\n"}
        {"  "}<span className="code-property">defaultResource</span><span className="code-operator">:</span> <span className="code-string">&quot;openai/chat&quot;</span>,{"\n"}
        {"  "}<span className="code-property">onDenied</span><span className="code-operator">:</span> <span className="code-operator">(</span><span className="code-variable">action</span>, <span className="code-variable">resource</span>, <span className="code-variable">reason</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">warn</span><span className="code-operator">(</span><span className="code-string">{"`Denied: ${action} on ${resource} — ${reason}`"}</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-operator">{"}"},</span>{"\n"}
        <span className="code-operator">{"})"}</span>;
      </code>
    ),
  },
];

const beforeChatTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `const allowed = await guard.beforeChatCompletion({
  model: "gpt-4",
  messages: [{ role: "user", content: "Summarize this report" }],
  tools: [{ type: "function", function: { name: "search_db" } }],
  temperature: 0.7,
});

if (allowed) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: "Summarize this report" }],
  });
}`,
    content: (
      <code>
        <span className="code-keyword">const</span> <span className="code-variable">allowed</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">guard</span><span className="code-operator">.</span><span className="code-function">beforeChatCompletion</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">model</span><span className="code-operator">:</span> <span className="code-string">&quot;gpt-4&quot;</span>,{"\n"}
        {"  "}<span className="code-property">messages</span><span className="code-operator">:</span> [<span className="code-operator">{"{"}</span> <span className="code-property">role</span><span className="code-operator">:</span> <span className="code-string">&quot;user&quot;</span>, <span className="code-property">content</span><span className="code-operator">:</span> <span className="code-string">&quot;Summarize this report&quot;</span> <span className="code-operator">{"}"}</span>],{"\n"}
        {"  "}<span className="code-property">tools</span><span className="code-operator">:</span> [<span className="code-operator">{"{"}</span> <span className="code-property">type</span><span className="code-operator">:</span> <span className="code-string">&quot;function&quot;</span>, <span className="code-property">function</span><span className="code-operator">:</span> <span className="code-operator">{"{"}</span> <span className="code-property">name</span><span className="code-operator">:</span> <span className="code-string">&quot;search_db&quot;</span> <span className="code-operator">{"}"}</span> <span className="code-operator">{"}"}</span>],{"\n"}
        {"  "}<span className="code-property">temperature</span><span className="code-operator">:</span> <span className="code-variable">0.7</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-keyword">if</span> <span className="code-operator">(</span><span className="code-variable">allowed</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-keyword">const</span> <span className="code-variable">response</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">openai</span><span className="code-operator">.</span><span className="code-variable">chat</span><span className="code-operator">.</span><span className="code-variable">completions</span><span className="code-operator">.</span><span className="code-function">create</span><span className="code-operator">({"{"}</span>{"\n"}
        {"    "}<span className="code-property">model</span><span className="code-operator">:</span> <span className="code-string">&quot;gpt-4&quot;</span>,{"\n"}
        {"    "}<span className="code-property">messages</span><span className="code-operator">:</span> [<span className="code-operator">{"{"}</span> <span className="code-property">role</span><span className="code-operator">:</span> <span className="code-string">&quot;user&quot;</span>, <span className="code-property">content</span><span className="code-operator">:</span> <span className="code-string">&quot;Summarize this report&quot;</span> <span className="code-operator">{"}"}</span>],{"\n"}
        {"  "}<span className="code-operator">{"})"}</span>;{"\n"}
        <span className="code-operator">{"}"}</span>
      </code>
    ),
  },
];

const beforeToolTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `const allowed = await guard.beforeToolCall("search_db", '{"query": "revenue Q4"}');

if (allowed) {
  // Execute the tool call
  const result = await searchDb({ query: "revenue Q4" });
}`,
    content: (
      <code>
        <span className="code-keyword">const</span> <span className="code-variable">allowed</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">guard</span><span className="code-operator">.</span><span className="code-function">beforeToolCall</span><span className="code-operator">(</span><span className="code-string">&quot;search_db&quot;</span>, <span className="code-string">{`'{"query": "revenue Q4"}'`}</span><span className="code-operator">)</span>;{"\n\n"}
        <span className="code-keyword">if</span> <span className="code-operator">(</span><span className="code-variable">allowed</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-comment">// Execute the tool call</span>{"\n"}
        {"  "}<span className="code-keyword">const</span> <span className="code-variable">result</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-function">searchDb</span><span className="code-operator">({"{"}</span> <span className="code-property">query</span><span className="code-operator">:</span> <span className="code-string">&quot;revenue Q4&quot;</span> <span className="code-operator">{"})"}</span>;{"\n"}
        <span className="code-operator">{"}"}</span>
      </code>
    ),
  },
];

const beforeEmbeddingTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `const allowed = await guard.beforeEmbedding("text-embedding-3-small", 100);

if (allowed) {
  const embeddings = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: documents,
  });
}`,
    content: (
      <code>
        <span className="code-keyword">const</span> <span className="code-variable">allowed</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">guard</span><span className="code-operator">.</span><span className="code-function">beforeEmbedding</span><span className="code-operator">(</span><span className="code-string">&quot;text-embedding-3-small&quot;</span>, <span className="code-variable">100</span><span className="code-operator">)</span>;{"\n\n"}
        <span className="code-keyword">if</span> <span className="code-operator">(</span><span className="code-variable">allowed</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-keyword">const</span> <span className="code-variable">embeddings</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">openai</span><span className="code-operator">.</span><span className="code-variable">embeddings</span><span className="code-operator">.</span><span className="code-function">create</span><span className="code-operator">({"{"}</span>{"\n"}
        {"    "}<span className="code-property">model</span><span className="code-operator">:</span> <span className="code-string">&quot;text-embedding-3-small&quot;</span>,{"\n"}
        {"    "}<span className="code-property">input</span><span className="code-operator">:</span> <span className="code-variable">documents</span>,{"\n"}
        {"  "}<span className="code-operator">{"})"}</span>;{"\n"}
        <span className="code-operator">{"}"}</span>
      </code>
    ),
  },
];

const wrapTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `// Wrap the OpenAI completions API — recommended approach
const protectedCreate = guard.wrapChatCompletions(
  openai.chat.completions.create.bind(openai.chat.completions)
);

// Now every call is automatically guarded
const response = await protectedCreate({
  model: "gpt-4",
  messages: [{ role: "user", content: "Explain quantum computing" }],
});

// If denied, protectedCreate throws AgentGateError instead of making the API call`,
    content: (
      <code>
        <span className="code-comment">// Wrap the OpenAI completions API -- recommended approach</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">protectedCreate</span> <span className="code-operator">=</span> <span className="code-variable">guard</span><span className="code-operator">.</span><span className="code-function">wrapChatCompletions</span><span className="code-operator">(</span>{"\n"}
        {"  "}<span className="code-variable">openai</span><span className="code-operator">.</span><span className="code-variable">chat</span><span className="code-operator">.</span><span className="code-variable">completions</span><span className="code-operator">.</span><span className="code-variable">create</span><span className="code-operator">.</span><span className="code-function">bind</span><span className="code-operator">(</span><span className="code-variable">openai</span><span className="code-operator">.</span><span className="code-variable">chat</span><span className="code-operator">.</span><span className="code-variable">completions</span><span className="code-operator">)</span>{"\n"}
        <span className="code-operator">)</span>;{"\n\n"}
        <span className="code-comment">// Now every call is automatically guarded</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">response</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-function">protectedCreate</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">model</span><span className="code-operator">:</span> <span className="code-string">&quot;gpt-4&quot;</span>,{"\n"}
        {"  "}<span className="code-property">messages</span><span className="code-operator">:</span> [<span className="code-operator">{"{"}</span> <span className="code-property">role</span><span className="code-operator">:</span> <span className="code-string">&quot;user&quot;</span>, <span className="code-property">content</span><span className="code-operator">:</span> <span className="code-string">&quot;Explain quantum computing&quot;</span> <span className="code-operator">{"}"}</span>],{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// If denied, protectedCreate throws AgentGateError instead of making the API call</span>
      </code>
    ),
  },
];

const fullExampleTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { AgentGateClient } from "@agentgate/sdk";
import { OpenAIGuard } from "@agentgate/integrations";
import OpenAI from "openai";

const gate = new AgentGateClient({
  baseUrl: "https://api.agentgate.dev",
  apiKey: process.env.AGENTGATE_KEY!,
});

const openai = new OpenAI();

const guard = new OpenAIGuard({
  client: gate,
  agentId: "agent-research-bot",
  defaultResource: "openai/chat",
  onDenied: (action, resource, reason) => {
    console.warn(\`[DENIED] \${action} on \${resource}: \${reason}\`);
  },
  onEscalation: (action, resource, reason) => {
    console.warn(\`[ESCALATION] \${action} on \${resource}: \${reason}\`);
  },
});

// Wrap the completions API for automatic enforcement
const protectedCreate = guard.wrapChatCompletions(
  openai.chat.completions.create.bind(openai.chat.completions)
);

// Use it exactly like the original API
const response = await protectedCreate({
  model: "gpt-4",
  messages: [
    { role: "system", content: "You are a helpful research assistant." },
    { role: "user", content: "What are the latest trends in AI safety?" },
  ],
  temperature: 0.7,
});

console.log(response.choices[0].message.content);`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">{"{ AgentGateClient }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/sdk&quot;</span>;{"\n"}
        <span className="code-keyword">import</span> <span className="code-variable">{"{ OpenAIGuard }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/integrations&quot;</span>;{"\n"}
        <span className="code-keyword">import</span> <span className="code-type">OpenAI</span> <span className="code-keyword">from</span> <span className="code-string">&quot;openai&quot;</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">gate</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">AgentGateClient</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">baseUrl</span><span className="code-operator">:</span> <span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,{"\n"}
        {"  "}<span className="code-property">apiKey</span><span className="code-operator">:</span> <span className="code-variable">process</span><span className="code-operator">.</span><span className="code-variable">env</span><span className="code-operator">.</span><span className="code-variable">AGENTGATE_KEY</span><span className="code-operator">!</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">openai</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">OpenAI</span><span className="code-operator">()</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">guard</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">OpenAIGuard</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">client</span><span className="code-operator">:</span> <span className="code-variable">gate</span>,{"\n"}
        {"  "}<span className="code-property">agentId</span><span className="code-operator">:</span> <span className="code-string">&quot;agent-research-bot&quot;</span>,{"\n"}
        {"  "}<span className="code-property">defaultResource</span><span className="code-operator">:</span> <span className="code-string">&quot;openai/chat&quot;</span>,{"\n"}
        {"  "}<span className="code-property">onDenied</span><span className="code-operator">:</span> <span className="code-operator">(</span><span className="code-variable">action</span>, <span className="code-variable">resource</span>, <span className="code-variable">reason</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">warn</span><span className="code-operator">(</span><span className="code-string">{"`[DENIED] ${action} on ${resource}: ${reason}`"}</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-operator">{"}"},</span>{"\n"}
        {"  "}<span className="code-property">onEscalation</span><span className="code-operator">:</span> <span className="code-operator">(</span><span className="code-variable">action</span>, <span className="code-variable">resource</span>, <span className="code-variable">reason</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">warn</span><span className="code-operator">(</span><span className="code-string">{"`[ESCALATION] ${action} on ${resource}: ${reason}`"}</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-operator">{"}"},</span>{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// Wrap the completions API for automatic enforcement</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">protectedCreate</span> <span className="code-operator">=</span> <span className="code-variable">guard</span><span className="code-operator">.</span><span className="code-function">wrapChatCompletions</span><span className="code-operator">(</span>{"\n"}
        {"  "}<span className="code-variable">openai</span><span className="code-operator">.</span><span className="code-variable">chat</span><span className="code-operator">.</span><span className="code-variable">completions</span><span className="code-operator">.</span><span className="code-variable">create</span><span className="code-operator">.</span><span className="code-function">bind</span><span className="code-operator">(</span><span className="code-variable">openai</span><span className="code-operator">.</span><span className="code-variable">chat</span><span className="code-operator">.</span><span className="code-variable">completions</span><span className="code-operator">)</span>{"\n"}
        <span className="code-operator">)</span>;{"\n\n"}
        <span className="code-comment">// Use it exactly like the original API</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">response</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-function">protectedCreate</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">model</span><span className="code-operator">:</span> <span className="code-string">&quot;gpt-4&quot;</span>,{"\n"}
        {"  "}<span className="code-property">messages</span><span className="code-operator">:</span> [{"\n"}
        {"    "}<span className="code-operator">{"{"}</span> <span className="code-property">role</span><span className="code-operator">:</span> <span className="code-string">&quot;system&quot;</span>, <span className="code-property">content</span><span className="code-operator">:</span> <span className="code-string">&quot;You are a helpful research assistant.&quot;</span> <span className="code-operator">{"}"}</span>,{"\n"}
        {"    "}<span className="code-operator">{"{"}</span> <span className="code-property">role</span><span className="code-operator">:</span> <span className="code-string">&quot;user&quot;</span>, <span className="code-property">content</span><span className="code-operator">:</span> <span className="code-string">&quot;What are the latest trends in AI safety?&quot;</span> <span className="code-operator">{"}"}</span>,{"\n"}
        {"  "}],{"\n"}
        {"  "}<span className="code-property">temperature</span><span className="code-operator">:</span> <span className="code-variable">0.7</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">log</span><span className="code-operator">(</span><span className="code-variable">response</span><span className="code-operator">.</span><span className="code-variable">choices</span>[<span className="code-variable">0</span>]<span className="code-operator">.</span><span className="code-variable">message</span><span className="code-operator">.</span><span className="code-property">content</span><span className="code-operator">)</span>;
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

export default function OpenAIIntegrationPage() {
  return (
    <div>
      {/* Title */}
      <h1 className="gradient-text" style={{ fontSize: "2.25rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
        OpenAI Integration
      </h1>
      <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: 40, maxWidth: 640, lineHeight: 1.7 }}>
        Guard every OpenAI API call with AgentGate policies. Enforce permissions on chat completions, tool calls, and embeddings before they reach the API.
      </p>

      {/* Overview */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Overview</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          The <code style={{ color: "var(--blue)" }}>OpenAIGuard</code> intercepts OpenAI SDK calls and runs authorization checks against your AgentGate policies before allowing them through. You can check individual calls manually or wrap the entire API for automatic enforcement.
        </p>
        <Callout type="tip" title="Recommended approach">
          Use <code style={{ color: "var(--blue)" }}>wrapChatCompletions()</code> for the simplest setup. It wraps the OpenAI function so every call is automatically guarded with zero changes to your calling code.
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

      {/* Configuration Options */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Configuration Options</h2>
        <ParamTable title="IntegrationConfig" params={configParams} />
      </section>

      {/* Before Chat Completion */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Before Chat Completion</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Check authorization before making a chat completion call. The guard evaluates the model, messages, tools, and temperature against your policies.
        </p>
        <CodeBlock tabs={beforeChatTabs} />
      </section>

      {/* Before Tool Call */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Before Tool Call</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Check authorization before executing a tool call returned by the model. The tool name becomes the resource in the authorization check.
        </p>
        <CodeBlock tabs={beforeToolTabs} />
      </section>

      {/* Before Embedding */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Before Embedding</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Check authorization before creating embeddings. Useful for controlling which agents can generate vector embeddings and at what volume.
        </p>
        <CodeBlock tabs={beforeEmbeddingTabs} />
      </section>

      {/* Wrap Chat Completions */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Wrap Chat Completions</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          The recommended approach. <code style={{ color: "var(--blue)" }}>wrapChatCompletions()</code> returns a drop-in replacement for <code style={{ color: "var(--teal)" }}>openai.chat.completions.create</code> that automatically runs authorization before every call.
        </p>
        <CodeBlock tabs={wrapTabs} />
        <Callout type="info" title="Behavior on deny">
          When authorization is denied, the wrapped function throws an <code style={{ color: "var(--blue)" }}>AgentGateError</code> instead of making the OpenAI API call. The original function is never invoked.
        </Callout>
      </section>

      {/* Full Example */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Full Example</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          A complete setup with the wrapped API, deny and escalation callbacks, and a guarded chat completion.
        </p>
        <CodeBlock tabs={fullExampleTabs} />
      </section>
    </div>
  );
}
