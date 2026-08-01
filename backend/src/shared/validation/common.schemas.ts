import { z } from 'zod';

export const gpsFieldsSchema = z.object({
  gpsLatitude: z.number().min(-90).max(90).optional().nullable(),
  gpsLongitude: z.number().min(-180).max(180).optional().nullable(),
});

export const idParamSchema = z.object({
  id: z.string().cuid(),
});
