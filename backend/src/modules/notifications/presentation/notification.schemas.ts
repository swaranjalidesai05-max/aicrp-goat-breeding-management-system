import { NotificationType } from '@prisma/client';
import { z } from 'zod';

import { paginationSchema } from '../../../shared/utils/pagination';

export const createNotificationSchema = z.object({
  userId: z.string().trim().min(1),
  title: z.string().trim().min(1).max(150),
  body: z.string().trim().min(1).max(2000),
  type: z.nativeEnum(NotificationType),
  metadata: z.any().optional(),
});

export const listNotificationQuerySchema = paginationSchema.extend({
  userId: z.string().trim().min(1).optional(),
  isRead: z.boolean().optional(),
});

export const notificationMarkReadSchema = z.object({
  isRead: z.boolean().optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type NotificationListQuery = z.infer<typeof listNotificationQuerySchema>;
