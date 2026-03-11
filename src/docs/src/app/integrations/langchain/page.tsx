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
    code: `npm install @agentgate/sdk @agentgate/integrations langchain @langchain/core`,
    content: (
      <code>
        <span className="code-function">npm</span> install @agentgate/sdk @agentgate/integrations langchain @langchain/core
      </code>
    ),
  },
];

const setupTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { AgentGateClient } from "@agentgate/sdk";
import { LangChainGuard } from "@agentgate/integrations";

const gate = new AgentGateClient({
  baseUrl: "https://api.agentgate.dev",
  apiKey: process.env.AGENTGATE_KEY!,
});

const guard = new LangChainGuard({
  client: gate,
  agentId: "agent-langchain-bot",
  defaultResource: "langchain/chain",
  onDenied: (action, resource, reason) => {
    console.warn(\`Denied: \${action} on \${resource} — \${reason}\`);
  },
});`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">{"{ AgentGateClient }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/sdk&quot;</span>;{"\n"}
        <span className="code-keyword">import</span> <span className="code-variable">{"{ LangChainGuard }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/integrations&quot;</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">gate</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">AgentGateClient</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">baseUrl</span><span className="code-operator">:</span> <span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,{"\n"}
        {"  "}<span className="code-property">apiKey</span><span className="code-operator">:</span> <span className="code-variable">process</span><span className="code-operator">.</span><span className="code-variable">env</span><span className="code-operator">.</span><span className="code-variable">AGENTGATE_KEY</span><span className="code-operator">!</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">guard</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">LangChainGuard</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">client</span><span className="code-operator">:</span> <span className="code-variable">gate</span>,{"\n"}
        {"  "}<span className="code-property">agentId</span><span className="code-operator">:</span> <span className="code-string">&quot;agent-langchain-bot&quot;</span>,{"\n"}
        {"  "}<span className="code-property">defaultResource</span><span className="code-operator">:</span> <span className="code-string">&quot;langchain/chain&quot;</span>,{"\n"}
        {"  "}<span className="code-property">onDenied</span><span className="code-operator">:</span> <span className="code-operator">(</span><span className="code-variable">action</span>, <span className="code-variable">resource</span>, <span className="code-variable">reason</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">warn</span><span className="code-operator">(</span><span className="code-string">{"`Denied: ${action} on ${resource} — ${reason}`"}</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-operator">{"}"},</span>{"\n"}
        <span className="code-operator">{"})"}</span>;
      </code>
    ),
  },
];

const callbackTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";

// Create the callback handler — recommended approach
const handler = guard.createCallbackHandler();

// Attach to any chain or agent executor
const executor = await AgentExecutor.fromAgentAndTools({
  agent,
  tools,
  callbacks: [handler],
});

const result = await executor.invoke({
  input: "What is the weather in San Francisco?",
});`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">{"{ AgentExecutor, createOpenAIFunctionsAgent }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;langchain/agents&quot;</span>;{"\n\n"}
        <span className="code-comment">// Create the callback handler -- recommended approach</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">handler</span> <span className="code-operator">=</span> <span className="code-variable">guard</span><span className="code-operator">.</span><span className="code-function">createCallbackHandler</span><span className="code-operator">()</span>;{"\n\n"}
        <span className="code-comment">// Attach to any chain or agent executor</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">executor</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-type">AgentExecutor</span><span className="code-operator">.</span><span className="code-function">fromAgentAndTools</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">agent</span>,{"\n"}
        {"  "}<span className="code-property">tools</span>,{"\n"}
        {"  "}<span className="code-property">callbacks</span><span className="code-operator">:</span> [<span className="code-variable">handler</span>],{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">result</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">executor</span><span className="code-operator">.</span><span className="code-function">invoke</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">input</span><span className="code-operator">:</span> <span className="code-string">&quot;What is the weather in San Francisco?&quot;</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;
      </code>
    ),
  },
];

const wrapToolTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { DynamicTool } from "@langchain/core/tools";

const searchTool = new DynamicTool({
  name: "web_search",
  description: "Search the web",
  func: async (query: string) => {
    return await webSearch(query);
  },
});

// Wrap individual tool invocation with authorization
const protectedSearch = guard.wrapTool(
  "web_search",
  searchTool.func.bind(searchTool)
);

// Now the tool checks authorization before running
const result = await protectedSearch("AgentGate documentation");`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">{"{ DynamicTool }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@langchain/core/tools&quot;</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">searchTool</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">DynamicTool</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">name</span><span className="code-operator">:</span> <span className="code-string">&quot;web_search&quot;</span>,{"\n"}
        {"  "}<span className="code-property">description</span><span className="code-operator">:</span> <span className="code-string">&quot;Search the web&quot;</span>,{"\n"}
        {"  "}<span className="code-property">func</span><span className="code-operator">:</span> <span className="code-keyword">async</span> <span className="code-operator">(</span><span className="code-variable">query</span><span className="code-operator">:</span> <span className="code-type">string</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-keyword">return</span> <span className="code-keyword">await</span> <span className="code-function">webSearch</span><span className="code-operator">(</span><span className="code-variable">query</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-operator">{"}"},</span>{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// Wrap individual tool invocation with authorization</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">protectedSearch</span> <span className="code-operator">=</span> <span className="code-variable">guard</span><span className="code-operator">.</span><span className="code-function">wrapTool</span><span className="code-operator">(</span>{"\n"}
        {"  "}<span className="code-string">&quot;web_search&quot;</span>,{"\n"}
        {"  "}<span className="code-variable">searchTool</span><span className="code-operator">.</span><span className="code-variable">func</span><span className="code-operator">.</span><span className="code-function">bind</span><span className="code-operator">(</span><span className="code-variable">searchTool</span><span className="code-operator">)</span>{"\n"}
        <span className="code-operator">)</span>;{"\n\n"}
        <span className="code-comment">// Now the tool checks authorization before running</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">result</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-function">protectedSearch</span><span className="code-operator">(</span><span className="code-string">&quot;AgentGate documentation&quot;</span><span className="code-operator">)</span>;
      </code>
    ),
  },
];

const fullExampleTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { AgentGateClient } from "@agentgate/sdk";
import { LangChainGuard } from "@agentgate/integrations";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { DynamicTool } from "@langchain/core/tools";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// 1. Set up AgentGate
const gate = new AgentGateClient({
  baseUrl: "https://api.agentgate.dev",
  apiKey: process.env.AGENTGATE_KEY!,
});

const guard = new LangChainGuard({
  client: gate,
  agentId: "agent-langchain-bot",
  defaultResource: "langchain/chain",
  onDenied: (action, resource, reason) => {
    console.warn(\`[DENIED] \${action} on \${resource}: \${reason}\`);
  },
});

// 2. Define tools
const tools = [
  new DynamicTool({
    name: "calculator",
    description: "Perform math calculations",
    func: async (input) => String(eval(input)),
  }),
  new DynamicTool({
    name: "web_search",
    description: "Search the web",
    func: async (query) => \`Results for: \${query}\`,
  }),
];

// 3. Create agent with AgentGate callback handler
const llm = new ChatOpenAI({ modelName: "gpt-4" });
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant with access to tools."],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

const agent = await createOpenAIFunctionsAgent({ llm, tools, prompt });
const executor = new AgentExecutor({
  agent,
  tools,
  callbacks: [guard.createCallbackHandler()],
});

// 4. Run — every tool call and LLM invocation is guarded
const result = await executor.invoke({
  input: "What is 42 * 17?",
});

console.log(result.output);`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">{"{ AgentGateClient }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/sdk&quot;</span>;{"\n"}
        <span className="code-keyword">import</span> <span className="code-variable">{"{ LangChainGuard }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/integrations&quot;</span>;{"\n"}
        <span className="code-keyword">import</span> <span className="code-variable">{"{ ChatOpenAI }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@langchain/openai&quot;</span>;{"\n"}
        <span className="code-keyword">import</span> <span className="code-variable">{"{ AgentExecutor, createOpenAIFunctionsAgent }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;langchain/agents&quot;</span>;{"\n"}
        <span className="code-keyword">import</span> <span className="code-variable">{"{ DynamicTool }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@langchain/core/tools&quot;</span>;{"\n"}
        <span className="code-keyword">import</span> <span className="code-variable">{"{ ChatPromptTemplate }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@langchain/core/prompts&quot;</span>;{"\n\n"}
        <span className="code-comment">// 1. Set up AgentGate</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">gate</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">AgentGateClient</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">baseUrl</span><span className="code-operator">:</span> <span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,{"\n"}
        {"  "}<span className="code-property">apiKey</span><span className="code-operator">:</span> <span className="code-variable">process</span><span className="code-operator">.</span><span className="code-variable">env</span><span className="code-operator">.</span><span className="code-variable">AGENTGATE_KEY</span><span className="code-operator">!</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">guard</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">LangChainGuard</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">client</span><span className="code-operator">:</span> <span className="code-variable">gate</span>,{"\n"}
        {"  "}<span className="code-property">agentId</span><span className="code-operator">:</span> <span className="code-string">&quot;agent-langchain-bot&quot;</span>,{"\n"}
        {"  "}<span className="code-property">defaultResource</span><span className="code-operator">:</span> <span className="code-string">&quot;langchain/chain&quot;</span>,{"\n"}
        {"  "}<span className="code-property">onDenied</span><span className="code-operator">:</span> <span className="code-operator">(</span><span className="code-variable">action</span>, <span className="code-variable">resource</span>, <span className="code-variable">reason</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">warn</span><span className="code-operator">(</span><span className="code-string">{"`[DENIED] ${action} on ${resource}: ${reason}`"}</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-operator">{"}"},</span>{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// 2. Define tools</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">tools</span> <span className="code-operator">=</span> [{"\n"}
        {"  "}<span className="code-keyword">new</span> <span className="code-type">DynamicTool</span><span className="code-operator">({"{"}</span>{"\n"}
        {"    "}<span className="code-property">name</span><span className="code-operator">:</span> <span className="code-string">&quot;calculator&quot;</span>,{"\n"}
        {"    "}<span className="code-property">description</span><span className="code-operator">:</span> <span className="code-string">&quot;Perform math calculations&quot;</span>,{"\n"}
        {"    "}<span className="code-property">func</span><span className="code-operator">:</span> <span className="code-keyword">async</span> <span className="code-operator">(</span><span className="code-variable">input</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-type">String</span><span className="code-operator">(</span><span className="code-function">eval</span><span className="code-operator">(</span><span className="code-variable">input</span><span className="code-operator">))</span>,{"\n"}
        {"  "}<span className="code-operator">{"})"}</span>,{"\n"}
        {"  "}<span className="code-keyword">new</span> <span className="code-type">DynamicTool</span><span className="code-operator">({"{"}</span>{"\n"}
        {"    "}<span className="code-property">name</span><span className="code-operator">:</span> <span className="code-string">&quot;web_search&quot;</span>,{"\n"}
        {"    "}<span className="code-property">description</span><span className="code-operator">:</span> <span className="code-string">&quot;Search the web&quot;</span>,{"\n"}
        {"    "}<span className="code-property">func</span><span className="code-operator">:</span> <span className="code-keyword">async</span> <span className="code-operator">(</span><span className="code-variable">query</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-string">{"`Results for: ${query}`"}</span>,{"\n"}
        {"  "}<span className="code-operator">{"})"}</span>,{"\n"}
        ];{"\n\n"}
        <span className="code-comment">// 3. Create agent with AgentGate callback handler</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">llm</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">ChatOpenAI</span><span className="code-operator">({"{"}</span> <span className="code-property">modelName</span><span className="code-operator">:</span> <span className="code-string">&quot;gpt-4&quot;</span> <span className="code-operator">{"})"}</span>;{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">prompt</span> <span className="code-operator">=</span> <span className="code-type">ChatPromptTemplate</span><span className="code-operator">.</span><span className="code-function">fromMessages</span><span className="code-operator">(</span>[{"\n"}
        {"  "}[<span className="code-string">&quot;system&quot;</span>, <span className="code-string">&quot;You are a helpful assistant with access to tools.&quot;</span>],{"\n"}
        {"  "}[<span className="code-string">&quot;human&quot;</span>, <span className="code-string">&quot;{"{input}"}&quot;</span>],{"\n"}
        {"  "}[<span className="code-string">&quot;placeholder&quot;</span>, <span className="code-string">&quot;{"{agent_scratchpad}"}&quot;</span>],{"\n"}
        ]<span className="code-operator">)</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">agent</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-function">createOpenAIFunctionsAgent</span><span className="code-operator">({"{"}</span> <span className="code-variable">llm</span>, <span className="code-variable">tools</span>, <span className="code-variable">prompt</span> <span className="code-operator">{"})"}</span>;{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">executor</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">AgentExecutor</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">agent</span>,{"\n"}
        {"  "}<span className="code-property">tools</span>,{"\n"}
        {"  "}<span className="code-property">callbacks</span><span className="code-operator">:</span> [<span className="code-variable">guard</span><span className="code-operator">.</span><span className="code-function">createCallbackHandler</span><span className="code-operator">()],</span>{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// 4. Run -- every tool call and LLM invocation is guarded</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">result</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">executor</span><span className="code-operator">.</span><span className="code-function">invoke</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">input</span><span className="code-operator">:</span> <span className="code-string">&quot;What is 42 * 17?&quot;</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">log</span><span className="code-operator">(</span><span className="code-variable">result</span><span className="code-operator">.</span><span className="code-property">output</span><span className="code-operator">)</span>;
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
  { name: "defaultResource", type: "string", description: "Fallback resource identifier when none is inferred." },
  { name: "onDenied", type: "(action, resource, reason) => void", description: "Callback fired when an action is denied." },
  { name: "onEscalation", type: "(action, resource, reason) => void", description: "Callback fired when an action requires human escalation." },
];

const eventsHandled: Param[] = [
  { name: "handleToolStart", type: "callback", required: true, description: "Fires before any tool executes. Checks tool:use permission with the tool name as resource." },
  { name: "handleChainStart", type: "callback", required: true, description: "Fires when a chain begins. Checks chain:run permission with the chain type as resource." },
  { name: "handleLLMStart", type: "callback", required: true, description: "Fires before an LLM call. Checks llm:invoke permission with the model as resource." },
  { name: "handleRetrieverStart", type: "callback", required: true, description: "Fires before a retriever query. Checks retriever:query permission with the retriever type as resource." },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function LangChainIntegrationPage() {
  return (
    <div>
      {/* Title */}
      <h1 className="gradient-text" style={{ fontSize: "2.25rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
        LangChain Integration
      </h1>
      <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: 40, maxWidth: 640, lineHeight: 1.7 }}>
        Guard LangChain chains, agents, and tools with AgentGate policies using the native callback system.
      </p>

      {/* Overview */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Overview</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          The <code style={{ color: "var(--blue)" }}>LangChainGuard</code> plugs into LangChain&apos;s callback system to intercept tool calls, chain executions, LLM invocations, and retriever queries. Authorization is checked automatically at each step.
        </p>
        <Callout type="tip" title="Recommended approach">
          Use <code style={{ color: "var(--blue)" }}>createCallbackHandler()</code> to get a LangChain-compatible callback handler. Attach it to any agent executor or chain for automatic policy enforcement.
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
        <ParamTable title="IntegrationConfig" params={configParams} />
      </section>

      {/* Callback Handler */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Callback Handler</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          The recommended approach. <code style={{ color: "var(--blue)" }}>createCallbackHandler()</code> returns a standard LangChain callback handler that automatically authorizes tool calls, chain runs, LLM invocations, and retriever queries.
        </p>
        <CodeBlock tabs={callbackTabs} />
        <Callout type="info" title="How it works">
          The callback handler intercepts LangChain lifecycle events and runs AgentGate authorization checks before each operation proceeds. If authorization fails, the handler triggers the <code style={{ color: "var(--blue)" }}>onDenied</code> callback and throws to prevent execution.
        </Callout>
      </section>

      {/* Wrap Individual Tools */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Wrap Individual Tools</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          For more granular control, wrap individual tool invocation functions with <code style={{ color: "var(--blue)" }}>wrapTool()</code>. This is useful when you want to authorize specific tools differently.
        </p>
        <CodeBlock tabs={wrapToolTabs} />
      </section>

      {/* Events Handled */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Events Handled</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          The callback handler intercepts four LangChain lifecycle events. Each maps to a specific AgentGate authorization action:
        </p>
        <ParamTable title="Callback events" params={eventsHandled} />
      </section>

      {/* Full Example */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Full Example</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          A complete setup with a LangChain agent, tools, and the AgentGate callback handler providing automatic authorization at every step.
        </p>
        <CodeBlock tabs={fullExampleTabs} />
      </section>
    </div>
  );
}
