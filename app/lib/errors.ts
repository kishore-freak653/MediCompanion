/**
 * Centralized error types and user-facing messages.
 * Avoids exposing internal errors to users and supports i18n later.
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly userMessage: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const ErrorMessages = {
  AUTH: {
    LOGIN_FAILED: "Invalid email or password. Please try again.",
    SESSION_EXPIRED: "Your session has expired. Please sign in again.",
    UNAUTHORIZED: "You don't have permission to perform this action.",
  },
  MEDICATIONS: {
    FETCH_FAILED: "Failed to load medications. Please refresh the page.",
    ADD_FAILED: "Failed to add medication. Please try again.",
    UPDATE_FAILED: "Failed to update. Please try again.",
    DELETE_FAILED: "Failed to delete. Please try again.",
  },
  LOGS: {
    FETCH_FAILED: "Failed to load history. Please try again.",
    MARK_TAKEN_FAILED: "Failed to mark as taken. Please try again.",
    STATS_FAILED: "Failed to load statistics. Please try again.",
  },
  GENERIC: "Something went wrong. Please try again.",
} as const;

/** Type guard for standard Error */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/** Get a safe user-facing message from an unknown thrown value */
export function getUserMessage(error: unknown): string {
  if (isError(error)) {
    if (error.message?.includes("Invalid login")) return ErrorMessages.AUTH.LOGIN_FAILED;
    if (error.message?.includes("session")) return ErrorMessages.AUTH.SESSION_EXPIRED;
    return error.message;
  }
  return ErrorMessages.GENERIC;
}
