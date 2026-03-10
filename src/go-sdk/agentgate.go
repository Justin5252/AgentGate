package agentgate

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

// ClientOptions configures the AgentGate client.
type ClientOptions struct {
	BaseURL    string
	APIKey     string
	Timeout    time.Duration                // default 10s
	Retries    int                          // default 2
	HTTPClient *http.Client                 // optional custom HTTP client
	OnDecision func(AuthorizationDecision)  // optional callback on every authorization decision
}

// Client is the AgentGate SDK client.
type Client struct {
	baseURL    string
	apiKey     string
	retries    int
	httpClient *http.Client
	onDecision func(AuthorizationDecision)
}

// NewClient creates a new AgentGate client with the given options.
func NewClient(opts ClientOptions) *Client {
	baseURL := strings.TrimRight(opts.BaseURL, "/")

	timeout := opts.Timeout
	if timeout == 0 {
		timeout = 10 * time.Second
	}

	retries := opts.Retries
	if retries == 0 {
		retries = 2
	}

	httpClient := opts.HTTPClient
	if httpClient == nil {
		httpClient = &http.Client{Timeout: timeout}
	}

	return &Client{
		baseURL:    baseURL,
		apiKey:     opts.APIKey,
		retries:    retries,
		httpClient: httpClient,
		onDecision: opts.OnDecision,
	}
}

// doRequest performs an HTTP request with retries and exponential backoff.
func (c *Client) doRequest(ctx context.Context, method, path string, body any, query url.Values) ([]byte, error) {
	var bodyReader io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return nil, &AgentGateError{Code: ErrCodeInternalError, Message: fmt.Sprintf("failed to marshal request body: %v", err)}
		}
		bodyReader = bytes.NewReader(data)
	}

	reqURL := c.baseURL + path
	if query != nil && len(query) > 0 {
		reqURL += "?" + query.Encode()
	}

	var lastErr error

	for attempt := 0; attempt <= c.retries; attempt++ {
		if attempt > 0 {
			// Exponential backoff: 200ms, 400ms, 800ms, ...
			delay := time.Duration(200*(1<<(attempt-1))) * time.Millisecond
			select {
			case <-ctx.Done():
				return nil, &AgentGateError{Code: ErrCodeTimeout, Message: "request canceled"}
			case <-time.After(delay):
			}

			// Reset body reader for retry
			if body != nil {
				data, _ := json.Marshal(body)
				bodyReader = bytes.NewReader(data)
			}
		}

		req, err := http.NewRequestWithContext(ctx, method, reqURL, bodyReader)
		if err != nil {
			return nil, &AgentGateError{Code: ErrCodeInternalError, Message: fmt.Sprintf("failed to create request: %v", err)}
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+c.apiKey)

		resp, err := c.httpClient.Do(req)
		if err != nil {
			lastErr = err
			if attempt == c.retries {
				return nil, &AgentGateError{
					Code:    ErrCodeNetworkError,
					Message: fmt.Sprintf("request failed after %d attempts: %v", c.retries+1, lastErr),
				}
			}
			continue
		}

		respBody, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			lastErr = err
			if attempt == c.retries {
				return nil, &AgentGateError{
					Code:    ErrCodeNetworkError,
					Message: fmt.Sprintf("failed to read response body: %v", lastErr),
				}
			}
			continue
		}

		// Retry on 5xx server errors
		if resp.StatusCode >= 500 {
			lastErr = fmt.Errorf("server error: %d", resp.StatusCode)
			if attempt == c.retries {
				return nil, &AgentGateError{
					Code:    ErrCodeInternalError,
					Message: fmt.Sprintf("server error after %d attempts: %d", c.retries+1, resp.StatusCode),
				}
			}
			continue
		}

		return respBody, nil
	}

	return nil, &AgentGateError{
		Code:    ErrCodeNetworkError,
		Message: fmt.Sprintf("request failed: %v", lastErr),
	}
}

// unwrap parses an ApiResponse and returns the data or an error.
func unwrap[T any](data []byte) (*T, error) {
	var resp ApiResponse[T]
	if err := json.Unmarshal(data, &resp); err != nil {
		return nil, &AgentGateError{Code: ErrCodeInternalError, Message: fmt.Sprintf("failed to parse response: %v", err)}
	}

	if resp.Error != nil {
		return nil, &AgentGateError{
			Code:    resp.Error.Code,
			Message: resp.Error.Message,
			Details: resp.Error.Details,
		}
	}

	return resp.Data, nil
}

