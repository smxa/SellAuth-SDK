import { SellAuthClient } from '@wtfservices/sellauth-utils';

async function main() {
  const token = process.env.SELLAUTH_TOKEN;
  if (!token) throw new Error('Missing SELLAUTH_TOKEN');

  const shopId = process.argv[2] || 1; // pass shop id as first arg
  const client = new SellAuthClient({ apiKey: token });

  try {
    const overview = await client.analytics(shopId).overview();
    console.log('Overview:', overview);
  } catch (e) {
    console.error('Failed to fetch overview analytics', e);
  }

  try {
    const topProducts = await client.analytics(shopId).topProducts();
    console.log('Top products:', topProducts);
  } catch (e) {
    console.error('Failed to fetch top products', e);
  }

  try {
    const topCustomers = await client.analytics(shopId).topCustomers();
    console.log('Top customers:', topCustomers);
  } catch (e) {
    console.error('Failed to fetch top customers', e);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
