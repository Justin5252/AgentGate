"use client";

import GlowCard from "./GlowCard";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "For testing and small projects",
    features: [
      "5 agents",
      "10K evaluations/mo",
      "Community support",
      "JS & Python SDKs",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$499",
    period: "/mo",
    description: "For teams running agents in production",
    features: [
      "Unlimited agents",
      "1M evaluations/mo",
      "All integrations",
      "Anomaly detection",
      "Email support",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For regulated industries at scale",
    features: [
      "On-premise deployment",
      "SSO / SAML",
      "Custom SLAs",
      "Dedicated CSM",
      "Compliance module",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
          Start Free,{" "}
          <span className="gradient-text">Scale When Ready</span>
        </h2>
        <p
          className="mx-auto mb-14 max-w-lg text-center text-base"
          style={{ color: "var(--text-secondary)" }}
        >
          Transparent pricing that grows with your agent fleet.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <GlowCard
              key={plan.name}
              className={`flex flex-col ${
                plan.popular
                  ? "ring-2 ring-blue-500/40"
                  : ""
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div
                  className="mb-4 inline-flex self-start rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--blue), var(--teal))",
                    color: "white",
                  }}
                >
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p
                className="mb-4 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                {plan.description}
              </p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  {plan.price}
                </span>
                <span style={{ color: "var(--text-muted)" }}>
                  {plan.period}
                </span>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--teal)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className="block rounded-lg py-3 text-center text-sm font-semibold transition-all hover:opacity-90"
                style={
                  plan.popular
                    ? {
                        background:
                          "linear-gradient(135deg, var(--blue), #2563EB)",
                        color: "white",
                        boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
                      }
                    : {
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                        background: "transparent",
                      }
                }
              >
                {plan.cta}
              </a>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  );
}
