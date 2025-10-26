export interface AuthBusiness {
  id: string;
  role: string;
  isActive: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  provider: string;
  emailVerified: boolean;
  businesses: AuthBusiness[];
}
