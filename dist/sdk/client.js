import { HttpClient } from "./core/http";
import { CheckoutAPI } from "./resources/checkout";
import { InvoicesAPI } from "./resources/invoices";
import { ProductsAPI } from "./resources/products";
import { ShopsAPI } from "./resources/shops";
export class SellAuthClient {
    opts;
    http;
    shops;
    constructor(opts) {
        this.opts = opts;
        /* retained for backward compatibility */
        this.http = new HttpClient(opts);
        this.shops = new ShopsAPI(this.http);
    }
    products(shopId) {
        return new ProductsAPI(this.http, shopId);
    }
    invoices(shopId) {
        return new InvoicesAPI(this.http, shopId);
    }
    checkout(shopId) {
        return new CheckoutAPI(this.http, shopId);
    }
}
