import { randomUUID } from 'node:crypto';

import { writeAuditLog } from '../../../infrastructure/audit/auditWriter';
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';
import { villageRepository } from '../../villages/infrastructure/village.repository';
import { farmerRepository } from '../infrastructure/farmer.repository';
import type { CreateFarmerInput, UpdateFarmerInput } from '../presentation/farmer.schemas';

export class FarmerService {
  async list(
    page: number,
    limit: number,
    options?: { search?: string; villageId?: string; status?: string },
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await farmerRepository.list({
      skip,
      take: limit,
      search: options?.search,
      villageId: options?.villageId,
      status: options?.status,
    });
    return { data, total };
  }

  async getById(id: string) {
    const farmer = await farmerRepository.findById(id);
    if (!farmer) {
      throw new NotFoundError('Farmer');
    }
    return farmer;
  }

  async create(input: CreateFarmerInput, actorId: string) {
    const village = await villageRepository.findById(input.villageId);
    if (!village) {
      throw new NotFoundError('Village');
    }

    if (input.phone) {
      const duplicate = await farmerRepository.findByPhone(input.phone);
      if (duplicate) {
        throw new ConflictError('Mobile number is already registered');
      }
    }

    const code = this.generateCode();
    const farmer = await farmerRepository.create({
      villageId: input.villageId,
      code,
      fullName: input.fullName,
      phone: input.phone ?? null,
      address: input.address ?? null,
      aadhaar: input.aadhaar ?? null,
      gpsLatitude: input.gpsLatitude ?? null,
      gpsLongitude: input.gpsLongitude ?? null,
      isActive: input.isActive ?? true,
    });

    await writeAuditLog({
      userId: actorId,
      action: 'FARMER_CREATE',
      entityType: 'Farmer',
      entityId: farmer.id,
      metadata: { code, villageId: input.villageId, fullName: input.fullName },
    });

    return farmer;
  }

  async update(id: string, input: UpdateFarmerInput, actorId: string) {
    const existing = await farmerRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Farmer');
    }

    if (input.phone && input.phone !== existing.phone) {
      const duplicate = await farmerRepository.findByPhone(input.phone);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError('Mobile number is already registered');
      }
    }

    if (input.villageId && input.villageId !== existing.villageId) {
      const village = await villageRepository.findById(input.villageId);
      if (!village) {
        throw new NotFoundError('Village');
      }
    }

    const farmer = await farmerRepository.update(id, input as never);

    await writeAuditLog({
      userId: actorId,
      action: 'FARMER_UPDATE',
      entityType: 'Farmer',
      entityId: farmer.id,
      metadata: input,
    });

    return farmer;
  }

  async setActive(id: string, isActive: boolean, actorId: string) {
    const existing = await farmerRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Farmer');
    }

    const farmer = await farmerRepository.setActive(id, isActive);

    await writeAuditLog({
      userId: actorId,
      action: isActive ? 'FARMER_ACTIVATE' : 'FARMER_DEACTIVATE',
      entityType: 'Farmer',
      entityId: id,
    });

    return farmer;
  }

  private generateCode() {
    return `FR-${randomUUID().slice(0, 8).toUpperCase()}`;
  }
}

export const farmerService = new FarmerService();
