export class InvoicesAPI {
    _http;
    _shopId;
    constructor(_http, _shopId) {
        this._http = _http;
        this._shopId = _shopId;
        /* store deps */
    }
    list(filters) {
        return this._http.request('GET', `/shops/${this._shopId}/invoices`, {
            query: filters,
        });
    }
    get(invoiceId) {
        return this._http.request('GET', `/shops/${this._shopId}/invoices/${invoiceId}`);
    }
    archive(invoiceId) {
        return this._http.request('POST', `/shops/${this._shopId}/invoices/${invoiceId}/archive`);
    }
    unarchive(invoiceId) {
        return this._http.request('POST', `/shops/${this._shopId}/invoices/${invoiceId}/unarchive`);
    }
    cancel(invoiceId) {
        return this._http.request('POST', `/shops/${this._shopId}/invoices/${invoiceId}/cancel`);
    }
    refund(invoiceId) {
        return this._http.request('POST', `/shops/${this._shopId}/invoices/${invoiceId}/refund`);
    }
    unrefund(invoiceId) {
        return this._http.request('POST', `/shops/${this._shopId}/invoices/${invoiceId}/unrefund`);
    }
    pdf(invoiceId) {
        return this._http.request('GET', `/shops/${this._shopId}/invoices/${invoiceId}/pdf`);
    }
    process(invoiceId) {
        return this._http.request('GET', `/shops/${this._shopId}/invoices/${invoiceId}/process`);
    }
    replaceDelivered(invoiceId, payload) {
        return this._http.request('POST', `/shops/${this._shopId}/invoices/${invoiceId}/replace-delivered`, { body: payload });
    }
}
