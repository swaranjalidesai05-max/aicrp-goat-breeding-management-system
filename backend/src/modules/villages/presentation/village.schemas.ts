import { z } from 'zod';

import { paginationSchema } from '../../../shared/utils/pagination';

const coordinateSchema = z.number().min(-180).max(180);

export const createVillageSchema = z.object({
  clusterId: z.string().cuid(),
  code: z.string().trim().min(1).max(32),
  name: z.string().trim().min(2).max(120),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: coordinateSchema.optional().nullable(),
});

export const updateVillageSchema = createVillageSchema
  .omit({ clusterId: true })
  .partial();

export const villageListQuerySchema = paginationSchema.extend({
  clusterId: z.string().cuid().optional(),
});

export type CreateVillageInput = z.infer<typeof createVillageSchema>;
export type UpdateVillageInput = z.infer<typeof updateVillageSchema>;
export type VillageListQuery = z.infer<typeof villageListQuerySchema>;
