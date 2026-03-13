import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { requireConfig } from "../config.js";
import { ApiClient } from "../client.js";
import { printTable, colorStatus, jsonMode, outputJson } from "../output.js";

export const agentsCommand = new Command("agents")
  .description("Manage AI agent identities");

agentsCommand
  .command("list")
  .description("List all registered agents")
  .option("--status <status>", "Filter by status (active, suspended, revoked)")
  .option("--owner <ownerId>", "Filter by owner ID")
  .option("--limit <n>", "Max results", "50")
  .action(async (opts) => {
    const config = requireConfig();
    const client = new ApiClient(config);
    const spinner = ora("Fetching agents...").start();

    try {
      const params = new URLSearchParams();
      if (opts.status) params.set("status", opts.status);
      if (opts.owner) params.set("ownerId", opts.owner);
      params.set("limit", opts.limit);
      const qs = params.toString() ? `?${params.toString()}` : "";

      const agents = await client.get<any[]>(`/api/v1/agents${qs}`);
      spinner.stop();

      if (jsonMode) {
        outputJson(agents);
        return;
      }

      printTable(
        ["ID", "Name", "Status", "Risk", "Owner", "Last Active"],
        agents.map((a) => [
          a.id.slice(0, 8) + "...",
          a.name,
          colorStatus(a.status),
          a.riskLevel,
          a.ownerId,
          a.lastActiveAt
            ? new Date(a.lastActiveAt).toLocaleDateString()
            : "Never",
        ])
      );
      console.log(chalk.dim(`\n  ${agents.length} agent(s)\n`));
    } catch (err) {
      spinner.fail("Failed to fetch agents");
      console.error(
        chalk.red(err instanceof Error ? err.message : String(err))
      );
    }
  });

agentsCommand
  .command("create")
  .description("Register a new agent")
  .requiredOption("--name <name>", "Agent name")
  .requiredOption("--description <desc>", "Agent description")
  .requiredOption("--owner <ownerId>", "Owner ID")
  .option("--risk <level>", "Risk level (low, medium, high, critical)", "medium")
  .option("--capabilities <caps>", "Comma-separated capabilities")
  .action(async (opts) => {
    const config = requireConfig();
    const client = new ApiClient(config);
    const spinner = ora("Registering agent...").start();

    try {
      const data: Record<string, unknown> = {
        name: opts.name,
        description: opts.description,
        ownerId: opts.owner,
        riskLevel: opts.risk,
      };
      if (opts.capabilities) {
        data.capabilities = opts.capabilities
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }

      const agent = await client.post<any>("/api/v1/agents", data);
      spinner.succeed(`Agent registered: ${chalk.bold(agent.name)}`);

      if (jsonMode) {
        outputJson(agent);
        return;
      }

      console.log(`  ${chalk.dim("ID:")}     ${agent.id}`);
      console.log(`  ${chalk.dim("Status:")} ${colorStatus(agent.status)}`);
      console.log(`  ${chalk.dim("Risk:")}   ${agent.riskLevel}`);
    } catch (err) {
      spinner.fail("Failed to register agent");
      console.error(
        chalk.red(err instanceof Error ? err.message : String(err))
      );
    }
  });

agentsCommand
  .command("get <id>")
  .description("Get agent details by ID")
  .action(async (id) => {
    const config = requireConfig();
    const client = new ApiClient(config);
    const spinner = ora("Fetching agent...").start();

    try {
      const agent = await client.get<any>(`/api/v1/agents/${id}`);
      spinner.stop();

      if (jsonMode) {
        outputJson(agent);
        return;
      }

      console.log();
      console.log(`  ${chalk.bold(agent.name)}`);
      console.log(`  ${chalk.dim("ID:")}           ${agent.id}`);
      console.log(`  ${chalk.dim("Status:")}       ${colorStatus(agent.status)}`);
      console.log(`  ${chalk.dim("Risk:")}         ${agent.riskLevel}`);
      console.log(`  ${chalk.dim("Owner:")}        ${agent.ownerId}`);
      console.log(`  ${chalk.dim("Description:")}  ${agent.description}`);
      console.log(
        `  ${chalk.dim("Capabilities:")} ${(agent.capabilities ?? []).join(", ") || "none"}`
      );
      console.log(
        `  ${chalk.dim("Created:")}      ${new Date(agent.createdAt).toLocaleString()}`
      );
      console.log(
        `  ${chalk.dim("Last Active:")}  ${agent.lastActiveAt ? new Date(agent.lastActiveAt).toLocaleString() : "Never"}`
      );
      console.log();
    } catch (err) {
      spinner.fail("Failed to fetch agent");
      console.error(
        chalk.red(err instanceof Error ? err.message : String(err))
      );
    }
  });

agentsCommand
  .command("delete <id>")
  .description("Revoke an agent (soft delete)")
  .action(async (id) => {
    const config = requireConfig();
    const client = new ApiClient(config);
    const spinner = ora("Revoking agent...").start();

    try {
      await client.del(`/api/v1/agents/${id}`);
      spinner.succeed(`Agent ${chalk.dim(id)} revoked`);
    } catch (err) {
      spinner.fail("Failed to revoke agent");
      console.error(
        chalk.red(err instanceof Error ? err.message : String(err))
      );
    }
  });
