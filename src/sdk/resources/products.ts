// import { HttpClient } from '../core/http';
// import { AdvancedSellAuthClient } from '../client-advanced';
import type { RequestFn } from '../core/types';

/** Product type identifier */
export type ProductType = 'variant' | 'addon';
/** Product visibility values */
export type ProductVisibility = 'public' | 'unlisted' | 'private' | 'on_hold';
/** Product deliverables type */
export type ProductDeliverablesType = 'serials' | 'service' | 'dynamic';
/** Product meta twitter card types */
export type ProductTwitterCard = 'summary' | 'summary_large_image';

/** Volume discount tier */
export interface ProductVolumeDiscountTier {
  /** Minimum quantity for the tier */
  qty: number;
  /** Percentage discount (0-100) */
  percent: number;
  [k: string]: any;
}

/** Discord role reference */
export interface DiscordRole {
  id: string;
  name?: string;
  [k: string]: any;
}

/** Product tab entry */
export interface ProductTab {
  [k: string]: any;
}
/** Product badge entry */
export interface ProductBadge {
  [k: string]: any;
}
/** Product variant definition */
export interface ProductVariant {
  id?: number;
  name?: string;
  price?: number;
  stock?: number;
  currency?: string;
  position?: number;
  [k: string]: any;
}
/** Core product representation (partial; schema not fully documented) */
export interface Product {
  id: number;
  name: string;
  type?: ProductType;
  path?: string;
  description?: string;
  currency?: string;
  visibility?: ProductVisibility;
  deliverables_type?: ProductDeliverablesType;
  variants?: ProductVariant[];
  meta_title?: string;
  meta_description?: string;
  meta_image_id?: string | null;
  meta_twitter_card?: ProductTwitterCard;
  instructions?: string;
  out_of_stock_message?: string;
  status_color?: string | null;
  status_text?: string | null;
  volume_discounts?: ProductVolumeDiscountTier[] | null;
  disable_volume_discounts_if_coupon?: boolean;
  discord_required?: boolean;
  block_vpn?: boolean;
  hide_stock_count?: boolean;
  show_views_count?: boolean;
  show_sales_count?: boolean;
  show_sales_notifications?: boolean;
  sales_count_hours?: number;
  feedback_coupon_id?: string | null;
  feedback_coupon_min_rating?: number;
  deliverables_label?: string;
  custom_field_ids?: string[] | null;
  product_tabs?: ProductTab[] | null;
  product_badges?: ProductBadge[] | null;
  product_addons?: string[]; // product ids? docs show array<string>
  product_upsells?: string[]; // product ids? docs show array<string>
  group_id?: string | null;
  image_ids?: string[] | null;
  badge_text?: string;
  [k: string]: any;
}

/** List products filter params */
export interface ListProductsParams {
  page?: number;
  perPage?: number; // 1-100
  orderColumn?: 'id' | 'name' | 'price' | 'products_sold';
  orderDirection?: 'asc' | 'desc';
  type?: ProductType;
  ids?: number[];
  paths?: string[];
  name?: string;
  variant_name?: string;
  visibilities?: ProductVisibility[] | string[];
  group_ids?: number[];
  group_null?: boolean;
  badge_text?: string;
  status_text?: string;
  deliverable?: string;
  deliverables_type?: ProductDeliverablesType | string;
  all?: string | null;
  [k: string]: any;
}

/** Create product request */
export interface CreateProductRequest {
  type: ProductType;
  name: string;
  path?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  meta_image_id?: string | null;
  meta_twitter_card?: ProductTwitterCard;
  instructions?: string;
  out_of_stock_message?: string;
  currency: string;
  tax_inclusive?: boolean;
  deliverables_type?: ProductDeliverablesType;
  visibility: ProductVisibility;
  volume_discounts?: ProductVolumeDiscountTier[] | null;
  disable_volume_discounts_if_coupon?: boolean;
  discord_required?: boolean;
  block_vpn?: boolean;
  hide_stock_count?: boolean;
  status_color?: string | null;
  status_text?: string | null;
  show_views_count?: boolean;
  show_sales_count?: boolean;
  show_sales_notifications?: boolean;
  sales_count_hours?: number;
  feedback_coupon_id?: string | null;
  feedback_coupon_min_rating?: number;
  deliverables_label?: string;
  custom_field_ids?: string[] | null;
  product_tabs?: ProductTab[] | null;
  product_badges?: ProductBadge[] | null;
  product_addons?: string[]; // product ids? docs show array<string>
  product_upsells?: string[]; // product ids? docs show array<string>
  group_id?: string | null;
  image_ids?: string[] | null;
  badge_text?: string;
  [k: string]: any;
}

