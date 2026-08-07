import { AnimalStatus, Sex } from '@prisma/client';
import { z } from 'zod';

import { gpsFieldsSchema } from '../../../shared/validation/common.schemas';
import { paginationSchema } from '../../../shared/utils/pagination';

export const createProgenySchema = z
  .object({
    breedingEventId: z.string().cuid(),
    tagNumber: z.string().trim().min(1).max(64),
    sex: z.nativeEnum(Sex),
    birthDate: z.coerce.date(),
    birthWeightKg: z.number().positive().max(999).optional().nullable(),
    status: z.nativeEnum(AnimalStatus).optional(),
    farmerId: z.string().cuid().optional().nullable(),
    notes: z.string().trim().max(2000).optional().nullable(),
  })
  .merge(gpsFieldsSchema);

export const updateProgenySchema = z
  .object({
    breedingEventId: z.string().cuid().optional(),
    tagNumber: z.string().trim().min(1).max(64).optional(),
    sex: z.nativeEnum(Sex).optional(),
    birthDate: z.coerce.date().optional(),
    birthWeightKg: z.number().positive().max(999).optional().nullable(),
    status: z.nativeEnum(AnimalStatus).optional(),
    farmerId: z.string().cuid().optional().nullable(),
    notes: z.string().trim().max(2000).optional().nullable(),
  })
  .merge(gpsFieldsSchema);

export const patchProgenyStatusSchema = z.object({
  status: z.nativeEnum(AnimalStatus),
});

export const listProgenyQuerySchema = paginationSchema.extend({
  breedingEventId: z.string().cuid().optional(),
  farmerId: z.string().cuid().optional(),
  status: z.nativeEnum(AnimalStatus).optional(),
});

export type CreateProgenyInput = z.infer<typeof createProgenySchema>;
export type UpdateProgenyInput = z.infer<typeof updateProgenySchema>;
export type PatchProgenyStatusInput = z.infer<typeof patchProgenyStatusSchema>;
export type ListProgenyQuery = z.infer<typeof listProgenyQuerySchema>;
