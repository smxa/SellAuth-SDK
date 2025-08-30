export interface SellAuthClientOptions {
    apiKey: string;
    baseUrl?: string;
    userAgent?: string;
    timeoutMs?: number;
    maxRetries?: number;
    retryDelayBaseMs?: number;
}
export declare class SellAuthError extends Error {
    status?: number;
    code?: string;
    details?: any;
    constructor(message: string, opts?: {
        status?: number;
        code?: string;
        details?: any;
    });
}
export declare class HttpClient {
    private apiKey;
    private baseUrl;
    private userAgent;
    private timeoutMs;
    private maxRetries;
    private retryDelayBaseMs;
    constructor(opts: SellAuthClientOptions);
    request<T>(method: string, path: string, init?: {
        query?: Record<string, any>;
        body?: any;
        headers?: Record<string, string>;
        signal?: AbortSignal;
    }): Promise<T>;
    private makeUrl;
    private computeBackoff;
    private sleep;
}
