import { normalizeConfig, SellAuthAdvancedConfig, RequestOptions, NormalizedRequest, Middleware } from './core/config';
import { fetchTransport } from './core/transport';
import { authMiddleware, loggerMiddleware, retryMiddleware, responseParsingMiddleware } from './core/middleware';
import { SellAuthError } from './core/http';

export class AdvancedSellAuthClient {
  private config = normalizeConfig({});
  private pipeline: (req: NormalizedRequest) => Promise<any>;

  constructor(cfg: SellAuthAdvancedConfig) {
    this.config = normalizeConfig(cfg);
    const transport = this.config.transport || fetchTransport;
    const m: Middleware[] = [];
    // order: auth -> logger -> retry -> responseParsing -> user provided (outer to inner? ensure user last or first?)
    m.push(authMiddleware({ auth: this.config.auth, apiKey: this.config.apiKey, logger: this.config.logger }));
    if (this.config.logger) m.push(loggerMiddleware(this.config.logger));
    m.push(retryMiddleware(this.config.retry, this.config.logger));
    m.push(responseParsingMiddleware);
    if (this.config.middleware) m.push(...this.config.middleware);

    this.pipeline = m.reduceRight((next, mw) => mw(next), transport);
  }

  private buildUrl(path: string, query?: Record<string,any>) {
    let base = this.config.baseUrl.replace(/\/$/, '');
    let full = path.startsWith('http') ? path : `${base}${path.startsWith('/')?'':'/'}${path}`;
    if (query && Object.keys(query).length) {
      const qs = Object.entries(query).filter(([,v])=>v!==undefined&&v!==null).map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(String(v))).join('&');
      if (qs) full += (full.includes('?')?'&':'?')+qs;
    }
    return full;
  }

  async request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(path, opts.query);
    const headers: Record<string,string> = { ...(this.config.headers||{}), ...(opts.headers||{}), 'Accept': 'application/json' };
    const req: NormalizedRequest = { method: method.toUpperCase(), url, headers, body: undefined, timeoutMs: opts.timeoutMs || this.config.timeoutMs, responseType: opts.responseType || 'json', signal: opts.signal };

    if (opts.body !== undefined && opts.body !== null && !(opts.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      req.body = JSON.stringify(opts.body);
    } else if (opts.body instanceof FormData) {
      req.body = opts.body;
    }

    try {
      if (this.config.beforeRequest) await this.config.beforeRequest(req);
      const res: any = await this.pipeline(req);
      if (this.config.afterResponse) await this.config.afterResponse(res.data, req);
      return res.data as T;
    } catch (e: any) {
      if (e instanceof SellAuthError) throw e;
      throw new SellAuthError(e.message || 'Request failed', { details: e });
    }
  }
}

export type { SellAuthAdvancedConfig } from './core/config';
