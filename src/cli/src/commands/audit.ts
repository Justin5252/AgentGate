import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { requireConfig } from "../config.js";
import { ApiClient } from "../client.js";
import { printTable, colorDecision, jsonMode, outputJson } from "../output.js";

export const auditCommand = new Command("audit")
  .description("View authorization audit log")
  .option("--agent <agentId>", "Filter by agent ID")
  .option("--decision <decision>", "Filter by decision (allow, deny, escalate)")
  .option("--limit <n>", "Max results", "20")
  .action(async (opts) => {
    const config = requireConfig();
    const client = new ApiClient(config);
    const spinner = ora("Fetching audit log...").start();

    try {
      const params = new URLSearchParams();
      if (opts.agent) params.set("agentId", opts.agent);
      if (opts.decision) params.set("decision", opts.decision);
      params.set("limit", opts.limit);
      const qs = params.toString() ? `?${params.toString()}` : "";

      const entries = await client.get<any[]>(`/api/v1/audit${qs}`);
      spinner.stop();

      if (jsonMode) {
        outputJson(entries);
        return;
      }

      printTable(
        ["Time", "Agent", "Action", "Resource", "Decision", "Duration"],
        entries.map((e) => [
          new Date(e.timestamp).toLocaleTimeString(),
          (e.agentId ?? "").slice(0, 8) + "...",
          e.action,
          e.resource.length > 25 ? e.resource.slice(0, 23) + "…" : e.resource,
          colorDecision(e.decision),
          `${e.durationMs ?? "?"}ms`,
        ])
      );
      console.log(chalk.dim(`\n  ${entries.length} entries\n`));
    } catch (err) {
      spinner.fail("Failed to fetch audit log");
      console.error(
        chalk.red(err instanceof Error ? err.message : String(err))
      );
    }
  });
