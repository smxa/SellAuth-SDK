import type { RequestFn } from '../core/types';
export interface Invoice {
    id: number;
    status?: string;
    total?: number;
    currency?: string;
    [k: string]: any;
}
export declare class InvoicesAPI {
    private readonly _http;
    private readonly _shopId;
    constructor(_http: {
        request: RequestFn;
    }, _shopId: number | string);
    list(filters?: Record<string, any>): Promise<Invoice[]>;
    get(invoiceId: number | string): Promise<Invoice>;
    archive(invoiceId: number | string): Promise<any>;
    unarchive(invoiceId: number | string): Promise<any>;
    cancel(invoiceId: number | string): Promise<any>;
    refund(invoiceId: number | string): Promise<any>;
    unrefund(invoiceId: number | string): Promise<any>;
    pdf(invoiceId: number | string): Promise<any>;
    process(invoiceId: number | string): Promise<any>;
    replaceDelivered(invoiceId: number | string, payload: {
        invoice_item_id: number;
        replacements: Record<string, any>;
    }): Promise<any>;
}
