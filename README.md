# SellAuth Utils (internal)

Small TypeScript SDK + consolidated docs for the SellAuth API — internal use only.

## Summary
Provides:
- Consolidated API reference (`SellAuth-API.md`).
- Lightweight TypeScript SDK (`src/sdk`) with core HTTP client, resource wrappers (shops, products, invoices, checkout).
- Typed pagination utilities for page/perPage style endpoints.
- Example scripts (`examples/`).

Runtime requirement: **Node.js >= 18** (native fetch).

## Prerequisites
- Node.js >= 18
- `SELLAUTH_TOKEN` (API key) in environment for live examples.

## Install
```bash
npm install
```

## Build
```bash
npm run build
```
Outputs compiled files into `dist/` with type declarations.

## Usage
Initialize client:
```ts
import { SellAuthClient } from './dist';
const client = new SellAuthClient({ apiKey: process.env.SELLAUTH_TOKEN! });
```

List shops:
```ts
const shops = await client.shops.list();
console.log(shops);
```

List products for a shop (first page):
```ts
const products = await client.products(shopId).list({ page: 1, perPage: 20 });
```

Collect all products with pagination helper:
```ts
import { fetchAllPages } from './dist';
const all = await fetchAllPages(({ page, perPage }) => client.products(shopId).list({ page, perPage }), { pageSize: 100 });
console.log(all.length);
```

Stream products (memory efficient):
```ts
import { paginateAll } from './dist';
for await (const product of paginateAll(({ page, perPage }) => client.products(shopId).list({ page, perPage }), { pageSize: 50 })) {
  // process product
}
```

Create a checkout session (server-side only):
```ts
const session = await client.checkout(shopId).create({
  cart: [{ productId: 1, variantId: 2, quantity: 1 }],
  gateway: 'STRIPE',
  email: 'customer@example.com'
});
console.log(session.invoice_url, session.url);
```

Error handling pattern:
```ts
import { SellAuthError } from './dist';
try {
  await client.products(shopId).list({ page: 1, perPage: 10 });
} catch (e) {
  if (e instanceof SellAuthError) {
    console.error('API error', e.status, e.details);
  } else {
    console.error('Unexpected', e);
  }
}
```

## Pagination Helpers
Located at `src/sdk/pagination.ts`:
- `paginateAll(fetchPage, opts)` AsyncGenerator streaming items.
- `fetchAllPages(fetchPage, opts)` Promise of all items.
- `fetchPages(fetchPage, opts)` array of pages.

`opts` fields: `pageSize`, `maxPages`, `concurrency`, `stopOnEmpty`, `transform`, `onPage`.

## Project Structure
```
src/
  sdk/
    core/http.ts        # HttpClient (native fetch, retries, timeouts)
    client.ts           # SellAuthClient facade
    resources/          # Resource-specific API wrappers
    pagination.ts       # Pagination utilities
SellAuth-API.md         # Consolidated API reference
examples/               # Usage examples
```

## Security & Best Practices
- Keep `SELLAUTH_TOKEN` out of source control (use `.env`, secrets manager, or CI secrets).
- Do not expose API key in client/browser code.
- Use server-side endpoints (like checkout creation) only from trusted backends.
- Consider rate limiting callers; SDK adds retry/backoff for transient HTTP issues.

## Running Examples
```bash
export SELLAUTH_TOKEN="<your-api-key-here>"  # example
node --loader tsx examples/usage.ts
```
The line is annotated with `# example` so the pre-commit secret scan hook treats it as an intentional documentation example.
```bash
SELLAUTH_TOKEN=... node --loader tsx examples/usage.ts
```
(If variable name is `SELLAUTH_TOKEN`, adjust accordingly.)

## Extending the SDK
1. Add a new file in `src/sdk/resources/` (e.g., `coupons.ts`).
2. Implement a class taking `HttpClient` + required path parameters.
3. Export in `src/sdk/resources/index.ts` and re-export via `src/index.ts`.
4. (Optional) Add example usage in `examples/`.

## Troubleshooting
- Type errors around `fetch`: ensure Node >= 18 and `lib` in tsconfig includes `DOM` (already set).
- Requests timing out: adjust `timeoutMs` or `maxRetries` in `SellAuthClient` options.
- 401 errors: verify API key is valid/current.

## Next Steps / Ideas
- Add remaining resources (coupons, customers, tickets, payment methods).
- Stronger types (derive from future OpenAPI spec).
- Unit tests (HttpClient + pagination) with mocked fetch.
- CI pipeline for build & tests.
- Bulk operation helpers (batch updates, concurrency controls).

## Advanced Usage (Configurable Client)
For richer capabilities (dynamic auth, custom retries, middleware, hooks, custom transport) use `AdvancedSellAuthClient`.

Quick sample:
```ts
import { AdvancedSellAuthClient } from './dist';
const client = new AdvancedSellAuthClient({
  apiKey: process.env.SELLAUTH_TOKEN,
  retries: { attempts: 5, backoff: 'exponential', baseDelayMs: 250 },
  beforeRequest: r => console.log('->', r.method, r.url),
  afterResponse: (_d, r) => console.log('<-', r.method, r.url),
  logger: console,
});
const shops = await client.request('GET', '/shops');
```

Features overview:
Middleware ordering: user-provided middleware wrap built-ins (outermost first).
- Pluggable auth (static api key, dynamic bearer, custom signer)
- Retry/backoff strategy with predicate
- Middleware pipeline (timing, caching, metrics, etc.)
- Lifecycle hooks (beforeRequest / afterResponse)
- Custom transport (swap fetch, add circuit breaking, tracing)

See detailed docs: `docs/advanced-config.md` and `docs/middleware.md`.

## Documentation
See `SellAuth-API.md` for endpoint inventory and original doc links. For advanced configuration details see `docs/advanced-config.md`.

---
Internal use only.
