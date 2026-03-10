import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type {
  AgentStatus,
  RiskLevel,
  PolicyRule,
  PolicyTarget,
  PolicyEffect,
} from "@agentgate/shared";

// ─── Agents ──────────────────────────────────────────────────────────

export const agents = pgTable(
  "agents",
  {
    id: text("id").primaryKey(), // UUIDv7
    name: text("name").notNull(),
    description: text("description").notNull(),
    ownerId: text("owner_id").notNull(),
    status: text("status").notNull().default("active").$type<AgentStatus>(),
    riskLevel: text("risk_level").notNull().default("medium").$type<RiskLevel>(),
    capabilities: jsonb("capabilities").default([]).$type<string[]>(),
    metadata: jsonb("metadata").default({}).$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  },
  (table) => [
    index("agents_owner_id_idx").on(table.ownerId),
    index("agents_status_idx").on(table.status),
  ],
);

// ─── Policies ────────────────────────────────────────────────────────

export const policies = pgTable(
  "policies",
  {
    id: text("id").primaryKey(), // UUIDv7
    name: text("name").notNull(),
    description: text("description").notNull(),
    version: integer("version").notNull().default(1),
    rules: jsonb("rules").notNull().$type<PolicyRule[]>(),
    targets: jsonb("targets").notNull().$type<PolicyTarget>(),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("policies_enabled_idx").on(table.enabled),
  ],
);

// ─── Agent Tokens ────────────────────────────────────────────────────

export const agentTokens = pgTable(
  "agent_tokens",
  {
    id: text("id").primaryKey(), // UUIDv7
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id),
    tokenHash: text("token_hash").notNull(),
    scopes: jsonb("scopes").default([]).$type<string[]>(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    revoked: boolean("revoked").notNull().default(false),
  },
  (table) => [
    index("agent_tokens_agent_id_idx").on(table.agentId),
    uniqueIndex("agent_tokens_token_hash_idx").on(table.tokenHash),
  ],
);

// ─── Audit Logs (append-only) ────────────────────────────────────────

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(), // UUIDv7
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id),
    action: text("action").notNull(),
    resource: text("resource").notNull(),
    decision: text("decision").notNull().$type<PolicyEffect>(),
    policyId: text("policy_id"),
    ruleId: text("rule_id"),
    context: jsonb("context").default({}).$type<Record<string, unknown>>(),
    durationMs: real("duration_ms").notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("audit_logs_agent_id_idx").on(table.agentId),
    index("audit_logs_timestamp_idx").on(table.timestamp),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_decision_idx").on(table.decision),
  ],
);
