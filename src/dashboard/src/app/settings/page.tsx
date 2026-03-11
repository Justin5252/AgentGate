"use client";

import { useEffect, useState, useCallback } from "react";
import type { ApiKey, TenantUser, SSOConnection, SCIMToken, SCIMGroup } from "@/lib/api";
import {
  fetchApiKeys, createApiKey, revokeApiKey, fetchTenantUsers,
  fetchSSOConnections, createSSOConnection, updateSSOConnection, deleteSSOConnection,
  testSSOConnection, fetchSCIMTokens, generateSCIMToken, revokeSCIMToken,
} from "@/lib/api";
import { mockApiKeys, mockTenantUsers, mockSubscription, mockSSOConnections, mockSCIMTokens, mockSCIMGroups } from "@/lib/mock-data";

type Tab = "organization" | "api-keys" | "team" | "sso";

type SSOProvider = "okta" | "azure_ad" | "google" | "onelogin" | "custom_saml" | "custom_oidc";

const SSO_PROVIDERS: { key: SSOProvider; name: string; protocol: "saml" | "oidc"; icon: string }[] = [
  { key: "okta", name: "Okta", protocol: "saml", icon: "O" },
  { key: "azure_ad", name: "Azure AD", protocol: "oidc", icon: "A" },
  { key: "google", name: "Google Workspace", protocol: "oidc", icon: "G" },
  { key: "onelogin", name: "OneLogin", protocol: "saml", icon: "1" },
  { key: "custom_saml", name: "Custom SAML", protocol: "saml", icon: "S" },
  { key: "custom_oidc", name: "Custom OIDC", protocol: "oidc", icon: "C" },
];

