// ─── SDK Client ──────────────────────────────────────────────────
export { AgentGateClient } from "./client.js";
export type { AgentGateClientOptions } from "./client.js";

// ─── Errors ──────────────────────────────────────────────────────
export { AgentGateError } from "./errors.js";

// ─── Middleware ───────────────────────────────────────────────────
export {
  createAgentMiddleware,
  withAuthorization,
  createLangChainTool,
} from "./middleware.js";

// ─── Shared Types (re-export) ────────────────────────────────────
export type {
  AgentId,
  AgentIdentity,
  AgentStatus,
  AgentToken,
  ApiError,
  ApiMeta,
  ApiResponse,
  AuditEntry,
  AuditQuery,
  AuthorizationDecision,
  AuthorizationRequest,
  CreateAgentRequest,
  CreatePolicyRequest,
  ErrorCode,
  Policy,
  PolicyCondition,
  PolicyEffect,
  PolicyOperator,
  PolicyRule,
  PolicyTarget,
  RiskLevel,
  TokenRequest,
  UpdateAgentRequest,
  UpdatePolicyRequest,
} from "@agentgate/shared";

export { ErrorCodes } from "@agentgate/shared";
