const variants = {
  info: { bg: "rgba(59, 130, 246, 0.08)", border: "rgba(59, 130, 246, 0.3)", icon: "\u2139", color: "#3B82F6" },
  warning: { bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.3)", icon: "\u26A0", color: "#F59E0B" },
  tip: { bg: "rgba(6, 214, 160, 0.08)", border: "rgba(6, 214, 160, 0.3)", icon: "\uD83D\uDCA1", color: "#06D6A0" },
  danger: { bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.3)", icon: "\uD83D\uDEA8", color: "#EF4444" },
};

export function Callout({ type = "info", title, children }: { type?: keyof typeof variants; title?: string; children: React.ReactNode }) {
  const v = variants[type];
  return (
    <div className="rounded-xl px-5 py-4 my-6" style={{ background: v.bg, border: `1px solid ${v.border}` }}>
      {title && (
        <div className="flex items-center gap-2 mb-2">
          <span>{v.icon}</span>
          <span className="text-sm font-semibold" style={{ color: v.color }}>{title}</span>
        </div>
      )}
      <div className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{children}</div>
    </div>
  );
}
