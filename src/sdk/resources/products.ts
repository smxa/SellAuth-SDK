// import { HttpClient } from '../core/http';
// import { AdvancedSellAuthClient } from '../client-advanced';
import type { RequestFn } from '../core/types';

export interface ProductVariant {
  id?: number;
  name?: string;
  price?: number;
  stock?: number;
  [k: string]: any;
}
export interface Product {
  id: number;
  name: string;
  type?: string;
  currency?: string;
  visibility?: string;
  variants?: ProductVariant[];
  [k: string]: any;
}

export class ProductsAPI {
  constructor(
    private readonly _http: { request: RequestFn },
    private readonly _shopId: number | string,
  ) {
    /* store deps */
  }

  list(params?: Record<string, any>) {
    return this._http.request<Product[]>('GET', `/shops/${this._shopId}/products`, {
      query: params,
    });
  }
  create(payload: Record<string, any>) {
    return this._http.request<Product>('POST', `/shops/${this._shopId}/products`, {
      body: payload,
    });
  }
  get(productId: number | string) {
    return this._http.request<Product>('GET', `/shops/${this._shopId}/products/${productId}`);
  }
  update(productId: number | string, payload: Record<string, any>) {
    return this._http.request<Product>(
      'PUT',
      `/shops/${this._shopId}/products/${productId}/update`,
      { body: payload },
    );
  }
  delete(productId: number | string) {
    return this._http.request<{ success?: boolean }>(
      'DELETE',
      `/shops/${this._shopId}/products/${productId}`,
    );
  }
  clone(productId: number | string) {
    return this._http.request<Product>(
      'POST',
      `/shops/${this._shopId}/products/${productId}/clone`,
    );
  }
  updateStock(
    productId: number | string,
    variantId: number | string,
    payload: { stock?: number; delta?: number },
  ) {
    return this._http.request<any>(
      'PUT',
      `/shops/${this._shopId}/products/${productId}/stock/${variantId}`,
      { body: payload },
    );
  }
  deliverables(productId: number | string, variantId?: number | string) {
    return this._http.request<any>(
      'GET',
      `/shops/${this._shopId}/products/${productId}/deliverables/${variantId ?? ''}`,
    );
  }
  appendDeliverables(
    productId: number | string,
    variantId: number | string | undefined,
    payload: any,
  ) {
    return this._http.request<any>(
      'PUT',
      `/shops/${this._shopId}/products/${productId}/deliverables/append/${variantId ?? ''}`,
      { body: payload },
    );
  }
  overwriteDeliverables(
    productId: number | string,
    variantId: number | string | undefined,
    payload: any,
  ) {
    return this._http.request<any>(
      'PUT',
      `/shops/${this._shopId}/products/${productId}/deliverables/overwrite/${variantId ?? ''}`,
      { body: payload },
    );
  }
}
