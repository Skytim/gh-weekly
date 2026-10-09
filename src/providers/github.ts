import { Octokit } from "@octokit/rest";
import { buildActivityBundle } from "../github/queries.js";
import { formatGitHubError } from "../util/errors.js";
import type { ActivityProvider, FetchActivityParams, ActivityBundle } from "./types.js";

export class GitHubProvider implements ActivityProvider {
  readonly id = "github" as const;
  private readonly octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async getViewerLogin(): Promise<string> {
    try {
      const { data } = await this.octokit.users.getAuthenticated();
      return data.login;
    } catch (error) {
      throw new Error(formatGitHubError(error));
    }
  }

  async fetchActivity(params: FetchActivityParams): Promise<ActivityBundle> {
    try {
      return await buildActivityBundle(this.octokit, params);
    } catch (error) {
      throw new Error(formatGitHubError(error));
    }
  }
}
