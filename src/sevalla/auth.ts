/**
 * Sevalla Authentication
 *
 * Loads Sevalla API credentials from environment variables.
 *
 * Authentication is Bearer token-based:
 *   - SEVALLA_API_KEY (required) - Bearer token for API access
 *   - SEVALLA_COMPANY_ID (optional) - Company UUID for list operations
 *   - SEVALLA_API_BASE_URL (optional, defaults to https://api.sevalla.com/v2)
 */

import { SEVALLA_API_BASE_URL } from "../constants.js";
import type { SevallaConfig } from "./types.js";

export class SevallaAuthError extends Error {
  constructor(
    message: string,
    public readonly code: "NO_API_KEY"
  ) {
    super(message);
    this.name = "SevallaAuthError";
  }
}

export function loadSevallaConfig(): SevallaConfig {
  const apiKey = process.env["SEVALLA_API_KEY"];
  if (!apiKey) {
    throw new SevallaAuthError(
      "SEVALLA_API_KEY environment variable is required. " +
        "Get your API key from: https://app.sevalla.com → Settings → API Keys.",
      "NO_API_KEY"
    );
  }

  const companyId = process.env["SEVALLA_COMPANY_ID"];
  const baseUrl = process.env["SEVALLA_API_BASE_URL"] ?? SEVALLA_API_BASE_URL;

  return { apiKey, companyId, baseUrl };
}

export function isSevallaConfigured(): boolean {
  return !!process.env["SEVALLA_API_KEY"];
}

/**
 * Get the company ID from environment.
 * Tools can override with a per-request company argument.
 */
export function getCompanyId(): string | undefined {
  return process.env["SEVALLA_COMPANY_ID"];
}
