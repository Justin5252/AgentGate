"""Async client for the AgentGate API."""

from __future__ import annotations

import asyncio
from typing import Any, Callable, Dict, List, Optional, Tuple

import httpx

from .errors import AgentGateError, AuthorizationDeniedError, EscalationRequiredError
from .types import (
    AgentIdentity,
    AgentStatus,
    AuditEntry,
    AuditQuery,
    AuthorizationDecision,
    AuthorizationRequest,
    CreateAgentRequest,
    CreatePolicyRequest,
    Policy,
    PolicyEffect,
    UpdateAgentRequest,
    UpdatePolicyRequest,
)


class AgentGateClient:
    """Async client for the AgentGate API.

    Usage::

        async with AgentGateClient(base_url="...", api_key="...") as client:
            agent = await client.create_agent(CreateAgentRequest(...))
    """

    def __init__(
        self,
        base_url: str,
        api_key: str,
        timeout: float = 10.0,
        retries: int = 2,
        on_decision: Optional[Callable[[AuthorizationDecision], None]] = None,
    ):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.retries = retries
        self.on_decision = on_decision
        self._client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=timeout,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )

    # ─── Lifecycle ───────────────────────────────────────────────────

    async def close(self) -> None:
        """Close the underlying HTTP client."""
        await self._client.aclose()

    async def __aenter__(self) -> AgentGateClient:
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.close()

    # ─── Internal HTTP ───────────────────────────────────────────────

    async def _request(
        self,
        method: str,
        path: str,
        body: Any = None,
        query: Optional[Dict[str, Any]] = None,
    ) -> Any:
        """Send a request with retry logic and unwrap the API envelope."""
        # Strip None values from query params
        params: Optional[Dict[str, str]] = None
        if query:
            params = {k: str(v) for k, v in query.items() if v is not None}

        last_error: Optional[Exception] = None

        for attempt in range(self.retries + 1):
            if attempt > 0:
                delay = 0.2 * (2 ** (attempt - 1))
                await asyncio.sleep(delay)

            try:
                response = await self._client.request(
                    method,
                    path,
                    json=body,
                    params=params,
                )
                json_data: Dict[str, Any] = response.json()
                return self._unwrap(json_data)

            except httpx.TransportError as exc:
                last_error = exc
                if attempt == self.retries:
                    raise AgentGateError(
                        "NETWORK_ERROR",
                        f"Request failed after {self.retries + 1} attempts: {exc}",
                    ) from exc

        # Unreachable, but keeps type-checkers happy.
        raise AgentGateError(
            "NETWORK_ERROR",
            f"Request failed: {last_error}",
        )

    @staticmethod
    def _unwrap(response: Dict[str, Any]) -> Any:
        """Unwrap the ``{data, error, meta}`` API envelope."""
        error = response.get("error")
        if error:
            raise AgentGateError(
                code=error.get("code", "UNKNOWN"),
                message=error.get("message", "Unknown error"),
                details=error.get("details"),
            )
        return response.get("data")

    # ─── Agents ──────────────────────────────────────────────────────

    async def create_agent(self, request: CreateAgentRequest) -> AgentIdentity:
        """Register a new agent identity."""
        data = await self._request(
            "POST",
            "/api/v1/agents",
            body=request.model_dump(by_alias=True, exclude_none=True),
        )
        return AgentIdentity.model_validate(data)

    async def get_agent(self, agent_id: str) -> AgentIdentity:
        """Fetch a single agent by ID."""
        data = await self._request("GET", f"/api/v1/agents/{agent_id}")
        return AgentIdentity.model_validate(data)

    async def list_agents(
        self,
        status: Optional[AgentStatus] = None,
        owner_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[AgentIdentity], int]:
        """List agents with optional filters. Returns ``(agents, total)``."""
        data = await self._request(
            "GET",
            "/api/v1/agents",
            query={
                "status": status.value if status else None,
                "ownerId": owner_id,
                "limit": limit,
                "offset": offset,
            },
        )
        agents = [AgentIdentity.model_validate(a) for a in data["agents"]]
        return agents, data["total"]

    async def update_agent(self, agent_id: str, **kwargs: Any) -> AgentIdentity:
        """Update an existing agent. Pass keyword arguments matching
        :class:`UpdateAgentRequest` fields (snake_case).
        """
        request = UpdateAgentRequest(**kwargs)
        data = await self._request(
            "PATCH",
            f"/api/v1/agents/{agent_id}",
            body=request.model_dump(by_alias=True, exclude_none=True),
        )
        return AgentIdentity.model_validate(data)

    async def revoke_agent(self, agent_id: str) -> None:
        """Permanently revoke an agent's credentials."""
        await self._request("DELETE", f"/api/v1/agents/{agent_id}")

    # ─── Authorization ───────────────────────────────────────────────

    async def authorize(self, request: AuthorizationRequest) -> AuthorizationDecision:
        """Evaluate an authorization request and return the decision."""
        data = await self._request(
            "POST",
            "/api/v1/authorize",
            body=request.model_dump(by_alias=True, exclude_none=True),
        )
        decision = AuthorizationDecision.model_validate(data)

        if self.on_decision:
            self.on_decision(decision)

        return decision

    async def can(
        self,
        agent_id: str,
        action: str,
        resource: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """Convenience wrapper -- returns ``True`` if the action is allowed."""
        decision = await self.authorize(
            AuthorizationRequest(agent_id=agent_id, action=action, resource=resource, context=context)
        )
        return decision.decision == PolicyEffect.ALLOW

    async def guard(
        self,
        agent_id: str,
        action: str,
        resource: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Assert that the action is allowed.

        Raises :class:`AuthorizationDeniedError` on deny and
        :class:`EscalationRequiredError` on escalate.
        """
        decision = await self.authorize(
            AuthorizationRequest(agent_id=agent_id, action=action, resource=resource, context=context)
        )
        if decision.decision == PolicyEffect.DENY:
            raise AuthorizationDeniedError(
                code="AUTHORIZATION_DENIED",
                message=f"Agent {agent_id} is not authorized to {action} on {resource}: {decision.reason}",
                details={
                    "decision": decision.decision.value,
                    "policyId": decision.policy_id,
                    "ruleId": decision.rule_id,
                    "reason": decision.reason,
                },
            )
        if decision.decision == PolicyEffect.ESCALATE:
            raise EscalationRequiredError(
                code="ESCALATION_REQUIRED",
                message=f"Agent {agent_id} action {action} on {resource} requires escalation: {decision.reason}",
                details={
                    "decision": decision.decision.value,
                    "policyId": decision.policy_id,
                    "ruleId": decision.rule_id,
                    "reason": decision.reason,
                },
            )

    # ─── Policies ────────────────────────────────────────────────────

    async def create_policy(self, request: CreatePolicyRequest) -> Policy:
        """Create a new authorization policy."""
        data = await self._request(
            "POST",
            "/api/v1/policies",
            body=request.model_dump(by_alias=True, exclude_none=True),
        )
        return Policy.model_validate(data)

    async def list_policies(
        self,
        enabled: Optional[bool] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[Policy], int]:
        """List policies. Returns ``(policies, total)``."""
        data = await self._request(
            "GET",
            "/api/v1/policies",
            query={
                "enabled": enabled,
                "limit": limit,
                "offset": offset,
            },
        )
        policies = [Policy.model_validate(p) for p in data["policies"]]
        return policies, data["total"]

    async def delete_policy(self, policy_id: str) -> None:
        """Delete a policy by ID."""
        await self._request("DELETE", f"/api/v1/policies/{policy_id}")

    # ─── Audit ───────────────────────────────────────────────────────

    async def query_audit(
        self,
        agent_id: Optional[str] = None,
        action: Optional[str] = None,
        resource: Optional[str] = None,
        decision: Optional[PolicyEffect] = None,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[AuditEntry], int]:
        """Query the audit log. Returns ``(entries, total)``."""
        query = AuditQuery(
            agent_id=agent_id,
            action=action,
            resource=resource,
            decision=decision,
            start_time=start_time,
            end_time=end_time,
            limit=limit,
            offset=offset,
        )
        data = await self._request(
            "GET",
            "/api/v1/audit",
            query=query.model_dump(by_alias=True, exclude_none=True),
        )
        entries = [AuditEntry.model_validate(e) for e in data["entries"]]
        return entries, data["total"]
