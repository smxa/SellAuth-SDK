# SellAuth TypeScript SDK Reference

The SellAuth TypeScript SDK (`@wtfservices/sellauth-utils`) provides thin, typed wrappers around the SellAuth REST API. Schemas in the public API are only partially documented; this SDK purposefully preserves forward compatibility via index signatures (`[k: string]: any`) on most interfaces so additional fields returned by the API are not discarded.

## Installation

```bash
pnpm add @wtfservices/sellauth-utils
```

## Basic Usage

```ts
import { SellAuthClient } from '@wtfservices/sellauth-utils';

const client = new SellAuthClient({
  apiKey: process.env.SELLAUTH_API_KEY!, // Server-side secret
});

// List shops
const shops = await client.shops.list();

// Work within a specific shop
const shopId = shops[0].id;
const products = await client.products(shopId).list({ perPage: 25 });
```

Authentication: Provide your server-side API key when constructing the client (never expose it client-side).  
Shop scoping: Most resources require a `shopId`. The high-level `SellAuthClient` can expose convenience factory methods such as `client.products(shopId)` or `client.customers(shopId)` that return a resource instance already scoped to that shop. (If constructing resource classes manually, each constructor accepts `(_http, _shopId?)` as shown below.)

Partial Schemas: Many interfaces intentionally include only fields present in the codebase comments; unknown or future fields flow through thanks to index signatures.

---

## Shops

Manage shops (listing, retrieving stats, creating, updating, deleting).

### Exported Types

- `Shop` – Core shop representation (id, name, optional metadata; extensible via index signature).

### Class: ShopsAPI

Wraps shop-level operations. Prefer using `SellAuthClient.shops` instead of instantiating directly. Constructor signature: `new ShopsAPI(_http)`.

### Methods Overview

| Method                  | HTTP   | Path Template         | Description                              |
| ----------------------- | ------ | --------------------- | ---------------------------------------- |
| list()                  | GET    | /shops                | List all shops available to the API key  |
| get(shopId)             | GET    | /shops/:shopId        | Retrieve a shop                          |
| stats(shopId)           | GET    | /shops/:shopId/stats  | Retrieve shop statistics                 |
| create(data)            | POST   | /shops/create         | Create a new shop (multipart form)       |
| update(shopId, data)    | PUT    | /shops/:shopId/update | Update a shop                            |
| delete(shopId, payload) | DELETE | /shops/:shopId        | Delete a shop (requires password & name) |

### Method Details

#### list()

Signature: `list(): Promise<Shop>`
Parameters: (none)  
Returns: A promise resolving to an array (typed as `Shop` in code; underlying transport returns shop list).  
Example:

```ts
const shops = await client.shops.list();
```

#### get()

Signature: `get(shopId: number | string): Promise<Shop>`  
Parameters:

| Name   | Type             | Required | Description     |
| ------ | ---------------- | -------- | --------------- |
| shopId | number \| string | Yes      | Shop identifier |

Returns: Shop object.  
Example:

```ts
const shop = await client.shops.get(123);
```

#### stats()

Signature: `stats(shopId: number | string): Promise<any>`  
Parameters:

| Name   | Type             | Required | Description     |
| ------ | ---------------- | -------- | --------------- |
| shopId | number \| string | Yes      | Shop identifier |

Returns: Statistics object (shape not fully documented).  
Example:

```ts
const stats = await client.shops.stats(123);
```

#### create()

Signature: `create(data: { name: string; subdomain: string; logo?: File | Blob }): Promise<Shop>`  
Parameters:

| Name           | Type         | Required | Description         |
| -------------- | ------------ | -------- | ------------------- |
| data           | object       | Yes      | Payload (multipart) |
| data.name      | string       | Yes      | Shop name           |
| data.subdomain | string       | Yes      | Desired subdomain   |
| data.logo      | File \| Blob | No       | Logo image          |

Returns: Created shop.  
Example:

```ts
const newShop = await client.shops.create({ name: 'My Shop', subdomain: 'myshop' });
```

#### update()

Signature: `update(shopId: number | string, data: Record<string, any>): Promise<Shop>`  
Parameters:

| Name   | Type                | Required | Description  |
| ------ | ------------------- | -------- | ------------ |
| shopId | number \| string    | Yes      | Shop id      |
| data   | Record<string, any> | Yes      | Patch fields |

Returns: Updated shop.  
Example:

```ts
await client.shops.update(123, { name: 'Renamed Shop' });
```

#### delete()

Signature: `delete(shopId: number | string, payload: { password: string; name: string }): Promise<{ success?: boolean }>`  
Parameters:

| Name             | Type             | Required | Description            |
| ---------------- | ---------------- | -------- | ---------------------- |
| shopId           | number \| string | Yes      | Shop id                |
| payload          | object           | Yes      | Confirmation payload   |
| payload.password | string           | Yes      | Account password       |
| payload.name     | string           | Yes      | Shop name confirmation |

Returns: Success flag.  
Example:

```ts
await client.shops.delete(123, { password: 'pw', name: 'My Shop' });
```

---

## Products

