import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from './auth.service';
import { userRepository } from '../infrastructure/user.repository';
import { verifyPassword } from '../../../infrastructure/security/password';

vi.mock('../infrastructure/user.repository', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    findByIdWithSecret: vi.fn(),
    create: vi.fn(),
    updatePassword: vi.fn(),
    list: vi.fn(),
    setActive: vi.fn(),
  },
  refreshTokenRepository: {
    create: vi.fn(),
    findValidByHash: vi.fn(),
    revokeByHash: vi.fn(),
    revokeAllForUser: vi.fn(),
  },
}));

vi.mock('../../../infrastructure/security/password', () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock('../../../infrastructure/audit/auditWriter', () => ({
  writeAuditLog: vi.fn(),
}));

describe('AuthService', () => {
  const service = new AuthService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a pending reset message for forgot password requests', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValueOnce({
      id: 'user-1',
      email: 'director@example.com',
      passwordHash: 'hash',
      fullName: 'Director',
      phone: null,
      role: 'DIRECTOR',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    await expect(service.forgotPassword({ email: 'director@example.com' })).resolves.toEqual({
      message: 'If an account exists, a password reset link has been prepared.',
    });
  });

  it('rejects invalid login credentials', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValueOnce({
      id: 'user-1',
      email: 'director@example.com',
      passwordHash: 'hash',
      fullName: 'Director',
      phone: null,
      role: 'DIRECTOR',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    vi.mocked(verifyPassword).mockResolvedValueOnce(false);

    await expect(
      service.login({ email: 'director@example.com', password: 'wrongpass123' }),
    ).rejects.toThrow('Invalid email or password');
  });
});
