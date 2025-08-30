"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CheckoutAPI: () => CheckoutAPI,
  HttpClient: () => HttpClient,
  InvoicesAPI: () => InvoicesAPI,
  ProductsAPI: () => ProductsAPI,
  SellAuthClient: () => SellAuthClient,
  SellAuthError: () => SellAuthError,
  ShopsAPI: () => ShopsAPI,
  fetchAllPages: () => fetchAllPages,
  fetchPages: () => fetchPages,
  paginateAll: () => paginateAll
});
module.exports = __toCommonJS(index_exports);

// src/sdk/core/http.ts
var SellAuthError = class extends Error {
  status;
  code;
  details;
  constructor(message, opts = {}) {
    super(message);
    this.name = "SellAuthError";
    Object.assign(this, opts);
  }
};
var HttpClient = class {
  apiKey;
  baseUrl;
  userAgent;
  timeoutMs;
  maxRetries;
  retryDelayBaseMs;
  constructor(opts) {
    this.apiKey = opts.apiKey;
    this.baseUrl = (opts.baseUrl || "https://api.sellauth.com/v1").replace(/\/$/, "");
    this.userAgent = opts.userAgent || "sellauth-sdk-ts/0.1.0";
    this.timeoutMs = opts.timeoutMs ?? 15e3;
    this.maxRetries = Math.max(0, opts.maxRetries ?? 3);
    this.retryDelayBaseMs = opts.retryDelayBaseMs ?? 300;
  }
  async request(method, path, init = {}) {
    const url = this.makeUrl(path, init.query);
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
      "User-Agent": this.userAgent,
      ...init.headers
    };
    let body;
    if (init.body !== void 0 && init.body !== null && !(init.body instanceof FormData)) {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      body = JSON.stringify(init.body);
    } else if (init.body instanceof FormData) {
      body = init.body;
    }
    let attempt = 0;
    let lastError;
    while (attempt <= this.maxRetries) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const res = await globalThis.fetch(url, {
          method,
          headers,
          body,
          signal: init.signal ?? controller.signal
        });
        clearTimeout(timeout);
        if (res.status === 204) return void 0;
        const text = await res.text();
        let data = void 0;
        try {
          data = text ? JSON.parse(text) : void 0;
        } catch {
          data = text;
        }
        if (res.ok) return data;
        if ([408, 429, 500, 502, 503, 504].includes(res.status) && attempt < this.maxRetries) {
          const delay = this.computeBackoff(attempt, res.headers.get("Retry-After"));
          await this.sleep(delay);
          attempt++;
          continue;
        }
        throw new SellAuthError(data?.message || `HTTP ${res.status}`, {
          status: res.status,
          details: data
        });
      } catch (err) {
        clearTimeout(timeout);
        if (err.name === "AbortError") {
          if (attempt < this.maxRetries) {
            await this.sleep(this.computeBackoff(attempt));
            attempt++;
            continue;
          }
          lastError = new SellAuthError("Request timeout", { code: "TIMEOUT" });
          break;
        }
        if (attempt < this.maxRetries) {
          await this.sleep(this.computeBackoff(attempt));
          attempt++;
          lastError = err;
          continue;
        }
        lastError = err;
        break;
      }
    }
    throw lastError instanceof SellAuthError ? lastError : new SellAuthError(lastError?.message || "Unknown error", {
      details: lastError
    });
  }
  makeUrl(path, query) {
    let full = path.startsWith("http") ? path : `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
    if (query && Object.keys(query).length) {
      const qs = Object.entries(query).filter(([, v]) => v !== void 0 && v !== null).map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(String(v))).join("&");
      if (qs) full += (full.includes("?") ? "&" : "?") + qs;
    }
    return full;
  }
  computeBackoff(attempt, retryAfterHeader) {
    if (retryAfterHeader) {
      const sec = parseFloat(retryAfterHeader);
      if (!isNaN(sec)) return sec * 1e3;
    }
    const base = this.retryDelayBaseMs * Math.pow(2, attempt);
    const jitter = Math.random() * base * 0.2;
    return base + jitter;
  }
  sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
};

// src/sdk/resources/checkout.ts
var CheckoutAPI = class {
  constructor(_http, _shopId) {
    this._http = _http;
    this._shopId = _shopId;
  }
  create(payload) {
    return this._http.request("POST", `/shops/${this._shopId}/checkout`, {
      body: payload
    });
  }
};

// src/sdk/resources/invoices.ts
var InvoicesAPI = class {
  constructor(_http, _shopId) {
    this._http = _http;
    this._shopId = _shopId;
  }
  list(filters) {
    return this._http.request("GET", `/shops/${this._shopId}/invoices`, {
      query: filters
    });
  }
  get(invoiceId) {
    return this._http.request("GET", `/shops/${this._shopId}/invoices/${invoiceId}`);
  }
  archive(invoiceId) {
    return this._http.request("POST", `/shops/${this._shopId}/invoices/${invoiceId}/archive`);
  }
  unarchive(invoiceId) {
    return this._http.request(
      "POST",
      `/shops/${this._shopId}/invoices/${invoiceId}/unarchive`
    );
  }
  cancel(invoiceId) {
    return this._http.request("POST", `/shops/${this._shopId}/invoices/${invoiceId}/cancel`);
  }
  refund(invoiceId) {
    return this._http.request("POST", `/shops/${this._shopId}/invoices/${invoiceId}/refund`);
  }
  unrefund(invoiceId) {
    return this._http.request("POST", `/shops/${this._shopId}/invoices/${invoiceId}/unrefund`);
  }
  pdf(invoiceId) {
    return this._http.request("GET", `/shops/${this._shopId}/invoices/${invoiceId}/pdf`);
  }
  process(invoiceId) {
    return this._http.request("GET", `/shops/${this._shopId}/invoices/${invoiceId}/process`);
  }
  replaceDelivered(invoiceId, payload) {
    return this._http.request(
      "POST",
      `/shops/${this._shopId}/invoices/${invoiceId}/replace-delivered`,
      { body: payload }
    );
  }
};

// src/sdk/resources/products.ts
var ProductsAPI = class {
  constructor(_http, _shopId) {
    this._http = _http;
    this._shopId = _shopId;
  }
  list(params) {
    return this._http.request("GET", `/shops/${this._shopId}/products`, {
      query: params
    });
  }
  create(payload) {
    return this._http.request("POST", `/shops/${this._shopId}/products`, {
      body: payload
    });
  }
  get(productId) {
    return this._http.request("GET", `/shops/${this._shopId}/products/${productId}`);
  }
  update(productId, payload) {
    return this._http.request(
      "PUT",
      `/shops/${this._shopId}/products/${productId}/update`,
      { body: payload }
    );
  }
  delete(productId) {
    return this._http.request(
      "DELETE",
      `/shops/${this._shopId}/products/${productId}`
    );
  }
  clone(productId) {
    return this._http.request(
      "POST",
      `/shops/${this._shopId}/products/${productId}/clone`
    );
  }
  updateStock(productId, variantId, payload) {
    return this._http.request(
      "PUT",
      `/shops/${this._shopId}/products/${productId}/stock/${variantId}`,
      { body: payload }
    );
  }
  deliverables(productId, variantId) {
    return this._http.request(
      "GET",
      `/shops/${this._shopId}/products/${productId}/deliverables/${variantId ?? ""}`
    );
  }
  appendDeliverables(productId, variantId, payload) {
    return this._http.request(
      "PUT",
      `/shops/${this._shopId}/products/${productId}/deliverables/append/${variantId ?? ""}`,
      { body: payload }
    );
  }
  overwriteDeliverables(productId, variantId, payload) {
    return this._http.request(
      "PUT",
      `/shops/${this._shopId}/products/${productId}/deliverables/overwrite/${variantId ?? ""}`,
      { body: payload }
    );
  }
};

// src/sdk/resources/shops.ts
var ShopsAPI = class {
  constructor(_http) {
    this._http = _http;
  }
  list() {
    return this._http.request("GET", "/shops");
  }
  get(shopId) {
    return this._http.request("GET", `/shops/${shopId}`);
  }
  stats(shopId) {
    return this._http.request("GET", `/shops/${shopId}/stats`);
  }
  create(data) {
    const form = new FormData();
    form.append("name", data.name);
    form.append("subdomain", data.subdomain);
    if (data.logo) form.append("logo", data.logo, "logo.png");
    return this._http.request("POST", "/shops/create", { body: form });
  }
  update(shopId, data) {
    return this._http.request("PUT", `/shops/${shopId}/update`, {
      body: data
    });
  }
  delete(shopId, payload) {
    return this._http.request("DELETE", `/shops/${shopId}`, {
      body: payload
    });
  }
};

// src/sdk/client.ts
var SellAuthClient = class {
  constructor(opts) {
    this.opts = opts;
    this.http = new HttpClient(opts);
    this.shops = new ShopsAPI(this.http);
  }
  http;
  shops;
  products(shopId) {
    return new ProductsAPI(this.http, shopId);
  }
  invoices(shopId) {
    return new InvoicesAPI(this.http, shopId);
  }
  checkout(shopId) {
    return new CheckoutAPI(this.http, shopId);
  }
};

// src/sdk/pagination.ts
async function* paginateAll(fetchPage, opts = {}) {
  const pageSize = Math.max(1, Math.min(opts.pageSize ?? 50, 100));
  const maxPages = opts.maxPages ?? Infinity;
  const concurrency = Math.max(1, Math.floor(opts.concurrency ?? 1));
  const stopOnEmpty = opts.stopOnEmpty ?? true;
  const transform = opts.transform ?? ((v, _index) => v);
  const onPage = opts.onPage;
  let page = 1;
  let pagesFetched = 0;
  while (pagesFetched < maxPages) {
    const res = await fetchPage({ page, perPage: pageSize });
    const items = res.data ?? [];
    if (onPage) await onPage(page, items);
    if (items.length === 0 && stopOnEmpty) break;
    if (concurrency <= 1) {
      for (let i = 0; i < items.length; i++) {
        yield await transform(items[i], (page - 1) * pageSize + i);
      }
    } else {
      const mapped = new Array(items.length);
      let idx = 0;
      while (idx < items.length) {
        const batch = items.slice(idx, idx + concurrency);
        const promises = batch.map(
          (it, j) => Promise.resolve(transform(it, (page - 1) * pageSize + idx + j))
        );
        const results = await Promise.all(promises);
        for (let k = 0; k < results.length; k++) mapped[idx + k] = results[k];
        idx += concurrency;
      }
      for (const v of mapped) yield v;
    }
    pagesFetched++;
    page++;
    const lastPage = res.meta?.lastPage ?? res.meta?.last_page;
    if (lastPage !== void 0 && page > lastPage) break;
    const total = res.meta?.total;
    if (total !== void 0) {
      const itemsSeen = pagesFetched * pageSize;
      if (itemsSeen >= total) break;
    }
  }
}
async function fetchAllPages(fetchPage, opts = {}) {
  const out = [];
  for await (const item of paginateAll(fetchPage, { ...opts, transform: void 0 })) {
    out.push(item);
  }
  return out;
}
async function fetchPages(fetchPage, opts = {}) {
  const pages = [];
  const collector = async (_pageNum, items) => {
    pages.push(items);
  };
  await (async () => {
    const gen = paginateAll(fetchPage, { ...opts, onPage: collector, transform: (v) => v });
    for await (const _ of gen) {
    }
  })();
  return pages;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CheckoutAPI,
  HttpClient,
  InvoicesAPI,
  ProductsAPI,
  SellAuthClient,
  SellAuthError,
  ShopsAPI,
  fetchAllPages,
  fetchPages,
  paginateAll
});
//# sourceMappingURL=index.js.map