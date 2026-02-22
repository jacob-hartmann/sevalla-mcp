import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../sevalla/client-factory.js", () => ({
  getSevallaClient: vi.fn(),
}));

vi.mock("../sevalla/auth.js", () => ({
  getCompanyId: vi.fn(),
}));

import { getSevallaClient } from "../sevalla/client-factory.js";
import { getCompanyId } from "../sevalla/auth.js";
import { registerDatabaseTools } from "./databases.js";
import {
  createToolTestContext,
  mockClientSuccess,
  mockClientAuthFailure,
  mockRequestSuccess,
  mockRequestError,
} from "./__test-helpers__/tool-test-utils.js";

describe("Database Tools", () => {
  const ctx = createToolTestContext();
  const mock = getSevallaClient as ReturnType<typeof vi.fn>;
  const mockGetCompanyId = getCompanyId as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCompanyId.mockReturnValue("default-company-id");
    registerDatabaseTools(ctx.server);
  });

  it("should register all database tools", () => {
    expect(ctx.tools.has("sevalla.databases.list")).toBe(true);
    expect(ctx.tools.has("sevalla.databases.get")).toBe(true);
    expect(ctx.tools.has("sevalla.databases.create")).toBe(true);
    expect(ctx.tools.has("sevalla.databases.update")).toBe(true);
    expect(ctx.tools.has("sevalla.databases.delete")).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // sevalla.databases.list
  // ---------------------------------------------------------------------------

  describe("sevalla.databases.list", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.databases.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.databases.list", {});
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with default company", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { databases: [] });
      const result = await ctx.callTool("sevalla.databases.list", {});
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/databases",
          method: "GET",
          params: { company: "default-company-id" },
        })
      );
    });

    it("should use provided company over default", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { databases: [] });
      const result = await ctx.callTool("sevalla.databases.list", {
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
      mockRequestSuccess(ctx, { databases: [] });
      const result = await ctx.callTool("sevalla.databases.list", {
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
  // sevalla.databases.get
  // ---------------------------------------------------------------------------

  describe("sevalla.databases.get", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.databases.get", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla.databases.get", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "db-uuid-1", name: "mydb" });
      const result = await ctx.callTool("sevalla.databases.get", {
        id: "db-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/databases/db-uuid-1",
          method: "GET",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.databases.create
  // ---------------------------------------------------------------------------

  describe("sevalla.databases.create", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.databases.create", {
        display_name: "Test DB",
        type: "postgresql",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "VALIDATION_ERROR", "invalid");
      const result = await ctx.callTool("sevalla.databases.create", {
        display_name: "Test DB",
        type: "postgresql",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success with required fields", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "new-db-uuid" });
      const result = await ctx.callTool("sevalla.databases.create", {
        display_name: "Test DB",
        type: "postgresql",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/databases",
          method: "POST",
          body: expect.objectContaining({
            company: "default-company-id",
            display_name: "Test DB",
            type: "postgresql",
          }),
        })
      );
    });

    it("should pass optional fields in body", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "new-db-uuid" });
      const result = await ctx.callTool("sevalla.databases.create", {
        company: "custom-company-id",
        display_name: "Test DB",
        type: "mariadb",
        version: "10.6",
        location: "us-east-1",
        resource_type: "db-small",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/databases",
          method: "POST",
          body: {
            company: "custom-company-id",
            display_name: "Test DB",
            type: "mariadb",
            version: "10.6",
            location: "us-east-1",
            resource_type: "db-small",
          },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.databases.update
  // ---------------------------------------------------------------------------

  describe("sevalla.databases.update", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.databases.update", {
        id: "db-uuid-1",
        display_name: "Updated DB",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "SERVER_ERROR", "fail");
      const result = await ctx.callTool("sevalla.databases.update", {
        id: "db-uuid-1",
        display_name: "Updated DB",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { id: "db-uuid-1", display_name: "Updated DB" });
      const result = await ctx.callTool("sevalla.databases.update", {
        id: "db-uuid-1",
        display_name: "Updated DB",
        resource_type: "db-large",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/databases/db-uuid-1",
          method: "PUT",
          body: {
            display_name: "Updated DB",
            resource_type: "db-large",
          },
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // sevalla.databases.delete
  // ---------------------------------------------------------------------------

  describe("sevalla.databases.delete", () => {
    it("should handle auth failure", async () => {
      mockClientAuthFailure(mock);
      const result = await ctx.callTool("sevalla.databases.delete", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should handle API error", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestError(ctx, "NOT_FOUND", "not found");
      const result = await ctx.callTool("sevalla.databases.delete", {
        id: "db-uuid-1",
      });
      expect(result).toHaveProperty("isError", true);
    });

    it("should return success", async () => {
      mockClientSuccess(mock, ctx);
      mockRequestSuccess(ctx, { deleted: true });
      const result = await ctx.callTool("sevalla.databases.delete", {
        id: "db-uuid-1",
      });
      expect(result).not.toHaveProperty("isError");
      expect(ctx.mockClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/databases/db-uuid-1",
          method: "DELETE",
        })
      );
    });
  });
});
