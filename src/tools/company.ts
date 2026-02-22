/**
 * Sevalla Company Tools
 *
 * Tools for viewing company information.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  sevallaOutputSchema,
} from "./utils.js";

export function registerCompanyTools(server: McpServer): void {
  // sevalla.company.users
  server.registerTool(
    "sevalla.company.users",
    {
      title: "List Company Users",
      description: "List all users for a company.",
      inputSchema: z.object({
        id: z
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

      const companyId = args.id ?? getCompanyId();
      if (!companyId) {
        return formatAuthError(
          "SEVALLA_COMPANY_ID environment variable is required when no company ID is provided."
        );
      }

      const result = await clientResult.client.request<unknown>({
        path: `/company/${companyId}/users`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "company");
      return formatSuccess(result.data);
    }
  );

  // sevalla.company.usage
  server.registerTool(
    "sevalla.company.usage",
    {
      title: "Get Company Usage",
      description: "Get PaaS usage information for a company.",
      inputSchema: z.object({
        id: z
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

      const companyId = args.id ?? getCompanyId();
      if (!companyId) {
        return formatAuthError(
          "SEVALLA_COMPANY_ID environment variable is required when no company ID is provided."
        );
      }

      const result = await clientResult.client.request<unknown>({
        path: `/company/${companyId}/paas-usage`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "company");
      return formatSuccess(result.data);
    }
  );
}
