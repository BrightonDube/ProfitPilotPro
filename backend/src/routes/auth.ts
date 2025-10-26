import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import passport from '../config/auth';
import { prisma } from '../config/database';
import { authRateLimiter } from '../middleware/rateLimiter';
import { createError } from '../middleware/errorHandler';
import { z } from 'zod';
import {
  verifyGoogleIdToken,
  upsertGoogleUser,
  serializeUserForAuthResponse,
  getAuthUserById,
} from '../services/auth/google';
import {
  issueTokenPair,
  rotateRefreshToken,
  revokeRefreshToken,
  extractRoleContext,
  signAccessToken,
  buildRefreshCookieOptions,
  REFRESH_COOKIE_NAME,
} from '../services/auth/tokens';
import { verifyAccessToken } from '../middleware/verifyAccessToken';

const router: Router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const googleTokenSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});

type AuthUser = Awaited<ReturnType<typeof getAuthUserById>> | Awaited<ReturnType<typeof upsertGoogleUser>>;

const BROWSER_USER_AGENT_REGEX = /(mozilla|chrome|safari|firefox|edge|trident)/i;

function isBrowserClient(req: Request) {
  const userAgent = req.headers['user-agent'] ?? '';
  return BROWSER_USER_AGENT_REGEX.test(userAgent);
}

function logAuthEvent(event: string, meta: Record<string, unknown>) {
  console.info(JSON.stringify({
    event,
    component: 'auth-routes',
    timestamp: new Date().toISOString(),
    ...meta,
  }));
}

type AuthResponseTokens = {
  accessToken: string;
  refreshToken?: string;
  refreshExpiresAt?: Date;
};

async function buildAuthSuccessResponse(
  req: Request,
  res: Response,
  user: AuthUser,
  tokens: AuthResponseTokens,
  event: string = 'auth.success'
) {
  const serializedUser = serializeUserForAuthResponse(user);
  const isBrowser = isBrowserClient(req);

  const { accessToken, refreshToken, refreshExpiresAt } = tokens;

  if (isBrowser && refreshToken && refreshExpiresAt) {
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, buildRefreshCookieOptions(refreshExpiresAt));
  }

  const responsePayload = {
    user: serializedUser,
    accessToken,
    refreshExpiresAt: refreshExpiresAt?.toISOString(),
    ...(isBrowser
      ? { refreshToken: undefined }
      : { refreshToken }),
  };

  logAuthEvent(event, {
    userId: user.id,
    provider: user.provider,
    browser: isBrowser,
  });

  return responsePayload;
}

async function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
  });
}

// Register endpoint
router.post('/register', authRateLimiter, async (req, res, next) => {
  try {
    const { email, password, fullName } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createError('User with this email already exists', 409, 'USER_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with profile and settings
    const userRecord = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        provider: 'email',
        profile: {
          create: {
            email,
            fullName,
            provider: 'email',
            emailVerified: false,
          }
        },
        settings: {
          create: {
            hourlyRate: 15.00,
            defaultMargin: 40.00,
          }
        }
      },
      include: {
        profile: true,
        settings: true,
      },
    });

    const user = await getAuthUserById(userRecord.id);
    const tokenPair = await issueTokenPair(user.id, user);
    const response = await buildAuthSuccessResponse(req, res, user, tokenPair, 'auth.register');

    res.status(201).json({
      message: 'User registered successfully',
      ...response,
    });
  } catch (error) {
    next(error);
  }
});

