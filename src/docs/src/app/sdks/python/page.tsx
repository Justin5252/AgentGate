"use client";

import { CodeBlock, type CodeTab } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { ParamTable, type Param } from "@/components/ParamTable";

/* ------------------------------------------------------------------ */
/*  Code Tabs                                                          */
/* ------------------------------------------------------------------ */

const installTabs: CodeTab[] = [
  {
    label: "pip",
    language: "bash",
    code: `pip install agentgate`,
    content: (
      <code>
        <span className="code-function">pip</span> install agentgate
      </code>
    ),
  },
  {
    label: "poetry",
    language: "bash",
    code: `poetry add agentgate`,
    content: (
      <code>
        <span className="code-function">poetry</span> add agentgate
      </code>
    ),
  },
  {
    label: "uv",
    language: "bash",
    code: `uv add agentgate`,
    content: (
      <code>
        <span className="code-function">uv</span> add agentgate
      </code>
    ),
  },
];

const initTabs: CodeTab[] = [
  {
    label: "Python",
    language: "python",
    code: `from agentgate import AgentGateClient

async with AgentGateClient(
    base_url="https://api.agentgate.dev",
    api_key=os.environ["AGENTGATE_KEY"],
) as gate:
    agent = await gate.create_agent(...)`,
    content: (
      <code>
        <span className="code-keyword">from</span> <span className="code-variable">agentgate</span> <span className="code-keyword">import</span> <span className="code-type">AgentGateClient</span>{"\n\n"}
        <span className="code-keyword">async with</span> <span className="code-type">AgentGateClient</span><span className="code-operator">(</span>{"\n"}
        {"    "}<span className="code-property">base_url</span><span className="code-operator">=</span><span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,{"\n"}
        {"    "}<span className="code-property">api_key</span><span className="code-operator">=</span><span className="code-variable">os</span><span className="code-operator">.</span><span className="code-variable">environ</span>[<span className="code-string">&quot;AGENTGATE_KEY&quot;</span>],{"\n"}
        <span className="code-operator">)</span> <span className="code-keyword">as</span> <span className="code-variable">gate</span><span className="code-operator">:</span>{"\n"}
        {"    "}<span className="code-variable">agent</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">create_agent</span><span className="code-operator">(</span>...<span className="code-operator">)</span>
      </code>
    ),
  },
];

const initFullTabs: CodeTab[] = [
  {
    label: "Python",
    language: "python",
    code: `import os
from agentgate import AgentGateClient

def on_decision(decision):
    status = "ALLOW" if decision.allowed else "DENY"
    print(f"[{status}] {decision.action} on {decision.resource}")

async with AgentGateClient(
    base_url="https://api.agentgate.dev",
    api_key=os.environ["AGENTGATE_KEY"],
    timeout=15.0,
    retries=3,
    on_decision=on_decision,
) as gate:
    # Client is ready
    pass`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">os</span>{"\n"}
        <span className="code-keyword">from</span> <span className="code-variable">agentgate</span> <span className="code-keyword">import</span> <span className="code-type">AgentGateClient</span>{"\n\n"}
        <span className="code-keyword">def</span> <span className="code-function">on_decision</span><span className="code-operator">(</span><span className="code-variable">decision</span><span className="code-operator">):</span>{"\n"}
        {"    "}<span className="code-variable">status</span> <span className="code-operator">=</span> <span className="code-string">&quot;ALLOW&quot;</span> <span className="code-keyword">if</span> <span className="code-variable">decision</span><span className="code-operator">.</span><span className="code-property">allowed</span> <span className="code-keyword">else</span> <span className="code-string">&quot;DENY&quot;</span>{"\n"}
        {"    "}<span className="code-function">print</span><span className="code-operator">(</span><span className="code-string">{"f\"[{status}] {decision.action} on {decision.resource}\""}</span><span className="code-operator">)</span>{"\n\n"}
        <span className="code-keyword">async with</span> <span className="code-type">AgentGateClient</span><span className="code-operator">(</span>{"\n"}
        {"    "}<span className="code-property">base_url</span><span className="code-operator">=</span><span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,{"\n"}
        {"    "}<span className="code-property">api_key</span><span className="code-operator">=</span><span className="code-variable">os</span><span className="code-operator">.</span><span className="code-variable">environ</span>[<span className="code-string">&quot;AGENTGATE_KEY&quot;</span>],{"\n"}
        {"    "}<span className="code-property">timeout</span><span className="code-operator">=</span><span className="code-variable">15.0</span>,{"\n"}
        {"    "}<span className="code-property">retries</span><span className="code-operator">=</span><span className="code-variable">3</span>,{"\n"}
        {"    "}<span className="code-property">on_decision</span><span className="code-operator">=</span><span className="code-variable">on_decision</span>,{"\n"}
        <span className="code-operator">)</span> <span className="code-keyword">as</span> <span className="code-variable">gate</span><span className="code-operator">:</span>{"\n"}
        {"    "}<span className="code-comment"># Client is ready</span>{"\n"}
        {"    "}<span className="code-keyword">pass</span>
      </code>
    ),
  },
];

