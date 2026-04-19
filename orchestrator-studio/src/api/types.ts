export type AgentSummary = { id: string; title: string; description: string };

export type MetaResponse = {
  service: string;
  version: string;
  uptimeSeconds: number;
  openaiConfigured: boolean;
  environment: string;
};

export type RunMode = 'demo' | 'byok' | 'server';

export type RunAgentResponse = {
  output: string;
  requestId: string;
  durationMs: number;
  mode?: RunMode;
};

export type SessionResponse = {
  demoAvailable: boolean;
  demoConsumed: boolean;
  allowAnonymousServerRun: boolean;
};

export type ApiErrorBody = {
  error: unknown;
  requestId?: string;
};

export type RagCorpusChunk = {
  id: string;
  source: string;
  textPreview: string;
};

export type RagUploadedDocument = {
  documentId: string;
  title: string;
  uploadedAt: string;
  chunkCount: number;
};

export type RagCorpusResponse = {
  chunks: RagCorpusChunk[];
  demoChunkCount?: number;
  userChunkCount?: number;
  uploadedDocuments?: RagUploadedDocument[];
  indexKind: string;
  description?: string;
  error?: string;
};
