# SellAuth Utils

TypeScript SDK for the SellAuth API.

Provides:

- Lightweight HTTP client and resource wrappers (shops, products, invoices, checkout)
- Advanced configurable client with middleware, retries, hooks, custom transport
- Pagination helpers for page/perPage APIs (streaming or aggregate)
- Examples and focused documentation

## Requirements

- Node.js >= 18 (native fetch)
- TypeScript 5.x (development only)

## Installation

```bash
npm install @wtfservices/sellauth-utils
# or
pnpm add @wtfservices/sellauth-utils
# or
yarn add @wtfservices/sellauth-utils
```

(Adjust name if published under a different package scope.)

## Quick Start

```ts
import { SellAuthClient } from '@wtfservices/sellauth-utils';
const client = new SellAuthClient({ apiKey: process.env.SELLAUTH_TOKEN! });
const shops = await client.shops.list();
console.log(shops);
```

### Products (paginated)

```ts
const products = await client.products(shopId).list({ page: 1, perPage: 20 });
```

### Collect all products

```ts
import { fetchAllPages } from '@wtfservices/sellauth-utils';
const all = await fetchAllPages(
  ({ page, perPage }) => client.products(shopId).list({ page, perPage }),
  { pageSize: 100 },
);
```

### Stream products

```ts
import { paginateAll } from '@wtfservices/sellauth-utils';
for await (const product of paginateAll(
  ({ page, perPage }) => client.products(shopId).list({ page, perPage }),
  { pageSize: 50 },
)) {
  // handle product
}
```

### Create a checkout (server-side)

```ts
const session = await client.checkout(shopId).create({
  cart: [{ productId: 1, variantId: 2, quantity: 1 }],
  gateway: 'STRIPE',
  email: 'customer@example.com',
});
console.log(session.invoice_url, session.url);
```

### Error handling

```ts
import { SellAuthError } from '@wtfservices/sellauth-utils';
try {
  await client.products(shopId).list({ page: 1, perPage: 10 });
} catch (e) {
  if (e instanceof SellAuthError) {
    console.error('API error', e.status, e.details);
  } else {
    throw e;
  }
}
```

## Advanced Client

Use `AdvancedSellAuthClient` for dynamic auth, custom retry/backoff strategies, lifecycle hooks, custom transport, and middleware extensibility.

```ts
import { AdvancedSellAuthClient } from '@wtfservices/sellauth-utils';
const client = new AdvancedSellAuthClient({
  apiKey: process.env.SELLAUTH_TOKEN,
  retries: { attempts: 5, backoff: 'exponential', baseDelayMs: 250 },
  beforeRequest: (r) => console.log('->', r.method, r.url),
  afterResponse: (_d, r) => console.log('<-', r.method, r.url),
  logger: console,
});
const shops = await client.request('GET', '/shops');
```

Features:

- Pluggable auth (static api key, dynamic bearer, custom signer)
- Configurable retries with symmetric jittered exponential backoff & predicate
- Middleware pipeline (auth → logger → retry → parse → your middleware)
- Hooks: `beforeRequest` / `afterResponse`
- Custom transport (swap fetch, add tracing, circuit breaking)

See: `docs/advanced-config.md`, `docs/middleware.md`.

## Pagination Helpers

Located in `src/sdk/pagination.ts` and re-exported.

- `paginateAll(fetchPage, opts)` AsyncGenerator streaming items
- `fetchAllPages(fetchPage, opts)` collect all items
- `fetchPages(fetchPage, opts)` collect page objects

`opts` fields: `pageSize`, `maxPages`, `concurrency`, `stopOnEmpty`, `transform`, `onPage`.

## API Surface

Exports (index):

- `SellAuthClient`
- `AdvancedSellAuthClient`
- Resource factories: `shops`, `products`, `invoices`, `checkout`
- Pagination: `paginateAll`, `fetchAllPages`, `fetchPages`
- Errors: `SellAuthError`

Consult `SellAuth-API.md` for endpoint inventory.

## Security

- Never expose API keys in browser code; use server-side only.
- Store secrets in environment variables or a secrets manager.
- Restrict sensitive operations (e.g. checkout creation) to backends.
- Retries mitigate transient network/server errors; still apply rate limiting.

## Examples

See `examples/` for:

- Basic usage (`usage.ts`)
- Advanced client config (`advanced.ts`)
- Caching middleware (`caching-middleware.ts`)
- Pagination patterns (`pagination.ts`)

Run (example):

```bash
export SELLAUTH_TOKEN="<api-key>"
node --loader tsx examples/usage.ts
```

## Extending

1. Add file in `src/sdk/resources/` (e.g. `coupons.ts`).
2. Implement a class using the shared HTTP client.
3. Export via `src/sdk/resources/index.ts` and root index.
4. Add example + docs if needed.

## Troubleshooting

- Node < 18: upgrade (native fetch required).
- Timeouts: raise `timeoutMs` or retry `attempts` in client options.
- 401 Unauthorized: verify API key validity and header formatting.

## Release Process

1. Update `CHANGELOG.md`.
2. `npm run build` (verify `dist/`).
3. Bump version in `package.json` (semver).
4. Commit & tag: `git tag vX.Y.Z`.
5. Publish: `npm publish --access public`.
6. Push tags: `git push --tags`.

## Contributing

PRs welcome. Keep changes focused. Follow existing commit style. Run:

```bash
npm run lint
npm run build
```

## License

MIT

## Additional Docs

- API reference: `SellAuth-API.md`
- Advanced configuration: `docs/advanced-config.md`
- Middleware details: `docs/middleware.md`
