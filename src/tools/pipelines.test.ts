import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

vi.mock("../sevalla/auth.js", () => ({
  getCompanyId: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import { registerPipelineTools } from "./pipelines.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Pipeline Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;
  const mockGetCompanyId = getCompanyId as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCompanyId.mockReturnValue("default-company-id");
    registerPipelineTools(ctx.server);
  });

  it("should register all pipeline tools", () => {
    expect(ctx.tools.has("sevalla.pipelines.list")).toBe(true);
    expect(ctx.tools.has("sevalla.pipelines.get")).toBe(true);
    expect(ctx.tools.has("sevalla.pipelines.create")).toBe(true);
    expect(ctx.tools.has("sevalla.pipelines.update")).toBe(true);
    expect(ctx.tools.has("sevalla.pipelines.delete")).toBe(true);
    expect(ctx.tools.has("sevalla.pipelines.promote")).toBe(true);
    expect(ctx.tools.has("sevalla.pipelines.stages.create")).toBe(true);
    expect(ctx.tools.has("sevalla.pipelines.stages.delete")).toBe(true);
    expect(ctx.tools.has("sevalla.pipelines.enable-preview")).toBe(true);
    expect(ctx.tools.has("sevalla.pipelines.disable-preview")).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // sevalla.pipelines.list
  // ---------------------------------------------------------------------------

  describe("sevalla.pipelines.list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.pipelines.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla.pipelines.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.pipelines.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with default company", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { pipelines: [] });
      const result = await ctx.callTool("sevalla.pipelines.list", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines",
          method: "GET",
          params: { company: "default-company-id" },
        })
      );
    });

    it("should use provided company over default", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { pipelines: [] });
      const result = await ctx.callTool("sevalla.pipelines.list", {
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
      mockRequestSuccess(ctx, { pipelines: [] });
      const result = await ctx.callTool("sevalla.pipelines.list", {
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
  // sevalla.pipelines.get
  // ---------------------------------------------------------------------------

  describe("sevalla.pipelines.get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.pipelines.get", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla.pipelines.get", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "pipeline-uuid-1", name: "my-pipeline" });
      const result = await ctx.callTool("sevalla.pipelines.get", {
        id: "pipeline-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines/pipeline-uuid-1",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.pipelines.create
  // ---------------------------------------------------------------------------

  describe("sevalla.pipelines.create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.pipelines.create", {
        name: "Test Pipeline",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla.pipelines.create", {
        name: "Test Pipeline",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla.pipelines.create", {
        name: "Test Pipeline",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with required fields", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "new-pipeline-uuid" });
      const result = await ctx.callTool("sevalla.pipelines.create", {
        name: "Test Pipeline",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines",
          method: "POST",
          body: expect.objectContaining({
            company: "default-company-id",
            name: "Test Pipeline",
          }),
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.pipelines.update
  // ---------------------------------------------------------------------------

  describe("sevalla.pipelines.update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.pipelines.update", {
        id: "pipeline-uuid-1",
        name: "Updated",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.pipelines.update", {
        id: "pipeline-uuid-1",
        name: "Updated",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "pipeline-uuid-1", name: "Updated" });
      const result = await ctx.callTool("sevalla.pipelines.update", {
        id: "pipeline-uuid-1",
        name: "Updated",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines/pipeline-uuid-1",
          method: "PATCH",
          body: { name: "Updated" },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.pipelines.delete
  // ---------------------------------------------------------------------------

  describe("sevalla.pipelines.delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.pipelines.delete", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla.pipelines.delete", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla.pipelines.delete", {
        id: "pipeline-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines/pipeline-uuid-1",
          method: "DELETE",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.pipelines.promote
  // ---------------------------------------------------------------------------

  describe("sevalla.pipelines.promote", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.pipelines.promote", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.pipelines.promote", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { promoted: true });
      const result = await ctx.callTool("sevalla.pipelines.promote", {
        id: "pipeline-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines/pipeline-uuid-1/promote",
          method: "POST",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.pipelines.stages.create
  // ---------------------------------------------------------------------------

  describe("sevalla.pipelines.stages.create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.pipelines.stages.create", {
        id: "pipeline-uuid-1",
        name: "staging",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla.pipelines.stages.create", {
        id: "pipeline-uuid-1",
        name: "staging",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "stage-uuid-1" });
      const result = await ctx.callTool("sevalla.pipelines.stages.create", {
        id: "pipeline-uuid-1",
        name: "staging",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines/pipeline-uuid-1/stages",
          method: "POST",
          body: { name: "staging" },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.pipelines.stages.delete
  // ---------------------------------------------------------------------------

  describe("sevalla.pipelines.stages.delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.pipelines.stages.delete", {
        id: "pipeline-uuid-1",
        stage_id: "stage-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla.pipelines.stages.delete", {
        id: "pipeline-uuid-1",
        stage_id: "stage-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla.pipelines.stages.delete", {
        id: "pipeline-uuid-1",
        stage_id: "stage-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines/pipeline-uuid-1/stages/stage-uuid-1",
          method: "DELETE",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.pipelines.enable-preview
  // ---------------------------------------------------------------------------

  describe("sevalla.pipelines.enable-preview", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.pipelines.enable-preview", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.pipelines.enable-preview", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { enabled: true });
      const result = await ctx.callTool("sevalla.pipelines.enable-preview", {
        id: "pipeline-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines/pipeline-uuid-1/preview/enable",
          method: "POST",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.pipelines.disable-preview
  // ---------------------------------------------------------------------------

  describe("sevalla.pipelines.disable-preview", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.pipelines.disable-preview", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.pipelines.disable-preview", {
        id: "pipeline-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { disabled: true });
      const result = await ctx.callTool("sevalla.pipelines.disable-preview", {
        id: "pipeline-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines/pipeline-uuid-1/preview/disable",
          method: "POST",
        })
      );
    });
  });
});
