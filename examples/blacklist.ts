import { SellAuthClient } from '@wtfservices/sellauth-utils';

/**
 * Example: basic blacklist lifecycle.
 * Run with: node --loader tsx examples/blacklist.ts (export SELLAUTH_TOKEN + SHOP_ID first)
 */
async function main() {
  const apiKey = process.env.SELLAUTH_TOKEN;
  const shopId = process.env.SHOP_ID;
  if (!apiKey || !shopId) {
    console.error('Set SELLAUTH_TOKEN and SHOP_ID env vars.');
    process.exit(1);
  }
  const client = new SellAuthClient({ apiKey });
  const blacklist = client.blacklist(shopId);

  // Create entry blocking a test email
  const created = await blacklist.create({
    value: 'blocked@example.com',
    type: 'email',
    match_type: 'exact',
    reason: 'Test block',
  });
  console.log('Created:', created);

  // List entries (first page default)
  const list = await blacklist.list({ page: 1, perPage: 10 });
  console.log('List count:', list.length);

  // Retrieve single entry
  const fetched = await blacklist.get(created.id);
  console.log('Fetched:', fetched.id, fetched.value);

  // Update entry (change reason)
  const updated = await blacklist.update(created.id, {
    value: created.value,
    type: created.type,
    match_type: created.match_type,
    reason: 'Updated reason',
  });
  console.log('Updated reason:', updated.reason);

  // Delete entry
  const delRes = await blacklist.delete(created.id);
  console.log('Deleted response:', delRes);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
