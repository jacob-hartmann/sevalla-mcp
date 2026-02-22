import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

vi.mock("../sevalla/auth.js", () => ({
  getCompanyId: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import { registerCompanyTools } from "./company.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Company Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;
  const mockGetCompanyId = getCompanyId as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCompanyId.mockReturnValue("default-company-id");
    registerCompanyTools(ctx.server);
  });

  it("should register all company tools", () => {
    expect(ctx.tools.has("sevalla.company.users")).toBe(true);
    expect(ctx.tools.has("sevalla.company.usage")).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // sevalla.company.users
  // ---------------------------------------------------------------------------

  describe("sevalla.company.users", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.company.users", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.company.users", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with default company", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { users: [{ id: "user-1" }] });
      const result = await ctx.callTool("sevalla.company.users", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/company/default-company-id/users",
          method: "GET",
        })
      );
    });

    it("should use provided id over default", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { users: [] });
      const result = await ctx.callTool("sevalla.company.users", {
        id: "custom-company-id",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/company/custom-company-id/users",
          method: "GET",
        })
      );
    });

    it("should return auth error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla.company.users", {});
      expect(result).toHaveProperty("isError", true);
      expect((result as Record<string, unknown[]>)["content"]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            text: expect.stringContaining("SEVALLA_COMPANY_ID"),
          }),
        ])
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.company.usage
  // ---------------------------------------------------------------------------

  describe("sevalla.company.usage", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.company.usage", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.company.usage", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with default company", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { usage: { cpu: 50 } });
      const result = await ctx.callTool("sevalla.company.usage", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/company/default-company-id/paas-usage",
          method: "GET",
        })
      );
    });

    it("should use provided id over default", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { usage: {} });
      const result = await ctx.callTool("sevalla.company.usage", {
        id: "custom-company-id",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/company/custom-company-id/paas-usage",
          method: "GET",
        })
      );
    });

    it("should return auth error when no company ID is available", async () => {
      mockGetCompanyId.mockReturnValue(undefined);
      mockClientSuccess(mock, ctx);
      const result = await ctx.callTool("sevalla.company.usage", {});
      expect(result).toHaveProperty("isError", true);
      expect((result as Record<string, unknown[]>)["content"]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            text: expect.stringContaining("SEVALLA_COMPANY_ID"),
          }),
        ])
      );
    });
  });
});
