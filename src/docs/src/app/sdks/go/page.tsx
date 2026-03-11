"use client";

import { CodeBlock, type CodeTab } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { ParamTable, type Param } from "@/components/ParamTable";

/* ------------------------------------------------------------------ */
/*  Code Tabs                                                          */
/* ------------------------------------------------------------------ */

const installTabs: CodeTab[] = [
  {
    label: "Go",
    language: "bash",
    code: `go get github.com/agentgate/go-sdk`,
    content: (
      <code>
        <span className="code-function">go</span> get github.com/agentgate/go-sdk
      </code>
    ),
  },
];

const initTabs: CodeTab[] = [
  {
    label: "Go",
    language: "go",
    code: `package main

import (
	"context"
	"os"

	agentgate "github.com/agentgate/go-sdk"
)

func main() {
	client := agentgate.NewClient(
		"https://api.agentgate.dev",
		os.Getenv("AGENTGATE_KEY"),
	)

	ctx := context.Background()
	agent, err := client.CreateAgent(ctx, agentgate.CreateAgentRequest{
		Name: "research-bot",
	})
	if err != nil {
		panic(err)
	}
	fmt.Println(agent.ID)
}`,
    content: (
      <code>
        <span className="code-keyword">package</span> <span className="code-variable">main</span>{"\n\n"}
        <span className="code-keyword">import</span> <span className="code-operator">(</span>{"\n"}
        {"	"}<span className="code-string">&quot;context&quot;</span>{"\n"}
        {"	"}<span className="code-string">&quot;os&quot;</span>{"\n\n"}
        {"	"}<span className="code-variable">agentgate</span> <span className="code-string">&quot;github.com/agentgate/go-sdk&quot;</span>{"\n"}
        <span className="code-operator">)</span>{"\n\n"}
        <span className="code-keyword">func</span> <span className="code-function">main</span><span className="code-operator">()</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"	"}<span className="code-variable">client</span> <span className="code-operator">:=</span> <span className="code-variable">agentgate</span><span className="code-operator">.</span><span className="code-function">NewClient</span><span className="code-operator">(</span>{"\n"}
        {"		"}<span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,{"\n"}
        {"		"}<span className="code-variable">os</span><span className="code-operator">.</span><span className="code-function">Getenv</span><span className="code-operator">(</span><span className="code-string">&quot;AGENTGATE_KEY&quot;</span><span className="code-operator">)</span>,{"\n"}
        {"	"}<span className="code-operator">)</span>{"\n\n"}
        {"	"}<span className="code-variable">ctx</span> <span className="code-operator">:=</span> <span className="code-variable">context</span><span className="code-operator">.</span><span className="code-function">Background</span><span className="code-operator">()</span>{"\n"}
        {"	"}<span className="code-variable">agent</span>, <span className="code-variable">err</span> <span className="code-operator">:=</span> <span className="code-variable">client</span><span className="code-operator">.</span><span className="code-function">CreateAgent</span><span className="code-operator">(</span><span className="code-variable">ctx</span>, <span className="code-variable">agentgate</span><span className="code-operator">.</span><span className="code-type">CreateAgentRequest</span><span className="code-operator">{"{"}</span>{"\n"}
        {"		"}<span className="code-property">Name</span><span className="code-operator">:</span> <span className="code-string">&quot;research-bot&quot;</span>,{"\n"}
        {"	"}<span className="code-operator">{"})"}</span>{"\n"}
        {"	"}<span className="code-keyword">if</span> <span className="code-variable">err</span> <span className="code-operator">!=</span> <span className="code-keyword">nil</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"		"}<span className="code-function">panic</span><span className="code-operator">(</span><span className="code-variable">err</span><span className="code-operator">)</span>{"\n"}
        {"	"}<span className="code-operator">{"}"}</span>{"\n"}
        {"	"}<span className="code-variable">fmt</span><span className="code-operator">.</span><span className="code-function">Println</span><span className="code-operator">(</span><span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">ID</span><span className="code-operator">)</span>{"\n"}
        <span className="code-operator">{"}"}</span>
      </code>
    ),
  },
];

