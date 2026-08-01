import type { BreedingStatus, MatingType, Prisma } from '@prisma/client';

import { prisma } from '../../../infrastructure/database/prisma';

export class BreedingRepository {
  findById(id: string) {
    return prisma.breedingEvent.findUnique({
      where: { id },
      include: { buck: true, doe: true, recordedBy: true },
    });
  }

  findActiveByDoe(doeId: string) {
    return prisma.breedingEvent.findFirst({
      where: { doeId, status: { in: ['PLANNED', 'MATED', 'PREGNANT'] } },
      orderBy: { createdAt: 'desc' },
    });
  }

  list(params: {
    skip: number;
    take: number;
    search?: string;
    status?: string;
    buckId?: string;
    doeId?: string;
  }) {
    const where: Prisma.BreedingEventWhereInput = {
      ...(params.search
        ? {
            OR: [{ notes: { contains: params.search, mode: 'insensitive' as Prisma.QueryMode } }],
          }
        : {}),
      ...(params.status ? { status: params.status as Prisma.EnumBreedingStatusFilter } : {}),
      ...(params.buckId ? { buckId: params.buckId } : {}),
      ...(params.doeId ? { doeId: params.doeId } : {}),
    };

    return Promise.all([
      prisma.breedingEvent.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { matingDate: 'desc' },
        include: { buck: true, doe: true },
      }),
      prisma.breedingEvent.count({ where }),
    ]);
  }

  create(data: {
    buckId: string;
    doeId: string;
    matingType: MatingType;
    matingDate: Date;
    expectedKiddingDate: Date | null;
    actualKiddingDate: Date | null;
    status: BreedingStatus;
    notes: string | null;
    gpsLatitude: number | null;
    gpsLongitude: number | null;
    recordedById: string;
  }) {
    return prisma.breedingEvent.create({ data });
  }

  update(id: string, data: Prisma.BreedingEventUpdateInput) {
    return prisma.breedingEvent.update({ where: { id }, data });
  }
}

export const breedingRepository = new BreedingRepository();
