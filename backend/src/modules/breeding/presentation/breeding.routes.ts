import { Router } from 'express';
import { z } from 'zod';

import { authenticate } from '../../../presentation/middleware/authenticate';
import { authorizePermission } from '../../../presentation/middleware/authorize';
import { validate } from '../../../presentation/middleware/validate';
import { idParamSchema } from '../../../shared/validation/common.schemas';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { breedingController } from './breeding.controller';
import {
  createBreedingEventSchema,
  breedingListQuerySchema,
  updateBreedingEventSchema,
} from './breeding.schemas';

const setStatusSchema = z.object({ status: z.string().min(1) });

export const breedingRouter = Router();

breedingRouter.get(
  '/',
  authenticate,
  authorizePermission('breeding', 'read'),
  validate(breedingListQuerySchema, 'query'),
  asyncHandler(breedingController.list),
);

breedingRouter.get(
  '/:id',
  authenticate,
  authorizePermission('breeding', 'read'),
  validate(idParamSchema, 'params'),
  asyncHandler(breedingController.getById),
);

breedingRouter.post(
  '/',
  authenticate,
  authorizePermission('breeding', 'write'),
  validate(createBreedingEventSchema),
  asyncHandler(breedingController.create),
);

breedingRouter.patch(
  '/:id',
  authenticate,
  authorizePermission('breeding', 'write'),
  validate(idParamSchema, 'params'),
  validate(updateBreedingEventSchema),
  asyncHandler(breedingController.update),
);

breedingRouter.patch(
  '/:id/status',
  authenticate,
  authorizePermission('breeding', 'write'),
  validate(idParamSchema, 'params'),
  validate(setStatusSchema),
  asyncHandler(breedingController.setStatus),
);
