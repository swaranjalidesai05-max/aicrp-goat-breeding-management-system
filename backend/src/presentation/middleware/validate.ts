import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';

import { ValidationError } from '../../shared/errors/AppError';

type RequestSlice = 'body' | 'query' | 'params';

export function validate(schema: ZodTypeAny, slice: RequestSlice = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[slice]);
      req[slice] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new ValidationError('Validation failed', {
            issues: error.issues.map((issue) => ({
              path: issue.path.join('.'),
              message: issue.message,
            })),
          }),
        );
        return;
      }
      next(error);
    }
  };
}
