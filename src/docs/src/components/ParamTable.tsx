export interface Param {
  name: string;
  type: string;
  required?: boolean;
  description: string;
}

export function ParamTable({ title, params }: { title?: string; params: Param[] }) {
  return (
    <div className="my-4">
      {title && <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{title}</h4>}
      <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--bg-card-hover)" }}>
              <th className="text-left px-4 py-2 font-medium" style={{ color: "var(--text-secondary)" }}>Name</th>
              <th className="text-left px-4 py-2 font-medium" style={{ color: "var(--text-secondary)" }}>Type</th>
              <th className="text-left px-4 py-2 font-medium" style={{ color: "var(--text-secondary)" }}>Required</th>
              <th className="text-left px-4 py-2 font-medium" style={{ color: "var(--text-secondary)" }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {params.map((p) => (
              <tr key={p.name} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="px-4 py-2 font-mono text-xs" style={{ color: "var(--blue)" }}>{p.name}</td>
                <td className="px-4 py-2 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{p.type}</td>
                <td className="px-4 py-2">
                  {p.required ? (
                    <span className="text-xs font-medium" style={{ color: "var(--teal)" }}>Required</span>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Optional</span>
                  )}
                </td>
                <td className="px-4 py-2" style={{ color: "var(--text-secondary)" }}>{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
