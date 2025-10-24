declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      businessId?: string;
      role?: string;
    }

    interface Request {
      authUser?: {
        id: string;
        email: string;
        provider: string;
        emailVerified: boolean;
        businessUsers: Array<{
          businessId: string;
          role: string;
          isActive: boolean;
        }>;
      };
      authRoles?: string[];
      authBusinessIds?: string[];
    }
  }
}

export {};
