import { Router } from 'express';

import { authenticate } from '../../../presentation/middleware/authenticate';
import { authorizePermission } from '../../../presentation/middleware/authorize';
import { validate } from '../../../presentation/middleware/validate';
import { idParamSchema } from '../../../shared/validation/common.schemas';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { weightController } from './weight.controller';
import {
  createWeightRecordSchema,
  updateWeightRecordSchema,
  weightListQuerySchema,
} from './weight.schemas';

const router = Router();

router.get(
  '/',
  authenticate,
  authorizePermission('weights', 'read'),
  validate(weightListQuerySchema, 'query'),
  asyncHandler(weightController.list),
);

router.get(
  '/:id',
  authenticate,
  authorizePermission('weights', 'read'),
  validate(idParamSchema, 'params'),
  asyncHandler(weightController.getById),
);

router.post(
  '/',
  authenticate,
  authorizePermission('weights', 'write'),
  validate(createWeightRecordSchema),
  asyncHandler(weightController.create),
);

router.patch(
  '/:id',
  authenticate,
  authorizePermission('weights', 'write'),
  validate(idParamSchema, 'params'),
  validate(updateWeightRecordSchema),
  asyncHandler(weightController.update),
);

export const weightRouter = router;
