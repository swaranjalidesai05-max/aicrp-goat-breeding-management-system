import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@prisma/client';

import { ForbiddenError, UnauthorizedError } from '../../shared/errors/AppError';
import {
  canAccess,
  type PermissionAction,
  type PermissionResource,
} from '../../shared/constants/permissions';

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient role privileges'));
      return;
    }
    next();
  };
}

export function authorizePermission(
  resource: PermissionResource,
  action: PermissionAction,
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    if (!canAccess(req.user.role, resource, action)) {
      next(new ForbiddenError(`Missing ${action} permission on ${resource}`));
      return;
    }
    next();
  };
}
