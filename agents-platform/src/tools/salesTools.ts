import { tool } from '@openai/agents';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export const loadIcpAndLeadsTool = tool({
  name: 'load_icp_and_leads',
  description: 'Load ideal customer profile and sample leads from data (replace with CRM / LinkedIn exports).',
  parameters: z.object({}),
  execute: async () => {
    const raw = readFileSync(join(packageRoot, 'src', 'data', 'sales-icp.json'), 'utf-8');
    return JSON.parse(raw) as unknown;
  },
});

export const recordAbVariantTool = tool({
  name: 'record_ab_variant',
  description: 'Record outreach A/B variant for analytics (mock event sink).',
  parameters: z.object({
    lead_company: z.string(),
    variant: z.enum(['A', 'B']),
    message_summary: z.string(),
  }),
  execute: async (payload) => ({ recorded: true, ...payload }),
});
