import type { Role, User } from '@prisma/client';

import { prisma } from '../../../infrastructure/database/prisma';

export type PublicUser = Pick<
  User,
  'id' | 'email' | 'fullName' | 'phone' | 'role' | 'isActive' | 'createdAt' | 'updatedAt'
>;

export const publicUserSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: publicUserSelect });
  }

  findByIdWithSecret(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  create(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    phone?: string;
    role: Role;
  }) {
    return prisma.user.create({
      data,
      select: publicUserSelect,
    });
  }

  updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
      select: publicUserSelect,
    });
  }

  updateUser(id: string, data: { email?: string; fullName?: string; phone?: string; role?: Role }) {
    return prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    });
  }

  list(params: { skip: number; take: number; search?: string }) {
    const where = params.search
      ? {
          OR: [
            { email: { contains: params.search, mode: 'insensitive' as const } },
            { fullName: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    return Promise.all([
      prisma.user.findMany({
        where,
        select: publicUserSelect,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
  }

  setActive(id: string, isActive: boolean) {
    return prisma.user.update({
      where: { id },
      data: { isActive },
      select: publicUserSelect,
    });
  }
}

export class PasswordResetTokenRepository {
  create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    return prisma.passwordResetToken.create({ data });
  }

  findValidByHash(tokenHash: string) {
    return prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  markUsed(tokenHash: string) {
    return prisma.passwordResetToken.updateMany({
      where: { tokenHash, usedAt: null },
      data: { usedAt: new Date() },
    });
  }
}

export class RefreshTokenRepository {
  create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    return prisma.refreshToken.create({ data });
  }

  findValidByHash(tokenHash: string) {
    return prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  }

  revokeByHash(tokenHash: string) {
    return prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  revokeAllForUser(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

export const userRepository = new UserRepository();
export const passwordResetTokenRepository = new PasswordResetTokenRepository();
export const refreshTokenRepository = new RefreshTokenRepository();
