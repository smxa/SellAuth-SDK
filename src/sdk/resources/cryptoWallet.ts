import type { RequestFn } from '../core/types';

export interface CryptoPayoutRecord {
  // Shape unknown; using index signature for forward compatibility
  [k: string]: any;
}
export interface CryptoBalanceRecord {
  // e.g. { currency: 'btc', available: number, pending: number }
  [k: string]: any;
}
export interface CryptoTransactionRecord {
  [k: string]: any;
}
export interface CryptoPayoutRequest {
  currency: string; // "btc" | "ltc"
  address: string;
  amount: number;
  [k: string]: any;
}

export class CryptoWalletAPI {
  constructor(
    private readonly _http: { request: RequestFn },
    private readonly _shopId: number | string,
  ) {}

  getPayouts() {
    return this._http.request<CryptoPayoutRecord[]>('GET', `/shops/${this._shopId}/payouts`);
  }
  getBalances() {
    return this._http.request<CryptoBalanceRecord | CryptoBalanceRecord[]>(
      'GET',
      `/shops/${this._shopId}/payouts/balances`,
    );
  }
  payout(body: CryptoPayoutRequest) {
    return this._http.request<any>('POST', `/shops/${this._shopId}/payouts/payout`, { body });
  }
  getTransactions() {
    return this._http.request<CryptoTransactionRecord[]>(
      'GET',
      `/shops/${this._shopId}/payouts/transactions`,
    );
  }
}
