import { HttpClient } from '../core/http';
export interface CheckoutSession {
    success: boolean;
    invoice_id: number;
    invoice_url: string;
    url?: string;
    [k: string]: any;
}
export declare class CheckoutAPI {
    private http;
    private shopId;
    constructor(http: HttpClient, shopId: number | string);
    create(payload: Record<string, any>): Promise<CheckoutSession>;
}
