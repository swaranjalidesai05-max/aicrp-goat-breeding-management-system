import crypto from 'node:crypto';

import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';

import { env } from '../../config/env';
import { UnauthorizedError } from '../../shared/errors/AppError';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
  jti: string;
}

export interface ResetTokenPayload {
  sub: string;
  type: 'reset';
  purpose: 'password-reset';
}

export function signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'access' }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(userId: string, jti: string): string {
  return jwt.sign({ sub: userId, type: 'refresh', jti }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
    if (payload.type !== 'access') {
      throw new UnauthorizedError('Invalid access token');
    }
    return payload;
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
    if (payload.type !== 'refresh') {
      throw new UnauthorizedError('Invalid refresh token');
    }
    return payload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}

export function signResetToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'reset', purpose: 'password-reset' }, env.jwtResetSecret, {
    expiresIn: env.jwtResetExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyResetToken(token: string): ResetTokenPayload {
  try {
    const payload = jwt.verify(token, env.jwtResetSecret) as ResetTokenPayload;
    if (payload.type !== 'reset' || payload.purpose !== 'password-reset') {
      throw new UnauthorizedError('Invalid reset token');
    }
    return payload;
  } catch {
    throw new UnauthorizedError('Invalid or expired reset token');
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function newTokenId(): string {
  return crypto.randomUUID();
}

/** Parse durations like 15m / 7d into milliseconds. */
export function durationToMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) {
    throw new Error(`Invalid duration: ${duration}`);
  }
  const value = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * multipliers[unit];
}
