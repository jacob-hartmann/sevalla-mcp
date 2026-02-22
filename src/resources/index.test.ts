import { describe, it, expect, vi, beforeEach } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClientOrThrow: vi.fn(),
}));

vi.mock("../sevalla/auth.js", () => ({
  getCompanyId: vi.fn(),
}));

vi.mock("@modelcontextprotocol/sdk/server/mcp.js", () => ({
  ResourceTemplate: class ResourceTemplate {
    constructor(
      public uri: string,
      public opts: any
    ) {}
  },
}));

import { registerResources } from "./index.js";
import { getSevallaClientOrThrow } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";

type ResourceHandler = (...args: any[]) => Promise<any>;

interface RegisteredResource {
  name: string;
  template: any;
  metadata: any;
  handler: ResourceHandler;
}

function setupResources() {
  const resources: RegisteredResource[] = [];

  const server = {
    registerResource: vi.fn((...args: any[]) => {
      resources.push({
        name: args[0],
        template: args[1],
        metadata: args[2],
        handler: args[3],
      });
    }),
  } as unknown as McpServer;

  registerResources(server);
  return { server, resources };
}

function createMockClient(requestResult: any) {
  const client = {
    request: vi.fn().mockResolvedValue(requestResult),
  };
  (getSevallaClientOrThrow as ReturnType<typeof vi.fn>).mockReturnValue(client);
  return client;
}

