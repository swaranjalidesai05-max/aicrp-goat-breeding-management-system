import { writeAuditLog } from '../../../infrastructure/audit/auditWriter';
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';
import { buckRepository } from '../../bucks/infrastructure/buck.repository';
import { doeRepository } from '../../does/infrastructure/doe.repository';
import { breedingRepository } from '../infrastructure/breeding.repository';
import type {
  CreateBreedingEventInput,
  UpdateBreedingEventInput,
} from '../presentation/breeding.schemas';

export class BreedingService {
  async list(
    page: number,
    limit: number,
    options?: { search?: string; status?: string; buckId?: string; doeId?: string },
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await breedingRepository.list({
      skip,
      take: limit,
      search: options?.search,
      status: options?.status,
      buckId: options?.buckId,
      doeId: options?.doeId,
    });
    return { data, total };
  }

  async getById(id: string) {
    const breeding = await breedingRepository.findById(id);
    if (!breeding) {
      throw new NotFoundError('Breeding event');
    }
    return breeding;
  }

  async create(input: CreateBreedingEventInput, actorId: string) {
    const buck = await buckRepository.findById(input.buckId);
    if (!buck) {
      throw new NotFoundError('Buck');
    }

    const doe = await doeRepository.findById(input.doeId);
    if (!doe) {
      throw new NotFoundError('Doe');
    }

    if (buck.status !== 'ACTIVE' || doe.status !== 'ACTIVE') {
      throw new ConflictError('Only active bucks and does can be used in breeding events');
    }

    const existing = await breedingRepository.findActiveByDoe(input.doeId);
    if (existing) {
      throw new ConflictError('An active breeding event already exists for this doe');
    }

    const breeding = await breedingRepository.create({
      buckId: input.buckId,
      doeId: input.doeId,
      matingType: input.matingType ?? 'NATURAL',
      matingDate: input.matingDate,
      expectedKiddingDate: input.expectedKiddingDate ?? null,
      actualKiddingDate: input.actualKiddingDate ?? null,
      status: input.status ?? 'PLANNED',
      notes: input.notes ?? null,
      gpsLatitude: input.gpsLatitude ?? null,
      gpsLongitude: input.gpsLongitude ?? null,
      recordedById: actorId,
    });

    await writeAuditLog({
      userId: actorId,
      action: 'BREEDING_CREATE',
      entityType: 'BreedingEvent',
      entityId: breeding.id,
      metadata: { buckId: input.buckId, doeId: input.doeId },
    });

    return breeding;
  }

  async update(id: string, input: UpdateBreedingEventInput, actorId: string) {
    const existing = await breedingRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Breeding event');
    }

    if (input.buckId && input.buckId !== existing.buckId) {
      const buck = await buckRepository.findById(input.buckId);
      if (!buck) {
        throw new NotFoundError('Buck');
      }
      if (buck.status !== 'ACTIVE') {
        throw new ConflictError('Only active bucks can be used in breeding events');
      }
    }

    if (input.doeId && input.doeId !== existing.doeId) {
      const doe = await doeRepository.findById(input.doeId);
      if (!doe) {
        throw new NotFoundError('Doe');
      }
      if (doe.status !== 'ACTIVE') {
        throw new ConflictError('Only active does can be used in breeding events');
      }
    }

    const breeding = await breedingRepository.update(id, input as never);

    await writeAuditLog({
      userId: actorId,
      action: 'BREEDING_UPDATE',
      entityType: 'BreedingEvent',
      entityId: breeding.id,
      metadata: input,
    });

    return breeding;
  }

  async setStatus(id: string, status: string, actorId: string) {
    const existing = await breedingRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Breeding event');
    }

    const breeding = await breedingRepository.update(id, { status } as never);

    await writeAuditLog({
      userId: actorId,
      action: 'BREEDING_STATUS_UPDATE',
      entityType: 'BreedingEvent',
      entityId: breeding.id,
      metadata: { status },
    });

    return breeding;
  }
}

export const breedingService = new BreedingService();
