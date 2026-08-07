import type { Prisma, WeightSubjectType } from '@prisma/client';

import { prisma } from '../../../infrastructure/database/prisma';

export class WeightRepository {
  findById(id: string) {
    return prisma.weightRecord.findUnique({
      where: { id },
      include: { recordedBy: true },
    });
  }

  list(params: {
    skip: number;
    take: number;
    subjectType?: WeightSubjectType;
    subjectId?: string;
  }) {
    const where: Prisma.WeightRecordWhereInput = {
      ...(params.subjectType ? { subjectType: params.subjectType } : {}),
      ...(params.subjectId ? { subjectId: params.subjectId } : {}),
    };

    return Promise.all([
      prisma.weightRecord.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { recordedAt: 'desc' },
        include: { recordedBy: true },
      }),
      prisma.weightRecord.count({ where }),
    ]);
  }

  create(data: {
    subjectType: WeightSubjectType;
    subjectId: string;
    weightKg: number;
    recordedAt: Date;
    notes?: string | null;
    gpsLatitude?: number | null;
    gpsLongitude?: number | null;
    recordedById?: string | null;
  }) {
    return prisma.weightRecord.create({
      data,
      include: { recordedBy: true },
    });
  }

  update(
    id: string,
    data: Prisma.WeightRecordUpdateInput,
  ) {
    return prisma.weightRecord.update({
      where: { id },
      data,
      include: { recordedBy: true },
    });
  }
}

export const weightRepository = new WeightRepository();
