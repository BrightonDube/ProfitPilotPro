import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../config/database';
import { createError } from '../../middleware/errorHandler';

interface GoogleProfileDetails {
  id: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified?: boolean;
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = GOOGLE_CLIENT_ID
  ? new OAuth2Client(GOOGLE_CLIENT_ID)
  : null;

const baseInclude = {
  profile: true,
  settings: true,
  businessUsers: {
    where: { isActive: true },
    include: {
      business: true,
    },
  },
} as const;

export async function getAuthUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: baseInclude,
  });

  if (!user) {
    throw createError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfileDetails> {
  if (!googleClient || !GOOGLE_CLIENT_ID) {
    throw createError('Google OAuth is not configured', 500, 'GOOGLE_OAUTH_DISABLED');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.sub) {
    throw createError('Invalid Google token payload', 401, 'INVALID_GOOGLE_TOKEN');
  }

  const email = payload.email;
  if (!email) {
    throw createError('Google account email is required', 400, 'GOOGLE_EMAIL_REQUIRED');
  }

  return {
    id: payload.sub,
    email,
    name: payload.name || email,
    picture: payload.picture || undefined,
    emailVerified: payload.email_verified,
  };
}

export async function upsertGoogleUser(profile: GoogleProfileDetails) {
  const { id, email, name, picture, emailVerified } = profile;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        {
          provider: 'google',
          providerId: id,
        },
      ],
    },
    include: baseInclude,
  });

  if (existingUser) {
    const needsUpdate =
      existingUser.provider !== 'google' ||
      existingUser.providerId !== id ||
      !existingUser.emailVerified ||
      existingUser.profile?.fullName !== name ||
      existingUser.profile?.avatarUrl !== picture;

    if (needsUpdate) {
      return prisma.user.update({
        where: { id: existingUser.id },
        data: {
          provider: 'google',
          providerId: id,
          emailVerified: emailVerified ?? true,
          profile: {
            upsert: {
              create: {
                email,
                fullName: name,
                avatarUrl: picture,
                provider: 'google',
                emailVerified: emailVerified ?? true,
              },
              update: {
                email,
                fullName: name,
                avatarUrl: picture,
                provider: 'google',
                emailVerified: emailVerified ?? true,
              },
            },
          },
        },
        include: baseInclude,
      });
    }

    return existingUser;
  }

  return prisma.user.create({
    data: {
      email,
      provider: 'google',
      providerId: id,
      emailVerified: emailVerified ?? true,
      profile: {
        create: {
          email,
          fullName: name,
          avatarUrl: picture,
          provider: 'google',
          emailVerified: emailVerified ?? true,
        },
      },
      settings: {
        create: {
          hourlyRate: 15.0,
          defaultMargin: 40.0,
        },
      },
    },
    include: baseInclude,
  });
}

export function serializeUserForAuthResponse(
  user: Awaited<ReturnType<typeof upsertGoogleUser>> | Awaited<ReturnType<typeof getAuthUserById>>
) {
  return {
    id: user.id,
    email: user.email,
    provider: user.provider,
    emailVerified: user.emailVerified,
    profile: user.profile,
    settings: user.settings,
    businesses: user.businessUsers.map((businessUser) => ({
      id: businessUser.business.id,
      name: businessUser.business.name,
      role: businessUser.role,
      isActive: businessUser.isActive,
    })),
  };
}
