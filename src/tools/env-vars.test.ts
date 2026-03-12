import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { registerEnvVarTools } from "./env-vars.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Environment Variable Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerEnvVarTools(ctx.server);
  });

  it("should register all env var tools", () => {
    expect(ctx.tools.has("sevalla.applications.env-vars.list")).toBe(true);
    expect(ctx.tools.has("sevalla.applications.env-vars.create")).toBe(true);
    expect(ctx.tools.has("sevalla.applications.env-vars.update")).toBe(true);
    expect(ctx.tools.has("sevalla.applications.env-vars.delete")).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // sevalla.applications.env-vars.list
  // ---------------------------------------------------------------------------

  describe("sevalla.applications.env-vars.list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.applications.env-vars.list", {
        app_id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.applications.env-vars.list", {
        app_id: "app-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with correct path", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { env_vars: [] });
      const result = await ctx.callTool("sevalla.applications.env-vars.list", {
        app_id: "app-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/environment-variables",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.applications.env-vars.create
  // ---------------------------------------------------------------------------

  describe("sevalla.applications.env-vars.create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla.applications.env-vars.create",
        { app_id: "app-uuid-1", key: "NODE_ENV", value: "production" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "sevalla.applications.env-vars.create",
        { app_id: "app-uuid-1", key: "NODE_ENV", value: "production" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should send POST with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "env-var-uuid-1" });
      const result = await ctx.callTool(
        "sevalla.applications.env-vars.create",
        { app_id: "app-uuid-1", key: "NODE_ENV", value: "production" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/environment-variables",
          method: "POST",
          body: { key: "NODE_ENV", value: "production" },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.applications.env-vars.update
  // ---------------------------------------------------------------------------

  describe("sevalla.applications.env-vars.update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla.applications.env-vars.update",
        { app_id: "app-uuid-1", env_var_id: "env-var-uuid-1", value: "staging" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool(
        "sevalla.applications.env-vars.update",
        { app_id: "app-uuid-1", env_var_id: "env-var-uuid-1", value: "staging" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should send PATCH with body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "env-var-uuid-1", value: "staging" });
      const result = await ctx.callTool(
        "sevalla.applications.env-vars.update",
        { app_id: "app-uuid-1", env_var_id: "env-var-uuid-1", value: "staging" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/environment-variables/env-var-uuid-1",
          method: "PATCH",
          body: { value: "staging" },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.applications.env-vars.delete
  // ---------------------------------------------------------------------------

  describe("sevalla.applications.env-vars.delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla.applications.env-vars.delete",
        { app_id: "app-uuid-1", env_var_id: "env-var-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool(
        "sevalla.applications.env-vars.delete",
        { app_id: "app-uuid-1", env_var_id: "env-var-uuid-1" }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should send DELETE request", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool(
        "sevalla.applications.env-vars.delete",
        { app_id: "app-uuid-1", env_var_id: "env-var-uuid-1" }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/applications/app-uuid-1/environment-variables/env-var-uuid-1",
          method: "DELETE",
        })
      );
    });
  });
});
