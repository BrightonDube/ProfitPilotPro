import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export interface ApiClientOptions {
  onUnauthorized?: () => void;
}

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private onUnauthorized?: () => void;
  private isRefreshing = false;
  private pendingRequests: Array<{
    resolve: (value: AxiosResponse) => void;
    reject: (reason: unknown) => void;
    config: AxiosRequestConfig;
  }> = [];

  constructor(options: ApiClientOptions = {}) {
    this.onUnauthorized = options.onUnauthorized;
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
    });

    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.pendingRequests.push({ resolve, reject, config: originalRequest });
            });
          }

          this.isRefreshing = true;

          try {
            const refreshResponse = await this.client.post('/auth/refresh');
            const newAccessToken: string | undefined = refreshResponse.data?.accessToken;
            if (newAccessToken) {
              this.setAccessToken(newAccessToken);
            }

            this.isRefreshing = false;
            this.flushPendingRequests(null);

            return this.client(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            this.flushPendingRequests(refreshError);

            if (this.onUnauthorized) {
              this.onUnauthorized();
            }

            throw refreshError;
          }
        }

        throw error;
      }
    );
  }

  private flushPendingRequests(error: unknown) {
    this.pendingRequests.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error);
      } else {
        this.client(config).then(resolve).catch(reject);
      }
    });

    this.pendingRequests = [];
  }

  setAccessToken(token?: string | null) {
    this.accessToken = token ?? null;
  }

  setUnauthorizedHandler(handler?: () => void) {
    this.onUnauthorized = handler;
  }

  get instance() {
    return this.client;
  }
}

let sharedClient: ApiClient | null = null;

function ensureClient(options?: ApiClientOptions) {
  if (!sharedClient) {
    sharedClient = new ApiClient(options);
  } else if (options?.onUnauthorized) {
    sharedClient.setUnauthorizedHandler(options.onUnauthorized);
  }
  return sharedClient;
}

export function getApiClient(options: ApiClientOptions = {}) {
  return ensureClient(options).instance;
}

export function setApiClientAccessToken(token?: string | null) {
  ensureClient().setAccessToken(token);
}

export function setApiClientUnauthorizedHandler(handler?: () => void) {
  ensureClient().setUnauthorizedHandler(handler);
}
