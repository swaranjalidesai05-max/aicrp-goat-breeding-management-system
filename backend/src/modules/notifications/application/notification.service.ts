import { writeAuditLog } from '../../../infrastructure/audit/auditWriter';
import { NotFoundError } from '../../../shared/errors/AppError';
import { notificationRepository } from '../infrastructure/notification.repository';
import type {
  CreateNotificationInput,
  NotificationListQuery,
} from '../presentation/notification.schemas';

export class NotificationService {
  async list(page: number, limit: number, query: NotificationListQuery) {
    const skip = (page - 1) * limit;
    const [data, total] = await notificationRepository.list({
      skip,
      take: limit,
      userId: query.userId,
      isRead: query.isRead,
    });
    return { data, total };
  }

  async getById(id: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundError('Notification');
    }
    return notification;
  }

  async create(input: CreateNotificationInput, actorId: string) {
    const notification = await notificationRepository.create({
      userId: input.userId,
      title: input.title,
      body: input.body,
      type: input.type,
      metadata: input.metadata ?? undefined,
    });

    await writeAuditLog({
      userId: actorId,
      action: 'NOTIFICATION_CREATE',
      entityType: 'Notification',
      entityId: notification.id,
      metadata: { userId: notification.userId, type: notification.type },
    });

    return notification;
  }

  async markAsRead(id: string, actorId: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundError('Notification');
    }

    const updated = await notificationRepository.markAsRead(id);
    await writeAuditLog({
      userId: actorId,
      action: 'NOTIFICATION_MARK_READ',
      entityType: 'Notification',
      entityId: id,
    });
    return updated;
  }

  async markAllAsRead(userId: string, actorId: string) {
    const result = await notificationRepository.markAllAsRead(userId);
    await writeAuditLog({
      userId: actorId,
      action: 'NOTIFICATIONS_MARK_ALL_READ',
      entityType: 'Notification',
      metadata: { userId, count: result.count },
    });
    return result;
  }
}

export const notificationService = new NotificationService();
