"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100";

function AuditorLandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    async function validate() {
      const token = searchParams.get("token");
      if (!token?.startsWith("aud_")) {
        setError("Invalid or missing auditor token.");
        setValidating(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/v1/auditor/portal/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          localStorage.setItem("auditor_token", token);
          router.replace("/auditor/compliance");
        } else {
          const body = await res.json().catch(() => null);
          setError(body?.error?.message ?? "Token is invalid, expired, or revoked.");
        }
      } catch {
        setError("Failed to validate token. Please try again.");
      }
      setValidating(false);
    }

    validate();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        {validating ? (
          <>
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "var(--blue)", borderTopColor: "transparent" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Validating auditor access...</p>
          </>
        ) : error ? (
          <>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239,68,68,0.1)" }}>
              <svg className="w-6 h-6" style={{ color: "#EF4444" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Access Denied</h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{error}</p>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function AuditorLandingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--blue)", borderTopColor: "transparent" }} />
        </div>
      }
    >
      <AuditorLandingContent />
    </Suspense>
  );
}
