import { Router } from 'express';
import type { AppConfig } from '../config/env.js';
import { isOpenAiConfigured } from '../config/env.js';
import type { SessionResponseBody } from '../types/api.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const DEMO_COOKIE = 'orchestrator_demo';

export function sessionRouter(cfg: AppConfig): Router {
  const r = Router();

  r.get(
    '/session',
    asyncHandler(async (req, res) => {
      const demoConsumed = req.signedCookies[DEMO_COOKIE] === '1';
      const body: SessionResponseBody = {
        demoAvailable: isOpenAiConfigured(),
        demoConsumed,
        allowAnonymousServerRun: cfg.allowAnonymousServerRun && isOpenAiConfigured(),
      };
      res.json(body);
    }),
  );

  return r;
}
