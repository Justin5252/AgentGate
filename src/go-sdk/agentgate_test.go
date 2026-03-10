package agentgate

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
	"time"
)

// helper to create a pointer to a string
func strPtr(s string) *string { return &s }

// helper to create a pointer to an int
func intPtr(i int) *int { return &i }

// newTestClient creates a Client pointing at the given test server URL.
func newTestClient(url string) *Client {
	return NewClient(ClientOptions{
		BaseURL: url,
		APIKey:  "test-api-key",
		Timeout: 5 * time.Second,
		Retries: 2,
	})
}

// mockAgent returns a sample AgentIdentity for testing.
func mockAgent() AgentIdentity {
	return AgentIdentity{
		ID:           "agent-001",
		Name:         "test-agent",
		Description:  "A test agent",
		OwnerID:      "owner-001",
		Status:       AgentStatusActive,
		RiskLevel:    RiskLevelLow,
		Capabilities: []string{"read", "write"},
		Metadata:     map[string]any{"env": "test"},
		CreatedAt:    "2026-01-01T00:00:00Z",
		UpdatedAt:    "2026-01-01T00:00:00Z",
		LastActiveAt: strPtr("2026-01-01T00:00:00Z"),
	}
}

// mockDecision returns a sample authorization decision for testing.
func mockDecision(effect PolicyEffect, reason string) AuthorizationDecision {
	return AuthorizationDecision{
		Decision:    effect,
		PolicyID:    strPtr("policy-001"),
		RuleID:      strPtr("rule-001"),
		Reason:      reason,
		EvaluatedAt: "2026-01-01T00:00:00Z",
		DurationMs:  1.5,
	}
}

// writeJSON writes a JSON response to the ResponseWriter.
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// ─── Test 1: NewClient with options ─────────────────────────────────

func TestNewClientDefaults(t *testing.T) {
	c := NewClient(ClientOptions{
		BaseURL: "http://localhost:3000/",
		APIKey:  "my-key",
	})

	if c.baseURL != "http://localhost:3000" {
		t.Errorf("expected trailing slash to be trimmed, got %q", c.baseURL)
	}
	if c.apiKey != "my-key" {
		t.Errorf("expected apiKey %q, got %q", "my-key", c.apiKey)
	}
	if c.retries != 2 {
		t.Errorf("expected default retries 2, got %d", c.retries)
	}
	if c.httpClient == nil {
		t.Error("expected httpClient to be set")
	}
}

func TestNewClientCustomOptions(t *testing.T) {
	customHTTP := &http.Client{Timeout: 30 * time.Second}
	var called bool
	c := NewClient(ClientOptions{
		BaseURL:    "http://example.com",
		APIKey:     "key-123",
		Timeout:    20 * time.Second,
		Retries:    5,
		HTTPClient: customHTTP,
		OnDecision: func(d AuthorizationDecision) { called = true },
	})

	if c.retries != 5 {
		t.Errorf("expected retries 5, got %d", c.retries)
	}
	if c.httpClient != customHTTP {
		t.Error("expected custom HTTP client to be used")
	}
	if c.onDecision == nil {
		t.Error("expected onDecision callback to be set")
	}
	// Invoke callback to verify it was set correctly
	c.onDecision(AuthorizationDecision{})
	if !called {
		t.Error("expected onDecision to be called")
	}
}

// ─── Test 2: Authorize returns decision ─────────────────────────────

func TestAuthorize(t *testing.T) {
	decision := mockDecision(PolicyEffectAllow, "Allowed by default policy")

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Errorf("expected POST, got %s", r.Method)
		}
		if r.URL.Path != "/api/v1/authorize" {
			t.Errorf("expected /api/v1/authorize, got %s", r.URL.Path)
		}
		if r.Header.Get("Authorization") != "Bearer test-api-key" {
			t.Errorf("unexpected auth header: %s", r.Header.Get("Authorization"))
		}

		var req AuthorizationRequest
		json.NewDecoder(r.Body).Decode(&req)
		if req.AgentID != "agent-001" {
			t.Errorf("expected agentId agent-001, got %s", req.AgentID)
		}

		writeJSON(w, 200, ApiResponse[AuthorizationDecision]{
			Data: &decision,
			Meta: &ApiMeta{RequestID: "req-1", DurationMs: 1.5},
		})
	}))
	defer server.Close()

	client := newTestClient(server.URL)
	result, err := client.Authorize(context.Background(), AuthorizationRequest{
		AgentID:  "agent-001",
		Action:   "read",
		Resource: "documents",
	})

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Decision != PolicyEffectAllow {
		t.Errorf("expected allow, got %s", result.Decision)
	}
	if result.Reason != "Allowed by default policy" {
		t.Errorf("unexpected reason: %s", result.Reason)
	}
}

