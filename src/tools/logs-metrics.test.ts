import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { registerLogsMetricsTools } from "./logs-metrics.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Logs & Metrics Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerLogsMetricsTools(ctx.server);
  });

  it("should register all logs tools", () => {
    expect(ctx.tools.has("sevalla.applications.logs.access")).toBe(true);
    expect(ctx.tools.has("sevalla.applications.logs.runtime")).toBe(true);
    expect(ctx.tools.has("sevalla.applications.logs.deployment")).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // sevalla.applications.logs.access
  // ---------------------------------------------------------------------------

  describe("sevalla.applications.logs.access", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla.applications.logs.access",
        { app_id: "app-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "sevalla.applications.logs.access",
        { app_id: "app-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { logs: [] });
      const result = await ctx.callTool(
        "sevalla.applications.logs.access",
        { app_id: "app-uuid-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/access-logs",
          method: "GET",
        })
      );
    });

    it("should pass lines param", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { logs: [] });
      await ctx.callTool("sevalla.applications.logs.access", {
        app_id: "app-uuid-1",
        lines: 100,
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({ lines: "100" }),
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.applications.logs.runtime
  // ---------------------------------------------------------------------------

  describe("sevalla.applications.logs.runtime", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla.applications.logs.runtime",
        { app_id: "app-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "sevalla.applications.logs.runtime",
        { app_id: "app-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { logs: [] });
      const result = await ctx.callTool(
        "sevalla.applications.logs.runtime",
        { app_id: "app-uuid-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/runtime-logs",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.applications.logs.deployment
  // ---------------------------------------------------------------------------

  describe("sevalla.applications.logs.deployment", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla.applications.logs.deployment",
        { app_id: "app-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "sevalla.applications.logs.deployment",
        { app_id: "app-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { logs: [] });
      const result = await ctx.callTool(
        "sevalla.applications.logs.deployment",
        { app_id: "app-uuid-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/deployment-logs",
          method: "GET",
        })
      );
    });
  });
});
