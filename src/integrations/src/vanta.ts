/**
 * Vanta Integration — Push AgentGate compliance data to Vanta
 * and pull Vanta compliance status for unified visibility.
 */

export interface VantaConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface VantaEvidencePayload {
  title: string;
  description: string;
  type: string;
  body: Record<string, unknown>;
}

export interface VantaTest {
  id: string;
  testName: string;
  status: "PASS" | "FAIL" | "DISABLED";
  lastRun: string;
  framework: string;
}

export interface VantaMonitor {
  id: string;
  name: string;
  status: "healthy" | "unhealthy" | "disabled";
  lastChecked: string;
}

export class VantaIntegration {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: VantaConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? "https://api.vanta.com";
  }

  private headers() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  async pushEvidence(evidence: VantaEvidencePayload): Promise<{ id: string }> {
    const response = await fetch(`${this.baseUrl}/v1/resources/custom_evidence`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(evidence),
    });

    if (!response.ok) {
      throw new Error(`Vanta push failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as Record<string, unknown>;
    return { id: (data.id as string) ?? "unknown" };
  }

  async pushComplianceReport(report: {
    frameworkId: string;
    frameworkName: string;
    complianceScore: number;
    passingControls: number;
    totalControls: number;
    lastEvaluatedAt: string | null;
  }): Promise<{ id: string }> {
    return this.pushEvidence({
      title: `AgentGate: ${report.frameworkName} Compliance`,
      description: `AI Agent compliance — ${report.complianceScore}% score, ${report.passingControls}/${report.totalControls} controls passing`,
      type: "CUSTOM",
      body: {
        source: "agentgate",
        ...report,
      },
    });
  }

  async getTests(): Promise<VantaTest[]> {
    const response = await fetch(`${this.baseUrl}/v1/resources/tests`, {
      headers: this.headers(),
    });

    if (!response.ok) {
      throw new Error(`Vanta fetch tests failed: ${response.status}`);
    }

    const data = (await response.json()) as Record<string, unknown>;
    return ((data.results ?? []) as VantaTest[]);
  }

  async getMonitors(): Promise<VantaMonitor[]> {
    const response = await fetch(`${this.baseUrl}/v1/resources/monitors`, {
      headers: this.headers(),
    });

    if (!response.ok) {
      throw new Error(`Vanta fetch monitors failed: ${response.status}`);
    }

    const data = (await response.json()) as Record<string, unknown>;
    return ((data.results ?? []) as VantaMonitor[]);
  }
}
