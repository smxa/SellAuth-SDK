import { HttpClient, SellAuthClientOptions } from "./core/http";
import { CheckoutAPI } from "./resources/checkout";
import { InvoicesAPI } from "./resources/invoices";
import { ProductsAPI } from "./resources/products";
import { ShopsAPI } from "./resources/shops";

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
}

export type { SellAuthClientOptions } from "./core/http";
