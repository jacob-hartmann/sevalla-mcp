/**
 * Sevalla Process Tools
 *
 * Tools for managing application processes.
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

export function registerProcessTools(server: McpServer): void {
  // sevalla.processes.list
  server.registerTool(
    "sevalla.processes.list",
    {
      title: "List Processes",
      description: "List all processes for an application.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
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
        path: `/applications/${args.app_id}/processes`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "process");
      return formatSuccess(result.data);
    }
  );

  // sevalla.processes.get
  server.registerTool(
    "sevalla.processes.get",
    {
      title: "Get Process",
      description: "Get details of a specific application process.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
        id: z.uuid().describe("Process UUID"),
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
        path: `/applications/${args.app_id}/processes/${args.id}`,
        method: "GET",
      });

      if (!result.success) return formatError(result.error, "process");
      return formatSuccess(result.data);
    }
  );

  // sevalla.processes.create
  server.registerTool(
    "sevalla.processes.create",
    {
      title: "Create Process",
      description: "Create a new process for an application.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
        name: z.string().describe("Process name"),
        command: z.string().describe("Process start command"),
        size: z.string().optional().describe("Pod size identifier"),
        pod_count: z
          .number()
          .min(0)
          .optional()
          .describe("Number of pods to run"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const body = buildParams({
        name: args.name,
        command: args.command,
        size: args.size,
        pod_count: args.pod_count,
      });

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.app_id}/processes`,
        method: "POST",
        body,
      });

      if (!result.success) return formatError(result.error, "process");
      return formatSuccess(result.data);
    }
  );

  // sevalla.processes.update
  server.registerTool(
    "sevalla.processes.update",
    {
      title: "Update Process",
      description: "Update an application process configuration.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
        id: z.uuid().describe("Process UUID"),
        pod_count: z
          .number()
          .min(0)
          .optional()
          .describe("Number of pods to run"),
        size: z.string().optional().describe("Pod size identifier"),
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
        pod_count: args.pod_count,
        size: args.size,
      });

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.app_id}/processes/${args.id}`,
        method: "PATCH",
        body,
      });

      if (!result.success) return formatError(result.error, "process");
      return formatSuccess(result.data);
    }
  );

  // sevalla.processes.delete
  server.registerTool(
    "sevalla.processes.delete",
    {
      title: "Delete Process",
      description: "Delete an application process.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
        id: z.uuid().describe("Process UUID"),
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
        path: `/applications/${args.app_id}/processes/${args.id}`,
        method: "DELETE",
      });

      if (!result.success) return formatError(result.error, "process");
      return formatSuccess(result.data);
    }
  );

  // sevalla.processes.trigger-cron
  server.registerTool(
    "sevalla.processes.trigger-cron",
    {
      title: "Trigger Cron Job",
      description: "Manually trigger a cron job process.",
      inputSchema: z.object({
        app_id: z.uuid().describe("Application UUID"),
        id: z.uuid().describe("Process UUID"),
      }),
      outputSchema: sevallaOutputSchema,
      annotations: { openWorldHint: true },
    },
    async (args, extra) => {
      const clientResult = getSevallaClient(extra);
      if (!clientResult.success) return formatAuthError(clientResult.error);

      const result = await clientResult.client.request<unknown>({
        path: `/applications/${args.app_id}/processes/${args.id}/trigger`,
        method: "POST",
      });

      if (!result.success) return formatError(result.error, "process");
      return formatSuccess(result.data);
    }
  );
}
