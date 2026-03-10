package agentgate

// ─── Agent Identity ─────────────────────────────────────────────────

type AgentStatus string

const (
	AgentStatusActive    AgentStatus = "active"
	AgentStatusSuspended AgentStatus = "suspended"
	AgentStatusRevoked   AgentStatus = "revoked"
)

type RiskLevel string

const (
	RiskLevelLow      RiskLevel = "low"
	RiskLevelMedium   RiskLevel = "medium"
	RiskLevelHigh     RiskLevel = "high"
	RiskLevelCritical RiskLevel = "critical"
)

type PolicyEffect string

const (
	PolicyEffectAllow    PolicyEffect = "allow"
	PolicyEffectDeny     PolicyEffect = "deny"
	PolicyEffectEscalate PolicyEffect = "escalate"
)

type AgentIdentity struct {
	ID           string         `json:"id"`
	Name         string         `json:"name"`
	Description  string         `json:"description"`
	OwnerID      string         `json:"ownerId"`
	Status       AgentStatus    `json:"status"`
	RiskLevel    RiskLevel      `json:"riskLevel"`
	Capabilities []string       `json:"capabilities"`
	Metadata     map[string]any `json:"metadata"`
	CreatedAt    string         `json:"createdAt"`
	UpdatedAt    string         `json:"updatedAt"`
	LastActiveAt *string        `json:"lastActiveAt"`
}

type CreateAgentRequest struct {
	Name         string         `json:"name"`
	Description  string         `json:"description"`
	OwnerID      string         `json:"ownerId"`
	Capabilities []string       `json:"capabilities,omitempty"`
	RiskLevel    RiskLevel      `json:"riskLevel,omitempty"`
	Metadata     map[string]any `json:"metadata,omitempty"`
}

type UpdateAgentRequest struct {
	Name         *string        `json:"name,omitempty"`
	Description  *string        `json:"description,omitempty"`
	Status       *AgentStatus   `json:"status,omitempty"`
	RiskLevel    *RiskLevel     `json:"riskLevel,omitempty"`
	Capabilities []string       `json:"capabilities,omitempty"`
	Metadata     map[string]any `json:"metadata,omitempty"`
}

// ─── Policies ───────────────────────────────────────────────────────

type PolicyOperator string

const (
	PolicyOperatorEquals      PolicyOperator = "equals"
	PolicyOperatorNotEquals   PolicyOperator = "not_equals"
	PolicyOperatorContains    PolicyOperator = "contains"
	PolicyOperatorNotContains PolicyOperator = "not_contains"
	PolicyOperatorIn          PolicyOperator = "in"
	PolicyOperatorNotIn       PolicyOperator = "not_in"
	PolicyOperatorGt          PolicyOperator = "gt"
	PolicyOperatorLt          PolicyOperator = "lt"
	PolicyOperatorGte         PolicyOperator = "gte"
	PolicyOperatorLte         PolicyOperator = "lte"
	PolicyOperatorMatches     PolicyOperator = "matches"
)

type PolicyCondition struct {
	Field    string         `json:"field"`
	Operator PolicyOperator `json:"operator"`
	Value    any            `json:"value"`
}

type PolicyRule struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`
	Description string            `json:"description,omitempty"`
	Effect      PolicyEffect      `json:"effect"`
	Priority    int               `json:"priority"`
	Conditions  []PolicyCondition `json:"conditions"`
}

type PolicyTarget struct {
	AgentIDs  []string `json:"agentIds,omitempty"`
	AgentTags []string `json:"agentTags,omitempty"`
	Resources []string `json:"resources,omitempty"`
	Actions   []string `json:"actions,omitempty"`
}

type Policy struct {
	ID          string       `json:"id"`
	Name        string       `json:"name"`
	Description string       `json:"description"`
	Version     int          `json:"version"`
	Rules       []PolicyRule `json:"rules"`
	Targets     PolicyTarget `json:"targets"`
	Enabled     bool         `json:"enabled"`
	CreatedAt   string       `json:"createdAt"`
	UpdatedAt   string       `json:"updatedAt"`
}

type CreatePolicyRuleInput struct {
	Name        string            `json:"name"`
	Description string            `json:"description,omitempty"`
	Effect      PolicyEffect      `json:"effect"`
	Priority    int               `json:"priority"`
	Conditions  []PolicyCondition `json:"conditions"`
}

type CreatePolicyRequest struct {
	Name        string                  `json:"name"`
	Description string                  `json:"description"`
	Rules       []CreatePolicyRuleInput `json:"rules"`
	Targets     PolicyTarget            `json:"targets"`
	Enabled     *bool                   `json:"enabled,omitempty"`
}

// ─── Authorization ──────────────────────────────────────────────────

type AuthorizationRequest struct {
	AgentID  string         `json:"agentId"`
	Action   string         `json:"action"`
	Resource string         `json:"resource"`
	Context  map[string]any `json:"context,omitempty"`
}

type AuthorizationDecision struct {
	Decision    PolicyEffect `json:"decision"`
	PolicyID    *string      `json:"policyId"`
	RuleID      *string      `json:"ruleId"`
	Reason      string       `json:"reason"`
	EvaluatedAt string       `json:"evaluatedAt"`
	DurationMs  float64      `json:"durationMs"`
}

// ─── Audit Log ──────────────────────────────────────────────────────

type AuditEntry struct {
	ID         string         `json:"id"`
	AgentID    string         `json:"agentId"`
	Action     string         `json:"action"`
	Resource   string         `json:"resource"`
	Decision   PolicyEffect   `json:"decision"`
	PolicyID   *string        `json:"policyId"`
	Context    map[string]any `json:"context"`
	Timestamp  string         `json:"timestamp"`
	DurationMs float64        `json:"durationMs"`
}

type AuditQuery struct {
	AgentID   string `json:"agentId,omitempty"`
	Action    string `json:"action,omitempty"`
	Resource  string `json:"resource,omitempty"`
	Decision  string `json:"decision,omitempty"`
	StartTime string `json:"startTime,omitempty"`
	EndTime   string `json:"endTime,omitempty"`
	Limit     int    `json:"limit,omitempty"`
	Offset    int    `json:"offset,omitempty"`
}

// ─── API Envelope ───────────────────────────────────────────────────

type ApiResponse[T any] struct {
	Data  *T        `json:"data"`
	Error *ApiError `json:"error"`
	Meta  *ApiMeta  `json:"meta"`
}

type ApiError struct {
	Code    string         `json:"code"`
	Message string         `json:"message"`
	Details map[string]any `json:"details,omitempty"`
}

type ApiMeta struct {
	Total      *int    `json:"total,omitempty"`
	Limit      *int    `json:"limit,omitempty"`
	Offset     *int    `json:"offset,omitempty"`
	RequestID  string  `json:"requestId"`
	DurationMs float64 `json:"durationMs"`
}

// ─── List Options ───────────────────────────────────────────────────

type ListAgentsOptions struct {
	Status  AgentStatus
	OwnerID string
	Limit   int
	Offset  int
}

type ListPoliciesOptions struct {
	Enabled *bool
	Limit   int
	Offset  int
}
