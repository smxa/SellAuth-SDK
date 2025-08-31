// examples/crypto-wallet.ts
// Basic usage of the crypto wallet payouts API.
// Usage: SELLAUTH_API_KEY=sk_xxx SHOP_ID=123 node --loader tsx examples/crypto-wallet.ts

import { SellAuthClient, SellAuthError } from '@wtfservices/sellauth-utils';

async function main() {
  const apiKey = process.env.SELLAUTH_API_KEY;
  const shopIdEnv = process.env.SHOP_ID;
  if (!apiKey || !shopIdEnv) {
    console.error('Missing SELLAUTH_API_KEY or SHOP_ID');
    process.exit(1);
  }
  const shopId = Number(shopIdEnv);
  if (!Number.isFinite(shopId)) {
    console.error('SHOP_ID must be a number');
    process.exit(1);
  }
  const client = new SellAuthClient({ apiKey });
  try {
    const wallet = client.cryptoWallet(shopId);
    const payouts = await wallet.getPayouts();
    console.log('Payout history:', payouts);
    const balances = await wallet.getBalances();
    console.log('Balances:', balances);
    const transactions = await wallet.getTransactions();
    console.log('Transactions:', transactions);
    // To initiate a payout (UNCOMMENT & set values):
    // await wallet.payout({ currency: 'btc', address: 'your-address', amount: 0.001 });
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
