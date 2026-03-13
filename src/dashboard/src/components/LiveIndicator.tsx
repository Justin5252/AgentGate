"use client";

interface LiveIndicatorProps {
  connected: boolean;
}

export function LiveIndicator({ connected }: LiveIndicatorProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span
        className="w-2 h-2 rounded-full"
        style={{
          background: connected ? "#06D6A0" : "var(--text-muted)",
          boxShadow: connected ? "0 0 6px rgba(6, 214, 160, 0.5)" : "none",
          animation: connected ? "pulse 2s infinite" : "none",
        }}
      />
      <span style={{ color: connected ? "#06D6A0" : "var(--text-muted)" }}>
        {connected ? "Live" : "Connecting..."}
      </span>
    </span>
  );
}
