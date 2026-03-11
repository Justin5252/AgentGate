"use client";

import Link from "next/link";
import { CodeBlock, CodeTab } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { OnThisPage, TocItem } from "@/components/OnThisPage";

const tocItems: TocItem[] = [
  { id: "installation", title: "Installation", level: 2 },
  { id: "api-key", title: "Get Your API Key", level: 2 },
  { id: "register-agent", title: "Register Your First Agent", level: 2 },
  { id: "create-policy", title: "Create a Policy", level: 2 },
  { id: "enforce", title: "Enforce Permissions", level: 2 },
  { id: "audit", title: "View the Audit Trail", level: 2 },
];

/* ------------------------------------------------------------------ */
/*  Code Tabs                                                         */
/* ------------------------------------------------------------------ */

const installTabs: CodeTab[] = [
  {
    label: "npm",
    language: "bash",
    code: "npm install @agentgate/sdk",
    content: (
      <code>
        <span className="code-function">npm</span> install <span className="code-string">@agentgate/sdk</span>
      </code>
    ),
  },
  {
    label: "pip",
    language: "bash",
    code: "pip install agentgate",
    content: (
      <code>
        <span className="code-function">pip</span> install <span className="code-string">agentgate</span>
      </code>
    ),
  },
  {
    label: "go",
    language: "bash",
    code: "go get github.com/agentgate/go-sdk",
    content: (
      <code>
        <span className="code-function">go</span> get <span className="code-string">github.com/agentgate/go-sdk</span>
      </code>
    ),
  },
];

const registerAgentTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { AgentGateClient } from "@agentgate/sdk";

const gate = new AgentGateClient({
  baseUrl: "https://api.agentgate.dev",
  apiKey: process.env.AGENTGATE_KEY!,
});

const agent = await gate.createAgent({
  name: "order-processor",
  owner: "fulfillment-team",
  capabilities: ["read:orders", "write:shipments"],
  riskLevel: "medium",
});

