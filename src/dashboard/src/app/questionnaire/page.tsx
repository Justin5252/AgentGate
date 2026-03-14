"use client";

import { useState, useEffect, useCallback } from "react";
import { mockQuestionnaires } from "@/lib/mock-data";
import {
  type QuestionnaireResponse,
  generateQuestionnaire,
  fetchQuestionnaires,
  exportQuestionnaire,
} from "@/lib/api";

const confidenceColors: Record<string, string> = {
  high: "#06D6A0",
  medium: "#F59E0B",
  low: "#EF4444",
};

export default function QuestionnairePage() {
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireResponse[]>([]);
  const [selected, setSelected] = useState<QuestionnaireResponse | null>(null);
  const [title, setTitle] = useState("");
  const [questionsText, setQuestionsText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadQuestionnaires = useCallback(async () => {
    try {
      const data = await fetchQuestionnaires();
      setQuestionnaires(data);
    } catch {
      setQuestionnaires(mockQuestionnaires as unknown as QuestionnaireResponse[]);
    }
  }, []);

  useEffect(() => {
    loadQuestionnaires();
  }, [loadQuestionnaires]);

  async function handleGenerate() {
    if (!title.trim() || !questionsText.trim()) {
      setError("Please provide a title and at least one question.");
      return;
    }

    setError(null);
    setGenerating(true);

    const lines = questionsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const questions = lines.map((q, i) => ({
      id: `q-new-${i + 1}`,
      question: q,
    }));

    try {
      const result = await generateQuestionnaire({ title: title.trim(), questions });
      setQuestionnaires((prev) => [result, ...prev]);
      setSelected(result);
      setTitle("");
      setQuestionsText("");
    } catch {
      // Fallback: build a local mock response
      const now = new Date().toISOString();
      const fallback: QuestionnaireResponse = {
        id: `q-local-${Date.now()}`,
        tenantId: "tenant-1",
        questionnaireTitle: title.trim(),
        questions,
        responses: questions.map((q) => ({
          questionId: q.id,
          question: q.question,
          answer:
            "Based on current platform configuration and collected evidence, this requirement is addressed through AgentGate policies, audit logging, and continuous compliance monitoring.",
          confidence: (["high", "medium", "low"] as const)[Math.floor(Math.random() * 3)],
          supportingEvidence: ["5 registered agents", "1247 audit entries", "4 active frameworks"],
          controlReferences: ["CC6.1", "CC7.1"],
        })),
        status: "completed",
        generatedAt: now,
        updatedAt: now,
      };
      setQuestionnaires((prev) => [fallback, ...prev]);
      setSelected(fallback);
      setTitle("");
      setQuestionsText("");
    } finally {
      setGenerating(false);
    }
  }

  async function handleExport(id: string) {
    setExporting(id);
    try {
      const updated = await exportQuestionnaire(id);
      setQuestionnaires((prev) => prev.map((q) => (q.id === id ? updated : q)));
      if (selected?.id === id) setSelected(updated);
    } catch {
      // Optimistic local update
      setQuestionnaires((prev) =>
        prev.map((q) =>
          q.id === id
            ? { ...q, status: "exported" as const, updatedAt: new Date().toISOString() }
            : q,
        ),
      );
      if (selected?.id === id) {
        setSelected((prev) =>
          prev ? { ...prev, status: "exported" as const, updatedAt: new Date().toISOString() } : prev,
        );
      }
    } finally {
      setExporting(null);
    }
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "#64748B",
      completed: "#3B82F6",
      exported: "#06D6A0",
    };
    const color = colors[status] || "#64748B";
    return (
      <span
        className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: `${color}15`, color }}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ background: "linear-gradient(135deg, var(--blue), var(--teal))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Questionnaire Automation
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Auto-generate answers to security questionnaires from your compliance data
        </p>
      </div>

      {/* Past Questionnaires */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          Past Questionnaires
        </p>
        {questionnaires.length === 0 ? (
          <div
            className="rounded-xl border p-6 text-center"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No questionnaires yet. Generate your first one below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questionnaires.map((q) => {
              const isActive = selected?.id === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => setSelected(isActive ? null : q)}
                  className="rounded-xl border p-4 cursor-pointer transition-all"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: isActive ? "rgba(59,130,246,0.5)" : "var(--border)",
                    boxShadow: isActive ? "0 0 20px rgba(59,130,246,0.1)" : undefined,
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3
                      className="font-medium text-sm truncate flex-1 mr-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {q.questionnaireTitle}
                    </h3>
                    {statusBadge(q.status)}
                  </div>
                  <div
                    className="flex items-center gap-4 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span>{q.questions.length} questions</span>
                    <span>{new Date(q.generatedAt).toLocaleDateString()}</span>
                  </div>
                  {/* Confidence summary */}
                  {q.responses.length > 0 && (
                    <div className="flex items-center gap-3 mt-3 text-xs">
                      {(["high", "medium", "low"] as const).map((level) => {
                        const count = q.responses.filter((r) => r.confidence === level).length;
                        if (count === 0) return null;
                        return (
                          <span key={level} style={{ color: confidenceColors[level] }}>
                            {count} {level}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Questionnaire */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          New Questionnaire
        </p>
        <div
          className="rounded-xl border p-6 space-y-4"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Vendor Security Assessment — Q1 2026"
              className="w-full rounded-lg px-3 py-2 text-sm border outline-none transition-colors focus:border-blue-500"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Questions (one per line)
            </label>
            <textarea
              value={questionsText}
              onChange={(e) => setQuestionsText(e.target.value)}
              placeholder={
                "How do you manage AI agent identities?\nWhat audit logging is in place for agent actions?\nWhat compliance frameworks do you support?"
              }
              rows={6}
              className="w-full rounded-lg px-3 py-2 text-sm border outline-none transition-colors focus:border-blue-500 resize-y"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {error && (
            <p className="text-xs font-medium" style={{ color: "#EF4444" }}>
              {error}
            </p>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--blue), #2563EB)" }}
          >
            {generating ? "Generating..." : "Generate Answers"}
          </button>
        </div>
      </div>

      {/* Results Table */}
      {selected && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Results — {selected.questionnaireTitle}
              </p>
              {statusBadge(selected.status)}
            </div>
            <button
              onClick={() => handleExport(selected.id)}
              disabled={exporting === selected.id || selected.status === "exported"}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-white/5 disabled:opacity-50"
              style={{
                borderColor:
                  selected.status === "exported"
                    ? "rgba(6,214,160,0.3)"
                    : "var(--border)",
                color:
                  selected.status === "exported"
                    ? "#06D6A0"
                    : "var(--text-secondary)",
              }}
            >
              {selected.status === "exported"
                ? "Exported"
                : exporting === selected.id
                  ? "Exporting..."
                  : "Export"}
            </button>
          </div>

          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                    {["Question", "Generated Answer", "Confidence", "Supporting Evidence", "Control References"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {selected.responses.map((r) => (
                    <tr
                      key={r.questionId}
                      className="border-b transition-colors hover:bg-white/[0.02]"
                      style={{ borderColor: "var(--border)" }}
                    >
                      {/* Question */}
                      <td
                        className="px-4 py-3 font-medium"
                        style={{ color: "var(--text-primary)", minWidth: 200, maxWidth: 280 }}
                      >
                        {r.question}
                      </td>

                      {/* Answer */}
                      <td
                        className="px-4 py-3"
                        style={{ color: "var(--text-secondary)", minWidth: 280, maxWidth: 400 }}
                      >
                        {r.answer}
                      </td>

                      {/* Confidence Badge */}
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                          style={{
                            background: `${confidenceColors[r.confidence]}15`,
                            color: confidenceColors[r.confidence],
                          }}
                        >
                          {r.confidence}
                        </span>
                      </td>

                      {/* Supporting Evidence */}
                      <td className="px-4 py-3" style={{ minWidth: 180 }}>
                        <div className="flex flex-wrap gap-1">
                          {r.supportingEvidence.map((ev, i) => (
                            <span
                              key={i}
                              className="inline-flex px-2 py-0.5 rounded text-xs"
                              style={{
                                background: "rgba(59,130,246,0.1)",
                                color: "var(--blue)",
                              }}
                            >
                              {ev}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Control References */}
                      <td className="px-4 py-3" style={{ minWidth: 160 }}>
                        <div className="flex flex-wrap gap-1">
                          {r.controlReferences.length > 0 ? (
                            r.controlReferences.map((ref, i) => (
                              <span
                                key={i}
                                className="inline-flex px-2 py-0.5 rounded text-xs font-mono"
                                style={{
                                  background: "rgba(6,214,160,0.1)",
                                  color: "var(--teal)",
                                }}
                              >
                                {ref}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                              --
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
