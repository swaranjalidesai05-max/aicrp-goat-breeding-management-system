import { z } from 'zod';

export const createClusterSchema = z.object({
  code: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(1000).optional().nullable(),
  district: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateClusterSchema = createClusterSchema.partial();

export const setActiveSchema = z.object({
  isActive: z.boolean(),
});

export type CreateClusterInput = z.infer<typeof createClusterSchema>;
export type UpdateClusterInput = z.infer<typeof updateClusterSchema>;
