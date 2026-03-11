"use client";

import { CodeBlock, type CodeTab } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { ParamTable, type Param } from "@/components/ParamTable";

/* ------------------------------------------------------------------ */
/*  Code Tabs                                                          */
/* ------------------------------------------------------------------ */

const setupTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { AgentGateClient } from "@agentgate/sdk";
import { WebhookManager } from "@agentgate/integrations";

const gate = new AgentGateClient({
  baseUrl: "https://api.agentgate.dev",
  apiKey: process.env.AGENTGATE_KEY!,
});

const webhooks = new WebhookManager();`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">{"{ AgentGateClient }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/sdk&quot;</span>;{"\n"}
        <span className="code-keyword">import</span> <span className="code-variable">{"{ WebhookManager }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/integrations&quot;</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">gate</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">AgentGateClient</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">baseUrl</span><span className="code-operator">:</span> <span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,{"\n"}
        {"  "}<span className="code-property">apiKey</span><span className="code-operator">:</span> <span className="code-variable">process</span><span className="code-operator">.</span><span className="code-variable">env</span><span className="code-operator">.</span><span className="code-variable">AGENTGATE_KEY</span><span className="code-operator">!</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">webhooks</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">WebhookManager</span><span className="code-operator">()</span>;
      </code>
    ),
  },
];

const registerTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `// Register a webhook for denial and escalation events
webhooks.register({
  url: "https://your-app.com/webhooks/agentgate",
  secret: process.env.WEBHOOK_SECRET,
  events: ["decision.deny", "decision.escalate", "anomaly.detected"],
  headers: {
    "X-Custom-Header": "my-value",
  },
});

// Register another webhook for agent lifecycle events
webhooks.register({
  url: "https://your-app.com/webhooks/agents",
  secret: process.env.WEBHOOK_SECRET,
  events: ["agent.created", "agent.revoked"],
});

