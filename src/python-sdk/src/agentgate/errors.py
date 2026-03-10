"""AgentGate SDK exceptions."""

from __future__ import annotations

from typing import Optional, Dict


class AgentGateError(Exception):
    """Base exception for all AgentGate SDK errors."""

    def __init__(self, code: str, message: str, details: Optional[Dict] = None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.details = details


class AuthorizationDeniedError(AgentGateError):
    """Raised when an agent's action is denied by policy."""

    pass


class EscalationRequiredError(AgentGateError):
    """Raised when an agent's action requires human approval."""

    pass
