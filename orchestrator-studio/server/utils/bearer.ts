import type { Request } from 'express';

/** Extract `sk-...` from `Authorization: Bearer ...` without logging the value. */
export function extractBearerToken(req: Request): string | undefined {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return undefined;
  const t = h.slice(7).trim();
  return t.length > 0 ? t : undefined;
}

export function isPlausibleOpenAiKey(key: string): boolean {
  return key.startsWith('sk-') && key.length > 20;
}
