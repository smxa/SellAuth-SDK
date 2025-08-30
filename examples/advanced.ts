import { AdvancedSellAuthClient } from '../src/sdk';

async function main() {
  const client = new AdvancedSellAuthClient({
    apiKey: process.env.SELLAUTH_TOKEN,
    retries: { attempts: 4, backoff: 'exponential', baseDelayMs: 200 }, // custom retry strategy
    beforeRequest: (req) => { console.log('->', req.method, req.url); },
    afterResponse: (res, req) => { console.log('<-', req.method, req.url); },
    logger: console,
  });

  const shops = await client.request<any>('GET', '/shops');
  console.log(shops);
}

main().catch(e => { console.error(e); process.exit(1); });
