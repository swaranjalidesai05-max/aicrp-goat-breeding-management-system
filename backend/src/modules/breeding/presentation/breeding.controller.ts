import type { Request, Response } from 'express';

import { requireAuthUser } from '../../../presentation/middleware/authenticate';
import {
  getPagination,
  paginatedResponse,
  type PaginationQuery,
} from '../../../shared/utils/pagination';
import { breedingService } from '../application/breeding.service';
import type { CreateBreedingEventInput, UpdateBreedingEventInput } from './breeding.schemas';

export class BreedingController {
  list = async (req: Request, res: Response) => {
    const query = req.query as unknown as PaginationQuery & {
      search?: string;
      status?: string;
      buckId?: string;
      doeId?: string;
    };
    const { page, limit } = getPagination(query);
    const { data, total } = await breedingService.list(page, limit, {
      search: query.search,
      status: query.status,
      buckId: query.buckId,
      doeId: query.doeId,
    });
    res.status(200).json(paginatedResponse(data, total, page, limit));
  };

  getById = async (req: Request, res: Response) => {
    const breeding = await breedingService.getById(req.params.id);
    res.status(200).json({ data: breeding });
  };

  create = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const breeding = await breedingService.create(req.body as CreateBreedingEventInput, actor.id);
    res.status(201).json({ data: breeding });
  };

  update = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const breeding = await breedingService.update(
      req.params.id,
      req.body as UpdateBreedingEventInput,
      actor.id,
    );
    res.status(200).json({ data: breeding });
  };

  setStatus = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const breeding = await breedingService.setStatus(req.params.id, req.body.status, actor.id);
    res.status(200).json({ data: breeding });
  };
}

export const breedingController = new BreedingController();
