import type { RequestFn } from '../core/types';

/** Allowed blacklist item types (dimension being blocked). */
export type BlacklistType = 'email' | 'ip' | 'user_agent' | 'asn' | 'country_code';
/** How the value is matched. */
export type BlacklistMatchType = 'exact' | 'regex';

/** Representation of a blacklist entry (fields inferred; API docs do not expose full schema). */
export interface BlacklistEntry {
  id: string; // identifier returned by API
  value: string;
  type: BlacklistType;
  match_type: BlacklistMatchType; // keeping API snake_case for raw shape
  reason?: string | null;
  shop_id?: number | string;
  created_at?: string;
  updated_at?: string;
  [k: string]: any; // forward compatible
}

/** Create blacklist entry payload. */
export interface CreateBlacklistEntryRequest {
  value: string;
  type: BlacklistType;
  match_type: BlacklistMatchType;
  reason?: string | null;
  [k: string]: any;
}

/** Update blacklist entry payload (full update as per docs PUT requirement). */
export interface UpdateBlacklistEntryRequest extends CreateBlacklistEntryRequest {}

/** Optional future list params (pagination or filters) – not documented currently. */
export interface ListBlacklistParams {
  page?: number;
  perPage?: number; // 1-100 (assumed standard)
  [k: string]: any;
}

/** Blacklist resource: manage blocked entities for a shop.
 * Docs: https://docs.sellauth.com/api-documentation/blacklist
 */
export class BlacklistAPI {
  constructor(
    private readonly _http: { request: RequestFn },
    private readonly _shopId: number | string,
  ) {}

  /** List blacklist entries (shop scoped). */
  list(params?: ListBlacklistParams) {
    return this._http.request<BlacklistEntry[]>('GET', `/shops/${this._shopId}/blacklist`, {
      query: params,
    });
  }

  /** Create a new blacklist entry. */
  create(payload: CreateBlacklistEntryRequest) {
    return this._http.request<BlacklistEntry>('POST', `/shops/${this._shopId}/blacklist`, {
      body: payload,
    });
  }

  /** Retrieve a single blacklist entry. */
  get(blacklistId: string) {
    return this._http.request<BlacklistEntry>(
      'GET',
      `/shops/${this._shopId}/blacklist/${blacklistId}`,
    );
  }

  /** Update a blacklist entry (PUT /:id/update). */
  update(blacklistId: string, payload: UpdateBlacklistEntryRequest) {
    return this._http.request<BlacklistEntry>(
      'PUT',
      `/shops/${this._shopId}/blacklist/${blacklistId}/update`,
      { body: payload },
    );
  }

  /** Delete a blacklist entry. */
  delete(blacklistId: string) {
    return this._http.request<{ success?: boolean }>(
      'DELETE',
      `/shops/${this._shopId}/blacklist/${blacklistId}`,
    );
  }
}
