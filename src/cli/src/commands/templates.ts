import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { requireConfig } from "../config.js";
import { ApiClient } from "../client.js";
import { printTable, jsonMode, outputJson } from "../output.js";

export const templatesCommand = new Command("templates")
  .description("Browse and deploy policy templates");

templatesCommand
  .command("list")
  .description("List available policy templates")
  .option("--category <category>", "Filter by category")
  .action(async (opts) => {
    const config = requireConfig();
    const client = new ApiClient(config);
    const spinner = ora("Fetching templates...").start();

    try {
      const qs = opts.category ? `?category=${opts.category}` : "";
      const templates = await client.get<any[]>(
        `/api/v1/policy-templates${qs}`
      );
      spinner.stop();

      if (jsonMode) {
        outputJson(templates);
        return;
      }

      printTable(
        ["ID", "Name", "Category", "Description"],
        templates.map((t) => [
          t.id,
          t.name,
          t.category,
          t.description.length > 50
            ? t.description.slice(0, 48) + "…"
            : t.description,
        ])
      );
      console.log(chalk.dim(`\n  ${templates.length} template(s)\n`));
    } catch (err) {
      spinner.fail("Failed to fetch templates");
      console.error(
        chalk.red(err instanceof Error ? err.message : String(err))
      );
    }
  });

templatesCommand
  .command("deploy <templateId>")
  .description("Deploy a policy template (creates a new policy from the template)")
  .action(async (templateId) => {
    const config = requireConfig();
    const client = new ApiClient(config);
    const spinner = ora("Fetching template...").start();

    try {
      const template = await client.get<any>(
        `/api/v1/policy-templates/${templateId}`
      );
      spinner.text = `Deploying "${template.name}"...`;

      const policy = await client.post<any>(
        "/api/v1/policies",
        template.template
      );
      spinner.succeed(
        `Policy deployed: ${chalk.bold(policy.name)} ${chalk.dim(`(${policy.id})`)}`
      );

      if (jsonMode) {
        outputJson(policy);
        return;
      }

      console.log(`  ${chalk.dim("Version:")} v${policy.version}`);
      console.log(`  ${chalk.dim("Rules:")}   ${policy.rules?.length ?? 0}`);
      console.log(
        `  ${chalk.dim("Enabled:")} ${policy.enabled ? chalk.green("yes") : chalk.red("no")}`
      );
    } catch (err) {
      spinner.fail("Failed to deploy template");
      console.error(
        chalk.red(err instanceof Error ? err.message : String(err))
      );
    }
  });
