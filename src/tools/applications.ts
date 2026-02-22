/**
 * Sevalla Application Tools
 *
 * Tools for managing Sevalla applications.
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

export function registerApplicationTools(server: McpServer): void {
  // sevalla.applications.list
  server.registerTool(
    "sevalla.applications.list",
    {
      title: "List Applications",
      description: "List all applications for a company.",
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
        path: "/applications",
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "application");
      return formatSuccess(result.data);
    }
  );

  // sevalla.applications.get
  server.registerTool(
    "sevalla.applications.get",
    {
      title: "Get Application",
      description: "Get details of a specific application.",
      inputSchema: z.object({
        id: z.uuid().describe("Application UUID"),
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
        path: `/applications/${args.id}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "application");
      return formatSuccess(result.data);
    }
  );

  // sevalla.applications.update
  server.registerTool(
    "sevalla.applications.update",
    {
      title: "Update Application",
      description: "Update an existing application's configuration.",
      inputSchema: z.object({
        id: z.uuid().describe("Application UUID"),
        display_name: z
          .string()
          .optional()
          .describe("New display name for the application"),
        note: z
          .string()
          .optional()
          .describe("Note or description for the application"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: {
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body = buildParams({
        display_name: args.display_name,
        note: args.note,
      });

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.id}`,
        method: "PUT",
        body,
      });

      if (!result.success) return formatError(result.error, "application");
      return formatSuccess(result.data);
    }
  );

  // sevalla.applications.delete
  server.registerTool(
    "sevalla.applications.delete",
    {
      title: "Delete Application",
      description:
        "Permanently delete an application. This action cannot be undone.",
      inputSchema: z.object({
        id: z.uuid().describe("Application UUID"),
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
        path: `/applications/${args.id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "application");
      return formatSuccess(result.data);
    }
  );

  // sevalla.applications.promote
  server.registerTool(
    "sevalla.applications.promote",
    {
      title: "Promote Application",
      description: "Promote an application from staging to production.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID to promote"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: {
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: "/applications/promote",
        method: "POST",
        body: { app_id: args.app_id },
      });

      if (!result.success) return formatError(result.error, "application");
      return formatSuccess(result.data);
    }
  );
}
