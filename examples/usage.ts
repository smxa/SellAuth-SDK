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

  // If shops exist, list products from the first shop
  if (shops[0]) {
    const products = await client.products(shops[0].id).list({ perPage: 5 });
    console.log('First shop products:', products);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
