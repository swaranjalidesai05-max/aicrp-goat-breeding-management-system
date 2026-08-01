import type { Request, Response } from 'express';

import { requireAuthUser } from '../../../presentation/middleware/authenticate';
import {
  getPagination,
  paginatedResponse,
  type PaginationQuery,
} from '../../../shared/utils/pagination';
import { doeService } from '../application/doe.service';
import type { CreateDoeInput, UpdateDoeInput } from './doe.schemas';

export class DoeController {
  list = async (req: Request, res: Response) => {
    const query = req.query as unknown as PaginationQuery & {
      search?: string;
      status?: string;
      clusterId?: string;
      farmerId?: string;
    };
    const { page, limit } = getPagination(query);
    const { data, total } = await doeService.list(page, limit, {
      search: query.search,
      status: query.status,
      clusterId: query.clusterId,
      farmerId: query.farmerId,
    });
    res.status(200).json(paginatedResponse(data, total, page, limit));
  };

  getById = async (req: Request, res: Response) => {
    const doe = await doeService.getById(req.params.id);
    res.status(200).json({ data: doe });
  };

  create = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const doe = await doeService.create(req.body as CreateDoeInput, actor.id);
    res.status(201).json({ data: doe });
  };

  update = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const doe = await doeService.update(req.params.id, req.body as UpdateDoeInput, actor.id);
    res.status(200).json({ data: doe });
  };

  setStatus = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const doe = await doeService.setStatus(req.params.id, req.body.status, actor.id);
    res.status(200).json({ data: doe });
  };
}

export const doeController = new DoeController();
