export interface PaginatedResponse<T> {
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
export interface PageParams {
    page?: number;
    perPage?: number;
}
export interface PaginationOptions<T, R = T> {
    pageSize?: number;
    maxPages?: number;
    concurrency?: number;
    stopOnEmpty?: boolean;
    transform?: (item: T, index?: number) => R | Promise<R>;
    onPage?: (page: number, items: T[]) => void | Promise<void>;
}
export declare function paginateAll<T, R = T>(fetchPage: (params: PageParams) => Promise<PaginatedResponse<T>>, opts?: PaginationOptions<T, R>): AsyncGenerator<R, void, unknown>;
export declare function fetchAllPages<T>(fetchPage: (params: PageParams) => Promise<PaginatedResponse<T>>, opts?: PaginationOptions<T, T>): Promise<T[]>;
export declare function fetchPages<T>(fetchPage: (params: PageParams) => Promise<PaginatedResponse<T>>, opts?: PaginationOptions<T, T>): Promise<T[][]>;
