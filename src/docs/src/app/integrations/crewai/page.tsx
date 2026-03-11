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
    code: `npm install @agentgate/sdk @agentgate/integrations`,
    content: (
      <code>
        <span className="code-function">npm</span> install @agentgate/sdk @agentgate/integrations
      </code>
    ),
  },
];

const setupTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { AgentGateClient } from "@agentgate/sdk";
import { CrewAIGuard } from "@agentgate/integrations";

const gate = new AgentGateClient({
  baseUrl: "https://api.agentgate.dev",
  apiKey: process.env.AGENTGATE_KEY!,
});

const guard = new CrewAIGuard({
  client: gate,
  agentId: "agent-crew-researcher",
  defaultResource: "crewai/task",
  onDenied: (action, resource, reason) => {
    console.warn(\`Denied: \${action} on \${resource} — \${reason}\`);
  },
  onEscalation: (action, resource, reason) => {
    console.warn(\`Escalation: \${action} on \${resource} — \${reason}\`);
  },
});`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">{"{ AgentGateClient }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/sdk&quot;</span>;{"\n"}
        <span className="code-keyword">import</span> <span className="code-variable">{"{ CrewAIGuard }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/integrations&quot;</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">gate</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">AgentGateClient</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">baseUrl</span><span className="code-operator">:</span> <span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,{"\n"}
        {"  "}<span className="code-property">apiKey</span><span className="code-operator">:</span> <span className="code-variable">process</span><span className="code-operator">.</span><span className="code-variable">env</span><span className="code-operator">.</span><span className="code-variable">AGENTGATE_KEY</span><span className="code-operator">!</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">guard</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">CrewAIGuard</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">client</span><span className="code-operator">:</span> <span className="code-variable">gate</span>,{"\n"}
        {"  "}<span className="code-property">agentId</span><span className="code-operator">:</span> <span className="code-string">&quot;agent-crew-researcher&quot;</span>,{"\n"}
        {"  "}<span className="code-property">defaultResource</span><span className="code-operator">:</span> <span className="code-string">&quot;crewai/task&quot;</span>,{"\n"}
        {"  "}<span className="code-property">onDenied</span><span className="code-operator">:</span> <span className="code-operator">(</span><span className="code-variable">action</span>, <span className="code-variable">resource</span>, <span className="code-variable">reason</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">warn</span><span className="code-operator">(</span><span className="code-string">{"`Denied: ${action} on ${resource} — ${reason}`"}</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-operator">{"}"},</span>{"\n"}
        {"  "}<span className="code-property">onEscalation</span><span className="code-operator">:</span> <span className="code-operator">(</span><span className="code-variable">action</span>, <span className="code-variable">resource</span>, <span className="code-variable">reason</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">warn</span><span className="code-operator">(</span><span className="code-string">{"`Escalation: ${action} on ${resource} — ${reason}`"}</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-operator">{"}"},</span>{"\n"}
        <span className="code-operator">{"})"}</span>;
      </code>
    ),
  },
];

const beforeTaskTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `const allowed = await guard.beforeTask(
  "Research the latest AI safety papers and write a summary",
  { priority: "high", deadline: "2026-03-15" }
);

if (allowed) {
  // Proceed with task execution
  const result = await crew.kickoff();
}`,
    content: (
      <code>
        <span className="code-keyword">const</span> <span className="code-variable">allowed</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">guard</span><span className="code-operator">.</span><span className="code-function">beforeTask</span><span className="code-operator">(</span>{"\n"}
        {"  "}<span className="code-string">&quot;Research the latest AI safety papers and write a summary&quot;</span>,{"\n"}
        {"  "}<span className="code-operator">{"{"}</span> <span className="code-property">priority</span><span className="code-operator">:</span> <span className="code-string">&quot;high&quot;</span>, <span className="code-property">deadline</span><span className="code-operator">:</span> <span className="code-string">&quot;2026-03-15&quot;</span> <span className="code-operator">{"}"}</span>{"\n"}
        <span className="code-operator">)</span>;{"\n\n"}
        <span className="code-keyword">if</span> <span className="code-operator">(</span><span className="code-variable">allowed</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-comment">// Proceed with task execution</span>{"\n"}
        {"  "}<span className="code-keyword">const</span> <span className="code-variable">result</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">crew</span><span className="code-operator">.</span><span className="code-function">kickoff</span><span className="code-operator">()</span>;{"\n"}
        <span className="code-operator">{"}"}</span>
      </code>
    ),
  },
];

const beforeToolUseTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `const allowed = await guard.beforeToolUse(
  "web_scraper",
  "https://arxiv.org/abs/2403.00001"
);

if (allowed) {
  const data = await webScraper.scrape("https://arxiv.org/abs/2403.00001");
}`,
    content: (
      <code>
        <span className="code-keyword">const</span> <span className="code-variable">allowed</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">guard</span><span className="code-operator">.</span><span className="code-function">beforeToolUse</span><span className="code-operator">(</span>{"\n"}
        {"  "}<span className="code-string">&quot;web_scraper&quot;</span>,{"\n"}
        {"  "}<span className="code-string">&quot;https://arxiv.org/abs/2403.00001&quot;</span>{"\n"}
        <span className="code-operator">)</span>;{"\n\n"}
        <span className="code-keyword">if</span> <span className="code-operator">(</span><span className="code-variable">allowed</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-keyword">const</span> <span className="code-variable">data</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">webScraper</span><span className="code-operator">.</span><span className="code-function">scrape</span><span className="code-operator">(</span><span className="code-string">&quot;https://arxiv.org/abs/2403.00001&quot;</span><span className="code-operator">)</span>;{"\n"}
        <span className="code-operator">{"}"}</span>
      </code>
    ),
  },
];

const beforeDelegationTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `// Check if this agent can delegate to another crew member
const allowed = await guard.beforeDelegation(
  "Senior Analyst",   // target agent's role
  "Review and validate the research findings"
);

if (allowed) {
  // Proceed with delegation
  console.log("Delegation approved — handing off to Senior Analyst");
} else {
  console.log("Delegation denied — completing task independently");
}`,
    content: (
      <code>
        <span className="code-comment">// Check if this agent can delegate to another crew member</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">allowed</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">guard</span><span className="code-operator">.</span><span className="code-function">beforeDelegation</span><span className="code-operator">(</span>{"\n"}
        {"  "}<span className="code-string">&quot;Senior Analyst&quot;</span>,{"   "}<span className="code-comment">// target agent&apos;s role</span>{"\n"}
        {"  "}<span className="code-string">&quot;Review and validate the research findings&quot;</span>{"\n"}
        <span className="code-operator">)</span>;{"\n\n"}
        <span className="code-keyword">if</span> <span className="code-operator">(</span><span className="code-variable">allowed</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-comment">// Proceed with delegation</span>{"\n"}
        {"  "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">log</span><span className="code-operator">(</span><span className="code-string">&quot;Delegation approved -- handing off to Senior Analyst&quot;</span><span className="code-operator">)</span>;{"\n"}
        <span className="code-operator">{"}"}</span> <span className="code-keyword">else</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">log</span><span className="code-operator">(</span><span className="code-string">&quot;Delegation denied -- completing task independently&quot;</span><span className="code-operator">)</span>;{"\n"}
        <span className="code-operator">{"}"}</span>
      </code>
    ),
  },
];

const stepCallbackTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `// Create a step callback for CrewAI — recommended approach
const stepCallback = guard.createStepCallback();

// Pass to your CrewAI configuration
const crew = new Crew({
  agents: [researcher, analyst],
  tasks: [researchTask, analysisTask],
  stepCallback,
});

// Every step (task start, tool use, delegation) is automatically authorized
const result = await crew.kickoff();`,
    content: (
      <code>
        <span className="code-comment">// Create a step callback for CrewAI -- recommended approach</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">stepCallback</span> <span className="code-operator">=</span> <span className="code-variable">guard</span><span className="code-operator">.</span><span className="code-function">createStepCallback</span><span className="code-operator">()</span>;{"\n\n"}
        <span className="code-comment">// Pass to your CrewAI configuration</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">crew</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">Crew</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">agents</span><span className="code-operator">:</span> [<span className="code-variable">researcher</span>, <span className="code-variable">analyst</span>],{"\n"}
        {"  "}<span className="code-property">tasks</span><span className="code-operator">:</span> [<span className="code-variable">researchTask</span>, <span className="code-variable">analysisTask</span>],{"\n"}
        {"  "}<span className="code-property">stepCallback</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// Every step (task start, tool use, delegation) is automatically authorized</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">result</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">crew</span><span className="code-operator">.</span><span className="code-function">kickoff</span><span className="code-operator">()</span>;
      </code>
    ),
  },
];

const fullExampleTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { AgentGateClient } from "@agentgate/sdk";
import { CrewAIGuard } from "@agentgate/integrations";

// 1. Initialize AgentGate
const gate = new AgentGateClient({
  baseUrl: "https://api.agentgate.dev",
  apiKey: process.env.AGENTGATE_KEY!,
});