const optionsTabs: CodeTab[] = [
  {
    label: "Go",
    language: "go",
    code: `import "time"

client := agentgate.NewClient(
	"https://api.agentgate.dev",
	os.Getenv("AGENTGATE_KEY"),
	agentgate.WithTimeout(15 * time.Second),
	agentgate.WithRetries(3),
)`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-string">&quot;time&quot;</span>{"\n\n"}
        <span className="code-variable">client</span> <span className="code-operator">:=</span> <span className="code-variable">agentgate</span><span className="code-operator">.</span><span className="code-function">NewClient</span><span className="code-operator">(</span>{"\n"}
        {"	"}<span className="code-string">&quot;https://api.agentgate.dev&quot;</span>,{"\n"}
        {"	"}<span className="code-variable">os</span><span className="code-operator">.</span><span className="code-function">Getenv</span><span className="code-operator">(</span><span className="code-string">&quot;AGENTGATE_KEY&quot;</span><span className="code-operator">)</span>,{"\n"}
        {"	"}<span className="code-variable">agentgate</span><span className="code-operator">.</span><span className="code-function">WithTimeout</span><span className="code-operator">(</span><span className="code-variable">15</span> <span className="code-operator">*</span> <span className="code-variable">time</span><span className="code-operator">.</span><span className="code-type">Second</span><span className="code-operator">)</span>,{"\n"}
        {"	"}<span className="code-variable">agentgate</span><span className="code-operator">.</span><span className="code-function">WithRetries</span><span className="code-operator">(</span><span className="code-variable">3</span><span className="code-operator">)</span>,{"\n"}
        <span className="code-operator">)</span>
      </code>
    ),
  },
];

