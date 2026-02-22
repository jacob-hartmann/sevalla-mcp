import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

vi.mock("../sevalla/auth.js", () => ({
  getCompanyId: vi.fn().mockReturnValue("company-uuid-1"),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { registerApplicationTools } from "./applications.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Application Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerApplicationTools(ctx.server);
  });

  it("should register all tools", () => {
    expect(ctx.tools.has("sevalla.applications.list")).toBe(true);
    expect(ctx.tools.has("sevalla.applications.get")).toBe(true);
    expect(ctx.tools.has("sevalla.applications.update")).toBe(true);
    expect(ctx.tools.has("sevalla.applications.delete")).toBe(true);
    expect(ctx.tools.has("sevalla.applications.promote")).toBe(true);
  });

  // -------------------------------------------------------------------------
  // sevalla.applications.list
  // -------------------------------------------------------------------------

  describe("sevalla.applications.list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.applications.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.applications.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should use company ID from env by default", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { applications: [] });
      const result = await ctx.callTool("sevalla.applications.list", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications",
          method: "GET",
          params: expect.objectContaining({ company: "company-uuid-1" }),
        })
      );
    });

    it("should accept pagination params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { applications: [] });
      await ctx.callTool("sevalla.applications.list", {
        limit: 10,
        offset: 20,
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            limit: "10",
            offset: "20",
          }),
        })
      );
    });

    it("should use provided company ID over env", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { applications: [] });
      await ctx.callTool("sevalla.applications.list", {
        company: "custom-company-uuid",
      });
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({ company: "custom-company-uuid" }),
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla.applications.get
  // -------------------------------------------------------------------------

  describe("sevalla.applications.get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.applications.get", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla.applications.get", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "app-uuid-1", name: "My App" });
      const result = await ctx.callTool("sevalla.applications.get", {
        id: "app-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1",
          method: "GET",
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla.applications.update
  // -------------------------------------------------------------------------

  describe("sevalla.applications.update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.applications.update", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla.applications.update", {
        id: "app-uuid-1",
        display_name: "New Name",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send PUT with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "app-uuid-1", display_name: "New Name" });
      const result = await ctx.callTool("sevalla.applications.update", {
        id: "app-uuid-1",
        display_name: "New Name",
        note: "Updated note",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1",
          method: "PUT",
          body: { display_name: "New Name", note: "Updated note" },
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla.applications.delete
  // -------------------------------------------------------------------------

  describe("sevalla.applications.delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.applications.delete", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla.applications.delete", {
        id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send DELETE request", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla.applications.delete", {
        id: "app-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1",
          method: "DELETE",
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // sevalla.applications.promote
  // -------------------------------------------------------------------------

  describe("sevalla.applications.promote", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.applications.promote", {
        app_id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.applications.promote", {
        app_id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { promoted: true });
      const result = await ctx.callTool("sevalla.applications.promote", {
        app_id: "app-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/promote",
          method: "POST",
          body: { app_id: "app-uuid-1" },
        })
      );
    });
  });
});
