"use client";

import { useEffect, useState, useCallback } from "react";
import type { ApiKey, TenantUser } from "@/lib/api";
import { fetchApiKeys, createApiKey, revokeApiKey, fetchTenantUsers } from "@/lib/api";
import { mockApiKeys, mockTenantUsers, mockSubscription } from "@/lib/mock-data";

type Tab = "organization" | "api-keys" | "team";

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

  const loadData = useCallback(async () => {
    try {
      const [keysData, usersData] = await Promise.all([
        fetchApiKeys().catch(() => null),
        fetchTenantUsers("tenant-1").catch(() => null),
      ]);
      setApiKeys(keysData ?? mockApiKeys);
      setUsers(usersData ?? mockTenantUsers);
    } catch {
      setApiKeys(mockApiKeys);
      setUsers(mockTenantUsers);
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

  const tabs: { key: Tab; label: string }[] = [
    { key: "organization", label: "Organization" },
    { key: "api-keys", label: "API Keys" },
    { key: "team", label: "Team Members" },
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
        </>
      )}
    </div>
  );
}
