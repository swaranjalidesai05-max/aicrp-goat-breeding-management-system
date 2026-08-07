import type { Request, Response } from 'express';

import { requireAuthUser } from '../../../presentation/middleware/authenticate';
import { getPagination, paginatedResponse } from '../../../shared/utils/pagination';
import { progenyService } from '../application/progeny.service';
import type {
  CreateProgenyInput,
  ListProgenyQuery,
  PatchProgenyStatusInput,
  UpdateProgenyInput,
} from './progeny.schemas';

export class ProgenyController {
  list = async (req: Request, res: Response) => {
    const query = req.query as unknown as ListProgenyQuery;
    const { page, limit } = getPagination(query);
    const { data, total } = await progenyService.list(page, limit, {
      search: query.search,
      breedingEventId: query.breedingEventId,
      farmerId: query.farmerId,
      status: query.status,
    });
    res.status(200).json(paginatedResponse(data, total, page, limit));
  };

  getById = async (req: Request, res: Response) => {
    const progeny = await progenyService.getById(req.params.id);
    res.status(200).json({ data: progeny });
  };

  create = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const progeny = await progenyService.create(req.body as CreateProgenyInput, actor.id);
    res.status(201).json({ data: progeny });
  };

  update = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const progeny = await progenyService.update(
      req.params.id,
      req.body as UpdateProgenyInput,
      actor.id,
    );
    res.status(200).json({ data: progeny });
  };

  setStatus = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const progeny = await progenyService.setStatus(
      req.params.id,
      (req.body as PatchProgenyStatusInput).status,
      actor.id,
    );
    res.status(200).json({ data: progeny });
  };
}

export const progenyController = new ProgenyController();
