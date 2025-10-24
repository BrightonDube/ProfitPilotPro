import { Request, Response, NextFunction } from 'express';
import { decodeAccessToken, extractRoleContext } from '../services/auth/tokens';
import { getAuthUserById } from '../services/auth/google';
import { createError } from './errorHandler';

interface AuthenticatedContext {
  authUser?: Awaited<ReturnType<typeof getAuthUserById>>;
  authRoles?: string[];
  authBusinessIds?: string[];
}

type AuthenticatedRequest = Request & AuthenticatedContext;

export async function verifyAccessToken(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Authorization header missing', 401, 'AUTH_HEADER_MISSING');
    }

    const accessToken = authHeader.substring('Bearer '.length).trim();
    const payload = await decodeAccessToken(accessToken);
    const user = await getAuthUserById(payload.sub);
    const { roles, businessIds } = extractRoleContext(user);

    req.authUser = user;
    req.authRoles = roles;
    req.authBusinessIds = businessIds;

    next();
  } catch (error) {
    next(error);
  }
}
