import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { registerResourceTools } from "./resources.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Resource Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerResourceTools(ctx.server);
  });

  it("should register all tools", () => {
    expect(ctx.tools.has("sevalla.resources.clusters")).toBe(true);
    expect(ctx.tools.has("sevalla.resources.database-resource-types")).toBe(
      true
    );
    expect(ctx.tools.has("sevalla.resources.process-resource-types")).toBe(
      true
    );
  });

  describe("sevalla.resources.clusters", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.resources.clusters", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.resources.clusters", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { clusters: [] });
      const result = await ctx.callTool("sevalla.resources.clusters", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/resources/clusters",
          method: "GET",
        })
      );
    });
  });

  describe("sevalla.resources.database-resource-types", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla.resources.database-resource-types",
        {}
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { resource_types: [] });
      const result = await ctx.callTool(
        "sevalla.resources.database-resource-types",
        {}
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/resources/database-resource-types",
          method: "GET",
        })
      );
    });
  });

  describe("sevalla.resources.process-resource-types", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla.resources.process-resource-types",
        {}
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { resource_types: [] });
      const result = await ctx.callTool(
        "sevalla.resources.process-resource-types",
        {}
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/resources/process-resource-types",
          method: "GET",
        })
      );
    });
  });
});
