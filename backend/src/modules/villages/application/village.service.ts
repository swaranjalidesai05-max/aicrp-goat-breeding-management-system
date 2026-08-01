import { writeAuditLog } from '../../../infrastructure/audit/auditWriter';
import {
  ConflictError,
  NotFoundError,
} from '../../../shared/errors/AppError';
import { clusterRepository } from '../../clusters/infrastructure/cluster.repository';
import { villageRepository } from '../infrastructure/village.repository';
import type {
  CreateVillageInput,
  UpdateVillageInput,
} from '../presentation/village.schemas';

export class VillageService {
  async list(
    page: number,
    limit: number,
    options?: { search?: string; clusterId?: string },
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await villageRepository.list({
      skip,
      take: limit,
      search: options?.search,
      clusterId: options?.clusterId,
    });
    return { data, total };
  }

  async getById(id: string) {
    const village = await villageRepository.findById(id);
    if (!village) {
      throw new NotFoundError('Village');
    }
    return village;
  }

  async create(input: CreateVillageInput, actorId: string) {
    const cluster = await clusterRepository.findById(input.clusterId);
    if (!cluster) {
      throw new NotFoundError('Cluster');
    }

    const existing = await villageRepository.findByClusterAndCode(
      input.clusterId,
      input.code,
    );
    if (existing) {
      throw new ConflictError('Village code is already in use in this cluster');
    }

    const village = await villageRepository.create(input);

    await writeAuditLog({
      userId: actorId,
      action: 'VILLAGE_CREATE',
      entityType: 'Village',
      entityId: village.id,
      metadata: {
        clusterId: village.clusterId,
        code: village.code,
        name: village.name,
      },
    });

    return village;
  }

  async update(id: string, input: UpdateVillageInput, actorId: string) {
    const existing = await villageRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Village');
    }

    if (input.code && input.code !== existing.code) {
      const duplicate = await villageRepository.findByClusterAndCode(
        existing.clusterId,
        input.code,
      );
      if (duplicate) {
        throw new ConflictError('Village code is already in use in this cluster');
      }
    }

    const village = await villageRepository.update(id, input);

    await writeAuditLog({
      userId: actorId,
      action: 'VILLAGE_UPDATE',
      entityType: 'Village',
      entityId: village.id,
      metadata: input,
    });

    return village;
  }

  async setActive(id: string, isActive: boolean, actorId: string) {
    const existing = await villageRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Village');
    }

    const village = await villageRepository.setActive(id, isActive);

    await writeAuditLog({
      userId: actorId,
      action: isActive ? 'VILLAGE_ACTIVATE' : 'VILLAGE_DEACTIVATE',
      entityType: 'Village',
      entityId: id,
    });

    return village;
  }
}

export const villageService = new VillageService();
