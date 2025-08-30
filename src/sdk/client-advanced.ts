import type {
  Middleware,
  NormalizedRequest,
  RequestOptions,
  SellAuthAdvancedConfig,
} from "./core/config";
import { normalizeConfig } from "./core/config";
import { SellAuthError } from "./core/http";
import {
  authMiddleware,
  loggerMiddleware,
  responseParsingMiddleware,
  retryMiddleware,
} from "./core/middleware";
import { fetchTransport } from "./core/transport";

// (Reserved for future hook expansion)



// Unified interface so existing resource wrappers can accept either legacy HttpClient or advanced client
export class AdvancedSellAuthClient {
  private config: ReturnType<typeof normalizeConfig>;
  private pipeline!: (_req: NormalizedRequest) => Promise<any>;
  // Removed duplicate request exposure to avoid conflicts; class method below is used for structural typing


  constructor(cfg: SellAuthAdvancedConfig) {
    this.config = normalizeConfig(cfg);
    const transport = this.config.transport || fetchTransport;
    const m: Middleware[] = []; // internal built-in middleware, applied inner-most
    // order: auth -> logger -> retry -> responseParsing -> user provided (outer to inner? ensure user last or first?)
    m.push(
      authMiddleware({
        auth: this.config.auth,
        apiKey: this.config.apiKey,
        logger: this.config.logger,
      })
    );
    if (this.config.logger) m.push(loggerMiddleware(this.config.logger));
    m.push(retryMiddleware(this.config.retry, this.config.logger));
    m.push(responseParsingMiddleware);
    // user middleware are provided separately in config.middleware and will wrap these
    // Compose so user-provided middleware (if any) wrap built-ins: user outermost
    const builtIns = m;
    const chain = [...(this.config.middleware || []), ...builtIns];
    this.pipeline = chain.reduceRight((next, mw) => mw(next), transport);

  }

  private buildUrl(path: string, query?: Record<string, any>) {
    let base = this.config.baseUrl.replace(/\/$/, "");
    let full = path.startsWith("http")
      ? path
      : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
    if (query && Object.keys(query).length) {
      const qs = Object.entries(query)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(
          ([k, v]) =>
            encodeURIComponent(k) + "=" + encodeURIComponent(String(v))
        )
        .join("&");
      if (qs) full += (full.includes("?") ? "&" : "?") + qs;
    }
    return full;
  }

  // Core request method (advanced). Handles normalization and middleware pipeline invocation.
  async request<T>(
    method: string,
    path: string,
    opts: RequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(path, opts.query);
    const headers: Record<string, string> = { ...(this.config.headers || {}) };
    if (opts.headers) { // merge user headers
      for (const [k,v] of Object.entries(opts.headers)) headers[k] = v;
    }
    if (!Object.keys(headers).some(h => h.toLowerCase() === 'accept')) {
      headers['Accept'] = 'application/json';
    }
    const req: NormalizedRequest = {
      method: method.toUpperCase(),
      url,
      headers,
      body: undefined,
      timeoutMs: opts.timeoutMs ?? this.config.timeoutMs,
      responseType: opts.responseType ?? 'json',
      signal: opts.signal,
    };

    if (opts.body !== undefined && opts.body !== null) {
      const b = opts.body as any;
      const isForm = typeof FormData !== 'undefined' && b && typeof b === 'object' && typeof b.append === 'function' && (b.constructor?.name === 'FormData');
      const isPlainObj = Object.prototype.toString.call(b) === '[object Object]';
      if (isForm) {
        req.body = b;
      } else if (typeof b === 'string' || (typeof Blob !== 'undefined' && b instanceof Blob)) {
        req.body = b;
      } else if (isPlainObj) {
        if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
        req.body = JSON.stringify(b);
      } else {
        req.body = b; // pass-through
      }
    }

    try {
      if (this.config.beforeRequest) await this.config.beforeRequest({ ...req });
      const res: any = await this.pipeline(req);
      if (this.config.afterResponse)
        await this.config.afterResponse(res.data, req);
      return res.data as T;
    } catch (e: any) {
      if (e instanceof SellAuthError) throw e;
      const msg = e && typeof e === 'object' && 'message' in e ? e.message : 'Request failed';
      throw new SellAuthError(String(msg), { details: e, status: e?.status });
    }
  }
}

export type { SellAuthAdvancedConfig } from "./core/config";
