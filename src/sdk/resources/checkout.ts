import type { RequestFn } from '../core/types';

export interface CheckoutSession {
  success: boolean;
  invoice_id: number;
  invoice_url: string;
  url?: string;
  [k: string]: any;
}

export class CheckoutAPI {
  constructor(
    private readonly _http: { request: RequestFn },
    private readonly _shopId: number | string,
  ) {
    /* store deps */
  }
  create(payload: Record<string, any>) {
    return this._http.request<CheckoutSession>('POST', `/shops/${this._shopId}/checkout`, {
      body: payload,
    });
  }
}
