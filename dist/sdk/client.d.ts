import { HttpClient, SellAuthClientOptions } from './core/http';
import { CheckoutAPI } from './resources/checkout';
import { InvoicesAPI } from './resources/invoices';
import { ProductsAPI } from './resources/products';
import { ShopsAPI } from './resources/shops';
export declare class SellAuthClient {
    private readonly opts;
    readonly http: HttpClient;
    readonly shops: ShopsAPI;
    constructor(opts: SellAuthClientOptions);
    products(shopId: number | string): ProductsAPI;
    invoices(shopId: number | string): InvoicesAPI;
    checkout(shopId: number | string): CheckoutAPI;
}
export type { SellAuthClientOptions } from './core/http';