// 2. Create guards for each crew member
const researcherGuard = new CrewAIGuard({
  client: gate,
  agentId: "agent-crew-researcher",
  defaultResource: "crewai/task",
  onDenied: (action, resource, reason) => {
    console.warn(\`[researcher] Denied: \${action} — \${reason}\`);
  },
});

const analystGuard = new CrewAIGuard({
  client: gate,
  agentId: "agent-crew-analyst",
  defaultResource: "crewai/task",
  onDenied: (action, resource, reason) => {
    console.warn(\`[analyst] Denied: \${action} — \${reason}\`);
  },
});

// 3. Authorize task execution
const canResearch = await researcherGuard.beforeTask(
  "Research AI safety papers from the last month"
);

if (canResearch) {
  // 4. Check tool access before using
  const canScrape = await researcherGuard.beforeToolUse("web_scraper");
  if (canScrape) {
    const papers = await webScraper.scrape("https://arxiv.org/search/ai-safety");
  }

  // 5. Check delegation permission
  const canDelegate = await researcherGuard.beforeDelegation(
    "Analyst",
    "Analyze and summarize the collected papers"
  );

  if (canDelegate) {
    const canAnalyze = await analystGuard.beforeTask(
      "Analyze and summarize the collected papers"
    );
    // Proceed with analysis...
  }
}`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">{"{ AgentGateClient }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/sdk&quot;</span>;{"\n"}
        <span className="code-keyword">import</span> <span className="code-variable">{"{ CrewAIGuard }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/integrations&quot;</span>;{"\n\n"}
        <span className="code-comment">// 1. Initialize AgentGate</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">gate</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">AgentGateClient</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">baseUrl</span><span className="code-operator">:</span> <span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,{"\n"}
        {"  "}<span className="code-property">apiKey</span><span className="code-operator">:</span> <span className="code-variable">process</span><span className="code-operator">.</span><span className="code-variable">env</span><span className="code-operator">.</span><span className="code-variable">AGENTGATE_KEY</span><span className="code-operator">!</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// 2. Create guards for each crew member</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">researcherGuard</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">CrewAIGuard</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">client</span><span className="code-operator">:</span> <span className="code-variable">gate</span>,{"\n"}
        {"  "}<span className="code-property">agentId</span><span className="code-operator">:</span> <span className="code-string">&quot;agent-crew-researcher&quot;</span>,{"\n"}
        {"  "}<span className="code-property">defaultResource</span><span className="code-operator">:</span> <span className="code-string">&quot;crewai/task&quot;</span>,{"\n"}
        {"  "}<span className="code-property">onDenied</span><span className="code-operator">:</span> <span className="code-operator">(</span><span className="code-variable">action</span>, <span className="code-variable">resource</span>, <span className="code-variable">reason</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">warn</span><span className="code-operator">(</span><span className="code-string">{"`[researcher] Denied: ${action} — ${reason}`"}</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-operator">{"}"},</span>{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">analystGuard</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">CrewAIGuard</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">client</span><span className="code-operator">:</span> <span className="code-variable">gate</span>,{"\n"}
        {"  "}<span className="code-property">agentId</span><span className="code-operator">:</span> <span className="code-string">&quot;agent-crew-analyst&quot;</span>,{"\n"}
        {"  "}<span className="code-property">defaultResource</span><span className="code-operator">:</span> <span className="code-string">&quot;crewai/task&quot;</span>,{"\n"}
        {"  "}<span className="code-property">onDenied</span><span className="code-operator">:</span> <span className="code-operator">(</span><span className="code-variable">action</span>, <span className="code-variable">resource</span>, <span className="code-variable">reason</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">warn</span><span className="code-operator">(</span><span className="code-string">{"`[analyst] Denied: ${action} — ${reason}`"}</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-operator">{"}"},</span>{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// 3. Authorize task execution</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">canResearch</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">researcherGuard</span><span className="code-operator">.</span><span className="code-function">beforeTask</span><span className="code-operator">(</span>{"\n"}
        {"  "}<span className="code-string">&quot;Research AI safety papers from the last month&quot;</span>{"\n"}
        <span className="code-operator">)</span>;{"\n\n"}
        <span className="code-keyword">if</span> <span className="code-operator">(</span><span className="code-variable">canResearch</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-comment">// 4. Check tool access before using</span>{"\n"}
        {"  "}<span className="code-keyword">const</span> <span className="code-variable">canScrape</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">researcherGuard</span><span className="code-operator">.</span><span className="code-function">beforeToolUse</span><span className="code-operator">(</span><span className="code-string">&quot;web_scraper&quot;</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-keyword">if</span> <span className="code-operator">(</span><span className="code-variable">canScrape</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-keyword">const</span> <span className="code-variable">papers</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">webScraper</span><span className="code-operator">.</span><span className="code-function">scrape</span><span className="code-operator">(</span><span className="code-string">&quot;https://arxiv.org/search/ai-safety&quot;</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-operator">{"}"}</span>{"\n\n"}
        {"  "}<span className="code-comment">// 5. Check delegation permission</span>{"\n"}
        {"  "}<span className="code-keyword">const</span> <span className="code-variable">canDelegate</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">researcherGuard</span><span className="code-operator">.</span><span className="code-function">beforeDelegation</span><span className="code-operator">(</span>{"\n"}
        {"    "}<span className="code-string">&quot;Analyst&quot;</span>,{"\n"}
        {"    "}<span className="code-string">&quot;Analyze and summarize the collected papers&quot;</span>{"\n"}
        {"  "}<span className="code-operator">)</span>;{"\n\n"}
        {"  "}<span className="code-keyword">if</span> <span className="code-operator">(</span><span className="code-variable">canDelegate</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-keyword">const</span> <span className="code-variable">canAnalyze</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">analystGuard</span><span className="code-operator">.</span><span className="code-function">beforeTask</span><span className="code-operator">(</span>{"\n"}
        {"      "}<span className="code-string">&quot;Analyze and summarize the collected papers&quot;</span>{"\n"}
        {"    "}<span className="code-operator">)</span>;{"\n"}
        {"    "}<span className="code-comment">// Proceed with analysis...</span>{"\n"}
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
  { name: "defaultResource", type: "string", description: "Fallback resource identifier when none is inferred." },
  { name: "onDenied", type: "(action, resource, reason) => void", description: "Callback fired when an action is denied." },
  { name: "onEscalation", type: "(action, resource, reason) => void", description: "Callback fired when an action requires human escalation." },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function CrewAIIntegrationPage() {
  return (
    <div>
      {/* Title */}
      <h1 className="gradient-text" style={{ fontSize: "2.25rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
        CrewAI Integration
      </h1>
      <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: 40, maxWidth: 640, lineHeight: 1.7 }}>
        Guard CrewAI tasks, tool usage, and inter-agent delegation with AgentGate policies. Control what each crew member can do and who they can delegate to.
      </p>

      {/* Overview */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Overview</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          The <code style={{ color: "var(--blue)" }}>CrewAIGuard</code> provides fine-grained authorization for CrewAI workflows. Check permissions before task execution, tool use, and delegation between crew members. Each crew agent can have its own guard with distinct policies.
        </p>
        <Callout type="tip" title="Recommended approach">
          Use <code style={{ color: "var(--blue)" }}>createStepCallback()</code> for automatic enforcement at every step. For more control, use the individual <code style={{ color: "var(--teal)" }}>beforeTask</code>, <code style={{ color: "var(--teal)" }}>beforeToolUse</code>, and <code style={{ color: "var(--teal)" }}>beforeDelegation</code> methods.
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

      {/* Before Task */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Before Task</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Check authorization before a crew member executes a task. The task description is used as the action, and optional context provides additional policy evaluation data.
        </p>
        <CodeBlock tabs={beforeTaskTabs} />
      </section>

      {/* Before Tool Use */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Before Tool Use</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Check authorization before a crew member uses a tool. The tool name becomes the resource in the authorization check. The optional second argument is the tool input for context.
        </p>
        <CodeBlock tabs={beforeToolUseTabs} />
      </section>

      {/* Before Delegation */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Before Delegation</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Check authorization before one crew member delegates work to another. This is especially important for controlling agent-to-agent communication in multi-agent systems.
        </p>
        <CodeBlock tabs={beforeDelegationTabs} />
        <Callout type="warning" title="A2A governance">
          Delegation checks are critical for agent-to-agent (A2A) governance. Use policies to restrict which agents can delegate to which roles, preventing unauthorized lateral movement in your crew.
        </Callout>
      </section>

      {/* Step Callback */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Step Callback</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          The recommended approach. <code style={{ color: "var(--blue)" }}>createStepCallback()</code> returns a CrewAI step callback that automatically authorizes every step in the crew&apos;s execution: task starts, tool invocations, and delegations.
        </p>
        <CodeBlock tabs={stepCallbackTabs} />
        <Callout type="info" title="Behavior on deny">
          When a step is denied, the callback fires <code style={{ color: "var(--blue)" }}>onDenied</code> and prevents the step from executing. The crew can continue with remaining steps based on your CrewAI error handling configuration.
        </Callout>
      </section>

      {/* Full Example */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Full Example</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          A complete multi-agent workflow with separate guards for each crew member, task authorization, tool access control, and delegation governance.
        </p>
        <CodeBlock tabs={fullExampleTabs} />
      </section>
    </div>
  );
}
