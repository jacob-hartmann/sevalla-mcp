/**
 * Sevalla Global Environment Variable Tools
 *
 * Tools for managing company-wide global environment variables.
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

export function registerGlobalEnvVarTools(server: McpServer): void {
  // sevalla.global-env-vars.list
  server.registerTool(
    "sevalla.global-env-vars.list",
    {
      title: "List Global Environment Variables",
      description: "List all global environment variables for a company.",
      inputSchema: z.object({
        company: z
          .uuid()
          .optional()
          .describe("Company UUID (defaults to SEVALLA_COMPANY_ID env var)"),
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
      });

      const result = await clientResult.client.request<unknown>({
        path: "/global-environment-variables",
        method: "GET",
        params: params as Record<string, string>,
      });

      if (!result.success)
        return formatError(result.error, "global environment variable");
      return formatSuccess(result.data);
    }
  );

  // sevalla.global-env-vars.create
  server.registerTool(
    "sevalla.global-env-vars.create",
    {
      title: "Create Global Environment Variable",
      description: "Create a new global environment variable.",
      inputSchema: z.object({
        company: z
          .uuid()
          .optional()
          .describe("Company UUID (defaults to SEVALLA_COMPANY_ID env var)"),
        key: z.string().describe("Environment variable key"),
        value: z.string().describe("Environment variable value"),
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
        key: args.key,
        value: args.value,
      });

      const result = await clientResult.client.request<unknown>({
        path: "/global-environment-variables",
        method: "POST",
        body,
      });

      if (!result.success)
        return formatError(result.error, "global environment variable");
      return formatSuccess(result.data);
    }
  );

  // sevalla.global-env-vars.update
  server.registerTool(
    "sevalla.global-env-vars.update",
    {
      title: "Update Global Environment Variable",
      description: "Update an existing global environment variable.",
      inputSchema: z.object({
        id: z.uuid().describe("Global environment variable UUID"),
        value: z.string().describe("New value"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/global-environment-variables/${args.id}`,
        method: "PATCH",
        body: { value: args.value },
      });

      if (!result.success)
        return formatError(result.error, "global environment variable");
      return formatSuccess(result.data);
    }
  );

  // sevalla.global-env-vars.delete
  server.registerTool(
    "sevalla.global-env-vars.delete",
    {
      title: "Delete Global Environment Variable",
      description: "Delete a global environment variable.",
      inputSchema: z.object({
        id: z.uuid().describe("Global environment variable UUID"),
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
        path: `/global-environment-variables/${args.id}`,
        method: "DELETE",
      });

      if (!result.success)
        return formatError(result.error, "global environment variable");
      return formatSuccess(result.data);
    }
  );
}
