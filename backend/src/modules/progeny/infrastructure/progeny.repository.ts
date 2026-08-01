import type { AnimalStatus, Prisma, Sex } from '@prisma/client';

import { prisma } from '../../../infrastructure/database/prisma';

export const progenyInclude = {
  breedingEvent: {
    select: {
      id: true,
      buckId: true,
      doeId: true,
      status: true,
      matingDate: true,
    },
  },
  farmer: {
    select: { id: true, code: true, fullName: true },
  },
  registeredBy: {
    select: { id: true, fullName: true, email: true },
  },
} as const;

export type ProgenyListFilters = {
  skip: number;
  take: number;
  search?: string;
  breedingEventId?: string;
  farmerId?: string;
  status?: AnimalStatus;
};

export class ProgenyRepository {
  findById(id: string) {
    return prisma.progeny.findUnique({
      where: { id },
      include: progenyInclude,
    });
  }

  findByTagNumber(tagNumber: string) {
    return prisma.progeny.findUnique({ where: { tagNumber } });
  }

  list(filters: ProgenyListFilters) {
    const where: Prisma.ProgenyWhereInput = {};

    if (filters.breedingEventId) {
      where.breedingEventId = filters.breedingEventId;
    }
    if (filters.farmerId) {
      where.farmerId = filters.farmerId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.search) {
      where.tagNumber = { contains: filters.search, mode: 'insensitive' };
    }

    return Promise.all([
      prisma.progeny.findMany({
        where,
        include: progenyInclude,
        skip: filters.skip,
        take: filters.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.progeny.count({ where }),
    ]);
  }

  create(data: {
    breedingEventId: string;
    tagNumber: string;
    sex: Sex;
    birthDate: Date;
    birthWeightKg?: number | null;
    status?: AnimalStatus;
    farmerId?: string | null;
    notes?: string | null;
    gpsLatitude?: number | null;
    gpsLongitude?: number | null;
    registeredById?: string | null;
  }) {
    return prisma.progeny.create({
      data,
      include: progenyInclude,
    });
  }

  update(
    id: string,
    data: {
      tagNumber?: string;
      sex?: Sex;
      birthDate?: Date;
      birthWeightKg?: number | null;
      status?: AnimalStatus;
      farmerId?: string | null;
      notes?: string | null;
      gpsLatitude?: number | null;
      gpsLongitude?: number | null;
    },
  ) {
    return prisma.progeny.update({
      where: { id },
      data,
      include: progenyInclude,
    });
  }

  updateStatus(id: string, status: AnimalStatus) {
    return prisma.progeny.update({
      where: { id },
      data: { status },
      include: progenyInclude,
    });
  }

  breedingEventExists(id: string) {
    return prisma.breedingEvent.findUnique({ where: { id } });
  }

  farmerExists(id: string) {
    return prisma.farmer.findUnique({ where: { id } });
  }

  setBreedingEventKidded(breedingEventId: string) {
    return prisma.breedingEvent.updateMany({
      where: {
        id: breedingEventId,
        status: { not: 'KIDDED' },
      },
      data: { status: 'KIDDED' },
    });
  }
}

export const progenyRepository = new ProgenyRepository();
