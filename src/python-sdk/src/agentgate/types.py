"""Pydantic models mirroring the AgentGate TypeScript types."""

from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ─── Enums ────────────────────────────────────────────────────────


class AgentStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    REVOKED = "revoked"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class PolicyEffect(str, Enum):
    ALLOW = "allow"
    DENY = "deny"
    ESCALATE = "escalate"


class PolicyOperator(str, Enum):
    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"
    IN = "in"
    NOT_IN = "not_in"
    GT = "gt"
    LT = "lt"
    GTE = "gte"
    LTE = "lte"
    MATCHES = "matches"


# ─── Agent Identity ──────────────────────────────────────────────


class AgentIdentity(BaseModel):
    id: str
    name: str
    description: str
    owner_id: str = Field(alias="ownerId")
    status: AgentStatus
    risk_level: RiskLevel = Field(alias="riskLevel")
    capabilities: List[str]
    metadata: Dict[str, Any]
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")
    last_active_at: Optional[str] = Field(None, alias="lastActiveAt")

    model_config = {"populate_by_name": True}


class CreateAgentRequest(BaseModel):
    name: str
    description: str
    owner_id: str = Field(serialization_alias="ownerId")
    capabilities: List[str] = []
    risk_level: RiskLevel = Field(default=RiskLevel.MEDIUM, serialization_alias="riskLevel")
    metadata: Dict[str, Any] = {}


class UpdateAgentRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[AgentStatus] = None
    risk_level: Optional[RiskLevel] = Field(None, serialization_alias="riskLevel")
    capabilities: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


# ─── Policies ────────────────────────────────────────────────────


class PolicyCondition(BaseModel):
    field: str
    operator: PolicyOperator
    value: Any


class PolicyRule(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    effect: PolicyEffect
    priority: int
    conditions: List[PolicyCondition]


class PolicyTarget(BaseModel):
    agent_ids: Optional[List[str]] = Field(None, alias="agentIds")
    agent_tags: Optional[List[str]] = Field(None, alias="agentTags")
    resources: Optional[List[str]] = None
    actions: Optional[List[str]] = None

    model_config = {"populate_by_name": True}


class Policy(BaseModel):
    id: str
    name: str
    description: str
    version: int
    rules: List[PolicyRule]
    targets: PolicyTarget
    enabled: bool
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")

    model_config = {"populate_by_name": True}


class CreatePolicyRuleInput(BaseModel):
    """A policy rule without an id -- used when creating policies."""

    name: str
    description: Optional[str] = None
    effect: PolicyEffect
    priority: int
    conditions: List[PolicyCondition]


class CreatePolicyRequest(BaseModel):
    name: str
    description: str
    rules: List[CreatePolicyRuleInput]
    targets: PolicyTarget
    enabled: bool = True


class UpdatePolicyRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    rules: Optional[List[CreatePolicyRuleInput]] = None
    targets: Optional[PolicyTarget] = None
    enabled: Optional[bool] = None


# ─── Authorization ───────────────────────────────────────────────


class AuthorizationRequest(BaseModel):
    agent_id: str = Field(serialization_alias="agentId")
    action: str
    resource: str
    context: Optional[Dict[str, Any]] = None


class AuthorizationDecision(BaseModel):
    decision: PolicyEffect
    policy_id: Optional[str] = Field(None, alias="policyId")
    rule_id: Optional[str] = Field(None, alias="ruleId")
    reason: str
    evaluated_at: str = Field(alias="evaluatedAt")
    duration_ms: float = Field(alias="durationMs")

    model_config = {"populate_by_name": True}


# ─── Audit Log ───────────────────────────────────────────────────


class AuditEntry(BaseModel):
    id: str
    agent_id: str = Field(alias="agentId")
    action: str
    resource: str
    decision: PolicyEffect
    policy_id: Optional[str] = Field(None, alias="policyId")
    context: Dict[str, Any]
    timestamp: str
    duration_ms: float = Field(alias="durationMs")

    model_config = {"populate_by_name": True}


class AuditQuery(BaseModel):
    agent_id: Optional[str] = Field(None, serialization_alias="agentId")
    action: Optional[str] = None
    resource: Optional[str] = None
    decision: Optional[PolicyEffect] = None
    start_time: Optional[str] = Field(None, serialization_alias="startTime")
    end_time: Optional[str] = Field(None, serialization_alias="endTime")
    limit: Optional[int] = None
    offset: Optional[int] = None
