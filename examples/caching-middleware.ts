import { AdvancedSellAuthClient } from '../src/sdk/advanced';
import type { Middleware } from '../src/sdk/advanced';

// Simple per-middleware-instance in-memory GET cache with TTL
interface CacheEntry {
  expires: number;
  value: any;
  raw: string;
}

const cachingMiddleware = (ttlMs: number): Middleware => {
  const cache = new Map<string, CacheEntry>();
  const keyFor = (req: any) => {
    const auth = Object.keys(req.headers || {}).find((h) => h.toLowerCase() === 'authorization');
    const authVal = auth ? req.headers[auth] : '';
    const authFp = authVal ? authVal.slice(0, 16) : '';
    return req.method + ' ' + req.url + ' ' + authFp;
  };
  return (next) => async (req) => {
    if (req.method === 'GET') {
      const key = keyFor(req);
      const hit = cache.get(key);
      const now = Date.now();
      if (hit && hit.expires > now) {
        return {
          status: 200,
          headers: {},
          text: async () => hit.raw,
          ok: true,
          data: hit.value,
        } as any;
      }
      const res: any = await next(req);
      const ok =
        res && (typeof res.ok === 'boolean' ? res.ok : res.status >= 200 && res.status < 300);
      if (ok) {
        const raw = JSON.stringify(res.data);
        cache.set(key, { expires: Date.now() + ttlMs, value: res.data, raw });
      }
      return res;
    }
    return next(req);
  };
};

async function main() {
  const client = new AdvancedSellAuthClient({
    apiKey: process.env.SELLAUTH_TOKEN,
    middleware: [cachingMiddleware(10_000)], // 10s TTL
  });

  console.time('first');
  await client.request<any>('GET', '/shops');
  console.timeEnd('first');

  console.time('second');
  await client.request<any>('GET', '/shops');
  console.timeEnd('second'); // should be near-zero from cache
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
