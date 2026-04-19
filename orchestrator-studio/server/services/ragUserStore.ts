import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import type { RagChunk } from 'agents-platform';
import { chunkPlainText } from '../utils/ragChunkText.js';

const serverDir = dirname(fileURLToPath(import.meta.url));
export const RAG_COLLECTIONS_DIR = join(serverDir, '..', 'data', 'rag-collections');

type StoredDocument = {
  documentId: string;
  title: string;
  uploadedAt: string;
  chunks: RagChunk[];
};

type CollectionFile = {
  version: 1;
  documents: StoredDocument[];
};

function ensureDir(): void {
  mkdirSync(RAG_COLLECTIONS_DIR, { recursive: true });
}

function collectionPath(collectionId: string): string {
  return join(RAG_COLLECTIONS_DIR, `${collectionId}.json`);
}

function loadCollection(collectionId: string): CollectionFile {
  const path = collectionPath(collectionId);
  if (!existsSync(path)) return { version: 1, documents: [] };
  try {
    const raw = readFileSync(path, 'utf-8');
    const parsed = JSON.parse(raw) as CollectionFile;
    if (parsed?.version !== 1 || !Array.isArray(parsed.documents)) return { version: 1, documents: [] };
    return parsed;
  } catch {
    return { version: 1, documents: [] };
  }
}

function saveCollection(collectionId: string, data: CollectionFile): void {
  ensureDir();
  writeFileSync(collectionPath(collectionId), JSON.stringify(data, null, 0), 'utf-8');
}

export function flattenUserChunks(collectionId: string): RagChunk[] {
  const { documents } = loadCollection(collectionId);
  return documents.flatMap((d) => d.chunks);
}

export type UserDocumentMeta = {
  documentId: string;
  title: string;
  uploadedAt: string;
  chunkCount: number;
};

export function listUserDocuments(collectionId: string): UserDocumentMeta[] {
  return loadCollection(collectionId).documents.map((d) => ({
    documentId: d.documentId,
    title: d.title,
    uploadedAt: d.uploadedAt,
    chunkCount: d.chunks.length,
  }));
}

const MAX_TEXT = 500_000;
const MAX_CHUNKS_PER_DOC = 120;
const CHUNK_SIZE = 520;
const CHUNK_OVERLAP = 90;

export function ingestTextDocument(
  collectionId: string,
  title: string,
  text: string,
): { documentId: string; chunkCount: number } {
  if (text.length > MAX_TEXT) {
    throw new Error(`Text exceeds ${MAX_TEXT} characters`);
  }
  const slices = chunkPlainText(text, CHUNK_SIZE, CHUNK_OVERLAP).slice(0, MAX_CHUNKS_PER_DOC);
  if (slices.length === 0) {
    throw new Error('No text to index after trimming');
  }

  const docId = randomUUID();
  const safeTitle = title.trim().slice(0, 200) || 'upload';
  const uploadedAt = new Date().toISOString();
  const chunks: RagChunk[] = slices.map((t, i) => ({
    id: `user:${docId}§${i}`,
    source: `upload:${safeTitle}`,
    text: t,
  }));

  const file = loadCollection(collectionId);
  file.documents.push({
    documentId: docId,
    title: safeTitle,
    uploadedAt,
    chunks,
  });
  saveCollection(collectionId, file);
  return { documentId: docId, chunkCount: chunks.length };
}

export function removeDocument(collectionId: string, documentId: string): boolean {
  const file = loadCollection(collectionId);
  const before = file.documents.length;
  file.documents = file.documents.filter((d) => d.documentId !== documentId);
  if (file.documents.length === before) return false;
  saveCollection(collectionId, file);
  return true;
}
