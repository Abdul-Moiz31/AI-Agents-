import type { NextFunction, Request, Response } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = performance.now();
  const rid = req.requestId ?? '—';
  res.on('finish', () => {
    const ms = Math.round(performance.now() - start);
    const line = `${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms [${rid}]`;
    if (res.statusCode >= 500) console.error(line);
    else console.log(line);
  });
  next();
}
