import type { HttpClient } from '../core/http';

/**
 * Overview analytics for a shop over a default server-defined timeframe (docs do not expose range params yet).
 */
export interface OverviewAnalytics {
  revenue: number;
  orders: number;
  revenueChange: number;
  ordersChange: number;
  customers: number;
  customersChange: number;
  /** Future compatible catch‑all */
  [k: string]: unknown;
}

/** A single point in an analytics time‑series graph (shape inferred; docs missing schema). */
export interface GraphPoint {
  date: string; // ISO date (assumed)
  revenue?: number;
  orders?: number;
  customers?: number;
  [k: string]: unknown;
}

/** Graph analytics response (inferred). */
export interface GraphAnalyticsResponse {
  points?: GraphPoint[];
  /** Unknown additional fields; schema not published. */
  [k: string]: unknown;
}

/** Top product stats (inferred). */
export interface TopProductAnalyticsItem {
  productId?: number | string;
  name?: string;
  revenue?: number;
  orders?: number;
  quantity?: number;
  [k: string]: unknown;
}

/** Top customer stats (inferred). */
export interface TopCustomerAnalyticsItem {
  customerId?: number | string;
  email?: string;
  revenue?: number;
  orders?: number;
  [k: string]: unknown;
}

/**
 * Optional query parameters accepted by (observed) analytics endpoints.
 * Dates may be provided as Date or preformatted ISO strings.
 * Booleans are serialized to 0/1 per backend expectation.
 */
export interface AnalyticsQueryParams {
  start?: string | Date;
  end?: string | Date;
  excludeManual?: boolean; // 1 to exclude manual orders, 0 include
  excludeArchived?: boolean; // 1 to exclude archived products/orders, 0 include
  currency?: string; // e.g. 'USD'
  [k: string]: unknown;
}

/**
 * Analytics API wrapper. Endpoints are GET only.
 * NOTE: Some response shapes (graph, top products/customers) are inferred due to missing official schema; treat fields as best‑effort.
 */
export class AnalyticsAPI {
  constructor(
    private readonly _http: HttpClient,
    private readonly _shopId: number | string,
  ) {}

  private base(path?: string) {
    return `/shops/${this._shopId}/analytics${path ? `/${path}` : ''}`;
  }

  private buildQuery(params?: AnalyticsQueryParams): Record<string, any> | undefined {
    if (!params) return undefined;
    const out: Record<string, any> = {};
    // Stable key order
    const order: (keyof AnalyticsQueryParams)[] = [
      'start',
      'end',
      'excludeManual',
      'excludeArchived',
      'currency',
    ];
    for (const key of order) {
      const v = params[key];
      if (v === undefined || v === null) continue;
      if (key === 'start' || key === 'end') {
        out[key] = v instanceof Date ? v.toISOString() : String(v);
      } else if (typeof v === 'boolean') {
        out[key] = v ? '1' : '0';
      } else {
        out[key] = v as any;
      }
    }
    // Include any extra unknown keys verbatim (excluding ones we handled)
    for (const [k, v] of Object.entries(params)) {
      if (order.includes(k as any)) continue;
      if (v === undefined || v === null) continue;
      out[k] = v;
    }
    return Object.keys(out).length ? out : undefined;
  }

  /** Retrieve aggregate revenue / orders / customers snapshot and change percentages.
   * @param params Optional query params: start, end, excludeManual, excludeArchived, currency
   */
  async overview(params?: AnalyticsQueryParams): Promise<OverviewAnalytics> {
    return this._http.request<OverviewAnalytics>('GET', this.base(), {
      query: this.buildQuery(params),
    });
  }

  /** Retrieve time‑series graph data (schema inferred).
   * @param params Optional query params: start, end, excludeManual, excludeArchived, currency
   */
  async graph(params?: AnalyticsQueryParams): Promise<GraphAnalyticsResponse> {
    return this._http.request<GraphAnalyticsResponse>('GET', this.base('graph'), {
      query: this.buildQuery(params),
    });
  }

  /** Retrieve top 5 products by revenue (fields inferred). */
  async topProducts(): Promise<TopProductAnalyticsItem[]> {
    return this._http.request<TopProductAnalyticsItem[]>('GET', this.base('top-products'));
  }

  /** Retrieve top 5 customers by revenue (fields inferred). */
  async topCustomers(): Promise<TopCustomerAnalyticsItem[]> {
    return this._http.request<TopCustomerAnalyticsItem[]>('GET', this.base('top-customers'));
  }
}
