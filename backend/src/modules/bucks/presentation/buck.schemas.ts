import { z } from 'zod';

const animalStatusSchema = z.enum(['ACTIVE', 'SOLD', 'DEAD', 'TRANSFERRED']);

export const createBuckSchema = z.object({
  tagNumber: z.string().trim().min(1).max(50),
  name: z.string().trim().max(100).optional().nullable(),
  breed: z.string().trim().max(100).optional().nullable(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  status: animalStatusSchema.optional(),
  clusterId: z.string().trim().min(1),
  farmerId: z.string().trim().min(1).optional().nullable(),
  sireTag: z.string().trim().max(50).optional().nullable(),
  damTag: z.string().trim().max(50).optional().nullable(),
  microchipId: z.string().trim().max(50).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  gpsLatitude: z.number().optional().nullable(),
  gpsLongitude: z.number().optional().nullable(),
});

export const updateBuckSchema = createBuckSchema.partial();

export const buckListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  clusterId: z.string().optional(),
  farmerId: z.string().optional(),
});

export type CreateBuckInput = z.infer<typeof createBuckSchema>;
export type UpdateBuckInput = z.infer<typeof updateBuckSchema>;
