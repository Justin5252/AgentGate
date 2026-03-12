"use client";

import { useEffect, useState, Fragment } from "react";
import {
  fetchAuditorInvitations,
  createAuditorInvitation,
  revokeAuditorInvitation,
  fetchAuditorAccessLogs,
  type AuditorInvitation,
  type AuditorAccessLog,
} from "@/lib/api";
import { mockAuditorInvitations, mockAuditorAccessLogs } from "@/lib/mock-data";

const FRAMEWORKS = [
  { id: "soc2", name: "SOC 2" },
  { id: "gdpr", name: "GDPR" },
  { id: "hipaa", name: "HIPAA" },
  { id: "iso27001", name: "ISO 27001" },
  { id: "pci_dss", name: "PCI DSS" },
  { id: "eu_ai_act", name: "EU AI Act" },
];

const EXPIRY_OPTIONS = [
  { value: 7, label: "7 days" },
  { value: 14, label: "14 days" },
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
];

export default function AuditorsPage() {
  const [invitations, setInvitations] = useState<AuditorInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");
  const [expandedLogs, setExpandedLogs] = useState<string | null>(null);
  const [accessLogs, setAccessLogs] = useState<AuditorAccessLog[]>([]);
  const [copied, setCopied] = useState(false);

  // Invite form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [expiresInDays, setExpiresInDays] = useState(30);

  useEffect(() => {
    loadInvitations();
  }, []);

  async function loadInvitations() {
    try {
      const data = await fetchAuditorInvitations();
      setInvitations(data);
    } catch {
      setInvitations(mockAuditorInvitations);
    }
    setLoading(false);
  }

  async function handleInvite() {
    if (!email || !name || selectedFrameworks.length === 0) return;
    try {
      const result = await createAuditorInvitation({
        email,
        name,
        frameworkScopes: selectedFrameworks,
        expiresInDays,
      });
      setGeneratedToken(result.token);
      setShowInviteModal(false);
      setShowTokenModal(true);
      setEmail("");
      setName("");
      setSelectedFrameworks([]);
      setExpiresInDays(30);
      loadInvitations();
    } catch (err) {
      console.error("Failed to create invitation:", err);
    }
  }

  async function handleRevoke(id: string) {
    try {
      await revokeAuditorInvitation(id);
      loadInvitations();
    } catch (err) {
      console.error("Failed to revoke:", err);
    }
  }

  async function toggleLogs(id: string) {
    if (expandedLogs === id) {
      setExpandedLogs(null);
      return;
    }
    try {
      const logs = await fetchAuditorAccessLogs(id);
      setAccessLogs(logs);
    } catch {
      setAccessLogs(mockAuditorAccessLogs);
    }
    setExpandedLogs(id);
  }

  function copyLink() {
    const link = `${window.location.origin}/auditor?token=${generatedToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyToken() {
    navigator.clipboard.writeText(generatedToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const statusColors: Record<string, string> = {
    pending: "rgba(251,191,36,0.15)",
    active: "rgba(6,214,160,0.15)",
    expired: "rgba(148,163,184,0.15)",
    revoked: "rgba(239,68,68,0.15)",
  };
  const statusTextColors: Record<string, string> = {
    pending: "#FBBF24",
    active: "#06D6A0",
    expired: "#94A3B8",
    revoked: "#EF4444",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Auditor Management
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Invite external auditors with scoped, read-only access to compliance data
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--blue)" }}
        >
          Invite Auditor
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Auditor</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Frameworks</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Expires</th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Last Accessed</th>
              <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>Loading...</td>
              </tr>
            ) : invitations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  No auditor invitations yet. Click "Invite Auditor" to get started.
                </td>
              </tr>
            ) : (
              invitations.map((inv) => (
                <Fragment key={inv.id}>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{inv.name}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{inv.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {inv.frameworkScopes.map((f) => (
                          <span key={f} className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: "rgba(59,130,246,0.1)", color: "var(--blue)" }}>
                            {f.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: statusColors[inv.status], color: statusTextColors[inv.status] }}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {inv.lastAccessedAt ? new Date(inv.lastAccessedAt).toLocaleString() : "Never"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleLogs(inv.id)}
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{ color: "var(--text-secondary)", background: "rgba(255,255,255,0.05)" }}
                        >
                          {expandedLogs === inv.id ? "Hide Logs" : "Logs"}
                        </button>
                        {(inv.status === "pending" || inv.status === "active") && (
                          <button
                            onClick={() => handleRevoke(inv.id)}
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ color: "#EF4444", background: "rgba(239,68,68,0.1)" }}
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedLogs === inv.id && (
                    <tr key={`${inv.id}-logs`}>
                      <td colSpan={6} className="px-4 py-3" style={{ background: "rgba(0,0,0,0.2)" }}>
                        <div className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>ACCESS LOG</div>
                        {accessLogs.length === 0 ? (
                          <div className="text-xs" style={{ color: "var(--text-muted)" }}>No access logs yet</div>
                        ) : (
                          <div className="space-y-1">
                            {accessLogs.map((log) => (
                              <div key={log.id} className="flex items-center gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                                <span className="font-mono" style={{ color: "var(--text-muted)" }}>
                                  {new Date(log.timestamp).toLocaleString()}
                                </span>
                                <span>{log.action}</span>
                                <span className="font-mono">{log.resource}</span>
                                {log.ipAddress && <span style={{ color: "var(--text-muted)" }}>{log.ipAddress}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Invite Auditor</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border"
                  style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  placeholder="auditor@firm.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border"
                  style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  placeholder="Jane Smith"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Framework Access</label>
                <div className="grid grid-cols-2 gap-2">
                  {FRAMEWORKS.map((fw) => (
                    <label key={fw.id} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                      <input
                        type="checkbox"
                        checked={selectedFrameworks.includes(fw.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFrameworks([...selectedFrameworks, fw.id]);
                          } else {
                            setSelectedFrameworks(selectedFrameworks.filter((f) => f !== fw.id));
                          }
                        }}
                      />
                      {fw.name}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Expires In</label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-sm border"
                  style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  {EXPIRY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!email || !name || selectedFrameworks.length === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                style={{ background: "var(--blue)" }}
              >
                Create Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token Display Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Invitation Created</h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Copy this token or shareable link. The token will not be shown again.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Token</label>
                <div className="flex gap-2">
                  <code className="flex-1 px-3 py-2 rounded-lg text-xs font-mono break-all" style={{ background: "var(--bg)", color: "var(--text-primary)" }}>
                    {generatedToken}
                  </code>
                  <button onClick={copyToken} className="px-3 py-2 rounded-lg text-xs font-medium shrink-0" style={{ background: "rgba(59,130,246,0.1)", color: "var(--blue)" }}>
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Shareable Link</label>
                <div className="flex gap-2">
                  <code className="flex-1 px-3 py-2 rounded-lg text-xs font-mono break-all" style={{ background: "var(--bg)", color: "var(--text-primary)" }}>
                    {typeof window !== "undefined" ? `${window.location.origin}/auditor?token=${generatedToken}` : ""}
                  </code>
                  <button onClick={copyLink} className="px-3 py-2 rounded-lg text-xs font-medium shrink-0" style={{ background: "rgba(59,130,246,0.1)", color: "var(--blue)" }}>
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowTokenModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: "var(--blue)" }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
