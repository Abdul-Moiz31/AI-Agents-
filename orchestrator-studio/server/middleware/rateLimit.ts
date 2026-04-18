import type { NextFunction, Request, Response } from 'express';
import type { AppConfig } from '../config/env.js';

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

export function createRateLimiter(cfg: Pick<AppConfig, 'rateLimitWindowMs' | 'rateLimitMaxRequests'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      next();
      return;
    }
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || now - b.windowStart > cfg.rateLimitWindowMs) {
      b = { count: 0, windowStart: now };
      buckets.set(key, b);
    }
    b.count += 1;
    if (b.count > cfg.rateLimitMaxRequests) {
      res.status(429).json({
        error: 'Too many requests. Try again shortly.',
        requestId: req.requestId,
      });
      return;
    }
    next();
  };
}
