export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    lastPage?: number; // some APIs use camelCase
    last_page?: number; // some APIs use snake_case
    [k: string]: any;
  };
}

export interface PageParams {
  page?: number;
  perPage?: number;
}

export interface PaginationOptions<T, R = T> { // generic pagination options
  pageSize?: number;           // requested perPage (default 50)
  maxPages?: number;           // stop after this many pages (default Infinity)
  concurrency?: number;        // concurrency for transform within a page (default 1 - sequential)
  stopOnEmpty?: boolean;       // stop if an empty page is returned (default true)
  transform?: (_item: T, _index?: number) => R | Promise<R>; // map function
  onPage?: (_page: number, _items: T[]) => void | Promise<void>; // hook after each page
}

export async function* paginateAll<T, R = T>(
  fetchPage: (_params: PageParams) => Promise<PaginatedResponse<T>>,
  opts: PaginationOptions<T, R> = {}
): AsyncGenerator<R, void, unknown> {
  const pageSize = Math.max(1, Math.min(opts.pageSize ?? 50, 100)); // clamp 1..100
  const maxPages = opts.maxPages ?? Infinity;
  const concurrency = Math.max(1, Math.floor(opts.concurrency ?? 1));
  const stopOnEmpty = opts.stopOnEmpty ?? true;
  const transform = opts.transform ?? ((v, _index) => v as unknown as R); // default identity; underscore index to satisfy lint
  const onPage = opts.onPage; // optional hook

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
      // map with concurrency while preserving order
      const mapped: R[] = new Array(items.length);
      let idx = 0;
      while (idx < items.length) {
        const batch = items.slice(idx, idx + concurrency);
        const promises = batch.map((it, j) => Promise.resolve(transform(it, (page - 1) * pageSize + idx + j)));
        const results = await Promise.all(promises);
        for (let k = 0; k < results.length; k++) mapped[idx + k] = results[k];
        idx += concurrency;
      }
      for (const v of mapped) yield v;
    }

    pagesFetched++;
    page++;

    // Inspect metadata for early termination
    const lastPage = res.meta?.lastPage ?? res.meta?.last_page;
    if (lastPage !== undefined && page > lastPage) break;

    const total = res.meta?.total;
    if (total !== undefined) {
      const itemsSeen = pagesFetched * pageSize;
      if (itemsSeen >= total) break;
    }
  }
}

export async function fetchAllPages<T>(
  fetchPage: (_params: PageParams) => Promise<PaginatedResponse<T>>,
  opts: PaginationOptions<T, T> = {}
): Promise<T[]> {
  const out: T[] = [];
  for await (const item of paginateAll<T, T>(fetchPage, { ...opts, transform: undefined })) { // item consumed for accumulation
    out.push(item);
  }
  return out;
}

export async function fetchPages<T>(
  fetchPage: (_params: PageParams) => Promise<PaginatedResponse<T>>,
  opts: PaginationOptions<T, T> = {}
): Promise<T[][]> {
  const pages: T[][] = [];
  const collector = async (_pageNum: number, items: T[]) => { pages.push(items); }; // keep for side-effect
  await (async () => { // IIFE to consume generator
    const gen = paginateAll(fetchPage, { ...opts, onPage: collector, transform: v => v });
    for await (const _ of gen) { /* consume to trigger onPage */ } // underscore to mark unused
  })();
  return pages;
}
