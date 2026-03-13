"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";

type ToastSeverity = "info" | "success" | "warning" | "error";

interface Toast {
  id: string;
  message: string;
  severity: ToastSeverity;
  createdAt: number;
}

interface ToastContextValue {
  addToast: (message: string, severity?: ToastSeverity) => void;
}

const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const severityColors: Record<ToastSeverity, { bg: string; border: string; text: string }> = {
  info: { bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.4)", text: "#3B82F6" },
  success: { bg: "rgba(6, 214, 160, 0.12)", border: "rgba(6, 214, 160, 0.4)", text: "#06D6A0" },
  warning: { bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.4)", text: "#F59E0B" },
  error: { bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.4)", text: "#EF4444" },
};

const severityIcons: Record<ToastSeverity, string> = {
  info: "ℹ",
  success: "✓",
  warning: "⚠",
  error: "✕",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const colors = severityColors[toast.severity];

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm animate-slide-up"
      style={{
        background: "var(--bg-card)",
        borderColor: colors.border,
        backdropFilter: "blur(8px)",
      }}
    >
      <span
        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ background: colors.bg, color: colors.text }}
      >
        {severityIcons[toast.severity]}
      </span>
      <p className="text-sm flex-1" style={{ color: "var(--text-primary)" }}>
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        ✕
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((message: string, severity: ToastSeverity = "info") => {
    counterRef.current++;
    const toast: Toast = {
      id: `toast-${counterRef.current}`,
      message,
      severity,
      createdAt: Date.now(),
    };
    setToasts((prev) => [...prev.slice(-4), toast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container — fixed bottom-right */}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
          style={{ pointerEvents: "auto" }}
        >
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
