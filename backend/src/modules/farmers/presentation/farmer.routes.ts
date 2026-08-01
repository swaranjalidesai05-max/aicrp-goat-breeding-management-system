import { Router } from 'express';
import { z } from 'zod';

import { authenticate } from '../../../presentation/middleware/authenticate';
import { authorizePermission } from '../../../presentation/middleware/authorize';
import { validate } from '../../../presentation/middleware/validate';
import { idParamSchema } from '../../../shared/validation/common.schemas';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { farmerController } from './farmer.controller';
import { createFarmerSchema, farmerListQuerySchema, updateFarmerSchema } from './farmer.schemas';

const setActiveSchema = z.object({ isActive: z.boolean() });

export const farmerRouter = Router();

farmerRouter.get(
  '/',
  authenticate,
  authorizePermission('farmers', 'read'),
  validate(farmerListQuerySchema, 'query'),
  asyncHandler(farmerController.list),
);

farmerRouter.get(
  '/:id',
  authenticate,
  authorizePermission('farmers', 'read'),
  validate(idParamSchema, 'params'),
  asyncHandler(farmerController.getById),
);

farmerRouter.post(
  '/',
  authenticate,
  authorizePermission('farmers', 'write'),
  validate(createFarmerSchema),
  asyncHandler(farmerController.create),
);

farmerRouter.patch(
  '/:id',
  authenticate,
  authorizePermission('farmers', 'write'),
  validate(idParamSchema, 'params'),
  validate(updateFarmerSchema),
  asyncHandler(farmerController.update),
);

farmerRouter.patch(
  '/:id/active',
  authenticate,
  authorizePermission('farmers', 'write'),
  validate(idParamSchema, 'params'),
  validate(setActiveSchema),
  asyncHandler(farmerController.setActive),
);