// unwrapWithMeta parses an ApiResponse and returns both data and meta.
func unwrapWithMeta[T any](data []byte) (*T, *ApiMeta, error) {
	var resp ApiResponse[T]
	if err := json.Unmarshal(data, &resp); err != nil {
		return nil, nil, &AgentGateError{Code: ErrCodeInternalError, Message: fmt.Sprintf("failed to parse response: %v", err)}
	}

	if resp.Error != nil {
		return nil, nil, &AgentGateError{
			Code:    resp.Error.Code,
			Message: resp.Error.Message,
			Details: resp.Error.Details,
		}
	}

	return resp.Data, resp.Meta, nil
}

// ─── Agents ─────────────────────────────────────────────────────────

// CreateAgent registers a new agent identity.
func (c *Client) CreateAgent(ctx context.Context, req CreateAgentRequest) (*AgentIdentity, error) {
	respBody, err := c.doRequest(ctx, http.MethodPost, "/api/v1/agents", req, nil)
	if err != nil {
		return nil, err
	}
	return unwrap[AgentIdentity](respBody)
}

// GetAgent retrieves an agent by ID.
func (c *Client) GetAgent(ctx context.Context, id string) (*AgentIdentity, error) {
	respBody, err := c.doRequest(ctx, http.MethodGet, "/api/v1/agents/"+id, nil, nil)
	if err != nil {
		return nil, err
	}
	return unwrap[AgentIdentity](respBody)
}

// listAgentsData is the shape of the list agents response data.
type listAgentsData struct {
	Agents []AgentIdentity `json:"agents"`
	Total  int             `json:"total"`
}

// ListAgents returns a list of agents with optional filters.
func (c *Client) ListAgents(ctx context.Context, opts *ListAgentsOptions) ([]AgentIdentity, int, error) {
	query := url.Values{}
	if opts != nil {
		if opts.Status != "" {
			query.Set("status", string(opts.Status))
		}
		if opts.OwnerID != "" {
			query.Set("ownerId", opts.OwnerID)
		}
		if opts.Limit > 0 {
			query.Set("limit", strconv.Itoa(opts.Limit))
		}
		if opts.Offset > 0 {
			query.Set("offset", strconv.Itoa(opts.Offset))
		}
	}

	respBody, err := c.doRequest(ctx, http.MethodGet, "/api/v1/agents", nil, query)
	if err != nil {
		return nil, 0, err
	}

	data, _, err := unwrapWithMeta[listAgentsData](respBody)
	if err != nil {
		return nil, 0, err
	}

	return data.Agents, data.Total, nil
}

// UpdateAgent updates an existing agent.
func (c *Client) UpdateAgent(ctx context.Context, id string, req UpdateAgentRequest) (*AgentIdentity, error) {
	respBody, err := c.doRequest(ctx, http.MethodPatch, "/api/v1/agents/"+id, req, nil)
	if err != nil {
		return nil, err
	}
	return unwrap[AgentIdentity](respBody)
}

// RevokeAgent revokes an agent by ID.
func (c *Client) RevokeAgent(ctx context.Context, id string) error {
	respBody, err := c.doRequest(ctx, http.MethodDelete, "/api/v1/agents/"+id, nil, nil)
	if err != nil {
		return err
	}

	// Check for API-level errors in the response body
	var resp ApiResponse[any]
	if err := json.Unmarshal(respBody, &resp); err != nil {
		return nil // If we can't parse, assume success (server returned non-JSON on success)
	}
	if resp.Error != nil {
		return &AgentGateError{
			Code:    resp.Error.Code,
			Message: resp.Error.Message,
			Details: resp.Error.Details,
		}
	}

	return nil
}

// ─── Authorization ──────────────────────────────────────────────────

// Authorize evaluates an authorization request and returns the decision.
func (c *Client) Authorize(ctx context.Context, req AuthorizationRequest) (*AuthorizationDecision, error) {
	respBody, err := c.doRequest(ctx, http.MethodPost, "/api/v1/authorize", req, nil)
	if err != nil {
		return nil, err
	}

	decision, err := unwrap[AuthorizationDecision](respBody)
	if err != nil {
		return nil, err
	}

	if c.onDecision != nil && decision != nil {
		c.onDecision(*decision)
	}

	return decision, nil
}

// Can checks whether an agent is allowed to perform an action on a resource.
// Returns true if the decision is "allow".
func (c *Client) Can(ctx context.Context, agentID, action, resource string) (bool, error) {
	decision, err := c.Authorize(ctx, AuthorizationRequest{
		AgentID:  agentID,
		Action:   action,
		Resource: resource,
	})
	if err != nil {
		return false, err
	}
	return decision.Decision == PolicyEffectAllow, nil
}

