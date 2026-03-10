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
  AnomalyType,
  AnomalySeverity,
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

// ─── API Keys ────────────────────────────────────────────────────────

export const apiKeys = pgTable(
  "api_keys",
  {
    id: text("id").primaryKey(), // UUIDv7
    name: text("name").notNull(),
    keyHash: text("key_hash").notNull(),
    keyPrefix: text("key_prefix").notNull(),
    scopes: jsonb("scopes").default(["*"]).$type<string[]>(),
    ownerId: text("owner_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revoked: boolean("revoked").notNull().default(false),
  },
  (table) => [
    uniqueIndex("api_keys_key_hash_idx").on(table.keyHash),
    index("api_keys_owner_id_idx").on(table.ownerId),
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

// ─── A2A Channels ──────────────────────────────────────────────────

export const a2aChannels = pgTable(
  "a2a_channels",
  {
    id: text("id").primaryKey(),
    sourceAgentId: text("source_agent_id")
      .notNull()
      .references(() => agents.id),
    targetAgentId: text("target_agent_id")
      .notNull()
      .references(() => agents.id),
    allowedActions: jsonb("allowed_actions").default(["*"]).$type<string[]>(),
    allowedDataTypes: jsonb("allowed_data_types")
      .default(["*"])
      .$type<string[]>(),
    maxRequestsPerMinute: integer("max_requests_per_minute")
      .notNull()
      .default(60),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("a2a_channels_source_agent_id_idx").on(table.sourceAgentId),
    index("a2a_channels_target_agent_id_idx").on(table.targetAgentId),
    uniqueIndex("a2a_channels_source_target_idx").on(
      table.sourceAgentId,
      table.targetAgentId,
    ),
  ],
);

// ─── A2A Communications (append-only) ──────────────────────────────

export const a2aCommunications = pgTable(
  "a2a_communications",
  {
    id: text("id").primaryKey(),
    channelId: text("channel_id").references(() => a2aChannels.id),
    sourceAgentId: text("source_agent_id")
      .notNull()
      .references(() => agents.id),
    targetAgentId: text("target_agent_id")
      .notNull()
      .references(() => agents.id),
    action: text("action").notNull(),
    dataType: text("data_type").notNull().default("unknown"),
    decision: text("decision").notNull().$type<PolicyEffect>(),
    durationMs: real("duration_ms").notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("a2a_comms_source_agent_id_idx").on(table.sourceAgentId),
    index("a2a_comms_target_agent_id_idx").on(table.targetAgentId),
    index("a2a_comms_channel_id_idx").on(table.channelId),
    index("a2a_comms_timestamp_idx").on(table.timestamp),
  ],
);

// ─── Anomalies ──────────────────────────────────────────────────────

export const anomalies = pgTable(
  "anomalies",
  {
    id: text("id").primaryKey(),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id),
    type: text("type").notNull().$type<AnomalyType>(),
    severity: text("severity").notNull().$type<AnomalySeverity>(),
    description: text("description").notNull(),
    details: jsonb("details").default({}).$type<Record<string, unknown>>(),
    detectedAt: timestamp("detected_at", { withTimezone: true }).defaultNow(),
    resolved: boolean("resolved").notNull().default(false),
  },
  (table) => [
    index("anomalies_agent_id_idx").on(table.agentId),
    index("anomalies_type_idx").on(table.type),
    index("anomalies_detected_at_idx").on(table.detectedAt),
  ],
);

// ─── Agent Behavior Profiles ────────────────────────────────────────

export const agentProfiles = pgTable("agent_profiles", {
  agentId: text("agent_id")
    .primaryKey()
    .references(() => agents.id),
  commonActions: jsonb("common_actions").default([]).$type<string[]>(),
  commonResources: jsonb("common_resources").default([]).$type<string[]>(),
  activeHours: jsonb("active_hours").default([]).$type<number[]>(),
  avgRequestsPerHour: real("avg_requests_per_hour").default(0),
  avgDenyRate: real("avg_deny_rate").default(0),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).defaultNow(),
});
