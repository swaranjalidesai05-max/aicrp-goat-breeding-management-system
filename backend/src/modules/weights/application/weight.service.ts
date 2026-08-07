import type { WeightSubjectType } from '@prisma/client';
import { writeAuditLog } from '../../../infrastructure/audit/auditWriter';
import { NotFoundError } from '../../../shared/errors/AppError';
import { buckRepository } from '../../bucks/infrastructure/buck.repository';
import { doeRepository } from '../../does/infrastructure/doe.repository';
import { progenyRepository } from '../../progeny/infrastructure/progeny.repository';
import { weightRepository } from '../infrastructure/weight.repository';
import type { CreateWeightRecordInput, UpdateWeightRecordInput } from '../presentation/weight.schemas';

export class WeightService {
  async list(page: number, limit: number, options?: { subjectType?: WeightSubjectType; subjectId?: string }) {
    const skip = (page - 1) * limit;
    const [data, total] = await weightRepository.list({
      skip,
      take: limit,
      subjectType: options?.subjectType,
      subjectId: options?.subjectId,
    });
    return { data, total };
  }

  async getById(id: string) {
    const weight = await weightRepository.findById(id);
    if (!weight) {
      throw new NotFoundError('Weight record');
    }
    return weight;
  }

  async create(input: CreateWeightRecordInput, actorId: string) {
    const exists = await this.subjectExists(input.subjectType, input.subjectId);
    if (!exists) {
      throw new NotFoundError(`${input.subjectType} subject`);
    }

    const weight = await weightRepository.create({
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      weightKg: input.weightKg,
      recordedAt: input.recordedAt,
      notes: input.notes ?? null,
      gpsLatitude: input.gpsLatitude ?? null,
      gpsLongitude: input.gpsLongitude ?? null,
      recordedById: actorId,
    });

    await writeAuditLog({
      userId: actorId,
      action: 'WEIGHT_CREATE',
      entityType: 'WeightRecord',
      entityId: weight.id,
      metadata: { subjectType: weight.subjectType, subjectId: weight.subjectId, weightKg: weight.weightKg },
    });

    return weight;
  }

  async update(id: string, input: UpdateWeightRecordInput, actorId: string) {
    const existing = await weightRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Weight record');
    }

    if (input.subjectType || input.subjectId) {
      const subjectType = input.subjectType ?? existing.subjectType;
      const subjectId = input.subjectId ?? existing.subjectId;
      const exists = await this.subjectExists(subjectType, subjectId);
      if (!exists) {
        throw new NotFoundError(`${subjectType} subject`);
      }
    }

    const weight = await weightRepository.update(id, {
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      weightKg: input.weightKg,
      recordedAt: input.recordedAt,
      notes: input.notes ?? existing.notes,
      gpsLatitude: input.gpsLatitude ?? existing.gpsLatitude,
      gpsLongitude: input.gpsLongitude ?? existing.gpsLongitude,
    });

    await writeAuditLog({
      userId: actorId,
      action: 'WEIGHT_UPDATE',
      entityType: 'WeightRecord',
      entityId: weight.id,
      metadata: input,
    });

    return weight;
  }

  private async subjectExists(subjectType: string, subjectId: string) {
    switch (subjectType) {
      case 'BUCK':
        return (await buckRepository.findById(subjectId)) !== null;
      case 'DOE':
        return (await doeRepository.findById(subjectId)) !== null;
      case 'PROGENY':
        return (await progenyRepository.findById(subjectId)) !== null;
      default:
        return false;
    }
  }
}

export const weightService = new WeightService();
