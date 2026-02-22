/**
 * Sevalla Database Tools
 *
 * Tools for managing Sevalla databases.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  buildParams,
  sevallaOutputSchema,
} from "./utils.js";

export function registerDatabaseTools(server: McpServer): void {
  // sevalla.databases.list
  server.registerTool(
    "sevalla.databases.list",
    {
      title: "List Databases",
      description: "List all databases for a company.",
      inputSchema: z.object({
        company: z
          .uuid()
          .optional()
          .describe("Company UUID (defaults to SEVALLA_COMPANY_ID env var)"),
        limit: z
          .number()
          .min(1)
          .max(100)
          .optional()
          .describe("Maximum number of results (1-100)"),
        offset: z
          .number()
          .min(0)
          .optional()
          .describe("Number of results to skip"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const companyId = args.company ?? getCompanyId();
      const params = buildParams({
        company: companyId,
        limit: args.limit?.toString(),
        offset: args.offset?.toString(),
      });

      const result = await clientResult.client.request<unknown>({
        path: "/databases",
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "database");
      return formatSuccess(result.data);
    }
  );

  // sevalla.databases.get
  server.registerTool(
    "sevalla.databases.get",
    {
      title: "Get Database",
      description: "Get details of a specific database.",
      inputSchema: z.object({
        id: z.uuid().describe("Database UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/databases/${args.id}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "database");
      return formatSuccess(result.data);
    }
  );

  // sevalla.databases.create
  server.registerTool(
    "sevalla.databases.create",
    {
      title: "Create Database",
      description: "Create a new database.",
      inputSchema: z.object({
        company: z
          .uuid()
          .optional()
          .describe("Company UUID (defaults to SEVALLA_COMPANY_ID env var)"),
        display_name: z.string().describe("Display name for the database"),
        type: z
          .enum([
            "postgresql",
            "mariadb",
            "mysql",
            "mongodb",
            "redis",
            "valkey",
          ])
          .describe("Database engine type"),
        version: z.string().optional().describe("Database engine version"),
        location: z
          .string()
          .optional()
          .describe("Data center location identifier"),
        resource_type: z
          .string()
          .optional()
          .describe("Resource type/size identifier"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const companyId = args.company ?? getCompanyId();
      const body = buildParams({
        company: companyId,
        display_name: args.display_name,
        type: args.type,
        version: args.version,
        location: args.location,
        resource_type: args.resource_type,
      });

      const result = await clientResult.client.request<unknown>({
        path: "/databases",
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "database");
      return formatSuccess(result.data);
    }
  );

  // sevalla.databases.update
  server.registerTool(
    "sevalla.databases.update",
    {
      title: "Update Database",
      description: "Update an existing database's configuration.",
      inputSchema: z.object({
        id: z.uuid().describe("Database UUID"),
        display_name: z.string().optional().describe("New display name"),
        resource_type: z.string().optional().describe("New resource type/size"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body = buildParams({
        display_name: args.display_name,
        resource_type: args.resource_type,
      });

      const result = await clientResult.client.request<unknown>({
        path: `/databases/${args.id}`,
        method: "PUT",
        body,
      });

      if (!result.success) return formatError(result.error, "database");
      return formatSuccess(result.data);
    }
  );

  // sevalla.databases.delete
  server.registerTool(
    "sevalla.databases.delete",
    {
      title: "Delete Database",
      description:
        "Permanently delete a database. This action cannot be undone.",
      inputSchema: z.object({
        id: z.uuid().describe("Database UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: {
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/databases/${args.id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "database");
      return formatSuccess(result.data);
    }
  );
}
