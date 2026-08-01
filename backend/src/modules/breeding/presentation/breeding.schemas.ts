import { z } from 'zod';

const matingTypeSchema = z.enum(['NATURAL', 'ARTIFICIAL_INSEMINATION']);
const breedingStatusSchema = z.enum([
  'PLANNED',
  'MATED',
  'PREGNANT',
  'KIDDED',
  'FAILED',
  'CANCELLED',
]);

export const createBreedingEventSchema = z.object({
  buckId: z.string().trim().min(1),
  doeId: z.string().trim().min(1),
  matingType: matingTypeSchema.optional(),
  matingDate: z.coerce.date(),
  expectedKiddingDate: z.coerce.date().optional().nullable(),
  actualKiddingDate: z.coerce.date().optional().nullable(),
  status: breedingStatusSchema.optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
  gpsLatitude: z.number().optional().nullable(),
  gpsLongitude: z.number().optional().nullable(),
});

export const updateBreedingEventSchema = createBreedingEventSchema.partial();

export const breedingListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  buckId: z.string().optional(),
  doeId: z.string().optional(),
});

export type CreateBreedingEventInput = z.infer<typeof createBreedingEventSchema>;
export type UpdateBreedingEventInput = z.infer<typeof updateBreedingEventSchema>;
