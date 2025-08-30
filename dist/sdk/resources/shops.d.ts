import type { RequestFn } from '../core/types';
export interface Shop {
    id: number;
    name: string;
    subdomain?: string;
    url?: string;
    plan?: string;
    [k: string]: any;
}
export declare class ShopsAPI {
    private http;
    constructor(http: {
        request: RequestFn;
    });
    list(): Promise<Shop>;
    get(shopId: number | string): Promise<Shop>;
    stats(shopId: number | string): Promise<any>;
    create(data: {
        name: string;
        subdomain: string;
        logo?: File | Blob;
    }): Promise<Shop>;
    update(shopId: number | string, data: Record<string, any>): Promise<Shop>;
    delete(shopId: number | string, payload: {
        password: string;
        name: string;
    }): Promise<{
        success?: boolean;
    }>;
}
