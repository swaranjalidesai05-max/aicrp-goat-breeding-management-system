import { writeAuditLog } from '../../../infrastructure/audit/auditWriter';
import {
  ConflictError,
  NotFoundError,
} from '../../../shared/errors/AppError';
import { clusterRepository } from '../infrastructure/cluster.repository';
import type {
  CreateClusterInput,
  UpdateClusterInput,
} from '../presentation/cluster.schemas';

export class ClusterService {
  async list(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const [data, total] = await clusterRepository.list({ skip, take: limit, search });
    return { data, total };
  }

  async getById(id: string) {
    const cluster = await clusterRepository.findById(id);
    if (!cluster) {
      throw new NotFoundError('Cluster');
    }
    return cluster;
  }

  async create(input: CreateClusterInput, actorId: string) {
    const existing = await clusterRepository.findByCode(input.code);
    if (existing) {
      throw new ConflictError('Cluster code is already in use');
    }

    const cluster = await clusterRepository.create({
      code: input.code,
      name: input.name,
      description: input.description ?? undefined,
      district: input.district ?? undefined,
      state: input.state ?? undefined,
      createdById: actorId,
    });

    await writeAuditLog({
      userId: actorId,
      action: 'CLUSTER_CREATE',
      entityType: 'Cluster',
      entityId: cluster.id,
      metadata: { code: cluster.code, name: cluster.name },
    });

    return cluster;
  }

  async update(id: string, input: UpdateClusterInput, actorId: string) {
    const existing = await clusterRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Cluster');
    }

    if (input.code && input.code !== existing.code) {
      const duplicate = await clusterRepository.findByCode(input.code);
      if (duplicate) {
        throw new ConflictError('Cluster code is already in use');
      }
    }

    const cluster = await clusterRepository.update(id, input);

    await writeAuditLog({
      userId: actorId,
      action: 'CLUSTER_UPDATE',
      entityType: 'Cluster',
      entityId: cluster.id,
      metadata: input,
    });

    return cluster;
  }

  async setActive(id: string, isActive: boolean, actorId: string) {
    const existing = await clusterRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Cluster');
    }

    const cluster = await clusterRepository.setActive(id, isActive);

    await writeAuditLog({
      userId: actorId,
      action: isActive ? 'CLUSTER_ACTIVATE' : 'CLUSTER_DEACTIVATE',
      entityType: 'Cluster',
      entityId: id,
    });

    return cluster;
  }
}

export const clusterService = new ClusterService();
