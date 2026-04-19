import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RagChunk } from './ragRequestContext.js';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function loadChunkFile(name: string): RagChunk[] {
  const path = join(packageRoot, 'src', 'data', name);
  if (!existsSync(path)) return [];
  try {
    const raw = readFileSync(path, 'utf-8');
    const { chunks } = JSON.parse(raw) as { chunks: RagChunk[] };
    return Array.isArray(chunks) ? chunks : [];
  } catch {
    return [];
  }
}

/** Built-in corpora: sample snippets + platform guide (always searchable). */
export function loadDemoRagChunks(): RagChunk[] {
  return [...loadChunkFile('rag-chunks.json'), ...loadChunkFile('rag-platform-guide.json')];
}
