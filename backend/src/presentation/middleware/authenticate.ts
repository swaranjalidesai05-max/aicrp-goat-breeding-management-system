import type { Request } from 'express';

import { verifyAccessToken } from '../../infrastructure/security/jwt';
import { UnauthorizedError } from '../../shared/errors/AppError';
import { prisma } from '../../infrastructure/database/prisma';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing Bearer token');
  }

  const token = header.slice('Bearer '.length).trim();
  const payload = verifyAccessToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError('User is inactive or does not exist');
  }

  req.user = { id: user.id, email: user.email, role: user.role };
  next();
});

export function requireAuthUser(req: Request) {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return req.user;
}
