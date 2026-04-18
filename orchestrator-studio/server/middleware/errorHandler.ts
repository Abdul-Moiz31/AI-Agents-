import type { NextFunction, Request, Response } from 'express';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[${req.requestId}]`, err);
  if (res.headersSent) return;
  res.status(500).json({
    error: message,
    requestId: req.requestId,
  });
}
