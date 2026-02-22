/**
 * Sevalla Client Factory
 *
 * Shared factory for creating SevallaClient instances from MCP request context.
 * Used by both tools and resources to avoid code duplication.
 *
 * Caches the client instance and invalidates when env vars change.
 */

import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type {
  ServerRequest,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types.js";
import { SevallaClient } from "./client.js";
import { loadSevallaConfig, SevallaAuthError } from "./auth.js";

/**
 * Result type for getSevallaClient - allows callers to handle errors gracefully
 */
export type SevallaClientResult =
  | { success: true; client: SevallaClient }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Client Cache
// ---------------------------------------------------------------------------

let cachedClient: SevallaClient | undefined;
let cachedConfigHash: string | undefined;

function getConfigHash(): string {
  return `${process.env["SEVALLA_API_KEY"] ?? ""}:${process.env["SEVALLA_COMPANY_ID"] ?? ""}:${process.env["SEVALLA_API_BASE_URL"] ?? ""}`;
}

/**
 * Get a SevallaClient from MCP request context.
 *
 * Loads API key from environment variables.
 * Caches the instance and invalidates if env vars change.
 *
 * @param _extra - MCP request handler extra context (reserved for future use)
 * @returns Result with client or error message
 */
export function getSevallaClient(
  _extra: RequestHandlerExtra<ServerRequest, ServerNotification>
): SevallaClientResult {
  try {
    const hash = getConfigHash();
    if (cachedClient && cachedConfigHash === hash) {
      return { success: true, client: cachedClient };
    }

    const config = loadSevallaConfig();
    cachedClient = new SevallaClient(config);
    cachedConfigHash = hash;
    return { success: true, client: cachedClient };
  } catch (err) {
    // Invalidate cache on error
    cachedClient = undefined;
    cachedConfigHash = undefined;

    if (err instanceof SevallaAuthError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown auth error",
    };
  }
}

/**
 * Get a SevallaClient, throwing on error.
 *
 * Use this variant when errors should propagate as exceptions (e.g., resources).
 *
 * @param extra - MCP request handler extra context
 * @returns SevallaClient instance
 * @throws Error if client cannot be created
 */
export function getSevallaClientOrThrow(
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>
): SevallaClient {
  const result = getSevallaClient(extra);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.client;
}
