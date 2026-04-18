import type { AgentId } from 'agents-platform';

export type AgentSummaryDto = {
  id: AgentId;
  title: string;
  description: string;
};

export type AgentDetailDto = AgentSummaryDto;

export type RunAgentRequestBody = {
  agentId: string;
  message: string;
};

export type RunAgentResponseBody = {
  output: string;
  requestId: string;
  durationMs: number;
};

export type ErrorResponseBody = {
  error: string;
  requestId?: string;
};

export type MetaResponseBody = {
  service: string;
  version: string;
  uptimeSeconds: number;
  openaiConfigured: boolean;
  environment: string;
};
