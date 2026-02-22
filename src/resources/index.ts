/**
 * MCP Resources Registration
 *
 * Registers all available resources with the MCP server.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getSevallaClientOrThrow } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";

export function registerResources(server: McpServer): void {
  // 1. Applications list
  server.registerResource(
    "applications",
    "sevalla://applications",
    {
      title: "Sevalla Applications",
      description: "List all applications for the configured company",
    },
    async (_uri, extra) => {
      const client = getSevallaClientOrThrow(extra);
      const companyId = getCompanyId();
      const params: Record<string, string> = {};
      if (companyId) params["company"] = companyId;

      const result = await client.request<unknown>({
        path: "/applications",
        method: "GET",
        params,
      });

      if (!result.success) {
        throw new Error(
          `Sevalla API Error (${result.error.code}): ${result.error.message}`
        );
      }

      return {
        contents: [
          {
            uri: "sevalla://applications",
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );

  // 2. Application detail (template)
  server.registerResource(
    "application",
    new ResourceTemplate("sevalla://applications/{id}", {
      list: undefined,
    }),
    {
      title: "Application Detail",
      description:
        "Get details of a specific application including deployments and processes",
    },
    async (_uri, variables, extra) => {
      const client = getSevallaClientOrThrow(extra);
      const id = String(variables["id"]);

      const result = await client.request<unknown>({
        path: `/applications/${id}`,
        method: "GET",
      });

      if (!result.success) {
        throw new Error(
          `Sevalla API Error (${result.error.code}): ${result.error.message}`
        );
      }

      return {
        contents: [
          {
            uri: `sevalla://applications/${id}`,
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );

  // 3. Databases list
  server.registerResource(
    "databases",
    "sevalla://databases",
    {
      title: "Sevalla Databases",
      description: "List all databases for the configured company",
    },
    async (_uri, extra) => {
      const client = getSevallaClientOrThrow(extra);
      const companyId = getCompanyId();
      const params: Record<string, string> = {};
      if (companyId) params["company"] = companyId;

      const result = await client.request<unknown>({
        path: "/databases",
        method: "GET",
        params,
      });

      if (!result.success) {
        throw new Error(
          `Sevalla API Error (${result.error.code}): ${result.error.message}`
        );
      }

      return {
        contents: [
          {
            uri: "sevalla://databases",
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );

  // 4. Database detail (template)
  server.registerResource(
    "database",
    new ResourceTemplate("sevalla://databases/{id}", { list: undefined }),
    {
      title: "Database Detail",
      description:
        "Get details of a specific database including connection strings",
    },
    async (_uri, variables, extra) => {
      const client = getSevallaClientOrThrow(extra);
      const id = String(variables["id"]);

      const result = await client.request<unknown>({
        path: `/databases/${id}`,
        method: "GET",
      });

      if (!result.success) {
        throw new Error(
          `Sevalla API Error (${result.error.code}): ${result.error.message}`
        );
      }

      return {
        contents: [
          {
            uri: `sevalla://databases/${id}`,
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );

  // 5. Static Sites list
  server.registerResource(
    "static-sites",
    "sevalla://static-sites",
    {
      title: "Sevalla Static Sites",
      description: "List all static sites for the configured company",
    },
    async (_uri, extra) => {
      const client = getSevallaClientOrThrow(extra);
      const companyId = getCompanyId();
      const params: Record<string, string> = {};
      if (companyId) params["company"] = companyId;

      const result = await client.request<unknown>({
        path: "/static-sites",
        method: "GET",
        params,
      });

      if (!result.success) {
        throw new Error(
          `Sevalla API Error (${result.error.code}): ${result.error.message}`
        );
      }

      return {
        contents: [
          {
            uri: "sevalla://static-sites",
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );

  // 6. Static Site detail (template)
  server.registerResource(
    "static-site",
    new ResourceTemplate("sevalla://static-sites/{id}", { list: undefined }),
    {
      title: "Static Site Detail",
      description:
        "Get details of a specific static site including deployments",
    },
    async (_uri, variables, extra) => {
      const client = getSevallaClientOrThrow(extra);
      const id = String(variables["id"]);

      const result = await client.request<unknown>({
        path: `/static-sites/${id}`,
        method: "GET",
      });

      if (!result.success) {
        throw new Error(
          `Sevalla API Error (${result.error.code}): ${result.error.message}`
        );
      }

      return {
        contents: [
          {
            uri: `sevalla://static-sites/${id}`,
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );

  // 7. Pipelines list
  server.registerResource(
    "pipelines",
    "sevalla://pipelines",
    {
      title: "Sevalla Pipelines",
      description: "List all deployment pipelines with stages",
    },
    async (_uri, extra) => {
      const client = getSevallaClientOrThrow(extra);
      const companyId = getCompanyId();
      const params: Record<string, string> = {};
      if (companyId) params["company"] = companyId;

      const result = await client.request<unknown>({
        path: "/pipelines",
        method: "GET",
        params,
      });

      if (!result.success) {
        throw new Error(
          `Sevalla API Error (${result.error.code}): ${result.error.message}`
        );
      }

      return {
        contents: [
          {
            uri: "sevalla://pipelines",
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );

  // 8. Company Users (template)
  server.registerResource(
    "company-users",
    new ResourceTemplate("sevalla://company/{id}/users", { list: undefined }),
    {
      title: "Company Users",
      description: "List users for a specific company",
    },
    async (_uri, variables, extra) => {
      const client = getSevallaClientOrThrow(extra);
      const id = String(variables["id"]);

      const result = await client.request<unknown>({
        path: `/company/${id}/users`,
        method: "GET",
      });

      if (!result.success) {
        throw new Error(
          `Sevalla API Error (${result.error.code}): ${result.error.message}`
        );
      }

      return {
        contents: [
          {
            uri: `sevalla://company/${id}/users`,
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );
}