/** Update product request (same fields; keep required name, type, currency, visibility) */
export interface UpdateProductRequest extends CreateProductRequest {}

/** Update stock request */
export interface UpdateStockRequest {
  stock?: number;
  delta?: number;
}

/** Generic deliverable entry (opaque to SDK) */
export interface ProductDeliverable {
  id?: number | string;
  value?: string;
  [k: string]: any;
}

export interface BulkOperationResponse {
  success?: boolean;
  message?: string;
  [k: string]: any;
}

/** Common bulk selector */
export interface BulkSelector {
  /** Object describing which products to target; API accepts structured object */
  product_ids?: Record<string, any> | null;
}

export interface SortProductsRequest {
  sortedIds: any[]; // API returns object array; keep generic
}

/**
 * Bulk update disabled payment methods for selected products.
 * Endpoint: PUT /shops/:shopId/products/bulk-update/disabled-payment-methods
 * Provide a selector object describing which product ids to target in product_ids (API supports complex selection: all, ids array, filters etc.).
 * If disabled_payment_method_ids is null or empty array, previously disabled methods may be cleared by the API.
 */
export interface BulkDisabledPaymentMethodsRequest extends BulkSelector {
  disabled_payment_method_ids?: string[] | null;
}
/**
 * Bulk update custom field associations on products.
 * Endpoint: PUT /shops/:shopId/products/bulk-update/custom-fields
 * Pass custom_field_ids as an array of field identifiers, or null to clear.
 */
export interface BulkCustomFieldsRequest extends BulkSelector {
  custom_field_ids?: string[] | null;
}
/**
 * Bulk enable/disable Discord integration & roles.
 * Endpoint: PUT /shops/:shopId/products/bulk-update/discord-integration
 * When discord_required is true you may supply discord_roles. Null to clear roles.
 */
export interface BulkDiscordIntegrationRequest extends BulkSelector {
  discord_required?: boolean;
  discord_roles?: DiscordRole[] | null;
}
export type BulkPrependAppendType = 'overwrite' | 'append' | 'prepend';
/**
 * Bulk modify product descriptions with overwrite/append/prepend semantics.
 * Endpoint: PUT /shops/:shopId/products/bulk-update/description
 */
export interface BulkDescriptionRequest extends BulkSelector {
  type: BulkPrependAppendType;
  description?: string | null;
}
/**
 * Bulk update product instructions (overwrite only semantics).
 * Endpoint: PUT /shops/:shopId/products/bulk-update/instructions
 */
export interface BulkInstructionsRequest extends BulkSelector {
  instructions?: string | null;
}
/**
 * Bulk update out-of-stock message shown when product has no deliverables/stock.
 * Endpoint: PUT /shops/:shopId/products/bulk-update/out-of-stock-message
 */
export interface BulkOutOfStockMessageRequest extends BulkSelector {
  out_of_stock_message?: string | null;
}
/**
 * Bulk toggle security related flags (e.g. VPN blocking) on products.
 * Endpoint: PUT /shops/:shopId/products/bulk-update/security
 */
export interface BulkSecurityRequest extends BulkSelector {
  block_vpn?: boolean;
}
/**
 * Bulk modify badges with overwrite/append/prepend semantics.
 * Endpoint: PUT /shops/:shopId/products/bulk-update/badges
 */
export interface BulkBadgesRequest extends BulkSelector {
  type: BulkPrependAppendType;
  product_badges?: ProductBadge[] | null;
}
/**
 * Bulk update custom status banner (color/text) across products.
 * Endpoint: PUT /shops/:shopId/products/bulk-update/status
 */
