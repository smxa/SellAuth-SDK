export class SellAuthError extends Error {
    status;
    code;
    details;
    constructor(message, opts = {}) {
        super(message);
        this.name = "SellAuthError";
        Object.assign(this, opts);
    }
}
export class HttpClient {
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
        this.timeoutMs = opts.timeoutMs ?? 15000;
        this.maxRetries = Math.max(0, opts.maxRetries ?? 3);
        this.retryDelayBaseMs = opts.retryDelayBaseMs ?? 300;
    }
    async request(method, path, init = {}) {
        const url = this.makeUrl(path, init.query);
        const headers = {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: "application/json",
            "User-Agent": this.userAgent,
            ...init.headers,
        };
        let body;
        if (init.body !== undefined &&
            init.body !== null &&
            !(init.body instanceof FormData)) {
            headers["Content-Type"] = headers["Content-Type"] || "application/json";
            body = JSON.stringify(init.body);
        }
        else if (init.body instanceof FormData) {
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
                    signal: init.signal ?? controller.signal,
                });
                clearTimeout(timeout);
                if (res.status === 204)
                    return undefined;
                const text = await res.text();
                let data = undefined;
                try {
                    data = text ? JSON.parse(text) : undefined;
                }
                catch {
                    data = text;
                }
                if (res.ok)
                    return data;
                // Retry logic on retriable status codes
                if ([408, 429, 500, 502, 503, 504].includes(res.status) &&
                    attempt < this.maxRetries) {
                    const delay = this.computeBackoff(attempt, res.headers.get("Retry-After"));
                    await this.sleep(delay);
                    attempt++;
                    continue;
                }
                throw new SellAuthError(data?.message || `HTTP ${res.status}`, {
                    status: res.status,
                    details: data,
                });
            }
            catch (err) {
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
                // Network / fetch error
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
        throw lastError instanceof SellAuthError
            ? lastError
            : new SellAuthError(lastError?.message || "Unknown error", {
                details: lastError,
            });
    }
    makeUrl(path, query) {
        let full = path.startsWith("http")
            ? path
            : `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
        if (query && Object.keys(query).length) {
            const qs = Object.entries(query)
                .filter(([, v]) => v !== undefined && v !== null)
                .map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(String(v)))
                .join("&");
            if (qs)
                full += (full.includes("?") ? "&" : "?") + qs;
        }
        return full;
    }
    computeBackoff(attempt, retryAfterHeader) {
        if (retryAfterHeader) {
            const sec = parseFloat(retryAfterHeader);
            if (!isNaN(sec))
                return sec * 1000;
        }
        const base = this.retryDelayBaseMs * Math.pow(2, attempt);
        const jitter = Math.random() * base * 0.2; // +-20%
        return base + jitter;
    }
    sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }
}
