export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserError";
  }
}

export function formatGitHubError(error: unknown): string {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status?: number }).status;
    const message =
      "message" in error && typeof (error as { message?: unknown }).message === "string"
        ? (error as { message: string }).message
        : "GitHub API request failed";
    if (status === 403) {
      return `${message} (HTTP 403 — check token scopes or rate limit)`;
    }
    if (status) {
      return `${message} (HTTP ${status})`;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}