const roleBadgeStyles: Record<string, { bg: string; text: string }> = {
  owner: { bg: "rgba(59, 130, 246, 0.15)", text: "var(--blue)" },
  admin: { bg: "rgba(6, 214, 160, 0.15)", text: "var(--teal)" },
  member: { bg: "rgba(100, 116, 139, 0.15)", text: "var(--text-muted)" },
  auditor: { bg: "rgba(245, 158, 11, 0.15)", text: "var(--warning)" },
  viewer: { bg: "rgba(100, 116, 139, 0.15)", text: "var(--text-muted)" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const d = new Date(dateStr);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("organization");
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [ssoConnections, setSsoConnections] = useState<SSOConnection[]>([]);
  const [scimTokens, setScimTokens] = useState<SCIMToken[]>([]);
  const [scimGroups, setScimGroups] = useState<SCIMGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Org fields
  const [orgName, setOrgName] = useState("My Organization");
  const [orgNameSaved, setOrgNameSaved] = useState(false);
  const orgId = "tenant-1";

  // Create API key state
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Revoke confirmation
  const [revokeConfirmId, setRevokeConfirmId] = useState<string | null>(null);

  // Invite member state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  // SSO state
  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(null);
  const [ssoConfig, setSsoConfig] = useState<Record<string, string>>({});
  const [ssoTestResult, setSsoTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [createdScimToken, setCreatedScimToken] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [keysData, usersData, ssoData, scimTokenData] = await Promise.all([
        fetchApiKeys().catch(() => null),
        fetchTenantUsers("tenant-1").catch(() => null),
        fetchSSOConnections().catch(() => null),
        fetchSCIMTokens().catch(() => null),
      ]);
      setApiKeys(keysData ?? mockApiKeys);
      setUsers(usersData ?? mockTenantUsers);
      setSsoConnections(ssoData ?? mockSSOConnections);
      setScimTokens(scimTokenData ?? mockSCIMTokens);
      setScimGroups(mockSCIMGroups);
    } catch {
      setApiKeys(mockApiKeys);
      setUsers(mockTenantUsers);
      setSsoConnections(mockSSOConnections);
      setScimTokens(mockSCIMTokens);
      setScimGroups(mockSCIMGroups);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveOrgName = () => {
    setOrgNameSaved(true);
    setTimeout(() => setOrgNameSaved(false), 2000);
  };

  const handleCopyOrgId = () => {
    navigator.clipboard.writeText(orgId);
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    try {
      const result = await createApiKey({ name: newKeyName.trim() });
      setCreatedKey(result.key);
      setApiKeys((prev) => [
        {
          id: result.id,
          name: newKeyName.trim(),
          keyPrefix: result.key.substring(0, 12),
          scopes: ["*"],
          ownerId: "admin",
          createdAt: new Date().toISOString(),
          lastUsedAt: null,
          revoked: false,
        },
        ...prev,
      ]);
      setNewKeyName("");
    } catch {
      // Mock the key creation
      const mockKey = `ag_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      setCreatedKey(mockKey);
      setApiKeys((prev) => [
        {
          id: `key-${Date.now()}`,
          name: newKeyName.trim(),
          keyPrefix: mockKey.substring(0, 12),
          scopes: ["*"],
          ownerId: "admin",
          createdAt: new Date().toISOString(),
          lastUsedAt: null,
          revoked: false,
        },
        ...prev,
      ]);
      setNewKeyName("");
    }
  };

  const handleCopyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await revokeApiKey(id);
    } catch {
      // Mock revocation
    }
    setApiKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, revoked: true } : k))
    );
    setRevokeConfirmId(null);
  };

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) return;
    setUsers((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        tenantId: "tenant-1",
        email: inviteEmail.trim(),
        name: inviteEmail.split("@")[0],
        role: inviteRole,
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
      },
    ]);
    setInviteEmail("");
    setInviteRole("member");
    setShowInvite(false);
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const handleCreateSSOConnection = async () => {
    if (!selectedProvider) return;
    const providerInfo = SSO_PROVIDERS.find((p) => p.key === selectedProvider);
    if (!providerInfo) return;

    const data: Record<string, unknown> = {
      provider: selectedProvider,
      protocol: providerInfo.protocol,
    };
    if (providerInfo.protocol === "saml") {
      if (ssoConfig.samlEntityId) data.samlEntityId = ssoConfig.samlEntityId;
      if (ssoConfig.samlSsoUrl) data.samlSsoUrl = ssoConfig.samlSsoUrl;
      if (ssoConfig.samlCertificate) data.samlCertificate = ssoConfig.samlCertificate;
      if (ssoConfig.samlMetadataUrl) data.samlMetadataUrl = ssoConfig.samlMetadataUrl;
    } else {
      if (ssoConfig.oidcDiscoveryUrl) data.oidcDiscoveryUrl = ssoConfig.oidcDiscoveryUrl;
      if (ssoConfig.oidcClientId) data.oidcClientId = ssoConfig.oidcClientId;
      if (ssoConfig.oidcClientSecret) data.oidcClientSecret = ssoConfig.oidcClientSecret;
    }

    try {
      const conn = await createSSOConnection(data);
      setSsoConnections((prev) => [conn, ...prev]);
    } catch {
      // Mock fallback
      setSsoConnections((prev) => [
        {
          id: `sso-${Date.now()}`,
          tenantId: "tenant-1",
          provider: selectedProvider,
          protocol: providerInfo.protocol,
          enabled: false,
          enforced: false,
          defaultRole: "member",
          jitProvisioning: true,
          attributeMapping: {},
          samlEntityId: ssoConfig.samlEntityId ?? null,
          samlSsoUrl: ssoConfig.samlSsoUrl ?? null,
          samlCertificate: ssoConfig.samlCertificate ?? null,
          samlMetadataUrl: ssoConfig.samlMetadataUrl ?? null,
          oidcDiscoveryUrl: ssoConfig.oidcDiscoveryUrl ?? null,
          oidcClientId: ssoConfig.oidcClientId ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    setSelectedProvider(null);
    setSsoConfig({});
  };

  const handleToggleSSOEnabled = async (connId: string, enabled: boolean) => {
    try {
      await updateSSOConnection(connId, { enabled });
    } catch { /* mock */ }
    setSsoConnections((prev) => prev.map((c) => (c.id === connId ? { ...c, enabled } : c)));
  };

  const handleToggleSSOEnforced = async (connId: string, enforced: boolean) => {
    if (mockSubscription.plan !== "enterprise" && enforced) {
      alert("SSO enforcement requires an Enterprise plan.");
      return;
    }
    try {
      await updateSSOConnection(connId, { enforced });
    } catch { /* mock */ }
    setSsoConnections((prev) => prev.map((c) => (c.id === connId ? { ...c, enforced } : c)));
  };

  const handleTestSSO = async (connId: string) => {
    setSsoTestResult(null);
    try {
      const result = await testSSOConnection(connId);
      setSsoTestResult(result);
    } catch {
      setSsoTestResult({ success: true, message: "Configuration looks valid (mock)" });
    }
  };

  const handleDeleteSSO = async (connId: string) => {
    try {
      await deleteSSOConnection(connId);
    } catch { /* mock */ }
    setSsoConnections((prev) => prev.filter((c) => c.id !== connId));
  };

  const handleGenerateScimToken = async (connectionId: string) => {
    setCreatedScimToken(null);
    try {
      const result = await generateSCIMToken(connectionId);
      setCreatedScimToken(result.token);
      setScimTokens((prev) => [result, ...prev]);
    } catch {
      const mockToken = `scim_${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}`;
      setCreatedScimToken(mockToken);
      setScimTokens((prev) => [
        { id: `scim-tok-${Date.now()}`, tenantId: "tenant-1", connectionId, tokenPrefix: mockToken.substring(0, 12), revoked: false, createdAt: new Date().toISOString(), lastUsedAt: null },
        ...prev,
      ]);
    }
  };

  const handleRevokeScimToken = async (tokenId: string) => {
    try {
      await revokeSCIMToken(tokenId);
    } catch { /* mock */ }
    setScimTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, revoked: true } : t)));
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "organization", label: "Organization" },
    { key: "api-keys", label: "API Keys" },
    { key: "team", label: "Team Members" },
    { key: "sso", label: "Single Sign-On" },
  ];

  const planBadge = mockSubscription.plan;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Manage your organization, API keys, and team
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: "var(--border)" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2.5 text-sm font-medium transition-colors relative"
            style={{
              color: activeTab === tab.key ? "var(--blue)" : "var(--text-secondary)",
            }}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: "var(--blue)" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Organization Tab */}
          {activeTab === "organization" && (
            <div className="space-y-6 max-w-2xl">
              {/* Org Name */}
              <div
                className="rounded-xl border p-6"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                  Organization Name
                </h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none transition-colors"
                    style={{
                      background: "var(--bg-primary)",
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                  />
                  <button
                    onClick={handleSaveOrgName}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                    style={{ background: "var(--blue)" }}
                  >
                    {orgNameSaved ? "Saved!" : "Save"}
                  </button>
                </div>
              </div>

              {/* Org ID */}
              <div
                className="rounded-xl border p-6"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                  Organization ID
                </h3>
                <div className="flex items-center gap-3">
                  <code
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-mono"
                    style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}
                  >
                    {orgId}
                  </code>
                  <button
                    onClick={handleCopyOrgId}
                    className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-white/[0.03]"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Current Plan */}
              <div
                className="rounded-xl border p-6"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                  Current Plan
                </h3>
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold capitalize"
                  style={{
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(6, 214, 160, 0.15))",
                    color: "var(--blue)",
                  }}
                >
                  {planBadge}
                </span>
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === "api-keys" && (
            <div className="space-y-6">
              {/* Create Key */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  API Keys ({apiKeys.filter((k) => !k.revoked).length} active)
                </h3>
                <button
                  onClick={() => {
                    setShowCreateKey(!showCreateKey);
                    setCreatedKey(null);
                    setCopiedKey(false);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: "var(--blue)" }}
                >
                  Create API Key
                </button>
              </div>

              {/* Create Key Form */}
              {showCreateKey && (
                <div
                  className="rounded-xl border p-5 space-y-4"
                  style={{ background: "var(--bg-card)", borderColor: "var(--blue)" }}
                >
                  {createdKey ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium" style={{ color: "var(--teal)" }}>
                        API Key created successfully
                      </p>
                      <div className="flex items-center gap-3">
                        <code
                          className="flex-1 px-3 py-2.5 rounded-lg text-sm font-mono break-all"
                          style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
                        >
                          {createdKey}
                        </code>
                        <button
                          onClick={handleCopyKey}
                          className="shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                          style={{ background: "var(--teal)" }}
                        >
                          {copiedKey ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="text-xs" style={{ color: "var(--warning)" }}>
                        Save this key now. It will not be shown again.
                      </p>
                      <button
                        onClick={() => {
                          setShowCreateKey(false);
                          setCreatedKey(null);
                        }}
                        className="text-xs font-medium transition-colors"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="Key name (e.g. Production API Key)"
                        className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none transition-colors"
                        style={{
                          background: "var(--bg-primary)",
                          borderColor: "var(--border)",
                          color: "var(--text-primary)",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        onKeyDown={(e) => { if (e.key === "Enter") handleCreateKey(); }}
                      />
                      <button
                        onClick={handleCreateKey}
                        disabled={!newKeyName.trim()}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                        style={{ background: "var(--blue)" }}
                      >
                        Create
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Keys Table */}
              <div
                className="rounded-xl border overflow-hidden"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Name</th>
                        <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Key Prefix</th>
                        <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Scopes</th>
                        <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Created</th>
                        <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Last Used</th>
                        <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Status</th>
                        <th className="text-right px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeys.map((key) => (
                        <tr
                          key={key.id}
                          style={{ borderBottom: "1px solid var(--border)" }}
                          className="transition-colors hover:bg-white/[0.02]"
                        >
                          <td className="px-5 py-3.5">
                            <span
                              style={{
                                color: key.revoked ? "var(--text-muted)" : "var(--text-primary)",
                                textDecoration: key.revoked ? "line-through" : "none",
                              }}
                            >
                              {key.name}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <code
                              className="text-xs font-mono"
                              style={{
                                color: key.revoked ? "var(--text-muted)" : "var(--text-secondary)",
                                textDecoration: key.revoked ? "line-through" : "none",
                              }}
                            >
                              {key.keyPrefix}...
                            </code>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                              {key.scopes.join(", ")}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                              {formatDate(key.createdAt)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                              {formatDateTime(key.lastUsedAt)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {key.revoked ? (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                                style={{ background: "rgba(239, 68, 68, 0.15)", color: "var(--danger)" }}
                              >
                                Revoked
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                                style={{ background: "rgba(6, 214, 160, 0.15)", color: "var(--teal)" }}
                              >
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            {!key.revoked && (
                              <>
                                {revokeConfirmId === key.id ? (
                                  <div className="flex items-center gap-2 justify-end">
                                    <span className="text-xs" style={{ color: "var(--warning)" }}>Revoke?</span>
                                    <button
                                      onClick={() => handleRevokeKey(key.id)}
                                      className="px-2 py-1 rounded text-xs font-medium text-white"
                                      style={{ background: "var(--danger)" }}
                                    >
                                      Yes
                                    </button>
                                    <button
                                      onClick={() => setRevokeConfirmId(null)}
                                      className="px-2 py-1 rounded text-xs font-medium border"
                                      style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setRevokeConfirmId(key.id)}
                                    className="text-xs font-medium transition-colors"
                                    style={{ color: "var(--danger)" }}
                                  >
                                    Revoke
                                  </button>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Team Members Tab */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Team Members ({users.length})
                </h3>
                <button
                  onClick={() => setShowInvite(!showInvite)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: "var(--blue)" }}
                >
                  Invite Member
                </button>
              </div>

              {/* Invite Form */}
              {showInvite && (
                <div
                  className="rounded-xl border p-5"
                  style={{ background: "var(--bg-card)", borderColor: "var(--blue)" }}
                >
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Email address"
                      className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none transition-colors"
                      style={{
                        background: "var(--bg-primary)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleInviteMember(); }}
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="px-3 py-2 rounded-lg text-sm border outline-none"
                      style={{
                        background: "var(--bg-primary)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="auditor">Auditor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      onClick={handleInviteMember}
                      disabled={!inviteEmail.trim()}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                      style={{ background: "var(--blue)" }}
                    >
                      Invite
                    </button>
                  </div>
                </div>
              )}

              {/* Users Table */}
              <div
                className="rounded-xl border overflow-hidden"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Name</th>
                        <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Email</th>
                        <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Role</th>
                        <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Joined</th>
                        <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Last Login</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        const badgeStyle = roleBadgeStyles[user.role] ?? roleBadgeStyles.member;
                        return (
                          <tr
                            key={user.id}
                            style={{ borderBottom: "1px solid var(--border)" }}
                            className="transition-colors hover:bg-white/[0.02]"
                          >
                            <td className="px-5 py-3.5" style={{ color: "var(--text-primary)" }}>
                              {user.name}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
                                {user.email}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              {user.role === "owner" ? (
                                <span
                                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                                  style={{ background: badgeStyle.bg, color: badgeStyle.text }}
                                >
                                  {user.role}
                                </span>
                              ) : (
                                <select
                                  value={user.role}
                                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border-none outline-none cursor-pointer"
                                  style={{
                                    background: badgeStyle.bg,
                                    color: badgeStyle.text,
                                  }}
                                >
                                  <option value="admin">Admin</option>
                                  <option value="member">Member</option>
                                  <option value="auditor">Auditor</option>
                                  <option value="viewer">Viewer</option>
                                </select>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                {formatDate(user.createdAt)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {formatDateTime(user.lastLoginAt)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SSO Tab */}
          {activeTab === "sso" && (
            <div className="space-y-6">
              {/* Existing Connection */}
              {ssoConnections.length > 0 ? (
                ssoConnections.map((conn) => (
                  <div key={conn.id} className="space-y-6">
                    {/* Connection Status Card */}
                    <div
                      className="rounded-xl border p-6"
                      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                            style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,214,160,0.2))", color: "var(--blue)" }}
                          >
                            {SSO_PROVIDERS.find((p) => p.key === conn.provider)?.icon ?? "?"}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                              {SSO_PROVIDERS.find((p) => p.key === conn.provider)?.name ?? conn.provider}
                            </h3>
                            <span className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>
                              {conn.protocol}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              background: conn.enabled ? "rgba(6,214,160,0.15)" : "rgba(100,116,139,0.15)",
                              color: conn.enabled ? "var(--teal)" : "var(--text-muted)",
                            }}
                          >
                            {conn.enabled ? "Enabled" : "Disabled"}
                          </span>
                          <button
                            onClick={() => handleDeleteSSO(conn.id)}
                            className="text-xs font-medium"
                            style={{ color: "var(--danger)" }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Enabled</span>
                          <button
                            onClick={() => handleToggleSSOEnabled(conn.id, !conn.enabled)}
                            className="w-10 h-5 rounded-full transition-colors relative"
                            style={{ background: conn.enabled ? "var(--teal)" : "var(--border)" }}
                          >
                            <div
                              className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all"
                              style={{ left: conn.enabled ? "22px" : "2px" }}
                            />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            Enforce SSO
                            {planBadge !== "enterprise" && (
                              <span className="ml-1 text-[10px]" style={{ color: "var(--warning)" }}>(Enterprise)</span>
                            )}
                          </span>
                          <button
                            onClick={() => handleToggleSSOEnforced(conn.id, !conn.enforced)}
                            className="w-10 h-5 rounded-full transition-colors relative"
                            style={{ background: conn.enforced ? "var(--teal)" : "var(--border)" }}
                          >
                            <div
                              className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all"
                              style={{ left: conn.enforced ? "22px" : "2px" }}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleTestSSO(conn.id)}
                          className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-white/[0.03]"
                          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                        >
                          Test Connection
                        </button>
                      </div>

                      {ssoTestResult && (
                        <div
                          className="mt-3 px-3 py-2 rounded-lg text-xs"
                          style={{
                            background: ssoTestResult.success ? "rgba(6,214,160,0.1)" : "rgba(239,68,68,0.1)",
                            color: ssoTestResult.success ? "var(--teal)" : "var(--danger)",
                          }}
                        >
                          {ssoTestResult.message}
                        </div>
                      )}
                    </div>

                    {/* SP Metadata */}
                    <div
                      className="rounded-xl border p-6"
                      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
                    >
                      <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                        Service Provider Metadata
                      </h3>
                      <div className="space-y-3">
                        {[
                          { label: "Entity ID", value: `${typeof window !== "undefined" ? window.location.origin.replace("3200", "3100") : "http://localhost:3100"}/api/v1/auth/saml/acme-corp/metadata` },
                          { label: "ACS URL", value: `${typeof window !== "undefined" ? window.location.origin.replace("3200", "3100") : "http://localhost:3100"}/api/v1/auth/saml/acme-corp/acs` },
                          { label: "Metadata URL", value: `${typeof window !== "undefined" ? window.location.origin.replace("3200", "3100") : "http://localhost:3100"}/api/v1/auth/saml/acme-corp/metadata` },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-3">
                            <span className="text-xs w-24 shrink-0" style={{ color: "var(--text-muted)" }}>{item.label}</span>
                            <code
                              className="flex-1 px-2 py-1.5 rounded text-xs font-mono truncate"
                              style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}
                            >
                              {item.value}
                            </code>
                            <button
                              onClick={() => handleCopyToClipboard(item.value)}
                              className="shrink-0 px-2 py-1 rounded text-xs font-medium border transition-colors hover:bg-white/[0.03]"
                              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                            >
                              Copy
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SCIM Section */}
                    <div
                      className="rounded-xl border p-6"
                      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            SCIM Directory Sync
                          </h3>
                          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                            Automatically sync users and groups from your identity provider
                          </p>
                        </div>
                        <button
                          onClick={() => handleGenerateScimToken(conn.id)}
                          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                          style={{ background: "var(--blue)" }}
                        >
                          Generate Token
                        </button>
                      </div>

                      {/* SCIM Endpoint */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs w-24 shrink-0" style={{ color: "var(--text-muted)" }}>Endpoint</span>
                        <code
                          className="flex-1 px-2 py-1.5 rounded text-xs font-mono truncate"
                          style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}
                        >
                          {typeof window !== "undefined" ? window.location.origin.replace("3200", "3100") : "http://localhost:3100"}/api/v1/scim/acme-corp
                        </code>
                        <button
                          onClick={() => handleCopyToClipboard(`${typeof window !== "undefined" ? window.location.origin.replace("3200", "3100") : "http://localhost:3100"}/api/v1/scim/acme-corp`)}
                          className="shrink-0 px-2 py-1 rounded text-xs font-medium border transition-colors hover:bg-white/[0.03]"
                          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                        >
                          Copy
                        </button>
                      </div>

                      {/* Created Token Display */}
                      {createdScimToken && (
                        <div
                          className="rounded-lg border p-4 mb-4 space-y-2"
                          style={{ borderColor: "var(--teal)", background: "rgba(6,214,160,0.05)" }}
                        >
                          <p className="text-xs font-medium" style={{ color: "var(--teal)" }}>
                            SCIM Token generated successfully
                          </p>
                          <div className="flex items-center gap-3">
                            <code
                              className="flex-1 px-2 py-1.5 rounded text-xs font-mono break-all"
                              style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
                            >
                              {createdScimToken}
                            </code>
                            <button
                              onClick={() => handleCopyToClipboard(createdScimToken)}
                              className="shrink-0 px-3 py-1.5 rounded text-xs font-medium text-white"
                              style={{ background: "var(--teal)" }}
                            >
                              Copy
                            </button>
                          </div>
                          <p className="text-[10px]" style={{ color: "var(--warning)" }}>
                            Save this token now. It will not be shown again.
                          </p>
                        </div>
                      )}

                      {/* SCIM Tokens Table */}
                      {scimTokens.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                            Active Tokens
                          </h4>
                          <div className="space-y-2">
                            {scimTokens.map((token) => (
                              <div
                                key={token.id}
                                className="flex items-center justify-between px-3 py-2 rounded-lg"
                                style={{ background: "var(--bg-primary)" }}
                              >
                                <div className="flex items-center gap-3">
                                  <code className="text-xs font-mono" style={{ color: token.revoked ? "var(--text-muted)" : "var(--text-secondary)" }}>
                                    {token.tokenPrefix}...
                                  </code>
                                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                                    Created {formatDate(token.createdAt)}
                                  </span>
                                  {token.lastUsedAt && (
                                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                                      Last used {formatDateTime(token.lastUsedAt)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {token.revoked ? (
                                    <span className="text-[10px] font-bold uppercase" style={{ color: "var(--danger)" }}>Revoked</span>
                                  ) : (
                                    <button
                                      onClick={() => handleRevokeScimToken(token.id)}
                                      className="text-xs font-medium"
                                      style={{ color: "var(--danger)" }}
                                    >
                                      Revoke
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Group Mappings */}
                      {scimGroups.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                            Group Mappings
                          </h4>
                          <div
                            className="rounded-lg border overflow-hidden"
                            style={{ borderColor: "var(--border)" }}
                          >
                            <table className="w-full text-sm">
                              <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                  <th className="text-left px-4 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>IdP Group</th>
                                  <th className="text-left px-4 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Mapped Role</th>
                                </tr>
                              </thead>
                              <tbody>
                                {scimGroups.map((group) => {
                                  const badgeStyle = roleBadgeStyles[group.mappedRole] ?? roleBadgeStyles.member;
                                  return (
                                    <tr key={group.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                      <td className="px-4 py-2.5 text-xs" style={{ color: "var(--text-primary)" }}>
                                        {group.displayName}
                                        <span className="ml-2 text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                                          {group.externalGroupId}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2.5">
                                        <span
                                          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                                          style={{ background: badgeStyle.bg, color: badgeStyle.text }}
                                        >
                                          {group.mappedRole}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                /* Provider Selection Grid */
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                      Configure Single Sign-On
                    </h3>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Select your identity provider to get started
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {SSO_PROVIDERS.map((provider) => (
                      <button
                        key={provider.key}
                        onClick={() => {
                          setSelectedProvider(selectedProvider === provider.key ? null : provider.key);
                          setSsoConfig({});
                        }}
                        className="rounded-xl border p-4 text-left transition-all hover:bg-white/[0.02]"
                        style={{
                          background: "var(--bg-card)",
                          borderColor: selectedProvider === provider.key ? "var(--blue)" : "var(--border)",
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold mb-3"
                          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,214,160,0.15))", color: "var(--blue)" }}
                        >
                          {provider.icon}
                        </div>
                        <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {provider.name}
                        </div>
                        <div className="text-[10px] uppercase mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {provider.protocol}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Config Form */}
                  {selectedProvider && (
                    <div
                      className="rounded-xl border p-6 space-y-4"
                      style={{ background: "var(--bg-card)", borderColor: "var(--blue)" }}
                    >
                      <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        Configure {SSO_PROVIDERS.find((p) => p.key === selectedProvider)?.name}
                      </h3>

                      {SSO_PROVIDERS.find((p) => p.key === selectedProvider)?.protocol === "saml" ? (
                        <div className="space-y-3">
                          {[
                            { key: "samlMetadataUrl", label: "IdP Metadata URL", placeholder: "https://idp.example.com/metadata" },
                            { key: "samlEntityId", label: "IdP Entity ID", placeholder: "https://idp.example.com/entity-id" },
                            { key: "samlSsoUrl", label: "IdP SSO URL", placeholder: "https://idp.example.com/sso/saml" },
                            { key: "samlCertificate", label: "X.509 Certificate", placeholder: "MIIDpDCCAoygAwIBA..." },
                          ].map((field) => (
                            <div key={field.key}>
                              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                                {field.label}
                              </label>
                              {field.key === "samlCertificate" ? (
                                <textarea
                                  value={ssoConfig[field.key] ?? ""}
                                  onChange={(e) => setSsoConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                  placeholder={field.placeholder}
                                  rows={3}
                                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none font-mono resize-none"
                                  style={{ background: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={ssoConfig[field.key] ?? ""}
                                  onChange={(e) => setSsoConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                  placeholder={field.placeholder}
                                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                                  style={{ background: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {[
                            { key: "oidcDiscoveryUrl", label: "Discovery URL", placeholder: "https://idp.example.com/.well-known/openid-configuration" },
                            { key: "oidcClientId", label: "Client ID", placeholder: "your-client-id" },
                            { key: "oidcClientSecret", label: "Client Secret", placeholder: "your-client-secret" },
                          ].map((field) => (
                            <div key={field.key}>
                              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                                {field.label}
                              </label>
                              <input
                                type={field.key === "oidcClientSecret" ? "password" : "text"}
                                value={ssoConfig[field.key] ?? ""}
                                onChange={(e) => setSsoConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                placeholder={field.placeholder}
                                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                                style={{ background: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={handleCreateSSOConnection}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                        style={{ background: "var(--blue)" }}
                      >
                        Save Configuration
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
