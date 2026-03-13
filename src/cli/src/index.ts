#!/usr/bin/env node

import { Command } from "commander";
import { setJsonMode } from "./output.js";
import { initCommand } from "./commands/init.js";
import { statusCommand } from "./commands/status.js";
import { agentsCommand } from "./commands/agents.js";
import { policiesCommand } from "./commands/policies.js";
import { authorizeCommand } from "./commands/authorize.js";
import { auditCommand } from "./commands/audit.js";
import { templatesCommand } from "./commands/templates.js";

const program = new Command();

program
  .name("agentgate")
  .description("AgentGate CLI — manage AI agent identities, policies, and authorization")
  .version("0.1.0")
  .option("--json", "Output results as JSON")
  .hook("preAction", (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.json) {
      setJsonMode(true);
    }
  });

program.addCommand(initCommand);
program.addCommand(statusCommand);
program.addCommand(agentsCommand);
program.addCommand(policiesCommand);
program.addCommand(authorizeCommand);
program.addCommand(auditCommand);
program.addCommand(templatesCommand);

program.parse();
