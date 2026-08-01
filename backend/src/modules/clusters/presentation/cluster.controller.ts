import type { Request, Response } from 'express';

import { requireAuthUser } from '../../../presentation/middleware/authenticate';
import {
  getPagination,
  paginatedResponse,
  type PaginationQuery,
} from '../../../shared/utils/pagination';
import { clusterService } from '../application/cluster.service';
import type { CreateClusterInput, UpdateClusterInput } from './cluster.schemas';

export class ClusterController {
  list = async (req: Request, res: Response) => {
    const query = req.query as unknown as PaginationQuery;
    const { page, limit } = getPagination(query);
    const { data, total } = await clusterService.list(page, limit, query.search);
    res.status(200).json(paginatedResponse(data, total, page, limit));
  };

  getById = async (req: Request, res: Response) => {
    const cluster = await clusterService.getById(req.params.id);
    res.status(200).json({ data: cluster });
  };

  create = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const cluster = await clusterService.create(
      req.body as CreateClusterInput,
      actor.id,
    );
    res.status(201).json({ data: cluster });
  };

  update = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const cluster = await clusterService.update(
      req.params.id,
      req.body as UpdateClusterInput,
      actor.id,
    );
    res.status(200).json({ data: cluster });
  };

  setActive = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const isActive = Boolean((req.body as { isActive: boolean }).isActive);
    const cluster = await clusterService.setActive(req.params.id, isActive, actor.id);
    res.status(200).json({ data: cluster });
  };
}

export const clusterController = new ClusterController();
