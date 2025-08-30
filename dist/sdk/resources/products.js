export class ProductsAPI {
    http;
    shopId;
    constructor(http, shopId) {
        this.http = http;
        this.shopId = shopId;
    }
    list(params) { return this.http.request('GET', `/shops/${this.shopId}/products`, { query: params }); }
    create(payload) { return this.http.request('POST', `/shops/${this.shopId}/products`, { body: payload }); }
    get(productId) { return this.http.request('GET', `/shops/${this.shopId}/products/${productId}`); }
    update(productId, payload) { return this.http.request('PUT', `/shops/${this.shopId}/products/${productId}/update`, { body: payload }); }
    delete(productId) { return this.http.request('DELETE', `/shops/${this.shopId}/products/${productId}`); }
    clone(productId) { return this.http.request('POST', `/shops/${this.shopId}/products/${productId}/clone`); }
    updateStock(productId, variantId, payload) { return this.http.request('PUT', `/shops/${this.shopId}/products/${productId}/stock/${variantId}`, { body: payload }); }
    deliverables(productId, variantId) { return this.http.request('GET', `/shops/${this.shopId}/products/${productId}/deliverables/${variantId ?? ''}`); }
    appendDeliverables(productId, variantId, payload) { return this.http.request('PUT', `/shops/${this.shopId}/products/${productId}/deliverables/append/${variantId ?? ''}`, { body: payload }); }
    overwriteDeliverables(productId, variantId, payload) { return this.http.request('PUT', `/shops/${this.shopId}/products/${productId}/deliverables/overwrite/${variantId ?? ''}`, { body: payload }); }
}
