# SellAuth API Reference

_Last updated: 2025-09-01_

Consolidated reference for SellAuth REST API endpoints. Includes authentication, core concepts, and resource endpoints. Original docs: see Appendix.

## Quick Start

1. Obtain API key in SellAuth dashboard → Account → API.
2. Base URL: `https://api.sellauth.com/v1`
3. Headers:
   - `Authorization: Bearer <token>`
   - `Content-Type: application/json`
4. Example – list shops:

```bash
curl -X GET "https://api.sellauth.com/v1/shops" -H "Authorization: Bearer $TOKEN"
```

```ts
import { SellAuthClient } from './src';
const client = new SellAuthClient({ apiKey: process.env.SELLAUTH_TOKEN! });
const shops = await client.shops.list();
```

## Authentication

Bearer token. Include in every request. Keep secret. Rotate if compromised.

## Common Concepts

### Formats

JSON requests/responses except file uploads (multipart/form-data).

### Errors

HTTP status codes (200, 201, 400, 401, 403, 404, 422, 500). Example 404:

```json
{ "message": "No query results for model [App\\Models\\Shop] 1" }
```

Validation errors → 422 with field messages.

### Rate Limits

Not explicitly documented. Implement client-side throttling + exponential backoff on 429 or repeated 5xx.

### Pagination

List endpoints commonly accept `page` and `perPage` (`1..100`). Some accept `orderColumn`, `orderDirection`.

### Generic Examples

```bash
curl -X GET "https://api.sellauth.com/v1/shops/{shopId}/products" -H "Authorization: Bearer $TOKEN"
```

```bash
curl -X POST "https://api.sellauth.com/v1/shops/{shopId}/coupons" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"SUMMER","global":true,"discount":10,"type":"percentage"}'
```

## Resources

(Condensed. See original docs for exhaustive optional fields.)

### Analytics

- GET `/shops/{shopId}/analytics`
- GET `/shops/{shopId}/analytics/graph`
- GET `/shops/{shopId}/analytics/top-products`
- GET `/shops/{shopId}/analytics/top-customers`

Optional observed query params for overview & graph:

- `start` ISO timestamp
- `end` ISO timestamp
- `excludeManual` 0/1
- `excludeArchived` 0/1
- `currency` ISO currency code (e.g. USD)

### Blacklist

- GET `/shops/{shopId}/blacklist`
- POST `/shops/{shopId}/blacklist`
- GET `/shops/{shopId}/blacklist/{blacklistId}`
- DELETE `/shops/{shopId}/blacklist/{blacklistId}`
- PUT `/shops/{shopId}/blacklist/{blacklistId}/update`

### Blog Posts

- GET `/shops/{shopId}/blog-posts`
- POST `/shops/{shopId}/blog-posts`
- GET `/shops/{shopId}/blog-posts/{blogPostId}`
- PUT `/shops/{shopId}/blog-posts/{blogPostId}`
- DELETE `/shops/{shopId}/blog-posts/{blogPostId}`

### Checkout (Business Plan)

- POST `/shops/{shopId}/checkout`

### Coupons

- GET `/shops/{shopId}/coupons`
- POST `/shops/{shopId}/coupons`
- GET `/shops/{shopId}/coupons/{couponId}`
- DELETE `/shops/{shopId}/coupons/{couponId}`
- DELETE `/shops/{shopId}/coupons/used`
- PUT `/shops/{shopId}/coupons/{couponId}/update`

### Crypto Wallet

- GET `/shops/{shopId}/payouts`
- GET `/shops/{shopId}/payouts/balances`
- POST `/shops/{shopId}/payouts/payout`
- GET `/shops/{shopId}/payouts/transactions`

### Customers

- GET `/shops/{shopId}/customers`
- POST `/shops/{shopId}/customers/{customerId}/balance`

### Domains

- GET `/shops/{shopId}/domains`
- POST `/shops/{shopId}/domains`
- GET `/shops/{shopId}/domains/{domainId}`
- DELETE `/shops/{shopId}/domains/{domainId}`

### Feedbacks

- GET `/shops/{shopId}/feedbacks`
- GET `/shops/{shopId}/feedbacks/{feedbackId}`
- POST `/shops/{shopId}/feedbacks/{feedbackId}/reply`
- POST `/shops/{shopId}/feedbacks/{feedbackId}/dispute`

### Groups

- GET `/shops/{shopId}/groups`
- POST `/shops/{shopId}/groups`
- GET `/shops/{shopId}/groups/{groupId}`
- PUT `/shops/{shopId}/groups/{groupId}/update`
- DELETE `/shops/{shopId}/groups/{groupId}`

### Custom Fields

- GET `/shops/{shopId}/custom-fields`
- POST `/shops/{shopId}/custom-fields`
- DELETE `/shops/{shopId}/custom-fields/{customFieldId}`
- PUT `/shops/{shopId}/custom-fields/{customFieldId}`

### Images

