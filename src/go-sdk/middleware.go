package agentgate

import "context"

// GuardFunc returns a function that checks authorization before proceeding.
// The returned function calls Guard with the bound agentID.
func (c *Client) GuardFunc(agentID string) func(ctx context.Context, action, resource string) error {
	return func(ctx context.Context, action, resource string) error {
		return c.Guard(ctx, agentID, action, resource)
	}
}

// CanFunc returns a function that checks if an action is allowed.
// The returned function calls Can with the bound agentID.
func (c *Client) CanFunc(agentID string) func(ctx context.Context, action, resource string) (bool, error) {
	return func(ctx context.Context, action, resource string) (bool, error) {
		return c.Can(ctx, agentID, action, resource)
	}
}

// WithAuthorization wraps a function with an authorization check.
// If the guard check fails, the wrapped function is not called and the error is returned.
func WithAuthorization[T any](c *Client, agentID, action, resource string, fn func(ctx context.Context) (T, error)) func(ctx context.Context) (T, error) {
	return func(ctx context.Context) (T, error) {
		if err := c.Guard(ctx, agentID, action, resource); err != nil {
			var zero T
			return zero, err
		}
		return fn(ctx)
	}
}
