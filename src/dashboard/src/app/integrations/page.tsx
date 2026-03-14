"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchIntegrations,
  configureVanta,
  pushToVanta,
  syncFromVanta,
} from "@/lib/api";
import type { IntegrationConfig, IntegrationSyncResult } from "@/lib/api";
import { mockIntegrations } from "@/lib/mock-data";

interface VantaState {
  apiKey: string;
  enabled: boolean;
  connected: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  pushing: boolean;
  syncing: boolean;
  configuring: boolean;
  lastResult: IntegrationSyncResult | null;
}

const comingSoonIntegrations = [
  {
    name: "Drata",
    description:
      "Automate compliance evidence collection and monitoring with Drata",
  },
  {
    name: "Secureframe",
    description:
      "Continuous compliance monitoring and audit readiness with Secureframe",
  },
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function IntegrationsPage() {
  const [vanta, setVanta] = useState<VantaState>({
    apiKey: "",
    enabled: false,
    connected: false,
    lastSyncAt: null,
    lastSyncStatus: null,
    pushing: false,
    syncing: false,
    configuring: false,
    lastResult: null,
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadIntegrations = useCallback(async () => {
    try {
      const integrations = await fetchIntegrations();
      const vantaConfig = integrations.find(
        (i) => i.integrationType === "vanta"
      );
      if (vantaConfig) {
        setVanta((prev) => ({
          ...prev,
          enabled: vantaConfig.enabled,
          connected: vantaConfig.enabled,
          lastSyncAt: vantaConfig.lastSyncAt,
          lastSyncStatus: vantaConfig.lastSyncStatus,
        }));
      }
    } catch {
      // Fallback to mock data
      const vantaMock = mockIntegrations.find(
        (i) => i.integrationType === "vanta"
      );
      if (vantaMock) {
        setVanta((prev) => ({
          ...prev,
          enabled: vantaMock.enabled,
          connected: vantaMock.enabled,
          lastSyncAt: vantaMock.lastSyncAt,
          lastSyncStatus: vantaMock.lastSyncStatus,
        }));
      }
    }
  }, []);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  async function handleConfigure() {
    if (!vanta.apiKey.trim()) {
      setError("API key is required");
      return;
    }
    setError(null);
    setVanta((prev) => ({ ...prev, configuring: true }));
    try {
      await configureVanta({ apiKey: vanta.apiKey });
      setVanta((prev) => ({
        ...prev,
        configuring: false,
        connected: true,
        enabled: true,
      }));
      setSuccessMessage("Vanta integration configured successfully");
    } catch {
      // Simulate success with mock
      setVanta((prev) => ({
        ...prev,
        configuring: false,
        connected: true,
        enabled: true,
      }));
      setSuccessMessage("Vanta integration configured (mock)");
    }
  }

  async function handleToggleEnabled() {
    const newEnabled = !vanta.enabled;
    setVanta((prev) => ({ ...prev, enabled: newEnabled }));
    if (!newEnabled) {
      setVanta((prev) => ({ ...prev, connected: false }));
    }
  }

  async function handlePush() {
    setError(null);
    setVanta((prev) => ({ ...prev, pushing: true, lastResult: null }));
    try {
      const result = await pushToVanta();
      setVanta((prev) => ({
        ...prev,
        pushing: false,
        lastSyncAt: result.syncedAt,
        lastSyncStatus: result.errors.length > 0 ? "partial" : "success",
        lastResult: result,
      }));
      setSuccessMessage(
        `Pushed ${result.pushed} items to Vanta${result.errors.length > 0 ? ` (${result.errors.length} errors)` : ""}`
      );
    } catch {
      // Mock result
      const mockResult: IntegrationSyncResult = {
        pushed: 42,
        pulled: 0,
        errors: [],
        syncedAt: new Date().toISOString(),
      };
      setVanta((prev) => ({
        ...prev,
        pushing: false,
        lastSyncAt: mockResult.syncedAt,
        lastSyncStatus: "success",
        lastResult: mockResult,
      }));
      setSuccessMessage(`Pushed ${mockResult.pushed} items to Vanta (mock)`);
    }
  }

  async function handleSync() {
    setError(null);
    setVanta((prev) => ({ ...prev, syncing: true, lastResult: null }));
    try {
      const result = await syncFromVanta();
      setVanta((prev) => ({
        ...prev,
        syncing: false,
        lastSyncAt: result.syncedAt,
        lastSyncStatus: result.errors.length > 0 ? "partial" : "success",
        lastResult: result,
      }));
      setSuccessMessage(
        `Synced ${result.pulled} items from Vanta${result.errors.length > 0 ? ` (${result.errors.length} errors)` : ""}`
      );
    } catch {
      // Mock result
      const mockResult: IntegrationSyncResult = {
        pushed: 0,
        pulled: 18,
        errors: [],
        syncedAt: new Date().toISOString(),
      };
      setVanta((prev) => ({
        ...prev,
        syncing: false,
        lastSyncAt: mockResult.syncedAt,
        lastSyncStatus: "success",
        lastResult: mockResult,
      }));
      setSuccessMessage(`Synced ${mockResult.pulled} items from Vanta (mock)`);
    }
  }

  const syncStatusColor =
    vanta.lastSyncStatus === "success"
      ? "#06D6A0"
      : vanta.lastSyncStatus === "partial"
        ? "#F59E0B"
        : vanta.lastSyncStatus === "error"
          ? "#EF4444"
          : "#64748B";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold gradient-text">Integrations</h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--text-secondary)" }}
        >
          Connect AgentGate with your compliance and security platforms
        </p>
      </div>

      {/* Success / Error banners */}
      {successMessage && (
        <div
          className="rounded-lg px-4 py-3 text-sm font-medium"
          style={{
            background: "rgba(6, 214, 160, 0.1)",
            border: "1px solid rgba(6, 214, 160, 0.3)",
            color: "#06D6A0",
          }}
        >
          {successMessage}
        </div>
      )}
      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm font-medium"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#EF4444",
          }}
        >
          {error}
        </div>
      )}

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Vanta Card */}
        <div
          className="rounded-xl border p-6 flex flex-col"
          style={{
            background: "var(--bg-card)",
            borderColor: vanta.connected
              ? "rgba(6, 214, 160, 0.3)"
              : "var(--border)",
            boxShadow: vanta.connected
              ? "0 0 20px rgba(6, 214, 160, 0.05)"
              : undefined,
          }}
        >
          {/* Card Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Vanta Logo */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                style={{
                  background: "linear-gradient(135deg, #5B21B6, #7C3AED)",
                  color: "#FFFFFF",
                }}
              >
                V
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className="font-semibold text-base"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Vanta
                  </h3>
                  {/* Connection Status Indicator */}
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{
                      background: vanta.connected ? "#06D6A0" : "#64748B",
                      boxShadow: vanta.connected
                        ? "0 0 6px rgba(6, 214, 160, 0.5)"
                        : undefined,
                    }}
                  />
                </div>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Push compliance data to Vanta, pull compliance status
                </p>
              </div>
            </div>
          </div>

          {/* API Key Input */}
          <div className="mb-4">
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              API Key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={vanta.apiKey}
                  onChange={(e) =>
                    setVanta((prev) => ({ ...prev, apiKey: e.target.value }))
                  }
                  placeholder="vanta_api_..."
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors focus:border-blue-500/50"
                  style={{
                    background: "rgba(0, 0, 0, 0.2)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/5 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  type="button"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {showApiKey ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              <button
                onClick={handleConfigure}
                disabled={vanta.configuring || !vanta.apiKey.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg, var(--blue), #2563EB)",
                }}
              >
                {vanta.configuring ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Enable/Disable Toggle */}
          <div
            className="flex items-center justify-between py-3 px-4 rounded-lg mb-4"
            style={{ background: "rgba(0, 0, 0, 0.15)" }}
          >
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Integration Enabled
            </span>
            <button
              onClick={handleToggleEnabled}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{
                background: vanta.enabled
                  ? "var(--teal)"
                  : "rgba(100, 116, 139, 0.3)",
              }}
              type="button"
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
                style={{
                  background: "#FFFFFF",
                  transform: vanta.enabled
                    ? "translateX(20px)"
                    : "translateX(0)",
                }}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={handlePush}
              disabled={!vanta.enabled || vanta.pushing}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "rgba(59, 130, 246, 0.15)",
                color: "var(--blue)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              {vanta.pushing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Pushing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                  Push to Vanta
                </span>
              )}
            </button>
            <button
              onClick={handleSync}
              disabled={!vanta.enabled || vanta.syncing}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "rgba(6, 214, 160, 0.15)",
                color: "var(--teal)",
                border: "1px solid rgba(6, 214, 160, 0.2)",
              }}
            >
              {vanta.syncing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Syncing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <polyline points="19 12 12 19 5 12" />
                  </svg>
                  Sync from Vanta
                </span>
              )}
            </button>
          </div>

          {/* Last Sync Status */}
          <div
            className="rounded-lg px-4 py-3 mt-auto"
            style={{ background: "rgba(0, 0, 0, 0.15)" }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                Last sync
              </span>
              {vanta.lastSyncStatus && (
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: `${syncStatusColor}15`,
                    color: syncStatusColor,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ background: syncStatusColor }}
                  />
                  {vanta.lastSyncStatus}
                </span>
              )}
            </div>
            <p
              className="text-sm font-medium mt-1"
              style={{ color: "var(--text-primary)" }}
            >
              {formatDate(vanta.lastSyncAt)}
            </p>
            {vanta.lastResult && (
              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                {vanta.lastResult.pushed > 0 &&
                  `${vanta.lastResult.pushed} pushed`}
                {vanta.lastResult.pushed > 0 &&
                  vanta.lastResult.pulled > 0 &&
                  " / "}
                {vanta.lastResult.pulled > 0 &&
                  `${vanta.lastResult.pulled} pulled`}
                {vanta.lastResult.errors.length > 0 &&
                  ` / ${vanta.lastResult.errors.length} errors`}
              </p>
            )}
          </div>
        </div>

        {/* Coming Soon Cards */}
        {comingSoonIntegrations.map((integration) => (
          <div
            key={integration.name}
            className="rounded-xl border p-6 flex flex-col relative overflow-hidden"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
              opacity: 0.55,
            }}
          >
            {/* Coming Soon Badge */}
            <div
              className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                background: "rgba(100, 116, 139, 0.2)",
                color: "#64748B",
              }}
            >
              Coming Soon
            </div>

            {/* Card Header */}
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                style={{
                  background: "rgba(100, 116, 139, 0.2)",
                  color: "#64748B",
                }}
              >
                {integration.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className="font-semibold text-base"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {integration.name}
                  </h3>
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ background: "#64748B" }}
                  />
                </div>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {integration.description}
                </p>
              </div>
            </div>

            {/* Placeholder Fields */}
            <div className="mb-4">
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                API Key
              </label>
              <input
                type="password"
                disabled
                placeholder="Coming soon..."
                className="w-full px-3 py-2 rounded-lg text-sm border cursor-not-allowed"
                style={{
                  background: "rgba(0, 0, 0, 0.2)",
                  borderColor: "var(--border)",
                  color: "var(--text-muted)",
                }}
              />
            </div>

            <div
              className="flex items-center justify-between py-3 px-4 rounded-lg mb-4"
              style={{ background: "rgba(0, 0, 0, 0.15)" }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Integration Enabled
              </span>
              <div
                className="relative w-11 h-6 rounded-full"
                style={{ background: "rgba(100, 116, 139, 0.3)" }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full"
                  style={{ background: "#64748B" }}
                />
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <button
                disabled
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium opacity-40 cursor-not-allowed"
                style={{
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "var(--blue)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                }}
              >
                Push
              </button>
              <button
                disabled
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium opacity-40 cursor-not-allowed"
                style={{
                  background: "rgba(6, 214, 160, 0.15)",
                  color: "var(--teal)",
                  border: "1px solid rgba(6, 214, 160, 0.2)",
                }}
              >
                Sync
              </button>
            </div>

            <div
              className="rounded-lg px-4 py-3 mt-auto"
              style={{ background: "rgba(0, 0, 0, 0.15)" }}
            >
              <span
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                Last sync
              </span>
              <p
                className="text-sm font-medium mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                N/A
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
