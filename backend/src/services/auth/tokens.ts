import crypto from 'crypto';
import { sign, verify, Secret, SignOptions } from 'jsonwebtoken';
import type { CookieOptions } from 'express';
import { prisma } from '../../config/database';
import { createError } from '../../middleware/errorHandler';
import { getAuthUserById } from './google';

const rawAccessSecret = process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET;

if (!rawAccessSecret) {
  throw new Error('JWT access secret is not configured');
}

const ACCESS_TOKEN_SECRET: Secret = rawAccessSecret;

const ACCESS_TOKEN_TTL = (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as SignOptions['expiresIn'];
const REFRESH_TOKEN_TTL_DAYS = parseInt(process.env.JWT_REFRESH_EXPIRES_IN_DAYS || '30', 10);

export const REFRESH_COOKIE_NAME = process.env.COOKIE_NAME || 'bizpilot_refresh';
const COOKIE_SECURE = (process.env.COOKIE_SECURE ?? 'true') === 'true';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;
const COOKIE_SAMESITE = (process.env.COOKIE_SAMESITE as CookieOptions['sameSite']) || 'strict';
const COOKIE_PATH = process.env.COOKIE_PATH || '/';
const REFRESH_COOKIE_MAX_AGE_SECONDS = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60;
const REFRESH_COOKIE_MAX_AGE_MS = REFRESH_COOKIE_MAX_AGE_SECONDS * 1000;

export interface TokenPayload {
  sub: string;
  roles: string[];
  businessIds: string[];
  iss: string;
  aud: string;
  exp?: number;
}

export function signAccessToken(userId: string, roles: string[], businessIds: string[]) {
  const payload: TokenPayload = {
    sub: userId,
    roles,
    businessIds,
    iss: 'bizpilot-api',
    aud: 'bizpilot-app',
  };

  return sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

export function hashRefreshToken(rawToken: string) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export async function signRefreshToken(userId: string) {
  const rawToken = crypto.randomBytes(64).toString('hex');
  const hashedToken = hashRefreshToken(rawToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  const record = await prisma.refreshToken.create({
    data: {
      userId,
      hashedToken,
      expiresAt,
    },
  });

  return { rawToken, expiresAt, tokenId: record.id };
}

export async function verifyRefreshToken(rawToken: string) {
  const hashedToken = hashRefreshToken(rawToken);

  const tokenRecord = await prisma.refreshToken.findFirst({
    where: {
      hashedToken,
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!tokenRecord) {
    throw createError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  return tokenRecord;
}

export async function rotateRefreshToken(rawToken: string) {
  const tokenRecord = await verifyRefreshToken(rawToken);

  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: {
      revokedAt: new Date(),
    },
  });

  const { rawToken: newRawToken, expiresAt, tokenId } = await signRefreshToken(tokenRecord.userId);

  return { tokenRecord, newRawToken, expiresAt, tokenId };
}

export async function revokeRefreshTokenById(tokenId: string) {
  await prisma.refreshToken.updateMany({
    where: {
      id: tokenId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function revokeAllUserRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function revokeRefreshToken(rawToken: string) {
  const hashedToken = hashRefreshToken(rawToken);

  await prisma.refreshToken.updateMany({
    where: {
      hashedToken,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function decodeAccessToken(token: string) {
  try {
    const payload = verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
    return payload;
  } catch (error) {
    throw createError('Invalid or expired token', 401, 'INVALID_TOKEN');
  }
}

export function extractRoleContext(user: Awaited<ReturnType<typeof getAuthUserById>>) {
  const roles = user.businessUsers.map((bu) => bu.role);
  const businessIds = user.businessUsers.map((bu) => bu.businessId);
  return { roles, businessIds };
}

export async function issueTokenPair(
  userId: string,
  existingUser?: Awaited<ReturnType<typeof getAuthUserById>>
) {
  const user = existingUser ?? (await getAuthUserById(userId));
  const { roles, businessIds } = extractRoleContext(user);

  const accessToken = signAccessToken(user.id, roles, businessIds);
  const { rawToken: refreshToken, expiresAt, tokenId } = await signRefreshToken(user.id);

  return {
    user,
    accessToken,
    refreshToken,
    refreshExpiresAt: expiresAt,
    refreshTokenId: tokenId,
  };
}

export function buildRefreshCookieOptions(expiresAt: Date): CookieOptions {
  return {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAMESITE,
    domain: COOKIE_DOMAIN,
    path: COOKIE_PATH,
    expires: expiresAt,
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  };
}
