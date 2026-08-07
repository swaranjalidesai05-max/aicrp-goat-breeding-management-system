import type { Request, Response } from 'express';

import { requireAuthUser } from '../../../presentation/middleware/authenticate';
import {
  getPagination,
  paginatedResponse,
} from '../../../shared/utils/pagination';
import { notificationService } from '../application/notification.service';
import type {
  CreateNotificationInput,
  NotificationListQuery,
} from './notification.schemas';

export class NotificationController {
  list = async (req: Request, res: Response) => {
    const query = req.query as unknown as NotificationListQuery;
    const { page, limit } = getPagination(query);
    const { data, total } = await notificationService.list(page, limit, query);
    res.status(200).json(paginatedResponse(data, total, page, limit));
  };

  getById = async (req: Request, res: Response) => {
    const notification = await notificationService.getById(req.params.id);
    res.status(200).json({ data: notification });
  };

  create = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const notification = await notificationService.create(req.body as CreateNotificationInput, actor.id);
    res.status(201).json({ data: notification });
  };

  markAsRead = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const notification = await notificationService.markAsRead(req.params.id, actor.id);
    res.status(200).json({ data: notification });
  };

  markAllAsRead = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const result = await notificationService.markAllAsRead(req.user!.id, actor.id);
    res.status(200).json({ data: result });
  };
}

export const notificationController = new NotificationController();