describe("registerResources", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getCompanyId as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
  });

  it("should register all 8 resources", () => {
    const { server } = setupResources();
    expect(server.registerResource).toHaveBeenCalledTimes(8);
  });

  describe("applications resource", () => {
    it("should return applications data on success", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "applications")!;

      createMockClient({
        success: true,
        data: { applications: [] },
      });

      const result = await res.handler("sevalla://applications", {} as any);
      expect(result.contents[0].uri).toBe("sevalla://applications");
      expect(result.contents[0].mimeType).toBe("application/json");
    });

    it("should include company param when companyId is set", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "applications")!;

      (getCompanyId as ReturnType<typeof vi.fn>).mockReturnValue("comp-123");
      const client = createMockClient({
        success: true,
        data: { applications: [] },
      });

      await res.handler("sevalla://applications", {} as any);
      expect(client.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { company: "comp-123" },
        })
      );
    });

    it("should throw on API error", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "applications")!;

      createMockClient({
        success: false,
        error: { code: "SERVER_ERROR", message: "fail" },
      });

      await expect(
        res.handler("sevalla://applications", {} as any)
      ).rejects.toThrow("Sevalla API Error");
    });
  });

  describe("application resource (template)", () => {
    it("should return application detail on success", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "application")!;

      createMockClient({
        success: true,
        data: { id: "app-1", name: "My App" },
      });

      const result = await res.handler(
        "sevalla://applications/app-1",
        { id: "app-1" },
        {} as any
      );
      expect(result.contents[0].uri).toBe("sevalla://applications/app-1");
      expect(result.contents[0].mimeType).toBe("application/json");
    });

    it("should throw on API error", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "application")!;

      createMockClient({
        success: false,
        error: { code: "NOT_FOUND", message: "not found" },
      });

      await expect(
        res.handler("sevalla://applications/app-1", { id: "app-1" }, {} as any)
      ).rejects.toThrow("Sevalla API Error");
    });
  });

  describe("databases resource", () => {
    it("should return databases data on success", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "databases")!;

      createMockClient({
        success: true,
        data: { databases: [] },
      });

      const result = await res.handler("sevalla://databases", {} as any);
      expect(result.contents[0].uri).toBe("sevalla://databases");
      expect(result.contents[0].mimeType).toBe("application/json");
    });

    it("should include company param when companyId is set", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "databases")!;

      (getCompanyId as ReturnType<typeof vi.fn>).mockReturnValue("comp-123");
      const client = createMockClient({
        success: true,
        data: { databases: [] },
      });

      await res.handler("sevalla://databases", {} as any);
      expect(client.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { company: "comp-123" },
        })
      );
    });

    it("should throw on API error", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "databases")!;

      createMockClient({
        success: false,
        error: { code: "SERVER_ERROR", message: "fail" },
      });

      await expect(
        res.handler("sevalla://databases", {} as any)
      ).rejects.toThrow("Sevalla API Error");
    });
  });

  describe("database resource (template)", () => {
    it("should return database detail on success", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "database")!;

      createMockClient({
        success: true,
        data: { id: "db-1", type: "postgresql" },
      });

      const result = await res.handler(
        "sevalla://databases/db-1",
        { id: "db-1" },
        {} as any
      );
      expect(result.contents[0].uri).toBe("sevalla://databases/db-1");
    });

    it("should throw on API error", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "database")!;

      createMockClient({
        success: false,
        error: { code: "NOT_FOUND", message: "not found" },
      });

      await expect(
        res.handler("sevalla://databases/db-1", { id: "db-1" }, {} as any)
      ).rejects.toThrow("Sevalla API Error");
    });
  });

  describe("static-sites resource", () => {
    it("should return static sites data on success", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "static-sites")!;

      createMockClient({
        success: true,
        data: { static_sites: [] },
      });

      const result = await res.handler("sevalla://static-sites", {} as any);
      expect(result.contents[0].uri).toBe("sevalla://static-sites");
      expect(result.contents[0].mimeType).toBe("application/json");
    });

    it("should include company param when companyId is set", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "static-sites")!;

      (getCompanyId as ReturnType<typeof vi.fn>).mockReturnValue("comp-123");
      const client = createMockClient({
        success: true,
        data: { static_sites: [] },
      });

      await res.handler("sevalla://static-sites", {} as any);
      expect(client.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { company: "comp-123" },
        })
      );
    });

    it("should throw on API error", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "static-sites")!;

      createMockClient({
        success: false,
        error: { code: "SERVER_ERROR", message: "fail" },
      });

      await expect(
        res.handler("sevalla://static-sites", {} as any)
      ).rejects.toThrow("Sevalla API Error");
    });
  });

  describe("static-site resource (template)", () => {
    it("should return static site detail on success", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "static-site")!;

      createMockClient({
        success: true,
        data: { id: "ss-1", name: "My Site" },
      });

      const result = await res.handler(
        "sevalla://static-sites/ss-1",
        { id: "ss-1" },
        {} as any
      );
      expect(result.contents[0].uri).toBe("sevalla://static-sites/ss-1");
    });

    it("should throw on API error", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "static-site")!;

      createMockClient({
        success: false,
        error: { code: "NOT_FOUND", message: "not found" },
      });

      await expect(
        res.handler("sevalla://static-sites/ss-1", { id: "ss-1" }, {} as any)
      ).rejects.toThrow("Sevalla API Error");
    });
  });

  describe("pipelines resource", () => {
    it("should return pipelines data on success", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "pipelines")!;

      createMockClient({
        success: true,
        data: { pipelines: [] },
      });

      const result = await res.handler("sevalla://pipelines", {} as any);
      expect(result.contents[0].uri).toBe("sevalla://pipelines");
      expect(result.contents[0].mimeType).toBe("application/json");
    });

    it("should include company param when companyId is set", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "pipelines")!;

      (getCompanyId as ReturnType<typeof vi.fn>).mockReturnValue("comp-123");
      const client = createMockClient({
        success: true,
        data: { pipelines: [] },
      });

      await res.handler("sevalla://pipelines", {} as any);
      expect(client.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { company: "comp-123" },
        })
      );
    });

    it("should throw on API error", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "pipelines")!;

      createMockClient({
        success: false,
        error: { code: "SERVER_ERROR", message: "fail" },
      });

      await expect(
        res.handler("sevalla://pipelines", {} as any)
      ).rejects.toThrow("Sevalla API Error");
    });
  });

  describe("company-users resource (template)", () => {
    it("should return company users on success", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "company-users")!;

      createMockClient({
        success: true,
        data: { users: [] },
      });

      const result = await res.handler(
        "sevalla://company/comp-1/users",
        { id: "comp-1" },
        {} as any
      );
      expect(result.contents[0].uri).toBe("sevalla://company/comp-1/users");
      expect(result.contents[0].mimeType).toBe("application/json");
    });

    it("should extract company id from variables", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "company-users")!;

      const client = createMockClient({
        success: true,
        data: { users: [] },
      });

      await res.handler(
        "sevalla://company/comp-42/users",
        { id: "comp-42" },
        {} as any
      );
      expect(client.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/company/comp-42/users",
        })
      );
    });

    it("should throw on API error", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "company-users")!;

      createMockClient({
        success: false,
        error: { code: "FORBIDDEN", message: "access denied" },
      });

      await expect(
        res.handler(
          "sevalla://company/comp-1/users",
          { id: "comp-1" },
          {} as any
        )
      ).rejects.toThrow("Sevalla API Error");
    });
  });
});
