"""Tests for the AgentGate Python SDK client."""

import httpx
import pytest
import respx

from agentgate import (
    AgentGateClient,
    AgentGateError,
    AuthorizationDeniedError,
    AuthorizationRequest,
    CreateAgentRequest,
    EscalationRequiredError,
    RiskLevel,
)

BASE_URL = "https://api.agentgate.test"
API_KEY = "test-api-key-123"

# ─── Fixtures ────────────────────────────────────────────────────────


@pytest.fixture
def client() -> AgentGateClient:
    return AgentGateClient(base_url=BASE_URL, api_key=API_KEY)


# ─── Sample payloads ─────────────────────────────────────────────────

SAMPLE_AGENT = {
    "id": "agent-001",
    "name": "Test Agent",
    "description": "A test agent",
    "ownerId": "owner-001",
    "status": "active",
    "riskLevel": "medium",
    "capabilities": ["read", "write"],
    "metadata": {},
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-01T00:00:00Z",
    "lastActiveAt": None,
}

ALLOW_DECISION = {
    "decision": "allow",
    "policyId": "policy-001",
    "ruleId": "rule-001",
    "reason": "Allowed by default policy",
    "evaluatedAt": "2026-01-01T00:00:00Z",
    "durationMs": 1.5,
}

DENY_DECISION = {
    "decision": "deny",
    "policyId": "policy-002",
    "ruleId": "rule-002",
    "reason": "Denied by security policy",
    "evaluatedAt": "2026-01-01T00:00:00Z",
    "durationMs": 2.0,
}

ESCALATE_DECISION = {
    "decision": "escalate",
    "policyId": "policy-003",
    "ruleId": "rule-003",
    "reason": "Requires human approval",
    "evaluatedAt": "2026-01-01T00:00:00Z",
    "durationMs": 1.0,
}


# ─── Tests ───────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_async_context_manager():
    """Client can be used as an async context manager."""
    async with AgentGateClient(base_url=BASE_URL, api_key=API_KEY) as client:
        assert client is not None
        assert client.base_url == BASE_URL


@pytest.mark.asyncio
@respx.mock
async def test_create_agent(client: AgentGateClient):
    """create_agent sends POST and returns AgentIdentity."""
    respx.post(f"{BASE_URL}/api/v1/agents").mock(
        return_value=httpx.Response(200, json={"data": SAMPLE_AGENT, "error": None})
    )

    agent = await client.create_agent(
        CreateAgentRequest(
            name="Test Agent",
            description="A test agent",
            owner_id="owner-001",
            capabilities=["read", "write"],
        )
    )

    assert agent.id == "agent-001"
    assert agent.name == "Test Agent"
    assert agent.owner_id == "owner-001"
    assert agent.status.value == "active"


@pytest.mark.asyncio
@respx.mock
async def test_authorize_returns_decision(client: AgentGateClient):
    """authorize() returns an AuthorizationDecision."""
    respx.post(f"{BASE_URL}/api/v1/authorize").mock(
        return_value=httpx.Response(200, json={"data": ALLOW_DECISION, "error": None})
    )

    decision = await client.authorize(
        AuthorizationRequest(agent_id="agent-001", action="read", resource="documents/report")
    )

    assert decision.decision.value == "allow"
    assert decision.policy_id == "policy-001"
    assert decision.duration_ms == 1.5


@pytest.mark.asyncio
@respx.mock
async def test_can_returns_true_on_allow(client: AgentGateClient):
    """can() returns True when the decision is allow."""
    respx.post(f"{BASE_URL}/api/v1/authorize").mock(
        return_value=httpx.Response(200, json={"data": ALLOW_DECISION, "error": None})
    )

    result = await client.can("agent-001", "read", "documents/report")
    assert result is True


@pytest.mark.asyncio
@respx.mock
async def test_can_returns_false_on_deny(client: AgentGateClient):
    """can() returns False when the decision is deny."""
    respx.post(f"{BASE_URL}/api/v1/authorize").mock(
        return_value=httpx.Response(200, json={"data": DENY_DECISION, "error": None})
    )

    result = await client.can("agent-001", "delete", "documents/report")
    assert result is False


@pytest.mark.asyncio
@respx.mock
async def test_guard_passes_on_allow(client: AgentGateClient):
    """guard() does not raise when the decision is allow."""
    respx.post(f"{BASE_URL}/api/v1/authorize").mock(
        return_value=httpx.Response(200, json={"data": ALLOW_DECISION, "error": None})
    )

    # Should not raise
    await client.guard("agent-001", "read", "documents/report")


