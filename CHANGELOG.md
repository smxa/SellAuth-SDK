# Changelog

## 0.3.1 - 2025-08-30

### Changed

- CI: Upgraded to pnpm 10.15.0 and aligned `packageManager` field; replaced deprecated `pnpm pack --dry-run` with modern `--json` flow.
- CI: Added artifact packaging step (tarball) and verification of built dist presence.
- Lint: Migrated ignore patterns into flat config; added `@eslint/js` dependency to satisfy flat config base rules.

### Added

- Publish workflow guard: early failure if `NPM_TOKEN` not provided.

### Internal

- Regenerated lockfile after dependency / toolchain adjustments.

## 0.3.0 - 2025-08-30

### Changed

- Package scoped to `@wtfservices/sellauth-utils` (was `sellauth-utils`).
- Build pipeline simplified: migrated to `tsup` dual output (CJS + ESM) with type declarations & sourcemaps.
- Removed custom ESM patch script and secondary CommonJS tsconfig.
- Updated README and docs to use scoped imports.

### Added

- Conditional `exports` map providing proper `import`/`require` entrypoints.
- Type check step and pnpm caching improvements in CI.

### Removed

- Legacy patch script (`scripts/patch-esm.mjs`) and `tsconfig.cjs.json`.

## 0.2.1 - 2025-08-30

### Changed

- Retry: switched to symmetric jitter (±20%) for exponential backoff to better distribute retries.
- Logging: `loggerMiddleware` now redacts sensitive headers by default (Authorization, API keys, cookies). Added options for custom sensitive headers, allowlist, and mask function.
- README overhauled for public release (install, security, advanced usage, release process).

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

### Notes

- Backwards compatible: existing `SellAuthClient` usage unchanged.
- Lint cleanup (removed unused vars) and clarified middleware ordering docs.

- No runtime breaking changes; minor version bump per semver for additive features.

- Fix: Middleware ordering now runs built-ins before user middleware (auth→logger→retry→responseParsing→user). Previously user middleware executed first; update any middleware relying on pre-auth access.
- Fix: Advanced client header merge now ignores undefined/null values to avoid "undefined" string headers.
