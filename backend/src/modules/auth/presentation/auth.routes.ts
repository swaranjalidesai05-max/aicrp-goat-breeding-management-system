import { Router } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { authenticate } from '../../../presentation/middleware/authenticate';
import { authorizePermission } from '../../../presentation/middleware/authorize';
import { validate } from '../../../presentation/middleware/validate';
import { paginationSchema } from '../../../shared/utils/pagination';
import { authController } from './auth.controller';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerUserSchema,
  resetPasswordSchema,
  resetUserPasswordSchema,
  updateUserSchema,
} from './auth.schemas';

const setActiveSchema = z.object({
  isActive: z.boolean(),
});

export const authRouter = Router();

authRouter.post('/login', validate(loginSchema), asyncHandler(authController.login));
authRouter.post('/refresh', validate(refreshSchema), asyncHandler(authController.refresh));
authRouter.post('/logout', validate(refreshSchema), asyncHandler(authController.logout));
authRouter.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword),
);
authRouter.post(
  '/reset-password',
  validate(resetPasswordSchema),
  asyncHandler(authController.resetPassword),
);

authRouter.post('/register', validate(registerUserSchema), asyncHandler(authController.register));

authRouter.get('/me', authenticate, asyncHandler(authController.me));
authRouter.post('/logout-all', authenticate, asyncHandler(authController.logoutAll));
authRouter.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword),
);

authRouter.post(
  '/users',
  authenticate,
  authorizePermission('users', 'write'),
  validate(registerUserSchema),
  asyncHandler(authController.register),
);

authRouter.get(
  '/users',
  authenticate,
  authorizePermission('users', 'read'),
  validate(paginationSchema, 'query'),
  asyncHandler(authController.listUsers),
);

authRouter.get(
  '/users/:id',
  authenticate,
  authorizePermission('users', 'read'),
  asyncHandler(authController.getUser),
);

authRouter.patch(
  '/users/:id',
  authenticate,
  authorizePermission('users', 'write'),
  validate(updateUserSchema),
  asyncHandler(authController.updateUser),
);

authRouter.post(
  '/users/:id/reset-password',
  authenticate,
  authorizePermission('users', 'write'),
  validate(resetUserPasswordSchema),
  asyncHandler(authController.resetUserPassword),
);

authRouter.patch(
  '/users/:id/active',
  authenticate,
  authorizePermission('users', 'write'),
  validate(setActiveSchema),
  asyncHandler(authController.setActive),
);
