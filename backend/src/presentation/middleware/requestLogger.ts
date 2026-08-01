import { randomUUID } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';
import pinoHttp from 'pino-http';

import { logger } from '../../infrastructure/logger/logger';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => (req as Request).requestId ?? randomUUID(),
  customProps: (req) => ({
    userId: (req as Request).user?.id,
  }),
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
      };
    },
  },
});
