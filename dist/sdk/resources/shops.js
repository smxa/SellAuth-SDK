export class ShopsAPI {
    _http;
    constructor(_http) {
        this._http = _http;
        /* stores http */
    }
    list() {
        // use http.request
        return this._http.request('GET', '/shops');
    }
    get(shopId) {
        return this._http.request('GET', `/shops/${shopId}`);
    }
    stats(shopId) {
        return this._http.request('GET', `/shops/${shopId}/stats`);
    }
    create(data) {
        const form = new FormData();
        form.append('name', data.name);
        form.append('subdomain', data.subdomain);
        if (data.logo)
            form.append('logo', data.logo, 'logo.png');
        return this._http.request('POST', '/shops/create', { body: form });
    }
    update(shopId, data) {
        return this._http.request('PUT', `/shops/${shopId}/update`, {
            body: data,
        });
    }
    delete(shopId, payload) {
        return this._http.request('DELETE', `/shops/${shopId}`, {
            body: payload,
        });
    }
}
