"use client";

import { useState } from "react";
import { DocsSidebar } from "./DocsSidebar";

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"} />
        </svg>
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/60" onClick={() => setMobileOpen(false)} />
      )}

      <DocsSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="flex-1 ml-0 md:ml-64 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12 md:px-12">
          {children}
        </div>
      </main>
    </div>
  );
}
