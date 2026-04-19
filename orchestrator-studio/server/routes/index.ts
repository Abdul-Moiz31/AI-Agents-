import { Router } from 'express';
import type { AppConfig } from '../config/env.js';
import { agentsRouter } from './agents.js';
import { demoRunRouter } from './demoRun.js';
import { healthRouter } from './health.js';
import { metaRouter } from './meta.js';
import { ragRoutes } from './ragRoutes.js';
import { runRouter } from './run.js';
import { sessionRouter } from './session.js';

export function apiRouter(cfg: AppConfig): Router {
  const r = Router();
  r.use(healthRouter(cfg));
  r.use(metaRouter(cfg));
  r.use(sessionRouter(cfg));
  r.use(agentsRouter());
  r.use(ragRoutes());
  r.use(demoRunRouter(cfg));
  r.use(runRouter(cfg));
  return r;
}
