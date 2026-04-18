import type { NextFunction, Request, Response } from 'express';
import { createRequestId } from '../utils/requestId.js';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export function requestContext(req: Request, res: Response, next: NextFunction): void {
  const id = (req.header('x-request-id') ?? createRequestId()).slice(0, 64);
  req.requestId = id;
  res.setHeader('x-request-id', id);
  next();
}
