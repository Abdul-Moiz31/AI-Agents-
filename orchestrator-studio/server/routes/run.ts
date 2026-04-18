import type { AgentId } from 'agents-platform';
import { Router } from 'express';
import { z } from 'zod';
import type { AppConfig } from '../config/env.js';
import { isOpenAiConfigured } from '../config/env.js';
import { executeAgentRun, isValidAgentId } from '../services/agentService.js';
import type { RunAgentResponseBody } from '../types/api.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Semaphore } from '../utils/semaphore.js';

const bodySchema = z.object({
  agentId: z.string().min(1),
  message: z.string().min(1).max(200_000),
});

export function runRouter(cfg: AppConfig): Router {
  const r = Router();
  const semaphore = new Semaphore(cfg.maxConcurrentRuns);

  r.post(
    '/run',
    asyncHandler(async (req, res) => {
      if (!isOpenAiConfigured()) {
        res.status(503).json({
          error: 'OPENAI_API_KEY is not configured. Add it to your .env file.',
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

      const { agentId, message } = parsed.data;
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
        const output = await runWithTimeout(
          () => executeAgentRun(agentId as AgentId, message),
          cfg.runSoftTimeoutMs,
        );
        const body: RunAgentResponseBody = {
          output,
          requestId: req.requestId,
          durationMs: Date.now() - t0,
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
