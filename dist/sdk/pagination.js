export async function* paginateAll(fetchPage, opts = {}) {
    const pageSize = Math.max(1, Math.min(opts.pageSize ?? 50, 100));
    const maxPages = opts.maxPages ?? Infinity;
    const concurrency = Math.max(1, Math.floor(opts.concurrency ?? 1));
    const stopOnEmpty = opts.stopOnEmpty ?? true;
    const transform = opts.transform ?? (v => v);
    const onPage = opts.onPage;
    let page = 1;
    let pagesFetched = 0;
    while (pagesFetched < maxPages) {
        const res = await fetchPage({ page, perPage: pageSize });
        const items = res.data ?? [];
        if (onPage)
            await onPage(page, items);
        if (items.length === 0 && stopOnEmpty)
            break;
        if (concurrency <= 1) {
            for (let i = 0; i < items.length; i++) {
                yield await transform(items[i], (page - 1) * pageSize + i);
            }
        }
        else {
            // map with concurrency while preserving order
            const mapped = new Array(items.length);
            let idx = 0;
            while (idx < items.length) {
                const batch = items.slice(idx, idx + concurrency);
                const promises = batch.map((it, j) => Promise.resolve(transform(it, (page - 1) * pageSize + idx + j)));
                const results = await Promise.all(promises);
                for (let k = 0; k < results.length; k++)
                    mapped[idx + k] = results[k];
                idx += concurrency;
            }
            for (const v of mapped)
                yield v;
        }
        pagesFetched++;
        page++;
        // Inspect metadata for early termination
        const lastPage = res.meta?.lastPage ?? res.meta?.last_page;
        if (lastPage !== undefined && page > lastPage)
            break;
        const total = res.meta?.total;
        if (total !== undefined) {
            const itemsSeen = pagesFetched * pageSize;
            if (itemsSeen >= total)
                break;
        }
    }
}
export async function fetchAllPages(fetchPage, opts = {}) {
    const out = [];
    for await (const item of paginateAll(fetchPage, { ...opts, transform: undefined })) {
        out.push(item);
    }
    return out;
}
export async function fetchPages(fetchPage, opts = {}) {
    const pages = [];
    const collector = async (_pageNum, items) => { pages.push(items); };
    await (async () => {
        const gen = paginateAll(fetchPage, { ...opts, onPage: collector, transform: v => v });
        for await (const _ of gen) { /* consume to trigger onPage */ }
    })();
    return pages;
}
