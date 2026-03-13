import type { CliConfig } from "./config.js";

interface ApiResponse<T> {
  data: T;
  error?: { code: string; message: string } | null;
  meta: { requestId: string; durationMs: number };
}

export class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: CliConfig) {
    this.baseUrl = config.apiUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
  }

  async request<T>(
    path: string,
    options?: RequestInit
  ): Promise<{ data: T; meta: ApiResponse<T>["meta"] }> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;
      const message =
        body?.error?.message ||
        `Request failed: ${res.status} ${res.statusText}`;
      throw new Error(message);
    }

    const json = (await res.json()) as ApiResponse<T>;

    if (json.error) {
      throw new Error(json.error.message);
    }

    return { data: json.data, meta: json.meta };
  }

  async get<T>(path: string): Promise<T> {
    const { data } = await this.request<T>(path);
    return data;
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const { data } = await this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
    return data;
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const { data } = await this.request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
    return data;
  }

  async del<T>(path: string): Promise<T> {
    const { data } = await this.request<T>(path, { method: "DELETE" });
    return data;
  }

  async health(): Promise<{ status: string; version: string }> {
    const res = await fetch(`${this.baseUrl}/health`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    const json = (await res.json()) as { data?: { status: string; version: string }; status?: string; version?: string };
    return (json.data ?? json) as { status: string; version: string };
  }
}
