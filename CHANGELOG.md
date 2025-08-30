# Changelog

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
- Internal: tightened lint (no unused vars), clarified middleware ordering docs.
- No runtime breaking changes; minor version bump per semver for additive features.