// Unregister a webhook
webhooks.unregister("https://your-app.com/webhooks/agents");`,
    content: (
      <code>
        <span className="code-comment">// Register a webhook for denial and escalation events</span>{"\n"}
        <span className="code-variable">webhooks</span><span className="code-operator">.</span><span className="code-function">register</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">url</span><span className="code-operator">:</span> <span className="code-string">&quot;https://your-app.com/webhooks/agentgate&quot;</span>,{"\n"}
        {"  "}<span className="code-property">secret</span><span className="code-operator">:</span> <span className="code-variable">process</span><span className="code-operator">.</span><span className="code-variable">env</span><span className="code-operator">.</span><span className="code-variable">WEBHOOK_SECRET</span>,{"\n"}
        {"  "}<span className="code-property">events</span><span className="code-operator">:</span> [<span className="code-string">&quot;decision.deny&quot;</span>, <span className="code-string">&quot;decision.escalate&quot;</span>, <span className="code-string">&quot;anomaly.detected&quot;</span>],{"\n"}
        {"  "}<span className="code-property">headers</span><span className="code-operator">:</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-string">&quot;X-Custom-Header&quot;</span><span className="code-operator">:</span> <span className="code-string">&quot;my-value&quot;</span>,{"\n"}
        {"  "}<span className="code-operator">{"}"},</span>{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// Register another webhook for agent lifecycle events</span>{"\n"}
        <span className="code-variable">webhooks</span><span className="code-operator">.</span><span className="code-function">register</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">url</span><span className="code-operator">:</span> <span className="code-string">&quot;https://your-app.com/webhooks/agents&quot;</span>,{"\n"}
        {"  "}<span className="code-property">secret</span><span className="code-operator">:</span> <span className="code-variable">process</span><span className="code-operator">.</span><span className="code-variable">env</span><span className="code-operator">.</span><span className="code-variable">WEBHOOK_SECRET</span>,{"\n"}
        {"  "}<span className="code-property">events</span><span className="code-operator">:</span> [<span className="code-string">&quot;agent.created&quot;</span>, <span className="code-string">&quot;agent.revoked&quot;</span>],{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// Unregister a webhook</span>{"\n"}
        <span className="code-variable">webhooks</span><span className="code-operator">.</span><span className="code-function">unregister</span><span className="code-operator">(</span><span className="code-string">&quot;https://your-app.com/webhooks/agents&quot;</span><span className="code-operator">)</span>;
      </code>
    ),
  },
];

const payloadTabs: CodeTab[] = [
  {
    label: "JSON",
    language: "json",
    code: `{
  "event": "decision.deny",
  "timestamp": "2026-03-11T14:30:00.000Z",
  "data": {
    "agentId": "01JQXYZ...",
    "action": "delete",
    "resource": "production/database",
    "allowed": false,
    "reason": "No matching allow policy for delete on production/*",
    "matchedPolicies": [],
    "context": {
      "ip": "10.0.1.42"
    }
  }
}`,
    content: (
      <code>
        <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-property">&quot;event&quot;</span><span className="code-operator">:</span> <span className="code-string">&quot;decision.deny&quot;</span>,{"\n"}
        {"  "}<span className="code-property">&quot;timestamp&quot;</span><span className="code-operator">:</span> <span className="code-string">&quot;2026-03-11T14:30:00.000Z&quot;</span>,{"\n"}
        {"  "}<span className="code-property">&quot;data&quot;</span><span className="code-operator">:</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-property">&quot;agentId&quot;</span><span className="code-operator">:</span> <span className="code-string">&quot;01JQXYZ...&quot;</span>,{"\n"}
        {"    "}<span className="code-property">&quot;action&quot;</span><span className="code-operator">:</span> <span className="code-string">&quot;delete&quot;</span>,{"\n"}
        {"    "}<span className="code-property">&quot;resource&quot;</span><span className="code-operator">:</span> <span className="code-string">&quot;production/database&quot;</span>,{"\n"}
        {"    "}<span className="code-property">&quot;allowed&quot;</span><span className="code-operator">:</span> <span className="code-keyword">false</span>,{"\n"}
        {"    "}<span className="code-property">&quot;reason&quot;</span><span className="code-operator">:</span> <span className="code-string">&quot;No matching allow policy for delete on production/*&quot;</span>,{"\n"}
        {"    "}<span className="code-property">&quot;matchedPolicies&quot;</span><span className="code-operator">:</span> [],{"\n"}
        {"    "}<span className="code-property">&quot;context&quot;</span><span className="code-operator">:</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"      "}<span className="code-property">&quot;ip&quot;</span><span className="code-operator">:</span> <span className="code-string">&quot;10.0.1.42&quot;</span>{"\n"}
        {"    "}<span className="code-operator">{"}"}</span>{"\n"}
        {"  "}<span className="code-operator">{"}"}</span>{"\n"}
        <span className="code-operator">{"}"}</span>
      </code>
    ),
  },
];

const verifyTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { createHmac } from "crypto";

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return \`sha256=\${expected}\` === signature;
}

// In your webhook handler (e.g., Express)
app.post("/webhooks/agentgate", (req, res) => {
  const signature = req.headers["x-agentgate-signature"] as string;
  const payload = JSON.stringify(req.body);

  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET!)) {
    return res.status(401).send("Invalid signature");
  }

  const { event, data } = req.body;

  switch (event) {
    case "decision.deny":
      console.log(\`Agent \${data.agentId} denied: \${data.action} on \${data.resource}\`);
      break;
    case "anomaly.detected":
      console.log(\`Anomaly detected for agent \${data.agentId}\`);
      break;
  }

  res.status(200).send("OK");
});`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">{"{ createHmac }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;crypto&quot;</span>;{"\n\n"}
        <span className="code-keyword">function</span> <span className="code-function">verifyWebhookSignature</span><span className="code-operator">(</span>{"\n"}
        {"  "}<span className="code-variable">payload</span><span className="code-operator">:</span> <span className="code-type">string</span>,{"\n"}
        {"  "}<span className="code-variable">signature</span><span className="code-operator">:</span> <span className="code-type">string</span>,{"\n"}
        {"  "}<span className="code-variable">secret</span><span className="code-operator">:</span> <span className="code-type">string</span>{"\n"}
        <span className="code-operator">):</span> <span className="code-type">boolean</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-keyword">const</span> <span className="code-variable">expected</span> <span className="code-operator">=</span> <span className="code-function">createHmac</span><span className="code-operator">(</span><span className="code-string">&quot;sha256&quot;</span>, <span className="code-variable">secret</span><span className="code-operator">)</span>{"\n"}
        {"    "}<span className="code-operator">.</span><span className="code-function">update</span><span className="code-operator">(</span><span className="code-variable">payload</span><span className="code-operator">)</span>{"\n"}
        {"    "}<span className="code-operator">.</span><span className="code-function">digest</span><span className="code-operator">(</span><span className="code-string">&quot;hex&quot;</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-keyword">return</span> <span className="code-string">{"`sha256=${expected}`"}</span> <span className="code-operator">===</span> <span className="code-variable">signature</span>;{"\n"}
        <span className="code-operator">{"}"}</span>{"\n\n"}
        <span className="code-comment">// In your webhook handler (e.g., Express)</span>{"\n"}
        <span className="code-variable">app</span><span className="code-operator">.</span><span className="code-function">post</span><span className="code-operator">(</span><span className="code-string">&quot;/webhooks/agentgate&quot;</span>, <span className="code-operator">(</span><span className="code-variable">req</span>, <span className="code-variable">res</span><span className="code-operator">)</span> <span className="code-keyword">=&gt;</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-keyword">const</span> <span className="code-variable">signature</span> <span className="code-operator">=</span> <span className="code-variable">req</span><span className="code-operator">.</span><span className="code-variable">headers</span>[<span className="code-string">&quot;x-agentgate-signature&quot;</span>] <span className="code-keyword">as</span> <span className="code-type">string</span>;{"\n"}
        {"  "}<span className="code-keyword">const</span> <span className="code-variable">payload</span> <span className="code-operator">=</span> <span className="code-type">JSON</span><span className="code-operator">.</span><span className="code-function">stringify</span><span className="code-operator">(</span><span className="code-variable">req</span><span className="code-operator">.</span><span className="code-property">body</span><span className="code-operator">)</span>;{"\n\n"}
        {"  "}<span className="code-keyword">if</span> <span className="code-operator">(!</span><span className="code-function">verifyWebhookSignature</span><span className="code-operator">(</span><span className="code-variable">payload</span>, <span className="code-variable">signature</span>, <span className="code-variable">process</span><span className="code-operator">.</span><span className="code-variable">env</span><span className="code-operator">.</span><span className="code-variable">WEBHOOK_SECRET</span><span className="code-operator">!))</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-keyword">return</span> <span className="code-variable">res</span><span className="code-operator">.</span><span className="code-function">status</span><span className="code-operator">(</span><span className="code-variable">401</span><span className="code-operator">).</span><span className="code-function">send</span><span className="code-operator">(</span><span className="code-string">&quot;Invalid signature&quot;</span><span className="code-operator">)</span>;{"\n"}
        {"  "}<span className="code-operator">{"}"}</span>{"\n\n"}
        {"  "}<span className="code-keyword">const</span> <span className="code-variable">{"{ event, data }"}</span> <span className="code-operator">=</span> <span className="code-variable">req</span><span className="code-operator">.</span><span className="code-property">body</span>;{"\n\n"}
        {"  "}<span className="code-keyword">switch</span> <span className="code-operator">(</span><span className="code-variable">event</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"    "}<span className="code-keyword">case</span> <span className="code-string">&quot;decision.deny&quot;</span><span className="code-operator">:</span>{"\n"}
        {"      "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">log</span><span className="code-operator">(</span><span className="code-string">{"`Agent ${data.agentId} denied: ${data.action} on ${data.resource}`"}</span><span className="code-operator">)</span>;{"\n"}
        {"      "}<span className="code-keyword">break</span>;{"\n"}
        {"    "}<span className="code-keyword">case</span> <span className="code-string">&quot;anomaly.detected&quot;</span><span className="code-operator">:</span>{"\n"}
        {"      "}<span className="code-variable">console</span><span className="code-operator">.</span><span className="code-function">log</span><span className="code-operator">(</span><span className="code-string">{"`Anomaly detected for agent ${data.agentId}`"}</span><span className="code-operator">)</span>;{"\n"}
        {"      "}<span className="code-keyword">break</span>;{"\n"}
        {"  "}<span className="code-operator">{"}"}</span>{"\n\n"}
        {"  "}<span className="code-variable">res</span><span className="code-operator">.</span><span className="code-function">status</span><span className="code-operator">(</span><span className="code-variable">200</span><span className="code-operator">).</span><span className="code-function">send</span><span className="code-operator">(</span><span className="code-string">&quot;OK&quot;</span><span className="code-operator">)</span>;{"\n"}
        <span className="code-operator">{"})"}</span>;
      </code>
    ),
  },
];

const decisionCallbackTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `// Create a decision callback and wire it to the AgentGate client
const decisionCallback = webhooks.createDecisionCallback();

const gate = new AgentGateClient({
  baseUrl: "https://api.agentgate.dev",
  apiKey: process.env.AGENTGATE_KEY!,
  onDecision: decisionCallback,
});

// Now every authorization decision automatically emits to registered webhooks`,
    content: (
      <code>
        <span className="code-comment">// Create a decision callback and wire it to the AgentGate client</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">decisionCallback</span> <span className="code-operator">=</span> <span className="code-variable">webhooks</span><span className="code-operator">.</span><span className="code-function">createDecisionCallback</span><span className="code-operator">()</span>;{"\n\n"}
        <span className="code-keyword">const</span> <span className="code-variable">gate</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">AgentGateClient</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">baseUrl</span><span className="code-operator">:</span> <span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,{"\n"}
        {"  "}<span className="code-property">apiKey</span><span className="code-operator">:</span> <span className="code-variable">process</span><span className="code-operator">.</span><span className="code-variable">env</span><span className="code-operator">.</span><span className="code-variable">AGENTGATE_KEY</span><span className="code-operator">!</span>,{"\n"}
        {"  "}<span className="code-property">onDecision</span><span className="code-operator">:</span> <span className="code-variable">decisionCallback</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// Now every authorization decision automatically emits to registered webhooks</span>
      </code>
    ),
  },
];

const emitTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `// Manually emit an event to all registered webhooks
await webhooks.emit("anomaly.detected", {
  agentId: "agent-123",
  type: "unusual_access_pattern",
  details: "Agent made 500 requests in 60 seconds",
  timestamp: new Date().toISOString(),
});`,
    content: (
      <code>
        <span className="code-comment">// Manually emit an event to all registered webhooks</span>{"\n"}
        <span className="code-keyword">await</span> <span className="code-variable">webhooks</span><span className="code-operator">.</span><span className="code-function">emit</span><span className="code-operator">(</span><span className="code-string">&quot;anomaly.detected&quot;</span>, <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-property">agentId</span><span className="code-operator">:</span> <span className="code-string">&quot;agent-123&quot;</span>,{"\n"}
        {"  "}<span className="code-property">type</span><span className="code-operator">:</span> <span className="code-string">&quot;unusual_access_pattern&quot;</span>,{"\n"}
        {"  "}<span className="code-property">details</span><span className="code-operator">:</span> <span className="code-string">&quot;Agent made 500 requests in 60 seconds&quot;</span>,{"\n"}
        {"  "}<span className="code-property">timestamp</span><span className="code-operator">:</span> <span className="code-keyword">new</span> <span className="code-type">Date</span><span className="code-operator">().</span><span className="code-function">toISOString</span><span className="code-operator">()</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;
      </code>
    ),
  },
];

