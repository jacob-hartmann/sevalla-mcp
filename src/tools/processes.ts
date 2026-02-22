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
  // sevalla.processes.get
  server.registerTool(
    "sevalla.processes.get",
    {
      title: "Get Process",
      description: "Get details of a specific application process.",
      inputSchema: z.object({
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
        path: `/applications/processes/${args.id}`,
        method: "GET",
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
        path: `/applications/processes/${args.id}`,
        method: "PUT",
        body,
      });

      if (!result.success) return formatError(result.error, "process");
      return formatSuccess(result.data);
    }
  );
}
