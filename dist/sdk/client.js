import { HttpClient } from './core/http';
import { ShopsAPI } from './resources/shops';
import { ProductsAPI } from './resources/products';
import { InvoicesAPI } from './resources/invoices';
import { CheckoutAPI } from './resources/checkout';
export class SellAuthClient {
    opts;
    http;
    shops;
    constructor(opts) {
        this.opts = opts;
        this.http = new HttpClient(opts);
        this.shops = new ShopsAPI(this.http);
    }
    products(shopId) { return new ProductsAPI(this.http, shopId); }
    invoices(shopId) { return new InvoicesAPI(this.http, shopId); }
    checkout(shopId) { return new CheckoutAPI(this.http, shopId); }
}
