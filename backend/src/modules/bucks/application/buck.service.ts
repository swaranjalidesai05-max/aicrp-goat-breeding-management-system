import { writeAuditLog } from '../../../infrastructure/audit/auditWriter';
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';
import { clusterRepository } from '../../clusters/infrastructure/cluster.repository';
import { farmerRepository } from '../../farmers/infrastructure/farmer.repository';
import { buckRepository } from '../infrastructure/buck.repository';
import type { CreateBuckInput, UpdateBuckInput } from '../presentation/buck.schemas';

export class BuckService {
  async list(
    page: number,
    limit: number,
    options?: { search?: string; status?: string; clusterId?: string; farmerId?: string },
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await buckRepository.list({
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
    const buck = await buckRepository.findById(id);
    if (!buck) {
      throw new NotFoundError('Buck');
    }
    return buck;
  }

  async create(input: CreateBuckInput, actorId: string) {
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

    const existing = await buckRepository.findByTagNumber(input.tagNumber);
    if (existing) {
      throw new ConflictError('Buck tag number is already in use');
    }

    const buck = await buckRepository.create({
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
      action: 'BUCK_CREATE',
      entityType: 'Buck',
      entityId: buck.id,
      metadata: { tagNumber: buck.tagNumber, clusterId: buck.clusterId },
    });

    return buck;
  }

  async update(id: string, input: UpdateBuckInput, actorId: string) {
    const existing = await buckRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Buck');
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
      const duplicate = await buckRepository.findByTagNumber(input.tagNumber);
      if (duplicate) {
        throw new ConflictError('Buck tag number is already in use');
      }
    }

    const buck = await buckRepository.update(id, input as never);

    await writeAuditLog({
      userId: actorId,
      action: 'BUCK_UPDATE',
      entityType: 'Buck',
      entityId: buck.id,
      metadata: input,
    });

    return buck;
  }

  async setStatus(id: string, status: string, actorId: string) {
    const existing = await buckRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Buck');
    }

    const buck = await buckRepository.update(id, { status } as never);

    await writeAuditLog({
      userId: actorId,
      action: 'BUCK_STATUS_UPDATE',
      entityType: 'Buck',
      entityId: buck.id,
      metadata: { status },
    });

    return buck;
  }
}

export const buckService = new BuckService();
