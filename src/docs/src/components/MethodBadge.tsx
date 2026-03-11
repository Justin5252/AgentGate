const colors: Record<string, { bg: string; text: string }> = {
  GET: { bg: "rgba(34, 197, 94, 0.15)", text: "#22C55E" },
  POST: { bg: "rgba(59, 130, 246, 0.15)", text: "#3B82F6" },
  PATCH: { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B" },
  PUT: { bg: "rgba(168, 85, 247, 0.15)", text: "#A855F7" },
  DELETE: { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444" },
};

export function MethodBadge({ method }: { method: string }) {
  const { bg, text } = colors[method] || colors.GET;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono shrink-0"
      style={{ background: bg, color: text }}
    >
      {method}
    </span>
  );
}
