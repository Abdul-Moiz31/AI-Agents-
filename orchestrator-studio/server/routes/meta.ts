import { Router } from 'express';
import { isOpenAiConfigured } from '../config/env.js';
import type { AppConfig } from '../config/env.js';
import type { MetaResponseBody } from '../types/api.js';

const started = Date.now();

export function metaRouter(cfg: AppConfig): Router {
  const r = Router();

  r.get('/meta', (_req, res) => {
    const body: MetaResponseBody = {
      service: 'orchestrator-studio-api',
      version: '1.0.0',
      uptimeSeconds: Math.floor((Date.now() - started) / 1000),
      openaiConfigured: isOpenAiConfigured(),
      environment: cfg.nodeEnv,
    };
    res.json(body);
  });

  return r;
}
