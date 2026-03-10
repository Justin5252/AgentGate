import { BaseIntegration, type IntegrationConfig } from "./base.js";

export class CrewAIGuard extends BaseIntegration {
  /**
   * Check permission before a CrewAI task is executed.
   */
  async beforeTask(taskDescription: string, context?: Record<string, unknown>): Promise<boolean> {
    return this.checkPermission(
      "crewai:task.execute",
      `task/${taskDescription.slice(0, 100).replace(/[^a-zA-Z0-9-_]/g, "_")}`,
      { taskDescription, ...context }
    );
  }

  /**
   * Check permission before a CrewAI agent uses a tool.
   */
  async beforeToolUse(toolName: string, toolInput?: string): Promise<boolean> {
    return this.checkPermission(
      `crewai:tool.execute:${toolName}`,
      `tool/${toolName}`,
      { toolInput }
    );
  }

  /**
   * Check permission before delegation to another agent.
   */
  async beforeDelegation(targetAgentRole: string, task: string): Promise<boolean> {
    return this.checkPermission(
      "crewai:delegate",
      `agent/${targetAgentRole}`,
      { task }
    );
  }

  /**
   * Creates a step callback for CrewAI that checks permissions at each step.
   */
  createStepCallback() {
    const guard = this;
    return async (step: { action: string; tool?: string; tool_input?: string }) => {
      if (step.tool) {
        const allowed = await guard.beforeToolUse(step.tool, step.tool_input);
        if (!allowed) {
          return { override: true, output: `AgentGate: Permission denied for tool ${step.tool}` };
        }
      }
      return { override: false };
    };
  }
}
