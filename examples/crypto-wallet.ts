// examples/crypto-wallet.ts
// Basic usage of the crypto wallet payouts API.
// Usage: SELLAUTH_TOKEN=sk_xxx SHOP_ID=123 bun examples/crypto-wallet.ts

import { SellAuthClient, SellAuthError } from '@wtfservices/sellauth-utils';

async function main() {
  const apiKey = process.env.SELLAUTH_TOKEN;
  const shopIdEnv = process.env.SHOP_ID;
  if (!apiKey || !shopIdEnv) {
    console.error('Missing SELLAUTH_TOKEN or SHOP_ID');
    process.exit(1);
  }
  const shopId = Number(shopIdEnv);
  const client = new SellAuthClient({ apiKey });
  try {
    const payouts = await client.cryptoWallet(shopId).getPayouts();
    console.log('Payout history:', payouts);
    const balances = await client.cryptoWallet(shopId).getBalances();
    console.log('Balances:', balances);
    const tx = await client.cryptoWallet(shopId).getTransactions();
    console.log('Transactions:', tx);
    // To initiate a payout (UNCOMMENT & set values):
    // await client.cryptoWallet(shopId).payout({ currency: 'btc', address: 'your-address', amount: 0.001 });
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
