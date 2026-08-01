import { Router } from 'express';
import { z } from 'zod';

import { authenticate } from '../../../presentation/middleware/authenticate';
import { authorizePermission } from '../../../presentation/middleware/authorize';
import { validate } from '../../../presentation/middleware/validate';
import { idParamSchema } from '../../../shared/validation/common.schemas';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { paginationSchema } from '../../../shared/utils/pagination';
import { clusterController } from './cluster.controller';
import { createClusterSchema, updateClusterSchema } from './cluster.schemas';

const setActiveSchema = z.object({
  isActive: z.boolean(),
});

export const clusterRouter = Router();

clusterRouter.get(
  '/',
  authenticate,
  authorizePermission('clusters', 'read'),
  validate(paginationSchema, 'query'),
  asyncHandler(clusterController.list),
);

clusterRouter.get(
  '/:id',
  authenticate,
  authorizePermission('clusters', 'read'),
  validate(idParamSchema, 'params'),
  asyncHandler(clusterController.getById),
);

clusterRouter.post(
  '/',
  authenticate,
  authorizePermission('clusters', 'write'),
  validate(createClusterSchema),
  asyncHandler(clusterController.create),
);

clusterRouter.patch(
  '/:id',
  authenticate,
  authorizePermission('clusters', 'write'),
  validate(idParamSchema, 'params'),
  validate(updateClusterSchema),
  asyncHandler(clusterController.update),
);

clusterRouter.patch(
  '/:id/active',
  authenticate,
  authorizePermission('clusters', 'write'),
  validate(idParamSchema, 'params'),
  validate(setActiveSchema),
  asyncHandler(clusterController.setActive),
);
