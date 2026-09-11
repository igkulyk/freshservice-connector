import axios, { AxiosInstance, AxiosError } from 'axios';

export interface FreshServiceConfig {
  /** Your FreshService subdomain (e.g. "acme" for acme.freshservice.com) */
  domain: string;
  /** API key from FreshService Admin → API Settings */
  apiKey: string;
  /** Request timeout in milliseconds (default: 30 000) */
  timeoutMs?: number;
}

export interface PagedResponse<T> {
  items: T[];
  /** Link header next page URL, if available */
  nextPage?: string;
}

export class FreshServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'FreshServiceError';
  }
}

export class FreshServiceClient {
  readonly http: AxiosInstance;

  constructor(config: FreshServiceConfig) {
    const { domain, apiKey, timeoutMs = 30_000 } = config;

    this.http = axios.create({
      baseURL: `https://${domain}.freshservice.com/api/v2`,
      timeout: timeoutMs,
      // FreshService accepts the API key as the Basic-auth username; password is ignored.
      auth: { username: apiKey, password: 'X' },
      headers: { 'Content-Type': 'application/json' },
    });

    this.http.interceptors.response.use(
      (res) => res,
      (err: AxiosError) => {
        const status = err.response?.status;
        const data = err.response?.data as Record<string, unknown> | undefined;
        const message =
          (data?.['description'] as string) ??
          (data?.['message'] as string) ??
          err.message;
        throw new FreshServiceError(message, status, data);
      },
    );
  }

  /** Unwrap a single-item envelope: { ticket: {...} } → the inner object */
  unwrap<T>(envelope: Record<string, unknown>, key: string): T {
    const value = envelope[key];
    if (value === undefined) {
      throw new FreshServiceError(`Unexpected response: key "${key}" not found`);
    }
    return value as T;
  }

  /** Build an axios params object from a ListXxxParams, removing undefined values */
  buildParams(raw: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== undefined),
    );
  }
}
