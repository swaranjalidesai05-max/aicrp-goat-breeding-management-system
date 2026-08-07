import { writeAuditLog } from '../../../infrastructure/audit/auditWriter';
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';
import { farmerRepository } from '../../farmers/infrastructure/farmer.repository';
import { progenyRepository } from '../infrastructure/progeny.repository';
import type { CreateProgenyInput, UpdateProgenyInput } from '../presentation/progeny.schemas';

export class ProgenyService {
  async list(page: number, limit: number, options?: { search?: string; breedingEventId?: string; farmerId?: string; status?: string }) {
    const skip = (page - 1) * limit;
    const [data, total] = await progenyRepository.list({
      skip,
      take: limit,
      search: options?.search,
      breedingEventId: options?.breedingEventId,
      farmerId: options?.farmerId,
      status: options?.status as any,
    });
    return { data, total };
  }

  async getById(id: string) {
    const progeny = await progenyRepository.findById(id);
    if (!progeny) {
      throw new NotFoundError('Progeny');
    }
    return progeny;
  }

  async create(input: CreateProgenyInput, actorId: string) {
    const breedingEvent = await progenyRepository.breedingEventExists(input.breedingEventId);
    if (!breedingEvent) {
      throw new NotFoundError('Breeding event');
    }

    if (input.farmerId) {
      const farmer = await farmerRepository.findById(input.farmerId);
      if (!farmer) {
        throw new NotFoundError('Farmer');
      }
    }

    const existing = await progenyRepository.findByTagNumber(input.tagNumber);
    if (existing) {
      throw new ConflictError('Progeny tag number is already in use');
    }

    const progeny = await progenyRepository.create({
      breedingEventId: input.breedingEventId,
      tagNumber: input.tagNumber,
      sex: input.sex,
      birthDate: input.birthDate,
      birthWeightKg: input.birthWeightKg ?? null,
      status: input.status ?? 'ACTIVE',
      farmerId: input.farmerId ?? null,
      notes: input.notes ?? null,
      gpsLatitude: input.gpsLatitude ?? null,
      gpsLongitude: input.gpsLongitude ?? null,
      registeredById: actorId,
    });

    await progenyRepository.setBreedingEventKidded(input.breedingEventId);

    await writeAuditLog({
      userId: actorId,
      action: 'PROGENY_CREATE',
      entityType: 'Progeny',
      entityId: progeny.id,
      metadata: { tagNumber: progeny.tagNumber, breedingEventId: progeny.breedingEventId },
    });

    return progeny;
  }

  async update(id: string, input: UpdateProgenyInput, actorId: string) {
    const existing = await progenyRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Progeny');
    }

    if (input.breedingEventId && input.breedingEventId !== existing.breedingEventId) {
      const breedingEvent = await progenyRepository.breedingEventExists(input.breedingEventId);
      if (!breedingEvent) {
        throw new NotFoundError('Breeding event');
      }
    }

    if (input.farmerId && input.farmerId !== existing.farmerId) {
      const farmer = await farmerRepository.findById(input.farmerId);
      if (!farmer) {
        throw new NotFoundError('Farmer');
      }
    }

    if (input.tagNumber && input.tagNumber !== existing.tagNumber) {
      const duplicate = await progenyRepository.findByTagNumber(input.tagNumber);
      if (duplicate) {
        throw new ConflictError('Progeny tag number is already in use');
      }
    }

    const progeny = await progenyRepository.update(id, {
      tagNumber: input.tagNumber,
      sex: input.sex,
      birthDate: input.birthDate,
      birthWeightKg: input.birthWeightKg ?? existing.birthWeightKg,
      status: input.status,
      farmerId: input.farmerId ?? undefined,
      notes: input.notes ?? existing.notes,
      gpsLatitude: input.gpsLatitude ?? existing.gpsLatitude,
      gpsLongitude: input.gpsLongitude ?? existing.gpsLongitude,
    });

    await writeAuditLog({
      userId: actorId,
      action: 'PROGENY_UPDATE',
      entityType: 'Progeny',
      entityId: progeny.id,
      metadata: input,
    });

    return progeny;
  }

  async setStatus(id: string, status: string, actorId: string) {
    const existing = await progenyRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Progeny');
    }

    const progeny = await progenyRepository.updateStatus(id, status as any);

    await writeAuditLog({
      userId: actorId,
      action: 'PROGENY_STATUS_UPDATE',
      entityType: 'Progeny',
      entityId: progeny.id,
      metadata: { status },
    });

    return progeny;
  }
}

export const progenyService = new ProgenyService();
