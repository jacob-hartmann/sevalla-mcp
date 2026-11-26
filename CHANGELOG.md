# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

### Security

## [1.0.1] - 2026-11-26

Dependency-only maintenance release. No changes to tools, resources, prompts, or server instructions.

### Changed

- Updated runtime dependencies within their current major versions: `@modelcontextprotocol/sdk` 1.32.2, `zod` 4.6.7, `express` 5.3, `express-rate-limit` 8.7, `helmet` 8.3, `dotenv` 17.4.
- HTTP transport: the rate limiter now uses express-rate-limit's `limit` option (renamed from `max` in v7). Behavior is unchanged.

### Security

- Resolved all known advisories in production dependencies (`pnpm audit --prod`: 75 → 0). This covers `@modelcontextprotocol/sdk`, `zod`, express's transitive dependencies (`path-to-regexp`, `proxy-addr`, `body-parser`, `qs`), `ip-address`, `hono`, and `fast-uri`.

## [1.0.0] - 2026-03-12

### Added

- Migrated to Sevalla API v3 with expanded tool coverage

### Fixed

- Added missing company ID validation to all company-scoped tools
- Fixed minimatch override to resolve ReDoS vulnerabilities (CVE)
- Achieved 100% test coverage and fixed vulnerable dependencies

## [0.1.0] - 2026-02-22

### Added

- Initial release of the Sevalla MCP server.
- **29 MCP tools** covering applications, deployments, processes, networking, databases, static sites, pipelines, and company management.
- **8 MCP resources** for browsing Sevalla infrastructure.
- **3 MCP prompts** for guided deployment, database creation, and API key setup workflows.
- HTTP (Streamable HTTP) and stdio transport modes.
- Bearer token authentication via `SEVALLA_API_KEY`.
