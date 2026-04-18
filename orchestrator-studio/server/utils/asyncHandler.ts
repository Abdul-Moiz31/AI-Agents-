import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Express4 helper: forwards async errors to `next(err)`. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    void fn(req, res, next).catch(next);
  };
}
