# Middleware Details

This document expands on the built‑in middleware supplied by `AdvancedSellAuthClient`.

Order (execution sequence left→right):

1. `authMiddleware`
2. `loggerMiddleware` (only if `logger` provided) – request headers are sanitized (sensitive headers like `Authorization`, `x-api-key`, `cookie` redacted by default)
3. `retryMiddleware` (uses exponential backoff with symmetric jitter ±20% to avoid thundering herd)
4. `responseParsingMiddleware`
5. Custom `middleware[]` (user supplied, runs AFTER built-ins so it sees authenticated requests & parsed responses)

return res; // or modified res
};

````

Insert via config:

```ts
new AdvancedSellAuthClient({ middleware: [myMiddleware] });
````

## Logging Sanitization

`loggerMiddleware(logger, options?)` redacts sensitive headers. You can provide:

```ts
loggerMiddleware(logger, {
  sensitiveHeaders: ['authorization', 'x-api-key'], // extend/override default set
  allowlist: ['x-api-key'], // do not redact these even if sensitive
  mask: (name, value) => `[REDACTED:${value.slice(-4)}]`, // custom masking
});
```

Defaults: `Authorization`, `Proxy-Authorization`, `X-API-Key`, `X-API-Token`, `X-Amz-Security-Token`, `X-Aws-Credentials`, `Authentication`, `Cookie`, `Set-Cookie`.

## Retry Backoff Jitter

`retryMiddleware` now applies symmetric jitter (±20%) around the exponential backoff delay, reducing synchronized retries.

## Caching Example

See `examples/caching-middleware.ts` for an end‑to‑end example demonstrating a simple in‑memory GET cache with TTL.
