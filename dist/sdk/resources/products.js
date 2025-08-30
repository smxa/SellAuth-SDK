export class ProductsAPI {
    _http;
    _shopId;
    constructor(_http, _shopId) {
        this._http = _http;
        this._shopId = _shopId;
        /* store deps */
    }
    list(params) {
        return this._http.request('GET', `/shops/${this._shopId}/products`, {
            query: params,
        });
    }
    create(payload) {
        return this._http.request('POST', `/shops/${this._shopId}/products`, {
            body: payload,
        });
    }
    get(productId) {
        return this._http.request('GET', `/shops/${this._shopId}/products/${productId}`);
    }
    update(productId, payload) {
        return this._http.request('PUT', `/shops/${this._shopId}/products/${productId}/update`, { body: payload });
    }
    delete(productId) {
        return this._http.request('DELETE', `/shops/${this._shopId}/products/${productId}`);
    }
    clone(productId) {
        return this._http.request('POST', `/shops/${this._shopId}/products/${productId}/clone`);
    }
    updateStock(productId, variantId, payload) {
        return this._http.request('PUT', `/shops/${this._shopId}/products/${productId}/stock/${variantId}`, { body: payload });
    }
    deliverables(productId, variantId) {
        return this._http.request('GET', `/shops/${this._shopId}/products/${productId}/deliverables/${variantId ?? ''}`);
    }
    appendDeliverables(productId, variantId, payload) {
        return this._http.request('PUT', `/shops/${this._shopId}/products/${productId}/deliverables/append/${variantId ?? ''}`, { body: payload });
    }
    overwriteDeliverables(productId, variantId, payload) {
        return this._http.request('PUT', `/shops/${this._shopId}/products/${productId}/deliverables/overwrite/${variantId ?? ''}`, { body: payload });
    }
}