// ─── Test 3: Can returns true/false ─────────────────────────────────

func TestCanAllow(t *testing.T) {
	decision := mockDecision(PolicyEffectAllow, "Allowed")
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, 200, ApiResponse[AuthorizationDecision]{Data: &decision})
	}))
	defer server.Close()

	client := newTestClient(server.URL)
	allowed, err := client.Can(context.Background(), "agent-001", "read", "docs")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !allowed {
		t.Error("expected Can to return true for allow decision")
	}
}

func TestCanDeny(t *testing.T) {
	decision := mockDecision(PolicyEffectDeny, "Denied")
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, 200, ApiResponse[AuthorizationDecision]{Data: &decision})
	}))
	defer server.Close()

	client := newTestClient(server.URL)
	allowed, err := client.Can(context.Background(), "agent-001", "delete", "secrets")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if allowed {
		t.Error("expected Can to return false for deny decision")
	}
}

// ─── Test 4: Guard returns nil on allow ─────────────────────────────

func TestGuardAllow(t *testing.T) {
	decision := mockDecision(PolicyEffectAllow, "Allowed")
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, 200, ApiResponse[AuthorizationDecision]{Data: &decision})
	}))
	defer server.Close()

	client := newTestClient(server.URL)
	err := client.Guard(context.Background(), "agent-001", "read", "docs")
	if err != nil {
		t.Errorf("expected nil error for allow, got: %v", err)
	}
}

// ─── Test 5: Guard returns AuthorizationDeniedError on deny ─────────

func TestGuardDeny(t *testing.T) {
	decision := mockDecision(PolicyEffectDeny, "Access denied by policy")
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, 200, ApiResponse[AuthorizationDecision]{Data: &decision})
	}))
	defer server.Close()

	client := newTestClient(server.URL)
	err := client.Guard(context.Background(), "agent-001", "delete", "secrets")
	if err == nil {
		t.Fatal("expected error for deny decision")
	}

	var denied *AuthorizationDeniedError
	if !errors.As(err, &denied) {
		t.Fatalf("expected AuthorizationDeniedError, got %T: %v", err, err)
	}
	if denied.Code != ErrCodeAuthorizationDenied {
		t.Errorf("expected code %s, got %s", ErrCodeAuthorizationDenied, denied.Code)
	}
	if denied.Decision.Decision != PolicyEffectDeny {
		t.Errorf("expected deny decision, got %s", denied.Decision.Decision)
	}
}

// ─── Test 6: Guard returns EscalationRequiredError on escalate ──────

func TestGuardEscalate(t *testing.T) {
	decision := mockDecision(PolicyEffectEscalate, "Requires human approval")
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, 200, ApiResponse[AuthorizationDecision]{Data: &decision})
	}))
	defer server.Close()

	client := newTestClient(server.URL)
	err := client.Guard(context.Background(), "agent-001", "deploy", "production")
	if err == nil {
		t.Fatal("expected error for escalate decision")
	}

	var escalation *EscalationRequiredError
	if !errors.As(err, &escalation) {
		t.Fatalf("expected EscalationRequiredError, got %T: %v", err, err)
	}
	if escalation.Code != ErrCodeEscalationRequired {
		t.Errorf("expected code %s, got %s", ErrCodeEscalationRequired, escalation.Code)
	}
	if escalation.Decision.Decision != PolicyEffectEscalate {
		t.Errorf("expected escalate decision, got %s", escalation.Decision.Decision)
	}
}

// ─── Test 7: CreateAgent ────────────────────────────────────────────

