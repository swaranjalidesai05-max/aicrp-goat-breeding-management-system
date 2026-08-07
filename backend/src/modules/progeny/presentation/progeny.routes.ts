import { Router } from 'express';

import { authenticate } from '../../../presentation/middleware/authenticate';
import { authorizePermission } from '../../../presentation/middleware/authorize';
import { validate } from '../../../presentation/middleware/validate';
import { idParamSchema } from '../../../shared/validation/common.schemas';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { progenyController } from './progeny.controller';
import {
  createProgenySchema,
  listProgenyQuerySchema,
  patchProgenyStatusSchema,
  updateProgenySchema,
} from './progeny.schemas';

export const progenyRouter = Router();

progenyRouter.get(
  '/',
  authenticate,
  authorizePermission('progeny', 'read'),
  validate(listProgenyQuerySchema, 'query'),
  asyncHandler(progenyController.list),
);

progenyRouter.get(
  '/:id',
  authenticate,
  authorizePermission('progeny', 'read'),
  validate(idParamSchema, 'params'),
  asyncHandler(progenyController.getById),
);

progenyRouter.post(
  '/',
  authenticate,
  authorizePermission('progeny', 'write'),
  validate(createProgenySchema),
  asyncHandler(progenyController.create),
);

progenyRouter.patch(
  '/:id',
  authenticate,
  authorizePermission('progeny', 'write'),
  validate(idParamSchema, 'params'),
  validate(updateProgenySchema),
  asyncHandler(progenyController.update),
);

progenyRouter.patch(
  '/:id/status',
  authenticate,
  authorizePermission('progeny', 'write'),
  validate(idParamSchema, 'params'),
  validate(patchProgenyStatusSchema),
  asyncHandler(progenyController.setStatus),
);
