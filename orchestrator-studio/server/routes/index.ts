import { Router } from 'express';
import type { AppConfig } from '../config/env.js';
import { agentsRouter } from './agents.js';
import { healthRouter } from './health.js';
import { metaRouter } from './meta.js';
import { runRouter } from './run.js';

export function apiRouter(cfg: AppConfig): Router {
  const r = Router();
  r.use(healthRouter(cfg));
  r.use(metaRouter(cfg));
  r.use(agentsRouter());
  r.use(runRouter(cfg));
  return r;
}
