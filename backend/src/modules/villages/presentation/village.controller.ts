import type { Request, Response } from 'express';

import { requireAuthUser } from '../../../presentation/middleware/authenticate';
import { getPagination, paginatedResponse } from '../../../shared/utils/pagination';
import { villageService } from '../application/village.service';
import type {
  CreateVillageInput,
  UpdateVillageInput,
  VillageListQuery,
} from './village.schemas';

export class VillageController {
  list = async (req: Request, res: Response) => {
    const query = req.query as unknown as VillageListQuery;
    const { page, limit } = getPagination(query);
    const { data, total } = await villageService.list(page, limit, {
      search: query.search,
      clusterId: query.clusterId,
    });
    res.status(200).json(paginatedResponse(data, total, page, limit));
  };

  getById = async (req: Request, res: Response) => {
    const village = await villageService.getById(req.params.id);
    res.status(200).json({ data: village });
  };

  create = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const village = await villageService.create(
      req.body as CreateVillageInput,
      actor.id,
    );
    res.status(201).json({ data: village });
  };

  update = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const village = await villageService.update(
      req.params.id,
      req.body as UpdateVillageInput,
      actor.id,
    );
    res.status(200).json({ data: village });
  };

  setActive = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const isActive = Boolean((req.body as { isActive: boolean }).isActive);
    const village = await villageService.setActive(req.params.id, isActive, actor.id);
    res.status(200).json({ data: village });
  };
}

export const villageController = new VillageController();
