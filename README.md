# sevalla-mcp

[![npm version](https://img.shields.io/npm/v/sevalla-mcp.svg)](https://www.npmjs.com/package/sevalla-mcp)
[![CI](https://github.com/jacob-hartmann/sevalla-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/jacob-hartmann/sevalla-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Coverage](https://img.shields.io/codecov/c/github/jacob-hartmann/sevalla-mcp)](https://codecov.io/gh/jacob-hartmann/sevalla-mcp)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for the [Sevalla](https://sevalla.com) cloud hosting platform.

Manage your applications, databases, static sites, deployments, pipelines, and more -- all from your AI assistant.

## Features

- **29 tools** for full Sevalla API v2 coverage
- **8 resources** for browsing applications, databases, static sites, pipelines, and users
- **3 prompts** for guided deployment, database creation, and API key setup workflows
- **Two transport modes**: stdio (default) and HTTP with StreamableHTTP
- **Security hardened**: helmet, rate limiting, CORS, cache control (HTTP mode)
- **Session management**: LRU-based session cache with idle timeout (HTTP mode)

## Quick Start

### Using npx (no install required)

```bash
SEVALLA_API_KEY=your_key_here npx sevalla-mcp
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sevalla": {
      "command": "npx",
      "args": ["-y", "sevalla-mcp"],
      "env": {
        "SEVALLA_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Cursor

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "sevalla": {
      "command": "npx",
      "args": ["-y", "sevalla-mcp"],
      "env": {
        "SEVALLA_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Environment Variables

| Variable             | Required | Default     | Description                            |
| -------------------- | -------- | ----------- | -------------------------------------- |
| `SEVALLA_API_KEY`    | Yes      | --          | Your Sevalla API key                   |
| `SEVALLA_COMPANY_ID` | No       | --          | Default company ID for list operations |
| `MCP_TRANSPORT`      | No       | `stdio`     | Transport mode: `stdio` or `http`      |
| `MCP_SERVER_HOST`    | No       | `127.0.0.1` | Host to bind the HTTP server to        |
| `MCP_SERVER_PORT`    | No       | `3000`      | Port for the HTTP server               |

## Available Tools

### Validate

| Tool               | Description                                         | Read-only |
| ------------------ | --------------------------------------------------- | --------- |
| `sevalla.validate` | Validate the Sevalla API key and check connectivity | Yes       |

### Applications

| Tool                           | Description                                       | Read-only |
| ------------------------------ | ------------------------------------------------- | --------- |
| `sevalla.applications.list`    | List all applications for a company               | Yes       |
| `sevalla.applications.get`     | Get details of a specific application             | Yes       |
| `sevalla.applications.update`  | Update an existing application's configuration    | No        |
| `sevalla.applications.delete`  | Permanently delete an application                 | No        |
| `sevalla.applications.promote` | Promote an application from staging to production | No        |

### Databases

| Tool                       | Description                                 | Read-only |
| -------------------------- | ------------------------------------------- | --------- |
| `sevalla.databases.list`   | List all databases for a company            | Yes       |
| `sevalla.databases.get`    | Get details of a specific database          | Yes       |
| `sevalla.databases.create` | Create a new database                       | No        |
| `sevalla.databases.update` | Update an existing database's configuration | No        |
| `sevalla.databases.delete` | Permanently delete a database               | No        |

### Deployments

| Tool                        | Description                                 | Read-only |
| --------------------------- | ------------------------------------------- | --------- |
| `sevalla.deployments.get`   | Get details of a specific deployment        | Yes       |
| `sevalla.deployments.start` | Trigger a new deployment for an application | No        |

### Static Sites

| Tool                                  | Description                                      | Read-only |
| ------------------------------------- | ------------------------------------------------ | --------- |
| `sevalla.static-sites.list`           | List all static sites for a company              | Yes       |
| `sevalla.static-sites.get`            | Get details of a specific static site            | Yes       |
| `sevalla.static-sites.update`         | Update an existing static site's configuration   | No        |
| `sevalla.static-sites.delete`         | Permanently delete a static site                 | No        |
| `sevalla.static-sites.deploy`         | Trigger a new deployment for a static site       | No        |
| `sevalla.static-sites.get-deployment` | Get details of a specific static site deployment | Yes       |

### Processes

| Tool                       | Description                                   | Read-only |
| -------------------------- | --------------------------------------------- | --------- |
| `sevalla.processes.get`    | Get details of a specific application process | Yes       |
| `sevalla.processes.update` | Update an application process configuration   | No        |

### Networking

| Tool                                            | Description                                                     | Read-only |
| ----------------------------------------------- | --------------------------------------------------------------- | --------- |
| `sevalla.networking.clear-cache`                | Clear the cache for an application                              | No        |
| `sevalla.networking.create-internal-connection` | Create an internal connection between applications or databases | No        |
| `sevalla.networking.toggle-cdn`                 | Enable or disable CDN for an application                        | No        |
| `sevalla.networking.toggle-edge-cache`          | Enable or disable edge caching for an application               | No        |

### Pipelines

| Tool                                   | Description                                  | Read-only |
| -------------------------------------- | -------------------------------------------- | --------- |
| `sevalla.pipelines.list`               | List all deployment pipelines for a company  | Yes       |
| `sevalla.pipelines.create-preview-app` | Create a preview application from a pipeline | No        |

### Company

| Tool                    | Description                              | Read-only |
| ----------------------- | ---------------------------------------- | --------- |
| `sevalla.company.users` | List all users for a company             | Yes       |
| `sevalla.company.usage` | Get PaaS usage information for a company | Yes       |

## Resources

| Resource           | URI                            | Description                                      |
| ------------------ | ------------------------------ | ------------------------------------------------ |
| Applications       | `sevalla://applications`       | List all applications for the configured company |
| Application Detail | `sevalla://applications/{id}`  | Get details of a specific application            |
| Databases          | `sevalla://databases`          | List all databases for the configured company    |
| Database Detail    | `sevalla://databases/{id}`     | Get details of a specific database               |
| Static Sites       | `sevalla://static-sites`       | List all static sites for the configured company |
| Static Site Detail | `sevalla://static-sites/{id}`  | Get details of a specific static site            |
| Pipelines          | `sevalla://pipelines`          | List all deployment pipelines with stages        |
| Company Users      | `sevalla://company/{id}/users` | List users for a specific company                |

## Prompts

| Prompt               | Description                                      |
| -------------------- | ------------------------------------------------ |
| `deploy-application` | Guided workflow for deploying an application     |
| `create-database`    | Guided workflow for creating a new database      |
| `setup-api-key`      | Instructions for configuring the Sevalla API key |

## Development

### Prerequisites

- Node.js >= 22
- pnpm

### Setup

```bash
git clone https://github.com/jacob-hartmann/sevalla-mcp.git
cd sevalla-mcp
pnpm install
```

### Scripts

```bash
pnpm dev              # Run in dev mode (stdio transport, auto-reload)
pnpm dev:http         # Run in dev mode (HTTP transport, auto-reload)
pnpm build            # Build for production
pnpm start            # Run production build (stdio)
pnpm start:http       # Run production build (HTTP)
pnpm inspect          # Launch MCP Inspector
pnpm lint             # Lint with ESLint
pnpm lint:fix         # Lint and auto-fix
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting
pnpm typecheck        # TypeScript type checking
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage
pnpm check            # Run all checks (typecheck + lint + format + test)
```

### HTTP Transport Mode

To run in HTTP mode:

```bash
MCP_TRANSPORT=http pnpm dev:http
```

The server will start on `http://127.0.0.1:3000/mcp` by default.

## License

MIT © Jacob Hartmann
