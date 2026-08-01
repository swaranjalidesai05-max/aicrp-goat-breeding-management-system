import type { Cluster, Prisma } from '@prisma/client';

import { prisma } from '../../../infrastructure/database/prisma';

export class ClusterRepository {
  findById(id: string) {
    return prisma.cluster.findUnique({ where: { id } });
  }

  findByCode(code: string) {
    return prisma.cluster.findUnique({ where: { code } });
  }

  list(params: { skip: number; take: number; search?: string }) {
    const where: Prisma.ClusterWhereInput = params.search
      ? {
          OR: [
            { code: { contains: params.search, mode: 'insensitive' } },
            { name: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {};

    return Promise.all([
      prisma.cluster.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.cluster.count({ where }),
    ]);
  }

  create(data: {
    code: string;
    name: string;
    description?: string;
    district?: string;
    state?: string;
    createdById?: string;
  }) {
    return prisma.cluster.create({ data });
  }

  update(id: string, data: Prisma.ClusterUpdateInput) {
    return prisma.cluster.update({ where: { id }, data });
  }

  setActive(id: string, isActive: boolean): Promise<Cluster> {
    return prisma.cluster.update({
      where: { id },
      data: { isActive },
    });
  }
}

export const clusterRepository = new ClusterRepository();
