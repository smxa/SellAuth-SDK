import { HttpClient } from '../core/http';
export interface ProductVariant {
    id?: number;
    name?: string;
    price?: number;
    stock?: number;
    [k: string]: any;
}
export interface Product {
    id: number;
    name: string;
    type?: string;
    currency?: string;
    visibility?: string;
    variants?: ProductVariant[];
    [k: string]: any;
}
export declare class ProductsAPI {
    private http;
    private shopId;
    constructor(http: HttpClient, shopId: number | string);
    list(params?: Record<string, any>): Promise<Product[]>;
    create(payload: Record<string, any>): Promise<Product>;
    get(productId: number | string): Promise<Product>;
    update(productId: number | string, payload: Record<string, any>): Promise<Product>;
    delete(productId: number | string): Promise<{
        success?: boolean;
    }>;
    clone(productId: number | string): Promise<Product>;
    updateStock(productId: number | string, variantId: number | string, payload: {
        stock?: number;
        delta?: number;
    }): Promise<any>;
    deliverables(productId: number | string, variantId?: number | string): Promise<any>;
    appendDeliverables(productId: number | string, variantId: number | string | undefined, payload: any): Promise<any>;
    overwriteDeliverables(productId: number | string, variantId: number | string | undefined, payload: any): Promise<any>;
}
