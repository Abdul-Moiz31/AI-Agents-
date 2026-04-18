import { tool } from '@openai/agents';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export const loadTransactionEventsTool = tool({
  name: 'load_transaction_events',
  description: 'Load recent transaction events for risk scoring (demo JSON).',
  parameters: z.object({}),
  execute: async () => {
    const raw = readFileSync(join(packageRoot, 'src', 'data', 'transactions.json'), 'utf-8');
    return JSON.parse(raw) as unknown;
  },
});

export const applyRulesEngineTool = tool({
  name: 'apply_rules_engine',
  description: 'Run deterministic fraud rules on a single transaction record.',
  parameters: z.object({
    transactionId: z.string(),
  }),
  execute: async ({ transactionId }) => {
    const raw = readFileSync(join(packageRoot, 'src', 'data', 'transactions.json'), 'utf-8');
    const { events } = JSON.parse(raw) as {
      events: { id: string; amountCents: number; country: string; velocity24h: number; device: string }[];
    };
    const e = events.find((x) => x.id === transactionId);
    if (!e) return { error: 'transaction_not_found' };
    const triggered: string[] = [];
    let score = 5;
    if (e.amountCents > 100_000) {
      triggered.push('high_amount');
      score += 35;
    }
    if (e.country === 'XX') {
      triggered.push('geo_anomaly');
      score += 25;
    }
    if (e.velocity24h > 20) {
      triggered.push('velocity');
      score += 30;
    }
    if (e.device === 'vpn') {
      triggered.push('vpn_device');
      score += 15;
    }
    return { transactionId, triggered, score: Math.min(100, score) };
  },
});
