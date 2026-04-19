import type { AgentId } from 'agents-platform';
import { Router } from 'express';
import { z } from 'zod';
import type { AppConfig } from '../config/env.js';
import { isOpenAiConfigured } from '../config/env.js';
import { executeAgentRun, isValidAgentId } from '../services/agentService.js';
import type { RunAgentResponseBody } from '../types/api.js';
import { extractBearerToken, isPlausibleOpenAiKey } from '../utils/bearer.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Semaphore } from '../utils/semaphore.js';

const bodySchema = z.object({
  agentId: z.string().min(1),
  message: z.string().min(1).max(200_000),
  /** Browser session corpus (user uploads); only used for `knowledge-rag`. */
  ragCollectionId: z.string().uuid().optional(),
});

export function runRouter(cfg: AppConfig): Router {
  const r = Router();
  const semaphore = new Semaphore(cfg.maxConcurrentRuns);

  r.post(
    '/run',
    asyncHandler(async (req, res) => {
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

      const bearer = extractBearerToken(req);
      const allowAnonymous = cfg.allowAnonymousServerRun && isOpenAiConfigured();

      if (!bearer && !allowAnonymous) {
        res.status(401).json({
          error:
            'Missing OpenAI API key. Send Authorization: Bearer sk-... or use one free demo via POST /api/run/demo.',
          code: 'API_KEY_REQUIRED',
          requestId: req.requestId,
        });
        return;
      }

      if (bearer && !isPlausibleOpenAiKey(bearer)) {
        res.status(400).json({
          error: 'Authorization Bearer token does not look like an OpenAI API key.',
          code: 'API_KEY_INVALID',
          requestId: req.requestId,
        });
        return;
      }

      if (!bearer && allowAnonymous && !isOpenAiConfigured()) {
        res.status(503).json({
          error: 'Server OpenAI key not configured.',
          requestId: req.requestId,
        });
        return;
      }

      const release = await semaphore.acquire();
      const t0 = Date.now();
      try {
        const runOpts = ragCollectionId ? { ragCollectionId } : undefined;
        const output = await runWithTimeout(
          () =>
            bearer
              ? executeAgentRun(agentId as AgentId, message, { openaiApiKey: bearer, ...runOpts })
              : executeAgentRun(agentId as AgentId, message, runOpts),
          cfg.runSoftTimeoutMs,
        );
        const body: RunAgentResponseBody = {
          output,
          requestId: req.requestId,
          durationMs: Date.now() - t0,
          mode: bearer ? 'byok' : 'server',
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
