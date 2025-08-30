import type { RequestFn } from '../core/types';

/**
 * Response returned when creating a checkout session.
 * Docs: https://docs.sellauth.com/api-documentation/checkout#create-checkout-session
 */
export interface CheckoutSession {
  /** Whether the checkout session was created successfully */
  success: boolean;
  /** Invoice numeric identifier */
  invoice_id: number;
  /** Public invoice URL (shop hosted) */
  invoice_url: string;
  /** Third-party payment provider or hosted checkout URL (present when redirected) */
  url?: string;
}

/** Allowed payment gateway identifiers the API may accept to preselect */
export type CheckoutGateway =
  | 'CUSTOMERBALANCE'
  | 'STRIPE'
  | 'SQUARE'
  | 'SUMUP'
  | 'MOLLIE'
  | 'SKRILL'
  | 'AUTHORIZENET'
  | 'LEMONSQUEEZY'
  | 'NMI'
  | 'ADYEN'
  | 'SHOPIFY'
  | 'AMAZONPS'
  | 'PAYPAL'
  | 'PAYPALFF'
  | 'CASHAPP'
  | 'VENMO'
  | 'BTC'
  | 'LTC';

/** A single item inside the checkout cart */
export interface CheckoutCartItem {
  /** Product ID */
  productId: number;
  /** Variant ID for the product (if applicable) */
  variantId: number;
  /** Quantity to purchase */
  quantity: number;
}

/** Payload to create a checkout session */
export interface CreateCheckoutRequest {
  /** Items to include in the cart */
  cart: CheckoutCartItem[];
  /** Customer IP address */
  ip?: string;
  /** 2 letter country code */
  country_code?: string;
  /** User agent string */
  user_agent?: string;
  /** Autonomous System Number */
  asn?: number;
  /** Customer email */
  email?: string;
  /** Discord user id */
  discord_user_id?: string | null;
  /** Discord username */
  discord_user_username?: string | null;
  /** Discord OAuth access token */
  discord_access_token?: string | null;
  /** Discord OAuth refresh token */
  discord_refresh_token?: string | null;
  /** Coupon code to apply */
  coupon?: string | null;
  /** Payment gateway to preselect */
  gateway?: CheckoutGateway;
  /** Subscribe to newsletter */
  newsletter?: boolean;
  /** Affiliate code (max 16 chars) */
  affiliate?: string;
  /** Allow additional arbitrary keys for forward compatibility */
  [k: string]: any;
}

export class CheckoutAPI {
  constructor(
    private readonly _http: { request: RequestFn },
    private readonly _shopId: number | string,
  ) {
    /* store deps */
  }
  /**
   * Create a checkout session.
   * Your backend must call this endpoint with a server-side API key.
   */
  create(payload: CreateCheckoutRequest) {
    return this._http.request<CheckoutSession>('POST', `/shops/${this._shopId}/checkout`, {
      body: payload,
    });
  }
}
