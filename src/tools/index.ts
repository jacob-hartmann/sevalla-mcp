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
import { registerEnvVarTools } from "./env-vars.js";
import { registerAppDomainTools } from "./app-domains.js";
import { registerLogsMetricsTools } from "./logs-metrics.js";
import { registerLoadBalancerTools } from "./load-balancers.js";
import { registerObjectStorageTools } from "./object-storage.js";
import { registerWebhookTools } from "./webhooks.js";
import { registerProjectTools } from "./projects.js";
import { registerDockerRegistryTools } from "./docker-registries.js";
import { registerGlobalEnvVarTools } from "./global-env-vars.js";
import { registerApiKeyTools } from "./api-keys.js";
import { registerResourceTools } from "./resources.js";

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
  registerEnvVarTools(server);
  registerAppDomainTools(server);
  registerLogsMetricsTools(server);
  registerLoadBalancerTools(server);
  registerObjectStorageTools(server);
  registerWebhookTools(server);
  registerProjectTools(server);
  registerDockerRegistryTools(server);
  registerGlobalEnvVarTools(server);
  registerApiKeyTools(server);
  registerResourceTools(server);
}
