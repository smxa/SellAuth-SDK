// import type { AdvancedSellAuthClient } from "../client-advanced";
// import { HttpClient } from "../core/http";
import type { RequestFn } from '../core/types';

// type RequestCapable = { request: RequestFn } | HttpClient | AdvancedSellAuthClient; // reserved for future union use

export interface Shop {
  id: number;
  name: string;
  subdomain?: string;
  url?: string;
  plan?: string;
  [k: string]: any;
}

export class ShopsAPI {
  constructor(private readonly _http: { request: RequestFn }) {
    /* stores http */
  }
  list() {
    // use http.request
    return this._http.request<Shop>('GET', '/shops');
  }
  get(shopId: number | string) {
    return this._http.request<Shop>('GET', `/shops/${shopId}`);
  }
  stats(shopId: number | string) {
    return this._http.request<any>('GET', `/shops/${shopId}/stats`);
  }
  create(data: { name: string; subdomain: string; logo?: File | Blob }): Promise<Shop> {
    const form = new FormData();
    form.append('name', data.name);
    form.append('subdomain', data.subdomain);
    if (data.logo) form.append('logo', data.logo as any, 'logo.png');
    return this._http.request<Shop>('POST', '/shops/create', { body: form });
  }
  update(shopId: number | string, data: Record<string, any>) {
    return this._http.request<Shop>('PUT', `/shops/${shopId}/update`, {
      body: data,
    });
  }
  delete(shopId: number | string, payload: { password: string; name: string }) {
    return this._http.request<{ success?: boolean }>('DELETE', `/shops/${shopId}`, {
      body: payload,
    });
  }
}
