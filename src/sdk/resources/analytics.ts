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
 * Analytics API wrapper. Endpoints are GET only; no params currently documented besides shopId path.
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

  /** Retrieve aggregate revenue / orders / customers snapshot and change percentages. */
  async overview(): Promise<OverviewAnalytics> {
    return this._http.request<OverviewAnalytics>('GET', this.base());
  }

  /** Retrieve time‑series graph data (schema inferred). */
  async graph(): Promise<GraphAnalyticsResponse> {
    return this._http.request<GraphAnalyticsResponse>('GET', this.base('graph'));
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
