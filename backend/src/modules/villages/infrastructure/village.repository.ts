import type { Prisma, Village } from '@prisma/client';

import { prisma } from '../../../infrastructure/database/prisma';

export class VillageRepository {
  findById(id: string) {
    return prisma.village.findUnique({ where: { id } });
  }

  findByClusterAndCode(clusterId: string, code: string) {
    return prisma.village.findUnique({
      where: { clusterId_code: { clusterId, code } },
    });
  }

  list(params: {
    skip: number;
    take: number;
    search?: string;
    clusterId?: string;
  }) {
    const where: Prisma.VillageWhereInput = {
      ...(params.clusterId ? { clusterId: params.clusterId } : {}),
      ...(params.search
        ? {
            OR: [
              { code: { contains: params.search, mode: 'insensitive' } },
              { name: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return Promise.all([
      prisma.village.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.village.count({ where }),
    ]);
  }

  create(data: {
    clusterId: string;
    code: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
  }) {
    return prisma.village.create({ data });
  }

  update(id: string, data: Prisma.VillageUpdateInput) {
    return prisma.village.update({ where: { id }, data });
  }

  setActive(id: string, isActive: boolean): Promise<Village> {
    return prisma.village.update({
      where: { id },
      data: { isActive },
    });
  }
}

export const villageRepository = new VillageRepository();
