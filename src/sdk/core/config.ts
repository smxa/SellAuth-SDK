export type BackoffStrategy = 'fixed' | 'exponential';

export interface RetryOptions {
  attempts: number; // total attempts including first
  backoff?: BackoffStrategy;
  factor?: number; // exponential factor default 2
  baseDelayMs?: number; // default 300
  maxDelayMs?: number; // cap
  retryOn?(_ctx: {
    attempt: number;
    error?: any;
    response?: Response;
    request: NormalizedRequest;
  }): boolean | Promise<boolean>;
  methods?: string[]; // default safe methods
  statusCodes?: number[]; // override list for HTTP responses
}

export interface TransportResponseLike {
  status: number;
  headers: Record<string, string> | { get(_name: string): string | null };
  text(): Promise<string>;
  ok?: boolean; // optional; if absent compute status in 200-299
}

export interface NormalizedRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
  timeoutMs?: number;
  responseType?: 'json' | 'text' | 'raw';
}

export interface Transport {
  (_req: NormalizedRequest): Promise<TransportResponseLike>;
}

export type Middleware = (_next: Transport) => Transport;

export interface AuthConfig {
  type?: 'apiKey' | 'bearer' | 'custom';
  apiKey?: string; // used for apiKey or bearer static
  headerName?: string; // default Authorization
  scheme?: string; // e.g. Bearer, token
  bearer?: () => string | Promise<string>; // dynamic token getter
  authorize?: (_req: NormalizedRequest) => void | Promise<void>; // custom
}

export interface LoggerLike {
  debug?: (..._a: any[]) => void;
  info?: (..._a: any[]) => void;
  warn?: (..._a: any[]) => void;
  error?: (..._a: any[]) => void;
}

export interface SellAuthAdvancedConfig {
  apiKey?: string; // backwards compat simple field
  baseUrl?: string;
  timeoutMs?: number; // per-request default
  retries?: number | RetryOptions; // simple number => attempts
  headers?: Record<string, string>;
  auth?: AuthConfig;
  transport?: Transport; // override entire transport
  middleware?: Middleware[];
  logger?: LoggerLike;
  beforeRequest?(_req: NormalizedRequest): void | Promise<void>;
  afterResponse?(_res: any, _req: NormalizedRequest): void | Promise<void>;
}

export interface RequestOptions {
  query?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
  responseType?: 'json' | 'text' | 'raw';
}

export interface RequestContext<T = any> {
  response?: T;
  error?: any;
  request: NormalizedRequest; // original request
}

export function normalizeConfig(
  c: SellAuthAdvancedConfig,
): Required<Pick<SellAuthAdvancedConfig, 'baseUrl' | 'timeoutMs'>> &
  SellAuthAdvancedConfig & { retry: RetryOptions } {
  const baseUrl = (c.baseUrl || 'https://api.sellauth.com/v1').replace(/\/$/, '');
  const timeoutMs = c.timeoutMs ?? 15000;
  const retry: RetryOptions =
    typeof c.retries === 'number'
      ? {
          attempts: c.retries,
          backoff: 'exponential',
          factor: 2,
          baseDelayMs: 300,
          methods: ['GET', 'HEAD', 'OPTIONS'],
          statusCodes: [408, 429, 500, 502, 503, 504],
        }
      : {
          attempts: c.retries?.attempts ?? 3,
          backoff: c.retries?.backoff || 'exponential',
          factor: c.retries?.factor ?? 2,
          baseDelayMs: c.retries?.baseDelayMs ?? 300,
          maxDelayMs: c.retries?.maxDelayMs,
          retryOn: c.retries?.retryOn,
          methods: c.retries?.methods || ['GET', 'HEAD', 'OPTIONS'],
          statusCodes: c.retries?.statusCodes || [408, 429, 500, 502, 503, 504],
        };
  return { ...c, baseUrl, timeoutMs, retry } as Required<
    Pick<SellAuthAdvancedConfig, 'baseUrl' | 'timeoutMs'>
  > &
    SellAuthAdvancedConfig & { retry: RetryOptions };
}
