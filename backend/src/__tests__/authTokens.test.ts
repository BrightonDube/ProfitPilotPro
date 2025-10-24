import crypto from 'crypto';
import {
  signRefreshToken,
  verifyRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  buildRefreshCookieOptions,
  REFRESH_COOKIE_NAME,
} from '../services/auth/tokens';
import { prisma, __mock } from '../config/database';

describe('auth token utilities', () => {
  const originalRandomBytes = crypto.randomBytes;

  beforeEach(() => {
    __mock.reset();
    jest.spyOn(crypto, 'randomBytes').mockImplementation((size: number) => Buffer.alloc(size, 1));
  });

  afterEach(() => {
    (crypto.randomBytes as unknown as jest.SpyInstance).mockRestore();
  });

  test('signRefreshToken stores hashed token and returns raw token', async () => {
    const result = await signRefreshToken('user-1');

    expect(result.rawToken).toBeDefined();
    expect(result.refreshTokenId).toBeDefined();
    expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
    const createArgs = (prisma.refreshToken.create as jest.Mock).mock.calls[0][0];

    expect(createArgs.data.userId).toBe('user-1');
    expect(createArgs.data.hashedToken).toHaveLength(64);
  });

  test('verifyRefreshToken returns stored token record', async () => {
    const { rawToken } = await signRefreshToken('user-2');

    const record = await verifyRefreshToken(rawToken);

    expect(record.userId).toBe('user-2');
    expect(record.revokedAt).toBeNull();
  });

  test('rotateRefreshToken revokes old token and issues new one', async () => {
    const { rawToken } = await signRefreshToken('user-3');

    const { tokenRecord, newRawToken } = await rotateRefreshToken(rawToken);

    expect(newRawToken).toBeDefined();
    expect(tokenRecord.revokedAt).toBeInstanceOf(Date);
    expect(prisma.refreshToken.update).toHaveBeenCalledTimes(1);
    expect(prisma.refreshToken.create).toHaveBeenCalledTimes(2);
  });

  test('revokeRefreshToken marks tokens as revoked', async () => {
    const { rawToken } = await signRefreshToken('user-4');

    await revokeRefreshToken(rawToken);

    const updates = (prisma.refreshToken.updateMany as jest.Mock).mock.calls;
    expect(updates[updates.length - 1][0].where.hashedToken).toBeDefined();
  });

  test('buildRefreshCookieOptions returns secure cookie settings', () => {
    const expiresAt = new Date(Date.now() + 1000);
    const options = buildRefreshCookieOptions(expiresAt);

    expect(options.httpOnly).toBe(true);
    expect(options.path).toBe('/');
    expect(options.expires).toEqual(expiresAt);
  });
});

// Restore crypto randomBytes after all tests have run
afterAll(() => {
  crypto.randomBytes = originalRandomBytes;
});
