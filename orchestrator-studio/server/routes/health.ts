import { Router } from 'express';
import type { AppConfig } from '../config/env.js';
import { isOpenAiConfigured } from '../config/env.js';

export function healthRouter(_cfg: AppConfig): Router {
  const r = Router();

  r.get('/health', (_req, res) => {
    res.json({
      ok: true,
      openaiConfigured: isOpenAiConfigured(),
    });
  });

  r.get('/ready', (_req, res) => {
    if (!isOpenAiConfigured()) {
      res.status(503).json({ ok: false, reason: 'OPENAI_API_KEY not set' });
      return;
    }
    res.json({ ok: true });
  });

  return r;
}