export interface BulkStatusRequest extends BulkSelector {
  status_color?: string | null;
  status_text?: string | null;
}
/**
 * Bulk change visibility state of products (public/unlisted/private/on_hold).
 * Endpoint: PUT /shops/:shopId/products/bulk-update/visibility
 */
export interface BulkVisibilityRequest extends BulkSelector {
  visibility: ProductVisibility;
}
/**
 * Bulk toggle live statistics display settings.
 * Endpoint: PUT /shops/:shopId/products/bulk-update/live-stats
 */
export interface BulkLiveStatsRequest extends BulkSelector {
  show_views_count?: boolean;
  show_sales_count?: boolean;
  show_sales_notifications?: boolean;
  sales_count_hours?: number;
}
/**
 * Bulk associate or remove feedback coupon incentivization settings.
 * Endpoint: PUT /shops/:shopId/products/bulk-update/feedback-coupon
 */
export interface BulkFeedbackCouponRequest extends BulkSelector {
  feedback_coupon_id?: string | null;
  feedback_coupon_min_rating?: number;
}
/**
 * Bulk set or clear volume discount tiers.
 * Endpoint: PUT /shops/:shopId/products/bulk-update/volume-discounts
 */
export interface BulkVolumeDiscountsRequest extends BulkSelector {
  volume_discounts?: ProductVolumeDiscountTier[] | null;
  disable_volume_discounts_if_coupon?: boolean;
}
/**
 * Bulk set or clear redirect URL used after purchase.
 * Endpoint: PUT /shops/:shopId/products/bulk-update/redirect-url
 */
export interface BulkRedirectUrlRequest extends BulkSelector {
  redirect_url?: string | null;
}
/**
 * Bulk change deliverables type (serials/service/dynamic).
 * Endpoint: PUT /shops/:shopId/products/bulk-update/deliverables-type
 */
export interface BulkDeliverablesTypeRequest extends BulkSelector {
  deliverables_type?: ProductDeliverablesType;
}
/**
 * Bulk set deliverables label text (e.g. license key, credentials).
 * Endpoint: PUT /shops/:shopId/products/bulk-update/deliverables-label
 */
export interface BulkDeliverablesLabelRequest extends BulkSelector {
  deliverables_label: string;
}

export class ProductsAPI {
  constructor(
    private readonly _http: { request: RequestFn },
    private readonly _shopId: number | string,
  ) {
    /* store deps */
  }

