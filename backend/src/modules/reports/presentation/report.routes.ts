import { Router } from 'express';

import { authenticate } from '../../../presentation/middleware/authenticate';
import { authorizePermission } from '../../../presentation/middleware/authorize';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { reportController } from './report.controller';

export const reportRouter = Router();

reportRouter.get(
  '/dashboard',
  authenticate,
  authorizePermission('reports', 'read'),
  asyncHandler(reportController.dashboard),
);
