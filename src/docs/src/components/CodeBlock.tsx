"use client";

import { useState } from "react";
import { CopyButton } from "./CopyButton";

export interface CodeTab {
  label: string;
  language: string;
  code: string;
  content: React.ReactNode;
}

const tabColors: Record<string, string> = {
  typescript: "var(--blue)",
  python: "var(--teal)",
  go: "#00ADD8",
  curl: "#F59E0B",
  bash: "#F59E0B",
  json: "var(--text-secondary)",
  yaml: "#CB171E",
};

export function CodeBlock({ tabs }: { tabs: CodeTab[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTab = tabs[activeIndex];
  const color = tabColors[activeTab.language] || "var(--blue)";

  return (
    <div className="rounded-xl overflow-hidden my-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      {/* Tabs */}
      <div className="flex items-center justify-between border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex">
          {tabs.map((tab, i) => {
            const isActive = i === activeIndex;
            const c = tabColors[tab.language] || "var(--blue)";
            return (
              <button
                key={tab.label}
                onClick={() => setActiveIndex(i)}
                className="px-5 py-3 text-sm font-medium transition-colors"
                style={{
                  color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                  borderBottom: isActive ? `2px solid ${c}` : "2px solid transparent",
                  background: isActive ? `${c}10` : "transparent",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="pr-3">
          <CopyButton text={activeTab.code} />
        </div>
      </div>

      {/* Code content */}
      <pre
        className="overflow-x-auto p-6 text-sm leading-relaxed"
        style={{ fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, 'Courier New', monospace" }}
      >
        {activeTab.content}
      </pre>
    </div>
  );
}
