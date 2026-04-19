import { tool } from '@openai/agents';
import { z } from 'zod';
import { loadDemoRagChunks } from '../lib/loadDemoRagChunks.js';
import { ragRequestContext } from '../lib/ragRequestContext.js';

export const retrieveContextTool = tool({
  name: 'retrieve_context',
  description:
    'Retrieve top-k knowledge chunks for RAG (BM25-ish token overlap on demo + any user-uploaded docs for this session).',
  parameters: z.object({ question: z.string(), topK: z.number().min(1).max(8).default(4) }),
  execute: async ({ question, topK }) => {
    const demo = loadDemoRagChunks();
    const extra = ragRequestContext.getStore()?.extraChunks ?? [];
    const chunks = [...demo, ...extra];
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
