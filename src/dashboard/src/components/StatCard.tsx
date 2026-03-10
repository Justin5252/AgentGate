"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  color?: "blue" | "teal" | "red" | "yellow";
}

const colorMap = {
  blue: "var(--blue)",
  teal: "var(--teal)",
  red: "var(--danger)",
  yellow: "var(--warning)",
};

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  color = "blue",
}: StatCardProps) {
  const accentColor = colorMap[color];

  return (
    <div
      className="relative rounded-xl p-5 border transition-all duration-200 group overflow-hidden"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentColor;
        e.currentTarget.style.boxShadow = `0 0 20px ${accentColor}15`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ background: accentColor }}
      />

      <div className="pl-3">
        <p
          className="text-xs font-medium uppercase tracking-wider mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          {title}
        </p>
        <div className="flex items-end gap-2">
          <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
            {value}
          </p>
          {trend && (
            <span
              className="text-xs font-medium mb-1"
              style={{
                color:
                  trend === "up"
                    ? "var(--teal)"
                    : trend === "down"
                    ? "var(--danger)"
                    : "var(--text-muted)",
              }}
            >
              {trend === "up" ? "\u2191" : trend === "down" ? "\u2193" : "\u2192"}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div
      className="relative rounded-xl p-5 border"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl skeleton" />
      <div className="pl-3 space-y-3">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-7 w-16" />
        <div className="skeleton h-3 w-32" />
      </div>
    </div>
  );
}
