"""Framework integration helpers for LangChain, CrewAI, and generic agent pipelines."""

from __future__ import annotations

from typing import Any, Callable, Optional, Dict

from .client import AgentGateClient


def create_agent_middleware(client: AgentGateClient, agent_id: str) -> Callable:
    """Return an async guard function suitable for agent pipelines.

    Usage::

        guard = create_agent_middleware(client, agent_id="agent-123")
        await guard("read", "documents/financials")
    """

    async def middleware(action: str, resource: str, context: Optional[Dict[str, Any]] = None) -> None:
        await client.guard(agent_id, action, resource, context)

    return middleware


class AgentGateCallbackHandler:
    """LangChain-compatible callback handler that checks authorization before tool execution.

    Usage with LangChain::

        from agentgate import AgentGateClient, AgentGateCallbackHandler

        client = AgentGateClient(base_url="...", api_key="...")
        handler = AgentGateCallbackHandler(client, agent_id="agent-123")

        # Wire into your LangChain chain/agent callbacks
        await handler.on_tool_start("web_search", '{"q": "revenue"}')
    """

    def __init__(self, client: AgentGateClient, agent_id: str):
        self.client = client
        self.agent_id = agent_id

    async def on_tool_start(self, tool_name: str, tool_input: str, **kwargs: Any) -> None:
        """Called before a LangChain tool executes. Raises on deny/escalate."""
        await self.client.guard(
            self.agent_id,
            f"execute:{tool_name}",
            f"tool/{tool_name}",
        )


class AgentGateCrewAIGuard:
    """CrewAI-compatible guard that wraps agent task execution.

    Usage::

        guard = AgentGateCrewAIGuard(client, agent_id="agent-123")
        await guard.before_task("research_competitors")
    """

    def __init__(self, client: AgentGateClient, agent_id: str):
        self.client = client
        self.agent_id = agent_id

    async def before_task(self, task_name: str, context: Optional[Dict[str, Any]] = None) -> None:
        """Check authorization before a CrewAI task runs. Raises on deny/escalate."""
        await self.client.guard(
            self.agent_id,
            f"execute_task:{task_name}",
            f"task/{task_name}",
            context,
        )