Manage products, variants, deliverables, and extensive bulk update operations.

### Exported Types

- `ProductType` – 'variant' | 'addon'
- `ProductVisibility` – 'public' | 'unlisted' | 'private' | 'on_hold'
- `ProductDeliverablesType` – 'serials' | 'service' | 'dynamic'
- `ProductTwitterCard` – 'summary' | 'summary_large_image'
- `ProductVolumeDiscountTier` – Volume discount tier (qty, percent)
- `DiscordRole` – Discord role reference
- `ProductTab` – Product tab entry (opaque)
- `ProductBadge` – Product badge entry (opaque)
- `ProductVariant` – Variant definition (id, name, price, etc.)
- `Product` – Core product representation (partial; many optional fields, index signature)
- `ListProductsParams` – Query filtering & pagination
- `CreateProductRequest` – Product creation payload
- `UpdateProductRequest` – Same as create (extends)
- `UpdateStockRequest` – Stock update (stock or delta)
- `ProductDeliverable` – Generic deliverable entry
- `BulkOperationResponse` – Bulk operation response (success/message)
- `BulkSelector` – Common bulk selector (product_ids)
- `SortProductsRequest` – Sorting payload
- `BulkDisabledPaymentMethodsRequest` – Bulk disabled payment methods
- `BulkCustomFieldsRequest` – Bulk custom fields association
- `BulkDiscordIntegrationRequest` – Bulk Discord integration flags/roles
- `BulkPrependAppendType` – 'overwrite' | 'append' | 'prepend'
- `BulkDescriptionRequest` – Bulk description modification
- `BulkInstructionsRequest` – Bulk instructions overwrite
- `BulkOutOfStockMessageRequest` – Bulk out-of-stock message
- `BulkSecurityRequest` – Bulk security flags
- `BulkBadgesRequest` – Bulk badges modification
- `BulkStatusRequest` – Bulk status banner
- `BulkVisibilityRequest` – Bulk visibility change
- `BulkLiveStatsRequest` – Bulk live stats flags
- `BulkFeedbackCouponRequest` – Bulk feedback coupon settings
- `BulkVolumeDiscountsRequest` – Bulk volume discount tiers
- `BulkRedirectUrlRequest` – Bulk redirect URL
- `BulkDeliverablesTypeRequest` – Bulk deliverables type
- `BulkDeliverablesLabelRequest` – Bulk deliverables label text

### Class: ProductsAPI

Access product CRUD, inventory, deliverables, sorting, and bulk updates within a shop. Prefer `SellAuthClient.products(shopId)`. Constructor: `new ProductsAPI(_http, _shopId)`.

### Methods Overview

| Method                                               | HTTP   | Path Template                                                         | Description                   |
| ---------------------------------------------------- | ------ | --------------------------------------------------------------------- | ----------------------------- |
| list(params?)                                        | GET    | /shops/:shopId/products                                               | List products                 |
| create(payload)                                      | POST   | /shops/:shopId/products                                               | Create a product              |
| get(productId)                                       | GET    | /shops/:shopId/products/:productId                                    | Retrieve a product            |
| update(productId, payload)                           | PUT    | /shops/:shopId/products/:productId/update                             | Update a product              |
| delete(productId)                                    | DELETE | /shops/:shopId/products/:productId                                    | Delete a product              |
| clone(productId)                                     | POST   | /shops/:shopId/products/:productId/clone                              | Clone a product               |
| updateStock(productId, variantId, payload)           | PUT    | /shops/:shopId/products/:productId/stock/:variantId                   | Update variant stock          |
| deliverables(productId, variantId?)                  | GET    | /shops/:shopId/products/:productId/deliverables/:variantId?           | Get deliverables              |
| appendDeliverables(productId, variantId, payload)    | PUT    | /shops/:shopId/products/:productId/deliverables/append/:variantId?    | Append deliverables           |
| overwriteDeliverables(productId, variantId, payload) | PUT    | /shops/:shopId/products/:productId/deliverables/overwrite/:variantId? | Overwrite deliverables        |
| sortProducts(payload)                                | PUT    | /shops/:shopId/products/sort                                          | Sort products/groups          |
| bulkUpdateDisabledPaymentMethods(payload)            | PUT    | /shops/:shopId/products/bulk-update/disabled-payment-methods          | Bulk disabled payment methods |
| bulkUpdateCustomFields(payload)                      | PUT    | /shops/:shopId/products/bulk-update/custom-fields                     | Bulk custom fields            |
| bulkUpdateDiscordIntegration(payload)                | PUT    | /shops/:shopId/products/bulk-update/discord-integration               | Bulk Discord integration      |
| bulkUpdateDescription(payload)                       | PUT    | /shops/:shopId/products/bulk-update/description                       | Bulk modify description       |
| bulkUpdateInstructions(payload)                      | PUT    | /shops/:shopId/products/bulk-update/instructions                      | Bulk update instructions      |
| bulkUpdateOutOfStockMessage(payload)                 | PUT    | /shops/:shopId/products/bulk-update/out-of-stock-message              | Bulk out-of-stock message     |
| bulkUpdateSecurity(payload)                          | PUT    | /shops/:shopId/products/bulk-update/security                          | Bulk security flags           |
| bulkUpdateBadges(payload)                            | PUT    | /shops/:shopId/products/bulk-update/badges                            | Bulk badges                   |
| bulkUpdateStatus(payload)                            | PUT    | /shops/:shopId/products/bulk-update/status                            | Bulk status banner            |
| bulkUpdateVisibility(payload)                        | PUT    | /shops/:shopId/products/bulk-update/visibility                        | Bulk visibility               |
| bulkUpdateLiveStats(payload)                         | PUT    | /shops/:shopId/products/bulk-update/live-stats                        | Bulk live stats               |
| bulkUpdateFeedbackCoupon(payload)                    | PUT    | /shops/:shopId/products/bulk-update/feedback-coupon                   | Bulk feedback coupon          |
| bulkUpdateVolumeDiscounts(payload)                   | PUT    | /shops/:shopId/products/bulk-update/volume-discounts                  | Bulk volume discounts         |
| bulkUpdateRedirectUrl(payload)                       | PUT    | /shops/:shopId/products/bulk-update/redirect-url                      | Bulk redirect URL             |
| bulkUpdateDeliverablesType(payload)                  | PUT    | /shops/:shopId/products/bulk-update/deliverables-type                 | Bulk deliverables type        |
| bulkUpdateDeliverablesLabel(payload)                 | PUT    | /shops/:shopId/products/bulk-update/deliverables-label                | Bulk deliverables label       |

