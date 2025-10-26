import { create } from 'zustand';
import { AuthUser } from '@/types/auth';
import {
  getApiClient,
  setApiClientAccessToken,
  setApiClientUnauthorizedHandler,
} from '@/lib/apiClient';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

type AuthResponsePayload = {
  user: AuthUser;
  accessToken?: string;
  refreshExpiresAt?: string;
};

interface AuthState {
  user?: AuthUser;
  accessToken?: string;
  status: AuthStatus;
  error?: string;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (payload: AuthResponsePayload) => void;
  clear: () => void;
}

function extractErrorMessage(error: unknown) {
  if (!error) return 'Unknown error';

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && 'message' in (error as Record<string, unknown>)) {
    return String((error as Record<string, unknown>).message);
  }

  return 'Unexpected error occurred';
}

export const useAuthStore = create<AuthState>((set, get) => {
  const handleUnauthorized = () => {
    setApiClientAccessToken(null);
    set({
      user: undefined,
      accessToken: undefined,
      status: 'unauthenticated',
      error: undefined,
    });
  };

  setApiClientUnauthorizedHandler(handleUnauthorized);

  return {
    status: 'idle',
    async initialize() {
      const api = getApiClient({ onUnauthorized: handleUnauthorized });

      set({ status: 'loading', error: undefined });

      try {
        const refreshResponse = await api.post<{ accessToken?: string }>('/auth/refresh');
        const refreshedToken = refreshResponse.data?.accessToken;

        if (!refreshedToken) {
          handleUnauthorized();
          return;
        }

        setApiClientAccessToken(refreshedToken);

        const { data } = await api.get<{ user: AuthUser }>('/auth/me');

        set({
          user: data.user,
          accessToken: refreshedToken,
          status: 'authenticated',
          error: undefined,
        });
      } catch (error) {
        handleUnauthorized();
        set({ error: extractErrorMessage(error) });
      }
    },
    async login(email: string, password: string) {
      const api = getApiClient({ onUnauthorized: handleUnauthorized });

      set({ status: 'loading', error: undefined });

      try {
        const { data } = await api.post<AuthResponsePayload>('/auth/login', {
          email,
          password,
        });

        if (!data.accessToken) {
          throw new Error('Access token missing from response');
        }

        setApiClientAccessToken(data.accessToken);

        set({
          user: data.user,
          accessToken: data.accessToken,
          status: 'authenticated',
          error: undefined,
        });
      } catch (error) {
        handleUnauthorized();
        const message = extractErrorMessage(error);
        set({ error: message });
        throw error;
      }
    },
    async logout() {
      const api = getApiClient({ onUnauthorized: handleUnauthorized });

      try {
        await api.post('/auth/logout');
      } finally {
        handleUnauthorized();
      }
    },
    setAuth(payload: AuthResponsePayload) {
      if (payload.accessToken) {
        setApiClientAccessToken(payload.accessToken);
      }

      set({
        user: payload.user,
        accessToken: payload.accessToken,
        status: 'authenticated',
        error: undefined,
      });
    },
    clear() {
      handleUnauthorized();
    },
  };
});
