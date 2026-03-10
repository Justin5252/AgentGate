"use client";

import { useEffect, useState, useCallback } from "react";
import type { Plan, Subscription, TenantUsage } from "@/lib/api";
import { fetchPlans, fetchSubscription, fetchTenantUsage } from "@/lib/api";
import { mockPlans, mockSubscription, mockUsage } from "@/lib/mock-data";

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  active: { bg: "rgba(6, 214, 160, 0.15)", text: "var(--teal)" },
  past_due: { bg: "rgba(239, 68, 68, 0.15)", text: "var(--danger)" },
  canceled: { bg: "rgba(100, 116, 139, 0.15)", text: "var(--text-muted)" },
  trialing: { bg: "rgba(59, 130, 246, 0.15)", text: "var(--blue)" },
};

function getUtilizationColor(current: number, limit: number): string {
  if (limit === -1) return "var(--teal)";
  const pct = (current / limit) * 100;
  if (pct > 90) return "var(--danger)";
  if (pct >= 70) return "var(--warning)";
  return "var(--teal)";
}

function getUtilizationPct(current: number, limit: number): number {
  if (limit === -1) return current > 0 ? 15 : 0; // Show a small bar for unlimited
  return Math.min((current / limit) * 100, 100);
}

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<TenantUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [plansData, subData, usageData] = await Promise.all([
        fetchPlans().catch(() => null),
        fetchSubscription("tenant-1").catch(() => null),
        fetchTenantUsage("tenant-1").catch(() => null),
      ]);
      setPlans(plansData ?? mockPlans);
      setSubscription(subData ?? mockSubscription);
      setUsage(usageData ?? mockUsage);
    } catch {
      setPlans(mockPlans);
      setSubscription(mockSubscription);
      setUsage(mockUsage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentPlan = plans.find((p) => p.id === subscription?.plan);
  const status = statusStyles[subscription?.status ?? "active"] ?? statusStyles.active;

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="skeleton h-7 w-32 mb-2" />
          <div className="skeleton h-4 w-64" />
        </div>
        <div className="skeleton h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-80 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Billing
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Manage your subscription and monitor usage
        </p>
      </div>

      {/* Current Plan & Usage */}
      <div
        className="rounded-xl border p-6 space-y-6"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        {/* Plan Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {currentPlan?.name ?? "Unknown"} Plan
                </h2>
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: status.bg, color: status.text }}
                >
                  {subscription?.status}
                </span>
              </div>
              {currentPlan && currentPlan.price > 0 && (
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                    ${currentPlan.price}
                  </span>
                  /month
                </p>
              )}
              {currentPlan && currentPlan.price === 0 && currentPlan.id !== "free" && (
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  Custom pricing
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--blue)" }}
            >
              Manage Subscription
            </button>
            <button
              onClick={() => setShowCancelWarning(!showCancelWarning)}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-red-500/10"
              style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
            >
              Cancel Plan
            </button>
          </div>
        </div>

        {/* Cancel Warning */}
        {showCancelWarning && (
          <div
            className="rounded-lg p-4 border"
            style={{ background: "rgba(239, 68, 68, 0.05)", borderColor: "var(--danger)" }}
          >
            <p className="text-sm" style={{ color: "var(--danger)" }}>
              Canceling your plan will downgrade you to the Free tier at the end of your current billing period.
              You will lose access to premium features including unlimited agents and anomaly detection.
            </p>
            <div className="flex gap-3 mt-3">
              <button
                className="px-3 py-1.5 rounded text-xs font-medium text-white"
                style={{ background: "var(--danger)" }}
              >
                Confirm Cancellation
              </button>
              <button
                onClick={() => setShowCancelWarning(false)}
                className="px-3 py-1.5 rounded text-xs font-medium border"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                Keep Plan
              </button>
            </div>
          </div>
        )}

        {/* Usage Bars */}
        {usage && (
          <div className="space-y-5">
            {/* Agents */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: "var(--text-secondary)" }}>Agents</span>
                <span className="font-mono" style={{ color: "var(--text-primary)" }}>
                  {formatNumber(usage.agentCount)} / {usage.agentLimit === -1 ? "Unlimited" : formatNumber(usage.agentLimit)}
                </span>
              </div>
              <div
                className="h-2.5 rounded-full overflow-hidden"
                style={{ background: "var(--bg-primary)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${getUtilizationPct(usage.agentCount, usage.agentLimit)}%`,
                    background: getUtilizationColor(usage.agentCount, usage.agentLimit),
                    boxShadow: `0 0 10px ${getUtilizationColor(usage.agentCount, usage.agentLimit)}40`,
                  }}
                />
              </div>
            </div>

            {/* Evaluations */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: "var(--text-secondary)" }}>Evaluations this month</span>
                <span className="font-mono" style={{ color: "var(--text-primary)" }}>
                  {formatNumber(usage.evalCountThisMonth)} / {usage.evalLimitPerMonth === -1 ? "Unlimited" : formatNumber(usage.evalLimitPerMonth)}
                </span>
              </div>
              <div
                className="h-2.5 rounded-full overflow-hidden"
                style={{ background: "var(--bg-primary)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${getUtilizationPct(usage.evalCountThisMonth, usage.evalLimitPerMonth)}%`,
                    background: getUtilizationColor(usage.evalCountThisMonth, usage.evalLimitPerMonth),
                    boxShadow: `0 0 10px ${getUtilizationColor(usage.evalCountThisMonth, usage.evalLimitPerMonth)}40`,
                  }}
                />
              </div>
            </div>

            {/* Period */}
            <div className="pt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>Current period</span>
                <span style={{ color: "var(--text-secondary)" }}>
                  {formatDate(usage.periodStart)} &mdash; {formatDate(usage.periodEnd)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
          Available Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.id === subscription?.plan;
            const isDowngrade =
              !isCurrent &&
              plans.indexOf(plan) < plans.findIndex((p) => p.id === subscription?.plan);

            return (
              <div
                key={plan.id}
                className="rounded-xl border p-6 flex flex-col transition-all duration-200"
                style={{
                  background: "var(--bg-card)",
                  borderColor: isCurrent ? "var(--teal)" : "var(--border)",
                  boxShadow: isCurrent ? "0 0 20px rgba(6, 214, 160, 0.1)" : "none",
                }}
              >
                {/* Plan Header */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                      {plan.name}
                    </h3>
                    {isCurrent && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: "rgba(6, 214, 160, 0.15)", color: "var(--teal)" }}
                      >
                        Current
                      </span>
                    )}
                  </div>
                  {plan.price > 0 ? (
                    <p style={{ color: "var(--text-secondary)" }}>
                      <span className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                        ${plan.price}
                      </span>
                      <span className="text-sm">/mo</span>
                    </p>
                  ) : plan.id === "enterprise" ? (
                    <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                      Custom
                    </p>
                  ) : (
                    <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                      Free
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <svg
                        className="w-4 h-4 mt-0.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke={isCurrent ? "var(--teal)" : "var(--blue)"}
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span style={{ color: "var(--text-secondary)" }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-lg text-sm font-medium border"
                    style={{
                      borderColor: "var(--teal)",
                      color: "var(--teal)",
                      opacity: 0.6,
                      cursor: "default",
                    }}
                  >
                    Current Plan
                  </button>
                ) : plan.id === "enterprise" ? (
                  <button
                    className="w-full py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-white/[0.03]"
                    style={{ borderColor: "var(--blue)", color: "var(--blue)" }}
                  >
                    Contact Sales
                  </button>
                ) : (
                  <div>
                    <button
                      className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                      style={{
                        background: isDowngrade ? "var(--warning)" : "var(--blue)",
                      }}
                    >
                      {isDowngrade ? "Downgrade" : "Upgrade"}
                    </button>
                    {isDowngrade && (
                      <p className="text-[11px] mt-2 text-center" style={{ color: "var(--warning)" }}>
                        Downgrading may reduce your available features and limits
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
