import type { NotificationType, Prisma } from '@prisma/client';

import { prisma } from '../../../infrastructure/database/prisma';

export class NotificationRepository {
  findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  }

  list(params: { skip: number; take: number; userId?: string; isRead?: boolean }) {
    const where: Prisma.NotificationWhereInput = {
      ...(params.userId ? { userId: params.userId } : {}),
      ...(params.isRead !== undefined ? { isRead: params.isRead } : {}),
    };

    return Promise.all([
      prisma.notification.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);
  }

  create(data: {
    userId: string;
    title: string;
    body: string;
    type: NotificationType;
    metadata?: Prisma.InputJsonValue;
  }) {
    return prisma.notification.create({ data });
  }

  markAsRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  markAllAsRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId }, data: { isRead: true } });
  }
}

export const notificationRepository = new NotificationRepository();
