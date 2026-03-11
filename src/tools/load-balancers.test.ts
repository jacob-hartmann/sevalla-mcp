import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

vi.mock("../sevalla/auth.js", () => ({
  getCompanyId: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import { registerLoadBalancerTools } from "./load-balancers.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Load Balancer Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;
  const mockGetCompanyId = getCompanyId as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCompanyId.mockReturnValue("default-company-id");
    registerLoadBalancerTools(ctx.server);
  });

  it("should register all load balancer tools", () => {
    expect(ctx.tools.has("sevalla.load-balancers.list")).toBe(true);
    expect(ctx.tools.has("sevalla.load-balancers.get")).toBe(true);
    expect(ctx.tools.has("sevalla.load-balancers.create")).toBe(true);
    expect(ctx.tools.has("sevalla.load-balancers.update")).toBe(true);
    expect(ctx.tools.has("sevalla.load-balancers.delete")).toBe(true);
    expect(ctx.tools.has("sevalla.load-balancers.destinations.list")).toBe(
      true
    );
    expect(ctx.tools.has("sevalla.load-balancers.destinations.add")).toBe(true);
    expect(ctx.tools.has("sevalla.load-balancers.destinations.remove")).toBe(
      true
    );
    expect(ctx.tools.has("sevalla.load-balancers.destinations.toggle")).toBe(
      true
    );
  });

  // ---------------------------------------------------------------------------
  // sevalla.load-balancers.list
  // ---------------------------------------------------------------------------

  describe("sevalla.load-balancers.list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.load-balancers.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.load-balancers.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with default company", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { load_balancers: [] });
      const result = await ctx.callTool("sevalla.load-balancers.list", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers",
          method: "GET",
          params: { company: "default-company-id" },
        })
      );
    });

    it("should use provided company over default", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { load_balancers: [] });
      const result = await ctx.callTool("sevalla.load-balancers.list", {
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
      mockRequestSuccess(ctx, { load_balancers: [] });
      const result = await ctx.callTool("sevalla.load-balancers.list", {
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
  // sevalla.load-balancers.get
  // ---------------------------------------------------------------------------

  describe("sevalla.load-balancers.get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.load-balancers.get", {
        id: "lb-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla.load-balancers.get", {
        id: "lb-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "lb-uuid-1", name: "my-lb" });
      const result = await ctx.callTool("sevalla.load-balancers.get", {
        id: "lb-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers/lb-uuid-1",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.load-balancers.create
  // ---------------------------------------------------------------------------

  describe("sevalla.load-balancers.create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.load-balancers.create", {
        display_name: "Test LB",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla.load-balancers.create", {
        display_name: "Test LB",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with required fields", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "new-lb-uuid" });
      const result = await ctx.callTool("sevalla.load-balancers.create", {
        display_name: "Test LB",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers",
          method: "POST",
          body: expect.objectContaining({
            company: "default-company-id",
            display_name: "Test LB",
          }),
        })
      );
    });

    it("should pass optional fields in body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "new-lb-uuid" });
      const result = await ctx.callTool("sevalla.load-balancers.create", {
        company: "custom-company-id",
        display_name: "Test LB",
        location: "us-east-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers",
          method: "POST",
          body: {
            company: "custom-company-id",
            display_name: "Test LB",
            location: "us-east-1",
          },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.load-balancers.update
  // ---------------------------------------------------------------------------

  describe("sevalla.load-balancers.update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.load-balancers.update", {
        id: "lb-uuid-1",
        display_name: "Updated LB",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.load-balancers.update", {
        id: "lb-uuid-1",
        display_name: "Updated LB",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, {
        id: "lb-uuid-1",
        display_name: "Updated LB",
      });
      const result = await ctx.callTool("sevalla.load-balancers.update", {
        id: "lb-uuid-1",
        display_name: "Updated LB",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers/lb-uuid-1",
          method: "PATCH",
          body: {
            display_name: "Updated LB",
          },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.load-balancers.delete
  // ---------------------------------------------------------------------------

  describe("sevalla.load-balancers.delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.load-balancers.delete", {
        id: "lb-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla.load-balancers.delete", {
        id: "lb-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla.load-balancers.delete", {
        id: "lb-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers/lb-uuid-1",
          method: "DELETE",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.load-balancers.destinations.list
  // ---------------------------------------------------------------------------

  describe("sevalla.load-balancers.destinations.list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla.load-balancers.destinations.list",
        { id: "lb-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "sevalla.load-balancers.destinations.list",
        { id: "lb-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { destinations: [] });
      const result = await ctx.callTool(
        "sevalla.load-balancers.destinations.list",
        { id: "lb-uuid-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers/lb-uuid-1/destinations",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.load-balancers.destinations.add
  // ---------------------------------------------------------------------------

  describe("sevalla.load-balancers.destinations.add", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla.load-balancers.destinations.add",
        { id: "lb-uuid-1", target_id: "target-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool(
        "sevalla.load-balancers.destinations.add",
        { id: "lb-uuid-1", target_id: "target-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "dest-uuid-1" });
      const result = await ctx.callTool(
        "sevalla.load-balancers.destinations.add",
        { id: "lb-uuid-1", target_id: "target-uuid-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers/lb-uuid-1/destinations",
          method: "POST",
          body: { target_id: "target-uuid-1" },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.load-balancers.destinations.remove
  // ---------------------------------------------------------------------------

  describe("sevalla.load-balancers.destinations.remove", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla.load-balancers.destinations.remove",
        { id: "lb-uuid-1", dest_id: "dest-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool(
        "sevalla.load-balancers.destinations.remove",
        { id: "lb-uuid-1", dest_id: "dest-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool(
        "sevalla.load-balancers.destinations.remove",
        { id: "lb-uuid-1", dest_id: "dest-uuid-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers/lb-uuid-1/destinations/dest-uuid-1",
          method: "DELETE",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.load-balancers.destinations.toggle
  // ---------------------------------------------------------------------------

  describe("sevalla.load-balancers.destinations.toggle", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla.load-balancers.destinations.toggle",
        { id: "lb-uuid-1", dest_id: "dest-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "sevalla.load-balancers.destinations.toggle",
        { id: "lb-uuid-1", dest_id: "dest-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "dest-uuid-1", enabled: true });
      const result = await ctx.callTool(
        "sevalla.load-balancers.destinations.toggle",
        { id: "lb-uuid-1", dest_id: "dest-uuid-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/load-balancers/lb-uuid-1/destinations/dest-uuid-1/toggle",
          method: "POST",
        })
      );
    });
  });
});
