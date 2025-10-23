declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      businessId?: string;
      role?: string;
    }
  }
}

export {};
