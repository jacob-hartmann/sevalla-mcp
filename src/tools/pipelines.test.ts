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
    expect(ctx.tools.has("sevalla.pipelines.create-preview-app")).toBe(true);
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
  // sevalla.pipelines.create-preview-app
  // ---------------------------------------------------------------------------

  describe("sevalla.pipelines.create-preview-app", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool(
        "sevalla.pipelines.create-preview-app",
        {
          id: "pipeline-uuid-1",
        }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool(
        "sevalla.pipelines.create-preview-app",
        {
          id: "pipeline-uuid-1",
        }
      );
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success without optional branch", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "preview-app-uuid" });
      const result = await ctx.callTool(
        "sevalla.pipelines.create-preview-app",
        {
          id: "pipeline-uuid-1",
        }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines/pipeline-uuid-1/create-preview-app",
          method: "POST",
          body: {},
        })
      );
    });

    it("should pass optional branch in body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "preview-app-uuid" });
      const result = await ctx.callTool(
        "sevalla.pipelines.create-preview-app",
        {
          id: "pipeline-uuid-1",
          branch: "feature-branch",
        }
      );
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/pipelines/pipeline-uuid-1/create-preview-app",
          method: "POST",
          body: { branch: "feature-branch" },
        })
      );
    });
  });
});
