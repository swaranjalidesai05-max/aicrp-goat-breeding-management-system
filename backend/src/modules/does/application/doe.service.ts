import { writeAuditLog } from '../../../infrastructure/audit/auditWriter';
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';
import { clusterRepository } from '../../clusters/infrastructure/cluster.repository';
import { farmerRepository } from '../../farmers/infrastructure/farmer.repository';
import { doeRepository } from '../infrastructure/doe.repository';
import type { CreateDoeInput, UpdateDoeInput } from '../presentation/doe.schemas';

export class DoeService {
  async list(
    page: number,
    limit: number,
    options?: { search?: string; status?: string; clusterId?: string; farmerId?: string },
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await doeRepository.list({
      skip,
      take: limit,
      search: options?.search,
      status: options?.status,
      clusterId: options?.clusterId,
      farmerId: options?.farmerId,
    });
    return { data, total };
  }

  async getById(id: string) {
    const doe = await doeRepository.findById(id);
    if (!doe) {
      throw new NotFoundError('Doe');
    }
    return doe;
  }

  async create(input: CreateDoeInput, actorId: string) {
    const cluster = await clusterRepository.findById(input.clusterId);
    if (!cluster) {
      throw new NotFoundError('Cluster');
    }

    if (input.farmerId) {
      const farmer = await farmerRepository.findById(input.farmerId);
      if (!farmer) {
        throw new NotFoundError('Farmer');
      }
    }

    const existing = await doeRepository.findByTagNumber(input.tagNumber);
    if (existing) {
      throw new ConflictError('Doe tag number is already in use');
    }

    const doe = await doeRepository.create({
      tagNumber: input.tagNumber,
      name: input.name ?? null,
      breed: input.breed ?? 'Sangamneri',
      dateOfBirth: input.dateOfBirth ?? null,
      status: input.status ?? 'ACTIVE',
      clusterId: input.clusterId,
      farmerId: input.farmerId ?? null,
      sireTag: input.sireTag ?? null,
      damTag: input.damTag ?? null,
      microchipId: input.microchipId ?? null,
      notes: input.notes ?? null,
      gpsLatitude: input.gpsLatitude ?? null,
      gpsLongitude: input.gpsLongitude ?? null,
      registeredById: actorId,
    });

    await writeAuditLog({
      userId: actorId,
      action: 'DOE_CREATE',
      entityType: 'Doe',
      entityId: doe.id,
      metadata: { tagNumber: doe.tagNumber, clusterId: doe.clusterId },
    });

    return doe;
  }

  async update(id: string, input: UpdateDoeInput, actorId: string) {
    const existing = await doeRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Doe');
    }

    if (input.clusterId && input.clusterId !== existing.clusterId) {
      const cluster = await clusterRepository.findById(input.clusterId);
      if (!cluster) {
        throw new NotFoundError('Cluster');
      }
    }

    if (input.farmerId && input.farmerId !== existing.farmerId) {
      const farmer = await farmerRepository.findById(input.farmerId);
      if (!farmer) {
        throw new NotFoundError('Farmer');
      }
    }

    if (input.tagNumber && input.tagNumber !== existing.tagNumber) {
      const duplicate = await doeRepository.findByTagNumber(input.tagNumber);
      if (duplicate) {
        throw new ConflictError('Doe tag number is already in use');
      }
    }

    const doe = await doeRepository.update(id, input as never);

    await writeAuditLog({
      userId: actorId,
      action: 'DOE_UPDATE',
      entityType: 'Doe',
      entityId: doe.id,
      metadata: input,
    });

    return doe;
  }

  async setStatus(id: string, status: string, actorId: string) {
    const existing = await doeRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Doe');
    }

    const doe = await doeRepository.update(id, { status } as never);

    await writeAuditLog({
      userId: actorId,
      action: 'DOE_STATUS_UPDATE',
      entityType: 'Doe',
      entityId: doe.id,
      metadata: { status },
    });

    return doe;
  }
}

export const doeService = new DoeService();