func TestCreateAgent(t *testing.T) {
	agent := mockAgent()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Errorf("expected POST, got %s", r.Method)
		}
		if r.URL.Path != "/api/v1/agents" {
			t.Errorf("expected /api/v1/agents, got %s", r.URL.Path)
		}

		var req CreateAgentRequest
		json.NewDecoder(r.Body).Decode(&req)
		if req.Name != "test-agent" {
			t.Errorf("expected name test-agent, got %s", req.Name)
		}

		writeJSON(w, 201, ApiResponse[AgentIdentity]{
			Data: &agent,
			Meta: &ApiMeta{RequestID: "req-1", DurationMs: 2.0},
		})
	}))
	defer server.Close()

	client := newTestClient(server.URL)
	result, err := client.CreateAgent(context.Background(), CreateAgentRequest{
		Name:        "test-agent",
		Description: "A test agent",
		OwnerID:     "owner-001",
	})

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.ID != "agent-001" {
		t.Errorf("expected id agent-001, got %s", result.ID)
	}
	if result.Name != "test-agent" {
		t.Errorf("expected name test-agent, got %s", result.Name)
	}
	if result.Status != AgentStatusActive {
		t.Errorf("expected status active, got %s", result.Status)
	}
}

// ─── Test 8: ListAgents ─────────────────────────────────────────────

func TestListAgents(t *testing.T) {
	agents := []AgentIdentity{mockAgent()}
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			t.Errorf("expected GET, got %s", r.Method)
		}
		if r.URL.Path != "/api/v1/agents" {
			t.Errorf("expected /api/v1/agents, got %s", r.URL.Path)
		}

		// Verify query parameters
		if r.URL.Query().Get("status") != "active" {
			t.Errorf("expected status=active, got %s", r.URL.Query().Get("status"))
		}
		if r.URL.Query().Get("limit") != "10" {
			t.Errorf("expected limit=10, got %s", r.URL.Query().Get("limit"))
		}

		data := listAgentsData{Agents: agents, Total: 1}
		writeJSON(w, 200, ApiResponse[listAgentsData]{
			Data: &data,
			Meta: &ApiMeta{Total: intPtr(1), Limit: intPtr(10), RequestID: "req-1", DurationMs: 1.0},
		})
	}))
	defer server.Close()

	client := newTestClient(server.URL)
	result, total, err := client.ListAgents(context.Background(), &ListAgentsOptions{
		Status: AgentStatusActive,
		Limit:  10,
	})

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if total != 1 {
		t.Errorf("expected total 1, got %d", total)
	}
	if len(result) != 1 {
		t.Errorf("expected 1 agent, got %d", len(result))
	}
	if result[0].ID != "agent-001" {
		t.Errorf("expected agent-001, got %s", result[0].ID)
	}
}

// ─── Test 9: Retry on server error ──────────────────────────────────

func TestRetryOnServerError(t *testing.T) {
	var attempts atomic.Int32

	agent := mockAgent()
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		count := attempts.Add(1)
		if count == 1 {
			// First attempt: return 500
			w.WriteHeader(500)
			w.Write([]byte("Internal Server Error"))
			return
		}
		// Second attempt: return success
		writeJSON(w, 200, ApiResponse[AgentIdentity]{
			Data: &agent,
			Meta: &ApiMeta{RequestID: "req-1", DurationMs: 1.0},
		})
	}))
	defer server.Close()

	client := NewClient(ClientOptions{
		BaseURL: server.URL,
		APIKey:  "test-key",
		Timeout: 5 * time.Second,
		Retries: 2,
	})

	result, err := client.GetAgent(context.Background(), "agent-001")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.ID != "agent-001" {
		t.Errorf("expected agent-001, got %s", result.ID)
	}
	if attempts.Load() != 2 {
		t.Errorf("expected 2 attempts, got %d", attempts.Load())
	}
}

// ─── Test 10: Error handling for API errors ─────────────────────────

