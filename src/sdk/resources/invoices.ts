import { HttpClient } from '../core/http';

export interface Invoice { id: number; status?: string; total?: number; currency?: string; [k: string]: any; }

export class InvoicesAPI {
  constructor(private http: HttpClient, private shopId: number | string) {}
  list(filters?: Record<string, any>) { return this.http.request<Invoice[]>('GET', `/shops/${this.shopId}/invoices`, { query: filters }); }
  get(invoiceId: number | string) { return this.http.request<Invoice>('GET', `/shops/${this.shopId}/invoices/${invoiceId}`); }
  archive(invoiceId: number | string) { return this.http.request<any>('POST', `/shops/${this.shopId}/invoices/${invoiceId}/archive`); }
  unarchive(invoiceId: number | string) { return this.http.request<any>('POST', `/shops/${this.shopId}/invoices/${invoiceId}/unarchive`); }
  cancel(invoiceId: number | string) { return this.http.request<any>('POST', `/shops/${this.shopId}/invoices/${invoiceId}/cancel`); }
  refund(invoiceId: number | string) { return this.http.request<any>('POST', `/shops/${this.shopId}/invoices/${invoiceId}/refund`); }
  unrefund(invoiceId: number | string) { return this.http.request<any>('POST', `/shops/${this.shopId}/invoices/${invoiceId}/unrefund`); }
  pdf(invoiceId: number | string) { return this.http.request<any>('GET', `/shops/${this.shopId}/invoices/${invoiceId}/pdf`); }
  process(invoiceId: number | string) { return this.http.request<any>('GET', `/shops/${this.shopId}/invoices/${invoiceId}/process`); }
  replaceDelivered(invoiceId: number | string, payload: { invoice_item_id: number; replacements: Record<string, any>; }) { return this.http.request<any>('POST', `/shops/${this.shopId}/invoices/${invoiceId}/replace-delivered`, { body: payload }); }
}
