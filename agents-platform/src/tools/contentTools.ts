import { tool } from '@openai/agents';
import { z } from 'zod';

export const keywordResearchTool = tool({
  name: 'keyword_research',
  description: 'Return SEO-style keyword clusters for a topic (mock; swap for Ahrefs/SEMrush APIs).',
  parameters: z.object({ topic: z.string(), locale: z.string().default('en-US') }),
  execute: async ({ topic, locale }) => ({
    topic,
    locale,
    primary: [`${topic} guide`, `${topic} best practices`, `${topic} examples`],
    long_tail: [
      `how to implement ${topic} in production`,
      `${topic} security checklist`,
      `${topic} vs alternatives`,
    ],
  }),
});

export const seoMetadataTool = tool({
  name: 'suggest_seo_metadata',
  description: 'Suggest title tag and meta description under length budgets.',
  parameters: z.object({
    topic: z.string(),
    audience: z.string().default('engineering leaders'),
  }),
  execute: async ({ topic, audience }) => ({
    title_tag: `${topic}: practical playbook for ${audience}`.slice(0, 60),
    meta_description: `Learn ${topic} with clear steps, tradeoffs, and checklists tailored for ${audience}.`.slice(
      0,
      155,
    ),
  }),
});
