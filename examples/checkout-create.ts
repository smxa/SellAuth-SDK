// examples/checkout-create.ts
// Create a checkout session.
// Usage: SELLAUTH_API_KEY=sk_xxx SHOP_ID=123 node --loader tsx examples/checkout-create.ts

import { SellAuthClient, SellAuthError } from '@wtfservices/sellauth-utils';

async function main() {
  // Retrieve environment variables
  const apiKey = process.env.SELLAUTH_API_KEY;
  const shopIdEnv = process.env.SHOP_ID;

  // Validate required environment variables
  if (!apiKey) {
    console.error('Missing SELLAUTH_API_KEY env var');
    process.exit(1);
  }
  if (!shopIdEnv) {
    console.error('Missing SHOP_ID env var');
    process.exit(1);
  }

  // Parse and validate shop ID
  const shopId = Number(shopIdEnv);
  if (!Number.isFinite(shopId)) {
    console.error('SHOP_ID must be a number');
    process.exit(1);
  }

  // Initialize the client
  const client = new SellAuthClient({ apiKey });

  try {
    // Create checkout session
    const checkout = await client.checkout(shopId).create({
      cart: [{ productId: 1, variantId: 1, quantity: 1 }],
      gateway: 'STRIPE',
      email: 'customer@example.com',
      // Optional: return_url, metadata, currency, etc.
    } as any); // Cast if local type doesn't include extra fields yet

    // Log checkout details
    console.log('Checkout created');
    console.log(' success:', (checkout as any).success);
    console.log(' invoice id:', (checkout as any).invoice_id);
    console.log(' invoice URL:', (checkout as any).invoice_url);
    console.log(' hosted URL:', (checkout as any).url || '(none)');
  } catch (e) {
    // Handle API errors
    if (e instanceof SellAuthError) {
      console.error('SellAuth API error:', e.status, e.details);
    } else {
      console.error('Unexpected error:', e);
    }
    process.exit(1);
  }
}

main();
