import { tool } from '@openai/agents';
import { z } from 'zod';

export const webSearchTool = tool({
  name: 'web_search',
  description:
    'Search the public web via Wikipedia opensearch (no API key). For production, swap for SerpAPI / Bing / Google CSE.',
  parameters: z.object({ query: z.string(), limit: z.number().min(1).max(8).default(5) }),
  execute: async ({ query, limit }) => {
    const params = new URLSearchParams({
      action: 'opensearch',
      search: query,
      limit: String(limit),
      namespace: '0',
      format: 'json',
    });
    const url = `https://en.wikipedia.org/w/api.php?${params}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'AgentsPlatform/1.0 (research bot)' } });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const data = (await res.json()) as [string, string[], string[], string[]];
    const [, titles, descriptions, urls] = data;
    const results = (titles ?? []).map((title, i) => ({
      title,
      description: descriptions?.[i] ?? '',
      url: urls?.[i] ?? '',
    }));
    return { query, results };
  },
});

export const fetchUrlTextTool = tool({
  name: 'fetch_url_text',
  description: 'Fetch a URL and return truncated text (best-effort; many sites block bots).',
  parameters: z.object({ url: z.string().url(), maxChars: z.number().default(6000) }),
  execute: async ({ url, maxChars }) => {
    const res = await fetch(url, { headers: { 'User-Agent': 'AgentsPlatform/1.0 (research bot)' } });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return { url, text: text.slice(0, maxChars), truncated: text.length > maxChars };
  },
});
