/**
 * MCP Tools Registration
 *
 * Registers all available tools with the MCP server.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerValidateTool } from "./validate.js";
import { registerApplicationTools } from "./applications.js";
import { registerDeploymentTools } from "./deployments.js";
import { registerProcessTools } from "./processes.js";
import { registerNetworkingTools } from "./networking.js";
import { registerDatabaseTools } from "./databases.js";
import { registerStaticSiteTools } from "./static-sites.js";
import { registerPipelineTools } from "./pipelines.js";
import { registerCompanyTools } from "./company.js";

export function registerTools(server: McpServer): void {
  registerValidateTool(server);
  registerApplicationTools(server);
  registerDeploymentTools(server);
  registerProcessTools(server);
  registerNetworkingTools(server);
  registerDatabaseTools(server);
  registerStaticSiteTools(server);
  registerPipelineTools(server);
  registerCompanyTools(server);
}
