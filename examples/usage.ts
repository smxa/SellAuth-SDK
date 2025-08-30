import { SellAuthClient } from '../src';

async function main() {
  const token = process.env.SELLAUTH_TOKEN;
  if (!token) throw new Error('Missing SELLAUTH_TOKEN');
  const client = new SellAuthClient({ apiKey: token });
  const shops = await client.shops.list();
  console.log('Shops:', shops);
  if (shops[0]) {
    const products = await client.products(shops[0].id).list({ perPage: 5 });
    console.log('First shop products:', products);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
