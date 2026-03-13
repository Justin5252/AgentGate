import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { readFileSync } from "node:fs";
import { requireConfig } from "../config.js";
import { ApiClient } from "../client.js";
import { printTable, jsonMode, outputJson } from "../output.js";

export const policiesCommand = new Command("policies")
  .description("Manage authorization policies");

policiesCommand
  .command("list")
  .description("List all policies")
  .option("--limit <n>", "Max results", "50")
  .action(async (opts) => {
    const config = requireConfig();
    const client = new ApiClient(config);
    const spinner = ora("Fetching policies...").start();

    try {
      const policies = await client.get<any[]>(
        `/api/v1/policies?limit=${opts.limit}`
      );
      spinner.stop();

      if (jsonMode) {
        outputJson(policies);
        return;
      }

      printTable(
        ["ID", "Name", "Rules", "Enabled", "Version", "Updated"],
        policies.map((p) => [
          p.id.slice(0, 12),
          p.name,
          String(p.rules?.length ?? 0),
          p.enabled ? chalk.green("on") : chalk.red("off"),
          `v${p.version}`,
          new Date(p.updatedAt).toLocaleDateString(),
        ])
      );
      console.log(chalk.dim(`\n  ${policies.length} policy(ies)\n`));
    } catch (err) {
      spinner.fail("Failed to fetch policies");
      console.error(
        chalk.red(err instanceof Error ? err.message : String(err))
      );
    }
  });

policiesCommand
  .command("create")
  .description("Create a new policy")
  .requiredOption("--name <name>", "Policy name")
  .requiredOption("--description <desc>", "Policy description")
  .option("--rules-file <path>", "JSON file with rules array")
  .option("--enabled", "Enable policy immediately", true)
  .action(async (opts) => {
    const config = requireConfig();
    const client = new ApiClient(config);
    const spinner = ora("Creating policy...").start();

    try {
      let rules: unknown[] = [];
      if (opts.rulesFile) {
        const raw = readFileSync(opts.rulesFile, "utf-8");
        rules = JSON.parse(raw);
      }

      const data = {
        name: opts.name,
        description: opts.description,
        rules,
        targets: { actions: ["*"], resources: ["*"] },
        enabled: opts.enabled,
      };

      const policy = await client.post<any>("/api/v1/policies", data);
      spinner.succeed(`Policy created: ${chalk.bold(policy.name)}`);

      if (jsonMode) {
        outputJson(policy);
        return;
      }

      console.log(`  ${chalk.dim("ID:")}      ${policy.id}`);
      console.log(`  ${chalk.dim("Version:")} v${policy.version}`);
      console.log(`  ${chalk.dim("Rules:")}   ${policy.rules?.length ?? 0}`);
      console.log(
        `  ${chalk.dim("Enabled:")} ${policy.enabled ? chalk.green("yes") : chalk.red("no")}`
      );
    } catch (err) {
      spinner.fail("Failed to create policy");
      console.error(
        chalk.red(err instanceof Error ? err.message : String(err))
      );
    }
  });

policiesCommand
  .command("get <id>")
  .description("Get policy details by ID")
  .action(async (id) => {
    const config = requireConfig();
    const client = new ApiClient(config);
    const spinner = ora("Fetching policy...").start();

    try {
      const policy = await client.get<any>(`/api/v1/policies/${id}`);
      spinner.stop();

      if (jsonMode) {
        outputJson(policy);
        return;
      }

      console.log();
      console.log(`  ${chalk.bold(policy.name)}`);
      console.log(`  ${chalk.dim("ID:")}          ${policy.id}`);
      console.log(`  ${chalk.dim("Description:")} ${policy.description}`);
      console.log(`  ${chalk.dim("Version:")}     v${policy.version}`);
      console.log(
        `  ${chalk.dim("Enabled:")}     ${policy.enabled ? chalk.green("yes") : chalk.red("no")}`
      );
      console.log(`  ${chalk.dim("Rules:")}`);
      for (const rule of policy.rules ?? []) {
        const effect =
          rule.effect === "allow"
            ? chalk.green(rule.effect)
            : rule.effect === "deny"
              ? chalk.red(rule.effect)
              : chalk.yellow(rule.effect);
        console.log(
          `    ${chalk.dim("•")} ${rule.name} → ${effect} (priority: ${rule.priority})`
        );
      }
      console.log();
    } catch (err) {
      spinner.fail("Failed to fetch policy");
      console.error(
        chalk.red(err instanceof Error ? err.message : String(err))
      );
    }
  });

policiesCommand
  .command("delete <id>")
  .description("Delete a policy")
  .action(async (id) => {
    const config = requireConfig();
    const client = new ApiClient(config);
    const spinner = ora("Deleting policy...").start();

    try {
      await client.del(`/api/v1/policies/${id}`);
      spinner.succeed(`Policy ${chalk.dim(id)} deleted`);
    } catch (err) {
      spinner.fail("Failed to delete policy");
      console.error(
        chalk.red(err instanceof Error ? err.message : String(err))
      );
    }
  });
