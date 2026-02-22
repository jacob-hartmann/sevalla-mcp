/**
 * Sevalla Deployment Tools
 *
 * Tools for managing application deployments.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getSevallaClient } from "../sevalla/client-factory.js";
import {
  formatAuthError,
  formatError,
  formatSuccess,
  sevallaOutputSchema,
} from "./utils.js";

export function registerDeploymentTools(server: McpServer): void {
  // sevalla.deployments.get
  server.registerTool(
    "sevalla.deployments.get",
    {
      title: "Get Deployment",
      description: "Get details of a specific deployment.",
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
        path: `/applications/deployments/${args.id}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "deployment");
      return formatSuccess(result.data);
    }
  );

  // sevalla.deployments.start
  server.registerTool(
    "sevalla.deployments.start",
    {
      title: "Start Deployment",
      description: "Trigger a new deployment for an application.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
        branch: z.string().optional().describe("Git branch to deploy"),
        tag: z.string().optional().describe("Git tag to deploy"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: {
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body: Record<string, unknown> = { app_id: args.app_id };
      if (args.branch !== undefined) body["branch"] = args.branch;
      if (args.tag !== undefined) body["tag"] = args.tag;

      const result = await clientResult.client.request<unknown>({
        path: "/applications/deployments",
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "deployment");
      return formatSuccess(result.data);
    }
  );
}