const agentTabs: CodeTab[] = [
  {
    label: "Python",
    language: "python",
    code: `from agentgate import CreateAgentRequest

# Create an agent
agent = await gate.create_agent(CreateAgentRequest(
    name="research-bot",
    type="autonomous",
    owner_id="team-ml",
    metadata={"model": "gpt-4", "department": "research"},
))
print(agent.id)  # UUIDv7

# Get an agent
fetched = await gate.get_agent(agent.id)

# List agents with filters
agents, total = await gate.list_agents(
    status="active",
    owner_id="team-ml",
    limit=20,
    offset=0,
)

# Update an agent
updated = await gate.update_agent(agent.id, metadata={"model": "gpt-4-turbo"})

# Revoke an agent
await gate.revoke_agent(agent.id)`,
    content: (
      <code>
        <span className="code-keyword">from</span> <span className="code-variable">agentgate</span> <span className="code-keyword">import</span> <span className="code-type">CreateAgentRequest</span>{"\n\n"}
        <span className="code-comment"># Create an agent</span>{"\n"}
        <span className="code-variable">agent</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">create_agent</span><span className="code-operator">(</span><span className="code-type">CreateAgentRequest</span><span className="code-operator">(</span>{"\n"}
        {"    "}<span className="code-property">name</span><span className="code-operator">=</span><span className="code-string">&quot;research-bot&quot;</span>,{"\n"}
        {"    "}<span className="code-property">type</span><span className="code-operator">=</span><span className="code-string">&quot;autonomous&quot;</span>,{"\n"}
        {"    "}<span className="code-property">owner_id</span><span className="code-operator">=</span><span className="code-string">&quot;team-ml&quot;</span>,{"\n"}
        {"    "}<span className="code-property">metadata</span><span className="code-operator">={"{"}</span><span className="code-string">&quot;model&quot;</span><span className="code-operator">:</span> <span className="code-string">&quot;gpt-4&quot;</span>, <span className="code-string">&quot;department&quot;</span><span className="code-operator">:</span> <span className="code-string">&quot;research&quot;</span><span className="code-operator">{"}"}</span>,{"\n"}
        <span className="code-operator">))</span>{"\n"}
        <span className="code-function">print</span><span className="code-operator">(</span><span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">id</span><span className="code-operator">)</span>{"  "}<span className="code-comment"># UUIDv7</span>{"\n\n"}
        <span className="code-comment"># Get an agent</span>{"\n"}
        <span className="code-variable">fetched</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">get_agent</span><span className="code-operator">(</span><span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">id</span><span className="code-operator">)</span>{"\n\n"}
        <span className="code-comment"># List agents with filters</span>{"\n"}
        <span className="code-variable">agents</span>, <span className="code-variable">total</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">list_agents</span><span className="code-operator">(</span>{"\n"}
        {"    "}<span className="code-property">status</span><span className="code-operator">=</span><span className="code-string">&quot;active&quot;</span>,{"\n"}
        {"    "}<span className="code-property">owner_id</span><span className="code-operator">=</span><span className="code-string">&quot;team-ml&quot;</span>,{"\n"}
        {"    "}<span className="code-property">limit</span><span className="code-operator">=</span><span className="code-variable">20</span>,{"\n"}
        {"    "}<span className="code-property">offset</span><span className="code-operator">=</span><span className="code-variable">0</span>,{"\n"}
        <span className="code-operator">)</span>{"\n\n"}
        <span className="code-comment"># Update an agent</span>{"\n"}
        <span className="code-variable">updated</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">update_agent</span><span className="code-operator">(</span><span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">id</span>, <span className="code-property">metadata</span><span className="code-operator">={"{"}</span><span className="code-string">&quot;model&quot;</span><span className="code-operator">:</span> <span className="code-string">&quot;gpt-4-turbo&quot;</span><span className="code-operator">{"}"})</span>{"\n\n"}
        <span className="code-comment"># Revoke an agent</span>{"\n"}
        <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">revoke_agent</span><span className="code-operator">(</span><span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">id</span><span className="code-operator">)</span>
      </code>
    ),
  },
];

