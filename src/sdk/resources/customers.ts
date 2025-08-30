import type { RequestFn } from '../core/types';

/** Representation of a customer (fields based on available public docs subset).
 * Additional fields may be present and are retained via index signature.
 */
export interface Customer {
  id: number | string;
  email?: string;
  username?: string | null;
  created_at?: string;
  updated_at?: string;
  note?: string | null;
  banned?: boolean;
  tags?: string[] | null;
  [k: string]: any;
}

/** Parameters for listing customers.
 * Mirrors typical pagination & filtering semantics.
 */
export interface ListCustomersParams {
  page?: number;
  perPage?: number; // 1-100
  email?: string; // partial match maybe supported
  username?: string;
  tag?: string; // filter by tag
  banned?: boolean;
  orderColumn?: 'id' | 'email' | 'created_at';
  orderDirection?: 'asc' | 'desc';
  [k: string]: any;
}

/** Create customer request payload.
 * Email is required; other fields optional.
 */
export interface CreateCustomerRequest {
  email: string;
  username?: string | null;
  note?: string | null;
  tags?: string[] | null;
  banned?: boolean;
  [k: string]: any;
}

/** Update customer request payload.
 * Partial; supply only fields to change.
 */
export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}

/** Bulk selector for customers (pattern mirrors products).
 * API may accept complex selector object (all / ids / filter) preserved as any.
 */
export interface CustomerBulkSelector {
  customer_ids?: Record<string, any> | null; // allow raw selector object
}

/** Bulk add or remove tags on customers.
 * Provide add/remove arrays (either/both). Endpoint: PUT /shops/:shopId/customers/bulk-update/tags
 */
export interface BulkCustomerTagsRequest extends CustomerBulkSelector {
  add?: string[];
  remove?: string[];
}

/** Bulk ban or unban customers.
 * Endpoint: PUT /shops/:shopId/customers/bulk-update/ban
 */
export interface BulkCustomerBanRequest extends CustomerBulkSelector {
  banned: boolean;
}

export interface BulkCustomerResponse {
  success?: boolean;
  message?: string;
  [k: string]: any;
}

export class CustomersAPI {
  constructor(
    private readonly _http: { request: RequestFn },
    private readonly _shopId: number | string,
  ) {}

  /** List customers for a shop (paginated). */
  list(params?: ListCustomersParams) {
    return this._http.request<Customer[]>('GET', `/shops/${this._shopId}/customers`, {
      query: params,
    });
  }

  /** Create a customer record. */
  create(payload: CreateCustomerRequest) {
    return this._http.request<Customer>('POST', `/shops/${this._shopId}/customers`, {
      body: payload,
    });
  }

  /** Retrieve a customer by unique id. */
  get(customerId: number | string) {
    return this._http.request<Customer>('GET', `/shops/${this._shopId}/customers/${customerId}`);
  }

  /** Partially update a customer record. */
  update(customerId: number | string, payload: UpdateCustomerRequest) {
    return this._http.request<Customer>('PUT', `/shops/${this._shopId}/customers/${customerId}`, {
      body: payload,
    });
  }

  /** Delete a customer. Irreversible. */
  delete(customerId: number | string) {
    return this._http.request<{ success?: boolean }>(
      'DELETE',
      `/shops/${this._shopId}/customers/${customerId}`,
    );
  }

  /** Bulk modify (add/remove) tags on selected customers. */
  bulkUpdateTags(payload: BulkCustomerTagsRequest) {
    return this._http.request<BulkCustomerResponse>(
      'PUT',
      `/shops/${this._shopId}/customers/bulk-update/tags`,
      { body: payload },
    );
  }

  /** Bulk ban/unban selected customers. */
  bulkUpdateBan(payload: BulkCustomerBanRequest) {
    return this._http.request<BulkCustomerResponse>(
      'PUT',
      `/shops/${this._shopId}/customers/bulk-update/ban`,
      { body: payload },
    );
  }
}
