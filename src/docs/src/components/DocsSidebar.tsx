"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { navigation, type NavItem } from "@/lib/navigation";

export function DocsSidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isSectionActive = (item: NavItem) => {
    if (isActive(item.href)) return true;
    return item.children?.some((child) => isActive(child.href)) ?? false;
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-full w-64 flex flex-col border-r overflow-y-auto transition-transform duration-200 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      {/* Logo */}
      <a href="/" className="flex items-center gap-3 px-5 py-6 border-b transition-opacity hover:opacity-80" style={{ borderColor: "var(--border)" }}>
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{ background: "linear-gradient(135deg, var(--blue), var(--teal))" }}
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            AgentGate
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Documentation</p>
        </div>
      </a>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavSection key={item.href} item={item} pathname={pathname} isActive={isActive} isSectionActive={isSectionActive} onClose={onClose} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>AgentGate v0.1.0</p>
      </div>
    </aside>
  );
}

function NavSection({
  item,
  pathname,
  isActive,
  isSectionActive,
  onClose,
}: {
  item: NavItem;
  pathname: string;
  isActive: (href: string) => boolean;
  isSectionActive: (item: NavItem) => boolean;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sectionActive = isSectionActive(item);

  useEffect(() => {
    if (sectionActive && item.children) setExpanded(true);
  }, [sectionActive, item.children]);

  if (!item.children) {
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        onClick={onClose}
        className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
        style={{
          background: active ? "rgba(59, 130, 246, 0.12)" : undefined,
          color: active ? "var(--blue)" : "var(--text-secondary)",
          borderLeft: active ? "2px solid var(--blue)" : "2px solid transparent",
        }}
      >
        {item.title}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:bg-white/[0.03]"
        style={{ color: sectionActive ? "var(--text-primary)" : "var(--text-secondary)" }}
      >
        {item.title}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
      {expanded && (
        <div className="ml-3 mt-1 space-y-1 border-l" style={{ borderColor: "var(--border)" }}>
          {item.children.map((child) => {
            const active = isActive(child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onClose}
                className="flex items-center pl-4 pr-3 py-1.5 text-sm transition-all duration-150"
                style={{
                  color: active ? "var(--blue)" : "var(--text-muted)",
                  fontWeight: active ? 500 : 400,
                  borderLeft: active ? "2px solid var(--blue)" : "2px solid transparent",
                  marginLeft: "-1px",
                }}
              >
                {child.title}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
