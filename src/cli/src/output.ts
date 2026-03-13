import chalk from "chalk";

export let jsonMode = false;

export function setJsonMode(enabled: boolean): void {
  jsonMode = enabled;
}

export function outputJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export function printTable(
  headers: string[],
  rows: string[][],
  widths?: number[]
): void {
  if (jsonMode) {
    const objects = rows.map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] ?? "";
      });
      return obj;
    });
    outputJson(objects);
    return;
  }

  const colWidths =
    widths ??
    headers.map((h, i) => {
      const maxContent = Math.max(
        h.length,
        ...rows.map((r) => (r[i] ?? "").length)
      );
      return Math.min(maxContent + 2, 40);
    });

  const headerLine = headers
    .map((h, i) => chalk.dim(h.toUpperCase().padEnd(colWidths[i])))
    .join("  ");
  console.log(headerLine);
  console.log(chalk.dim("─".repeat(headerLine.length)));

  for (const row of rows) {
    const line = row
      .map((cell, i) => {
        const truncated =
          cell.length > colWidths[i] - 1
            ? cell.slice(0, colWidths[i] - 3) + "…"
            : cell;
        return truncated.padEnd(colWidths[i]);
      })
      .join("  ");
    console.log(line);
  }

  if (rows.length === 0) {
    console.log(chalk.dim("  No results"));
  }
}

export function colorDecision(decision: string): string {
  switch (decision) {
    case "allow":
      return chalk.green("ALLOW");
    case "deny":
      return chalk.red("DENY");
    case "escalate":
      return chalk.yellow("ESCALATE");
    default:
      return decision;
  }
}

export function colorSeverity(severity: string): string {
  switch (severity) {
    case "critical":
      return chalk.bgRed.white(" CRITICAL ");
    case "high":
      return chalk.red(severity);
    case "medium":
      return chalk.yellow(severity);
    case "low":
      return chalk.dim(severity);
    default:
      return severity;
  }
}

export function colorStatus(status: string): string {
  switch (status) {
    case "active":
      return chalk.green(status);
    case "suspended":
      return chalk.yellow(status);
    case "revoked":
      return chalk.red(status);
    default:
      return status;
  }
}
