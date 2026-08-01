import type { Request, Response } from 'express';

import { requireAuthUser } from '../../../presentation/middleware/authenticate';
import {
  getPagination,
  paginatedResponse,
  type PaginationQuery,
} from '../../../shared/utils/pagination';
import { buckService } from '../application/buck.service';
import type { CreateBuckInput, UpdateBuckInput } from './buck.schemas';

export class BuckController {
  list = async (req: Request, res: Response) => {
    const query = req.query as unknown as PaginationQuery & {
      search?: string;
      status?: string;
      clusterId?: string;
      farmerId?: string;
    };
    const { page, limit } = getPagination(query);
    const { data, total } = await buckService.list(page, limit, {
      search: query.search,
      status: query.status,
      clusterId: query.clusterId,
      farmerId: query.farmerId,
    });
    res.status(200).json(paginatedResponse(data, total, page, limit));
  };

  getById = async (req: Request, res: Response) => {
    const buck = await buckService.getById(req.params.id);
    res.status(200).json({ data: buck });
  };

  create = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const buck = await buckService.create(req.body as CreateBuckInput, actor.id);
    res.status(201).json({ data: buck });
  };

  update = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const buck = await buckService.update(req.params.id, req.body as UpdateBuckInput, actor.id);
    res.status(200).json({ data: buck });
  };

  setStatus = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const buck = await buckService.setStatus(req.params.id, req.body.status, actor.id);
    res.status(200).json({ data: buck });
  };
}

export const buckController = new BuckController();
