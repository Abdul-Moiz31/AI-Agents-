import type {
  AgentSummary,
  ApiErrorBody,
  MetaResponse,
  RagCorpusResponse,
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

export async function fetchRagCorpus(collectionId?: string): Promise<RagCorpusResponse> {
  const q = collectionId ? `?collectionId=${encodeURIComponent(collectionId)}` : '';
  const res = await fetch(`/api/rag/corpus${q}`, { credentials: 'include' });
  const data = (await res.json()) as RagCorpusResponse & ApiErrorBody;
  if (!res.ok) {
    return {
      chunks: data.chunks ?? [],
      indexKind: data.indexKind ?? 'unavailable',
      description: data.description,
      demoChunkCount: data.demoChunkCount,
      userChunkCount: data.userChunkCount,
      uploadedDocuments: data.uploadedDocuments,
      error: typeof data.error === 'string' ? data.error : formatError(data, res.statusText),
    };
  }
  return data as RagCorpusResponse;
}

export async function uploadRagDocument(payload: {
  collectionId: string;
  title: string;
  text: string;
}): Promise<{ ok: boolean; documentId: string; chunkCount: number }> {
  const res = await fetch('/api/rag/upload', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ ok?: boolean; documentId?: string; chunkCount?: number } | ApiErrorBody>(res);
  if (!res.ok) throw new Error(formatError(data as ApiErrorBody, res.statusText));
  return data as { ok: boolean; documentId: string; chunkCount: number };
}

export async function uploadRagPdf(payload: {
  collectionId: string;
  title: string;
  file: File;
}): Promise<{ ok: boolean; documentId: string; chunkCount: number }> {
  const fd = new FormData();
  fd.set('collectionId', payload.collectionId);
  fd.set('title', payload.title);
  fd.set('file', payload.file, payload.file.name);
  const res = await fetch('/api/rag/upload-pdf', {
    method: 'POST',
    credentials: 'include',
    body: fd,
  });
  const data = await parseJson<{ ok?: boolean; documentId?: string; chunkCount?: number } | ApiErrorBody>(res);
  if (!res.ok) throw new Error(formatError(data as ApiErrorBody, res.statusText));
  return data as { ok: boolean; documentId: string; chunkCount: number };
}

export async function removeRagDocument(collectionId: string, documentId: string): Promise<void> {
  const res = await fetch('/api/rag/remove-document', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collectionId, documentId }),
  });
  const data = await parseJson<unknown>(res);
  if (!res.ok) throw new Error(formatError(data as ApiErrorBody, res.statusText));
}

export type RunAgentOptions = { ragCollectionId?: string };

export async function runAgent(
  agentId: string,
  message: string,
  bearerToken?: string,
  options?: RunAgentOptions,
): Promise<RunAgentResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;
  const body: Record<string, unknown> = { agentId, message };
  if (options?.ragCollectionId) body.ragCollectionId = options.ragCollectionId;
  const res = await fetch('/api/run', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(body),
  });
  const data = await parseJson<RunAgentResponse | ApiErrorBody>(res);
  if (!res.ok) throw new Error(formatError(data as ApiErrorBody, res.statusText));
  return data as RunAgentResponse;
}

export async function runAgentDemo(
  agentId: string,
  message: string,
  options?: RunAgentOptions,
): Promise<RunAgentResponse> {
  const body: Record<string, unknown> = { agentId, message };
  if (options?.ragCollectionId) body.ragCollectionId = options.ragCollectionId;
  const res = await fetch('/api/run/demo', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await parseJson<RunAgentResponse | ApiErrorBody>(res);
  if (!res.ok) throw new Error(formatError(data as ApiErrorBody, res.statusText));
  return data as RunAgentResponse;
}