@pytest.mark.asyncio
@respx.mock
async def test_guard_raises_on_deny(client: AgentGateClient):
    """guard() raises AuthorizationDeniedError when the decision is deny."""
    respx.post(f"{BASE_URL}/api/v1/authorize").mock(
        return_value=httpx.Response(200, json={"data": DENY_DECISION, "error": None})
    )

    with pytest.raises(AuthorizationDeniedError) as exc_info:
        await client.guard("agent-001", "delete", "documents/secret")

    assert exc_info.value.code == "AUTHORIZATION_DENIED"
    assert "agent-001" in exc_info.value.message


@pytest.mark.asyncio
@respx.mock
async def test_guard_raises_on_escalate(client: AgentGateClient):
    """guard() raises EscalationRequiredError when the decision is escalate."""
    respx.post(f"{BASE_URL}/api/v1/authorize").mock(
        return_value=httpx.Response(200, json={"data": ESCALATE_DECISION, "error": None})
    )

    with pytest.raises(EscalationRequiredError) as exc_info:
        await client.guard("agent-001", "transfer", "funds/large")

    assert exc_info.value.code == "ESCALATION_REQUIRED"
    assert "escalation" in exc_info.value.message.lower()


@pytest.mark.asyncio
@respx.mock
async def test_api_error_handling(client: AgentGateClient):
    """API errors in the envelope are raised as AgentGateError."""
    respx.get(f"{BASE_URL}/api/v1/agents/nonexistent").mock(
        return_value=httpx.Response(
            404,
            json={
                "data": None,
                "error": {
                    "code": "AGENT_NOT_FOUND",
                    "message": "Agent nonexistent not found",
                },
            },
        )
    )

    with pytest.raises(AgentGateError) as exc_info:
        await client.get_agent("nonexistent")

    assert exc_info.value.code == "AGENT_NOT_FOUND"
    assert "not found" in exc_info.value.message.lower()


@pytest.mark.asyncio
@respx.mock
async def test_retry_on_transport_error(client: AgentGateClient):
    """Client retries on transport errors then succeeds."""
    route = respx.get(f"{BASE_URL}/api/v1/agents/agent-001")

    # First two calls raise a transport error, third succeeds
    route.side_effect = [
        httpx.ConnectError("connection refused"),
        httpx.ConnectError("connection refused"),
        httpx.Response(200, json={"data": SAMPLE_AGENT, "error": None}),
    ]

    agent = await client.get_agent("agent-001")
    assert agent.id == "agent-001"
    assert route.call_count == 3


@pytest.mark.asyncio
@respx.mock
async def test_retry_exhausted_raises(client: AgentGateClient):
    """Client raises AgentGateError when retries are exhausted."""
    route = respx.get(f"{BASE_URL}/api/v1/agents/agent-001")

    # All attempts fail (initial + 2 retries = 3 total)
    route.side_effect = [
        httpx.ConnectError("connection refused"),
        httpx.ConnectError("connection refused"),
        httpx.ConnectError("connection refused"),
    ]

    with pytest.raises(AgentGateError) as exc_info:
        await client.get_agent("agent-001")

    assert exc_info.value.code == "NETWORK_ERROR"
    assert "3 attempts" in exc_info.value.message


@pytest.mark.asyncio
@respx.mock
async def test_on_decision_callback(client: AgentGateClient):
    """on_decision callback is invoked after authorize()."""
    decisions_received: list = []

    client_with_cb = AgentGateClient(
        base_url=BASE_URL,
        api_key=API_KEY,
        on_decision=lambda d: decisions_received.append(d),
    )

    respx.post(f"{BASE_URL}/api/v1/authorize").mock(
        return_value=httpx.Response(200, json={"data": ALLOW_DECISION, "error": None})
    )

    await client_with_cb.authorize(
        AuthorizationRequest(agent_id="agent-001", action="read", resource="docs")
    )

    assert len(decisions_received) == 1
    assert decisions_received[0].decision.value == "allow"


@pytest.mark.asyncio
@respx.mock
async def test_list_agents(client: AgentGateClient):
    """list_agents returns a tuple of (agents, total)."""
    respx.get(f"{BASE_URL}/api/v1/agents").mock(
        return_value=httpx.Response(
            200,
            json={
                "data": {"agents": [SAMPLE_AGENT], "total": 1},
                "error": None,
            },
        )
    )

    agents, total = await client.list_agents()
    assert total == 1
    assert len(agents) == 1
    assert agents[0].id == "agent-001"


@pytest.mark.asyncio
@respx.mock
async def test_revoke_agent(client: AgentGateClient):
    """revoke_agent sends DELETE and returns None."""
    respx.delete(f"{BASE_URL}/api/v1/agents/agent-001").mock(
        return_value=httpx.Response(200, json={"data": None, "error": None})
    )

    result = await client.revoke_agent("agent-001")
    assert result is None
