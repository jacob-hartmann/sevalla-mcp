/**
 * Sevalla API Client
 *
 * Generic HTTP client wrapper for the Sevalla REST API.
 *
 * - Sets `Authorization: Bearer <API_KEY>` on all requests
 * - Centralizes error mapping into typed SevallaClientError
 * - Uses AbortController for request timeouts
 */

import { FETCH_TIMEOUT_MS } from "../constants.js";
import {
  SevallaClientError,
  type SevallaConfig,
  type SevallaResult,
} from "./types.js";

// ---------------------------------------------------------------------------
// HTTP Methods
// ---------------------------------------------------------------------------

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  /** URL path relative to the base URL (e.g., "/applications") */
  path: string;
  /** HTTP method (defaults to GET) */
  method?: HttpMethod;
  /** Query parameters */
  params?: Record<string, string>;
  /** JSON request body */
  body?: unknown;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

/**
 * Sevalla API Client
 *
 * Wraps the Sevalla REST API with typed error handling and auth.
 */
export class SevallaClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: SevallaConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
  }

  /**
   * Make an authenticated request to the Sevalla API.
   *
   * @param options - Request configuration
   * @returns Typed result with data or error
   */
  async request<T>(options: RequestOptions): Promise<SevallaResult<T>> {
    const { path, method = "GET", params, body } = options;

    // Build URL
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    // Set up timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, FETCH_TIMEOUT_MS);

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
      };

      const init: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (body !== undefined) {
        headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(body);
      }

      const response = await fetch(url.toString(), init);

      // Map HTTP status to typed error
      if (!response.ok) {
        return { success: false, error: await this.mapHttpError(response) };
      }

      // Parse response — guard against non-JSON bodies
      let data: T;
      try {
        data = (await response.json()) as T;
      } catch {
        return {
          success: false,
          error: new SevallaClientError(
            "Received non-JSON response from the Sevalla API",
            "UNKNOWN",
            response.status,
            false
          ),
        };
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: this.mapNetworkError(err) };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // -------------------------------------------------------------------------
  // Error Mapping
  // -------------------------------------------------------------------------

  private async mapHttpError(response: Response): Promise<SevallaClientError> {
    const status = response.status;

    // Try to extract API error message from response body
    let apiMessage: string | undefined;
    try {
      const body = (await response.json()) as Record<string, unknown>;
      const msg = body["message"] ?? body["error"];
      if (typeof msg === "string") {
        apiMessage = msg;
      }
    } catch {
      // Non-JSON error body — proceed without apiMessage
    }

    const suffix = apiMessage ? `: ${apiMessage}` : "";

    switch (status) {
      case 400:
        return new SevallaClientError(
          `Bad request${suffix}`,
          "VALIDATION_ERROR",
          status,
          false,
          apiMessage
        );
      case 401:
        return new SevallaClientError(
          `Unauthorized – invalid or expired API key${suffix}`,
          "UNAUTHORIZED",
          status,
          false,
          apiMessage
        );
      case 403:
        return new SevallaClientError(
          `Forbidden – insufficient permissions${suffix}`,
          "FORBIDDEN",
          status,
          false,
          apiMessage
        );
      case 404:
        return new SevallaClientError(
          `Resource not found${suffix}`,
          "NOT_FOUND",
          status,
          false,
          apiMessage
        );
      case 422:
        return new SevallaClientError(
          `Validation error${suffix}`,
          "VALIDATION_ERROR",
          status,
          false,
          apiMessage
        );
      case 429:
        return new SevallaClientError(
          `Rate limit exceeded. Please wait before retrying.${suffix}`,
          "RATE_LIMITED",
          status,
          true,
          apiMessage
        );
      default:
        if (status >= 400 && status < 500) {
          return new SevallaClientError(
            `Client error (${status})${suffix}`,
            "VALIDATION_ERROR",
            status,
            false,
            apiMessage
          );
        }
        return new SevallaClientError(
          `Server error (${status})${suffix}`,
          "SERVER_ERROR",
          status,
          true,
          apiMessage
        );
    }
  }

  private mapNetworkError(err: unknown): SevallaClientError {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        return new SevallaClientError(
          "Request timed out",
          "TIMEOUT",
          undefined,
          true
        );
      }
      return new SevallaClientError(
        `Network error: ${err.message}`,
        "NETWORK_ERROR",
        undefined,
        false
      );
    }
    return new SevallaClientError(
      "Unknown error occurred",
      "UNKNOWN",
      undefined,
      false
    );
  }
}
