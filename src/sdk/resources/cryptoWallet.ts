import type { RequestFn } from '../core/types';

/**
 * Individual payout history entry.
 * API docs: https://docs.sellauth.com/api-documentation/crypto--wallet#get-payouts
 * The public docs do not currently enumerate the response shape; keeping extensible.
 */
export interface CryptoPayoutRecord {
  id?: number | string;
  currency?: CryptoPayoutCurrency;
  amount?: number;
  txid?: string | null;
  address?: string;
  created_at?: string;
  status?: string; // e.g. 'pending' | 'completed' | 'failed' (not documented, speculative)
  [k: string]: any;
}

/**
 * Balance information for one currency.
 * API docs: https://docs.sellauth.com/api-documentation/crypto--wallet#get-balances
 */
export interface CryptoBalanceRecord {
  currency: CryptoPayoutCurrency | string;
  /** Funds available for payout */
  available?: number;
  /** Funds currently pending / unconfirmed */
  pending?: number;
  /** Raw additional fields */
  [k: string]: any;
}

/**
 * A single transaction entry for the crypto wallet history.
 * API docs: https://docs.sellauth.com/api-documentation/crypto--wallet#get-transactions
 */
export interface CryptoTransactionRecord {
  id?: number | string;
  currency?: CryptoPayoutCurrency;
  amount?: number;
  type?: string; // deposit | withdrawal | adjustment (speculative)
  created_at?: string;
  txid?: string | null;
  [k: string]: any;
}

/** Allowed payout currency codes accepted by the API */
export type CryptoPayoutCurrency = 'btc' | 'ltc';

/**
 * Request body for initiating a payout.
 * API docs: https://docs.sellauth.com/api-documentation/crypto--wallet#payout
 */
export interface CryptoPayoutRequest {
  currency: CryptoPayoutCurrency;
  address: string;
  amount: number;
}

/**
 * Crypto wallet operations for payouts, balances, and transactions.
 * Docs: https://docs.sellauth.com/api-documentation/crypto--wallet
 */
export class CryptoWalletAPI {
  constructor(
    private readonly _http: { request: RequestFn },
    private readonly _shopId: number | string,
  ) {}

  /** Retrieve payout history */
  getPayouts() {
    return this._http.request<CryptoPayoutRecord[]>('GET', `/shops/${this._shopId}/payouts`);
  }
  /** Retrieve current wallet balances */
  getBalances() {
    return this._http.request<CryptoBalanceRecord | CryptoBalanceRecord[]>(
      'GET',
      `/shops/${this._shopId}/payouts/balances`,
    );
  }
  /** Create a payout from the wallet */
  payout(body: CryptoPayoutRequest) {
    return this._http.request<CryptoPayoutRecord | { success?: boolean }>(
      'POST',
      `/shops/${this._shopId}/payouts/payout`,
      { body },
    );
  }
  /** Retrieve wallet transaction history */
  getTransactions() {
    return this._http.request<CryptoTransactionRecord[]>(
      'GET',
      `/shops/${this._shopId}/payouts/transactions`,
    );
  }
}
