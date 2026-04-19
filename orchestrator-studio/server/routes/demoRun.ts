import type { AgentId } from 'agents-platform';
import { Router } from 'express';
import { z } from 'zod';
import type { AppConfig } from '../config/env.js';
import { isOpenAiConfigured } from '../config/env.js';
import { createDemoRateLimiter } from '../middleware/demoRateLimit.js';
import { executeAgentRun, isValidAgentId } from '../services/agentService.js';
import type { RunAgentResponseBody } from '../types/api.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Semaphore } from '../utils/semaphore.js';
import { DEMO_COOKIE } from './session.js';

const bodySchema = z.object({
  agentId: z.string().min(1),
  message: z.string().min(1).max(200_000),
  ragCollectionId: z.string().uuid().optional(),
});

const DEMO_COOKIE_MS = 400 * 24 * 60 * 60 * 1000;

export function demoRunRouter(cfg: AppConfig): Router {
  const r = Router();
  r.use(createDemoRateLimiter(cfg));
  const semaphore = new Semaphore(cfg.maxConcurrentRuns);

  r.post(
    '/run/demo',
    asyncHandler(async (req, res) => {
      if (!isOpenAiConfigured()) {
        res.status(503).json({
          error: 'Free demo is not available (server has no OPENAI_API_KEY). Add your own key.',
          code: 'DEMO_DISABLED',
          requestId: req.requestId,
        });
        return;
      }

      if (req.signedCookies[DEMO_COOKIE] === '1') {
        res.status(403).json({
          error:
            'You have already used the free demo run. Add your OpenAI API key in the UI (stored in your browser session) for further runs.',
          code: 'DEMO_EXHAUSTED',
          requestId: req.requestId,
        });
        return;
      }

      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.flatten().fieldErrors,
          requestId: req.requestId,
        });
        return;
      }

      const { agentId, message, ragCollectionId } = parsed.data;
      if (!isValidAgentId(agentId)) {
        res.status(400).json({
          error: `Unknown agentId: ${agentId}`,
          requestId: req.requestId,
        });
        return;
      }

      const release = await semaphore.acquire();
      const t0 = Date.now();
      try {
        const runOpts = ragCollectionId ? { ragCollectionId } : undefined;
        const output = await runWithTimeout(
          () => executeAgentRun(agentId as AgentId, message, runOpts),
          cfg.runSoftTimeoutMs,
        );
        res.cookie(DEMO_COOKIE, '1', {
          signed: true,
          httpOnly: true,
          maxAge: DEMO_COOKIE_MS,
          sameSite: 'lax',
          path: '/',
        });
        const body: RunAgentResponseBody = {
          output,
          requestId: req.requestId,
          durationMs: Date.now() - t0,
          mode: 'demo',
        };
        res.json(body);
      } finally {
        release();
      }
    }),
  );

  return r;
}

function runWithTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Agent run exceeded soft timeout (${ms}ms)`)), ms);
  });
  return Promise.race([fn(), timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}
