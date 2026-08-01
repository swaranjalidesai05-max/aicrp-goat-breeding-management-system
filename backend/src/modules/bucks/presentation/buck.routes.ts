import { Router } from 'express';
import { z } from 'zod';

import { authenticate } from '../../../presentation/middleware/authenticate';
import { authorizePermission } from '../../../presentation/middleware/authorize';
import { validate } from '../../../presentation/middleware/validate';
import { idParamSchema } from '../../../shared/validation/common.schemas';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { buckController } from './buck.controller';
import { createBuckSchema, buckListQuerySchema, updateBuckSchema } from './buck.schemas';

const setStatusSchema = z.object({ status: z.string().min(1) });

export const buckRouter = Router();

buckRouter.get(
  '/',
  authenticate,
  authorizePermission('bucks', 'read'),
  validate(buckListQuerySchema, 'query'),
  asyncHandler(buckController.list),
);

buckRouter.get(
  '/:id',
  authenticate,
  authorizePermission('bucks', 'read'),
  validate(idParamSchema, 'params'),
  asyncHandler(buckController.getById),
);

buckRouter.post(
  '/',
  authenticate,
  authorizePermission('bucks', 'write'),
  validate(createBuckSchema),
  asyncHandler(buckController.create),
);

buckRouter.patch(
  '/:id',
  authenticate,
  authorizePermission('bucks', 'write'),
  validate(idParamSchema, 'params'),
  validate(updateBuckSchema),
  asyncHandler(buckController.update),
);

buckRouter.patch(
  '/:id/status',
  authenticate,
  authorizePermission('bucks', 'write'),
  validate(idParamSchema, 'params'),
  validate(setStatusSchema),
  asyncHandler(buckController.setStatus),
);