console.log(agent.data.id); // UUIDv7`,
    content: (
      <code>
        <span className="code-keyword">import</span> {"{"} <span className="code-type">AgentGateClient</span> {"}"} <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/sdk&quot;</span>;<br />
        <br />
        <span className="code-keyword">const</span> <span className="code-variable">gate</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">AgentGateClient</span>({"{"}
        <br />
        {"  "}<span className="code-property">baseUrl</span>: <span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,<br />
        {"  "}<span className="code-property">apiKey</span>: <span className="code-variable">process</span>.<span className="code-property">env</span>.<span className="code-property">AGENTGATE_KEY</span>!,<br />
        {"}"});<br />
        <br />
        <span className="code-keyword">const</span> <span className="code-variable">agent</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span>.<span className="code-function">createAgent</span>({"{"}
        <br />
        {"  "}<span className="code-property">name</span>: <span className="code-string">&quot;order-processor&quot;</span>,<br />
        {"  "}<span className="code-property">owner</span>: <span className="code-string">&quot;fulfillment-team&quot;</span>,<br />
        {"  "}<span className="code-property">capabilities</span>: [<span className="code-string">&quot;read:orders&quot;</span>, <span className="code-string">&quot;write:shipments&quot;</span>],<br />
        {"  "}<span className="code-property">riskLevel</span>: <span className="code-string">&quot;medium&quot;</span>,<br />
        {"}"});<br />
        <br />
        <span className="code-variable">console</span>.<span className="code-function">log</span>(<span className="code-variable">agent</span>.<span className="code-property">data</span>.<span className="code-property">id</span>); <span className="code-comment">// UUIDv7</span>
      </code>
    ),
  },
  {
    label: "Python",
    language: "python",
    code: `import asyncio
from agentgate import AgentGateClient

async def main():
    async with AgentGateClient(
        base_url="https://api.agentgate.dev",
        api_key=os.environ["AGENTGATE_KEY"],
    ) as gate:
        agent = await gate.create_agent(
            name="order-processor",
            owner="fulfillment-team",
            capabilities=["read:orders", "write:shipments"],
            risk_level="medium",
        )
        print(agent.data.id)  # UUIDv7

asyncio.run(main())`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">asyncio</span><br />
        <span className="code-keyword">from</span> <span className="code-variable">agentgate</span> <span className="code-keyword">import</span> <span className="code-type">AgentGateClient</span><br />
        <br />
        <span className="code-keyword">async def</span> <span className="code-function">main</span>():<br />
        {"    "}<span className="code-keyword">async with</span> <span className="code-type">AgentGateClient</span>(<br />
        {"        "}<span className="code-property">base_url</span><span className="code-operator">=</span><span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,<br />
        {"        "}<span className="code-property">api_key</span><span className="code-operator">=</span><span className="code-variable">os</span>.<span className="code-property">environ</span>[<span className="code-string">&quot;AGENTGATE_KEY&quot;</span>],<br />
        {"    "}) <span className="code-keyword">as</span> <span className="code-variable">gate</span>:<br />
        {"        "}<span className="code-variable">agent</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span>.<span className="code-function">create_agent</span>(<br />
        {"            "}<span className="code-property">name</span><span className="code-operator">=</span><span className="code-string">&quot;order-processor&quot;</span>,<br />
        {"            "}<span className="code-property">owner</span><span className="code-operator">=</span><span className="code-string">&quot;fulfillment-team&quot;</span>,<br />
        {"            "}<span className="code-property">capabilities</span><span className="code-operator">=</span>[<span className="code-string">&quot;read:orders&quot;</span>, <span className="code-string">&quot;write:shipments&quot;</span>],<br />
        {"            "}<span className="code-property">risk_level</span><span className="code-operator">=</span><span className="code-string">&quot;medium&quot;</span>,<br />
        {"        "})<br />
        {"        "}<span className="code-function">print</span>(<span className="code-variable">agent</span>.<span className="code-property">data</span>.<span className="code-property">id</span>)  <span className="code-comment"># UUIDv7</span><br />
        <br />
        <span className="code-variable">asyncio</span>.<span className="code-function">run</span>(<span className="code-function">main</span>())
      </code>
    ),
  },
  {
    label: "curl",
    language: "bash",
    code: `curl -X POST https://api.agentgate.dev/api/v1/agents \\
  -H "Authorization: Bearer $AGENTGATE_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "order-processor",
    "owner": "fulfillment-team",
    "capabilities": ["read:orders", "write:shipments"],
    "riskLevel": "medium"
  }'`,
    content: (
      <code>
        <span className="code-function">curl</span> -X POST <span className="code-string">https://api.agentgate.dev/api/v1/agents</span> \<br />
        {"  "}-H <span className="code-string">&quot;Authorization: Bearer $AGENTGATE_KEY&quot;</span> \<br />
        {"  "}-H <span className="code-string">&quot;Content-Type: application/json&quot;</span> \<br />
        {"  "}-d <span className="code-string">&apos;{"{"}</span><br />
        {"    "}<span className="code-property">&quot;name&quot;</span>: <span className="code-string">&quot;order-processor&quot;</span>,<br />
        {"    "}<span className="code-property">&quot;owner&quot;</span>: <span className="code-string">&quot;fulfillment-team&quot;</span>,<br />
        {"    "}<span className="code-property">&quot;capabilities&quot;</span>: [<span className="code-string">&quot;read:orders&quot;</span>, <span className="code-string">&quot;write:shipments&quot;</span>],<br />
        {"    "}<span className="code-property">&quot;riskLevel&quot;</span>: <span className="code-string">&quot;medium&quot;</span><br />
        {"  "}<span className="code-string">{"}"}&apos;</span>
      </code>
    ),
  },
];

const createPolicyTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `const policy = await gate.createPolicy({
  name: "fulfillment-access",
  description: "Allow order-processing agents to manage shipments",
  rules: [
    {
      effect: "allow",
      actions: ["read:orders", "write:shipments"],
      conditions: {
        agentOwner: "fulfillment-team",
        riskLevel: { $lte: "medium" },
      },
    },
    {
      effect: "deny",
      actions: ["delete:orders"],
    },
  ],
});`,
    content: (
      <code>
        <span className="code-keyword">const</span> <span className="code-variable">policy</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span>.<span className="code-function">createPolicy</span>({"{"}
        <br />
        {"  "}<span className="code-property">name</span>: <span className="code-string">&quot;fulfillment-access&quot;</span>,<br />
        {"  "}<span className="code-property">description</span>: <span className="code-string">&quot;Allow order-processing agents to manage shipments&quot;</span>,<br />
        {"  "}<span className="code-property">rules</span>: [<br />
        {"    "}{"{"}
        <br />
        {"      "}<span className="code-property">effect</span>: <span className="code-string">&quot;allow&quot;</span>,<br />
        {"      "}<span className="code-property">actions</span>: [<span className="code-string">&quot;read:orders&quot;</span>, <span className="code-string">&quot;write:shipments&quot;</span>],<br />
        {"      "}<span className="code-property">conditions</span>: {"{"}
        <br />
        {"        "}<span className="code-property">agentOwner</span>: <span className="code-string">&quot;fulfillment-team&quot;</span>,<br />
        {"        "}<span className="code-property">riskLevel</span>: {"{"} <span className="code-property">$lte</span>: <span className="code-string">&quot;medium&quot;</span> {"}"},<br />
        {"      "}{"}"},<br />
        {"    "}{"}"},<br />
        {"    "}{"{"}
        <br />
        {"      "}<span className="code-property">effect</span>: <span className="code-string">&quot;deny&quot;</span>,<br />
        {"      "}<span className="code-property">actions</span>: [<span className="code-string">&quot;delete:orders&quot;</span>],<br />
        {"    "}{"}"},<br />
        {"  "}],<br />
        {"}"});
      </code>
    ),
  },
  {
    label: "Python",
    language: "python",
    code: `policy = await gate.create_policy(
    name="fulfillment-access",
    description="Allow order-processing agents to manage shipments",
    rules=[
        {
            "effect": "allow",
            "actions": ["read:orders", "write:shipments"],
            "conditions": {
                "agent_owner": "fulfillment-team",
                "risk_level": {"$lte": "medium"},
            },
        },
        {
            "effect": "deny",
            "actions": ["delete:orders"],
        },
    ],
)`,
    content: (
      <code>
        <span className="code-variable">policy</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span>.<span className="code-function">create_policy</span>(<br />
        {"    "}<span className="code-property">name</span><span className="code-operator">=</span><span className="code-string">&quot;fulfillment-access&quot;</span>,<br />
        {"    "}<span className="code-property">description</span><span className="code-operator">=</span><span className="code-string">&quot;Allow order-processing agents to manage shipments&quot;</span>,<br />
        {"    "}<span className="code-property">rules</span><span className="code-operator">=</span>[<br />
        {"        "}{"{"}
        <br />
        {"            "}<span className="code-string">&quot;effect&quot;</span>: <span className="code-string">&quot;allow&quot;</span>,<br />
        {"            "}<span className="code-string">&quot;actions&quot;</span>: [<span className="code-string">&quot;read:orders&quot;</span>, <span className="code-string">&quot;write:shipments&quot;</span>],<br />
        {"            "}<span className="code-string">&quot;conditions&quot;</span>: {"{"}
        <br />
        {"                "}<span className="code-string">&quot;agent_owner&quot;</span>: <span className="code-string">&quot;fulfillment-team&quot;</span>,<br />
        {"                "}<span className="code-string">&quot;risk_level&quot;</span>: {"{"}<span className="code-string">&quot;$lte&quot;</span>: <span className="code-string">&quot;medium&quot;</span>{"}"},<br />
        {"            "}{"}"},<br />
        {"        "}{"}"},<br />
        {"        "}{"{"}
        <br />
        {"            "}<span className="code-string">&quot;effect&quot;</span>: <span className="code-string">&quot;deny&quot;</span>,<br />
        {"            "}<span className="code-string">&quot;actions&quot;</span>: [<span className="code-string">&quot;delete:orders&quot;</span>],<br />
        {"        "}{"}"},<br />
        {"    "}],<br />
        )
      </code>
    ),
  },
  {
    label: "curl",
    language: "bash",
    code: `curl -X POST https://api.agentgate.dev/api/v1/policies \\
  -H "Authorization: Bearer $AGENTGATE_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "fulfillment-access",
    "description": "Allow order-processing agents to manage shipments",
    "rules": [
      {
        "effect": "allow",
        "actions": ["read:orders", "write:shipments"],
        "conditions": {
          "agentOwner": "fulfillment-team",
          "riskLevel": { "$lte": "medium" }
        }
      },
      { "effect": "deny", "actions": ["delete:orders"] }
    ]
  }'`,
    content: (
      <code>
        <span className="code-function">curl</span> -X POST <span className="code-string">https://api.agentgate.dev/api/v1/policies</span> \<br />
        {"  "}-H <span className="code-string">&quot;Authorization: Bearer $AGENTGATE_KEY&quot;</span> \<br />
        {"  "}-H <span className="code-string">&quot;Content-Type: application/json&quot;</span> \<br />
        {"  "}-d <span className="code-string">&apos;{"{"}</span><br />
        {"    "}<span className="code-property">&quot;name&quot;</span>: <span className="code-string">&quot;fulfillment-access&quot;</span>,<br />
        {"    "}<span className="code-property">&quot;description&quot;</span>: <span className="code-string">&quot;Allow order-processing agents to manage shipments&quot;</span>,<br />
        {"    "}<span className="code-property">&quot;rules&quot;</span>: [<br />
        {"      "}{"{"}<br />
        {"        "}<span className="code-property">&quot;effect&quot;</span>: <span className="code-string">&quot;allow&quot;</span>,<br />
        {"        "}<span className="code-property">&quot;actions&quot;</span>: [<span className="code-string">&quot;read:orders&quot;</span>, <span className="code-string">&quot;write:shipments&quot;</span>],<br />
        {"        "}<span className="code-property">&quot;conditions&quot;</span>: {"{"} <span className="code-property">&quot;agentOwner&quot;</span>: <span className="code-string">&quot;fulfillment-team&quot;</span>, <span className="code-property">&quot;riskLevel&quot;</span>: {"{"} <span className="code-string">&quot;$lte&quot;</span>: <span className="code-string">&quot;medium&quot;</span> {"}"} {"}"}<br />
        {"      "}{"}"},<br />
        {"      "}{"{"} <span className="code-property">&quot;effect&quot;</span>: <span className="code-string">&quot;deny&quot;</span>, <span className="code-property">&quot;actions&quot;</span>: [<span className="code-string">&quot;delete:orders&quot;</span>] {"}"}<br />
        {"    "}]<br />
        {"  "}<span className="code-string">{"}"}&apos;</span>
      </code>
    ),
  },
];

const enforceTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `// Quick boolean check
const allowed = await gate.can(agent.data.id, "write:shipments");

if (allowed) {
  // proceed with action
}

// Full guard with context — returns decision + reasoning
const decision = await gate.guard({
  agentId: agent.data.id,
  action: "write:shipments",
  resource: "shipment:ship_9X2k",
  context: {
    ipAddress: "10.0.1.42",
    region: "us-east-1",
  },
});

if (decision.data.effect === "allow") {
  await processShipment();
} else if (decision.data.effect === "escalate") {
  await requestHumanApproval(decision.data.reason);
} else {
  console.error("Denied:", decision.data.reason);
}`,
    content: (
      <code>
        <span className="code-comment">// Quick boolean check</span><br />
        <span className="code-keyword">const</span> <span className="code-variable">allowed</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span>.<span className="code-function">can</span>(<span className="code-variable">agent</span>.<span className="code-property">data</span>.<span className="code-property">id</span>, <span className="code-string">&quot;write:shipments&quot;</span>);<br />
        <br />
        <span className="code-keyword">if</span> (<span className="code-variable">allowed</span>) {"{"}
        <br />
        {"  "}<span className="code-comment">// proceed with action</span><br />
        {"}"}
        <br />
        <br />
        <span className="code-comment">// Full guard with context — returns decision + reasoning</span><br />
        <span className="code-keyword">const</span> <span className="code-variable">decision</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span>.<span className="code-function">guard</span>({"{"}
        <br />
        {"  "}<span className="code-property">agentId</span>: <span className="code-variable">agent</span>.<span className="code-property">data</span>.<span className="code-property">id</span>,<br />
        {"  "}<span className="code-property">action</span>: <span className="code-string">&quot;write:shipments&quot;</span>,<br />
        {"  "}<span className="code-property">resource</span>: <span className="code-string">&quot;shipment:ship_9X2k&quot;</span>,<br />
        {"  "}<span className="code-property">context</span>: {"{"}
        <br />
        {"    "}<span className="code-property">ipAddress</span>: <span className="code-string">&quot;10.0.1.42&quot;</span>,<br />
        {"    "}<span className="code-property">region</span>: <span className="code-string">&quot;us-east-1&quot;</span>,<br />
        {"  "}{"}"},<br />
        {"}"});<br />
        <br />
        <span className="code-keyword">if</span> (<span className="code-variable">decision</span>.<span className="code-property">data</span>.<span className="code-property">effect</span> <span className="code-operator">===</span> <span className="code-string">&quot;allow&quot;</span>) {"{"}
        <br />
        {"  "}<span className="code-keyword">await</span> <span className="code-function">processShipment</span>();<br />
        {"}"} <span className="code-keyword">else if</span> (<span className="code-variable">decision</span>.<span className="code-property">data</span>.<span className="code-property">effect</span> <span className="code-operator">===</span> <span className="code-string">&quot;escalate&quot;</span>) {"{"}
        <br />
        {"  "}<span className="code-keyword">await</span> <span className="code-function">requestHumanApproval</span>(<span className="code-variable">decision</span>.<span className="code-property">data</span>.<span className="code-property">reason</span>);<br />
        {"}"} <span className="code-keyword">else</span> {"{"}
        <br />
        {"  "}<span className="code-variable">console</span>.<span className="code-function">error</span>(<span className="code-string">&quot;Denied:&quot;</span>, <span className="code-variable">decision</span>.<span className="code-property">data</span>.<span className="code-property">reason</span>);<br />
        {"}"}
      </code>
    ),
  },
  {
    label: "Python",
    language: "python",
    code: `# Quick boolean check
allowed = await gate.can(agent.data.id, "write:shipments")

if allowed:
    pass  # proceed with action

# Full guard with context
decision = await gate.guard(
    agent_id=agent.data.id,
    action="write:shipments",
    resource="shipment:ship_9X2k",
    context={
        "ip_address": "10.0.1.42",
        "region": "us-east-1",
    },
)

if decision.data.effect == "allow":
    await process_shipment()
elif decision.data.effect == "escalate":
    await request_human_approval(decision.data.reason)
else:
    print(f"Denied: {decision.data.reason}")`,
    content: (
      <code>
        <span className="code-comment"># Quick boolean check</span><br />
        <span className="code-variable">allowed</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span>.<span className="code-function">can</span>(<span className="code-variable">agent</span>.<span className="code-property">data</span>.<span className="code-property">id</span>, <span className="code-string">&quot;write:shipments&quot;</span>)<br />
        <br />
        <span className="code-keyword">if</span> <span className="code-variable">allowed</span>:<br />
        {"    "}<span className="code-keyword">pass</span>  <span className="code-comment"># proceed with action</span><br />
        <br />
        <span className="code-comment"># Full guard with context</span><br />
        <span className="code-variable">decision</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span>.<span className="code-function">guard</span>(<br />
        {"    "}<span className="code-property">agent_id</span><span className="code-operator">=</span><span className="code-variable">agent</span>.<span className="code-property">data</span>.<span className="code-property">id</span>,<br />
        {"    "}<span className="code-property">action</span><span className="code-operator">=</span><span className="code-string">&quot;write:shipments&quot;</span>,<br />
        {"    "}<span className="code-property">resource</span><span className="code-operator">=</span><span className="code-string">&quot;shipment:ship_9X2k&quot;</span>,<br />
        {"    "}<span className="code-property">context</span><span className="code-operator">=</span>{"{"}
        <br />
        {"        "}<span className="code-string">&quot;ip_address&quot;</span>: <span className="code-string">&quot;10.0.1.42&quot;</span>,<br />
        {"        "}<span className="code-string">&quot;region&quot;</span>: <span className="code-string">&quot;us-east-1&quot;</span>,<br />
        {"    "}{"}"},<br />
        )<br />
        <br />
        <span className="code-keyword">if</span> <span className="code-variable">decision</span>.<span className="code-property">data</span>.<span className="code-property">effect</span> <span className="code-operator">==</span> <span className="code-string">&quot;allow&quot;</span>:<br />
        {"    "}<span className="code-keyword">await</span> <span className="code-function">process_shipment</span>()<br />
        <span className="code-keyword">elif</span> <span className="code-variable">decision</span>.<span className="code-property">data</span>.<span className="code-property">effect</span> <span className="code-operator">==</span> <span className="code-string">&quot;escalate&quot;</span>:<br />
        {"    "}<span className="code-keyword">await</span> <span className="code-function">request_human_approval</span>(<span className="code-variable">decision</span>.<span className="code-property">data</span>.<span className="code-property">reason</span>)<br />
        <span className="code-keyword">else</span>:<br />
        {"    "}<span className="code-function">print</span>(<span className="code-string">f&quot;Denied: {"{"}<span className="code-variable">decision</span>.<span className="code-property">data</span>.<span className="code-property">reason</span>{"}"}&quot;</span>)
      </code>
    ),
  },
  {
    label: "curl",
    language: "bash",
    code: `curl -X POST https://api.agentgate.dev/api/v1/guard \\
  -H "Authorization: Bearer $AGENTGATE_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "YOUR_AGENT_ID",
    "action": "write:shipments",
    "resource": "shipment:ship_9X2k",
    "context": {
      "ipAddress": "10.0.1.42",
      "region": "us-east-1"
    }
  }'`,
    content: (
      <code>
        <span className="code-function">curl</span> -X POST <span className="code-string">https://api.agentgate.dev/api/v1/guard</span> \<br />
        {"  "}-H <span className="code-string">&quot;Authorization: Bearer $AGENTGATE_KEY&quot;</span> \<br />
        {"  "}-H <span className="code-string">&quot;Content-Type: application/json&quot;</span> \<br />
        {"  "}-d <span className="code-string">&apos;{"{"}</span><br />
        {"    "}<span className="code-property">&quot;agentId&quot;</span>: <span className="code-string">&quot;YOUR_AGENT_ID&quot;</span>,<br />
        {"    "}<span className="code-property">&quot;action&quot;</span>: <span className="code-string">&quot;write:shipments&quot;</span>,<br />
        {"    "}<span className="code-property">&quot;resource&quot;</span>: <span className="code-string">&quot;shipment:ship_9X2k&quot;</span>,<br />
        {"    "}<span className="code-property">&quot;context&quot;</span>: {"{"}
        <br />
        {"      "}<span className="code-property">&quot;ipAddress&quot;</span>: <span className="code-string">&quot;10.0.1.42&quot;</span>,<br />
        {"      "}<span className="code-property">&quot;region&quot;</span>: <span className="code-string">&quot;us-east-1&quot;</span><br />
        {"    "}{"}"}<br />
        {"  "}<span className="code-string">{"}"}&apos;</span>
      </code>
    ),
  },
];

const auditTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `const trail = await gate.queryAudit({
  agentId: agent.data.id,
  action: "write:shipments",
  from: "2026-03-01T00:00:00Z",
  limit: 50,
});

for (const entry of trail.data) {
  console.log(entry.timestamp, entry.effect, entry.action);
}`,
    content: (
      <code>
        <span className="code-keyword">const</span> <span className="code-variable">trail</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span>.<span className="code-function">queryAudit</span>({"{"}
        <br />
        {"  "}<span className="code-property">agentId</span>: <span className="code-variable">agent</span>.<span className="code-property">data</span>.<span className="code-property">id</span>,<br />
        {"  "}<span className="code-property">action</span>: <span className="code-string">&quot;write:shipments&quot;</span>,<br />
        {"  "}<span className="code-property">from</span>: <span className="code-string">&quot;2026-03-01T00:00:00Z&quot;</span>,<br />
        {"  "}<span className="code-property">limit</span>: <span className="code-variable">50</span>,<br />
        {"}"});<br />
        <br />
        <span className="code-keyword">for</span> (<span className="code-keyword">const</span> <span className="code-variable">entry</span> <span className="code-keyword">of</span> <span className="code-variable">trail</span>.<span className="code-property">data</span>) {"{"}
        <br />
        {"  "}<span className="code-variable">console</span>.<span className="code-function">log</span>(<span className="code-variable">entry</span>.<span className="code-property">timestamp</span>, <span className="code-variable">entry</span>.<span className="code-property">effect</span>, <span className="code-variable">entry</span>.<span className="code-property">action</span>);<br />
        {"}"}
      </code>
    ),
  },
  {
    label: "Python",
    language: "python",
    code: `trail = await gate.query_audit(
    agent_id=agent.data.id,
    action="write:shipments",
    from_date="2026-03-01T00:00:00Z",
    limit=50,
)

for entry in trail.data:
    print(entry.timestamp, entry.effect, entry.action)`,
    content: (
      <code>
        <span className="code-variable">trail</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span>.<span className="code-function">query_audit</span>(<br />
        {"    "}<span className="code-property">agent_id</span><span className="code-operator">=</span><span className="code-variable">agent</span>.<span className="code-property">data</span>.<span className="code-property">id</span>,<br />
        {"    "}<span className="code-property">action</span><span className="code-operator">=</span><span className="code-string">&quot;write:shipments&quot;</span>,<br />
        {"    "}<span className="code-property">from_date</span><span className="code-operator">=</span><span className="code-string">&quot;2026-03-01T00:00:00Z&quot;</span>,<br />
        {"    "}<span className="code-property">limit</span><span className="code-operator">=</span><span className="code-variable">50</span>,<br />
        )<br />
        <br />
        <span className="code-keyword">for</span> <span className="code-variable">entry</span> <span className="code-keyword">in</span> <span className="code-variable">trail</span>.<span className="code-property">data</span>:<br />
        {"    "}<span className="code-function">print</span>(<span className="code-variable">entry</span>.<span className="code-property">timestamp</span>, <span className="code-variable">entry</span>.<span className="code-property">effect</span>, <span className="code-variable">entry</span>.<span className="code-property">action</span>)
      </code>
    ),
  },
  {
    label: "curl",
    language: "bash",
    code: `curl "https://api.agentgate.dev/api/v1/audit?agentId=YOUR_AGENT_ID&action=write:shipments&from=2026-03-01T00:00:00Z&limit=50" \\
  -H "Authorization: Bearer $AGENTGATE_KEY"`,
    content: (
      <code>
        <span className="code-function">curl</span> <span className="code-string">&quot;https://api.agentgate.dev/api/v1/audit?agentId=YOUR_AGENT_ID&amp;action=write:shipments&amp;from=2026-03-01T00:00:00Z&amp;limit=50&quot;</span> \<br />
        {"  "}-H <span className="code-string">&quot;Authorization: Bearer $AGENTGATE_KEY&quot;</span>
      </code>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                    */
/* ------------------------------------------------------------------ */

export default function GettingStarted() {
  return (
    <div style={{ position: "relative" }}>
      <OnThisPage items={tocItems} />

      <h1
        className="gradient-text"
        style={{ fontSize: "2.25rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}
      >
        Getting Started
      </h1>
      <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: 40, maxWidth: 640, lineHeight: 1.7 }}>
        Go from zero to enforcing agent permissions in under 5 minutes. This guide walks through installation,
        agent registration, policy creation, and your first authorization check.
      </p>

      {/* ---- Installation ---- */}
      <section id="installation" style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
          Installation
        </h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 20 }}>
          Install the AgentGate SDK for your language of choice.
        </p>
        <CodeBlock tabs={installTabs} />
      </section>

      {/* ---- API Key ---- */}
      <section id="api-key" style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
          Get Your API Key
        </h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Create an API key from the{" "}
          <Link href="https://dashboard.agentgate.dev/settings/api-keys" style={{ color: "var(--blue)" }}>
            AgentGate Dashboard
          </Link>
          . Keys are scoped to a single tenant and carry the permissions you assign.
        </p>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          All API requests require the key in the <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>Authorization</code> header:
        </p>
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "14px 18px",
            fontFamily: "monospace",
            fontSize: "0.88rem",
            color: "var(--text-secondary)",
            marginBottom: 16,
          }}
        >
          <span className="code-property">Authorization</span>: <span className="code-keyword">Bearer</span> <span className="code-string">ag_live_xxxxxxxxxxxx</span>
        </div>
        <Callout type="warning">
          Store your API key securely. Never commit it to source control or expose it in client-side code.
          Use environment variables or a secrets manager.
        </Callout>
      </section>

      {/* ---- Register Agent ---- */}
      <section id="register-agent" style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
          Register Your First Agent
        </h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 20 }}>
          Every AI agent in your system gets a unique identity. Register an agent with a name, owner,
          capabilities, and risk level. The API returns a UUIDv7 identifier you will use in all subsequent
          calls.
        </p>
        <CodeBlock tabs={registerAgentTabs} />
      </section>

      {/* ---- Create Policy ---- */}
      <section id="create-policy" style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
          Create a Policy
        </h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 20 }}>
          Policies define what agents can and cannot do. Each policy contains an array of rules.
          Rules can have an effect of <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>allow</code>,{" "}
          <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>deny</code>, or{" "}
          <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>escalate</code>.
          Conditions support attribute-based operators like <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>$lte</code>,{" "}
          <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>$in</code>, and{" "}
          <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>$regex</code>.
        </p>
        <CodeBlock tabs={createPolicyTabs} />
      </section>

      {/* ---- Enforce ---- */}
      <section id="enforce" style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
          Enforce Permissions
        </h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 12 }}>
          There are two ways to check permissions at runtime:
        </p>
        <ul style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 20, paddingLeft: 24 }}>
          <li>
            <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>can()</code>{" "}
            — a quick boolean check. Returns <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>true</code> or{" "}
            <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>false</code>.
          </li>
          <li>
            <code style={{ color: "var(--teal)", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4 }}>guard()</code>{" "}
            — a full authorization check that returns the decision effect, matched rule, and reasoning. Accepts
            optional resource and context parameters for attribute-based evaluation.
          </li>
        </ul>
        <CodeBlock tabs={enforceTabs} />
        <Callout type="info">
          Both <code style={{ color: "var(--teal)" }}>can()</code> and <code style={{ color: "var(--teal)" }}>guard()</code> automatically
          log to the audit trail. No extra instrumentation needed.
        </Callout>
      </section>

      {/* ---- Audit ---- */}
      <section id="audit" style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
          View the Audit Trail
        </h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 20 }}>
          Every authorization decision is recorded to an append-only audit log. Query the trail by agent,
          action, time range, or decision outcome. The audit trail is immutable and designed for compliance
          reporting across SOC 2, HIPAA, GDPR, and other frameworks.
        </p>
        <CodeBlock tabs={auditTabs} />
      </section>

      {/* ---- Next Steps ---- */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
          Next Steps
        </h2>
        <ul style={{ color: "var(--text-secondary)", lineHeight: 2, paddingLeft: 24 }}>
          <li>
            <Link href="/concepts" style={{ color: "var(--blue)" }}>Core Concepts</Link>{" "}
            — Understand agent identity, policies, tenancy, and governance in depth.
          </li>
          <li>
            <Link href="/api-reference" style={{ color: "var(--blue)" }}>API Reference</Link>{" "}
            — Full endpoint documentation with request/response schemas.
          </li>
          <li>
            <Link href="/integrations/openai" style={{ color: "var(--blue)" }}>Integrations</Link>{" "}
            — Drop-in guards for OpenAI, Anthropic, LangChain, and CrewAI.
          </li>
          <li>
            <Link href="/sdks/typescript" style={{ color: "var(--blue)" }}>SDK Reference</Link>{" "}
            — Detailed guides for TypeScript, Python, and Go SDKs.
          </li>
        </ul>
      </section>
    </div>
  );
}
