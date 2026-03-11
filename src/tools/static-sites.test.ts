import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

vi.mock("../sevalla/auth.js", () => ({
  getCompanyId: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import { registerStaticSiteTools } from "./static-sites.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Static Site Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;
  const mockGetCompanyId = getCompanyId as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCompanyId.mockReturnValue("default-company-id");
    registerStaticSiteTools(ctx.server);
  });

  it("should register all static site tools", () => {
    expect(ctx.tools.has("sevalla.static-sites.list")).toBe(true);
    expect(ctx.tools.has("sevalla.static-sites.get")).toBe(true);
    expect(ctx.tools.has("sevalla.static-sites.update")).toBe(true);
    expect(ctx.tools.has("sevalla.static-sites.delete")).toBe(true);
    expect(ctx.tools.has("sevalla.static-sites.deploy")).toBe(true);
    expect(ctx.tools.has("sevalla.static-sites.get-deployment")).toBe(true);
    expect(ctx.tools.has("sevalla.static-sites.create")).toBe(true);
    expect(ctx.tools.has("sevalla.static-sites.purge-cache")).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // sevalla.static-sites.list
  // ---------------------------------------------------------------------------

  describe("sevalla.static-sites.list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.static-sites.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.static-sites.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with default company", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { static_sites: [] });
      const result = await ctx.callTool("sevalla.static-sites.list", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/static-sites",
          method: "GET",
          params: { company: "default-company-id" },
        })
      );
    });

    it("should use provided company over default", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { static_sites: [] });
      const result = await ctx.callTool("sevalla.static-sites.list", {
        company: "custom-company-id",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({ company: "custom-company-id" }),
        })
      );
    });

    it("should pass limit and offset as string params", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { static_sites: [] });
      const result = await ctx.callTool("sevalla.static-sites.list", {
        limit: 10,
        offset: 20,
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({ limit: "10", offset: "20" }),
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.static-sites.get
  // ---------------------------------------------------------------------------

  describe("sevalla.static-sites.get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.static-sites.get", {
        id: "site-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla.static-sites.get", {
        id: "site-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "site-uuid-1", name: "my-site" });
      const result = await ctx.callTool("sevalla.static-sites.get", {
        id: "site-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/static-sites/site-uuid-1",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.static-sites.update
  // ---------------------------------------------------------------------------

  describe("sevalla.static-sites.update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.static-sites.update", {
        id: "site-uuid-1",
        display_name: "Updated Site",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.static-sites.update", {
        id: "site-uuid-1",
        display_name: "Updated Site",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, {
        id: "site-uuid-1",
        display_name: "Updated Site",
      });
      const result = await ctx.callTool("sevalla.static-sites.update", {
        id: "site-uuid-1",
        display_name: "Updated Site",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/static-sites/site-uuid-1",
          method: "PATCH",
          body: { display_name: "Updated Site" },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.static-sites.delete
  // ---------------------------------------------------------------------------

  describe("sevalla.static-sites.delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.static-sites.delete", {
        id: "site-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla.static-sites.delete", {
        id: "site-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla.static-sites.delete", {
        id: "site-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/static-sites/site-uuid-1",
          method: "DELETE",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.static-sites.deploy
  // ---------------------------------------------------------------------------

  describe("sevalla.static-sites.deploy", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.static-sites.deploy", {
        site_id: "site-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.static-sites.deploy", {
        site_id: "site-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with required fields", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "deploy-uuid-1" });
      const result = await ctx.callTool("sevalla.static-sites.deploy", {
        site_id: "site-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/static-sites/site-uuid-1/deployments",
          method: "POST",
        })
      );
    });

    it("should pass optional branch in body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "deploy-uuid-1" });
      const result = await ctx.callTool("sevalla.static-sites.deploy", {
        site_id: "site-uuid-1",
        branch: "main",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/static-sites/site-uuid-1/deployments",
          method: "POST",
          body: { branch: "main" },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.static-sites.get-deployment
  // ---------------------------------------------------------------------------

  describe("sevalla.static-sites.get-deployment", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.static-sites.get-deployment", {
        site_id: "site-uuid-1",
        deployment_id: "deploy-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla.static-sites.get-deployment", {
        site_id: "site-uuid-1",
        deployment_id: "deploy-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "deploy-uuid-1", status: "success" });
      const result = await ctx.callTool("sevalla.static-sites.get-deployment", {
        site_id: "site-uuid-1",
        deployment_id: "deploy-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/static-sites/site-uuid-1/deployments/deploy-uuid-1",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.static-sites.create
  // ---------------------------------------------------------------------------

  describe("sevalla.static-sites.create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.static-sites.create", {
        display_name: "Test Site",
        repository: "https://github.com/test/repo",
        branch: "main",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla.static-sites.create", {
        display_name: "Test Site",
        repository: "https://github.com/test/repo",
        branch: "main",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with required fields", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "new-site-uuid" });
      const result = await ctx.callTool("sevalla.static-sites.create", {
        display_name: "Test Site",
        repository: "https://github.com/test/repo",
        branch: "main",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/static-sites",
          method: "POST",
          body: expect.objectContaining({
            company: "default-company-id",
            display_name: "Test Site",
            repository: "https://github.com/test/repo",
            branch: "main",
          }),
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.static-sites.purge-cache
  // ---------------------------------------------------------------------------

  describe("sevalla.static-sites.purge-cache", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.static-sites.purge-cache", {
        id: "site-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.static-sites.purge-cache", {
        id: "site-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { purged: true });
      const result = await ctx.callTool("sevalla.static-sites.purge-cache", {
        id: "site-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/static-sites/site-uuid-1/purge-edge-cache",
          method: "POST",
        })
      );
    });
  });
});
