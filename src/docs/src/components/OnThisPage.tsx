"use client";

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

export function OnThisPage({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="hidden xl:block fixed right-8 top-24 w-56">
      <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
        On this page
      </h4>
      <nav className="space-y-1">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="block text-sm transition-colors hover:text-white"
            style={{
              color: "var(--text-muted)",
              paddingLeft: item.level > 2 ? `${(item.level - 2) * 12}px` : undefined,
            }}
          >
            {item.title}
          </a>
        ))}
      </nav>
    </div>
  );
}