const policyTabs: CodeTab[] = [
  {
    label: "Python",
    language: "python",
    code: `from agentgate import CreatePolicyRequest

# Create a policy
policy = await gate.create_policy(CreatePolicyRequest(
    name="allow-read-documents",
    effect="allow",
    actions=["read", "list"],
    resources=["documents/*"],
    conditions={
        "agent.metadata.department": {"equals": "research"},
    },
))

# List policies
policies, total = await gate.list_policies(enabled=True, limit=50, offset=0)

# Delete a policy
await gate.delete_policy(policy.id)`,
    content: (
      <code>
        <span className="code-keyword">from</span> <span className="code-variable">agentgate</span> <span className="code-keyword">import</span> <span className="code-type">CreatePolicyRequest</span>{"\n\n"}
        <span className="code-comment"># Create a policy</span>{"\n"}
        <span className="code-variable">policy</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">create_policy</span><span className="code-operator">(</span><span className="code-type">CreatePolicyRequest</span><span className="code-operator">(</span>{"\n"}
        {"    "}<span className="code-property">name</span><span className="code-operator">=</span><span className="code-string">&quot;allow-read-documents&quot;</span>,{"\n"}
        {"    "}<span className="code-property">effect</span><span className="code-operator">=</span><span className="code-string">&quot;allow&quot;</span>,{"\n"}
        {"    "}<span className="code-property">actions</span><span className="code-operator">=</span>[<span className="code-string">&quot;read&quot;</span>, <span className="code-string">&quot;list&quot;</span>],{"\n"}
        {"    "}<span className="code-property">resources</span><span className="code-operator">=</span>[<span className="code-string">&quot;documents/*&quot;</span>],{"\n"}
        {"    "}<span className="code-property">conditions</span><span className="code-operator">={"{"}</span>{"\n"}
        {"        "}<span className="code-string">&quot;agent.metadata.department&quot;</span><span className="code-operator">:</span> <span className="code-operator">{"{"}</span><span className="code-string">&quot;equals&quot;</span><span className="code-operator">:</span> <span className="code-string">&quot;research&quot;</span><span className="code-operator">{"}"}</span>,{"\n"}
        {"    "}<span className="code-operator">{"}"},</span>{"\n"}
        <span className="code-operator">))</span>{"\n\n"}
        <span className="code-comment"># List policies</span>{"\n"}
        <span className="code-variable">policies</span>, <span className="code-variable">total</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">list_policies</span><span className="code-operator">(</span><span className="code-property">enabled</span><span className="code-operator">=</span><span className="code-keyword">True</span>, <span className="code-property">limit</span><span className="code-operator">=</span><span className="code-variable">50</span>, <span className="code-property">offset</span><span className="code-operator">=</span><span className="code-variable">0</span><span className="code-operator">)</span>{"\n\n"}
        <span className="code-comment"># Delete a policy</span>{"\n"}
        <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">delete_policy</span><span className="code-operator">(</span><span className="code-variable">policy</span><span className="code-operator">.</span><span className="code-property">id</span><span className="code-operator">)</span>
      </code>
    ),
  },
];

const authTabs: CodeTab[] = [
  {
    label: "Python",
    language: "python",
    code: `from agentgate import AuthorizationRequest

# Quick boolean check
allowed = await gate.can(agent.id, "read", "documents/report.pdf")

# Guard — raises AuthorizationDeniedError on deny
await gate.guard(agent.id, "delete", "documents/report.pdf")

# Full authorization with detailed decision
decision = await gate.authorize(AuthorizationRequest(
    agent_id=agent.id,
    action="write",
    resource="documents/draft.md",
    context={"ip": "10.0.1.42"},
))

if decision.allowed:
    print("Matched policies:", decision.matched_policies)
else:
    print("Denied reason:", decision.reason)`,
    content: (
      <code>
        <span className="code-keyword">from</span> <span className="code-variable">agentgate</span> <span className="code-keyword">import</span> <span className="code-type">AuthorizationRequest</span>{"\n\n"}
        <span className="code-comment"># Quick boolean check</span>{"\n"}
        <span className="code-variable">allowed</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">can</span><span className="code-operator">(</span><span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">id</span>, <span className="code-string">&quot;read&quot;</span>, <span className="code-string">&quot;documents/report.pdf&quot;</span><span className="code-operator">)</span>{"\n\n"}
        <span className="code-comment"># Guard -- raises AuthorizationDeniedError on deny</span>{"\n"}
        <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">guard</span><span className="code-operator">(</span><span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">id</span>, <span className="code-string">&quot;delete&quot;</span>, <span className="code-string">&quot;documents/report.pdf&quot;</span><span className="code-operator">)</span>{"\n\n"}
        <span className="code-comment"># Full authorization with detailed decision</span>{"\n"}
        <span className="code-variable">decision</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">authorize</span><span className="code-operator">(</span><span className="code-type">AuthorizationRequest</span><span className="code-operator">(</span>{"\n"}
        {"    "}<span className="code-property">agent_id</span><span className="code-operator">=</span><span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">id</span>,{"\n"}
        {"    "}<span className="code-property">action</span><span className="code-operator">=</span><span className="code-string">&quot;write&quot;</span>,{"\n"}
        {"    "}<span className="code-property">resource</span><span className="code-operator">=</span><span className="code-string">&quot;documents/draft.md&quot;</span>,{"\n"}
        {"    "}<span className="code-property">context</span><span className="code-operator">={"{"}</span><span className="code-string">&quot;ip&quot;</span><span className="code-operator">:</span> <span className="code-string">&quot;10.0.1.42&quot;</span><span className="code-operator">{"}"}</span>,{"\n"}
        <span className="code-operator">))</span>{"\n\n"}
        <span className="code-keyword">if</span> <span className="code-variable">decision</span><span className="code-operator">.</span><span className="code-property">allowed</span><span className="code-operator">:</span>{"\n"}
        {"    "}<span className="code-function">print</span><span className="code-operator">(</span><span className="code-string">&quot;Matched policies:&quot;</span>, <span className="code-variable">decision</span><span className="code-operator">.</span><span className="code-property">matched_policies</span><span className="code-operator">)</span>{"\n"}
        <span className="code-keyword">else</span><span className="code-operator">:</span>{"\n"}
        {"    "}<span className="code-function">print</span><span className="code-operator">(</span><span className="code-string">&quot;Denied reason:&quot;</span>, <span className="code-variable">decision</span><span className="code-operator">.</span><span className="code-property">reason</span><span className="code-operator">)</span>
      </code>
    ),
  },
];

const auditTabs: CodeTab[] = [
  {
    label: "Python",
    language: "python",
    code: `entries, total = await gate.query_audit(
    agent_id=agent.id,
    action="write",
    allowed=False,
    from_date="2026-03-01T00:00:00Z",
    to_date="2026-03-11T23:59:59Z",
    limit=100,
    offset=0,
)

for entry in entries:
    print(f"{entry.timestamp} | {entry.action} on {entry.resource} => {entry.allowed}")`,
    content: (
      <code>
        <span className="code-variable">entries</span>, <span className="code-variable">total</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">query_audit</span><span className="code-operator">(</span>{"\n"}
        {"    "}<span className="code-property">agent_id</span><span className="code-operator">=</span><span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">id</span>,{"\n"}
        {"    "}<span className="code-property">action</span><span className="code-operator">=</span><span className="code-string">&quot;write&quot;</span>,{"\n"}
        {"    "}<span className="code-property">allowed</span><span className="code-operator">=</span><span className="code-keyword">False</span>,{"\n"}
        {"    "}<span className="code-property">from_date</span><span className="code-operator">=</span><span className="code-string">&quot;2026-03-01T00:00:00Z&quot;</span>,{"\n"}
        {"    "}<span className="code-property">to_date</span><span className="code-operator">=</span><span className="code-string">&quot;2026-03-11T23:59:59Z&quot;</span>,{"\n"}
        {"    "}<span className="code-property">limit</span><span className="code-operator">=</span><span className="code-variable">100</span>,{"\n"}
        {"    "}<span className="code-property">offset</span><span className="code-operator">=</span><span className="code-variable">0</span>,{"\n"}
        <span className="code-operator">)</span>{"\n\n"}
        <span className="code-keyword">for</span> <span className="code-variable">entry</span> <span className="code-keyword">in</span> <span className="code-variable">entries</span><span className="code-operator">:</span>{"\n"}
        {"    "}<span className="code-function">print</span><span className="code-operator">(</span><span className="code-string">{"f\"{entry.timestamp} | {entry.action} on {entry.resource} => {entry.allowed}\""}</span><span className="code-operator">)</span>
      </code>
    ),
  },
];

const asyncTabs: CodeTab[] = [
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
        # Run multiple checks concurrently
        results = await asyncio.gather(
            gate.can("agent-1", "read", "docs/a.pdf"),
            gate.can("agent-1", "read", "docs/b.pdf"),
            gate.can("agent-2", "write", "docs/c.pdf"),
        )
        print(results)  # [True, True, False]

asyncio.run(main())`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-variable">asyncio</span>{"\n"}
        <span className="code-keyword">from</span> <span className="code-variable">agentgate</span> <span className="code-keyword">import</span> <span className="code-type">AgentGateClient</span>{"\n\n"}
        <span className="code-keyword">async def</span> <span className="code-function">main</span><span className="code-operator">():</span>{"\n"}
        {"    "}<span className="code-keyword">async with</span> <span className="code-type">AgentGateClient</span><span className="code-operator">(</span>{"\n"}
        {"        "}<span className="code-property">base_url</span><span className="code-operator">=</span><span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,{"\n"}
        {"        "}<span className="code-property">api_key</span><span className="code-operator">=</span><span className="code-variable">os</span><span className="code-operator">.</span><span className="code-variable">environ</span>[<span className="code-string">&quot;AGENTGATE_KEY&quot;</span>],{"\n"}
        {"    "}<span className="code-operator">)</span> <span className="code-keyword">as</span> <span className="code-variable">gate</span><span className="code-operator">:</span>{"\n"}
        {"        "}<span className="code-comment"># Run multiple checks concurrently</span>{"\n"}
        {"        "}<span className="code-variable">results</span> <span className="code-operator">=</span> <span className="code-keyword">await</span> <span className="code-variable">asyncio</span><span className="code-operator">.</span><span className="code-function">gather</span><span className="code-operator">(</span>{"\n"}
        {"            "}<span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">can</span><span className="code-operator">(</span><span className="code-string">&quot;agent-1&quot;</span>, <span className="code-string">&quot;read&quot;</span>, <span className="code-string">&quot;docs/a.pdf&quot;</span><span className="code-operator">)</span>,{"\n"}
        {"            "}<span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">can</span><span className="code-operator">(</span><span className="code-string">&quot;agent-1&quot;</span>, <span className="code-string">&quot;read&quot;</span>, <span className="code-string">&quot;docs/b.pdf&quot;</span><span className="code-operator">)</span>,{"\n"}
        {"            "}<span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">can</span><span className="code-operator">(</span><span className="code-string">&quot;agent-2&quot;</span>, <span className="code-string">&quot;write&quot;</span>, <span className="code-string">&quot;docs/c.pdf&quot;</span><span className="code-operator">)</span>,{"\n"}
        {"        "}<span className="code-operator">)</span>{"\n"}
        {"        "}<span className="code-function">print</span><span className="code-operator">(</span><span className="code-variable">results</span><span className="code-operator">)</span>{"  "}<span className="code-comment"># [True, True, False]</span>{"\n\n"}
        <span className="code-variable">asyncio</span><span className="code-operator">.</span><span className="code-function">run</span><span className="code-operator">(</span><span className="code-function">main</span><span className="code-operator">())</span>
      </code>
    ),
  },
];

const errorTabs: CodeTab[] = [
  {
    label: "Python",
    language: "python",
    code: `from agentgate import (
    AgentGateError,
    AuthorizationDeniedError,
    EscalationRequiredError,
)

try:
    await gate.guard("agent-123", "delete", "production/database")
except AuthorizationDeniedError as e:
    print("Denied:", e.message)
    print("Reason:", e.reason)
except EscalationRequiredError as e:
    print("Escalation needed:", e.message)
    # Route to human reviewer
except AgentGateError as e:
    print("API error:", e.message)`,
    content: (
      <code>
        <span className="code-keyword">from</span> <span className="code-variable">agentgate</span> <span className="code-keyword">import</span> <span className="code-operator">(</span>{"\n"}
        {"    "}<span className="code-type">AgentGateError</span>,{"\n"}
        {"    "}<span className="code-type">AuthorizationDeniedError</span>,{"\n"}
        {"    "}<span className="code-type">EscalationRequiredError</span>,{"\n"}
        <span className="code-operator">)</span>{"\n\n"}
        <span className="code-keyword">try</span><span className="code-operator">:</span>{"\n"}
        {"    "}<span className="code-keyword">await</span> <span className="code-variable">gate</span><span className="code-operator">.</span><span className="code-function">guard</span><span className="code-operator">(</span><span className="code-string">&quot;agent-123&quot;</span>, <span className="code-string">&quot;delete&quot;</span>, <span className="code-string">&quot;production/database&quot;</span><span className="code-operator">)</span>{"\n"}
        <span className="code-keyword">except</span> <span className="code-type">AuthorizationDeniedError</span> <span className="code-keyword">as</span> <span className="code-variable">e</span><span className="code-operator">:</span>{"\n"}
        {"    "}<span className="code-function">print</span><span className="code-operator">(</span><span className="code-string">&quot;Denied:&quot;</span>, <span className="code-variable">e</span><span className="code-operator">.</span><span className="code-property">message</span><span className="code-operator">)</span>{"\n"}
        {"    "}<span className="code-function">print</span><span className="code-operator">(</span><span className="code-string">&quot;Reason:&quot;</span>, <span className="code-variable">e</span><span className="code-operator">.</span><span className="code-property">reason</span><span className="code-operator">)</span>{"\n"}
        <span className="code-keyword">except</span> <span className="code-type">EscalationRequiredError</span> <span className="code-keyword">as</span> <span className="code-variable">e</span><span className="code-operator">:</span>{"\n"}
        {"    "}<span className="code-function">print</span><span className="code-operator">(</span><span className="code-string">&quot;Escalation needed:&quot;</span>, <span className="code-variable">e</span><span className="code-operator">.</span><span className="code-property">message</span><span className="code-operator">)</span>{"\n"}
        {"    "}<span className="code-comment"># Route to human reviewer</span>{"\n"}
        <span className="code-keyword">except</span> <span className="code-type">AgentGateError</span> <span className="code-keyword">as</span> <span className="code-variable">e</span><span className="code-operator">:</span>{"\n"}
        {"    "}<span className="code-function">print</span><span className="code-operator">(</span><span className="code-string">&quot;API error:&quot;</span>, <span className="code-variable">e</span><span className="code-operator">.</span><span className="code-property">message</span><span className="code-operator">)</span>
      </code>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Param definitions                                                  */
/* ------------------------------------------------------------------ */

const clientParams: Param[] = [
  { name: "base_url", type: "str", required: true, description: "The AgentGate API base URL." },
  { name: "api_key", type: "str", required: true, description: "Your API key for authentication." },
  { name: "timeout", type: "float", description: "Request timeout in seconds. Default: 10.0." },
  { name: "retries", type: "int", description: "Number of automatic retries on failure. Default: 2." },
  { name: "on_decision", type: "Callable", description: "Callback invoked after every authorization decision." },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function PythonSDKPage() {
  return (
    <div>
      {/* Title */}
      <h1 className="gradient-text" style={{ fontSize: "2.25rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
        Python SDK
      </h1>
      <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: 40, maxWidth: 640, lineHeight: 1.7 }}>
        The official Python client for AgentGate. Fully async, built on <code style={{ color: "var(--blue)" }}>httpx</code> and <code style={{ color: "var(--blue)" }}>pydantic</code> for type-safe, high-performance agent governance.
      </p>

      {/* Installation */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Installation</h2>
        <CodeBlock tabs={installTabs} />
        <Callout type="info" title="Requirements">
          Python 3.10+ with <code style={{ color: "var(--blue)" }}>httpx</code> and <code style={{ color: "var(--blue)" }}>pydantic</code> (installed automatically).
        </Callout>
      </section>

      {/* Initialization */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Initialization</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          The client is an async context manager. Use <code style={{ color: "var(--blue)" }}>async with</code> to ensure the underlying HTTP connection pool is properly closed.
        </p>
        <CodeBlock tabs={initTabs} />
      </section>

      {/* Client Options */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Client Options</h2>
        <ParamTable title="AgentGateClient.__init__" params={clientParams} />
        <CodeBlock tabs={initFullTabs} />
      </section>

      {/* Agent Management */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Agent Management</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Create, retrieve, list, update, and revoke agents. All return typed Pydantic models.
        </p>
        <CodeBlock tabs={agentTabs} />
      </section>

      {/* Policy Management */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Policy Management</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Define access control rules with RBAC and ABAC conditions. List methods return a tuple of <code style={{ color: "var(--blue)" }}>(items, total_count)</code>.
        </p>
        <CodeBlock tabs={policyTabs} />
      </section>

      {/* Authorization */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Authorization</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Three levels of authorization checking:
        </p>
        <ul style={{ color: "var(--text-secondary)", lineHeight: 2, paddingLeft: 20, marginBottom: 16 }}>
          <li><code style={{ color: "var(--blue)" }}>can()</code> — returns a <code style={{ color: "var(--teal)" }}>bool</code>.</li>
          <li><code style={{ color: "var(--blue)" }}>guard()</code> — raises <code style={{ color: "var(--teal)" }}>AuthorizationDeniedError</code> on deny.</li>
          <li><code style={{ color: "var(--blue)" }}>authorize()</code> — returns the full <code style={{ color: "var(--teal)" }}>AuthorizationDecision</code> model.</li>
        </ul>
        <CodeBlock tabs={authTabs} />
      </section>

      {/* Audit Queries */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Audit Queries</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Query the append-only audit trail by agent, action, outcome, and time range. Returns <code style={{ color: "var(--blue)" }}>(entries, total)</code>.
        </p>
        <CodeBlock tabs={auditTabs} />
      </section>

      {/* Async Support */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Async Support</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          All methods are natively async. Use <code style={{ color: "var(--blue)" }}>asyncio.gather</code> to run multiple authorization checks concurrently for maximum throughput.
        </p>
        <CodeBlock tabs={asyncTabs} />
        <Callout type="tip" title="Connection pooling">
          The client reuses HTTP/2 connections under the hood via <code style={{ color: "var(--blue)" }}>httpx.AsyncClient</code>. Always use the async context manager to ensure connections are released.
        </Callout>
      </section>

      {/* Error Handling */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Error Handling</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          The SDK provides a hierarchy of typed exceptions:
        </p>
        <ul style={{ color: "var(--text-secondary)", lineHeight: 2, paddingLeft: 20, marginBottom: 16 }}>
          <li><code style={{ color: "var(--blue)" }}>AgentGateError</code> — base exception for all API errors.</li>
          <li><code style={{ color: "var(--blue)" }}>AuthorizationDeniedError</code> — raised by <code style={{ color: "var(--teal)" }}>guard()</code> when access is denied.</li>
          <li><code style={{ color: "var(--blue)" }}>EscalationRequiredError</code> — raised when human review is required before proceeding.</li>
        </ul>
        <CodeBlock tabs={errorTabs} />
      </section>
    </div>
  );
}
