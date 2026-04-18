import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import type { AppConfig } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { requestContext } from './middleware/requestContext.js';
import { requestLogger } from './middleware/requestLogger.js';
import { createRateLimiter } from './middleware/rateLimit.js';
import { apiRouter } from './routes/index.js';

export function createApp(cfg: AppConfig): express.Express {
  const app = express();

  if (process.env.TRUST_PROXY === '1') {
    app.set('trust proxy', 1);
  }
  app.disable('x-powered-by');
  app.use(requestContext);
  app.use(requestLogger);
  app.use(
    cors({
      origin: cfg.corsOrigin,
      credentials: true,
    }),
  );
  app.use(cookieParser(cfg.cookieSecret));
  app.use(express.json({ limit: cfg.bodyLimit }));
  app.use('/api', createRateLimiter(cfg));
  app.use('/api', apiRouter(cfg));
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
