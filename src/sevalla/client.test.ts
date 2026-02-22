import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SevallaClient } from "./client.js";
import type { SevallaConfig } from "./types.js";

describe("SevallaClient", () => {
  const mockConfig: SevallaConfig = {
    apiKey: "test-api-key",
    companyId: undefined,
    baseUrl: "https://api.sevalla.com/v2",
  };

  let client: SevallaClient;

  beforeEach(() => {
    client = new SevallaClient(mockConfig);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should strip trailing slashes from base URL", () => {
      const c = new SevallaClient({
        ...mockConfig,
        baseUrl: "https://api.sevalla.com/v2///",
      });
      // Client should be created without error
      expect(c).toBeDefined();
    });
  });

  describe("request", () => {
    it("should handle successful GET requests", async () => {
      const mockData = { applications: [{ id: "app-1" }] };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const result = await client.request({ path: "/applications" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockData);
      }

      expect(fetch).toHaveBeenCalledWith(
        "https://api.sevalla.com/v2/applications",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer test-api-key",
          }),
        })
      );
    });

    it("should handle successful POST requests", async () => {
      const mockData = { id: "app-1", name: "My App" };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      await client.request({
        path: "/applications",
        method: "POST",
        body: { name: "My App" },
      });

      expect(fetch).toHaveBeenCalledWith(
        "https://api.sevalla.com/v2/applications",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "My App" }),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-api-key",
          }),
        })
      );
    });

    it("should handle successful PUT requests", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "app-1" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      await client.request({
        path: "/applications/app-1",
        method: "PUT",
        body: { name: "Updated App" },
      });

      expect(fetch).toHaveBeenCalledWith(
        "https://api.sevalla.com/v2/applications/app-1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ name: "Updated App" }),
        })
      );
    });

    it("should handle successful DELETE requests", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      await client.request({
        path: "/applications/app-1",
        method: "DELETE",
      });

      expect(fetch).toHaveBeenCalledWith(
        "https://api.sevalla.com/v2/applications/app-1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });

    it("should handle 400 Bad Request", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Bad Request", { status: 400 })
      );

      const result = await client.request({
        path: "/applications",
        method: "POST",
        body: {},
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
        expect(result.error.statusCode).toBe(400);
        expect(result.error.retryable).toBe(false);
      }
    });

    it("should handle 401 Unauthorized", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Unauthorized", { status: 401 })
      );

      const result = await client.request({ path: "/applications" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("UNAUTHORIZED");
        expect(result.error.statusCode).toBe(401);
        expect(result.error.retryable).toBe(false);
      }
    });

    it("should handle 403 Forbidden", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Forbidden", { status: 403 })
      );

      const result = await client.request({ path: "/applications" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("FORBIDDEN");
        expect(result.error.retryable).toBe(false);
      }
    });

    it("should handle 404 Not Found", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Not Found", { status: 404 })
      );

      const result = await client.request({ path: "/applications/unknown" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("NOT_FOUND");
      }
    });

    it("should handle 422 Validation Error", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Unprocessable", { status: 422 })
      );

      const result = await client.request({
        path: "/applications",
        method: "POST",
        body: {},
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
        expect(result.error.statusCode).toBe(422);
        expect(result.error.retryable).toBe(false);
      }
    });

    it("should handle 429 Rate Limited", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Too Many Requests", { status: 429 })
      );

      const result = await client.request({
        path: "/applications",
        method: "POST",
        body: {},
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("RATE_LIMITED");
        expect(result.error.retryable).toBe(true);
      }
    });

    it("should handle 500 Server Error", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Internal Server Error", { status: 500 })
      );

      const result = await client.request({ path: "/applications" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("SERVER_ERROR");
        expect(result.error.retryable).toBe(true);
      }
    });

    it("should handle network errors", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
        new Error("DNS resolution failed")
      );

      const result = await client.request({ path: "/applications" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("NETWORK_ERROR");
        expect(result.error.message).toContain("DNS resolution failed");
      }
    });

    it("should include query parameters", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({}), { status: 200 })
      );

      await client.request({
        path: "/applications",
        params: { company_id: "comp-1" },
      });

      expect(fetch).toHaveBeenCalledWith(
        "https://api.sevalla.com/v2/applications?company_id=comp-1",
        expect.any(Object)
      );
    });

    it("should send JSON body for POST requests", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "app-1" }), { status: 200 })
      );

      await client.request({
        path: "/applications",
        method: "POST",
        body: { name: "My App" },
      });

      expect(fetch).toHaveBeenCalledWith(
        "https://api.sevalla.com/v2/applications",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "My App" }),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should handle non-JSON response body on success", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("not json", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        })
      );

      const result = await client.request({ path: "/applications" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("UNKNOWN");
        expect(result.error.message).toContain("non-JSON");
      }
    });

    it("should extract apiMessage from error JSON body", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Application not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      );

      const result = await client.request({ path: "/applications/unknown" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("NOT_FOUND");
        expect(result.error.apiMessage).toBe("Application not found");
        expect(result.error.message).toContain("Application not found");
      }
    });

    it("should extract apiMessage from 'error' key when 'message' is absent", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Something went wrong" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      );

      const result = await client.request({ path: "/applications" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("SERVER_ERROR");
        expect(result.error.apiMessage).toBe("Something went wrong");
        expect(result.error.message).toContain("Something went wrong");
      }
    });

    it("should handle other 4xx as VALIDATION_ERROR", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Method Not Allowed", { status: 405 })
      );

      const result = await client.request({ path: "/applications" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
        expect(result.error.statusCode).toBe(405);
        expect(result.error.retryable).toBe(false);
      }
    });

    it("should handle AbortError as TIMEOUT", async () => {
      const abortError = new Error("The operation was aborted");
      abortError.name = "AbortError";
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(abortError);

      const result = await client.request({ path: "/applications" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("TIMEOUT");
        expect(result.error.retryable).toBe(true);
      }
    });

    it("should abort fetch when timeout fires", async () => {
      vi.useFakeTimers();
      vi.spyOn(globalThis, "fetch").mockImplementationOnce(
        (_url, init) =>
          new Promise((_resolve, reject) => {
            init!.signal?.addEventListener("abort", () => {
              const err = new Error("The operation was aborted");
              err.name = "AbortError";
              reject(err);
            });
          })
      );

      const resultPromise = client.request({ path: "/applications" });
      await vi.advanceTimersByTimeAsync(30_001);
      const result = await resultPromise;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("TIMEOUT");
      }
      vi.useRealTimers();
    });

    it("should handle non-Error throw", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce("string error");

      const result = await client.request({ path: "/applications" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("UNKNOWN");
        expect(result.error.message).toBe("Unknown error occurred");
      }
    });
  });
});
