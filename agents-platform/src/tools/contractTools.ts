import { tool } from '@openai/agents';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export const ocrContractTool = tool({
  name: 'ocr_contract',
  description:
    'Extract text from a contract (demo reads plain text file; production: OCR PDF/DOC via Textract/Document AI).',
  parameters: z.object({
    document_id: z.enum(['sample', 'inline']).default('sample'),
    inline_text: z.string().optional(),
  }),
  execute: async ({ document_id, inline_text }) => {
    if (document_id === 'inline' && inline_text) {
      return { document_id, text: inline_text };
    }
    const text = readFileSync(join(packageRoot, 'src', 'data', 'contract-sample.txt'), 'utf-8');
    return { document_id: 'sample', text };
  },
});

export const parseContractClausesTool = tool({
  name: 'parse_contract_clauses',
  description: 'Segment contract text into coarse clauses for review (heuristic demo).',
  parameters: z.object({ text: z.string() }),
  execute: async ({ text }) => {
    const clauses = text
      .split(/\n\n+/)
      .map((chunk, i) => ({ id: i + 1, preview: chunk.slice(0, 200) }));
    return { clause_count: clauses.length, clauses };
  },
});
