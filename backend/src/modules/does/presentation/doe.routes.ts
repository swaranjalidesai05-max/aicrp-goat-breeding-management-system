import { Router } from 'express';
import { z } from 'zod';

import { authenticate } from '../../../presentation/middleware/authenticate';
import { authorizePermission } from '../../../presentation/middleware/authorize';
import { validate } from '../../../presentation/middleware/validate';
import { idParamSchema } from '../../../shared/validation/common.schemas';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { doeController } from './doe.controller';
import { createDoeSchema, doeListQuerySchema, updateDoeSchema } from './doe.schemas';

const setStatusSchema = z.object({ status: z.string().min(1) });

export const doeRouter = Router();

doeRouter.get(
  '/',
  authenticate,
  authorizePermission('does', 'read'),
  validate(doeListQuerySchema, 'query'),
  asyncHandler(doeController.list),
);

doeRouter.get(
  '/:id',
  authenticate,
  authorizePermission('does', 'read'),
  validate(idParamSchema, 'params'),
  asyncHandler(doeController.getById),
);

doeRouter.post(
  '/',
  authenticate,
  authorizePermission('does', 'write'),
  validate(createDoeSchema),
  asyncHandler(doeController.create),
);

doeRouter.patch(
  '/:id',
  authenticate,
  authorizePermission('does', 'write'),
  validate(idParamSchema, 'params'),
  validate(updateDoeSchema),
  asyncHandler(doeController.update),
);

doeRouter.patch(
  '/:id/status',
  authenticate,
  authorizePermission('does', 'write'),
  validate(idParamSchema, 'params'),
  validate(setStatusSchema),
  asyncHandler(doeController.setStatus),
);
