export class ShopsAPI {
    http;
    constructor(http) {
        this.http = http;
    }
    list() { return this.http.request('GET', '/shops'); }
    get(shopId) { return this.http.request('GET', `/shops/${shopId}`); }
    stats(shopId) { return this.http.request('GET', `/shops/${shopId}/stats`); }
    create(data) {
        const form = new FormData();
        form.append('name', data.name);
        form.append('subdomain', data.subdomain);
        if (data.logo)
            form.append('logo', data.logo, 'logo.png');
        return this.http.request('POST', '/shops/create', { body: form });
    }
    update(shopId, data) { return this.http.request('PUT', `/shops/${shopId}/update`, { body: data }); }
    delete(shopId, payload) { return this.http.request('DELETE', `/shops/${shopId}`, { body: payload }); }
}
