"""AgentGate Python SDK — AI Agent Identity & Permissions Platform."""

from .client import AgentGateClient
from .errors import AgentGateError, AuthorizationDeniedError, EscalationRequiredError
from .middleware import AgentGateCallbackHandler, AgentGateCrewAIGuard, create_agent_middleware
from .types import (
    AgentIdentity,
    AgentStatus,
    AuditEntry,
    AuditQuery,
    AuthorizationDecision,
    AuthorizationRequest,
    CreateAgentRequest,
    CreatePolicyRequest,
    CreatePolicyRuleInput,
    Policy,
    PolicyCondition,
    PolicyEffect,
    PolicyOperator,
    PolicyRule,
    PolicyTarget,
    RiskLevel,
    UpdateAgentRequest,
    UpdatePolicyRequest,
)

__version__ = "0.1.0"

__all__ = [
    # Client
    "AgentGateClient",
    # Errors
    "AgentGateError",
    "AuthorizationDeniedError",
    "EscalationRequiredError",
    # Middleware
    "create_agent_middleware",
    "AgentGateCallbackHandler",
    "AgentGateCrewAIGuard",
    # Types
    "AgentIdentity",
    "AgentStatus",
    "AuditEntry",
    "AuditQuery",
    "AuthorizationDecision",
    "AuthorizationRequest",
    "CreateAgentRequest",
    "CreatePolicyRequest",
    "CreatePolicyRuleInput",
    "Policy",
    "PolicyCondition",
    "PolicyEffect",
    "PolicyOperator",
    "PolicyRule",
    "PolicyTarget",
    "RiskLevel",
    "UpdateAgentRequest",
    "UpdatePolicyRequest",
]
