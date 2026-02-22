/**
 * Sevalla Pipeline Tools
 *
 * Tools for managing Sevalla deployment pipelines.
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

export function registerPipelineTools(server: McpServer): void {
  // sevalla.pipelines.list
  server.registerTool(
    "sevalla.pipelines.list",
    {
      title: "List Pipelines",
      description: "List all deployment pipelines for a company.",
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
        path: "/pipelines",
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success) return formatError(result.error, "pipeline");
      return formatSuccess(result.data);
    }
  );

  // sevalla.pipelines.create-preview-app
  server.registerTool(
    "sevalla.pipelines.create-preview-app",
    {
      title: "Create Preview App",
      description: "Create a preview application from a pipeline.",
      inputSchema: z.object({
        id: z.uuid().describe("Pipeline UUID"),
        branch: z.string().optional().describe("Git branch to deploy"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body = buildParams({
        branch: args.branch,
      });

      const result = await clientResult.client.request<unknown>({
        path: `/pipelines/${args.id}/create-preview-app`,
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "pipeline");
      return formatSuccess(result.data);
    }
  );
}
