"use client";

import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: "rgba(5, 10, 21, 0.85)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-white text-sm"
            style={{
              background: "linear-gradient(135deg, var(--blue), var(--teal))",
            }}
          >
            AG
          </div>
          <span className="text-lg font-bold text-white">AgentGate</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm transition-colors hover:text-white"
            style={{ color: "var(--text-secondary)" }}
          >
            Features
          </a>
          <a
            href="#compliance"
            className="text-sm transition-colors hover:text-white"
            style={{ color: "var(--text-secondary)" }}
          >
            Compliance
          </a>
          <a
            href="#pricing"
            className="text-sm transition-colors hover:text-white"
            style={{ color: "var(--text-secondary)" }}
          >
            Pricing
          </a>
          <a
            href="#"
            className="text-sm transition-colors hover:text-white"
            style={{ color: "var(--text-secondary)" }}
          >
            Docs
          </a>
          <a
            href="#"
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, var(--blue), #2563EB)",
            }}
          >
            Get Started
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="border-t px-6 py-4 md:hidden"
          style={{
            background: "var(--bg-primary)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex flex-col gap-4">
            <a
              href="#features"
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <a
              href="#compliance"
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setMobileOpen(false)}
            >
              Compliance
            </a>
            <a
              href="#pricing"
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </a>
            <a
              href="#"
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setMobileOpen(false)}
            >
              Docs
            </a>
            <a
              href="#"
              className="rounded-lg px-4 py-2 text-center text-sm font-medium text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--blue), #2563EB)",
              }}
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