const fullExampleTabs: CodeTab[] = [
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { AgentGateClient } from "@agentgate/sdk";
import { WebhookManager } from "@agentgate/integrations";

// 1. Set up webhook manager
const webhooks = new WebhookManager();

// 2. Register webhooks for different event types
webhooks.register({
  url: "https://your-app.com/webhooks/security",
  secret: process.env.WEBHOOK_SECRET,
  events: ["decision.deny", "decision.escalate", "anomaly.detected"],
});

webhooks.register({
  url: "https://slack.com/api/incoming-webhooks/T01234",
  events: ["decision.deny", "anomaly.detected"],
  headers: { "Authorization": "Bearer xoxb-slack-token" },
});

webhooks.register({
  url: "https://your-app.com/webhooks/audit",
  secret: process.env.WEBHOOK_SECRET,
  events: ["decision.allow", "decision.deny", "agent.created", "agent.revoked"],
});

// 3. Wire the decision callback to the AgentGate client
const gate = new AgentGateClient({
  baseUrl: "https://api.agentgate.dev",
  apiKey: process.env.AGENTGATE_KEY!,
  onDecision: webhooks.createDecisionCallback(),
});

// 4. Every authorization decision now emits to matching webhooks
const allowed = await gate.can("agent-123", "delete", "production/database");
// If denied -> "decision.deny" fires to security + slack + audit webhooks

// 5. Manually emit custom events
await webhooks.emit("anomaly.detected", {
  agentId: "agent-456",
  type: "rate_limit_exceeded",
  details: "Agent exceeded 1000 requests/minute",
});`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">{"{ AgentGateClient }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/sdk&quot;</span>;{"\n"}
        <span className="code-keyword">import</span> <span className="code-variable">{"{ WebhookManager }"}</span> <span className="code-keyword">from</span> <span className="code-string">&quot;@agentgate/integrations&quot;</span>;{"\n\n"}
        <span className="code-comment">// 1. Set up webhook manager</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">webhooks</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">WebhookManager</span><span className="code-operator">()</span>;{"\n\n"}
        <span className="code-comment">// 2. Register webhooks for different event types</span>{"\n"}
        <span className="code-variable">webhooks</span><span className="code-operator">.</span><span className="code-function">register</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">url</span><span className="code-operator">:</span> <span className="code-string">&quot;https://your-app.com/webhooks/security&quot;</span>,{"\n"}
        {"  "}<span className="code-property">secret</span><span className="code-operator">:</span> <span className="code-variable">process</span><span className="code-operator">.</span><span className="code-variable">env</span><span className="code-operator">.</span><span className="code-variable">WEBHOOK_SECRET</span>,{"\n"}
        {"  "}<span className="code-property">events</span><span className="code-operator">:</span> [<span className="code-string">&quot;decision.deny&quot;</span>, <span className="code-string">&quot;decision.escalate&quot;</span>, <span className="code-string">&quot;anomaly.detected&quot;</span>],{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-variable">webhooks</span><span className="code-operator">.</span><span className="code-function">register</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">url</span><span className="code-operator">:</span> <span className="code-string">&quot;https://slack.com/api/incoming-webhooks/T01234&quot;</span>,{"\n"}
        {"  "}<span className="code-property">events</span><span className="code-operator">:</span> [<span className="code-string">&quot;decision.deny&quot;</span>, <span className="code-string">&quot;anomaly.detected&quot;</span>],{"\n"}
        {"  "}<span className="code-property">headers</span><span className="code-operator">:</span> <span className="code-operator">{"{"}</span> <span className="code-string">&quot;Authorization&quot;</span><span className="code-operator">:</span> <span className="code-string">&quot;Bearer xoxb-slack-token&quot;</span> <span className="code-operator">{"}"}</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-variable">webhooks</span><span className="code-operator">.</span><span className="code-function">register</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">url</span><span className="code-operator">:</span> <span className="code-string">&quot;https://your-app.com/webhooks/audit&quot;</span>,{"\n"}
        {"  "}<span className="code-property">secret</span><span className="code-operator">:</span> <span className="code-variable">process</span><span className="code-operator">.</span><span className="code-variable">env</span><span className="code-operator">.</span><span className="code-variable">WEBHOOK_SECRET</span>,{"\n"}
        {"  "}<span className="code-property">events</span><span className="code-operator">:</span> [<span className="code-string">&quot;decision.allow&quot;</span>, <span className="code-string">&quot;decision.deny&quot;</span>, <span className="code-string">&quot;agent.created&quot;</span>, <span className="code-string">&quot;agent.revoked&quot;</span>],{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// 3. Wire the decision callback to the AgentGate client</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">gate</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-type">AgentGateClient</span><span className="code-operator">({"{"}</span>{"\n"}
        {"  "}<span className="code-property">baseUrl</span><span className="code-operator">:</span> <span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,{"\n"}
        {"  "}<span className="code-property">apiKey</span><span className="code-operator">:</span> <span className="code-variable">process</span><span className="code-operator">.</span><span className="code-variable">env</span><span className="code-operator">.</span><span className="code-variable">AGENTGATE_KEY</span><span className="code-operator">!</span>,{"\n"}
        {"  "}<span className="code-property">onDecision</span><span className="code-operator">:</span> <span className="code-variable">webhooks</span><span className="code-operator">.</span><span className="code-function">createDecisionCallback</span><span className="code-operator">()</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;{"\n\n"}
        <span className="code-comment">// 4. Every authorization decision now emits to matching webhooks</span>{"\n"}
        <span className="code-keyword">const</span> <span className="code-variable">allowed</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">can</span><span className="code-operator">(</span><span className="code-string">&quot;agent-123&quot;</span>, <span className="code-string">&quot;delete&quot;</span>, <span className="code-string">&quot;production/database&quot;</span><span className="code-operator">)</span>;{"\n"}
        <span className="code-comment">{"// If denied -> \"decision.deny\" fires to security + slack + audit webhooks"}</span>{"\n\n"}
        <span className="code-comment">// 5. Manually emit custom events</span>{"\n"}
        <span className="code-keyword">await</span> <span className="code-variable">webhooks</span><span className="code-operator">.</span><span className="code-function">emit</span><span className="code-operator">(</span><span className="code-string">&quot;anomaly.detected&quot;</span>, <span className="code-operator">{"{"}</span>{"\n"}
        {"  "}<span className="code-property">agentId</span><span className="code-operator">:</span> <span className="code-string">&quot;agent-456&quot;</span>,{"\n"}
        {"  "}<span className="code-property">type</span><span className="code-operator">:</span> <span className="code-string">&quot;rate_limit_exceeded&quot;</span>,{"\n"}
        {"  "}<span className="code-property">details</span><span className="code-operator">:</span> <span className="code-string">&quot;Agent exceeded 1000 requests/minute&quot;</span>,{"\n"}
        <span className="code-operator">{"})"}</span>;
      </code>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Param definitions                                                  */
/* ------------------------------------------------------------------ */

const webhookConfigParams: Param[] = [
  { name: "url", type: "string", required: true, description: "The HTTPS endpoint to receive webhook payloads." },
  { name: "secret", type: "string", description: "Shared secret for HMAC-SHA256 signature verification." },
  { name: "events", type: "WebhookEvent[]", required: true, description: "Array of event types to subscribe to." },
  { name: "headers", type: "Record<string, string>", description: "Additional HTTP headers to include in webhook requests." },
];

const eventTypes: Param[] = [
  { name: "decision.allow", type: "event", description: "Fired when an authorization check results in allow." },
  { name: "decision.deny", type: "event", description: "Fired when an authorization check results in deny." },
  { name: "decision.escalate", type: "event", description: "Fired when an authorization check requires human escalation." },
  { name: "agent.created", type: "event", description: "Fired when a new agent identity is created." },
  { name: "agent.revoked", type: "event", description: "Fired when an agent identity is revoked." },
  { name: "anomaly.detected", type: "event", description: "Fired when the anomaly detection system flags suspicious behavior." },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function WebhooksIntegrationPage() {
  return (
    <div>
      {/* Title */}
      <h1 className="gradient-text" style={{ fontSize: "2.25rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
        Webhooks
      </h1>
      <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: 40, maxWidth: 640, lineHeight: 1.7 }}>
        Receive real-time notifications for authorization decisions, agent lifecycle events, and anomaly detection via HTTP webhooks.
      </p>

      {/* Overview */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Overview</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          The <code style={{ color: "var(--blue)" }}>WebhookManager</code> sends HTTP POST requests to your endpoints when specific events occur. Use it to alert on access denials, trigger escalation workflows, feed audit systems, or notify Slack channels. Each webhook can subscribe to specific event types and includes HMAC-SHA256 signature verification for security.
        </p>
      </section>

      {/* Setup */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Setup</h2>
        <CodeBlock tabs={setupTabs} />
      </section>

      {/* Register Webhook */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Register Webhook</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Register one or more webhooks, each subscribing to specific event types. Use <code style={{ color: "var(--blue)" }}>unregister()</code> to remove a webhook by its URL.
        </p>
        <ParamTable title="WebhookConfig" params={webhookConfigParams} />
        <CodeBlock tabs={registerTabs} />
      </section>

      {/* Available Events */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Available Events</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Subscribe to any combination of the following event types:
        </p>
        <ParamTable title="WebhookEvent types" params={eventTypes} />
      </section>

      {/* Webhook Payload Format */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Webhook Payload Format</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Every webhook payload is a JSON object with an <code style={{ color: "var(--blue)" }}>event</code> type, <code style={{ color: "var(--blue)" }}>timestamp</code>, and a <code style={{ color: "var(--blue)" }}>data</code> object containing the event details.
        </p>
        <CodeBlock tabs={payloadTabs} />
      </section>

      {/* Signature Verification */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Signature Verification</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          When a <code style={{ color: "var(--blue)" }}>secret</code> is configured, the <code style={{ color: "var(--blue)" }}>WebhookManager</code> signs each payload with HMAC-SHA256 and sends the signature in the <code style={{ color: "var(--teal)" }}>X-AgentGate-Signature</code> header. Always verify signatures in your webhook handler to ensure authenticity.
        </p>
        <CodeBlock tabs={verifyTabs} />
        <Callout type="danger" title="Security">
          Always verify webhook signatures in production. Without verification, an attacker could send forged webhook payloads to your endpoint.
        </Callout>
      </section>

      {/* Decision Callback */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Decision Callback</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          The easiest way to wire webhooks to authorization decisions. <code style={{ color: "var(--blue)" }}>createDecisionCallback()</code> returns a function compatible with the client&apos;s <code style={{ color: "var(--teal)" }}>onDecision</code> option. Every decision automatically emits the appropriate event.
        </p>
        <CodeBlock tabs={decisionCallbackTabs} />
      </section>

      {/* Manual Emit */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Manual Emit</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Use <code style={{ color: "var(--blue)" }}>emit()</code> to manually send events from your application logic, such as custom anomaly detection or agent lifecycle events.
        </p>
        <CodeBlock tabs={emitTabs} />
      </section>

      {/* Full Example */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Full Example</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          A complete setup with multiple webhook endpoints, automatic decision forwarding, and manual event emission.
        </p>
        <CodeBlock tabs={fullExampleTabs} />
      </section>
    </div>
  );
}
