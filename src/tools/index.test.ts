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
  });
});
