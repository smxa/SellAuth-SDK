export class CheckoutAPI {
    http;
    shopId;
    constructor(http, shopId) {
        this.http = http;
        this.shopId = shopId;
    }
    create(payload) { return this.http.request('POST', `/shops/${this.shopId}/checkout`, { body: payload }); }
}
