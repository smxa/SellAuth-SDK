interface SellAuthClientOptions {
    apiKey: string;
    baseUrl?: string;
    userAgent?: string;
    timeoutMs?: number;
    maxRetries?: number;
    retryDelayBaseMs?: number;
}
declare class SellAuthError extends Error {
    status?: number;
    code?: string;
    details?: any;
    constructor(message: string, opts?: {
        status?: number;
        code?: string;
        details?: any;
    });
}
declare class HttpClient {
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

type RequestFn = <T = any>(_method: string, _path: string, _opts?: {
    query?: Record<string, any>;
    body?: any;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    timeoutMs?: number;
    responseType?: 'json' | 'text' | 'raw';
}) => Promise<T>;

interface CheckoutSession {
    success: boolean;
    invoice_id: number;
    invoice_url: string;
    url?: string;
    [k: string]: any;
}
declare class CheckoutAPI {
    private readonly _http;
    private readonly _shopId;
    constructor(_http: {
        request: RequestFn;
    }, _shopId: number | string);
    create(payload: Record<string, any>): Promise<CheckoutSession>;
}

interface Invoice {
    id: number;
    status?: string;
    total?: number;
    currency?: string;
    [k: string]: any;
}
declare class InvoicesAPI {
    private readonly _http;
    private readonly _shopId;
    constructor(_http: {
        request: RequestFn;
    }, _shopId: number | string);
    list(filters?: Record<string, any>): Promise<Invoice[]>;
    get(invoiceId: number | string): Promise<Invoice>;
    archive(invoiceId: number | string): Promise<any>;
    unarchive(invoiceId: number | string): Promise<any>;
    cancel(invoiceId: number | string): Promise<any>;
    refund(invoiceId: number | string): Promise<any>;
    unrefund(invoiceId: number | string): Promise<any>;
    pdf(invoiceId: number | string): Promise<any>;
    process(invoiceId: number | string): Promise<any>;
    replaceDelivered(invoiceId: number | string, payload: {
        invoice_item_id: number;
        replacements: Record<string, any>;
    }): Promise<any>;
}

interface ProductVariant {
    id?: number;
    name?: string;
    price?: number;
    stock?: number;
    [k: string]: any;
}
interface Product {
    id: number;
    name: string;
    type?: string;
    currency?: string;
    visibility?: string;
    variants?: ProductVariant[];
    [k: string]: any;
}
declare class ProductsAPI {
    private readonly _http;
    private readonly _shopId;
    constructor(_http: {
        request: RequestFn;
    }, _shopId: number | string);
    list(params?: Record<string, any>): Promise<Product[]>;
    create(payload: Record<string, any>): Promise<Product>;
    get(productId: number | string): Promise<Product>;
    update(productId: number | string, payload: Record<string, any>): Promise<Product>;
    delete(productId: number | string): Promise<{
        success?: boolean;
    }>;
    clone(productId: number | string): Promise<Product>;
    updateStock(productId: number | string, variantId: number | string, payload: {
        stock?: number;
        delta?: number;
    }): Promise<any>;
    deliverables(productId: number | string, variantId?: number | string): Promise<any>;
    appendDeliverables(productId: number | string, variantId: number | string | undefined, payload: any): Promise<any>;
    overwriteDeliverables(productId: number | string, variantId: number | string | undefined, payload: any): Promise<any>;
}

interface Shop {
    id: number;
    name: string;
    subdomain?: string;
    url?: string;
    plan?: string;
    [k: string]: any;
}
declare class ShopsAPI {
    private readonly _http;
    constructor(_http: {
        request: RequestFn;
    });
    list(): Promise<Shop>;
    get(shopId: number | string): Promise<Shop>;
    stats(shopId: number | string): Promise<any>;
    create(data: {
        name: string;
        subdomain: string;
        logo?: File | Blob;
    }): Promise<Shop>;
    update(shopId: number | string, data: Record<string, any>): Promise<Shop>;
    delete(shopId: number | string, payload: {
        password: string;
        name: string;
    }): Promise<{
        success?: boolean;
    }>;
}

declare class SellAuthClient {
    private readonly opts;
    readonly http: HttpClient;
    readonly shops: ShopsAPI;
    constructor(opts: SellAuthClientOptions);
    products(shopId: number | string): ProductsAPI;
    invoices(shopId: number | string): InvoicesAPI;
    checkout(shopId: number | string): CheckoutAPI;
}

interface PaginatedResponse<T> {
    data: T[];
    meta?: {
        page?: number;
        perPage?: number;
        total?: number;
        lastPage?: number;
        last_page?: number;
        [k: string]: any;
    };
}
interface PageParams {
    page?: number;
    perPage?: number;
}
interface PaginationOptions<T, R = T> {
    pageSize?: number;
    maxPages?: number;
    concurrency?: number;
    stopOnEmpty?: boolean;
    transform?: (_item: T, _index?: number) => R | Promise<R>;
    onPage?: (_page: number, _items: T[]) => void | Promise<void>;
}
declare function paginateAll<T, R = T>(fetchPage: (_params: PageParams) => Promise<PaginatedResponse<T>>, opts?: PaginationOptions<T, R>): AsyncGenerator<R, void, unknown>;
declare function fetchAllPages<T>(fetchPage: (_params: PageParams) => Promise<PaginatedResponse<T>>, opts?: PaginationOptions<T, T>): Promise<T[]>;
declare function fetchPages<T>(fetchPage: (_params: PageParams) => Promise<PaginatedResponse<T>>, opts?: PaginationOptions<T, T>): Promise<T[][]>;

export { CheckoutAPI, type CheckoutSession, HttpClient, type Invoice, InvoicesAPI, type PageParams, type PaginatedResponse, type PaginationOptions, type Product, type ProductVariant, ProductsAPI, SellAuthClient, type SellAuthClientOptions, SellAuthError, type Shop, ShopsAPI, fetchAllPages, fetchPages, paginateAll };
