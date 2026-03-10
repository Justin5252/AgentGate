package agentgate

import "fmt"

// Error codes matching the TypeScript SDK.
const (
	ErrCodeAgentNotFound       = "AGENT_NOT_FOUND"
	ErrCodeAgentSuspended      = "AGENT_SUSPENDED"
	ErrCodeAgentRevoked        = "AGENT_REVOKED"
	ErrCodePolicyNotFound      = "POLICY_NOT_FOUND"
	ErrCodePolicyConflict      = "POLICY_CONFLICT"
	ErrCodeTokenExpired        = "TOKEN_EXPIRED"
	ErrCodeTokenInvalid        = "TOKEN_INVALID"
	ErrCodeAuthorizationDenied = "AUTHORIZATION_DENIED"
	ErrCodeEscalationRequired  = "ESCALATION_REQUIRED"
	ErrCodeValidationError     = "VALIDATION_ERROR"
	ErrCodeInternalError       = "INTERNAL_ERROR"
	ErrCodeRateLimited         = "RATE_LIMITED"
	ErrCodeTimeout             = "TIMEOUT"
	ErrCodeNetworkError        = "NETWORK_ERROR"
)

// AgentGateError is the base error type returned by the SDK.
type AgentGateError struct {
	Code    string
	Message string
	Details map[string]any
}

func (e *AgentGateError) Error() string {
	return fmt.Sprintf("AgentGate error [%s]: %s", e.Code, e.Message)
}

// AuthorizationDeniedError is returned when an agent's action is denied.
type AuthorizationDeniedError struct {
	AgentGateError
	Decision AuthorizationDecision
}

// EscalationRequiredError is returned when an action requires escalation.
type EscalationRequiredError struct {
	AgentGateError
	Decision AuthorizationDecision
}
