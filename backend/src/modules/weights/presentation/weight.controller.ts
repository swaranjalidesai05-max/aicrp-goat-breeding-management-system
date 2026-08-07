import type { Request, Response } from 'express';

import { requireAuthUser } from '../../../presentation/middleware/authenticate';
import {
  getPagination,
  paginatedResponse,
} from '../../../shared/utils/pagination';
import { weightService } from '../application/weight.service';
import type {
  CreateWeightRecordInput,
  UpdateWeightRecordInput,
  WeightListQuery,
} from './weight.schemas';

export class WeightController {
  list = async (req: Request, res: Response) => {
    const query = req.query as unknown as WeightListQuery;
    const { page, limit } = getPagination(query);
    const { data, total } = await weightService.list(page, limit, {
      subjectType: query.subjectType,
      subjectId: query.subjectId,
    });
    res.status(200).json(paginatedResponse(data, total, page, limit));
  };

  getById = async (req: Request, res: Response) => {
    const weight = await weightService.getById(req.params.id);
    res.status(200).json({ data: weight });
  };

  create = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const weight = await weightService.create(req.body as CreateWeightRecordInput, actor.id);
    res.status(201).json({ data: weight });
  };

  update = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const weight = await weightService.update(
      req.params.id,
      req.body as UpdateWeightRecordInput,
      actor.id,
    );
    res.status(200).json({ data: weight });
  };
}

export const weightController = new WeightController();
