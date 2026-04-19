import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

const DATA_FILES = ['rag-chunks.json', 'rag-platform-guide.json'] as const;

function resolveAgentsPlatformDataDir(): string | null {
  const candidates: string[] = [];
  try {
    const pkgJson = require.resolve('agents-platform/package.json');
    candidates.push(join(dirname(pkgJson), 'src', 'data'));
  } catch {
    /* skip */
  }
  const cwd = process.cwd();
  candidates.push(join(cwd, 'node_modules', 'agents-platform', 'src', 'data'));
  candidates.push(join(cwd, '..', 'agents-platform', 'src', 'data'));
  const serverRoutesDir = dirname(fileURLToPath(import.meta.url));
  candidates.push(join(serverRoutesDir, '..', '..', '..', 'agents-platform', 'src', 'data'));
  for (const p of candidates) {
    if (existsSync(join(p, 'rag-chunks.json'))) return p;
  }
  return null;
}

type RawChunk = { id: string; source: string; text: string };

export type BuiltinChunkPreview = {
  id: string;
  source: string;
  textPreview: string;
};

export function loadBuiltinChunkPreviews(): { chunks: BuiltinChunkPreview[]; error?: string } {
  const dir = resolveAgentsPlatformDataDir();
  if (!dir) {
    return { chunks: [], error: 'RAG demo corpus directory not found (agents-platform)' };
  }

  const out: BuiltinChunkPreview[] = [];
  for (const file of DATA_FILES) {
    const path = join(dir, file);
    if (!existsSync(path)) continue;
    try {
      const raw = readFileSync(path, 'utf-8');
      const parsed = JSON.parse(raw) as { chunks: RawChunk[] };
      for (const c of parsed.chunks ?? []) {
        out.push({
          id: c.id,
          source: c.source,
          textPreview: c.text.length > 240 ? `${c.text.slice(0, 240)}…` : c.text,
        });
      }
    } catch {
      /* skip malformed file */
    }
  }

  if (out.length === 0) {
    return { chunks: [], error: 'No built-in RAG chunks could be loaded' };
  }
  return { chunks: out };
}
