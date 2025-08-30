# Middleware Details

This document expands on the built‑in middleware supplied by `AdvancedSellAuthClient`.

Order (outer → inner) when constructing the default pipeline:
1. `authMiddleware`
2. `loggerMiddleware` (only if `logger` provided)
3. `retryMiddleware`
4. `responseParsingMiddleware`
5. Custom `middleware[]` (user supplied)

Because composition reduces right, user middleware executes closest to the transport (after parsing). If you need access to the raw body/response text before JSON parsing, supply a custom transport or replicate the built‑ins with your own order.

## Auth Middleware
Adds `Authorization` header.
Modes:
- `apiKey` (default) — header `Authorization: Bearer <apiKey>`.
- `bearer` — obtains token via `bearer()` function each request (supports rotation/refresh).
- `custom` — calls `authorize(req)`; you mutate `req.headers` yourself.

## Logger Middleware
Uses the provided `logger` (e.g. `console`) to emit debug lines:
- `request` with method/url/headers
- `response` with status and timing
- `error` on thrown errors

Implement only the levels you care about (`debug`, `error`, etc.).

## Retry Middleware
Implements bounded retry with optional exponential backoff.
Key behaviors:
- Retries network errors automatically (thrown exceptions).
- Retries HTTP statuses in configured `statusCodes` set if method is in `methods`.
- Optional custom `retryOn({ attempt, response, error, request })` to fully control.
- Backoff calculation: `delay = baseDelayMs * factor^attempt` (+ ~20% jitter) capped by `maxDelayMs`.

Example customizing predicate:
```ts
retries: {
  attempts: 6,
  retryOn: ({ response, error }) => {
    if (error) return true;              // network
    if (!response) return false;
    return [502,503,504].includes(response.status); // omit 500
  }
}
```

## Response Parsing Middleware
- Reads response text once.
- Parses JSON unless `responseType` is `text` or `raw`.
- Throws `SellAuthError` for non-2xx with parsed body (if parseable) in `details`.
- Returns object enriched with `data` containing parsed payload.

## Writing Custom Middleware
Signature:
```ts
import { Middleware } from 'sellauth-utils';

const myMiddleware: Middleware = (next) => async (req) => {
  // pre logic
  const res = await next(req);
  // post logic (res contains .data after parsing middleware)
  return res; // or modified res
};
```

Insert via config:
```ts
new AdvancedSellAuthClient({ middleware: [myMiddleware] });
```

## Caching Example
See `examples/caching-middleware.ts` for an end‑to‑end example demonstrating a simple in‑memory GET cache with TTL.
