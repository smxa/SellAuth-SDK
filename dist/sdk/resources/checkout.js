export class CheckoutAPI {
    _http;
    _shopId;
    constructor(_http, _shopId) {
        this._http = _http;
        this._shopId = _shopId;
        /* store deps */
    }
    create(payload) {
        return this._http.request('POST', `/shops/${this._shopId}/checkout`, {
            body: payload,
        });
    }
}
