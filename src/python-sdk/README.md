# AgentGate Python SDK

Python SDK for [AgentGate](https://agentgate.dev) — the AI Agent Identity & Permissions Platform.

## Installation

```bash
pip install agentgate
```

## Quick Start

```python
import asyncio
from agentgate import AgentGateClient

async def main():
    async with AgentGateClient(base_url="https://api.agentgate.dev", api_key="ag_...") as client:
        # Check permission (returns True/False)
        allowed = await client.can("agent-001", "read", "documents/financials")

        # Guard (raises on deny or escalation)
        await client.guard("agent-001", "read", "documents/financials")

asyncio.run(main())
```

## LangChain Integration

```python
from agentgate import AgentGateClient, AgentGateCallbackHandler

client = AgentGateClient(base_url="https://api.agentgate.dev", api_key="ag_...")
handler = AgentGateCallbackHandler(client, agent_id="agent-001")

# Before any tool runs, AgentGate checks authorization
await handler.on_tool_start("web_search", '{"q": "revenue"}')
```

## CrewAI Integration

```python
from agentgate import AgentGateClient, AgentGateCrewAIGuard

client = AgentGateClient(base_url="https://api.agentgate.dev", api_key="ag_...")
guard = AgentGateCrewAIGuard(client, agent_id="agent-001")

# Check before a CrewAI task executes
await guard.before_task("research_competitors")
```

## Documentation

Full docs at [docs.agentgate.dev](https://docs.agentgate.dev)
