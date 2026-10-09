import { UserError } from "../util/errors.js";
import type { ActivityProvider, FetchActivityParams, ActivityBundle } from "./types.js";

export class GitLabProvider implements ActivityProvider {
  readonly id = "gitlab" as const;

  async fetchActivity(_params: FetchActivityParams): Promise<ActivityBundle> {
    throw new UserError(
      "GitLab is not supported yet. Use GitHub (--provider github) for now.",
    );
  }
}
