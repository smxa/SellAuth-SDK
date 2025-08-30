import { HttpClient } from '../core/http';

export interface CheckoutSession {
  success: boolean;
  invoice_id: number;
  invoice_url: string;
  url?: string;
  [k: string]: any;
}

export class CheckoutAPI {
  constructor(private http: HttpClient, private shopId: number | string) {}
  create(payload: Record<string, any>) { return this.http.request<CheckoutSession>('POST', `/shops/${this.shopId}/checkout`, { body: payload }); }
}
