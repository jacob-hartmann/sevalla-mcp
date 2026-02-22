# Sevalla MCP Server

[![CI](https://github.com/jacob-hartmann/sevalla-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/jacob-hartmann/sevalla-mcp/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/jacob-hartmann/sevalla-mcp/badge.svg?branch=main)](https://coveralls.io/github/jacob-hartmann/sevalla-mcp?branch=main)
[![CodeQL](https://github.com/jacob-hartmann/sevalla-mcp/actions/workflows/codeql.yml/badge.svg)](https://github.com/jacob-hartmann/sevalla-mcp/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/jacob-hartmann/sevalla-mcp/badge)](https://securityscorecards.dev/viewer/?uri=github.com/jacob-hartmann/sevalla-mcp)
[![npm version](https://img.shields.io/npm/v/sevalla-mcp)](https://www.npmjs.com/package/sevalla-mcp)
[![npm downloads](https://img.shields.io/npm/dm/sevalla-mcp)](https://www.npmjs.com/package/sevalla-mcp)
[![License](https://img.shields.io/github/license/jacob-hartmann/sevalla-mcp)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for the [Sevalla](https://sevalla.com) cloud hosting platform.

Manage your applications, databases, static sites, deployments, pipelines, and more -- all from your AI assistant.

## Quick Start

### Prerequisites

- Node.js v22 or higher
- A Sevalla account with API access
- A Sevalla API key

### Step 1: Get a Sevalla API Key

1. Log in to your [Sevalla](https://sevalla.com) account
2. Navigate to your API key settings
3. Create or copy your API key

### Step 2: Configure Your MCP Client

Choose the setup that matches your MCP client:

#### Claude Desktop (Recommended)

Add to your `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sevalla": {
      "command": "npx",
      "args": ["-y", "sevalla-mcp"],
      "env": {
        "SEVALLA_API_KEY": "your-api-key"
      }
    }
  }
}
```

#### Claude Code (CLI)

Add to your Claude Code MCP settings (`~/.claude/mcp.json` or project-level):

```json
{
  "mcpServers": {
    "sevalla": {
      "command": "npx",
      "args": ["-y", "sevalla-mcp"],
      "env": {
        "SEVALLA_API_KEY": "your-api-key"
      }
    }
  }
}
```

#### Cursor

In Cursor settings, add an MCP server:

```json
{
  "mcpServers": {
    "sevalla": {
      "command": "npx",
      "args": ["-y", "sevalla-mcp"],
      "env": {
        "SEVALLA_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Configuration Reference

### Environment Variables

| Variable             | Required | Default     | Description                            |
| -------------------- | -------- | ----------- | -------------------------------------- |
| `SEVALLA_API_KEY`    | Yes      | -           | Your Sevalla API key                   |
| `SEVALLA_COMPANY_ID` | No       | -           | Default company ID for list operations |
| `MCP_TRANSPORT`      | No       | `stdio`     | Transport mode: `stdio` or `http`      |
| `MCP_SERVER_HOST`    | No       | `127.0.0.1` | Host to bind the HTTP server to        |
| `MCP_SERVER_PORT`    | No       | `3000`      | Port for the HTTP server               |

## Features

- **29 tools** for full Sevalla API v2 coverage
- **8 resources** for browsing applications, databases, static sites, pipelines, and users
- **3 prompts** for guided deployment, database creation, and API key setup workflows
- **Two transport modes**: stdio (default) and HTTP with StreamableHTTP
- **Security hardened**: helmet, rate limiting, CORS, cache control (HTTP mode)
- **Session management**: LRU-based session cache with idle timeout (HTTP mode)

### Tools

#### Validate

| Tool               | Description                                         | Read-only |
| ------------------ | --------------------------------------------------- | --------- |
| `sevalla.validate` | Validate the Sevalla API key and check connectivity | Yes       |

#### Applications

| Tool                           | Description                                       | Read-only |
| ------------------------------ | ------------------------------------------------- | --------- |
| `sevalla.applications.list`    | List all applications for a company               | Yes       |
| `sevalla.applications.get`     | Get details of a specific application             | Yes       |
| `sevalla.applications.update`  | Update an existing application's configuration    | No        |
| `sevalla.applications.delete`  | Permanently delete an application                 | No        |
| `sevalla.applications.promote` | Promote an application from staging to production | No        |

#### Databases

| Tool                       | Description                                 | Read-only |
| -------------------------- | ------------------------------------------- | --------- |
| `sevalla.databases.list`   | List all databases for a company            | Yes       |
| `sevalla.databases.get`    | Get details of a specific database          | Yes       |
| `sevalla.databases.create` | Create a new database                       | No        |
| `sevalla.databases.update` | Update an existing database's configuration | No        |
| `sevalla.databases.delete` | Permanently delete a database               | No        |

#### Deployments

| Tool                        | Description                                 | Read-only |
| --------------------------- | ------------------------------------------- | --------- |
| `sevalla.deployments.get`   | Get details of a specific deployment        | Yes       |
| `sevalla.deployments.start` | Trigger a new deployment for an application | No        |

#### Static Sites

| Tool                                  | Description                                      | Read-only |
| ------------------------------------- | ------------------------------------------------ | --------- |
| `sevalla.static-sites.list`           | List all static sites for a company              | Yes       |
| `sevalla.static-sites.get`            | Get details of a specific static site            | Yes       |
| `sevalla.static-sites.update`         | Update an existing static site's configuration   | No        |
| `sevalla.static-sites.delete`         | Permanently delete a static site                 | No        |
| `sevalla.static-sites.deploy`         | Trigger a new deployment for a static site       | No        |
| `sevalla.static-sites.get-deployment` | Get details of a specific static site deployment | Yes       |

#### Processes

| Tool                       | Description                                   | Read-only |
| -------------------------- | --------------------------------------------- | --------- |
| `sevalla.processes.get`    | Get details of a specific application process | Yes       |
| `sevalla.processes.update` | Update an application process configuration   | No        |

#### Networking

| Tool                                            | Description                                                     | Read-only |
| ----------------------------------------------- | --------------------------------------------------------------- | --------- |
| `sevalla.networking.clear-cache`                | Clear the cache for an application                              | No        |
| `sevalla.networking.create-internal-connection` | Create an internal connection between applications or databases | No        |
| `sevalla.networking.toggle-cdn`                 | Enable or disable CDN for an application                        | No        |
| `sevalla.networking.toggle-edge-cache`          | Enable or disable edge caching for an application               | No        |

#### Pipelines

| Tool                                   | Description                                  | Read-only |
| -------------------------------------- | -------------------------------------------- | --------- |
| `sevalla.pipelines.list`               | List all deployment pipelines for a company  | Yes       |
| `sevalla.pipelines.create-preview-app` | Create a preview application from a pipeline | No        |

#### Company

| Tool                    | Description                              | Read-only |
| ----------------------- | ---------------------------------------- | --------- |
| `sevalla.company.users` | List all users for a company             | Yes       |
| `sevalla.company.usage` | Get PaaS usage information for a company | Yes       |

### Resources

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

### Prompts

| Prompt               | Description                                      |
| -------------------- | ------------------------------------------------ |
| `deploy-application` | Guided workflow for deploying an application     |
| `create-database`    | Guided workflow for creating a new database      |
| `setup-api-key`      | Instructions for configuring the Sevalla API key |

## Development

### Setup

```bash
# Clone the repo
git clone https://github.com/jacob-hartmann/sevalla-mcp.git
cd sevalla-mcp

# Use the Node.js version from .nvmrc
# (macOS/Linux nvm): nvm install && nvm use
# (Windows nvm-windows): nvm install 22 && nvm use 22
nvm install
nvm use

# Install dependencies
pnpm install

# Copy .env.example and configure
cp .env.example .env
# Edit .env with your API key
```

### Running Locally

```bash
# Development mode (auto-reload)
pnpm dev

# Production build
pnpm build

# Production run
pnpm start
```

### Debugging

You can use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) to debug the server:

```bash
# Run from source
pnpm inspect

# Run from built output
pnpm inspect:dist
```

`pnpm inspect` loads `.env` automatically via `dotenv` (see `.env.example`).

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Security

See [SECURITY.md](./SECURITY.md) for security policy and reporting vulnerabilities.

## Support

This is a community project provided "as is" with **no guaranteed support**. See [SUPPORT.md](./SUPPORT.md) for details.

## License

MIT © Jacob Hartmann
