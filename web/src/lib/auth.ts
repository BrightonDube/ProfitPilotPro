import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/onboarding',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            profile: true,
            businessUsers: {
              include: {
                business: true,
              },
            },
          },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isCorrectPassword = await compare(credentials.password, user.password)

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.fullName,
          image: user.profile?.avatarUrl,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        
        // Get user's business and role
        const businessUser = await prisma.businessUser.findFirst({
          where: {
            userId: user.id,
            isActive: true,
          },
          include: {
            business: true,
          },
        })
        
        if (businessUser) {
          token.businessId = businessUser.businessId
          token.businessName = businessUser.business.name
          token.role = businessUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.businessId = token.businessId as string
        session.user.businessName = token.businessName as string
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'credentials') {
        // For OAuth providers, ensure user profile exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })
        
        if (!existingUser) {
          // Create user with profile for OAuth
          await prisma.user.create({
            data: {
              email: user.email!,
              provider: account!.provider,
              providerId: account!.providerAccountId,
              emailVerified: true,
              profile: {
                create: {
                  email: user.email!,
                  fullName: user.name || '',
                  avatarUrl: user.image || '',
                  provider: account!.provider,
                  emailVerified: true,
                },
              },
            },
          })
        }
      }
      return true
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

// Extend the session type to include our custom fields
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      businessId?: string
      businessName?: string
      role?: string
    }
  }
}
