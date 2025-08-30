import { HttpClient } from '../core/http';
import { AdvancedSellAuthClient } from '../client-advanced';

export interface Shop {
  id: number;
  name: string;
  subdomain?: string;
  url?: string;
  plan?: string;
  [k: string]: any;
}

export class ShopsAPI {
  constructor(private http: HttpClient | AdvancedSellAuthClient) {}
  list() { return (this.http as any).request('GET', '/shops') as Promise<Shop[]>; }
  get(shopId: number | string) { return this.http.request<Shop>('GET', `/shops/${shopId}`); }
  stats(shopId: number | string) { return this.http.request<any>('GET', `/shops/${shopId}/stats`); }
  create(data: { name: string; subdomain: string; logo?: File | Blob }): Promise<Shop> {
    const form = new FormData();
    form.append('name', data.name);
    form.append('subdomain', data.subdomain);
    if (data.logo) form.append('logo', data.logo as any, 'logo.png');
    return this.http.request<Shop>('POST', '/shops/create', { body: form });
  }
  update(shopId: number | string, data: Record<string, any>) { return this.http.request<Shop>('PUT', `/shops/${shopId}/update`, { body: data }); }
  delete(shopId: number | string, payload: { password: string; name: string }) { return this.http.request<{ success?: boolean }>('DELETE', `/shops/${shopId}`, { body: payload }); }
}