// Login endpoint
router.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const userRecord = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        settings: true,
      },
    });

    if (!userRecord || !userRecord.password) {
      throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, userRecord.password);
    if (!isValidPassword) {
      throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const user = await getAuthUserById(userRecord.id);
    const tokenPair = await issueTokenPair(user.id, user);
    const response = await buildAuthSuccessResponse(req, res, user, tokenPair, 'auth.login');

    res.json({
      message: 'Login successful',
      ...response,
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res, next) => {
  try {
    const cookieRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    const requestRefreshToken = (req.body?.refreshToken as string | undefined) ?? undefined;
    const refreshToken = cookieRefreshToken || requestRefreshToken;

    if (!refreshToken) {
      throw createError('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN');
    }

    const { tokenRecord, newRawToken, expiresAt } = await rotateRefreshToken(refreshToken);
    const user = await getAuthUserById(tokenRecord.userId);
    const { roles, businessIds } = extractRoleContext(user);
    const newAccessToken = signAccessToken(user.id, roles, businessIds);
    const response = await buildAuthSuccessResponse(req, res, user, {
      accessToken: newAccessToken,
      refreshToken: newRawToken,
      refreshExpiresAt: expiresAt,
    }, 'auth.refresh');

    res.json({
      message: 'Tokens refreshed successfully',
      ...response,
    });
  } catch (error) {
    next(error);
  }
});

// Google token exchange (web/mobile clients)
router.post('/google/token', authRateLimiter, async (req, res, next) => {
  try {
    const { idToken } = googleTokenSchema.parse(req.body);

    const googleProfile = await verifyGoogleIdToken(idToken);
    const user = await upsertGoogleUser(googleProfile);

    const tokenPair = await issueTokenPair(user.id, user);
    const response = await buildAuthSuccessResponse(req, res, user, tokenPair, 'auth.google');

    res.json({
      message: 'Google login successful',
      provider: 'google',
      ...response,
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', verifyAccessToken, async (req, res, next) => {
  try {
    const authUser = req.authUser;

    if (!authUser) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    res.json({
      user: {
        id: authUser.id,
        email: authUser.email,
        provider: authUser.provider,
        emailVerified: authUser.emailVerified,
        businesses: authUser.businessUsers.map((bu) => ({
          id: bu.businessId,
          role: bu.role,
          isActive: bu.isActive,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Google OAuth routes
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your-google-oauth-client-id') {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Google OAuth is not configured. Please set up Google OAuth credentials in the environment variables.',
      code: 'OAUTH_NOT_CONFIGURED'
    });
  }
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res, next) => {
    try {
      const user = await getAuthUserById((req.user as any).id);
      const tokenPair = await issueTokenPair(user.id, user);
      const isBrowser = isBrowserClient(req);

      if (isBrowser && tokenPair.refreshToken && tokenPair.refreshExpiresAt) {
        res.cookie(REFRESH_COOKIE_NAME, tokenPair.refreshToken, buildRefreshCookieOptions(tokenPair.refreshExpiresAt));
      }

      const frontendUrl = process.env.WEB_URL || 'http://localhost:3000';
      const callbackUrl = new URL('/auth/callback', frontendUrl);
      callbackUrl.searchParams.set('token', tokenPair.accessToken);
      if (!isBrowser && tokenPair.refreshToken) {
        callbackUrl.searchParams.set('refresh', tokenPair.refreshToken);
      }

      res.redirect(callbackUrl.toString());
    } catch (error) {
      next(error);
    }
  }
);

// GitHub OAuth routes
router.get('/github', (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID === 'your-github-oauth-client-id') {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'GitHub OAuth is not configured. Please set up GitHub OAuth credentials in the environment variables.',
      code: 'OAUTH_NOT_CONFIGURED'
    });
  }
  passport.authenticate('github', { 
    scope: ['user:email'],
    session: false 
  })(req, res, next);
});

router.get('/github/callback',
  passport.authenticate('github', { session: false }),
  async (req, res, next) => {
    try {
      const user = await getAuthUserById((req.user as any).id);
      const tokenPair = await issueTokenPair(user.id, user);
      const isBrowser = isBrowserClient(req);

      if (isBrowser && tokenPair.refreshToken && tokenPair.refreshExpiresAt) {
        res.cookie(REFRESH_COOKIE_NAME, tokenPair.refreshToken, buildRefreshCookieOptions(tokenPair.refreshExpiresAt));
      }

      const frontendUrl = process.env.WEB_URL || 'http://localhost:3000';
      const redirectUrl = new URL('/auth/callback', frontendUrl);
      redirectUrl.searchParams.set('token', tokenPair.accessToken);
      if (!isBrowser && tokenPair.refreshToken) {
        redirectUrl.searchParams.set('refresh', tokenPair.refreshToken);
      }

      res.redirect(redirectUrl.toString());
    } catch (error) {
      next(error);
    }
  }
);

// Logout endpoint (client-side token invalidation)
router.post('/logout', verifyAccessToken, async (req, res, next) => {
  try {
    const cookieRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    const bodyRefreshToken = req.body?.refreshToken as string | undefined;

    if (cookieRefreshToken) {
      await revokeRefreshToken(cookieRefreshToken);
    }

    if (bodyRefreshToken) {
      await revokeRefreshToken(bodyRefreshToken);
    }

    await clearRefreshCookie(res);

    logAuthEvent('auth.logout', {
      userId: req.authUser?.id,
    });

    res.json({
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
});

// OAuth error handler
router.get('/error', (req, res) => {
  const error = req.query.error as string || 'Unknown error';
  const frontendUrl = process.env.WEB_URL || 'http://localhost:3000';
  
  // Redirect to frontend with error
  const errorUrl = new URL('/auth/error', frontendUrl);
  errorUrl.searchParams.set('error', error);
  
  res.redirect(errorUrl.toString());
});

// Password reset request
router.post('/forgot-password', authRateLimiter, async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });

    // TODO: Implement email service for password reset
    // For now, just log the reset token
    if (user && user.password) { // Only for email users
      const resetToken = signAccessToken(user.id, ['password-reset'], []);
      console.log(`Password reset token for ${email}: ${resetToken}`);
    }
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };

