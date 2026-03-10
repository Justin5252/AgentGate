"use client";

import { useState } from "react";

const tsCode = (
  <code>
    <span className="code-keyword">import</span>{" "}
    <span className="code-variable">{"{ AgentGateClient }"}</span>{" "}
    <span className="code-keyword">from</span>{" "}
    <span className="code-string">&quot;@agentgate/sdk&quot;</span>;{"\n"}
    {"\n"}
    <span className="code-keyword">const</span>{" "}
    <span className="code-variable">gate</span>{" "}
    <span className="code-operator">=</span>{" "}
    <span className="code-keyword">new</span>{" "}
    <span className="code-type">AgentGateClient</span>
    <span className="code-operator">{"({"}</span>
    {"\n"}
    {"  "}
    <span className="code-property">baseUrl</span>
    <span className="code-operator">:</span>{" "}
    <span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,
    {"\n"}
    {"  "}
    <span className="code-property">apiKey</span>
    <span className="code-operator">:</span>{" "}
    <span className="code-variable">process</span>
    <span className="code-operator">.</span>
    <span className="code-variable">env</span>
    <span className="code-operator">.</span>
    <span className="code-variable">AGENTGATE_KEY</span>,{"\n"}
    <span className="code-operator">{"})"}</span>;{"\n"}
    {"\n"}
    <span className="code-comment">
      {"// Protect any agent action in one line"}
    </span>
    {"\n"}
    <span className="code-keyword">await</span>{" "}
    <span className="code-variable">gate</span>
    <span className="code-operator">.</span>
    <span className="code-function">guard</span>
    <span className="code-operator">(</span>
    <span className="code-string">&quot;agent-123&quot;</span>
    <span className="code-operator">,</span>{" "}
    <span className="code-string">&quot;read&quot;</span>
    <span className="code-operator">,</span>{" "}
    <span className="code-string">&quot;customer-data&quot;</span>
    <span className="code-operator">)</span>;
  </code>
);

const pyCode = (
  <code>
    <span className="code-keyword">from</span>{" "}
    <span className="code-variable">agentgate</span>{" "}
    <span className="code-keyword">import</span>{" "}
    <span className="code-type">AgentGateClient</span>
    {"\n"}
    {"\n"}
    <span className="code-keyword">async with</span>{" "}
    <span className="code-type">AgentGateClient</span>
    <span className="code-operator">(</span>
    {"\n"}
    {"    "}
    <span className="code-property">base_url</span>
    <span className="code-operator">=</span>
    <span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,
    {"\n"}
    {"    "}
    <span className="code-property">api_key</span>
    <span className="code-operator">=</span>
    <span className="code-variable">os</span>
    <span className="code-operator">.</span>
    <span className="code-variable">environ</span>
    <span className="code-operator">[</span>
    <span className="code-string">&quot;AGENTGATE_KEY&quot;</span>
    <span className="code-operator">]</span>,{"\n"}
    <span className="code-operator">)</span>{" "}
    <span className="code-keyword">as</span>{" "}
    <span className="code-variable">gate</span>
    <span className="code-operator">:</span>
    {"\n"}
    {"    "}
    <span className="code-keyword">await</span>{" "}
    <span className="code-variable">gate</span>
    <span className="code-operator">.</span>
    <span className="code-function">guard</span>
    <span className="code-operator">(</span>
    <span className="code-string">&quot;agent-123&quot;</span>
    <span className="code-operator">,</span>{" "}
    <span className="code-string">&quot;read&quot;</span>
    <span className="code-operator">,</span>{" "}
    <span className="code-string">&quot;customer-data&quot;</span>
    <span className="code-operator">)</span>
  </code>
);

export default function CodeBlock() {
  const [activeTab, setActiveTab] = useState<"ts" | "py">("ts");

  return (
    <div className="code-glow mx-auto max-w-2xl overflow-hidden rounded-xl" style={{ background: "var(--bg-card)" }}>
      {/* Tabs */}
      <div
        className="flex border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={() => setActiveTab("ts")}
          className="px-5 py-3 text-sm font-medium transition-colors"
          style={{
            color:
              activeTab === "ts"
                ? "var(--text-primary)"
                : "var(--text-muted)",
            borderBottom:
              activeTab === "ts"
                ? "2px solid var(--blue)"
                : "2px solid transparent",
            background:
              activeTab === "ts"
                ? "rgba(59, 130, 246, 0.05)"
                : "transparent",
          }}
        >
          TypeScript
        </button>
        <button
          onClick={() => setActiveTab("py")}
          className="px-5 py-3 text-sm font-medium transition-colors"
          style={{
            color:
              activeTab === "py"
                ? "var(--text-primary)"
                : "var(--text-muted)",
            borderBottom:
              activeTab === "py"
                ? "2px solid var(--teal)"
                : "2px solid transparent",
            background:
              activeTab === "py"
                ? "rgba(6, 214, 160, 0.05)"
                : "transparent",
          }}
        >
          Python
        </button>
      </div>

      {/* Code content */}
      <pre
        className="overflow-x-auto p-6 text-sm leading-relaxed"
        style={{ fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, 'Courier New', monospace" }}
      >
        {activeTab === "ts" ? tsCode : pyCode}
      </pre>
    </div>
  );
}
