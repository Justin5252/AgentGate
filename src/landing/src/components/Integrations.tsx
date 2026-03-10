"use client";

const integrations = [
  "LangChain",
  "CrewAI",
  "AutoGen",
  "OpenAI",
  "Anthropic",
  "AWS",
  "Azure",
  "Okta",
];

export default function Integrations() {
  return (
    <section
      className="px-6 py-24"
      style={{ background: "var(--bg-card)" }}
    >
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
          Works With{" "}
          <span className="gradient-text">Your Stack</span>
        </h2>
        <p
          className="mx-auto mb-12 max-w-lg text-base"
          style={{ color: "var(--text-secondary)" }}
        >
          Drop-in integrations with the platforms and frameworks your agents
          already use.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {integrations.map((name) => (
            <div
              key={name}
              className="rounded-full border px-5 py-2.5 text-sm font-medium transition-all hover:border-blue-500/40 hover:shadow-sm"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
                background: "var(--bg-primary)",
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
