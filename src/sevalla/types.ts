/**
 * Sevalla API Types
 *
 * Shared types for the Sevalla API client.
 */

// ---------------------------------------------------------------------------
// Error Types
// ---------------------------------------------------------------------------

/** Error codes returned by the Sevalla client */
export type SevallaErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNKNOWN";

/**
 * Typed error for Sevalla API operations.
 */
export class SevallaClientError extends Error {
  constructor(
    message: string,
    public readonly code: SevallaErrorCode,
    public readonly statusCode: number | undefined,
    public readonly retryable: boolean,
    public readonly apiMessage?: string
  ) {
    super(message);
    this.name = "SevallaClientError";
  }
}

// ---------------------------------------------------------------------------
// Result Types
// ---------------------------------------------------------------------------

/** Success result from a Sevalla API call */
export interface SevallaSuccess<T> {
  success: true;
  data: T;
}

/** Error result from a Sevalla API call */
export interface SevallaError {
  success: false;
  error: SevallaClientError;
}

/** Discriminated union for API results */
export type SevallaResult<T> = SevallaSuccess<T> | SevallaError;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Configuration for the Sevalla API client */
export interface SevallaConfig {
  /** Sevalla API key (required) */
  apiKey: string;
  /** Company UUID for list operations (optional) */
  companyId: string | undefined;
  /** API base URL (defaults to https://api.sevalla.com/v2) */
  baseUrl: string;
}
