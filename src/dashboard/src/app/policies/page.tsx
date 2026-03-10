"use client";

import { useEffect, useState } from "react";
import type { Policy } from "@agentgate/shared";
import { fetchPolicies } from "@/lib/api";
import { mockPolicies } from "@/lib/mock-data";
import { PolicyTable, PolicyTableSkeleton } from "@/components/PolicyTable";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies()
      .then(setPolicies)
      .catch(() => setPolicies(mockPolicies))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Policies
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Define access control rules for your agents
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:opacity-90"
          style={{
            background: "var(--teal)",
            color: "white",
            boxShadow: "0 0 12px rgba(6, 214, 160, 0.3)",
          }}
        >
          Create Policy
        </button>
      </div>

      {/* Table */}
      {loading ? <PolicyTableSkeleton /> : <PolicyTable policies={policies} />}
    </div>
  );
}
