import { HttpClient, SellAuthClientOptions } from './core/http';
import { CheckoutAPI } from './resources/checkout';
import { InvoicesAPI } from './resources/invoices';
import { ProductsAPI } from './resources/products';
import { CustomersAPI } from './resources/customers';
import { ShopsAPI } from './resources/shops';
import { CryptoWalletAPI } from './resources/cryptoWallet';
import { BlacklistAPI } from './resources/blacklist';
import { AnalyticsAPI } from './resources/analytics';

export class SellAuthClient {
  readonly http: HttpClient;
  readonly shops: ShopsAPI;

  constructor(private readonly opts: SellAuthClientOptions) {
    /* retained for backward compatibility */
    this.http = new HttpClient(opts);
    this.shops = new ShopsAPI(this.http);
  }

  products(shopId: number | string) {
    return new ProductsAPI(this.http, shopId);
  }
  invoices(shopId: number | string) {
    return new InvoicesAPI(this.http, shopId);
  }
  checkout(shopId: number | string) {
    return new CheckoutAPI(this.http, shopId);
  }
  cryptoWallet(shopId: number | string) {
    return new CryptoWalletAPI(this.http, shopId);
  }
  customers(shopId: number | string) {
    return new CustomersAPI(this.http, shopId);
  }
  blacklist(shopId: number | string) {
    return new BlacklistAPI(this.http, shopId);
  }
  analytics(shopId: number | string) {
    return new AnalyticsAPI(this.http, shopId);
  }
}

export type { SellAuthClientOptions } from './core/http';
