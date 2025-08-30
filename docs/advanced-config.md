# Advanced Configuration

This SDK provides an `AdvancedSellAuthClient` for fine‑grained control over transport, authentication, retries, middleware, and lifecycle hooks. The original `SellAuthClient` remains available for simple usage.

## Quick Start
```ts
import { AdvancedSellAuthClient } from 'sellauth-utils';

const client = new AdvancedSellAuthClient({
  apiKey: process.env.SELLAUTH_TOKEN,           // simple static key
  retries: { attempts: 4, backoff: 'exponential', baseDelayMs: 200 },
  timeoutMs: 15000,
  beforeRequest: (req) => console.log('->', req.method, req.url),
  afterResponse: (_data, req) => console.log('<-', req.method, req.url),
  logger: console,
});

const shops = await client.request<any>('GET', '/shops');
```

## Configuration Reference (`SellAuthAdvancedConfig`)
Field | Type | Default | Notes
----- | ---- | ------- | -----
`apiKey` | `string?` | — | Convenience for bearer/api key auth.
`baseUrl` | `string?` | `https://api.sellauth.com/v1` | Trailing slash trimmed.
`timeoutMs` | `number?` | `15000` | Per request unless overridden.
`retries` | `number | RetryOptions?` | `3 attempts` exponential | Number shorthand => attempts.
`headers` | `Record<string,string>?` | — | Merged into each request.
`auth` | `AuthConfig?` | derived | Advanced auth strategies.
`transport` | `Transport?` | native fetch wrapper | Full replacement.
`middleware` | `Middleware[]?` | — | Appended after built‑ins.
`logger` | `LoggerLike?` | — | Enables `loggerMiddleware` (debug/error).
`beforeRequest` | `(req) => void|Promise` | — | Modify/log request before send.
`afterResponse` | `(data, req) => void|Promise` | — | Observe parsed response data.

### RetryOptions
Property | Meaning | Default
-------- | ------- | -------
`attempts` | Total tries incl. first | `3`
`backoff` | `'fixed' | 'exponential'` | `exponential`
`factor` | Growth factor (exp) | `2`
`baseDelayMs` | Initial delay | `300`
`maxDelayMs` | Cap (optional) | —
`methods` | Methods eligible | `['GET','HEAD','OPTIONS']`
`statusCodes` | HTTP retry list | `[408,429,500,502,503,504]`
`retryOn` | Custom predicate | —

Custom `retryOn` example (retry 502/503, not 500, plus network errors):
```ts
retries: {
  attempts: 5,
  retryOn: async ({ response, error }) => {
    if (error) return true; // network failure
    return [502,503].includes(response?.status || 0);
  }
}
```

### Auth Strategies (`AuthConfig`)
Mode | Description
---- | -----------
`apiKey` (default) | Uses `apiKey` with `Authorization: Bearer <key>`.
`bearer` | Same header; token can be dynamic via `bearer()` function.
`custom` | Provide `authorize(req)` to inject any headers / signing.

Dynamic bearer token refresh:
```ts
const client = new AdvancedSellAuthClient({
  auth: {
    type: 'bearer',
    bearer: async () => fetchFreshTokenFromCacheOrIdp(),
  }
});
```

Custom signing:
```ts
auth: {
  type: 'custom',
  authorize: async (req) => {
    const signature = sign(req.method + '\n' + req.url);
    req.headers['X-Signature'] = signature;
  }
}
```

### Lifecycle Hooks
- `beforeRequest(req)` — mutate headers, inject tracing IDs, metrics start.
- `afterResponse(data, req)` — emit metrics, logging, caching, tracing end.

### Middleware Pipeline
Pipeline composition: user middleware (if any) are placed before the built‑ins in the chain array and the chain is composed with `reduceRight` ending at the transport. This makes user middleware OUTERMOST. Effective order (outer → inner):
1. `authMiddleware`
2. `loggerMiddleware` (only if `logger` provided)
3. `retryMiddleware`
4. `responseParsingMiddleware`
5. Your custom `middleware[]` (added outermost so they see the request before built-ins and can observe the response prior to parsing if they short‑circuit or you customize the chain).

To fully customize ordering, supply your own composed transport or open an issue to discuss additional ordering controls.

Custom middleware signature:
```ts
import { Middleware } from 'sellauth-utils';

const metricsMiddleware: Middleware = (next) => async (req) => {
  const start = Date.now();
  const res = await next(req);
  console.log('timing', req.method, req.url, Date.now()-start);
  return res;
};
```
Attach:
```ts
new AdvancedSellAuthClient({ middleware: [metricsMiddleware] });
```

If you need a custom order, wrap a custom transport that composes your preferred chain, or open an issue to expose ordering control.

### Custom Transport
Implement the `Transport` interface:
```ts
import type { Transport, NormalizedRequest } from 'sellauth-utils';

const nodeFetchTransport: Transport = async (req) => {
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(), req.timeoutMs ?? 15000);
  try {
    const r = await fetch(req.url, { method: req.method, headers: req.headers, body: req.body, signal: controller.signal });
    return { status: r.status, headers: r.headers, text: () => r.text(), ok: r.ok };
  } finally { clearTimeout(timeout); }
};

new AdvancedSellAuthClient({ transport: nodeFetchTransport });
```

### Error Handling
Errors are thrown as `SellAuthError` with shape:
```ts
interface SellAuthError extends Error {
  status?: number;
  details?: any;
}
```
Use `instanceof SellAuthError` to branch.

### Comparing Clients
Aspect | SellAuthClient | AdvancedSellAuthClient
------ | -------------- | ----------------------
Auth | Static apiKey | Pluggable (apiKey, dynamic bearer, custom)
Retries | Basic (if any) | Configurable attempts/backoff/predicate
Hooks | None | beforeRequest / afterResponse
Middleware | Not extensible | Extensible pipeline
Custom Transport | No | Yes
Per-request Options | Basic | Adds `responseType`, custom headers, timeout overrides

### Migration
No changes required for existing code; opt into the advanced client when you need richer behavior.

---
See also: `middleware.md` (detailed built‑ins) & root README for basics.
