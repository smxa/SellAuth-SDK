import type { RequestFn } from '../core/types';

/**
 * Known payment gateway identifiers for invoices (normalized uppercase variants).
 * Docs list also mixed-case forms; using uppercase canonical + MANUAL.
 */
export type InvoiceGateway =
  | 'STRIPE'
  | 'SQUARE'
  | 'SUMUP'
  | 'MOLLIE'
  | 'SKRILL'
  | 'AUTHORIZENET'
  | 'LEMONSQUEEZY'
  | 'NMI'
  | 'ADYEN'
  | 'SHOPIFY'
  | 'AMAZONPS'
  | 'PAYPAL'
  | 'PAYPALFF'
  | 'CASHAPP'
  | 'VENMO'
  | 'BTC'
  | 'LTC'
  | 'CUSTOMERBALANCE'
  | 'MANUAL';

/** Common invoice status values (not enumerated in docs) */
export type InvoiceStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'archived'
  | string; // fallback for any other statuses

/**
 * Invoice object (partial; docs do not publish full schema).
 * API docs: https://docs.sellauth.com/api-documentation/invoices
 */
export interface Invoice {
  id: number;
  status?: InvoiceStatus;
  /** Total amount (major units for currency) */
  total?: number;
  currency?: string;
  gateway?: InvoiceGateway | string;
  email?: string;
  coupon_code?: string | null;
  created_at?: string;
  completed_at?: string | null;
  archived_at?: string | null;
  ip?: string;
  customer_id?: number | string;
  /** Additional arbitrary fields */
  [k: string]: any;
}

/** Filters accepted by Get Invoices endpoint */
export interface InvoicesListFilters {
  /** Page number */
  page?: number;
  /** Items per page (1-100) */
  perPage?: number;
  orderColumn?: 'id' | 'price_usd' | 'paid_usd' | 'created_at' | 'completed_at';
  orderDirection?: 'asc' | 'desc';
  id?: string | number;
  statuses?: string[]; // keep generic strings
  email?: string;
  gateways?: any; // docs show object with attributes; keeping loose
  created_at_start?: string;
  created_at_end?: string;
  completed_at_start?: string;
  completed_at_end?: string;
  product_name?: string;
  variant_name?: string;
  coupon_code?: string;
  ip?: string;
  discord_id?: string;
  discord_username?: string;
  deliverable?: string;
  custom_field?: string;
  archived?: string | null;
  manual?: string | null;
  stripe_pi_id?: string;
  paypal_order_id?: string;
  cashapp_note?: string;
  paypalff_note?: string;
  venmo_note?: string;
  customer_id?: string | number;
  /** Accept additional filter keys */
  [k: string]: any;
}

/** Request body for replace delivered operation */
export interface ReplaceDeliveredRequest {
  invoice_item_id: number;
  replacements: any[] | Record<string, any>;
}

export class InvoicesAPI {
  constructor(
    private readonly _http: { request: RequestFn },
    private readonly _shopId: number | string,
  ) {
    /* store deps */
  }
  /**
   * List invoices. Filters map to API query parameters.
   * Docs: https://docs.sellauth.com/api-documentation/invoices#get-invoices
   */
  list(filters?: InvoicesListFilters) {
    return this._http.request<Invoice[]>('GET', `/shops/${this._shopId}/invoices`, {
      query: filters,
    });
  }
  /** Retrieve a single invoice */
  get(invoiceId: number | string) {
    return this._http.request<Invoice>('GET', `/shops/${this._shopId}/invoices/${invoiceId}`);
  }
  /** Archive an invoice */
  archive(invoiceId: number | string) {
    return this._http.request<Invoice | { success?: boolean }>(
      'POST',
      `/shops/${this._shopId}/invoices/${invoiceId}/archive`,
    );
  }
  /** Unarchive an invoice */
  unarchive(invoiceId: number | string) {
    return this._http.request<Invoice | { success?: boolean }>(
      'POST',
      `/shops/${this._shopId}/invoices/${invoiceId}/unarchive`,
    );
  }
  /** Cancel an invoice */
  cancel(invoiceId: number | string) {
    return this._http.request<Invoice | { success?: boolean }>(
      'POST',
      `/shops/${this._shopId}/invoices/${invoiceId}/cancel`,
    );
  }
  /** Refund an invoice */
  refund(invoiceId: number | string) {
    return this._http.request<Invoice | { success?: boolean }>(
      'POST',
      `/shops/${this._shopId}/invoices/${invoiceId}/refund`,
    );
  }
  /** Remove refund mark from an invoice */
  unrefund(invoiceId: number | string) {
    return this._http.request<Invoice | { success?: boolean }>(
      'POST',
      `/shops/${this._shopId}/invoices/${invoiceId}/unrefund`,
    );
  }
  /** Retrieve invoice PDF (content or metadata depending on transport implementation) */
  pdf(invoiceId: number | string) {
    return this._http.request<any>('GET', `/shops/${this._shopId}/invoices/${invoiceId}/pdf`);
  }
  /** Process an invoice */
  process(invoiceId: number | string) {
    return this._http.request<Invoice | { success?: boolean }>(
      'GET',
      `/shops/${this._shopId}/invoices/${invoiceId}/process`,
    );
  }
  /** Replace delivered items on an invoice */
  replaceDelivered(invoiceId: number | string, payload: ReplaceDeliveredRequest) {
    return this._http.request<Invoice | { success?: boolean }>(
      'POST',
      `/shops/${this._shopId}/invoices/${invoiceId}/replace-delivered`,
      { body: payload },
    );
  }
  /** Update dashboard note for an invoice */
  setDashboardNote(invoiceId: number | string, note: string) {
    return this._http.request<Invoice | { success?: boolean }>(
      'PUT',
      `/shops/${this._shopId}/invoices/${invoiceId}/dashboard-note`,
      { body: { note } },
    );
  }
}
