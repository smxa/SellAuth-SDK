import { NormalizedRequest, Transport, TransportResponseLike } from './config';

export const fetchTransport: Transport = async (req) => {
  const controller = new AbortController();
  const timeout = req.timeoutMs ? setTimeout(() => controller.abort(), req.timeoutMs) : null;
  try {
    const res = await fetch(req.url, {
      method: req.method,
      headers: req.headers,
      body: req.body,
      signal: req.signal || controller.signal,
    });
    const wrapped: TransportResponseLike = {
      status: res.status,
      headers: res.headers as any,
      text: () => res.text(),
      ok: (res as any).ok,
    };
    return wrapped;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};
