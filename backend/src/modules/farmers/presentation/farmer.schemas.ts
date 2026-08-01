import { z } from 'zod';

import { paginationSchema } from '../../../shared/utils/pagination';

export const createFarmerSchema = z.object({
  villageId: z.string().cuid(),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(20).optional().nullable(),
  address: z.string().trim().max(400).optional().nullable(),
  aadhaar: z.string().trim().max(20).optional().nullable(),
  gpsLatitude: z.number().min(-90).max(90).optional().nullable(),
  gpsLongitude: z.number().min(-180).max(180).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateFarmerSchema = createFarmerSchema.partial();

export const farmerListQuerySchema = paginationSchema.extend({
  villageId: z.string().cuid().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type CreateFarmerInput = z.infer<typeof createFarmerSchema>;
export type UpdateFarmerInput = z.infer<typeof updateFarmerSchema>;
export type FarmerListQuery = z.infer<typeof farmerListQuerySchema>;
