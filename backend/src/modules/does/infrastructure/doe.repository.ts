import type { AnimalStatus, Prisma } from '@prisma/client';

import { prisma } from '../../../infrastructure/database/prisma';

export class DoeRepository {
  findById(id: string) {
    return prisma.doe.findUnique({
      where: { id },
      include: { cluster: true, farmer: true, registeredBy: true },
    });
  }

  findByTagNumber(tagNumber: string) {
    return prisma.doe.findUnique({ where: { tagNumber } });
  }

  list(params: {
    skip: number;
    take: number;
    search?: string;
    status?: string;
    clusterId?: string;
    farmerId?: string;
  }) {
    const where: Prisma.DoeWhereInput = {
      ...(params.search
        ? {
            OR: [
              { tagNumber: { contains: params.search, mode: 'insensitive' as Prisma.QueryMode } },
              { name: { contains: params.search, mode: 'insensitive' as Prisma.QueryMode } },
              { breed: { contains: params.search, mode: 'insensitive' as Prisma.QueryMode } },
              { notes: { contains: params.search, mode: 'insensitive' as Prisma.QueryMode } },
            ],
          }
        : {}),
      ...(params.status ? { status: params.status as Prisma.EnumAnimalStatusFilter } : {}),
      ...(params.clusterId ? { clusterId: params.clusterId } : {}),
      ...(params.farmerId ? { farmerId: params.farmerId } : {}),
    };

    return Promise.all([
      prisma.doe.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: { cluster: true, farmer: true },
      }),
      prisma.doe.count({ where }),
    ]);
  }

  create(data: {
    tagNumber: string;
    name: string | null;
    breed: string;
    dateOfBirth: Date | null;
    status: AnimalStatus;
    clusterId: string;
    farmerId: string | null;
    sireTag: string | null;
    damTag: string | null;
    microchipId: string | null;
    notes: string | null;
    gpsLatitude: number | null;
    gpsLongitude: number | null;
    registeredById: string;
  }) {
    return prisma.doe.create({ data });
  }

  update(id: string, data: Prisma.DoeUpdateInput) {
    return prisma.doe.update({ where: { id }, data });
  }
}

export const doeRepository = new DoeRepository();
