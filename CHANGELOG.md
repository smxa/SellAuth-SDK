# Changelog

## Unreleased

### Changed
- Retry: switched to symmetric jitter (±20%) for exponential backoff to better distribute retries.
- Logging: `loggerMiddleware` now redacts sensitive headers by default (Authorization, API keys, cookies). Added options for custom sensitive headers, allowlist, and mask function.

## 0.2.0 - 2025-08-30

### Added

- `AdvancedSellAuthClient` providing:
  - Pluggable auth (static api key, dynamic bearer, custom authorize)
  - Configurable retry/backoff (`RetryOptions` with predicate + jittered exponential)
  - Middleware pipeline (auth, logger, retry, parsing, user-defined)
  - Lifecycle hooks: `beforeRequest`, `afterResponse`
  - Custom transport support
  - Extended per-request options (timeout override, responseType)
- Documentation: `docs/advanced-config.md`, `docs/middleware.md`
- Examples: `examples/advanced.ts`, `examples/caching-middleware.ts`

### Changed

- README: Added Advanced Usage section linking to new docs.

### Notes / Internal

- Backwards compatible: existing `SellAuthClient` usage unchanged.
- Internal: lint cleanup (removed unused vars) and clarified middleware ordering docs.
- No runtime breaking changes; minor version bump per semver for additive features.

- Fix: Middleware ordering now runs built-ins before user middleware (auth→logger→retry→responseParsing→user). Previously user middleware executed first; update any middleware relying on pre-auth access.
- Fix: Advanced client header merge now ignores undefined/null values to avoid "undefined" string headers.