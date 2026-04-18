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
    res.json({
      ok: true,
      serverOpenAiConfigured: isOpenAiConfigured(),
    });
  });

  return r;
}
