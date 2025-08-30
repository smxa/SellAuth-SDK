import { AdvancedSellAuthClient, Middleware } from '../src/sdk';

// Simple in-memory GET cache with TTL
interface CacheEntry { expires: number; value: any; }
const cache = new Map<string, CacheEntry>();

function cacheKey(req: any) { return req.method + ' ' + req.url; }

const cachingMiddleware = (ttlMs: number): Middleware => (next) => async (req) => {
  if (req.method === 'GET') {
    const key = cacheKey(req);
    const hit = cache.get(key);
    const now = Date.now();
    if (hit && hit.expires > now) {
      return { status: 200, headers: {}, text: async () => JSON.stringify(hit.value), ok: true, data: hit.value } as any;
    }
    const res: any = await next(req);
    cache.set(key, { expires: Date.now() + ttlMs, value: (res as any).data });
    return res;
  }
  return next(req);
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

main().catch(e => { console.error(e); process.exit(1); });
