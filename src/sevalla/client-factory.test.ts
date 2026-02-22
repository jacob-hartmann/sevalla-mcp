import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SevallaClientResult } from "./client-factory.js";
import type { SevallaClient } from "./client.js";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type {
  ServerRequest,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types.js";

type GetClientFn = (
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>
) => SevallaClientResult;

type GetClientOrThrowFn = (
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>
) => SevallaClient;

describe("client-factory", () => {
  const mockExtra = {} as any;

  let getSevallaClient: GetClientFn;
  let getSevallaClientOrThrow: GetClientOrThrowFn;
  let mockLoadSevallaConfig: ReturnType<typeof vi.fn>;
  let clientInstances: any[];

  beforeEach(async () => {
    vi.resetModules();
    clientInstances = [];

    mockLoadSevallaConfig = vi.fn().mockReturnValue({
      apiKey: "key",
      companyId: undefined,
      baseUrl: "https://api.sevalla.com/v2",
    });

    vi.doMock("./auth.js", () => {
      class SevallaAuthError extends Error {
        code: string;
        constructor(message: string, code: string) {
          super(message);
          this.name = "SevallaAuthError";
          this.code = code;
        }
      }
      return {
        loadSevallaConfig: mockLoadSevallaConfig,
        SevallaAuthError,
      };
    });

    vi.doMock("./client.js", () => {
      return {
        SevallaClient: class MockSevallaClient {
          constructor(_config: any) {
            clientInstances.push(this);
          }
          request = vi.fn();
        },
      };
    });

    const mod = await import("./client-factory.js");
    getSevallaClient = mod.getSevallaClient;
    getSevallaClientOrThrow = mod.getSevallaClientOrThrow;

    process.env["SEVALLA_API_KEY"] = "key";
    delete process.env["SEVALLA_COMPANY_ID"];
    delete process.env["SEVALLA_API_BASE_URL"];
  });

  it("should create a client on first call (cache miss)", () => {
    const result = getSevallaClient(mockExtra);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.client).toBeDefined();
    }
    expect(clientInstances).toHaveLength(1);
  });

  it("should return cached client on second call (cache hit)", () => {
    const result1 = getSevallaClient(mockExtra);
    const result2 = getSevallaClient(mockExtra);

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    if (result1.success && result2.success) {
      expect(result1.client).toBe(result2.client);
    }
    expect(clientInstances).toHaveLength(1);
  });

  it("should invalidate cache when env vars change", () => {
    getSevallaClient(mockExtra);
    expect(clientInstances).toHaveLength(1);

    process.env["SEVALLA_API_KEY"] = "new-key";
    getSevallaClient(mockExtra);
    expect(clientInstances).toHaveLength(2);
  });

  it("should handle missing env vars in config hash (nullish coalescing)", () => {
    delete process.env["SEVALLA_API_KEY"];
    delete process.env["SEVALLA_COMPANY_ID"];
    delete process.env["SEVALLA_API_BASE_URL"];

    const result = getSevallaClient(mockExtra);
    expect(result.success).toBe(true);
    expect(clientInstances).toHaveLength(1);
  });

  it("should include SEVALLA_COMPANY_ID in config hash", () => {
    getSevallaClient(mockExtra);
    expect(clientInstances).toHaveLength(1);

    process.env["SEVALLA_COMPANY_ID"] = "company-uuid-123";
    getSevallaClient(mockExtra);
    expect(clientInstances).toHaveLength(2);
  });

  it("should include SEVALLA_API_BASE_URL in config hash", () => {
    getSevallaClient(mockExtra);
    expect(clientInstances).toHaveLength(1);

    process.env["SEVALLA_API_BASE_URL"] = "https://custom.api.com";
    getSevallaClient(mockExtra);
    expect(clientInstances).toHaveLength(2);
  });

  it("should return error when SevallaAuthError is thrown", async () => {
    const { SevallaAuthError } = await import("./auth.js");
    mockLoadSevallaConfig.mockImplementation(() => {
      throw new SevallaAuthError("Missing API key", "NO_API_KEY");
    });

    const result = getSevallaClient(mockExtra);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Missing API key");
    }
  });

  it("should return error when generic Error is thrown", () => {
    mockLoadSevallaConfig.mockImplementation(() => {
      throw new Error("Something went wrong");
    });

    const result = getSevallaClient(mockExtra);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Something went wrong");
    }
  });

  it("should return 'Unknown auth error' when non-Error is thrown", () => {
    mockLoadSevallaConfig.mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw "string error";
    });

    const result = getSevallaClient(mockExtra);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Unknown auth error");
    }
  });

  it("should invalidate cache on error", () => {
    getSevallaClient(mockExtra);
    expect(clientInstances).toHaveLength(1);

    mockLoadSevallaConfig.mockImplementation(() => {
      throw new Error("fail");
    });

    process.env["SEVALLA_API_KEY"] = "changed";
    const result = getSevallaClient(mockExtra);
    expect(result.success).toBe(false);

    mockLoadSevallaConfig.mockReturnValue({
      apiKey: "changed",
      companyId: undefined,
      baseUrl: "https://api.sevalla.com/v2",
    });
    const result2 = getSevallaClient(mockExtra);
    expect(result2.success).toBe(true);
    expect(clientInstances).toHaveLength(2);
  });

  it("getSevallaClientOrThrow should return client on success", () => {
    const client = getSevallaClientOrThrow(mockExtra);
    expect(client).toBeDefined();
  });

  it("getSevallaClientOrThrow should throw on failure", () => {
    mockLoadSevallaConfig.mockImplementation(() => {
      throw new Error("fail");
    });

    expect(() => getSevallaClientOrThrow(mockExtra)).toThrow("fail");
  });
});
