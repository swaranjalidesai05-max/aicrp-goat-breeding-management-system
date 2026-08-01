import type { Farmer, Prisma } from '@prisma/client';

import { prisma } from '../../../infrastructure/database/prisma';

export class FarmerRepository {
  findById(id: string) {
    return prisma.farmer.findUnique({ where: { id } });
  }

  findByVillageAndCode(villageId: string, code: string) {
    return prisma.farmer.findUnique({ where: { villageId_code: { villageId, code } } });
  }

  findByPhone(phone: string) {
    return prisma.farmer.findFirst({ where: { phone } });
  }

  list(params: {
    skip: number;
    take: number;
    search?: string;
    villageId?: string;
    status?: string;
  }) {
    const where: Prisma.FarmerWhereInput = {
      ...(params.villageId ? { villageId: params.villageId } : {}),
      ...(params.status ? { isActive: params.status === 'active' } : {}),
      ...(params.search
        ? {
            OR: [
              { code: { contains: params.search, mode: 'insensitive' } },
              { fullName: { contains: params.search, mode: 'insensitive' } },
              { phone: { contains: params.search, mode: 'insensitive' } },
              { address: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return Promise.all([
      prisma.farmer.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: { village: true },
      }),
      prisma.farmer.count({ where }),
    ]);
  }

  create(data: {
    villageId: string;
    code: string;
    fullName: string;
    phone?: string | null;
    address?: string | null;
    aadhaar?: string | null;
    gpsLatitude?: number | null;
    gpsLongitude?: number | null;
    isActive?: boolean;
  }) {
    return prisma.farmer.create({ data });
  }

  update(id: string, data: Prisma.FarmerUpdateInput) {
    return prisma.farmer.update({ where: { id }, data });
  }

  setActive(id: string, isActive: boolean): Promise<Farmer> {
    return prisma.farmer.update({ where: { id }, data: { isActive } });
  }
}

export const farmerRepository = new FarmerRepository();