### Method Details

#### list()

Signature: `list(params?: ListProductsParams): Promise<Product[]>`  
Parameters:

| Name   | Type               | Required | Description          |
| ------ | ------------------ | -------- | -------------------- |
| params | ListProductsParams | No       | Filters & pagination |

Returns: Array of products.  
Example:

```ts
const products = await client.products(shopId).list({ perPage: 50, visibility: 'public' });
```

#### create()

Signature: `create(payload: CreateProductRequest): Promise<Product>`  
Parameters:

| Name    | Type                 | Required | Description        |
| ------- | -------------------- | -------- | ------------------ |
| payload | CreateProductRequest | Yes      | Product definition |

Returns: Created product.  
Example:

```ts
const created = await client.products(shopId).create({
  type: 'variant',
  name: 'License Key',
  currency: 'USD',
  visibility: 'public',
});
```

#### get()

Signature: `get(productId: number | string): Promise<Product>`  
Parameters:

| Name      | Type             | Required | Description |
| --------- | ---------------- | -------- | ----------- |
| productId | number \| string | Yes      | Product id  |

Returns: Product.  
Example:

```ts
const product = await client.products(shopId).get(999);
```

#### update()

Signature: `update(productId: number | string, payload: UpdateProductRequest): Promise<Product>`  
Parameters:

| Name      | Type                 | Required | Description    |
| --------- | -------------------- | -------- | -------------- |
| productId | number \| string     | Yes      | Product id     |
| payload   | UpdateProductRequest | Yes      | Updated fields |

Returns: Updated product.  
Example:

```ts
await client.products(shopId).update(999, { name: 'Updated Name', visibility: 'private' });
```

#### delete()

Signature: `delete(productId: number | string): Promise<{ success?: boolean }>`  
Parameters:

| Name      | Type             | Required | Description |
| --------- | ---------------- | -------- | ----------- |
| productId | number \| string | Yes      | Product id  |

Returns: Success flag.  
Example:

```ts
await client.products(shopId).delete(999);
```

#### clone()

Signature: `clone(productId: number | string): Promise<Product>`  
Parameters:

| Name      | Type             | Required | Description         |
| --------- | ---------------- | -------- | ------------------- |
| productId | number \| string | Yes      | Product id to clone |

Returns: Cloned product.  
Example:

```ts
const clone = await client.products(shopId).clone(101);
```

#### updateStock()

Signature: `updateStock(productId: number | string, variantId: number | string, payload: { stock?: number; delta?: number }): Promise<any>`  
Parameters:

| Name      | Type             | Required | Description             |
| --------- | ---------------- | -------- | ----------------------- |
| productId | number \| string | Yes      | Product id              |
| variantId | number \| string | Yes      | Variant id              |
| payload   | object           | Yes      | Absolute stock or delta |

Returns: API response (not fully typed).  
Example:

```ts
await client.products(shopId).updateStock(101, 1, { delta: 5 });
```

#### deliverables()

Signature: `deliverables(productId: number | string, variantId?: number | string): Promise<any>`  
Parameters:

| Name      | Type             | Required | Description |
| --------- | ---------------- | -------- | ----------- |
| productId | number \| string | Yes      | Product id  |
| variantId | number \| string | No       | Variant id  |

Returns: Deliverables collection.  
Example:

```ts
const items = await client.products(shopId).deliverables(101, 1);
```

#### appendDeliverables()

Signature: `appendDeliverables(productId: number | string, variantId: number | string | undefined, payload: any): Promise<any>`  
Parameters:

