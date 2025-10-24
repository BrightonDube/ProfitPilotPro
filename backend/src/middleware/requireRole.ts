import { Response, NextFunction } from 'express';
import { createError } from './errorHandler';
import { verifyAccessToken } from './verifyAccessToken';

export function requireRole(requiredRoles: string[]) {
  return async (req: Parameters<typeof verifyAccessToken>[0], res: Response, next: NextFunction) => {
    if (!req.authRoles || req.authRoles.length === 0) {
      return next(createError('Unauthorized', 401, 'UNAUTHORIZED'));
    }

    const hasRole = req.authRoles.some((role) => requiredRoles.includes(role));

    if (!hasRole) {
      return next(createError('Forbidden', 403, 'FORBIDDEN'));
    }

    return next();
  };
}
