import type { Request, Response } from 'express';

import { authService } from '../application/auth.service';
import { requireAuthUser } from '../../../presentation/middleware/authenticate';
import { clientMeta } from '../../../shared/utils/pagination';
import { paginatedResponse, getPagination } from '../../../shared/utils/pagination';
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RefreshInput,
  RegisterUserInput,
  ResetPasswordInput,
  ResetUserPasswordInput,
  UpdateUserInput,
} from './auth.schemas';
import type { PaginationQuery } from '../../../shared/utils/pagination';

export class AuthController {
  login = async (req: Request, res: Response) => {
    const body = req.body as LoginInput;
    const result = await authService.login(body, clientMeta(req));
    res.status(200).json(result);
  };

  refresh = async (req: Request, res: Response) => {
    const body = req.body as RefreshInput;
    const tokens = await authService.refresh(body.refreshToken, clientMeta(req));
    res.status(200).json({ tokens });
  };

  logout = async (req: Request, res: Response) => {
    const body = req.body as RefreshInput;
    await authService.logout(body.refreshToken, req.user?.id);
    res.status(204).send();
  };

  logoutAll = async (req: Request, res: Response) => {
    const user = requireAuthUser(req);
    await authService.logoutAll(user.id);
    res.status(204).send();
  };

  me = async (req: Request, res: Response) => {
    const user = requireAuthUser(req);
    const profile = await authService.me(user.id);
    res.status(200).json({ user: profile });
  };

  changePassword = async (req: Request, res: Response) => {
    const user = requireAuthUser(req);
    await authService.changePassword(user.id, req.body as ChangePasswordInput);
    res.status(204).send();
  };

  forgotPassword = async (req: Request, res: Response) => {
    const body = req.body as ForgotPasswordInput;
    const result = await authService.forgotPassword(body);
    res.status(200).json(result);
  };

  resetPassword = async (req: Request, res: Response) => {
    const body = req.body as ResetPasswordInput;
    await authService.resetPassword(body);
    res.status(204).send();
  };

  register = async (req: Request, res: Response) => {
    const actor = req.user ? requireAuthUser(req) : undefined;
    const user = await authService.register(req.body as RegisterUserInput, actor?.id ?? null);
    res.status(201).json({ user });
  };

  getUser = async (req: Request, res: Response) => {
    const user = await authService.getUser(req.params.id);
    res.status(200).json({ user });
  };

  updateUser = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const user = await authService.updateUser(req.params.id, req.body as UpdateUserInput, actor.id);
    res.status(200).json({ user });
  };

  resetUserPassword = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    await authService.resetUserPassword(
      req.params.id,
      req.body as ResetUserPasswordInput,
      actor.id,
    );
    res.status(204).send();
  };

  listUsers = async (req: Request, res: Response) => {
    const query = req.query as unknown as PaginationQuery;
    const { page, limit } = getPagination(query);
    const { data, total } = await authService.listUsers(page, limit, query.search);
    res.status(200).json(paginatedResponse(data, total, page, limit));
  };

  setActive = async (req: Request, res: Response) => {
    const actor = requireAuthUser(req);
    const isActive = Boolean((req.body as { isActive: boolean }).isActive);
    const user = await authService.setUserActive(req.params.id, isActive, actor.id);
    res.status(200).json({ user });
  };
}

export const authController = new AuthController();
