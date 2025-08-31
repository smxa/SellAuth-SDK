// examples/pagination.ts
// Demonstrates pagination using paginateAll helper.
// Usage: SELLAUTH_API_KEY=sk_xxx SELLAUTH_SHOP_ID=123 node --loader tsx examples/pagination.ts

import { SellAuthClient, paginateAll } from '@wtfservices/sellauth-utils';

async function main() {
  // Retrieve environment variables
  const token = process.env.SELLAUTH_API_KEY;
  const shopId = process.env.SELLAUTH_SHOP_ID;

  // Validate required environment variables
  if (!token || !shopId) {
    console.error('Set SELLAUTH_API_KEY and SELLAUTH_SHOP_ID');
    process.exit(1);
  }

  // Initialize client and products API
  const client = new SellAuthClient({ apiKey: token });
  const productsApi = client.products(shopId);

  // Stream products with pagination
  let count = 0;
  for await (const p of paginateAll(
    ({ page, perPage }) => productsApi.list({ page, perPage }).then((arr) => ({ data: arr })),
    { pageSize: 50, maxPages: 2 },
  )) {
    count++;
    // Log first 5 products
    if (count <= 5) console.log('Product', (p as any).id, (p as any).name);
  }

  // Log total count
  console.log('Total streamed products (limited by maxPages=2):', count);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