| Name      | Type             | Required | Description            |
| --------- | ---------------- | -------- | ---------------------- |
| productId | number \| string | Yes      | Product id             |
| variantId | number \| string | No       | Variant id             |
| payload   | any              | Yes      | Deliverables to append |

Returns: Response.  
Example:

```ts
await client.products(shopId).appendDeliverables(101, 1, { items: ['KEY-1', 'KEY-2'] });
```

#### overwriteDeliverables()

Signature: `overwriteDeliverables(productId: number | string, variantId: number | string | undefined, payload: any): Promise<any>`  
Parameters:

| Name      | Type             | Required | Description          |
| --------- | ---------------- | -------- | -------------------- |
| productId | number \| string | Yes      | Product id           |
| variantId | number \| string | No       | Variant id           |
| payload   | any              | Yes      | New deliverables set |

Returns: Response.  
Example:

```ts
await client.products(shopId).overwriteDeliverables(101, 1, { items: ['ONLY-KEY'] });
```

#### sortProducts()

Signature: `sortProducts(payload: SortProductsRequest): Promise<BulkOperationResponse>`  
Parameters:

| Name    | Type                | Required | Description           |
| ------- | ------------------- | -------- | --------------------- |
| payload | SortProductsRequest | Yes      | Sorting specification |

Returns: Bulk operation response.  
Example:

```ts
await client.products(shopId).sortProducts({ sortedIds: [{ id: 101 }, { id: 102 }] });
```

### Bulk Operations

Each bulk method returns `BulkOperationResponse`.

#### bulkUpdateDisabledPaymentMethods()

Signature: `bulkUpdateDisabledPaymentMethods(payload: BulkDisabledPaymentMethodsRequest)`  
| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| payload | BulkDisabledPaymentMethodsRequest | Yes | Selector + disabled payment method ids |

Example:

```ts
await client.products(shopId).bulkUpdateDisabledPaymentMethods({
  product_ids: { ids: [101, 102] },
  disabled_payment_method_ids: ['PAYPAL'],
});
```

#### bulkUpdateCustomFields()

Signature: `bulkUpdateCustomFields(payload: BulkCustomFieldsRequest)`  
| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| payload | BulkCustomFieldsRequest | Yes | Selector + custom_field_ids |

Example:

```ts
await client.products(shopId).bulkUpdateCustomFields({
  product_ids: { ids: [101] },
  custom_field_ids: ['fieldA', 'fieldB'],
});
```

#### bulkUpdateDiscordIntegration()

Signature: `bulkUpdateDiscordIntegration(payload: BulkDiscordIntegrationRequest)`  
| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| payload | BulkDiscordIntegrationRequest | Yes | Selector + integration flags |

Example:

```ts
await client.products(shopId).bulkUpdateDiscordIntegration({
  product_ids: { all: true },
  discord_required: true,
});
```

#### bulkUpdateDescription()

Signature: `bulkUpdateDescription(payload: BulkDescriptionRequest)`  
| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| payload | BulkDescriptionRequest | Yes | Selector + type + description |

Example:

```ts
await client.products(shopId).bulkUpdateDescription({
  product_ids: { ids: [101] },
  type: 'append',
  description: '\nNew info',
});
```

#### bulkUpdateInstructions()

Signature: `bulkUpdateInstructions(payload: BulkInstructionsRequest)`  
| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| payload | BulkInstructionsRequest | Yes | Selector + instructions |

Example:

```ts
await client.products(shopId).bulkUpdateInstructions({
  product_ids: { ids: [101] },
  instructions: 'Read carefully.',
});
```

#### bulkUpdateOutOfStockMessage()

Signature: `bulkUpdateOutOfStockMessage(payload: BulkOutOfStockMessageRequest)`  
| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| payload | BulkOutOfStockMessageRequest | Yes | Selector + message |

Example:

```ts
await client.products(shopId).bulkUpdateOutOfStockMessage({
  product_ids: { ids: [101] },
  out_of_stock_message: 'Restocking soon!',
});
```

#### bulkUpdateSecurity()

Signature: `bulkUpdateSecurity(payload: BulkSecurityRequest)`  
| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| payload | BulkSecurityRequest | Yes | Selector + security flags |

Example:

```ts
await client.products(shopId).bulkUpdateSecurity({
  product_ids: { ids: [101] },
  block_vpn: true,
});
```

#### bulkUpdateBadges()

Signature: `bulkUpdateBadges(payload: BulkBadgesRequest)`  
| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| payload | BulkBadgesRequest | Yes | Selector + type + product_badges |

Example:

```ts
await client.products(shopId).bulkUpdateBadges({
  product_ids: { ids: [101] },
  type: 'overwrite',
  product_badges: [{ text: 'HOT' }],
});
```

#### bulkUpdateStatus()

Signature: `bulkUpdateStatus(payload: BulkStatusRequest)`  
| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| payload | BulkStatusRequest | Yes | Selector + status fields |

Example:

```ts
await client.products(shopId).bulkUpdateStatus({
  product_ids: { ids: [101] },
  status_color: '#ff0000',
  status_text: 'Limited',
});
```

#### bulkUpdateVisibility()

