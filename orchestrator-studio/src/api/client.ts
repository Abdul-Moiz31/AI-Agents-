import type { AgentSummary, ApiErrorBody, MetaResponse, RunAgentResponse } from './types.js';

async function parseJson<T>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}

function formatError(data: ApiErrorBody, fallback: string): string {
  if (typeof data.error === 'string') return data.error;
  try {
    return JSON.stringify(data.error);
  } catch {
    return fallback;
  }
}

export async function fetchAgents(): Promise<AgentSummary[]> {
  const res = await fetch('/api/agents');
  const data = await parseJson<AgentSummary[] | ApiErrorBody>(res);
  if (!res.ok) throw new Error(formatError(data as ApiErrorBody, res.statusText));
  return data as AgentSummary[];
}

export async function fetchAgentDetail(id: string): Promise<AgentSummary> {
  const res = await fetch(`/api/agents/${encodeURIComponent(id)}`);
  const data = await parseJson<AgentSummary | ApiErrorBody>(res);
  if (!res.ok) throw new Error(formatError(data as ApiErrorBody, res.statusText));
  return data as AgentSummary;
}

export async function fetchMeta(): Promise<MetaResponse> {
  const res = await fetch('/api/meta');
  const data = await parseJson<MetaResponse | ApiErrorBody>(res);
  if (!res.ok) throw new Error(formatError(data as ApiErrorBody, res.statusText));
  return data as MetaResponse;
}

export async function runAgent(agentId: string, message: string): Promise<RunAgentResponse> {
  const res = await fetch('/api/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, message }),
  });
  const data = await parseJson<RunAgentResponse | ApiErrorBody>(res);
  if (!res.ok) throw new Error(formatError(data as ApiErrorBody, res.statusText));
  return data as RunAgentResponse;
}
