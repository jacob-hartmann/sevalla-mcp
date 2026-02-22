/**
 * Sevalla Module
 *
 * Sevalla API client and authentication utilities.
 */

export { SevallaClient } from "./client.js";
export {
  loadSevallaConfig,
  isSevallaConfigured,
  SevallaAuthError,
  getCompanyId,
} from "./auth.js";
export { getSevallaClient, getSevallaClientOrThrow } from "./client-factory.js";
export {
  SevallaClientError,
  type SevallaConfig,
  type SevallaResult,
  type SevallaSuccess,
  type SevallaError,
  type SevallaErrorCode,
} from "./types.js";