func TestAPIError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, 404, ApiResponse[AgentIdentity]{
			Error: &ApiError{
				Code:    ErrCodeAgentNotFound,
				Message: "Agent not found",
				Details: map[string]any{"id": "nonexistent"},
			},
		})
	}))
	defer server.Close()

	client := newTestClient(server.URL)
	_, err := client.GetAgent(context.Background(), "nonexistent")
	if err == nil {
		t.Fatal("expected error for not found agent")
	}

	var agErr *AgentGateError
	if !errors.As(err, &agErr) {
		t.Fatalf("expected AgentGateError, got %T: %v", err, err)
	}
	if agErr.Code != ErrCodeAgentNotFound {
		t.Errorf("expected code %s, got %s", ErrCodeAgentNotFound, agErr.Code)
	}
	if agErr.Message != "Agent not found" {
		t.Errorf("expected message 'Agent not found', got %q", agErr.Message)
	}
}

// ─── Test: OnDecision callback is invoked ───────────────────────────

func TestOnDecisionCallback(t *testing.T) {
	decision := mockDecision(PolicyEffectAllow, "Allowed")
	var callbackDecision *AuthorizationDecision

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, 200, ApiResponse[AuthorizationDecision]{Data: &decision})
	}))
	defer server.Close()

	client := NewClient(ClientOptions{
		BaseURL: server.URL,
		APIKey:  "test-key",
		OnDecision: func(d AuthorizationDecision) {
			callbackDecision = &d
		},
	})

	_, err := client.Authorize(context.Background(), AuthorizationRequest{
		AgentID:  "agent-001",
		Action:   "read",
		Resource: "docs",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if callbackDecision == nil {
		t.Fatal("expected onDecision callback to be invoked")
	}
	if callbackDecision.Decision != PolicyEffectAllow {
		t.Errorf("expected allow in callback, got %s", callbackDecision.Decision)
	}
}

// ─── Test: GuardFunc and CanFunc middleware helpers ──────────────────

func TestGuardFunc(t *testing.T) {
	decision := mockDecision(PolicyEffectAllow, "Allowed")
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, 200, ApiResponse[AuthorizationDecision]{Data: &decision})
	}))
	defer server.Close()

	client := newTestClient(server.URL)
	guard := client.GuardFunc("agent-001")

	err := guard(context.Background(), "read", "docs")
	if err != nil {
		t.Errorf("expected nil error, got: %v", err)
	}
}

func TestCanFunc(t *testing.T) {
	decision := mockDecision(PolicyEffectDeny, "Denied")
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, 200, ApiResponse[AuthorizationDecision]{Data: &decision})
	}))
	defer server.Close()

	client := newTestClient(server.URL)
	can := client.CanFunc("agent-001")

	allowed, err := can(context.Background(), "delete", "secrets")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if allowed {
		t.Error("expected CanFunc to return false for deny")
	}
}

// ─── Test: WithAuthorization wrapper ────────────────────────────────

func TestWithAuthorizationAllow(t *testing.T) {
	decision := mockDecision(PolicyEffectAllow, "Allowed")
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, 200, ApiResponse[AuthorizationDecision]{Data: &decision})
	}))
	defer server.Close()

	client := newTestClient(server.URL)

	wrapped := WithAuthorization(client, "agent-001", "read", "docs", func(ctx context.Context) (string, error) {
		return "success", nil
	})

	result, err := wrapped(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result != "success" {
		t.Errorf("expected 'success', got %q", result)
	}
}

func TestWithAuthorizationDeny(t *testing.T) {
	decision := mockDecision(PolicyEffectDeny, "Denied")
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, 200, ApiResponse[AuthorizationDecision]{Data: &decision})
	}))
	defer server.Close()

	client := newTestClient(server.URL)

	innerCalled := false
	wrapped := WithAuthorization(client, "agent-001", "delete", "secrets", func(ctx context.Context) (string, error) {
		innerCalled = true
		return "should not happen", nil
	})

	_, err := wrapped(context.Background())
	if err == nil {
		t.Fatal("expected error for denied authorization")
	}
	if innerCalled {
		t.Error("inner function should not be called when authorization is denied")
	}

	var denied *AuthorizationDeniedError
	if !errors.As(err, &denied) {
		t.Fatalf("expected AuthorizationDeniedError, got %T", err)
	}
}
