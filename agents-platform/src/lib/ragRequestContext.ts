import { AsyncLocalStorage } from 'node:async_hooks';

/** One searchable passage in the RAG corpus. */
export type RagChunk = { id: string; source: string; text: string };

/**
 * Per-request user-uploaded chunks merged with the demo corpus inside `retrieve_context`.
 * Set by the API layer around `runWithAgent` / `runAgentById`.
 */
export const ragRequestContext = new AsyncLocalStorage<{ extraChunks: RagChunk[] } | null>();
