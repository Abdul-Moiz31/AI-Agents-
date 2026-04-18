import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';

/** Load `.env` from repo root, then `orchestrator-studio/.env`. */
export function loadEnvironment(): void {
  loadEnv({ path: resolve(process.cwd(), '../.env') });
  loadEnv({ path: resolve(process.cwd(), '.env') });
}

export type AppConfig = {
  port: number;
  nodeEnv: string;
  corsOrigin: string | string[] | boolean;
  bodyLimit: string;
  /** Max concurrent agent runs (simple process-wide semaphore). */
  maxConcurrentRuns: number;
  /** Rough ceiling for a single run (ms); the SDK may still run longer. */
  runSoftTimeoutMs: number;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
};

export function getConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const corsRaw = process.env.CORS_ORIGIN;
  let corsOrigin: AppConfig['corsOrigin'] = true;
  if (corsRaw && corsRaw !== '*') {
    corsOrigin = corsRaw.split(',').map((s) => s.trim());
  }

  return {
    port: Number(process.env.PORT) || 8787,
    nodeEnv,
    corsOrigin,
    bodyLimit: process.env.BODY_LIMIT ?? '2mb',
    maxConcurrentRuns: Math.max(1, Number(process.env.MAX_CONCURRENT_RUNS) || 4),
    runSoftTimeoutMs: Math.max(30_000, Number(process.env.RUN_SOFT_TIMEOUT_MS) || 120_000),
    rateLimitWindowMs: Math.max(1000, Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000),
    rateLimitMaxRequests: Math.max(1, Number(process.env.RATE_LIMIT_MAX) || 30),
  };
}

export function isOpenAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
