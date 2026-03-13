import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { requireConfig } from "../config.js";
import { ApiClient } from "../client.js";
import { colorDecision, jsonMode, outputJson } from "../output.js";

export const authorizeCommand = new Command("authorize")
  .description("Evaluate an authorization request")
  .requiredOption("--agent <agentId>", "Agent ID")
  .requiredOption("--action <action>", "Action to authorize")
  .requiredOption("--resource <resource>", "Target resource")
  .option("--context <json>", "Additional context as JSON")
  .action(async (opts) => {
    const config = requireConfig();
    const client = new ApiClient(config);
    const spinner = ora("Evaluating authorization...").start();

    try {
      const data: Record<string, unknown> = {
        agentId: opts.agent,
        action: opts.action,
        resource: opts.resource,
      };
      if (opts.context) {
        data.context = JSON.parse(opts.context);
      }

      const result = await client.post<any>("/api/v1/authorize", data);
      spinner.stop();

      if (jsonMode) {
        outputJson(result);
        return;
      }

      console.log();
      console.log(`  Decision: ${colorDecision(result.decision)}`);
      console.log(`  ${chalk.dim("Agent:")}    ${opts.agent}`);
      console.log(`  ${chalk.dim("Action:")}   ${opts.action}`);
      console.log(`  ${chalk.dim("Resource:")} ${opts.resource}`);
      if (result.policyId) {
        console.log(`  ${chalk.dim("Policy:")}   ${result.policyId}`);
      }
      if (result.ruleId) {
        console.log(`  ${chalk.dim("Rule:")}     ${result.ruleId}`);
      }
      console.log(
        `  ${chalk.dim("Duration:")} ${result.durationMs?.toFixed(2) ?? "?"}ms`
      );
      if (result.anomalies?.length) {
        console.log(
          chalk.yellow(
            `\n  ⚠ ${result.anomalies.length} anomaly(ies) detected`
          )
        );
      }
      console.log();
    } catch (err) {
      spinner.fail("Authorization failed");
      console.error(
        chalk.red(err instanceof Error ? err.message : String(err))
      );
    }
  });