Signature: `bulkUpdateVisibility(payload: BulkVisibilityRequest)`  
| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| payload | BulkVisibilityRequest | Yes | Selector + visibility |

Example:

```ts
await client.products(shopId).bulkUpdateVisibility({
  product_ids: { ids: [101, 102] },
  visibility: 'unlisted',
});
```

#### bulkUpdateLiveStats()

Signature: `bulkUpdateLiveStats(payload: BulkLiveStatsRequest)`  
| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| payload | BulkLiveStatsRequest | Yes | Selector + stats flags |

Example:

```ts
await client.products(shopId).bulkUpdateLiveStats({
  product_ids: { all: true },
  show_views_count: true,
});
```

#### bulkUpdateFeedbackCoupon()

Signature: `bulkUpdateFeedbackCoupon(payload: BulkFeedbackCouponRequest)`  
| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| payload | BulkFeedbackCouponRequest | Yes | Selector + coupon settings |

Example:

```ts
await client.products(shopId).bulkUpdateFeedbackCoupon({
  product_ids: { ids: [101] },
  feedback_coupon_id: 'COUP123',
  feedback_coupon_min_rating: 4,
});
```

#### bulkUpdateVolumeDiscounts()

Signature: `bulkUpdateVolumeDiscounts(payload: BulkVolumeDiscountsRequest)`  
| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| payload | BulkVolumeDiscountsRequest | Yes | Selector + tiers |

Example:

```ts
await client.products(shopId).bulkUpdateVolumeDiscounts({
  product_ids: { ids: [101] },
  volume_discounts: [{ qty: 10, percent: 5 }],
});
```

#### bulkUpdateRedirectUrl()

Signature: `bulkUpdateRedirectUrl(payload: BulkRedirectUrlRequest)`  
| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| payload | BulkRedirectUrlRequest | Yes | Selector + redirect_url |

Example:

```ts
await client.products(shopId).bulkUpdateRedirectUrl({
  product_ids: { ids: [101] },
  redirect_url: 'https://example.com/thanks',
});
```

#### bulkUpdateDeliverablesType()

Signature: `bulkUpdateDeliverablesType(payload: BulkDeliverablesTypeRequest)`  
| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| payload | BulkDeliverablesTypeRequest | Yes | Selector + deliverables_type |

Example:

```ts
await client.products(shopId).bulkUpdateDeliverablesType({
  product_ids: { ids: [101] },
  deliverables_type: 'serials',
});
```

#### bulkUpdateDeliverablesLabel()

Signature: `bulkUpdateDeliverablesLabel(payload: BulkDeliverablesLabelRequest)`  
| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| payload | BulkDeliverablesLabelRequest | Yes | Selector + label |

Example:

```ts
await client.products(shopId).bulkUpdateDeliverablesLabel({
  product_ids: { ids: [101] },
  deliverables_label: 'License Key',
});
```

---

## Customers

Customer records, tagging, and banning.

### Exported Types

- `Customer` – Customer representation (partial; index signature)
- `ListCustomersParams` – Listing & filtering params
- `CreateCustomerRequest` – Create payload
- `UpdateCustomerRequest` – Partial update (extends Partial of create)
- `CustomerBulkSelector` – Bulk selector object
- `BulkCustomerTagsRequest` – Bulk tag modification
- `BulkCustomerBanRequest` – Bulk ban/unban request
- `BulkCustomerResponse` – Bulk operation result

### Class: CustomersAPI

Manage customers for a shop. Prefer `SellAuthClient.customers(shopId)`. Constructor: `new CustomersAPI(_http, _shopId)`.

### Methods Overview

| Method                      | HTTP   | Path Template                             | Description          |
| --------------------------- | ------ | ----------------------------------------- | -------------------- |
| list(params?)               | GET    | /shops/:shopId/customers                  | List customers       |
| create(payload)             | POST   | /shops/:shopId/customers                  | Create customer      |
| get(customerId)             | GET    | /shops/:shopId/customers/:customerId      | Retrieve customer    |
| update(customerId, payload) | PUT    | /shops/:shopId/customers/:customerId      | Update customer      |
| delete(customerId)          | DELETE | /shops/:shopId/customers/:customerId      | Delete customer      |
| bulkUpdateTags(payload)     | PUT    | /shops/:shopId/customers/bulk-update/tags | Bulk add/remove tags |
| bulkUpdateBan(payload)      | PUT    | /shops/:shopId/customers/bulk-update/ban  | Bulk ban/unban       |

### Method Details

#### list()

Signature: `list(params?: ListCustomersParams): Promise<Customer[]>`  
Parameters:

| Name   | Type                | Required | Description          |
| ------ | ------------------- | -------- | -------------------- |
| params | ListCustomersParams | No       | Filters & pagination |

Returns: Array of customers.  
Example:

```ts
const customers = await client.customers(shopId).list({ email: 'example@' });
```

#### create()

Signature: `create(payload: CreateCustomerRequest): Promise<Customer>`  
Parameters:

| Name    | Type                  | Required | Description   |
| ------- | --------------------- | -------- | ------------- |
| payload | CreateCustomerRequest | Yes      | Customer data |

