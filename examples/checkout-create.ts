// examples/checkout-create.ts
// Create a checkout session.
// Usage:
//   SELLAUTH_TOKEN=sk_xxx SHOP_ID=123 bun examples/checkout-create.ts
// or
//   SELLAUTH_TOKEN=sk_xxx SHOP_ID=123 node --loader tsx examples/checkout-create.ts

import { SellAuthClient, SellAuthError } from '@wtfservices/sellauth-utils';

async function main() {
  const apiKey = process.env.SELLAUTH_TOKEN;
  const shopIdEnv = process.env.SHOP_ID;
  if (!apiKey) {
    console.error('Missing SELLAUTH_TOKEN env var');
    process.exit(1);
  }
  if (!shopIdEnv) {
    console.error('Missing SHOP_ID env var');
    process.exit(1);
  }
  const shopId = Number(shopIdEnv);
  if (Number.isNaN(shopId)) {
    console.error('SHOP_ID must be a number');
    process.exit(1);
  }

  const client = new SellAuthClient({ apiKey });

  try {
    const checkout = await client.checkout(shopId).create({
      cart: [{ productId: 1, variantId: 1, quantity: 1 }],
      gateway: 'STRIPE',
      email: 'customer@example.com',
      // Optional: return_url, metadata, currency, etc.
    } as any); // Cast if local type doesn't include extra fields yet

    console.log('Checkout created');
    console.log(' id:', (checkout as any).id);
    console.log(' invoice URL:', (checkout as any).invoice_url);
    console.log(' hosted URL:', (checkout as any).url);
  } catch (e) {
    if (e instanceof SellAuthError) {
      console.error('SellAuth API error:', e.status, e.details);
    } else {
      console.error('Unexpected error:', e);
    }
    process.exit(1);
  }
}

main();
