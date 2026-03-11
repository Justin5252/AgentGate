"use client";

import { useState } from "react";
import { MethodBadge } from "./MethodBadge";

export interface EndpointProps {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  description: string;
  children?: React.ReactNode;
}

export function EndpointCard({ method, path, description, children }: EndpointProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden my-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <MethodBadge method={method} />
        <code className="text-sm font-medium" style={{ color: "var(--text-primary)", fontFamily: "'SF Mono', Menlo, monospace" }}>
          {path}
        </code>
        <span className="flex-1 text-sm truncate" style={{ color: "var(--text-muted)" }}>{description}</span>
        <svg
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          style={{ color: "var(--text-muted)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {expanded && children && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}
