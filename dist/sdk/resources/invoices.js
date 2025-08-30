export class InvoicesAPI {
    http;
    shopId;
    constructor(http, shopId) {
        this.http = http;
        this.shopId = shopId;
    }
    list(filters) { return this.http.request('GET', `/shops/${this.shopId}/invoices`, { query: filters }); }
    get(invoiceId) { return this.http.request('GET', `/shops/${this.shopId}/invoices/${invoiceId}`); }
    archive(invoiceId) { return this.http.request('POST', `/shops/${this.shopId}/invoices/${invoiceId}/archive`); }
    unarchive(invoiceId) { return this.http.request('POST', `/shops/${this.shopId}/invoices/${invoiceId}/unarchive`); }
    cancel(invoiceId) { return this.http.request('POST', `/shops/${this.shopId}/invoices/${invoiceId}/cancel`); }
    refund(invoiceId) { return this.http.request('POST', `/shops/${this.shopId}/invoices/${invoiceId}/refund`); }
    unrefund(invoiceId) { return this.http.request('POST', `/shops/${this.shopId}/invoices/${invoiceId}/unrefund`); }
    pdf(invoiceId) { return this.http.request('GET', `/shops/${this.shopId}/invoices/${invoiceId}/pdf`); }
    process(invoiceId) { return this.http.request('GET', `/shops/${this.shopId}/invoices/${invoiceId}/process`); }
    replaceDelivered(invoiceId, payload) { return this.http.request('POST', `/shops/${this.shopId}/invoices/${invoiceId}/replace-delivered`, { body: payload }); }
}
