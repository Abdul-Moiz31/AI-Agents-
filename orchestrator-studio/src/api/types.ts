export type AgentSummary = { id: string; title: string; description: string };

export type MetaResponse = {
  service: string;
  version: string;
  uptimeSeconds: number;
  openaiConfigured: boolean;
  environment: string;
};

export type RunAgentResponse = {
  output: string;
  requestId: string;
  durationMs: number;
};

export type ApiErrorBody = {
  error: unknown;
  requestId?: string;
};
