// examples/caching-middleware.ts
// Demonstrates a simple in-memory caching middleware for GET requests.
// Usage: SELLAUTH_API_KEY=sk_xxx node --loader tsx examples/caching-middleware.ts

import type { Middleware } from '@wtfservices/sellauth-utils/advanced';
import { AdvancedSellAuthClient } from '@wtfservices/sellauth-utils/advanced';

// Simple per-middleware-instance in-memory GET cache with TTL
// Notes:
// - Cache is per middleware instance (avoid module-level leakage).
// - Only successful 2xx responses cached.
// - Authorization header fingerprint hashed (FNV-1a 64-bit) to separate caches per token without storing raw token.

interface CacheEntry {
  expires: number;
  value: any;
  raw: string;
}

const DEFAULT_TTL_MS = 10_000; // 10 seconds
const CACHEABLE_METHOD = 'GET';
const FNV64_OFFSET_BASIS = 0xcbf29ce484222325n;
const FNV64_PRIME = 0x100000001b3n;

// Create a caching middleware function
const cachingMiddleware = (ttlMs: number = DEFAULT_TTL_MS): Middleware => {
  const cache = new Map<string, CacheEntry>();

  // FNV-1a 64-bit hash function for authorization fingerprint
  const fnv1a64 = (str: string) => {
    let h = FNV64_OFFSET_BASIS;
    for (let i = 0; i < str.length; i++) {
      h ^= BigInt(str.charCodeAt(i));
      h = (h * FNV64_PRIME) & 0xffffffffffffffffn;
    }
    return h.toString(16).padStart(16, '0');
  };

  // Generate a cache key from request method, URL, and auth fingerprint
  const keyFor = (req: any) => {
    const headers = Object.fromEntries(
      Object.entries(req.headers || {}).map(([k, v]) => [k.toLowerCase(), v ?? '']),
    );
    const authVal = String(headers['authorization'] || '');
    const authFp = authVal ? fnv1a64(authVal) : '';
    return `${req.method} ${req.url} ${authFp}`;
  };

  // Return the middleware function
  return (next) => async (req) => {
    if (req.method === CACHEABLE_METHOD) {
      const key = keyFor(req);
      const hit = cache.get(key);
      const now = Date.now();

      // Check for cache hit
      if (hit && hit.expires > now) {
        // Return minimal transport-like response with cached data
        return {
          status: 200,
          headers: {},
          text: async () => hit.raw,
          ok: true,
          data: hit.value,
        } as any;
      }

      // Proceed with the request
      const res: any = await next(req);
      const ok =
        res && (typeof res.ok === 'boolean' ? res.ok : res.status >= 200 && res.status < 300);

      // Cache successful responses
      if (ok) {
        if (res.data !== undefined) {
          const raw = JSON.stringify(res.data);
          cache.set(key, { expires: Date.now() + ttlMs, value: res.data, raw });
        }
      }
      return res;
    }

    // For non-GET requests, pass through
    return next(req);
  };
};

async function main() {
  // Initialize client with caching middleware
  const client = new AdvancedSellAuthClient({
    apiKey: process.env.SELLAUTH_API_KEY,
    middleware: [cachingMiddleware()], // default 10s TTL
  });

  // First request (uncached)
  console.time('first');
  await client.request<any>('GET', '/shops');
  console.timeEnd('first');

  // Second request (should hit cache)
  console.time('second');
  await client.request<any>('GET', '/shops');
  console.timeEnd('second'); // should be near-zero from cache
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
