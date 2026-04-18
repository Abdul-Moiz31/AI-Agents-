import { tool } from '@openai/agents';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function loadJson<T>(rel: string): T {
  const raw = readFileSync(join(packageRoot, 'src', 'data', rel), 'utf-8');
  return JSON.parse(raw) as T;
}

export const searchKnowledgeBaseTool = tool({
  name: 'search_knowledge_base',
  description: 'Search internal KB articles by keyword (simple contains match on title/body).',
  parameters: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    const kb = loadJson<{ articles: { id: string; title: string; body: string }[] }>(
      'knowledge-base.json',
    );
    const q = query.toLowerCase();
    const hits = kb.articles.filter(
      (a) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q),
    );
    return { hits };
  },
});

export const getOrderTool = tool({
  name: 'get_order',
  description: 'Look up order by id from the demo order store.',
  parameters: z.object({ orderId: z.string() }),
  execute: async ({ orderId }) => {
    const { orders } = loadJson<{ orders: Record<string, unknown>[] }>('orders.json');
    const o = orders.find((x) => (x as { orderId: string }).orderId === orderId);
    return o ?? { error: 'not_found' };
  },
});

export const checkPaymentStatusTool = tool({
  name: 'check_payment_status',
  description: 'Check payment processor status for an order (mock).',
  parameters: z.object({ orderId: z.string() }),
  execute: async ({ orderId }) => ({
    orderId,
    processor: 'mock-stripe',
    status: orderId.endsWith('3') ? 'refunded' : 'captured',
  }),
});

export const escalateTicketTool = tool({
  name: 'escalate_ticket',
  description: 'Escalate to human tier-2 with structured payload.',
  parameters: z.object({
    reason: z.string(),
    userMessage: z.string(),
    sentiment: z.enum(['calm', 'frustrated', 'angry']),
  }),
  execute: async (payload) => ({
    ticketId: `esc_${Date.now()}`,
    ...payload,
    status: 'queued_for_human',
  }),
});

export const detectSentimentTool = tool({
  name: 'detect_sentiment',
  description: 'Lightweight sentiment / escalation signal (rule-based demo).',
  parameters: z.object({ text: z.string() }),
  execute: async ({ text }) => {
    const t = text.toUpperCase();
    const angry =
      /\b(HATE|USELESS|LAWSUIT|TERRIBLE|WORST|REFUND NOW)\b/.test(t) ||
      (t.match(/!/g) ?? []).length >= 3;
    const frustrated = /\b(UNACCEPTABLE|DISAPPOINTED|STILL WAITING)\b/.test(t);
    return {
      sentiment: angry ? 'angry' : frustrated ? 'frustrated' : 'calm',
      escalate_immediately: angry,
    };
  },
});
