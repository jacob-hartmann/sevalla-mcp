import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { registerAppDomainTools } from "./app-domains.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Application Domain Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerAppDomainTools(ctx.server);
  });

  it("should register all domain tools", () => {
    expect(ctx.tools.has("sevalla.applications.domains.list")).toBe(true);
    expect(ctx.tools.has("sevalla.applications.domains.add")).toBe(true);
    expect(ctx.tools.has("sevalla.applications.domains.delete")).toBe(true);
    expect(ctx.tools.has("sevalla.applications.domains.set-primary")).toBe(
      true
    );
    expect(ctx.tools.has("sevalla.applications.domains.refresh-status")).toBe(
      true
    );
  });

  // ---------------------------------------------------------------------------
  // sevalla.applications.domains.list
  // ---------------------------------------------------------------------------

  describe("sevalla.applications.domains.list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.applications.domains.list", {
        app_id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.applications.domains.list", {
        app_id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { domains: [] });
      const result = await ctx.callTool("sevalla.applications.domains.list", {
        app_id: "app-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/domains",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.applications.domains.add
  // ---------------------------------------------------------------------------

  describe("sevalla.applications.domains.add", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.applications.domains.add", {
        app_id: "app-uuid-1",
        hostname: "example.com",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.applications.domains.add", {
        app_id: "app-uuid-1",
        hostname: "example.com",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "domain-uuid-1" });
      const result = await ctx.callTool("sevalla.applications.domains.add", {
        app_id: "app-uuid-1",
        hostname: "example.com",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/domains",
          method: "POST",
          body: { hostname: "example.com" },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.applications.domains.delete
  // ---------------------------------------------------------------------------

  describe("sevalla.applications.domains.delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.applications.domains.delete", {
        app_id: "app-uuid-1",
        domain_id: "domain-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla.applications.domains.delete", {
        app_id: "app-uuid-1",
        domain_id: "domain-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send DELETE request", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla.applications.domains.delete", {
        app_id: "app-uuid-1",
        domain_id: "domain-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/domains/domain-uuid-1",
          method: "DELETE",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.applications.domains.set-primary
  // ---------------------------------------------------------------------------

  describe("sevalla.applications.domains.set-primary", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla.applications.domains.set-primary",
        { app_id: "app-uuid-1", domain_id: "domain-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "sevalla.applications.domains.set-primary",
        { app_id: "app-uuid-1", domain_id: "domain-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST to correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { primary: true });
      const result = await ctx.callTool(
        "sevalla.applications.domains.set-primary",
        { app_id: "app-uuid-1", domain_id: "domain-uuid-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/domains/domain-uuid-1/set-primary",
          method: "POST",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.applications.domains.refresh-status
  // ---------------------------------------------------------------------------

  describe("sevalla.applications.domains.refresh-status", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla.applications.domains.refresh-status",
        { app_id: "app-uuid-1", domain_id: "domain-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "sevalla.applications.domains.refresh-status",
        { app_id: "app-uuid-1", domain_id: "domain-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST to correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { status: "verified" });
      const result = await ctx.callTool(
        "sevalla.applications.domains.refresh-status",
        { app_id: "app-uuid-1", domain_id: "domain-uuid-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/domains/domain-uuid-1/refresh",
          method: "POST",
        })
      );
    });
  });
});