  /** List products */
  list(params?: ListProductsParams) {
    return this._http.request<Product[]>('GET', `/shops/${this._shopId}/products`, {
      query: params,
    });
  }
  /** Create a product */
  create(payload: CreateProductRequest) {
    return this._http.request<Product>('POST', `/shops/${this._shopId}/products`, {
      body: payload,
    });
  }
  /** Retrieve a product */
  get(productId: number | string) {
    return this._http.request<Product>('GET', `/shops/${this._shopId}/products/${productId}`);
  }
  /** Update a product */
  update(productId: number | string, payload: UpdateProductRequest) {
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

  /** Sort products & groups */
  /**
   * Sort products and groups in a single operation.
   * Endpoint: PUT /shops/:shopId/products/sort
   * Provide a sortedIds array (raw structure preserved due to incomplete docs).
   */
  sortProducts(payload: SortProductsRequest) {
    return this._http.request<BulkOperationResponse>(
      'PUT',
      `/shops/${this._shopId}/products/sort`,
      { body: payload },
    );
  }
  /** Bulk update disabled payment methods on targeted products. */
  bulkUpdateDisabledPaymentMethods(payload: BulkDisabledPaymentMethodsRequest) {
    return this._http.request<BulkOperationResponse>(
      'PUT',
      `/shops/${this._shopId}/products/bulk-update/disabled-payment-methods`,
      { body: payload },
    );
  }
  /** Bulk update custom field ids on products. */
  bulkUpdateCustomFields(payload: BulkCustomFieldsRequest) {
    return this._http.request<BulkOperationResponse>(
      'PUT',
      `/shops/${this._shopId}/products/bulk-update/custom-fields`,
      { body: payload },
    );
  }
  /** Bulk update Discord integration flags and roles. */
  bulkUpdateDiscordIntegration(payload: BulkDiscordIntegrationRequest) {
    return this._http.request<BulkOperationResponse>(
      'PUT',
      `/shops/${this._shopId}/products/bulk-update/discord-integration`,
      { body: payload },
    );
  }
  /** Bulk modify product descriptions (overwrite/append/prepend). */
  bulkUpdateDescription(payload: BulkDescriptionRequest) {
    return this._http.request<BulkOperationResponse>(
      'PUT',
      `/shops/${this._shopId}/products/bulk-update/description`,
      { body: payload },
    );
  }
  /** Bulk overwrite product instructions. */
  bulkUpdateInstructions(payload: BulkInstructionsRequest) {
    return this._http.request<BulkOperationResponse>(
      'PUT',
      `/shops/${this._shopId}/products/bulk-update/instructions`,
      { body: payload },
    );
  }
  /** Bulk set/clear out-of-stock messages. */
  bulkUpdateOutOfStockMessage(payload: BulkOutOfStockMessageRequest) {
    return this._http.request<BulkOperationResponse>(
      'PUT',
      `/shops/${this._shopId}/products/bulk-update/out-of-stock-message`,
      { body: payload },
    );
  }
  /** Bulk update security flags (e.g. block_vpn). */
  bulkUpdateSecurity(payload: BulkSecurityRequest) {
    return this._http.request<BulkOperationResponse>(
      'PUT',
      `/shops/${this._shopId}/products/bulk-update/security`,
      { body: payload },
    );
  }
  /** Bulk modify product badges (overwrite/append/prepend). */
  bulkUpdateBadges(payload: BulkBadgesRequest) {
    return this._http.request<BulkOperationResponse>(
      'PUT',
      `/shops/${this._shopId}/products/bulk-update/badges`,
      { body: payload },
    );
  }
  /** Bulk update status banner across products. */
  bulkUpdateStatus(payload: BulkStatusRequest) {
    return this._http.request<BulkOperationResponse>(
      'PUT',
      `/shops/${this._shopId}/products/bulk-update/status`,
      { body: payload },
    );
  }
  /** Bulk change visibility of selected products. */
  bulkUpdateVisibility(payload: BulkVisibilityRequest) {
    return this._http.request<BulkOperationResponse>(
      'PUT',
      `/shops/${this._shopId}/products/bulk-update/visibility`,
      { body: payload },
    );
  }
  /** Bulk toggle live statistics display flags. */
  bulkUpdateLiveStats(payload: BulkLiveStatsRequest) {
    return this._http.request<BulkOperationResponse>(
      'PUT',
      `/shops/${this._shopId}/products/bulk-update/live-stats`,
      { body: payload },
    );
  }
  /** Bulk associate feedback coupon & minimum rating. */
  bulkUpdateFeedbackCoupon(payload: BulkFeedbackCouponRequest) {
    return this._http.request<BulkOperationResponse>(
      'PUT',
      `/shops/${this._shopId}/products/bulk-update/feedback-coupon`,
      { body: payload },
    );
  }
  /** Bulk set volume discount tiers & related flags. */
  bulkUpdateVolumeDiscounts(payload: BulkVolumeDiscountsRequest) {
    return this._http.request<BulkOperationResponse>(
      'PUT',
      `/shops/${this._shopId}/products/bulk-update/volume-discounts`,
      { body: payload },
    );
  }
  /** Bulk set or clear redirect URL. */
  bulkUpdateRedirectUrl(payload: BulkRedirectUrlRequest) {
    return this._http.request<BulkOperationResponse>(
      'PUT',
      `/shops/${this._shopId}/products/bulk-update/redirect-url`,
      { body: payload },
    );
  }
  /** Bulk change deliverables type for products. */
  bulkUpdateDeliverablesType(payload: BulkDeliverablesTypeRequest) {
    return this._http.request<BulkOperationResponse>(
      'PUT',
      `/shops/${this._shopId}/products/bulk-update/deliverables-type`,
      { body: payload },
    );
  }
  /** Bulk set deliverables label text. */
  bulkUpdateDeliverablesLabel(payload: BulkDeliverablesLabelRequest) {
    return this._http.request<BulkOperationResponse>(
      'PUT',
      `/shops/${this._shopId}/products/bulk-update/deliverables-label`,
      { body: payload },
    );
  }
}
