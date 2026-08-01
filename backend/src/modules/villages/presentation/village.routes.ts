import { Router } from 'express';
import { z } from 'zod';

import { authenticate } from '../../../presentation/middleware/authenticate';
import { authorizePermission } from '../../../presentation/middleware/authorize';
import { validate } from '../../../presentation/middleware/validate';
import { idParamSchema } from '../../../shared/validation/common.schemas';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { villageController } from './village.controller';
import {
  createVillageSchema,
  updateVillageSchema,
  villageListQuerySchema,
} from './village.schemas';

const setActiveSchema = z.object({
  isActive: z.boolean(),
});

export const villageRouter = Router();

villageRouter.get(
  '/',
  authenticate,
  authorizePermission('villages', 'read'),
  validate(villageListQuerySchema, 'query'),
  asyncHandler(villageController.list),
);

villageRouter.get(
  '/:id',
  authenticate,
  authorizePermission('villages', 'read'),
  validate(idParamSchema, 'params'),
  asyncHandler(villageController.getById),
);

villageRouter.post(
  '/',
  authenticate,
  authorizePermission('villages', 'write'),
  validate(createVillageSchema),
  asyncHandler(villageController.create),
);

villageRouter.patch(
  '/:id',
  authenticate,
  authorizePermission('villages', 'write'),
  validate(idParamSchema, 'params'),
  validate(updateVillageSchema),
  asyncHandler(villageController.update),
);

villageRouter.patch(
  '/:id/active',
  authenticate,
  authorizePermission('villages', 'write'),
  validate(idParamSchema, 'params'),
  validate(setActiveSchema),
  asyncHandler(villageController.setActive),
);
