import type { NextFunction, Request, Response } from 'express';
import type { AppConfig } from '../config/env.js';

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

export function createDemoRateLimiter(cfg: Pick<AppConfig, 'rateLimitWindowMs' | 'demoRateLimitMax'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || now - b.windowStart > cfg.rateLimitWindowMs) {
      b = { count: 0, windowStart: now };
      buckets.set(key, b);
    }
    b.count += 1;
    if (b.count > cfg.demoRateLimitMax) {
      res.status(429).json({
        error: 'Too many demo requests. Add your own API key or try later.',
        code: 'DEMO_RATE_LIMIT',
        requestId: req.requestId,
      });
      return;
    }
    next();
  };
}
