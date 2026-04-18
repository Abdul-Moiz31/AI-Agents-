import { tool } from '@openai/agents';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export const retrieveContextTool = tool({
  name: 'retrieve_context',
  description:
    'Retrieve top-k knowledge chunks for RAG (mock BM25-ish: token overlap; swap for Pinecone/Weaviate).',
  parameters: z.object({ question: z.string(), topK: z.number().min(1).max(8).default(4) }),
  execute: async ({ question, topK }) => {
    const raw = readFileSync(join(packageRoot, 'src', 'data', 'rag-chunks.json'), 'utf-8');
    const { chunks } = JSON.parse(raw) as { chunks: { id: string; source: string; text: string }[] };
    const qTokens = new Set(
      question
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean),
    );
    const scored = chunks.map((c) => {
      const tokens = c.text.toLowerCase().split(/\W+/);
      let score = 0;
      for (const t of tokens) if (qTokens.has(t)) score += 1;
      return { ...c, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return { chunks: scored.slice(0, topK) };
  },
});
