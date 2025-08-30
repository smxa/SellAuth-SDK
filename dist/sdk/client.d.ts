import { HttpClient, SellAuthClientOptions } from './core/http';
import { ShopsAPI } from './resources/shops';
import { ProductsAPI } from './resources/products';
import { InvoicesAPI } from './resources/invoices';
import { CheckoutAPI } from './resources/checkout';
export declare class SellAuthClient {
    private opts;
    readonly http: HttpClient;
    readonly shops: ShopsAPI;
    constructor(opts: SellAuthClientOptions);
    products(shopId: number | string): ProductsAPI;
    invoices(shopId: number | string): InvoicesAPI;
    checkout(shopId: number | string): CheckoutAPI;
}
export type { SellAuthClientOptions } from './core/http';
