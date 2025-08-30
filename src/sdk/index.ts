// Public simple SDK surface (stable)
export { SellAuthClient } from './client';
export type { SellAuthClientOptions } from './core/http';

// Re-export advanced client for backwards compatibility (still available here)
export { AdvancedSellAuthClient } from './client-advanced';
export type { SellAuthAdvancedConfig } from './core/config';

// Selected core types (explicit)
export { SellAuthError, HttpClient } from './core/http';
export { normalizeConfig } from './core/config';
