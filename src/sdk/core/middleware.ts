import { Middleware, NormalizedRequest, RetryOptions, Transport, TransportResponseLike } from './config';
import { SellAuthError } from './http';

export const authMiddleware = (cfg: { auth?: any; apiKey?: string; logger?: any; }): Middleware => (next: Transport) => async (req) => {
  const a = cfg.auth || {};
  if (a.type === 'custom' && a.authorize) {
    await a.authorize(req);
  } else if (a.type === 'bearer') {
    const token = a.bearer ? await a.bearer() : a.apiKey || cfg.apiKey;
    if (token) req.headers['Authorization'] = `${a.scheme || 'Bearer'} ${token}`;
  } else { // default apiKey
    const token = a.apiKey || cfg.apiKey;
    if (token) req.headers['Authorization'] = `${a.scheme || 'Bearer'} ${token}`;
  }
  return next(req);
};

export const loggerMiddleware = (logger: any): Middleware => (next: Transport) => async (req) => {
  logger?.debug?.('request', { method: req.method, url: req.url, headers: req.headers });
  const start = Date.now();
  try {
    const res = await next(req);
    logger?.debug?.('response', { url: req.url, status: res.status, ms: Date.now()-start });
    return res;
  } catch (e: any) {
    logger?.error?.('error', { url: req.url, error: e });
    throw e;
  }
};

export const retryMiddleware = (retry: RetryOptions, logger?: any): Middleware => (next: Transport) => async (req) => {
  const attempts = Math.max(1, retry.attempts ?? 1);
  let attempt = 0; let lastError: any;
  while (attempt < attempts) {
    try {
      const res = await next(req);
      const ok = (res as any).ok !== undefined ? (res as any).ok : (res.status >= 200 && res.status < 300);
      if (!ok) {
        const doRetry = await shouldRetry({ retry, attempt, response: res, request: req });
        if (doRetry && attempt < attempts - 1) { await sleep(backoffDelay(retry, attempt)); attempt++; continue; }
      }
      return res;
    } catch (err) {
      lastError = err;
      const doRetry = await shouldRetry({ retry, attempt, error: err, request: req });
      if (doRetry && attempt < attempts - 1) { await sleep(backoffDelay(retry, attempt)); attempt++; continue; }
      break;
    }
  }
  throw lastError;
};

async function shouldRetry(p: { retry: RetryOptions; attempt: number; response?: TransportResponseLike; error?: any; request: NormalizedRequest }): Promise<boolean> {
  const { retry, response, error, request, attempt } = p;
  if (retry.retryOn) return !!(await retry.retryOn({ attempt, response: response as any, error, request }));
  if (error) return true; // network / thrown
  if (response) {
    if (retry.methods && !retry.methods.includes(request.method.toUpperCase())) return false;
    if (retry.statusCodes && retry.statusCodes.includes(response.status)) return true;
  }
  return false;
}

function backoffDelay(retry: RetryOptions, attempt: number): number {
  const base = retry.baseDelayMs ?? 300;
  if (retry.backoff === 'fixed') return base;
  const factor = retry.factor ?? 2;
  const delay = base * Math.pow(factor, attempt);
  return Math.min(retry.maxDelayMs ?? delay, delay) * (1 + Math.random()*0.2);
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export const responseParsingMiddleware: Middleware = (next: Transport) => async (req) => {
  const res = await next(req);
  // Always read text once
  const text = await res.text();
  let data: any = text;
  if (req.responseType !== 'text' && req.responseType !== 'raw') {
    try { data = text ? JSON.parse(text) : undefined; } catch { /* keep raw text */ }
  }
  const ok = (res as any).ok !== undefined ? (res as any).ok : (res.status >= 200 && res.status < 300);
  if (!ok) {
    throw new SellAuthError((data && data.message) || `HTTP ${res.status}`, { status: res.status, details: data });
  }
  // Repackage minimal response-like structure returning parsed data in .json
  return { ...res, data } as any;
};
