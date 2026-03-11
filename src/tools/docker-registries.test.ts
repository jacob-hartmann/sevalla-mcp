import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

vi.mock("../sevalla/auth.js", () => ({
  getCompanyId: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import { registerDockerRegistryTools } from "./docker-registries.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Docker Registry Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;
  const mockGetCompanyId = getCompanyId as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCompanyId.mockReturnValue("default-company-id");
    registerDockerRegistryTools(ctx.server);
  });

  it("should register all tools", () => {
    expect(ctx.tools.has("sevalla.docker-registries.list")).toBe(true);
    expect(ctx.tools.has("sevalla.docker-registries.get")).toBe(true);
    expect(ctx.tools.has("sevalla.docker-registries.create")).toBe(true);
    expect(ctx.tools.has("sevalla.docker-registries.update")).toBe(true);
    expect(ctx.tools.has("sevalla.docker-registries.delete")).toBe(true);
  });

  describe("sevalla.docker-registries.list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.docker-registries.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.docker-registries.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { registries: [] });
      const result = await ctx.callTool("sevalla.docker-registries.list", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/docker-registries",
          method: "GET",
          params: { company: "default-company-id" },
        })
      );
    });
  });

  describe("sevalla.docker-registries.get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.docker-registries.get", {
        id: "reg-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla.docker-registries.get", {
        id: "reg-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "reg-uuid-1" });
      const result = await ctx.callTool("sevalla.docker-registries.get", {
        id: "reg-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/docker-registries/reg-uuid-1",
          method: "GET",
        })
      );
    });
  });

  describe("sevalla.docker-registries.create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.docker-registries.create", {
        display_name: "My Registry",
        registry_url: "https://registry.example.com",
        username: "user",
        password: "pass",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.docker-registries.create", {
        display_name: "My Registry",
        registry_url: "https://registry.example.com",
        username: "user",
        password: "pass",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "reg-uuid-new" });
      const result = await ctx.callTool("sevalla.docker-registries.create", {
        display_name: "My Registry",
        registry_url: "https://registry.example.com",
        username: "user",
        password: "pass",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/docker-registries",
          method: "POST",
          body: expect.objectContaining({
            company: "default-company-id",
            display_name: "My Registry",
          }),
        })
      );
    });
  });

  describe("sevalla.docker-registries.update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.docker-registries.update", {
        id: "reg-uuid-1",
        display_name: "Updated",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.docker-registries.update", {
        id: "reg-uuid-1",
        display_name: "Updated",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send PATCH with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "reg-uuid-1" });
      const result = await ctx.callTool("sevalla.docker-registries.update", {
        id: "reg-uuid-1",
        display_name: "Updated",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/docker-registries/reg-uuid-1",
          method: "PATCH",
          body: { display_name: "Updated" },
        })
      );
    });
  });

  describe("sevalla.docker-registries.delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.docker-registries.delete", {
        id: "reg-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla.docker-registries.delete", {
        id: "reg-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should send DELETE request", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla.docker-registries.delete", {
        id: "reg-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/docker-registries/reg-uuid-1",
          method: "DELETE",
        })
      );
    });
  });
});
