/**
 * Sevalla Static Site Tools
 *
 * Tools for managing Sevalla static sites.
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

export function registerStaticSiteTools(server: McpServer): void {
  // sevalla.static-sites.list
  server.registerTool(
    "sevalla.static-sites.list",
    {
      title: "List Static Sites",
      description: "List all static sites for a company.",
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
        path: "/static-sites",
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "static site");
      return formatSuccess(result.data);
    }
  );

  // sevalla.static-sites.get
  server.registerTool(
    "sevalla.static-sites.get",
    {
      title: "Get Static Site",
      description: "Get details of a specific static site.",
      inputSchema: z.object({
        id: z.uuid().describe("Static site UUID"),
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
        path: `/static-sites/${args.id}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "static site");
      return formatSuccess(result.data);
    }
  );

  // sevalla.static-sites.update
  server.registerTool(
    "sevalla.static-sites.update",
    {
      title: "Update Static Site",
      description: "Update an existing static site's configuration.",
      inputSchema: z.object({
        id: z.uuid().describe("Static site UUID"),
        display_name: z.string().optional().describe("New display name"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body = buildParams({
        display_name: args.display_name,
      });

      const result = await clientResult.client.request<unknown>({
        path: `/static-sites/${args.id}`,
        method: "PUT",
        body,
      });

      if (!result.success) return formatError(result.error, "static site");
      return formatSuccess(result.data);
    }
  );

  // sevalla.static-sites.delete
  server.registerTool(
    "sevalla.static-sites.delete",
    {
      title: "Delete Static Site",
      description:
        "Permanently delete a static site. This action cannot be undone.",
      inputSchema: z.object({
        id: z.uuid().describe("Static site UUID"),
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
        path: `/static-sites/${args.id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "static site");
      return formatSuccess(result.data);
    }
  );

  // sevalla.static-sites.deploy
  server.registerTool(
    "sevalla.static-sites.deploy",
    {
      title: "Deploy Static Site",
      description: "Trigger a new deployment for a static site.",
      inputSchema: z.object({
        site_id: z.uuid().describe("Static site UUID"),
        branch: z.string().optional().describe("Git branch to deploy"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body = buildParams({
        site_id: args.site_id,
        branch: args.branch,
      });

      const result = await clientResult.client.request<unknown>({
        path: "/static-sites/deployments",
        method: "POST",
        body,
      });

      if (!result.success)
        return formatError(result.error, "static site deployment");
      return formatSuccess(result.data);
    }
  );

  // sevalla.static-sites.get-deployment
  server.registerTool(
    "sevalla.static-sites.get-deployment",
    {
      title: "Get Static Site Deployment",
      description: "Get details of a specific static site deployment.",
      inputSchema: z.object({
        id: z.uuid().describe("Deployment UUID"),
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
        path: `/static-sites/deployments/${args.id}`,
        method: "GET",
      });

      if (!result.success)
        return formatError(result.error, "static site deployment");
      return formatSuccess(result.data);
    }
  );
}
