import { describe, it, expect, vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

vi.mock("./validate.js", () => ({ registerValidateTool: vi.fn() }));
vi.mock("./applications.js", () => ({ registerApplicationTools: vi.fn() }));
vi.mock("./deployments.js", () => ({ registerDeploymentTools: vi.fn() }));
vi.mock("./processes.js", () => ({ registerProcessTools: vi.fn() }));
vi.mock("./networking.js", () => ({ registerNetworkingTools: vi.fn() }));
vi.mock("./databases.js", () => ({ registerDatabaseTools: vi.fn() }));
vi.mock("./static-sites.js", () => ({ registerStaticSiteTools: vi.fn() }));
vi.mock("./pipelines.js", () => ({ registerPipelineTools: vi.fn() }));
vi.mock("./company.js", () => ({ registerCompanyTools: vi.fn() }));
vi.mock("./env-vars.js", () => ({ registerEnvVarTools: vi.fn() }));
vi.mock("./app-domains.js", () => ({ registerAppDomainTools: vi.fn() }));
vi.mock("./logs-metrics.js", () => ({ registerLogsMetricsTools: vi.fn() }));
vi.mock("./load-balancers.js", () => ({
  registerLoadBalancerTools: vi.fn(),
}));
vi.mock("./object-storage.js", () => ({
  registerObjectStorageTools: vi.fn(),
}));
vi.mock("./webhooks.js", () => ({ registerWebhookTools: vi.fn() }));
vi.mock("./projects.js", () => ({ registerProjectTools: vi.fn() }));
vi.mock("./docker-registries.js", () => ({
  registerDockerRegistryTools: vi.fn(),
}));
vi.mock("./global-env-vars.js", () => ({
  registerGlobalEnvVarTools: vi.fn(),
}));
vi.mock("./api-keys.js", () => ({ registerApiKeyTools: vi.fn() }));
vi.mock("./resources.js", () => ({ registerResourceTools: vi.fn() }));

import { registerTools } from "./index.js";
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

describe("registerTools", () => {
  it("should call all registration functions with the server", () => {
    const server = {} as unknown as McpServer;
    registerTools(server);

    expect(registerValidateTool).toHaveBeenCalledWith(server);
    expect(registerApplicationTools).toHaveBeenCalledWith(server);
    expect(registerDeploymentTools).toHaveBeenCalledWith(server);
    expect(registerProcessTools).toHaveBeenCalledWith(server);
    expect(registerNetworkingTools).toHaveBeenCalledWith(server);
    expect(registerDatabaseTools).toHaveBeenCalledWith(server);
    expect(registerStaticSiteTools).toHaveBeenCalledWith(server);
    expect(registerPipelineTools).toHaveBeenCalledWith(server);
    expect(registerCompanyTools).toHaveBeenCalledWith(server);
    expect(registerEnvVarTools).toHaveBeenCalledWith(server);
    expect(registerAppDomainTools).toHaveBeenCalledWith(server);
    expect(registerLogsMetricsTools).toHaveBeenCalledWith(server);
    expect(registerLoadBalancerTools).toHaveBeenCalledWith(server);
    expect(registerObjectStorageTools).toHaveBeenCalledWith(server);
    expect(registerWebhookTools).toHaveBeenCalledWith(server);
    expect(registerProjectTools).toHaveBeenCalledWith(server);
    expect(registerDockerRegistryTools).toHaveBeenCalledWith(server);
    expect(registerGlobalEnvVarTools).toHaveBeenCalledWith(server);
    expect(registerApiKeyTools).toHaveBeenCalledWith(server);
    expect(registerResourceTools).toHaveBeenCalledWith(server);
  });
});
