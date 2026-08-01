import {
  durationToMs,
  hashToken,
  newTokenId,
  signAccessToken,
  signRefreshToken,
  signResetToken,
  verifyRefreshToken,
  verifyResetToken,
} from '../../../infrastructure/security/jwt';
import { hashPassword, verifyPassword } from '../../../infrastructure/security/password';
import { writeAuditLog } from '../../../infrastructure/audit/auditWriter';
import { env } from '../../../config/env';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../../shared/errors/AppError';
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterUserInput,
  ResetPasswordInput,
  ResetUserPasswordInput,
  UpdateUserInput,
} from '../presentation/auth.schemas';
import {
  passwordResetTokenRepository,
  refreshTokenRepository,
  userRepository,
  type PublicUser,
} from '../infrastructure/user.repository';
import { sendPasswordResetEmail } from '../infrastructure/passwordResetMailer';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export class AuthService {
  async login(
    input: LoginInput,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = await this.issueTokens(user.id, user.email, user.role, meta);
    await writeAuditLog({
      userId: user.id,
      action: 'AUTH_LOGIN',
      entityType: 'User',
      entityId: user.id,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    const { passwordHash: _, ...publicUser } = user;
    return { user: publicUser, tokens };
  }

  async refresh(
    refreshToken: string,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<AuthTokens> {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);
    const stored = await refreshTokenRepository.findValidByHash(tokenHash);

    if (!stored || stored.userId !== payload.sub) {
      throw new UnauthorizedError('Refresh token is invalid or revoked');
    }

    if (!stored.user.isActive) {
      throw new UnauthorizedError('User is inactive');
    }

    await refreshTokenRepository.revokeByHash(tokenHash);
    return this.issueTokens(stored.user.id, stored.user.email, stored.user.role, meta);
  }

  async logout(refreshToken: string, userId?: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    await refreshTokenRepository.revokeByHash(tokenHash);
    if (userId) {
      await writeAuditLog({
        userId,
        action: 'AUTH_LOGOUT',
        entityType: 'User',
        entityId: userId,
      });
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await refreshTokenRepository.revokeAllForUser(userId);
    await writeAuditLog({
      userId,
      action: 'AUTH_LOGOUT_ALL',
      entityType: 'User',
      entityId: userId,
    });
  }

  async register(input: RegisterUserInput, actorId: string): Promise<PublicUser> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('Email is already registered');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone,
      role: input.role,
    });

    await writeAuditLog({
      userId: actorId,
      action: 'USER_CREATE',
      entityType: 'User',
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
    });

    return user;
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await userRepository.findByIdWithSecret(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const valid = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!valid) {
      throw new ValidationError('Current password is incorrect');
    }

    if (input.currentPassword === input.newPassword) {
      throw new ValidationError('New password must be different');
    }

    const passwordHash = await hashPassword(input.newPassword);
    await userRepository.updatePassword(userId, passwordHash);
    await refreshTokenRepository.revokeAllForUser(userId);
    await writeAuditLog({
      userId,
      action: 'AUTH_PASSWORD_CHANGE',
      entityType: 'User',
      entityId: userId,
    });
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.isActive) {
      return { message: 'If an account exists, a password reset link has been prepared.' };
    }

    const resetToken = signResetToken(user.id);
    const tokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + durationToMs(env.jwtResetExpiresIn));

    await passwordResetTokenRepository.create({ userId: user.id, tokenHash, expiresAt });
    await sendPasswordResetEmail(
      user.email,
      `${env.frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`,
    );

    await writeAuditLog({
      userId: user.id,
      action: 'AUTH_FORGOT_PASSWORD',
      entityType: 'User',
      entityId: user.id,
      metadata: { expiresAt },
    });

    return { message: 'If an account exists, a password reset link has been prepared.' };
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const payload = verifyResetToken(input.token);
    const tokenHash = hashToken(input.token);
    const storedToken = await passwordResetTokenRepository.findValidByHash(tokenHash);
    const user = await userRepository.findByIdWithSecret(payload.sub);

    if (!storedToken || storedToken.userId !== payload.sub || !user || !user.isActive) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    const passwordHash = await hashPassword(input.newPassword);
    await userRepository.updatePassword(user.id, passwordHash);
    await refreshTokenRepository.revokeAllForUser(user.id);
    await passwordResetTokenRepository.markUsed(tokenHash);
    await writeAuditLog({
      userId: user.id,
      action: 'AUTH_RESET_PASSWORD',
      entityType: 'User',
      entityId: user.id,
    });
  }

  async getUser(id: string): Promise<PublicUser> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }

  async updateUser(id: string, input: UpdateUserInput, actorId: string): Promise<PublicUser> {
    const existing = await userRepository.findByIdWithSecret(id);
    if (!existing) {
      throw new NotFoundError('User');
    }

    if (input.email && input.email !== existing.email) {
      const duplicate = await userRepository.findByEmail(input.email);
      if (duplicate) {
        throw new ConflictError('Email is already registered');
      }
    }

    const user = await userRepository.updateUser(id, {
      email: input.email,
      fullName: input.fullName,
      phone: input.phone,
      role: input.role,
    });

    await writeAuditLog({
      userId: actorId,
      action: 'USER_UPDATE',
      entityType: 'User',
      entityId: id,
      metadata: input,
    });

    return user;
  }

  async resetUserPassword(
    id: string,
    input: ResetUserPasswordInput,
    actorId: string,
  ): Promise<void> {
    const user = await userRepository.findByIdWithSecret(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    const passwordHash = await hashPassword(input.newPassword);
    await userRepository.updatePassword(id, passwordHash);
    await refreshTokenRepository.revokeAllForUser(id);
    await writeAuditLog({
      userId: actorId,
      action: 'USER_RESET_PASSWORD',
      entityType: 'User',
      entityId: id,
    });
  }

  async listUsers(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const [data, total] = await userRepository.list({ skip, take: limit, search });
    return { data, total };
  }

  async setUserActive(id: string, isActive: boolean, actorId: string) {
    const user = await userRepository.setActive(id, isActive);
    if (!isActive) {
      await refreshTokenRepository.revokeAllForUser(id);
    }
    await writeAuditLog({
      userId: actorId,
      action: isActive ? 'USER_ACTIVATE' : 'USER_DEACTIVATE',
      entityType: 'User',
      entityId: id,
    });
    return user;
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: PublicUser['role'],
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<AuthTokens> {
    const jti = newTokenId();
    const accessToken = signAccessToken({ sub: userId, email, role });
    const refreshToken = signRefreshToken(userId, jti);
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + durationToMs(env.jwtRefreshExpiresIn));

    await refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: env.jwtAccessExpiresIn,
    };
  }
}

export const authService = new AuthService();
