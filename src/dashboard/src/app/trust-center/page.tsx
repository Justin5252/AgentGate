"use client";

import { useEffect, useState } from "react";
import type { TrustCenterConfig } from "@/lib/api";
import {
  fetchTrustCenterConfig,
  updateTrustCenterConfig,
  enableTrustCenter,
  disableTrustCenter,
} from "@/lib/api";
import { mockTrustCenterConfig, mockFrameworks } from "@/lib/mock-data";

const PUBLIC_BASE_URL = "https://trust.agentgate.dev";

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#06D6A0" : score >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#1E293B"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

export default function TrustCenterPage() {
  const [config, setConfig] = useState<TrustCenterConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Editable form state
  const [enabled, setEnabled] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [publicSlug, setPublicSlug] = useState("");
  const [showFrameworkIds, setShowFrameworkIds] = useState<string[]>([]);
  const [showComplianceScores, setShowComplianceScores] = useState(true);
  const [showLastAuditDate, setShowLastAuditDate] = useState(true);
  const [showControlSummary, setShowControlSummary] = useState(true);
  const [showBadges, setShowBadges] = useState(true);

  useEffect(() => {
    fetchTrustCenterConfig()
      .then((data) => {
        setConfig(data);
        applyConfig(data);
      })
      .catch(() => {
        const fallback = mockTrustCenterConfig as unknown as TrustCenterConfig;
        setConfig(fallback);
        applyConfig(fallback);
      })
      .finally(() => setLoading(false));
  }, []);

  function applyConfig(c: TrustCenterConfig) {
    setEnabled(c.enabled);
    setCustomTitle(c.customTitle ?? "");
    setCustomDescription(c.customDescription ?? "");
    setPublicSlug(c.publicSlug);
    setShowFrameworkIds(c.showFrameworks);
    setShowComplianceScores(c.showComplianceScores);
    setShowLastAuditDate(c.showLastAuditDate);
    setShowControlSummary(c.showControlSummary);
    setShowBadges(c.showBadges);
  }

  async function handleToggleEnabled() {
    const next = !enabled;
    setEnabled(next);
    try {
      const updated = next ? await enableTrustCenter() : await disableTrustCenter();
      setConfig(updated);
    } catch {
      // Optimistic update — keep local state
    }
  }

  function handleFrameworkToggle(frameworkId: string) {
    setShowFrameworkIds((prev) =>
      prev.includes(frameworkId)
        ? prev.filter((id) => id !== frameworkId)
        : [...prev, frameworkId],
    );
  }

  async function handleSave() {
    setSaving(true);
    const payload: Partial<TrustCenterConfig> = {
      customTitle: customTitle.trim() || null,
      customDescription: customDescription.trim() || null,
      publicSlug: publicSlug.trim(),
      showFrameworks: showFrameworkIds,
      showComplianceScores,
      showLastAuditDate,
      showControlSummary,
      showBadges,
    };
    try {
      const updated = await updateTrustCenterConfig(payload);
      setConfig(updated);
    } catch {
      // Mock fallback — merge locally
      if (config) {
        setConfig({ ...config, ...payload, updatedAt: new Date().toISOString() } as TrustCenterConfig);
      }
    } finally {
      setSaving(false);
    }
  }

  function handleCopyUrl() {
    const url = `${PUBLIC_BASE_URL}/${publicSlug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const publicUrl = `${PUBLIC_BASE_URL}/${publicSlug}`;
  const selectedFrameworks = mockFrameworks.filter((f) =>
    showFrameworkIds.includes(f.frameworkId),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div
              className="h-7 w-48 rounded-lg animate-pulse"
              style={{ background: "var(--border)" }}
            />
            <div
              className="h-4 w-72 rounded mt-2 animate-pulse"
              style={{ background: "var(--border)" }}
            />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 rounded-xl animate-pulse"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Trust Center</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Configure your public-facing trust center for customers and prospects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyUrl}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-white/5"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            {copied ? "Copied!" : "Copy Public URL"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--blue), #2563EB)" }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Enable / Disable Toggle */}
      <div
        className="rounded-xl border p-6 flex items-center justify-between"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Trust Center Status
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {enabled
              ? "Your trust center is live and publicly accessible."
              : "Your trust center is disabled. Enable it to share your compliance posture."}
          </p>
        </div>
        <button
          onClick={handleToggleEnabled}
          className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors"
          style={{ background: enabled ? "var(--teal)" : "var(--border)" }}
        >
          <span
            className="inline-block h-5 w-5 rounded-full bg-white transition-transform"
            style={{ transform: enabled ? "translateX(24px)" : "translateX(4px)" }}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div
            className="rounded-xl border p-6 space-y-5"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Custom Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Acme Corp Trust Center"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors focus:border-blue-500"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Description
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="A brief description shown at the top of your trust center..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors resize-none focus:border-blue-500"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Public Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {PUBLIC_BASE_URL}/
                  </span>
                  <input
                    type="text"
                    value={publicSlug}
                    onChange={(e) => setPublicSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="your-company"
                    className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none transition-colors focus:border-blue-500"
                    style={{
                      background: "var(--bg-card)",
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Frameworks Selection */}
          <div
            className="rounded-xl border p-6 space-y-4"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Displayed Frameworks
            </h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Select which compliance frameworks appear on your public trust center.
            </p>
            <div className="space-y-2">
              {mockFrameworks.map((fw) => {
                const checked = showFrameworkIds.includes(fw.frameworkId);
                return (
                  <label
                    key={fw.frameworkId}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors hover:bg-white/[0.02]"
                    style={{
                      border: "1px solid",
                      borderColor: checked ? "rgba(59,130,246,0.4)" : "transparent",
                      background: checked ? "rgba(59,130,246,0.05)" : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleFrameworkToggle(fw.frameworkId)}
                      className="sr-only"
                    />
                    <div
                      className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                      style={{
                        borderColor: checked ? "var(--blue)" : "var(--border)",
                        background: checked ? "var(--blue)" : "transparent",
                      }}
                    >
                      {checked && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {fw.name}
                      </span>
                      <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
                        v{fw.version}
                      </span>
                    </div>
                    <span
                      className="text-xs font-medium flex-shrink-0"
                      style={{
                        color: fw.complianceScore >= 80 ? "#06D6A0" : fw.complianceScore >= 60 ? "#F59E0B" : "#EF4444",
                      }}
                    >
                      {fw.complianceScore}%
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Display Options */}
          <div
            className="rounded-xl border p-6 space-y-4"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Display Options
            </h3>
            {[
              { label: "Show Compliance Scores", desc: "Display score percentages for each framework", value: showComplianceScores, setter: setShowComplianceScores },
              { label: "Show Last Audit Date", desc: "Display when each framework was last evaluated", value: showLastAuditDate, setter: setShowLastAuditDate },
              { label: "Show Control Summary", desc: "Display passing/failing/warning control counts", value: showControlSummary, setter: setShowControlSummary },
              { label: "Show Compliance Badges", desc: "Display badge icons for active frameworks", value: showBadges, setter: setShowBadges },
            ].map((opt) => (
              <div key={opt.label} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {opt.label}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {opt.desc}
                  </p>
                </div>
                <button
                  onClick={() => opt.setter(!opt.value)}
                  className="relative inline-flex h-6 w-10 items-center rounded-full transition-colors flex-shrink-0"
                  style={{ background: opt.value ? "var(--blue)" : "var(--border)" }}
                >
                  <span
                    className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                    style={{ transform: opt.value ? "translateX(20px)" : "translateX(4px)" }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Preview
          </h3>
          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: "#0A0F1E", borderColor: "var(--border)" }}
          >
            {/* Preview Header */}
            <div className="px-6 py-8 text-center" style={{ borderBottom: "1px solid var(--border)" }}>
              {showBadges && selectedFrameworks.length > 0 && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  {selectedFrameworks.map((fw) => (
                    <span
                      key={fw.frameworkId}
                      className="inline-flex px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: fw.complianceScore >= 80 ? "rgba(6,214,160,0.15)" : fw.complianceScore >= 60 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)",
                        color: fw.complianceScore >= 80 ? "#06D6A0" : fw.complianceScore >= 60 ? "#F59E0B" : "#EF4444",
                      }}
                    >
                      {fw.name}
                    </span>
                  ))}
                </div>
              )}
              <h2 className="text-xl font-bold text-white">
                {customTitle || "Trust Center"}
              </h2>
              {(customDescription || !customTitle) && (
                <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
                  {customDescription || "Our commitment to security and compliance."}
                </p>
              )}
              <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
                {publicUrl}
              </p>
            </div>

            {/* Preview Frameworks */}
            <div className="p-6 space-y-3">
              {selectedFrameworks.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    No frameworks selected. Choose at least one to preview.
                  </p>
                </div>
              )}
              {selectedFrameworks.map((fw) => (
                <div
                  key={fw.frameworkId}
                  className="rounded-lg border p-4"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white">{fw.name}</h4>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {fw.description}
                      </p>
                      {showControlSummary && (
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span style={{ color: "#06D6A0" }}>
                            {fw.passingControls} passing
                          </span>
                          <span style={{ color: "#EF4444" }}>
                            {fw.failingControls} failing
                          </span>
                          <span style={{ color: "#F59E0B" }}>
                            {fw.warningControls} warning
                          </span>
                        </div>
                      )}
                      {showLastAuditDate && (
                        <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                          Last evaluated: {new Date(fw.lastEvaluatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {showComplianceScores && (
                      <div className="relative flex-shrink-0 ml-3">
                        <ScoreRing score={fw.complianceScore} size={48} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span
                            className="text-xs font-bold"
                            style={{
                              color: fw.complianceScore >= 80 ? "#06D6A0" : fw.complianceScore >= 60 ? "#F59E0B" : "#EF4444",
                            }}
                          >
                            {fw.complianceScore}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "#1E293B" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${fw.complianceScore}%`,
                        background: `linear-gradient(90deg, ${fw.complianceScore >= 80 ? "#06D6A0" : fw.complianceScore >= 60 ? "#F59E0B" : "#EF4444"}, ${fw.complianceScore >= 80 ? "#34D399" : fw.complianceScore >= 60 ? "#FBBF24" : "#F87171"})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Preview Footer */}
            <div
              className="px-6 py-4 text-center"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Powered by AgentGate
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {!enabled && (
            <div
              className="rounded-lg border px-4 py-3 flex items-center gap-3"
              style={{
                background: "rgba(245,158,11,0.05)",
                borderColor: "rgba(245,158,11,0.3)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-xs" style={{ color: "#F59E0B" }}>
                Your trust center is currently disabled. Visitors will see a &quot;not found&quot; page at this URL.
              </p>
            </div>
          )}

          {/* URL Info Card */}
          <div
            className="rounded-xl border p-5"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
              Public URL
            </h4>
            <div className="flex items-center gap-3">
              <code
                className="flex-1 px-3 py-2 rounded-lg text-sm font-mono truncate"
                style={{
                  background: "rgba(59,130,246,0.05)",
                  border: "1px solid var(--border)",
                  color: "var(--blue)",
                }}
              >
                {publicUrl}
              </code>
              <button
                onClick={handleCopyUrl}
                className="px-3 py-2 rounded-lg text-xs font-medium border transition-colors hover:bg-white/5 flex-shrink-0"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Share this URL with customers, prospects, and auditors to demonstrate your compliance posture.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
