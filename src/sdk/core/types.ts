import type { NormalizedRequest, TransportResponseLike } from './config';

export type RequestFn = <T=any>(_method: string, _path: string, _opts?: {
  query?: Record<string, any>;
  body?: any;
  headers?: Record<string,string>;
  signal?: AbortSignal;
  timeoutMs?: number;
  responseType?: 'json' | 'text' | 'raw';
}) => Promise<T>;

// Re-export minimal transport response like for advanced external typing without exposing global Response
export type { TransportResponseLike, NormalizedRequest };
