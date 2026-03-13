import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { requireConfig } from "../config.js";
import { ApiClient } from "../client.js";
import { jsonMode, outputJson } from "../output.js";

export const statusCommand = new Command("status")
  .description("Check API server health and connection status")
  .action(async () => {
    const config = requireConfig();
    const client = new ApiClient(config);
    const spinner = ora("Checking API status...").start();

    try {
      const health = await client.health();
      spinner.stop();

      if (jsonMode) {
        outputJson({ ...health, apiUrl: config.apiUrl });
        return;
      }

      console.log();
      console.log(
        `  ${chalk.green("●")} API is ${chalk.green("operational")}`
      );
      console.log(`  ${chalk.dim("URL:")}     ${config.apiUrl}`);
      console.log(
        `  ${chalk.dim("Version:")} ${health.version ?? "unknown"}`
      );
      console.log();
    } catch (err) {
      spinner.fail("API is unreachable");
      console.log(`  ${chalk.dim("URL:")} ${config.apiUrl}`);
      console.log(
        `  ${chalk.dim("Error:")} ${err instanceof Error ? err.message : String(err)}`
      );
      process.exit(1);
    }
  });
