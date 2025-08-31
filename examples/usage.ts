// examples/usage.ts
// Basic usage example: List shops and products.
// Usage: SELLAUTH_API_KEY=sk_xxx node --loader tsx examples/usage.ts

import { SellAuthClient } from '@wtfservices/sellauth-utils';

async function main() {
  // Retrieve API key from environment
  const token = process.env.SELLAUTH_API_KEY;
  if (!token) throw new Error('Missing SELLAUTH_API_KEY');

  // Initialize the client
  const client = new SellAuthClient({ apiKey: token });

  // List all shops
  const shops = await client.shops.list();
  console.log('Shops:', shops);

  // If shops exist, list products from the first shop and demonstrate invoices filter with statuses array
  if (shops[0]) {
    const products = await client.products(shops[0].id).list({ perPage: 5 });
    console.log('First shop products:', products);

    // Demonstrate invoices filtered by statuses array -> serialized as statuses[0]=pending
    try {
      const invoices = await client.invoices(shops[0].id).list({ page: 1, statuses: ['pending'] });
      console.log('Pending invoices (first page):', invoices);
    } catch (e) {
      console.warn('Could not list invoices (maybe insufficient permissions):', (e as any).message);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
