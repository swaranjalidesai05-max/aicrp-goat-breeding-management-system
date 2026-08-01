import type { Role } from '@prisma/client';

/** Permission matrix for Phase 1 RBAC. */
export const ROLE_PERMISSIONS = {
  users: {
    read: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI'] as Role[],
    write: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI'] as Role[],
  },
  clusters: {
    read: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI', 'DATA_ENUMERATOR'] as Role[],
    write: ['DIRECTOR', 'HOD'] as Role[],
  },
  villages: {
    read: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI', 'DATA_ENUMERATOR'] as Role[],
    write: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST'] as Role[],
  },
  farmers: {
    read: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI', 'DATA_ENUMERATOR'] as Role[],
    write: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI'] as Role[],
  },
  bucks: {
    read: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI', 'DATA_ENUMERATOR'] as Role[],
    write: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI'] as Role[],
  },
  does: {
    read: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI', 'DATA_ENUMERATOR'] as Role[],
    write: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI'] as Role[],
  },
  breeding: {
    read: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI', 'DATA_ENUMERATOR'] as Role[],
    write: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI'] as Role[],
  },
  progeny: {
    read: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI', 'DATA_ENUMERATOR'] as Role[],
    write: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI'] as Role[],
  },
  weights: {
    read: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI', 'DATA_ENUMERATOR'] as Role[],
    write: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI'] as Role[],
  },
  notifications: {
    read: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI', 'DATA_ENUMERATOR'] as Role[],
    write: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI'] as Role[],
  },
  audit: {
    read: ['DIRECTOR', 'HOD'] as Role[],
    write: ['DIRECTOR', 'HOD'] as Role[],
  },
  reports: {
    read: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI', 'DATA_ENUMERATOR'] as Role[],
    write: ['DIRECTOR', 'HOD'] as Role[],
  },
  sync: {
    read: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI', 'DATA_ENUMERATOR'] as Role[],
    write: ['DIRECTOR', 'HOD', 'SENIOR_SCIENTIST', 'CO_PI'] as Role[],
  },
} as const;

export type PermissionResource = keyof typeof ROLE_PERMISSIONS;
export type PermissionAction = 'read' | 'write';

export function canAccess(
  role: Role,
  resource: PermissionResource,
  action: PermissionAction,
): boolean {
  return (ROLE_PERMISSIONS[resource][action] as readonly Role[]).includes(role);
}
