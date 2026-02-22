import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  loadSevallaConfig,
  isSevallaConfigured,
  SevallaAuthError,
  getCompanyId,
} from "./auth.js";

describe("Sevalla Auth", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("loadSevallaConfig", () => {
    it("should throw SevallaAuthError when SEVALLA_API_KEY is missing", () => {
      delete process.env["SEVALLA_API_KEY"];

      expect(() => loadSevallaConfig()).toThrow(SevallaAuthError);
      expect(() => loadSevallaConfig()).toThrow("SEVALLA_API_KEY");
    });

    it("should have correct error code when SEVALLA_API_KEY is missing", () => {
      delete process.env["SEVALLA_API_KEY"];

      try {
        loadSevallaConfig();
      } catch (err) {
        expect(err).toBeInstanceOf(SevallaAuthError);
        expect((err as SevallaAuthError).code).toBe("NO_API_KEY");
      }
    });

    it("should return config when SEVALLA_API_KEY is set", () => {
      process.env["SEVALLA_API_KEY"] = "test-key";

      const config = loadSevallaConfig();

      expect(config.apiKey).toBe("test-key");
      expect(config.baseUrl).toBe("https://api.sevalla.com/v2");
    });

    it("should include companyId when SEVALLA_COMPANY_ID is set", () => {
      process.env["SEVALLA_API_KEY"] = "test-key";
      process.env["SEVALLA_COMPANY_ID"] = "company-uuid-123";

      const config = loadSevallaConfig();

      expect(config.companyId).toBe("company-uuid-123");
    });

    it("should have undefined companyId when SEVALLA_COMPANY_ID is not set", () => {
      process.env["SEVALLA_API_KEY"] = "test-key";
      delete process.env["SEVALLA_COMPANY_ID"];

      const config = loadSevallaConfig();

      expect(config.companyId).toBeUndefined();
    });

    it("should respect custom SEVALLA_API_BASE_URL", () => {
      process.env["SEVALLA_API_KEY"] = "test-key";
      process.env["SEVALLA_API_BASE_URL"] = "https://custom.api.com/v3";

      const config = loadSevallaConfig();

      expect(config.baseUrl).toBe("https://custom.api.com/v3");
    });
  });

  describe("isSevallaConfigured", () => {
    it("should return false when SEVALLA_API_KEY is missing", () => {
      delete process.env["SEVALLA_API_KEY"];

      expect(isSevallaConfigured()).toBe(false);
    });

    it("should return true when SEVALLA_API_KEY is set", () => {
      process.env["SEVALLA_API_KEY"] = "test-key";

      expect(isSevallaConfigured()).toBe(true);
    });
  });

  describe("getCompanyId", () => {
    it("should return undefined when SEVALLA_COMPANY_ID is not set", () => {
      delete process.env["SEVALLA_COMPANY_ID"];

      expect(getCompanyId()).toBeUndefined();
    });

    it("should return company ID when SEVALLA_COMPANY_ID is set", () => {
      process.env["SEVALLA_COMPANY_ID"] = "company-uuid-456";

      expect(getCompanyId()).toBe("company-uuid-456");
    });
  });
});
