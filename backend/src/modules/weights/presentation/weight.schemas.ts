import { WeightSubjectType } from '@prisma/client';
import { z } from 'zod';

import { gpsFieldsSchema } from '../../../shared/validation/common.schemas';
import { paginationSchema } from '../../../shared/utils/pagination';

export const createWeightRecordSchema = z
  .object({
    subjectType: z.nativeEnum(WeightSubjectType),
    subjectId: z.string().trim().min(1),
    weightKg: z.number().positive().max(999),
    recordedAt: z.coerce.date(),
    notes: z.string().trim().max(2000).optional().nullable(),
  })
  .merge(gpsFieldsSchema);

export const updateWeightRecordSchema = z
  .object({
    subjectType: z.nativeEnum(WeightSubjectType).optional(),
    subjectId: z.string().trim().min(1).optional(),
    weightKg: z.number().positive().max(999).optional(),
    recordedAt: z.coerce.date().optional(),
    notes: z.string().trim().max(2000).optional().nullable(),
  })
  .merge(gpsFieldsSchema);

export const weightListQuerySchema = paginationSchema.extend({
  subjectType: z.nativeEnum(WeightSubjectType).optional(),
  subjectId: z.string().trim().min(1).optional(),
});

export type CreateWeightRecordInput = z.infer<typeof createWeightRecordSchema>;
export type UpdateWeightRecordInput = z.infer<typeof updateWeightRecordSchema>;
export type WeightListQuery = z.infer<typeof weightListQuerySchema>;