- GET `/shops/{shopId}/images`
- POST `/shops/{shopId}/images` (multipart)
- DELETE `/shops/{shopId}/images/{imageId}`

### Invoices

- GET `/shops/{shopId}/invoices` (supports array filters e.g. `?statuses[0]=pending&statuses[1]=completed`)
- GET `/shops/{shopId}/invoices/{invoiceId}`
- POST `/shops/{shopId}/invoices/{invoiceId}/archive`
- POST `/shops/{shopId}/invoices/{invoiceId}/unarchive`
- POST `/shops/{shopId}/invoices/{invoiceId}/cancel`
- POST `/shops/{shopId}/invoices/{invoiceId}/refund`
- POST `/shops/{shopId}/invoices/{invoiceId}/unrefund`
- PUT `/shops/{shopId}/invoices/{invoiceId}/dashboard-note`
- GET `/shops/{shopId}/invoices/{invoiceId}/pdf`
- GET `/shops/{shopId}/invoices/{invoiceId}/process`
- POST `/shops/{shopId}/invoices/{invoiceId}/replace-delivered`

### Notifications

- GET `/shops/{shopId}/notifications/latest` (implemented)
- GET `/shops/{shopId}/notifications/page`
- POST `/shops/{shopId}/notifications/mark-as-read`
- GET `/shops/{shopId}/notifications/settings`
- POST `/shops/{shopId}/notifications/settings`

### Payment Methods

- GET `/shops/{shopId}/payment-methods`
- POST `/shops/{shopId}/payment-methods`
- GET `/shops/{shopId}/payment-methods/{paymentMethodId}`
- PUT `/shops/{shopId}/payment-methods/{paymentMethodId}`
- DELETE `/shops/{shopId}/payment-methods/{paymentMethodId}`
- PUT `/shops/{shopId}/payment-methods/order`
- POST `/shops/{shopId}/payment-methods/{paymentMethodId}/toggle`

### Products (selected)

- GET `/shops/{shopId}/products`
- POST `/shops/{shopId}/products`
- GET `/shops/{shopId}/products/{productId}`
- PUT `/shops/{shopId}/products/{productId}/update`
- DELETE `/shops/{shopId}/products/{productId}`
- POST `/shops/{shopId}/products/{productId}/clone`
- PUT `/shops/{shopId}/products/{productId}/stock/{variantId}`
- GET `/shops/{shopId}/products/{productId}/deliverables/{variantId?}`
- PUT `/shops/{shopId}/products/{productId}/deliverables/append/{variantId?}`
- PUT `/shops/{shopId}/products/{productId}/deliverables/overwrite/{variantId?}`
- (Bulk update endpoints omitted for brevity.)

### Shops

- GET `/shops`
- POST `/shops/create`
- GET `/shops/{shopId}`
- PUT `/shops/{shopId}/update`
- DELETE `/shops/{shopId}`
- GET `/shops/{shopId}/stats`

### Tickets

- GET `/shops/{shopId}/tickets`
- POST `/shops/{shopId}/tickets`
- GET `/shops/{shopId}/tickets/{ticketId}`
- POST `/shops/{shopId}/tickets/{ticketId}/close`
- POST `/shops/{shopId}/tickets/{ticketId}/reopen`
- POST `/shops/{shopId}/tickets/{ticketId}/archive`
- POST `/shops/{shopId}/tickets/{ticketId}/unarchive`
- POST `/shops/{shopId}/tickets/{ticketId}/messages`
- DELETE `/shops/{shopId}/tickets/{ticketId}/messages/{messageId}`

## Security Recommendations

- Never expose API keys client-side.
- Implement retry with jitter for transient failures.
- Time-bound and rotate credentials.
- Sanitize logs; do not log secrets or full responses containing PII.

## Appendix: Original Documentation Links

Analytics: https://docs.sellauth.com/api-documentation/analytics
Blacklist: https://docs.sellauth.com/api-documentation/blacklist
Blog Posts: https://docs.sellauth.com/api-documentation/blog--posts
Checkout: https://docs.sellauth.com/api-documentation/checkout
Coupons: https://docs.sellauth.com/api-documentation/coupons
Crypto Wallet: https://docs.sellauth.com/api-documentation/crypto--wallet
Customers: https://docs.sellauth.com/api-documentation/customers
Domains: https://docs.sellauth.com/api-documentation/domains
Feedbacks: https://docs.sellauth.com/api-documentation/feedbacks
Groups: https://docs.sellauth.com/api-documentation/groups
Custom Fields: https://docs.sellauth.com/api-documentation/custom--fields
Images: https://docs.sellauth.com/api-documentation/images
Invoices: https://docs.sellauth.com/api-documentation/invoices
Notifications: https://docs.sellauth.com/api-documentation/notifications
Payment Methods: https://docs.sellauth.com/api-documentation/payment--methods
Products: https://docs.sellauth.com/api-documentation/products
Shops: https://docs.sellauth.com/api-documentation/shops
Tickets: https://docs.sellauth.com/api-documentation/tickets