Returns: Created customer.  
Example:

```ts
const newCustomer = await client.customers(shopId).create({ email: 'user@example.com' });
```

#### get()

Signature: `get(customerId: number | string): Promise<Customer>`  
Parameters:

| Name       | Type             | Required | Description |
| ---------- | ---------------- | -------- | ----------- |
| customerId | number \| string | Yes      | Customer id |

Returns: Customer.  
Example:

```ts
const customer = await client.customers(shopId).get(5);
```

#### update()

Signature: `update(customerId: number | string, payload: UpdateCustomerRequest): Promise<Customer>`  
Parameters:

| Name       | Type                  | Required | Description      |
| ---------- | --------------------- | -------- | ---------------- |
| customerId | number \| string      | Yes      | Customer id      |
| payload    | UpdateCustomerRequest | Yes      | Fields to change |

Returns: Updated record.  
Example:

```ts
await client.customers(shopId).update(5, { banned: true });
```

#### delete()

Signature: `delete(customerId: number | string): Promise<{ success?: boolean }>`  
Parameters:

| Name       | Type             | Required | Description |
| ---------- | ---------------- | -------- | ----------- |
| customerId | number \| string | Yes      | Customer id |

Returns: Success flag.  
Example:

```ts
await client.customers(shopId).delete(5);
```

#### bulkUpdateTags()

Signature: `bulkUpdateTags(payload: BulkCustomerTagsRequest): Promise<BulkCustomerResponse>`  
Parameters:

| Name    | Type                    | Required | Description                |
| ------- | ----------------------- | -------- | -------------------------- |
| payload | BulkCustomerTagsRequest | Yes      | Selector + add/remove tags |

Returns: Bulk result.  
Example:

```ts
await client.customers(shopId).bulkUpdateTags({
  customer_ids: { ids: [1, 2] },
  add: ['vip'],
});
```

#### bulkUpdateBan()

Signature: `bulkUpdateBan(payload: BulkCustomerBanRequest): Promise<BulkCustomerResponse>`  
Parameters:

| Name    | Type                   | Required | Description            |
| ------- | ---------------------- | -------- | ---------------------- |
| payload | BulkCustomerBanRequest | Yes      | Selector + banned flag |

Returns: Bulk result.  
Example:

```ts
await client.customers(shopId).bulkUpdateBan({
  customer_ids: { ids: [1, 2] },
  banned: true,
});
```

---

## Invoices

Invoice listing, status changes, refunds, and item replacement.

### Exported Types

- `InvoiceGateway` – Known gateway identifiers
- `InvoiceStatus` – Core statuses (string union + fallback)
- `Invoice` – Partial invoice representation (index signature)
- `InvoicesListFilters` – List filters
- `ReplaceDeliveredRequest` – Replace delivered items payload

### Class: InvoicesAPI

Invoice operations for a shop. Prefer `SellAuthClient.invoices(shopId)`. Constructor: `new InvoicesAPI(_http, _shopId)`.

### Methods Overview

| Method                               | HTTP | Path Template                                        | Description             |
| ------------------------------------ | ---- | ---------------------------------------------------- | ----------------------- |
| list(filters?)                       | GET  | /shops/:shopId/invoices                              | List invoices           |
| get(invoiceId)                       | GET  | /shops/:shopId/invoices/:invoiceId                   | Retrieve invoice        |
| archive(invoiceId)                   | POST | /shops/:shopId/invoices/:invoiceId/archive           | Archive invoice         |
| unarchive(invoiceId)                 | POST | /shops/:shopId/invoices/:invoiceId/unarchive         | Unarchive invoice       |
| cancel(invoiceId)                    | POST | /shops/:shopId/invoices/:invoiceId/cancel            | Cancel invoice          |
| refund(invoiceId)                    | POST | /shops/:shopId/invoices/:invoiceId/refund            | Refund invoice          |
| unrefund(invoiceId)                  | POST | /shops/:shopId/invoices/:invoiceId/unrefund          | Remove refund mark      |
| pdf(invoiceId)                       | GET  | /shops/:shopId/invoices/:invoiceId/pdf               | Retrieve PDF            |
| process(invoiceId)                   | GET  | /shops/:shopId/invoices/:invoiceId/process           | Process invoice         |
| replaceDelivered(invoiceId, payload) | POST | /shops/:shopId/invoices/:invoiceId/replace-delivered | Replace delivered items |
| setDashboardNote(invoiceId, note)    | PUT  | /shops/:shopId/invoices/:invoiceId/dashboard-note    | Update dashboard note   |

### Method Details

#### list()

Signature: `list(filters?: InvoicesListFilters): Promise<Invoice[]>`  
Parameters:

| Name    | Type                | Required | Description   |
| ------- | ------------------- | -------- | ------------- |
| filters | InvoicesListFilters | No       | Query filters |

Returns: Array of invoices.  
Example:

```ts
const invoices = await client.invoices(shopId).list({ perPage: 25, statuses: ['completed'] });
```

#### get()

Signature: `get(invoiceId: number | string): Promise<Invoice>`  
Parameters:

