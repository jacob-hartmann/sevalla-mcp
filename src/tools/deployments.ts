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
  buildParams,
  sevallaOutputSchema,
} from "./utils.js";

export function registerDeploymentTools(server: McpServer): void {
  // sevalla.deployments.list
  server.registerTool(
    "sevalla.deployments.list",
    {
      title: "List Deployments",
      description: "List all deployments for an application.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
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

      const params = buildParams({
        limit: args.limit?.toString(),
        offset: args.offset?.toString(),
      });

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.app_id}/deployments`,
        method: "GET",
        params: params,
      });

      if (!result.success) return formatError(result.error, "deployment");
      return formatSuccess(result.data);
    }
  );

  // sevalla.deployments.get
  server.registerTool(
    "sevalla.deployments.get",
    {
      title: "Get Deployment",
      description: "Get details of a specific deployment.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
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
        path: `/applications/${args.app_id}/deployments/${args.id}`,
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

      const body = buildParams({
        branch: args.branch,
        tag: args.tag,
      });

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.app_id}/deployments`,
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "deployment");
      return formatSuccess(result.data);
    }
  );

  // sevalla.deployments.cancel
  server.registerTool(
    "sevalla.deployments.cancel",
    {
      title: "Cancel Deployment",
      description: "Cancel an in-progress deployment.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
        id: z.uuid().describe("Deployment UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.app_id}/deployments/${args.id}/cancel`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "deployment");
      return formatSuccess(result.data);
    }
  );

  // sevalla.deployments.rollback
  server.registerTool(
    "sevalla.deployments.rollback",
    {
      title: "Rollback Deployment",
      description: "Rollback to a specific deployment.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
        deployment_id: z.uuid().describe("Deployment UUID to rollback to"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.app_id}/deployments/${args.deployment_id}/rollback`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "deployment");
      return formatSuccess(result.data);
    }
  );
}
