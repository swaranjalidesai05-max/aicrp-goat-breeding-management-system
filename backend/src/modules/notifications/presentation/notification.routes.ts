import { Router } from 'express';

import { authenticate } from '../../../presentation/middleware/authenticate';
import { authorizePermission } from '../../../presentation/middleware/authorize';
import { validate } from '../../../presentation/middleware/validate';
import { idParamSchema } from '../../../shared/validation/common.schemas';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { notificationController } from './notification.controller';
import {
  createNotificationSchema,
  listNotificationQuerySchema,
} from './notification.schemas';

export const notificationRouter = Router();

notificationRouter.get(
  '/',
  authenticate,
  authorizePermission('notifications', 'read'),
  validate(listNotificationQuerySchema, 'query'),
  asyncHandler(notificationController.list),
);

notificationRouter.get(
  '/:id',
  authenticate,
  authorizePermission('notifications', 'read'),
  validate(idParamSchema, 'params'),
  asyncHandler(notificationController.getById),
);

notificationRouter.post(
  '/',
  authenticate,
  authorizePermission('notifications', 'write'),
  validate(createNotificationSchema),
  asyncHandler(notificationController.create),
);

notificationRouter.patch(
  '/:id/read',
  authenticate,
  authorizePermission('notifications', 'write'),
  validate(idParamSchema, 'params'),
  asyncHandler(notificationController.markAsRead),
);

notificationRouter.patch(
  '/read-all',
  authenticate,
  authorizePermission('notifications', 'write'),
  asyncHandler(notificationController.markAllAsRead),
);