| Name      | Type             | Required | Description |
| --------- | ---------------- | -------- | ----------- |
| invoiceId | number \| string | Yes      | Invoice id  |

Returns: Invoice.  
Example:

```ts
const invoice = await client.invoices(shopId).get(1001);
```

#### archive()

Signature: `archive(invoiceId: number | string): Promise<Invoice | { success?: boolean }>`  
Parameters:

| Name      | Type             | Required | Description |
| --------- | ---------------- | -------- | ----------- |
| invoiceId | number \| string | Yes      | Invoice id  |

Returns: Updated invoice or success flag.  
Example:

```ts
await client.invoices(shopId).archive(1001);
```

#### unarchive()

Signature: `unarchive(invoiceId: number | string): Promise<Invoice | { success?: boolean }>`  
Parameters similar to archive.  
Example:

```ts
await client.invoices(shopId).unarchive(1001);
```

#### cancel()

Signature: `cancel(invoiceId: number | string): Promise<Invoice | { success?: boolean }>`  
Example:

```ts
await client.invoices(shopId).cancel(1001);
```

#### refund()

Signature: `refund(invoiceId: number | string): Promise<Invoice | { success?: boolean }>`  
Example:

```ts
await client.invoices(shopId).refund(1001);
```

#### unrefund()

Signature: `unrefund(invoiceId: number | string): Promise<Invoice | { success?: boolean }>`  
Example:

```ts
await client.invoices(shopId).unrefund(1001);
```

#### pdf()

Signature: `pdf(invoiceId: number | string): Promise<any>`  
Returns: PDF content/metadata (transport dependent).  
Example:

```ts
const pdfData = await client.invoices(shopId).pdf(1001);
```

#### process()

Signature: `process(invoiceId: number | string): Promise<Invoice | { success?: boolean }>`  
Example:

```ts
await client.invoices(shopId).process(1001);
```

#### replaceDelivered()

Signature: `replaceDelivered(invoiceId: number | string, payload: ReplaceDeliveredRequest): Promise<Invoice | { success?: boolean }>`  
Parameters:

| Name      | Type                    | Required | Description           |
| --------- | ----------------------- | -------- | --------------------- |
| invoiceId | number \| string        | Yes      | Invoice id            |
| payload   | ReplaceDeliveredRequest | Yes      | Item replacement data |

Example:

```ts
await client.invoices(shopId).replaceDelivered(1001, {
  invoice_item_id: 55,
  replacements: [{ value: 'NEW-KEY' }],
});
```

#### setDashboardNote()

Signature: `setDashboardNote(invoiceId: number | string, note: string): Promise<Invoice | { success?: boolean }>`  
Example:

```ts
await client.invoices(shopId).setDashboardNote(1001, 'High-value customer');
```

---

## Checkout

Create checkout sessions for carts.

### Exported Types

- `CheckoutSession` – Response after creating session
- `CheckoutGateway` – Allowed gateway identifiers for preselection
- `CheckoutCartItem` – Cart item (productId, variantId, quantity)
- `CreateCheckoutRequest` – Checkout creation payload

### Class: CheckoutAPI

Create checkout sessions for a shop. Prefer `SellAuthClient.checkout(shopId)`. Constructor: `new CheckoutAPI(_http, _shopId)`.

### Methods Overview

| Method          | HTTP | Path Template           | Description             |
| --------------- | ---- | ----------------------- | ----------------------- |
| create(payload) | POST | /shops/:shopId/checkout | Create checkout session |

### Method Details

#### create()

Signature: `create(payload: CreateCheckoutRequest): Promise<CheckoutSession>`  
Parameters:

| Name    | Type                  | Required | Description      |
| ------- | --------------------- | -------- | ---------------- |
| payload | CreateCheckoutRequest | Yes      | Checkout payload |

Returns: CheckoutSession (invoice id and URL(s)).  
Example:

```ts
const session = await client.checkout(shopId).create({
  cart: [{ productId: 101, variantId: 1, quantity: 2 }],
  email: 'buyer@example.com',
  gateway: 'STRIPE',
});
```

---

## Blacklist

Manage blacklist entries (block emails, IPs, user agents, ASNs, or country codes) for fraud prevention.

### Exported Types

- `BlacklistEntry` – A blacklist record (id, value, type, match_type, optional reason, timestamps)
- `BlacklistType` – 'email' | 'ip' | 'user_agent' | 'asn' | 'country_code'
- `BlacklistMatchType` – 'exact' | 'regex'
- `CreateBlacklistEntryRequest` – Create payload
- `UpdateBlacklistEntryRequest` – Update payload (same shape)
- `ListBlacklistParams` – Pagination params (page, perPage)

### Class: BlacklistAPI

Prefer `SellAuthClient.blacklist(shopId)`. Constructor: `new BlacklistAPI(_http, _shopId)`.

### Methods Overview

