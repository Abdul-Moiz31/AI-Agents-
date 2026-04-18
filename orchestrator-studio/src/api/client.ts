import type {
  AgentSummary,
  ApiErrorBody,
  MetaResponse,
  RunAgentResponse,
  SessionResponse,
} from './types.js';

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
  const res = await fetch('/api/agents', { credentials: 'include' });
  const data = await parseJson<AgentSummary[] | ApiErrorBody>(res);
  if (!res.ok) throw new Error(formatError(data as ApiErrorBody, res.statusText));
  return data as AgentSummary[];
}

export async function fetchAgentDetail(id: string): Promise<AgentSummary> {
  const res = await fetch(`/api/agents/${encodeURIComponent(id)}`, { credentials: 'include' });
  const data = await parseJson<AgentSummary | ApiErrorBody>(res);
  if (!res.ok) throw new Error(formatError(data as ApiErrorBody, res.statusText));
  return data as AgentSummary;
}

export async function fetchMeta(): Promise<MetaResponse> {
  const res = await fetch('/api/meta', { credentials: 'include' });
  const data = await parseJson<MetaResponse | ApiErrorBody>(res);
  if (!res.ok) throw new Error(formatError(data as ApiErrorBody, res.statusText));
  return data as MetaResponse;
}

export async function fetchSession(): Promise<SessionResponse> {
  const res = await fetch('/api/session', { credentials: 'include' });
  const data = await parseJson<SessionResponse | ApiErrorBody>(res);
  if (!res.ok) throw new Error(formatError(data as ApiErrorBody, res.statusText));
  return data as SessionResponse;
}

export async function runAgent(
  agentId: string,
  message: string,
  bearerToken?: string,
): Promise<RunAgentResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;
  const res = await fetch('/api/run', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({ agentId, message }),
  });
  const data = await parseJson<RunAgentResponse | ApiErrorBody>(res);
  if (!res.ok) throw new Error(formatError(data as ApiErrorBody, res.statusText));
  return data as RunAgentResponse;
}

export async function runAgentDemo(agentId: string, message: string): Promise<RunAgentResponse> {
  const res = await fetch('/api/run/demo', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, message }),
  });
  const data = await parseJson<RunAgentResponse | ApiErrorBody>(res);
  if (!res.ok) throw new Error(formatError(data as ApiErrorBody, res.statusText));
  return data as RunAgentResponse;
}
