import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { registerProcessTools } from "./processes.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Process Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerProcessTools(ctx.server);
  });

  it("should register all tools", () => {
    expect(ctx.tools.has("sevalla.processes.get")).toBe(true);
    expect(ctx.tools.has("sevalla.processes.update")).toBe(true);
  });

  // -------------------------------------------------------------------------
  // sevalla.processes.get
  // -------------------------------------------------------------------------

  describe("sevalla.processes.get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.processes.get", {
        id: "proc-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla.processes.get", {
        id: "proc-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "proc-uuid-1", name: "web" });
      const result = await ctx.callTool("sevalla.processes.get", {
        id: "proc-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/processes/proc-uuid-1",
          method: "GET",
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla.processes.update
  // -------------------------------------------------------------------------

  describe("sevalla.processes.update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.processes.update", {
        id: "proc-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla.processes.update", {
        id: "proc-uuid-1",
        pod_count: 3,
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send PUT with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "proc-uuid-1", pod_count: 3 });
      const result = await ctx.callTool("sevalla.processes.update", {
        id: "proc-uuid-1",
        pod_count: 3,
        size: "large",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/processes/proc-uuid-1",
          method: "PUT",
          body: { pod_count: 3, size: "large" },
        })
      );
    });

    it("should filter out undefined body params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "proc-uuid-1", pod_count: 2 });
      await ctx.callTool("sevalla.processes.update", {
        id: "proc-uuid-1",
        pod_count: 2,
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { pod_count: 2 },
        })
      );
    });
  });
});