| Method             | HTTP   | Path Template                       | Description            |
| ------------------ | ------ | ----------------------------------- | ---------------------- |
| list(params?)      | GET    | /shops/:shopId/blacklist            | List blacklist entries |
| create(payload)    | POST   | /shops/:shopId/blacklist            | Create entry           |
| get(id)            | GET    | /shops/:shopId/blacklist/:id        | Retrieve entry         |
| update(id,payload) | PUT    | /shops/:shopId/blacklist/:id/update | Update entry           |
| delete(id)         | DELETE | /shops/:shopId/blacklist/:id        | Delete entry           |

### Method Examples

```ts
// List
const entries = await client.blacklist(shopId).list({ page: 1, perPage: 20 });
// Create
const entry = await client.blacklist(shopId).create({
  value: 'blocked@example.com',
  type: 'email',
  match_type: 'exact',
  reason: 'Fraud',
});
// Update
await client.blacklist(shopId).update(entry.id, { ...entry, reason: 'Chargeback abuse' });
// Delete
await client.blacklist(shopId).delete(entry.id);
```

---

## Analytics

Shop analytics (overview KPIs, time‑series graph, top products/customers). Some schemas are inferred due to incomplete public docs; additional fields may appear.

### Exported Types

- `OverviewAnalytics` – revenue, orders, customers plus change deltas
- `GraphAnalyticsResponse` – `{ points?: GraphPoint[] }` (points contain date + metrics)
- `GraphPoint` – time‑series point (date, revenue?, orders?, customers?)
- `TopProductAnalyticsItem` – productId, name, revenue, orders, quantity
- `TopCustomerAnalyticsItem` – customerId, email, revenue, orders

### Class: AnalyticsAPI

Prefer `SellAuthClient.analytics(shopId)`. Constructor: `new AnalyticsAPI(_http, _shopId)`.

### Methods Overview

| Method         | HTTP | Path Template                          | Description                  |
| -------------- | ---- | -------------------------------------- | ---------------------------- |
| overview()     | GET  | /shops/:shopId/analytics               | KPI snapshot + deltas        |
| graph()        | GET  | /shops/:shopId/analytics/graph         | Time‑series points           |
| topProducts()  | GET  | /shops/:shopId/analytics/top-products  | Top products (approx top 5)  |
| topCustomers() | GET  | /shops/:shopId/analytics/top-customers | Top customers (approx top 5) |

### Notes

- Currently no documented query params for date range; server chooses default window.
- Treat optional numeric fields defensively (may be undefined when metric not applicable).

### Method Examples

```ts
const overview = await client.analytics(shopId).overview();
const graph = await client.analytics(shopId).graph();
const topProducts = await client.analytics(shopId).topProducts();
const topCustomers = await client.analytics(shopId).topCustomers();
```

---

## Crypto Wallet

Payouts, balances, and transactions for crypto funds.

### Exported Types

- `CryptoPayoutRecord` – Payout history entry (partial)
- `CryptoBalanceRecord` – Balance per currency
- `CryptoTransactionRecord` – Transaction record
- `CryptoPayoutCurrency` – 'btc' | 'ltc'
- `CryptoPayoutRequest` – Payout initiation payload (includes currency, address, amount, password, tfa_code)

### Class: CryptoWalletAPI

Operations for crypto payouts and wallet history. Prefer `SellAuthClient.cryptoWallet(shopId)`. Constructor: `new CryptoWalletAPI(_http, _shopId)`.

### Methods Overview

| Method            | HTTP | Path Template                       | Description              |
| ----------------- | ---- | ----------------------------------- | ------------------------ |
| getPayouts()      | GET  | /shops/:shopId/payouts              | List payout history      |
| getBalances()     | GET  | /shops/:shopId/payouts/balances     | Get wallet balances      |
| payout(body)      | POST | /shops/:shopId/payouts/payout       | Create a payout          |
| getTransactions() | GET  | /shops/:shopId/payouts/transactions | List wallet transactions |

### Method Details

#### getPayouts()

Signature: `getPayouts(): Promise<CryptoPayoutRecord[]>`  
Returns: Payout history.  
Example:

```ts
const payouts = await client.cryptoWallet(shopId).getPayouts();
```

#### getBalances()

Signature: `getBalances(): Promise<CryptoBalanceRecord | CryptoBalanceRecord[]>`  
Returns: Balance object(s).  
Example:

```ts
const balances = await client.cryptoWallet(shopId).getBalances();
```

#### payout()

Signature: `payout(body: CryptoPayoutRequest): Promise<CryptoPayoutRecord | { success?: boolean }>`  
Parameters:

| Name | Type                | Required | Description                                   |
| ---- | ------------------- | -------- | --------------------------------------------- |
| body | CryptoPayoutRequest | Yes      | Currency, address, amount, password, tfa_code |

Returns: Payout record or success flag.  
Example:

```ts
await client.cryptoWallet(shopId).payout({
  currency: 'btc',
  address: 'bc1qexample',
  amount: 0.01,
  password: 'yourpassword',
  tfa_code: '123456',
});
```

#### getTransactions()

Signature: `getTransactions(): Promise<CryptoTransactionRecord[]>`  
Returns: Transaction history.  
Example:

```ts
const txs = await client.cryptoWallet(shopId).getTransactions();
```

---
