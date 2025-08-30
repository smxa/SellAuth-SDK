import type { RequestFn } from '../core/types';

export interface Invoice {
  id: number;
  status?: string;
  total?: number;
  currency?: string;
  [k: string]: any;
}

export class InvoicesAPI {
  constructor(
    private readonly _http: { request: RequestFn },
    private readonly _shopId: number | string,
  ) {
    /* store deps */
  }
  list(filters?: Record<string, any>) {
    return this._http.request<Invoice[]>('GET', `/shops/${this._shopId}/invoices`, {
      query: filters,
    });
  }
  get(invoiceId: number | string) {
    return this._http.request<Invoice>('GET', `/shops/${this._shopId}/invoices/${invoiceId}`);
  }
  archive(invoiceId: number | string) {
    return this._http.request<any>('POST', `/shops/${this._shopId}/invoices/${invoiceId}/archive`);
  }
  unarchive(invoiceId: number | string) {
    return this._http.request<any>(
      'POST',
      `/shops/${this._shopId}/invoices/${invoiceId}/unarchive`,
    );
  }
  cancel(invoiceId: number | string) {
    return this._http.request<any>('POST', `/shops/${this._shopId}/invoices/${invoiceId}/cancel`);
  }
  refund(invoiceId: number | string) {
    return this._http.request<any>('POST', `/shops/${this._shopId}/invoices/${invoiceId}/refund`);
  }
  unrefund(invoiceId: number | string) {
    return this._http.request<any>('POST', `/shops/${this._shopId}/invoices/${invoiceId}/unrefund`);
  }
  pdf(invoiceId: number | string) {
    return this._http.request<any>('GET', `/shops/${this._shopId}/invoices/${invoiceId}/pdf`);
  }
  process(invoiceId: number | string) {
    return this._http.request<any>('GET', `/shops/${this._shopId}/invoices/${invoiceId}/process`);
  }
  replaceDelivered(
    invoiceId: number | string,
    payload: { invoice_item_id: number; replacements: Record<string, any> },
  ) {
    return this._http.request<any>(
      'POST',
      `/shops/${this._shopId}/invoices/${invoiceId}/replace-delivered`,
      { body: payload },
    );
  }
}
