import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { saveConfig, getConfigPath } from "../config.js";
import { ApiClient } from "../client.js";

async function prompt(rl: ReturnType<typeof createInterface>, question: string, defaultVal?: string): Promise<string> {
  const suffix = defaultVal ? ` (${defaultVal})` : "";
  const answer = await rl.question(`${question}${suffix}: `);
  return answer.trim() || defaultVal || "";
}

export const initCommand = new Command("init")
  .description("Configure AgentGate CLI with your API URL and key")
  .action(async () => {
    console.log(chalk.bold("\n  AgentGate CLI Setup\n"));

    const rl = createInterface({ input: stdin, output: stdout });

    try {
      const apiUrl = await prompt(rl, "  API URL", "http://localhost:3100");
      const apiKey = await prompt(rl, "  API Key");

      if (!apiKey) {
        console.log(chalk.red("\n  API key is required.\n"));
        return;
      }

      const spinner = ora("  Validating connection...").start();

      try {
        const client = new ApiClient({ apiUrl, apiKey });
        const health = await client.health();
        spinner.succeed(
          `  Connected to AgentGate API ${chalk.dim(`(${health.version ?? "v0.1.0"})`)}`
        );
      } catch {
        spinner.warn("  Could not reach API, but saving config anyway");
      }

      saveConfig({ apiUrl, apiKey });
      console.log(
        chalk.green(`\n  Config saved to ${chalk.dim(getConfigPath())}\n`)
      );
    } finally {
      rl.close();
    }
  });
