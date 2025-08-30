# Middleware Details

This document expands on the built‑in middleware supplied by `AdvancedSellAuthClient`.

Order (execution sequence left→right):

1. `authMiddleware`
2. `loggerMiddleware` (only if `logger` provided)
3. `retryMiddleware`
4. `responseParsingMiddleware`
5. Custom `middleware[]` (user supplied, runs AFTER built-ins so it sees authenticated requests & parsed responses)


  return res; // or modified res
};
```

Insert via config:

```ts
new AdvancedSellAuthClient({ middleware: [myMiddleware] });
```

## Caching Example

See `examples/caching-middleware.ts` for an end‑to‑end example demonstrating a simple in‑memory GET cache with TTL.
