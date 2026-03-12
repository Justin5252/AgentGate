"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AuditorProfile {
  id: string;
  email: string;
  name: string;
  tenantName: string;
  frameworkScopes: string[];
  expiresAt: string;
}

interface AuthContextValue {
  mode: "admin" | "auditor";
  auditorToken: string | null;
  auditorProfile: AuditorProfile | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  mode: "admin",
  auditorToken: null,
  auditorProfile: null,
  loading: false,
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"admin" | "auditor">("admin");
  const [auditorToken, setAuditorToken] = useState<string | null>(null);
  const [auditorProfile, setAuditorProfile] = useState<AuditorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      // Check URL for token
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      let token = params.get("token");

      if (token?.startsWith("aud_")) {
        localStorage.setItem("auditor_token", token);
      } else {
        token = localStorage.getItem("auditor_token");
      }

      if (!token?.startsWith("aud_")) {
        setMode("admin");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/v1/auditor/portal/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setAuditorToken(token);
          setAuditorProfile(json.data);
          setMode("auditor");
        } else {
          localStorage.removeItem("auditor_token");
          setMode("admin");
        }
      } catch {
        localStorage.removeItem("auditor_token");
        setMode("admin");
      }

      setLoading(false);
    }

    check();
  }, []);

  function logout() {
    localStorage.removeItem("auditor_token");
    setAuditorToken(null);
    setAuditorProfile(null);
    setMode("admin");
    window.location.href = "/";
  }

  return (
    <AuthContext.Provider value={{ mode, auditorToken, auditorProfile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
