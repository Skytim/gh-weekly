import { UserError } from "./errors.js";

const RELATIVE_RE = /^(\d+)([dhw])$/i;

export function parseSince(input: string, now = new Date()): Date {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new UserError("--since cannot be empty");
  }

  const relative = RELATIVE_RE.exec(trimmed);
  if (relative) {
    const amount = Number(relative[1]);
    const unit = relative[2].toLowerCase();
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new UserError(`Invalid --since value: ${input}`);
    }
    const ms =
      unit === "d"
        ? amount * 24 * 60 * 60 * 1000
        : unit === "w"
          ? amount * 7 * 24 * 60 * 60 * 1000
          : amount * 60 * 60 * 1000;
    return new Date(now.getTime() - ms);
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new UserError(
      `Invalid --since value: ${input} (use 7d, 2w, 30d, or an ISO date)`,
    );
  }
  return parsed;
}

export function parseRepo(repo: string): { owner: string; name: string } {
  const trimmed = repo.trim();
  const slash = trimmed.indexOf("/");
  if (slash <= 0 || slash === trimmed.length - 1) {
    throw new UserError(`Invalid --repo: ${repo} (expected owner/name)`);
  }
  return {
    owner: trimmed.slice(0, slash),
    name: trimmed.slice(slash + 1),
  };
}
