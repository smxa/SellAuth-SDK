import { Transport, TransportResponseLike } from './config';

// Compose multiple AbortSignals into one. Aborts if any aborts.
function composeAbortSignal(signals: (AbortSignal | undefined)[], timeoutMs?: number): { signal: AbortSignal; cleanup(): void; timeoutId?: any } {
  const controller = new AbortController();
  const onAbort = (s: AbortSignal) => {
    if (controller.signal.aborted) return;
    // Preserve reason where supported
    try {
      // @ts-ignore
      controller.abort((s as any).reason || new Error(s.reason instanceof Error ? s.reason.message : 'Aborted'));
    } catch {
      controller.abort();
    }
  };
  const listeners: Array<{ s: AbortSignal; fn: any }> = [];
  for (const s of signals) {
    if (!s) continue;
    if (s.aborted) { onAbort(s); break; }
    const fn = () => onAbort(s);
    s.addEventListener('abort', fn);
    listeners.push({ s, fn });
  }
  let timeoutId: any;
  if (timeoutMs && !controller.signal.aborted) {
    timeoutId = setTimeout(() => {
      if (!controller.signal.aborted) {
        try { controller.abort(new Error(`Timeout after ${timeoutMs}ms`)); } catch { controller.abort(); }
      }
    }, timeoutMs);
  }
  const cleanup = () => {
    for (const { s, fn } of listeners) s.removeEventListener('abort', fn);
    if (timeoutId) clearTimeout(timeoutId);
  };
  return { signal: controller.signal, cleanup, timeoutId };
}

export const fetchTransport: Transport = async (req) => {
  // Prevent bodies on GET/HEAD to avoid proxies rejecting
  const method = req.method.toUpperCase();
  const bodyAllowed = !(method === 'GET' || method === 'HEAD');
  const body = bodyAllowed ? req.body : undefined;
  const { signal, cleanup } = composeAbortSignal([req.signal], req.timeoutMs);
  try {
    const res = await fetch(req.url, {
      method,
      headers: req.headers,
      body,
      signal,
    });
    const wrapped: TransportResponseLike = {
      status: res.status,
      headers: res.headers as any,
      text: () => res.text(),
      ok: (res as any).ok,
    };
    return wrapped;
  } finally {
    cleanup();
  }
};