// Guard checks authorization and returns nil if allowed.
// Returns *AuthorizationDeniedError if denied, *EscalationRequiredError if escalation is needed.
func (c *Client) Guard(ctx context.Context, agentID, action, resource string) error {
	decision, err := c.Authorize(ctx, AuthorizationRequest{
		AgentID:  agentID,
		Action:   action,
		Resource: resource,
	})
	if err != nil {
		return err
	}

	switch decision.Decision {
	case PolicyEffectAllow:
		return nil
	case PolicyEffectEscalate:
		return &EscalationRequiredError{
			AgentGateError: AgentGateError{
				Code:    ErrCodeEscalationRequired,
				Message: fmt.Sprintf("Agent %s requires escalation for %s on %s: %s", agentID, action, resource, decision.Reason),
			},
			Decision: *decision,
		}
	default:
		return &AuthorizationDeniedError{
			AgentGateError: AgentGateError{
				Code:    ErrCodeAuthorizationDenied,
				Message: fmt.Sprintf("Agent %s is not authorized to %s on %s: %s", agentID, action, resource, decision.Reason),
			},
			Decision: *decision,
		}
	}
}

// ─── Policies ───────────────────────────────────────────────────────

// CreatePolicy creates a new policy.
func (c *Client) CreatePolicy(ctx context.Context, req CreatePolicyRequest) (*Policy, error) {
	respBody, err := c.doRequest(ctx, http.MethodPost, "/api/v1/policies", req, nil)
	if err != nil {
		return nil, err
	}
	return unwrap[Policy](respBody)
}

// listPoliciesData is the shape of the list policies response data.
type listPoliciesData struct {
	Policies []Policy `json:"policies"`
	Total    int      `json:"total"`
}

// ListPolicies returns a list of policies with optional filters.
func (c *Client) ListPolicies(ctx context.Context, opts *ListPoliciesOptions) ([]Policy, int, error) {
	query := url.Values{}
	if opts != nil {
		if opts.Enabled != nil {
			query.Set("enabled", strconv.FormatBool(*opts.Enabled))
		}
		if opts.Limit > 0 {
			query.Set("limit", strconv.Itoa(opts.Limit))
		}
		if opts.Offset > 0 {
			query.Set("offset", strconv.Itoa(opts.Offset))
		}
	}

	respBody, err := c.doRequest(ctx, http.MethodGet, "/api/v1/policies", nil, query)
	if err != nil {
		return nil, 0, err
	}

	data, _, err := unwrapWithMeta[listPoliciesData](respBody)
	if err != nil {
		return nil, 0, err
	}

	return data.Policies, data.Total, nil
}

// DeletePolicy deletes a policy by ID.
func (c *Client) DeletePolicy(ctx context.Context, id string) error {
	respBody, err := c.doRequest(ctx, http.MethodDelete, "/api/v1/policies/"+id, nil, nil)
	if err != nil {
		return err
	}

	var resp ApiResponse[any]
	if err := json.Unmarshal(respBody, &resp); err != nil {
		return nil
	}
	if resp.Error != nil {
		return &AgentGateError{
			Code:    resp.Error.Code,
			Message: resp.Error.Message,
			Details: resp.Error.Details,
		}
	}

	return nil
}

// ─── Audit ──────────────────────────────────────────────────────────

// auditData is the shape of the audit query response data.
type auditData struct {
	Entries []AuditEntry `json:"entries"`
	Total   int          `json:"total"`
}

// QueryAudit queries the audit log with the given filters.
func (c *Client) QueryAudit(ctx context.Context, q AuditQuery) ([]AuditEntry, int, error) {
	query := url.Values{}
	if q.AgentID != "" {
		query.Set("agentId", q.AgentID)
	}
	if q.Action != "" {
		query.Set("action", q.Action)
	}
	if q.Resource != "" {
		query.Set("resource", q.Resource)
	}
	if q.Decision != "" {
		query.Set("decision", q.Decision)
	}
	if q.StartTime != "" {
		query.Set("startTime", q.StartTime)
	}
	if q.EndTime != "" {
		query.Set("endTime", q.EndTime)
	}
	if q.Limit > 0 {
		query.Set("limit", strconv.Itoa(q.Limit))
	}
	if q.Offset > 0 {
		query.Set("offset", strconv.Itoa(q.Offset))
	}

	respBody, err := c.doRequest(ctx, http.MethodGet, "/api/v1/audit", nil, query)
	if err != nil {
		return nil, 0, err
	}

	data, _, err := unwrapWithMeta[auditData](respBody)
	if err != nil {
		return nil, 0, err
	}

	return data.Entries, data.Total, nil
}
