import { SellAuthClient, paginateAll } from '../src';

async function main() {
  const token = process.env.SELLAUTH_TOKEN;
  const shopId = process.env.SELLAUTH_SHOP_ID;
  if (!token || !shopId) {
    console.error('Set SELLAUTH_TOKEN and SELLAUTH_SHOP_ID');
    process.exit(1);
  }
  const client = new SellAuthClient({ apiKey: token });
  const productsApi = client.products(shopId);

  let count = 0;
  for await (const p of paginateAll(
    ({ page, perPage }) => productsApi.list({ page, perPage }).then((arr) => ({ data: arr })),
    { pageSize: 50, maxPages: 2 },
  )) {
    count++;
    if (count <= 5) console.log('Product', (p as any).id, (p as any).name);
  }
  console.log('Total streamed products (limited by maxPages=2):', count);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
