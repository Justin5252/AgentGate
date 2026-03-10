# AgentGate Go SDK

Go client SDK for the [AgentGate](https://github.com/agentgate/agentgate) AI Agent Identity & Permissions Platform.

## Installation

```bash
go get github.com/agentgate/agentgate-go
```

## Quick Start

```go
package main

import (
    "context"
    "fmt"
    "log"

    ag "github.com/agentgate/agentgate-go"
)

func main() {
    client := ag.NewClient(ag.ClientOptions{
        BaseURL: "http://localhost:3000",
        APIKey:  "your-api-key",
    })

    ctx := context.Background()

    // Register an agent
    agent, err := client.CreateAgent(ctx, ag.CreateAgentRequest{
        Name:        "my-ai-agent",
        Description: "Handles customer support",
        OwnerID:     "user-123",
        Capabilities: []string{"read", "write"},
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("Created agent:", agent.ID)

    // Check authorization
    decision, err := client.Authorize(ctx, ag.AuthorizationRequest{
        AgentID:  agent.ID,
        Action:   "read",
        Resource: "customer-data",
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("Decision:", decision.Decision)

    // Quick boolean check
    allowed, err := client.Can(ctx, agent.ID, "read", "customer-data")
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("Allowed:", allowed)

    // Guard (returns error if not allowed)
    err = client.Guard(ctx, agent.ID, "read", "customer-data")
    if err != nil {
        log.Fatal("Not authorized:", err)
    }
    fmt.Println("Authorized!")
}
```

## Guard Middleware

Use `GuardFunc` to create a reusable guard bound to an agent:

```go
guard := client.GuardFunc("agent-001")

// Later, in your agent logic:
if err := guard(ctx, "write", "database"); err != nil {
    // Handle denied or escalation
    log.Fatal(err)
}
// Proceed with action...
```

## WithAuthorization Wrapper

Wrap any function with an authorization check:

```go
secureFetch := ag.WithAuthorization(client, "agent-001", "read", "api-data",
    func(ctx context.Context) (string, error) {
        // This only runs if authorization passes
        return "fetched data", nil
    },
)

result, err := secureFetch(ctx)
```

## Error Handling

The SDK returns typed errors for authorization failures:

```go
err := client.Guard(ctx, agentID, "delete", "production-db")

var denied *ag.AuthorizationDeniedError
if errors.As(err, &denied) {
    fmt.Println("Denied:", denied.Decision.Reason)
}

var escalation *ag.EscalationRequiredError
if errors.As(err, &escalation) {
    fmt.Println("Needs approval:", escalation.Decision.Reason)
}
```

## Decision Callback

Monitor all authorization decisions:

```go
client := ag.NewClient(ag.ClientOptions{
    BaseURL: "http://localhost:3000",
    APIKey:  "your-api-key",
    OnDecision: func(d ag.AuthorizationDecision) {
        log.Printf("[%s] %s (policy: %v)", d.Decision, d.Reason, d.PolicyID)
    },
})
```
