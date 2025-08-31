import type { HttpClient } from '../core/http';

/** A single notification (schema inferred; fields best-effort). */
export interface NotificationItem {
  id: string | number;
  type?: string;
  createdAt?: string; // ISO timestamp
  read?: boolean;
  message?: string;
  title?: string;
  [k: string]: unknown;
}

export interface LatestNotificationsResponse {
  notifications?: NotificationItem[];
  [k: string]: unknown;
}

/** Notifications API wrapper (only documented/observed latest endpoint). */
export class NotificationsAPI {
  constructor(
    private readonly _http: HttpClient,
    private readonly _shopId: number | string,
  ) {}

  private base(path?: string) {
    return `/shops/${this._shopId}/notifications${path ? `/${path}` : ''}`;
  }

  /** Retrieve latest notifications for the shop. */
  async latest(): Promise<LatestNotificationsResponse> {
    return this._http.request<LatestNotificationsResponse>('GET', this.base('latest'));
  }
}