const agentTabs: CodeTab[] = [
  {
    label: "Go",
    language: "go",
    code: `ctx := context.Background()

// Create an agent
agent, err := client.CreateAgent(ctx, agentgate.CreateAgentRequest{
	Name:    "research-bot",
	Type:    "autonomous",
	OwnerID: "team-ml",
	Metadata: map[string]any{
		"model":      "gpt-4",
		"department": "research",
	},
})

// Get an agent
fetched, err := client.GetAgent(ctx, agent.ID)

// List agents
list, err := client.ListAgents(ctx, &agentgate.ListOptions{
	Limit:  20,
	Offset: 0,
})
fmt.Printf("Total: %d\n", list.Total)

// Revoke an agent
err = client.RevokeAgent(ctx, agent.ID)`,
    content: (
      <code>
        <span className="code-variable">ctx</span> <span className="code-operator">:=</span> <span className="code-variable">context</span><span className="code-operator">.</span><span className="code-function">Background</span><span className="code-operator">()</span>{"\n\n"}
        <span className="code-comment">// Create an agent</span>{"\n"}
        <span className="code-variable">agent</span>, <span className="code-variable">err</span> <span className="code-operator">:=</span> <span className="code-variable">client</span><span className="code-operator">.</span><span className="code-function">CreateAgent</span><span className="code-operator">(</span><span className="code-variable">ctx</span>, <span className="code-variable">agentgate</span><span className="code-operator">.</span><span className="code-type">CreateAgentRequest</span><span className="code-operator">{"{"}</span>{"\n"}
        {"	"}<span className="code-property">Name</span><span className="code-operator">:</span>{"    "}<span className="code-string">&quot;research-bot&quot;</span>,{"\n"}
        {"	"}<span className="code-property">Type</span><span className="code-operator">:</span>{"    "}<span className="code-string">&quot;autonomous&quot;</span>,{"\n"}
        {"	"}<span className="code-property">OwnerID</span><span className="code-operator">:</span> <span className="code-string">&quot;team-ml&quot;</span>,{"\n"}
        {"	"}<span className="code-property">Metadata</span><span className="code-operator">:</span> <span className="code-keyword">map</span>[<span className="code-type">string</span>]<span className="code-keyword">any</span><span className="code-operator">{"{"}</span>{"\n"}
        {"		"}<span className="code-string">&quot;model&quot;</span><span className="code-operator">:</span>{"      "}<span className="code-string">&quot;gpt-4&quot;</span>,{"\n"}
        {"		"}<span className="code-string">&quot;department&quot;</span><span className="code-operator">:</span> <span className="code-string">&quot;research&quot;</span>,{"\n"}
        {"	"}<span className="code-operator">{"}"},</span>{"\n"}
        <span className="code-operator">{"})"}</span>{"\n\n"}
        <span className="code-comment">// Get an agent</span>{"\n"}
        <span className="code-variable">fetched</span>, <span className="code-variable">err</span> <span className="code-operator">:=</span> <span className="code-variable">client</span><span className="code-operator">.</span><span className="code-function">GetAgent</span><span className="code-operator">(</span><span className="code-variable">ctx</span>, <span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">ID</span><span className="code-operator">)</span>{"\n\n"}
        <span className="code-comment">// List agents</span>{"\n"}
        <span className="code-variable">list</span>, <span className="code-variable">err</span> <span className="code-operator">:=</span> <span className="code-variable">client</span><span className="code-operator">.</span><span className="code-function">ListAgents</span><span className="code-operator">(</span><span className="code-variable">ctx</span>, <span className="code-operator">&amp;</span><span className="code-variable">agentgate</span><span className="code-operator">.</span><span className="code-type">ListOptions</span><span className="code-operator">{"{"}</span>{"\n"}
        {"	"}<span className="code-property">Limit</span><span className="code-operator">:</span>{"  "}<span className="code-variable">20</span>,{"\n"}
        {"	"}<span className="code-property">Offset</span><span className="code-operator">:</span> <span className="code-variable">0</span>,{"\n"}
        <span className="code-operator">{"})"}</span>{"\n"}
        <span className="code-variable">fmt</span><span className="code-operator">.</span><span className="code-function">Printf</span><span className="code-operator">(</span><span className="code-string">&quot;Total: %d\n&quot;</span>, <span className="code-variable">list</span><span className="code-operator">.</span><span className="code-property">Total</span><span className="code-operator">)</span>{"\n\n"}
        <span className="code-comment">// Revoke an agent</span>{"\n"}
        <span className="code-variable">err</span> <span className="code-operator">=</span> <span className="code-variable">client</span><span className="code-operator">.</span><span className="code-function">RevokeAgent</span><span className="code-operator">(</span><span className="code-variable">ctx</span>, <span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">ID</span><span className="code-operator">)</span>
      </code>
    ),
  },
];

const policyTabs: CodeTab[] = [
  {
    label: "Go",
    language: "go",
    code: `// Create a policy
policy, err := client.CreatePolicy(ctx, agentgate.CreatePolicyRequest{
	Name:      "allow-read-documents",
	Effect:    "allow",
	Actions:   []string{"read", "list"},
	Resources: []string{"documents/*"},
	Conditions: map[string]any{
		"agent.metadata.department": map[string]any{"equals": "research"},
	},
})

// List policies
list, err := client.ListPolicies(ctx, &agentgate.ListOptions{
	Limit: 50,
})

// Delete a policy
err = client.DeletePolicy(ctx, policy.ID)`,
    content: (
      <code>
        <span className="code-comment">// Create a policy</span>{"\n"}
        <span className="code-variable">policy</span>, <span className="code-variable">err</span> <span className="code-operator">:=</span> <span className="code-variable">client</span><span className="code-operator">.</span><span className="code-function">CreatePolicy</span><span className="code-operator">(</span><span className="code-variable">ctx</span>, <span className="code-variable">agentgate</span><span className="code-operator">.</span><span className="code-type">CreatePolicyRequest</span><span className="code-operator">{"{"}</span>{"\n"}
        {"	"}<span className="code-property">Name</span><span className="code-operator">:</span>{"      "}<span className="code-string">&quot;allow-read-documents&quot;</span>,{"\n"}
        {"	"}<span className="code-property">Effect</span><span className="code-operator">:</span>{"    "}<span className="code-string">&quot;allow&quot;</span>,{"\n"}
        {"	"}<span className="code-property">Actions</span><span className="code-operator">:</span>{"   "}[]<span className="code-type">string</span><span className="code-operator">{"{"}</span><span className="code-string">&quot;read&quot;</span>, <span className="code-string">&quot;list&quot;</span><span className="code-operator">{"}"}</span>,{"\n"}
        {"	"}<span className="code-property">Resources</span><span className="code-operator">:</span> []<span className="code-type">string</span><span className="code-operator">{"{"}</span><span className="code-string">&quot;documents/*&quot;</span><span className="code-operator">{"}"}</span>,{"\n"}
        {"	"}<span className="code-property">Conditions</span><span className="code-operator">:</span> <span className="code-keyword">map</span>[<span className="code-type">string</span>]<span className="code-keyword">any</span><span className="code-operator">{"{"}</span>{"\n"}
        {"		"}<span className="code-string">&quot;agent.metadata.department&quot;</span><span className="code-operator">:</span> <span className="code-keyword">map</span>[<span className="code-type">string</span>]<span className="code-keyword">any</span><span className="code-operator">{"{"}</span><span className="code-string">&quot;equals&quot;</span><span className="code-operator">:</span> <span className="code-string">&quot;research&quot;</span><span className="code-operator">{"}"}</span>,{"\n"}
        {"	"}<span className="code-operator">{"}"},</span>{"\n"}
        <span className="code-operator">{"})"}</span>{"\n\n"}
        <span className="code-comment">// List policies</span>{"\n"}
        <span className="code-variable">list</span>, <span className="code-variable">err</span> <span className="code-operator">:=</span> <span className="code-variable">client</span><span className="code-operator">.</span><span className="code-function">ListPolicies</span><span className="code-operator">(</span><span className="code-variable">ctx</span>, <span className="code-operator">&amp;</span><span className="code-variable">agentgate</span><span className="code-operator">.</span><span className="code-type">ListOptions</span><span className="code-operator">{"{"}</span>{"\n"}
        {"	"}<span className="code-property">Limit</span><span className="code-operator">:</span> <span className="code-variable">50</span>,{"\n"}
        <span className="code-operator">{"})"}</span>{"\n\n"}
        <span className="code-comment">// Delete a policy</span>{"\n"}
        <span className="code-variable">err</span> <span className="code-operator">=</span> <span className="code-variable">client</span><span className="code-operator">.</span><span className="code-function">DeletePolicy</span><span className="code-operator">(</span><span className="code-variable">ctx</span>, <span className="code-variable">policy</span><span className="code-operator">.</span><span className="code-property">ID</span><span className="code-operator">)</span>
      </code>
    ),
  },
];

const authTabs: CodeTab[] = [
  {
    label: "Go",
    language: "go",
    code: `// Quick boolean check
allowed, err := client.Can(ctx, agent.ID, "read", "documents/report.pdf")

// Guard — returns error on deny
err = client.Guard(ctx, agent.ID, "delete", "documents/report.pdf")
if err != nil {
	fmt.Println("Access denied:", err)
}

// Full authorization with detailed decision
decision, err := client.Authorize(ctx, agentgate.AuthorizationRequest{
	AgentID:  agent.ID,
	Action:   "write",
	Resource: "documents/draft.md",
	Context: map[string]any{
		"ip": "10.0.1.42",
	},
})

if decision.Allowed {
	fmt.Println("Matched policies:", decision.MatchedPolicies)
} else {
	fmt.Println("Denied reason:", decision.Reason)
}`,
    content: (
      <code>
        <span className="code-comment">// Quick boolean check</span>{"\n"}
        <span className="code-variable">allowed</span>, <span className="code-variable">err</span> <span className="code-operator">:=</span> <span className="code-variable">client</span><span className="code-operator">.</span><span className="code-function">Can</span><span className="code-operator">(</span><span className="code-variable">ctx</span>, <span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">ID</span>, <span className="code-string">&quot;read&quot;</span>, <span className="code-string">&quot;documents/report.pdf&quot;</span><span className="code-operator">)</span>{"\n\n"}
        <span className="code-comment">// Guard -- returns error on deny</span>{"\n"}
        <span className="code-variable">err</span> <span className="code-operator">=</span> <span className="code-variable">client</span><span className="code-operator">.</span><span className="code-function">Guard</span><span className="code-operator">(</span><span className="code-variable">ctx</span>, <span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">ID</span>, <span className="code-string">&quot;delete&quot;</span>, <span className="code-string">&quot;documents/report.pdf&quot;</span><span className="code-operator">)</span>{"\n"}
        <span className="code-keyword">if</span> <span className="code-variable">err</span> <span className="code-operator">!=</span> <span className="code-keyword">nil</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"	"}<span className="code-variable">fmt</span><span className="code-operator">.</span><span className="code-function">Println</span><span className="code-operator">(</span><span className="code-string">&quot;Access denied:&quot;</span>, <span className="code-variable">err</span><span className="code-operator">)</span>{"\n"}
        <span className="code-operator">{"}"}</span>{"\n\n"}
        <span className="code-comment">// Full authorization with detailed decision</span>{"\n"}
        <span className="code-variable">decision</span>, <span className="code-variable">err</span> <span className="code-operator">:=</span> <span className="code-variable">client</span><span className="code-operator">.</span><span className="code-function">Authorize</span><span className="code-operator">(</span><span className="code-variable">ctx</span>, <span className="code-variable">agentgate</span><span className="code-operator">.</span><span className="code-type">AuthorizationRequest</span><span className="code-operator">{"{"}</span>{"\n"}
        {"	"}<span className="code-property">AgentID</span><span className="code-operator">:</span>{"  "}<span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">ID</span>,{"\n"}
        {"	"}<span className="code-property">Action</span><span className="code-operator">:</span>{"   "}<span className="code-string">&quot;write&quot;</span>,{"\n"}
        {"	"}<span className="code-property">Resource</span><span className="code-operator">:</span> <span className="code-string">&quot;documents/draft.md&quot;</span>,{"\n"}
        {"	"}<span className="code-property">Context</span><span className="code-operator">:</span> <span className="code-keyword">map</span>[<span className="code-type">string</span>]<span className="code-keyword">any</span><span className="code-operator">{"{"}</span>{"\n"}
        {"		"}<span className="code-string">&quot;ip&quot;</span><span className="code-operator">:</span> <span className="code-string">&quot;10.0.1.42&quot;</span>,{"\n"}
        {"	"}<span className="code-operator">{"}"},</span>{"\n"}
        <span className="code-operator">{"})"}</span>{"\n\n"}
        <span className="code-keyword">if</span> <span className="code-variable">decision</span><span className="code-operator">.</span><span className="code-property">Allowed</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"	"}<span className="code-variable">fmt</span><span className="code-operator">.</span><span className="code-function">Println</span><span className="code-operator">(</span><span className="code-string">&quot;Matched policies:&quot;</span>, <span className="code-variable">decision</span><span className="code-operator">.</span><span className="code-property">MatchedPolicies</span><span className="code-operator">)</span>{"\n"}
        <span className="code-operator">{"}"}</span> <span className="code-keyword">else</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"	"}<span className="code-variable">fmt</span><span className="code-operator">.</span><span className="code-function">Println</span><span className="code-operator">(</span><span className="code-string">&quot;Denied reason:&quot;</span>, <span className="code-variable">decision</span><span className="code-operator">.</span><span className="code-property">Reason</span><span className="code-operator">)</span>{"\n"}
        <span className="code-operator">{"}"}</span>
      </code>
    ),
  },
];

const auditTabs: CodeTab[] = [
  {
    label: "Go",
    language: "go",
    code: `result, err := client.QueryAudit(ctx, agentgate.AuditQuery{
	AgentID: agent.ID,
	Action:  "write",
	Allowed: boolPtr(false),
	From:    "2026-03-01T00:00:00Z",
	To:      "2026-03-11T23:59:59Z",
	Limit:   100,
	Offset:  0,
})

for _, entry := range result.Entries {
	fmt.Printf("%s | %s on %s => %v\n",
		entry.Timestamp, entry.Action, entry.Resource, entry.Allowed)
}`,
    content: (
      <code>
        <span className="code-variable">result</span>, <span className="code-variable">err</span> <span className="code-operator">:=</span> <span className="code-variable">client</span><span className="code-operator">.</span><span className="code-function">QueryAudit</span><span className="code-operator">(</span><span className="code-variable">ctx</span>, <span className="code-variable">agentgate</span><span className="code-operator">.</span><span className="code-type">AuditQuery</span><span className="code-operator">{"{"}</span>{"\n"}
        {"	"}<span className="code-property">AgentID</span><span className="code-operator">:</span> <span className="code-variable">agent</span><span className="code-operator">.</span><span className="code-property">ID</span>,{"\n"}
        {"	"}<span className="code-property">Action</span><span className="code-operator">:</span>{"  "}<span className="code-string">&quot;write&quot;</span>,{"\n"}
        {"	"}<span className="code-property">Allowed</span><span className="code-operator">:</span> <span className="code-function">boolPtr</span><span className="code-operator">(</span><span className="code-keyword">false</span><span className="code-operator">)</span>,{"\n"}
        {"	"}<span className="code-property">From</span><span className="code-operator">:</span>{"    "}<span className="code-string">&quot;2026-03-01T00:00:00Z&quot;</span>,{"\n"}
        {"	"}<span className="code-property">To</span><span className="code-operator">:</span>{"      "}<span className="code-string">&quot;2026-03-11T23:59:59Z&quot;</span>,{"\n"}
        {"	"}<span className="code-property">Limit</span><span className="code-operator">:</span>{"   "}<span className="code-variable">100</span>,{"\n"}
        {"	"}<span className="code-property">Offset</span><span className="code-operator">:</span>{"  "}<span className="code-variable">0</span>,{"\n"}
        <span className="code-operator">{"})"}</span>{"\n\n"}
        <span className="code-keyword">for</span> _, <span className="code-variable">entry</span> <span className="code-operator">:=</span> <span className="code-keyword">range</span> <span className="code-variable">result</span><span className="code-operator">.</span><span className="code-property">Entries</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"	"}<span className="code-variable">fmt</span><span className="code-operator">.</span><span className="code-function">Printf</span><span className="code-operator">(</span><span className="code-string">&quot;%s | %s on %s =&gt; %v\n&quot;</span>,{"\n"}
        {"		"}<span className="code-variable">entry</span><span className="code-operator">.</span><span className="code-property">Timestamp</span>, <span className="code-variable">entry</span><span className="code-operator">.</span><span className="code-property">Action</span>, <span className="code-variable">entry</span><span className="code-operator">.</span><span className="code-property">Resource</span>, <span className="code-variable">entry</span><span className="code-operator">.</span><span className="code-property">Allowed</span><span className="code-operator">)</span>{"\n"}
        <span className="code-operator">{"}"}</span>
      </code>
    ),
  },
];

const errorTabs: CodeTab[] = [
  {
    label: "Go",
    language: "go",
    code: `import "errors"

err := client.Guard(ctx, "agent-123", "delete", "production/database")
if err != nil {
	var agErr *agentgate.Error
	if errors.As(err, &agErr) {
		fmt.Println("Code:", agErr.Code)
		fmt.Println("Message:", agErr.Message)
		fmt.Println("Details:", agErr.Details)
	}
}`,
    content: (
      <code>
        <span className="code-keyword">import</span> <span className="code-string">&quot;errors&quot;</span>{"\n\n"}
        <span className="code-variable">err</span> <span className="code-operator">:=</span> <span className="code-variable">client</span><span className="code-operator">.</span><span className="code-function">Guard</span><span className="code-operator">(</span><span className="code-variable">ctx</span>, <span className="code-string">&quot;agent-123&quot;</span>, <span className="code-string">&quot;delete&quot;</span>, <span className="code-string">&quot;production/database&quot;</span><span className="code-operator">)</span>{"\n"}
        <span className="code-keyword">if</span> <span className="code-variable">err</span> <span className="code-operator">!=</span> <span className="code-keyword">nil</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"	"}<span className="code-keyword">var</span> <span className="code-variable">agErr</span> <span className="code-operator">*</span><span className="code-variable">agentgate</span><span className="code-operator">.</span><span className="code-type">Error</span>{"\n"}
        {"	"}<span className="code-keyword">if</span> <span className="code-variable">errors</span><span className="code-operator">.</span><span className="code-function">As</span><span className="code-operator">(</span><span className="code-variable">err</span>, <span className="code-operator">&amp;</span><span className="code-variable">agErr</span><span className="code-operator">)</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"		"}<span className="code-variable">fmt</span><span className="code-operator">.</span><span className="code-function">Println</span><span className="code-operator">(</span><span className="code-string">&quot;Code:&quot;</span>, <span className="code-variable">agErr</span><span className="code-operator">.</span><span className="code-property">Code</span><span className="code-operator">)</span>{"\n"}
        {"		"}<span className="code-variable">fmt</span><span className="code-operator">.</span><span className="code-function">Println</span><span className="code-operator">(</span><span className="code-string">&quot;Message:&quot;</span>, <span className="code-variable">agErr</span><span className="code-operator">.</span><span className="code-property">Message</span><span className="code-operator">)</span>{"\n"}
        {"		"}<span className="code-variable">fmt</span><span className="code-operator">.</span><span className="code-function">Println</span><span className="code-operator">(</span><span className="code-string">&quot;Details:&quot;</span>, <span className="code-variable">agErr</span><span className="code-operator">.</span><span className="code-property">Details</span><span className="code-operator">)</span>{"\n"}
        {"	"}<span className="code-operator">{"}"}</span>{"\n"}
        <span className="code-operator">{"}"}</span>
      </code>
    ),
  },
];

const contextTabs: CodeTab[] = [
  {
    label: "Go",
    language: "go",
    code: `// With timeout
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

allowed, err := client.Can(ctx, agentID, "read", "docs/secret.pdf")
if err != nil {
	// Could be context.DeadlineExceeded
	log.Println("Authorization check timed out:", err)
}

// With cancellation
ctx, cancel = context.WithCancel(context.Background())
go func() {
	// Cancel from another goroutine
	cancel()
}()`,
    content: (
      <code>
        <span className="code-comment">// With timeout</span>{"\n"}
        <span className="code-variable">ctx</span>, <span className="code-variable">cancel</span> <span className="code-operator">:=</span> <span className="code-variable">context</span><span className="code-operator">.</span><span className="code-function">WithTimeout</span><span className="code-operator">(</span><span className="code-variable">context</span><span className="code-operator">.</span><span className="code-function">Background</span><span className="code-operator">(),</span> <span className="code-variable">5</span><span className="code-operator">*</span><span className="code-variable">time</span><span className="code-operator">.</span><span className="code-type">Second</span><span className="code-operator">)</span>{"\n"}
        <span className="code-keyword">defer</span> <span className="code-function">cancel</span><span className="code-operator">()</span>{"\n\n"}
        <span className="code-variable">allowed</span>, <span className="code-variable">err</span> <span className="code-operator">:=</span> <span className="code-variable">client</span><span className="code-operator">.</span><span className="code-function">Can</span><span className="code-operator">(</span><span className="code-variable">ctx</span>, <span className="code-variable">agentID</span>, <span className="code-string">&quot;read&quot;</span>, <span className="code-string">&quot;docs/secret.pdf&quot;</span><span className="code-operator">)</span>{"\n"}
        <span className="code-keyword">if</span> <span className="code-variable">err</span> <span className="code-operator">!=</span> <span className="code-keyword">nil</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"	"}<span className="code-comment">// Could be context.DeadlineExceeded</span>{"\n"}
        {"	"}<span className="code-variable">log</span><span className="code-operator">.</span><span className="code-function">Println</span><span className="code-operator">(</span><span className="code-string">&quot;Authorization check timed out:&quot;</span>, <span className="code-variable">err</span><span className="code-operator">)</span>{"\n"}
        <span className="code-operator">{"}"}</span>{"\n\n"}
        <span className="code-comment">// With cancellation</span>{"\n"}
        <span className="code-variable">ctx</span>, <span className="code-variable">cancel</span> <span className="code-operator">=</span> <span className="code-variable">context</span><span className="code-operator">.</span><span className="code-function">WithCancel</span><span className="code-operator">(</span><span className="code-variable">context</span><span className="code-operator">.</span><span className="code-function">Background</span><span className="code-operator">())</span>{"\n"}
        <span className="code-keyword">go</span> <span className="code-keyword">func</span><span className="code-operator">()</span> <span className="code-operator">{"{"}</span>{"\n"}
        {"	"}<span className="code-comment">// Cancel from another goroutine</span>{"\n"}
        {"	"}<span className="code-function">cancel</span><span className="code-operator">()</span>{"\n"}
        <span className="code-operator">{"}()"}</span>
      </code>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Param definitions                                                  */
/* ------------------------------------------------------------------ */

const clientParams: Param[] = [
  { name: "baseURL", type: "string", required: true, description: "The AgentGate API base URL." },
  { name: "apiKey", type: "string", required: true, description: "Your API key for authentication." },
  { name: "WithTimeout", type: "Option", description: "Functional option. Sets request timeout (default: 10s)." },
  { name: "WithRetries", type: "Option", description: "Functional option. Sets retry count (default: 2)." },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function GoSDKPage() {
  return (
    <div>
      {/* Title */}
      <h1 className="gradient-text" style={{ fontSize: "2.25rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
        Go SDK
      </h1>
      <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: 40, maxWidth: 640, lineHeight: 1.7 }}>
        The official Go client for AgentGate. Idiomatic Go with functional options, context support, and strong error typing.
      </p>

      {/* Installation */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Installation</h2>
        <CodeBlock tabs={installTabs} />
        <Callout type="info" title="Requirements">
          Go 1.21 or later.
        </Callout>
      </section>

      {/* Initialization */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Initialization</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Create a client with <code style={{ color: "var(--blue)" }}>NewClient</code>. All methods accept a <code style={{ color: "var(--blue)" }}>context.Context</code> as the first argument.
        </p>
        <CodeBlock tabs={initTabs} />
      </section>

      {/* Client Options */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Client Options</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Use functional options to customize the client. Pass any number of <code style={{ color: "var(--blue)" }}>Option</code> values after the API key.
        </p>
        <ParamTable title="NewClient parameters" params={clientParams} />
        <CodeBlock tabs={optionsTabs} />
      </section>

      {/* Agent Management */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Agent Management</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Create, get, list, and revoke agents. All structs use exported fields for JSON marshaling.
        </p>
        <CodeBlock tabs={agentTabs} />
      </section>

      {/* Policy Management */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Policy Management</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Create, list, and delete policies. Conditions are passed as <code style={{ color: "var(--blue)" }}>{"map[string]any"}</code> for flexibility.
        </p>
        <CodeBlock tabs={policyTabs} />
      </section>

      {/* Authorization */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Authorization</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Three levels of authorization:
        </p>
        <ul style={{ color: "var(--text-secondary)", lineHeight: 2, paddingLeft: 20, marginBottom: 16 }}>
          <li><code style={{ color: "var(--blue)" }}>Can()</code> — returns <code style={{ color: "var(--teal)" }}>(bool, error)</code>.</li>
          <li><code style={{ color: "var(--blue)" }}>Guard()</code> — returns <code style={{ color: "var(--teal)" }}>error</code> (non-nil on deny).</li>
          <li><code style={{ color: "var(--blue)" }}>Authorize()</code> — returns the full <code style={{ color: "var(--teal)" }}>*AuthorizationDecision</code>.</li>
        </ul>
        <CodeBlock tabs={authTabs} />
      </section>

      {/* Audit Queries */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Audit Queries</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Query the append-only audit trail. Results are returned in an <code style={{ color: "var(--blue)" }}>*AuditResult</code> containing <code style={{ color: "var(--teal)" }}>Entries</code> and <code style={{ color: "var(--teal)" }}>Total</code>.
        </p>
        <CodeBlock tabs={auditTabs} />
      </section>

      {/* Error Handling */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Error Handling</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Use <code style={{ color: "var(--blue)" }}>errors.As</code> to unwrap the structured <code style={{ color: "var(--blue)" }}>*agentgate.Error</code> type, which includes <code style={{ color: "var(--teal)" }}>Code</code>, <code style={{ color: "var(--teal)" }}>Message</code>, and optional <code style={{ color: "var(--teal)" }}>Details</code>.
        </p>
        <CodeBlock tabs={errorTabs} />
      </section>

      {/* Context Support */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Context Support</h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
          Every method accepts a <code style={{ color: "var(--blue)" }}>context.Context</code> for timeout and cancellation control. The context deadline overrides the client-level timeout.
        </p>
        <CodeBlock tabs={contextTabs} />
        <Callout type="tip" title="Best practice">
          Always pass a context with a timeout in production to prevent unbounded request durations. Use <code style={{ color: "var(--blue)" }}>context.WithTimeout</code> for per-request timeouts or <code style={{ color: "var(--blue)" }}>WithTimeout</code> option for a global default.
        </Callout>
      </section>
    </div>
  );
}
