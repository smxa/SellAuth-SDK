Agent Quick Reference (SellAuth Utils)

1. Install deps: pnpm install (Node >=18). Build: pnpm run build (tsup). Clean: pnpm run clean. Lint: pnpm run lint. Format write/check: pnpm run format / format:check.
2. No test suite yet; test build/execution with: pnpm run build && pnpm run test:build. For single example script: node --loader tsx examples/usage.ts (export SELLAUTH_TOKEN first). Add future tests under tests/ with tsx or vitest; run single test via: pnpm vitest run path/to/file.test.ts -t "name" (not yet configured).
3. Exports are authored in TypeScript (strict true). Prefer explicit return types for public functions/classes; allow type inference for locals. Use interfaces for structural contracts, types for unions. Avoid any; if unavoidable wrap in unknown then narrow.
4. Imports: group std (node:fs), external, internal (src/sdk/...), then relative. No wildcard barrel unless intentional (re-export via index.ts). Use type-only imports (import type {...}).
5. Formatting: Prettier (.prettierrc) enforces printWidth 100, singleQuote, semi, trailingComma all, arrowParens always. Run format before commits.
6. ESLint flat config: extends @eslint/js recommended + prettier. Warnings for unused vars; prefix unused with \_ to silence. Add rules in eslint.config.mjs when needed.
7. Error handling: Throw SellAuthError for HTTP / SDK issues; include status, details. Wrap unknown errors into SellAuthError before rethrowing. Do not swallow errors silently; propagate.
8. HTTP retries: only on 408/429/5xx up to maxRetries with exponential jitter backoff. Respect Retry-After if present.
9. Naming: PascalCase for classes (SellAuthClient), camelCase for functions/vars, UPPER_SNAKE for true constants. Files: kebab or camel (current pattern: camelCase for resources, index.ts for barrels).
10. Env usage: API key via process.env.SELLAUTH_TOKEN (never commit secrets). Provide placeholders in examples only.
11. Pagination helpers: prefer paginateAll for streaming, fetchAllPages for aggregation; keep fetchPage signature ({page, perPage}).
12. Middleware order (advanced client): auth -> logger -> retry -> parse -> user middleware; keep pure, no global state.
13. Add new resources under src/sdk/resources, export from resources/index.ts then root index. Provide example + doc link in README.
14. Avoid side effects at import time (library should be tree-shakeable; sideEffects false). No top-level await.
15. Use native fetch (no axios). Abort via AbortController for timeouts; ensure controller cleanup.
16. Prefer small focused functions; limit method length < ~60 LOC. Extract private helpers when complex.
17. Logging: none by default; advanced client may accept logger interface (console-like). Do not add noisy logs elsewhere.
18. Versioning: bump semver + CHANGELOG before publish. Build must pass; run pnpm run test:build to ensure dist valid.
19. Security: never echo API keys; validate user inputs when constructing queries; encodeURIComponent for query params (already in http.ts).
20. Future tests: introduce vitest + tsx. Configure script "test": "vitest"; ensure coverage/ excluded by eslint ignores.
