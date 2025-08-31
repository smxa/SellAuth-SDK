// examples/crypto-wallet.ts
// Basic usage of the crypto wallet payouts API.
// Usage: SELLAUTH_API_KEY=sk_xxx SHOP_ID=123 node --loader tsx examples/crypto-wallet.ts

import { SellAuthClient, SellAuthError } from '@wtfservices/sellauth-utils';

async function main() {
  // Retrieve environment variables
  const apiKey = process.env.SELLAUTH_API_KEY;
  const shopIdEnv = process.env.SHOP_ID;

  // Validate required environment variables
  if (!apiKey || !shopIdEnv) {
    console.error('Missing SELLAUTH_API_KEY or SHOP_ID');
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
    // Get the crypto wallet API instance
    const wallet = client.cryptoWallet(shopId);

    // Fetch and log payout history
    const payouts = await wallet.getPayouts();
    console.log('Payout history:', payouts);

    // Fetch and log wallet balances
    const balances = await wallet.getBalances();
    console.log('Balances:', balances);

    // Fetch and log transaction history
    const transactions = await wallet.getTransactions();
    console.log('Transactions:', transactions);

    // Example: To initiate a payout (uncomment and set values)
    // await wallet.payout({ currency: 'btc', address: 'your-address', amount: 0.001 });
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
