import type { RequestFn } from '../core/types';
export interface CheckoutSession {
    success: boolean;
    invoice_id: number;
    invoice_url: string;
    url?: string;
    [k: string]: any;
}
export declare class CheckoutAPI {
    private readonly _http;
    private readonly _shopId;
    constructor(_http: {
        request: RequestFn;
    }, _shopId: number | string);
    create(payload: Record<string, any>): Promise<CheckoutSession>;
}
