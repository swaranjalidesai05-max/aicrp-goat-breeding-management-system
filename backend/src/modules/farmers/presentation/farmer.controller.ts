import type { Request, Response } from 'express';

import { requireAuthUser } from '../../../presentation/middleware/authenticate';
import { getPagination, paginatedResponse } from '../../../shared/utils/pagination';
import { farmerService } from '../application/farmer.service';
import type { CreateFarmerInput, FarmerListQuery, UpdateFarmerInput } from './farmer.schemas';

export class FarmerController {
  list = async (req: Request, res: Response) => {
    const query = req.query as unknown as FarmerListQuery;
    const { page, limit } = getPagination(query);
    const { data, total } = await farmerService.list(page, limit, {
      search: query.search,
      villageId: query.villageId,
      status: query.status,
    });
    res.status(200).json(paginatedResponse(data, total, page, limit));
  };

  getById = async (req: Request, res: Response) => {
    const farmer = await farmerService.getById(req.params.id);
    res.status(200).json({ data: farmer });
  };

  create = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const farmer = await farmerService.create(req.body as CreateFarmerInput, actor.id);
    res.status(201).json({ data: farmer });
  };

  update = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const farmer = await farmerService.update(
      req.params.id,
      req.body as UpdateFarmerInput,
      actor.id,
    );
    res.status(200).json({ data: farmer });
  };

  setActive = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const isActive = Boolean((req.body as { isActive: boolean }).isActive);
    const farmer = await farmerService.setActive(req.params.id, isActive, actor.id);
    res.status(200).json({ data: farmer });
  };
}

export const farmerController = new FarmerController();
