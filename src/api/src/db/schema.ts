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
  TenantPlan,
  UserRole,
  SSOProvider,
  SSOProtocol,
  SSOEventType,
  ProvisionMethod,
} from "@agentgate/shared";

// ─── Tenants ─────────────────────────────────────────────────────────

export const tenants = pgTable("tenants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: text("plan").notNull().default("free").$type<TenantPlan>(),
  agentLimit: integer("agent_limit").notNull().default(5),
  evalLimitPerMonth: integer("eval_limit_per_month").notNull().default(10000),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── Tenant Users ────────────────────────────────────────────────────

export const tenantUsers = pgTable(
  "tenant_users",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    email: text("email").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull().default("member").$type<UserRole>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    externalId: text("external_id"),
    provisionedVia: text("provisioned_via").default("manual").$type<ProvisionMethod>(),
    deactivatedAt: timestamp("deactivated_at", { withTimezone: true }),
  },
  (table) => [
    index("tenant_users_tenant_id_idx").on(table.tenantId),
    index("tenant_users_email_idx").on(table.email),
    uniqueIndex("tenant_users_tenant_email_idx").on(
      table.tenantId,
      table.email,
    ),
    index("tenant_users_tenant_external_id_idx").on(table.tenantId, table.externalId),
  ],
);

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
    tenantId: text("tenant_id"),
  },
  (table) => [
    index("agents_owner_id_idx").on(table.ownerId),
    index("agents_status_idx").on(table.status),
    index("agents_tenant_id_idx").on(table.tenantId),
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
    tenantId: text("tenant_id"),
  },
  (table) => [
    index("policies_enabled_idx").on(table.enabled),
    index("policies_tenant_id_idx").on(table.tenantId),
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
    tenantId: text("tenant_id"),
  },
  (table) => [
    uniqueIndex("api_keys_key_hash_idx").on(table.keyHash),
    index("api_keys_owner_id_idx").on(table.ownerId),
    index("api_keys_tenant_id_idx").on(table.tenantId),
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

// ─── Subscriptions ──────────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan").notNull().default("free"),
  status: text("status").notNull().default("active"),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("subscriptions_tenant_id_idx").on(table.tenantId),
  index("subscriptions_stripe_customer_id_idx").on(table.stripeCustomerId),
]);

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

// ─── Compliance Frameworks ───────────────────────────────────────

export const complianceFrameworks = pgTable(
  "compliance_frameworks",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id"),
    frameworkId: text("framework_id").notNull(),
    name: text("name").notNull(),
    version: text("version").notNull(),
    description: text("description").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    lastEvaluatedAt: timestamp("last_evaluated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("compliance_frameworks_tenant_id_idx").on(table.tenantId),
    index("compliance_frameworks_framework_id_idx").on(table.frameworkId),
  ],
);

// ─── Compliance Controls ─────────────────────────────────────────

export const complianceControls = pgTable(
  "compliance_controls",
  {
    id: text("id").primaryKey(),
    frameworkDbId: text("framework_db_id").notNull(),
    frameworkId: text("framework_id").notNull(),
    controlCode: text("control_code").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    status: text("status").notNull().default("not_evaluated"),
    severity: text("severity").notNull().default("medium"),
    automatable: boolean("automatable").notNull().default(false),
    remediationSteps: jsonb("remediation_steps").$type<string[]>(),
    lastEvaluatedAt: timestamp("last_evaluated_at", { withTimezone: true }),
  },
  (table) => [
    index("compliance_controls_framework_db_id_idx").on(table.frameworkDbId),
    index("compliance_controls_framework_id_idx").on(table.frameworkId),
    index("compliance_controls_status_idx").on(table.status),
  ],
);

// ─── Compliance Evidence ─────────────────────────────────────────

export const complianceEvidence = pgTable(
  "compliance_evidence",
  {
    id: text("id").primaryKey(),
    controlId: text("control_id").notNull(),
    frameworkId: text("framework_id").notNull(),
    tenantId: text("tenant_id"),
    type: text("type").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    sourceSystem: text("source_system").notNull(),
    data: jsonb("data").default({}).$type<Record<string, unknown>>(),
    verified: boolean("verified").notNull().default(false),
    collectedAt: timestamp("collected_at", { withTimezone: true }).defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (table) => [
    index("compliance_evidence_control_id_idx").on(table.controlId),
    index("compliance_evidence_framework_id_idx").on(table.frameworkId),
    index("compliance_evidence_tenant_id_idx").on(table.tenantId),
  ],
);

// ─── Compliance Reports ──────────────────────────────────────────

export const complianceReports = pgTable(
  "compliance_reports",
  {
    id: text("id").primaryKey(),
    frameworkId: text("framework_id").notNull(),
    tenantId: text("tenant_id"),
    title: text("title").notNull(),
    generatedBy: text("generated_by").notNull(),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    overallScore: integer("overall_score").notNull(),
    summary: text("summary").notNull(),
    findings: jsonb("findings").default([]).$type<Record<string, unknown>[]>(),
    status: text("status").notNull().default("draft"),
    generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("compliance_reports_framework_id_idx").on(table.frameworkId),
    index("compliance_reports_tenant_id_idx").on(table.tenantId),
  ],
);

// ─── Regulatory Updates ──────────────────────────────────────────

export const regulatoryUpdates = pgTable(
  "regulatory_updates",
  {
    id: text("id").primaryKey(),
    frameworkId: text("framework_id").notNull(),
    tenantId: text("tenant_id"),
    title: text("title").notNull(),
    description: text("description").notNull(),
    effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),
    impactLevel: text("impact_level").notNull().default("medium"),
    affectedControls: jsonb("affected_controls").default([]).$type<string[]>(),
    source: text("source").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow(),
    acknowledged: boolean("acknowledged").notNull().default(false),
  },
  (table) => [
    index("regulatory_updates_framework_id_idx").on(table.frameworkId),
    index("regulatory_updates_tenant_id_idx").on(table.tenantId),
  ],
);

// ─── SSO Connections ──────────────────────────────────────────────

export const ssoConnections = pgTable(
  "sso_connections",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    provider: text("provider").notNull().$type<SSOProvider>(),
    protocol: text("protocol").notNull().$type<SSOProtocol>(),
    enabled: boolean("enabled").notNull().default(false),
    enforced: boolean("enforced").notNull().default(false),
    defaultRole: text("default_role").notNull().default("member").$type<UserRole>(),
    jitProvisioning: boolean("jit_provisioning").notNull().default(true),
    attributeMapping: jsonb("attribute_mapping").default({}).$type<Record<string, string>>(),
    // SAML fields
    samlEntityId: text("saml_entity_id"),
    samlSsoUrl: text("saml_sso_url"),
    samlCertificate: text("saml_certificate"),
    samlMetadataUrl: text("saml_metadata_url"),
    // OIDC fields
    oidcDiscoveryUrl: text("oidc_discovery_url"),
    oidcClientId: text("oidc_client_id"),
    oidcClientSecretEncrypted: text("oidc_client_secret_encrypted"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("sso_connections_tenant_id_idx").on(table.tenantId),
  ],
);

// ─── SSO Sessions ─────────────────────────────────────────────────

export const ssoSessions = pgTable(
  "sso_sessions",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    userId: text("user_id")
      .notNull()
      .references(() => tenantUsers.id),
    tokenHash: text("token_hash").notNull(),
    provider: text("provider").notNull().$type<SSOProvider>(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("sso_sessions_token_hash_idx").on(table.tokenHash),
    index("sso_sessions_tenant_id_idx").on(table.tenantId),
    index("sso_sessions_user_id_idx").on(table.userId),
    index("sso_sessions_expires_at_idx").on(table.expiresAt),
  ],
);

// ─── SCIM Tokens ──────────────────────────────────────────────────

export const scimTokens = pgTable(
  "scim_tokens",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    connectionId: text("connection_id")
      .notNull()
      .references(() => ssoConnections.id),
    tokenHash: text("token_hash").notNull(),
    tokenPrefix: text("token_prefix").notNull(),
    revoked: boolean("revoked").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("scim_tokens_token_hash_idx").on(table.tokenHash),
    index("scim_tokens_tenant_id_idx").on(table.tenantId),
    index("scim_tokens_connection_id_idx").on(table.connectionId),
  ],
);

// ─── SCIM Groups ──────────────────────────────────────────────────

export const scimGroups = pgTable(
  "scim_groups",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    connectionId: text("connection_id")
      .notNull()
      .references(() => ssoConnections.id),
    externalGroupId: text("external_group_id").notNull(),
    displayName: text("display_name").notNull(),
    mappedRole: text("mapped_role").notNull().default("member").$type<UserRole>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("scim_groups_tenant_id_idx").on(table.tenantId),
    index("scim_groups_connection_id_idx").on(table.connectionId),
    uniqueIndex("scim_groups_tenant_external_idx").on(table.tenantId, table.connectionId, table.externalGroupId),
  ],
);

// ─── SSO Audit Logs ───────────────────────────────────────────────

export const ssoAuditLogs = pgTable(
  "sso_audit_logs",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    userId: text("user_id"),
    event: text("event").notNull().$type<SSOEventType>(),
    provider: text("provider").$type<SSOProvider>(),
    details: jsonb("details").default({}).$type<Record<string, unknown>>(),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("sso_audit_logs_tenant_id_idx").on(table.tenantId),
    index("sso_audit_logs_event_idx").on(table.event),
    index("sso_audit_logs_created_at_idx").on(table.createdAt),
  ],
);
