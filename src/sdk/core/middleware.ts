import {
  Middleware,
  NormalizedRequest,
  RetryOptions,
  Transport,
  TransportResponseLike,
} from './config';
import { SellAuthError } from './http';

export const authMiddleware =
  (cfg: { auth?: any; apiKey?: string; logger?: any }): Middleware =>
  (next: Transport) =>
  async (req) => {
    const a = cfg.auth || {};
    // Basic validation: ensure some token path is available
    if (!cfg.auth && !cfg.apiKey) {
      cfg.logger?.warn?.('authMiddleware: no auth configured');
    }
    if (a.type === 'custom' && a.authorize) {
      await a.authorize(req);
    } else if (a.type === 'bearer') {
      const token = a.bearer ? await a.bearer() : a.apiKey || cfg.apiKey;
      if (!token) throw new SellAuthError('Missing bearer token');
      req.headers['Authorization'] = `${a.scheme || 'Bearer'} ${token}`;
    } else {
      // default apiKey/bearer static
      const token = a.apiKey || cfg.apiKey;
      if (!token) cfg.logger?.warn?.('authMiddleware: missing API key');
      else req.headers['Authorization'] = `${a.scheme || 'Bearer'} ${token}`;
    }
    return next(req);
  };

const DEFAULT_SENSITIVE_HEADERS = new Set([
  'authorization',
  'proxy-authorization',
  'x-api-key',
  'x-api-token',
  'x-amz-security-token',
  'x-aws-credentials',
  'authentication',
  'cookie',
  'set-cookie',
]);

export interface LoggerSanitizeOptions {
  sensitiveHeaders?: Iterable<string>;
  mask?: string | ((name: string, value: string) => string);
  allowlist?: Iterable<string>; // headers to NOT redact even if sensitive
}

function sanitizeHeaders(
  headers: Record<string, any>,
  opt: LoggerSanitizeOptions = {},
): Record<string, any> {
  const sensitive = new Set(
    [...(opt.sensitiveHeaders || DEFAULT_SENSITIVE_HEADERS)].map((h) => h.toLowerCase()),
  );
  const allow = new Set([...(opt.allowlist || [])].map((h) => h.toLowerCase()));
  const mask = opt.mask ?? '[REDACTED]';
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(headers || {})) {
    const lk = k.toLowerCase();
    if (sensitive.has(lk) && !allow.has(lk)) {
      if (typeof mask === 'function') out[k] = mask(lk, typeof v === 'string' ? v : String(v));
      else if (typeof v === 'string' && v.length > 12 && mask === '[REDACTED]')
        out[k] = `[REDACTED:${v.slice(-4)}]`;
      else out[k] = mask;
    } else out[k] = v;
  }
  return out;
}

export const loggerMiddleware =
  (logger: any, options?: LoggerSanitizeOptions): Middleware =>
  (next: Transport) =>
  async (req) => {
    const start = Date.now();
    logger?.debug?.('request', { method: req.method, url: req.url, headers: sanitizeHeaders(req.headers, options) });
    try {
      const res = await next(req);
       logger?.debug?.('response', { url: req.url, status: res.status, ms: Date.now() - start }); // headers intentionally omitted to avoid leaking sensitive data
      return res;
    } catch (e: any) {
      logger?.error?.('error', { url: req.url, error: e, ms: Date.now() - start });
      throw e;
    }
  };

export const retryMiddleware =
  (retry: RetryOptions, logger?: any): Middleware =>
  (next: Transport) =>
  async (req) => {
    const attempts = Math.max(1, retry.attempts ?? 1);
    let attempt = 0;
    let lastError: any;
    while (attempt < attempts) {
      try {
        const res = await next(req);
        const ok =
          (res as any).ok !== undefined ? (res as any).ok : res.status >= 200 && res.status < 300;
        if (!ok) {
          const doRetry = await shouldRetry({ retry, attempt, response: res, request: req });
          if (doRetry && attempt < attempts - 1) {
            logger?.debug?.('retry', { attempt: attempt + 1, status: res.status, url: req.url });
            await sleep(backoffDelay(retry, attempt));
            attempt++;
            continue;
          }
        }
        return res;
      } catch (err) {
        lastError = err;
        const doRetry = await shouldRetry({ retry, attempt, error: err, request: req });
        if (doRetry && attempt < attempts - 1) {
          logger?.debug?.('retry', {
            attempt: attempt + 1,
            error: err && typeof err === 'object' ? (err as any).message : String(err),
            url: req.url,
          });
          await sleep(backoffDelay(retry, attempt));
          attempt++;
          continue;
        }
        break;
      }
    }
    throw lastError;
  };

async function shouldRetry(p: {
  retry: RetryOptions;
  attempt: number;
  response?: TransportResponseLike;
  error?: any;
  request: NormalizedRequest;
}): Promise<boolean> {
  const { retry, response, error, request } = p;
  if (retry.retryOn)
    return !!(await retry.retryOn({
      attempt: p.attempt,
      response: response as any,
      error,
      request,
    }));
  if (error) return true; // network / thrown
  if (response) {
    if (retry.methods && !retry.methods.includes(request.method.toUpperCase())) return false;
    if (retry.statusCodes && retry.statusCodes.includes(response.status)) return true;
  }
  return false;
}

const JITTER_FACTOR = 0.2; // +/-20% symmetric jitter
function backoffDelay(retry: RetryOptions, attempt: number): number {
  const base = retry.baseDelayMs ?? 300;
  if (retry.backoff === 'fixed') return base;
  const factor = retry.factor ?? 2;
  const delay = base * Math.pow(factor, attempt);
  const capped = Math.min(retry.maxDelayMs ?? delay, delay);
  const jitter = (Math.random() * 2 - 1) * JITTER_FACTOR; // uniform in [-JITTER_FACTOR, +JITTER_FACTOR]
  return Math.max(0, Math.round(capped * (1 + jitter)));
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const responseParsingMiddleware: Middleware = (next: Transport) => async (req) => {
  const res = await next(req);
  // Always read text once
  const text = await res.text();
  let data: any = text;
  if (req.responseType !== 'text' && req.responseType !== 'raw') {
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      /* keep raw text */
    }
  }
  const ok =
    (res as any).ok !== undefined ? (res as any).ok : res.status >= 200 && res.status < 300;
  if (!ok) {
    throw new SellAuthError((data && data.message) || `HTTP ${res.status}`, {
      status: res.status,
      details: data,
    });
  }
  return { ...res, data } as any;
};
