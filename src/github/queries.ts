import type { Octokit } from "@octokit/rest";
import type {
  ActivityBundle,
  CommitActivity,
  FetchActivityParams,
  IssueActivity,
  PullRequestActivity,
  ReviewActivity,
} from "../providers/types.js";

export const MAX_PRS_FOR_REVIEWS = 50;

function firstLine(message: string): string {
  const line = message.split("\n")[0]?.trim();
  return line || "(no message)";
}

function isAuthorCommit(
  commit: {
    author?: { login?: string | null } | null;
    commit: { author?: { name?: string | null; email?: string | null } | null };
  },
  authorLogin: string,
): boolean {
  if (commit.author?.login?.toLowerCase() === authorLogin.toLowerCase()) {
    return true;
  }
  return false;
}

export async function fetchCommits(
  octokit: Octokit,
  params: FetchActivityParams,
): Promise<CommitActivity[]> {
  const results: CommitActivity[] = [];
  const sinceIso = params.since.toISOString();

  for (let page = 1; page <= 20; page++) {
    const response = await octokit.repos.listCommits({
      owner: params.owner,
      repo: params.repo,
      author: params.authorLogin,
      since: sinceIso,
      per_page: 100,
      page,
    });

    if (response.data.length === 0) {
      break;
    }

    for (const item of response.data) {
      const date = item.commit.author?.date
        ? new Date(item.commit.author.date)
        : null;
      if (!date || date < params.since || date > params.until) {
        continue;
      }
      if (!isAuthorCommit(item, params.authorLogin)) {
        continue;
      }
      results.push({
        sha: item.sha.slice(0, 7),
        message: firstLine(item.commit.message),
        date,
        url: item.html_url,
      });
    }

    if (response.data.length < 100) {
      break;
    }
  }

  return results.sort((a, b) => b.date.getTime() - a.date.getTime());
}

type ListedIssue = {
  number: number;
  title: string;
  state: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  user?: { login?: string | null } | null;
  pull_request?: unknown;
};

export async function fetchIssuesAndPulls(
  octokit: Octokit,
  params: FetchActivityParams,
): Promise<{ issues: IssueActivity[]; pullRequests: PullRequestActivity[] }> {
  const issues: IssueActivity[] = [];
  const pullRequests: PullRequestActivity[] = [];
  const sinceIso = params.since.toISOString();

  for (let page = 1; page <= 20; page++) {
    const response = await octokit.issues.listForRepo({
      owner: params.owner,
      repo: params.repo,
      state: "all",
      since: sinceIso,
      per_page: 100,
      page,
    });

    if (response.data.length === 0) {
      break;
    }

    for (const item of response.data as ListedIssue[]) {
      if (item.user?.login?.toLowerCase() !== params.authorLogin.toLowerCase()) {
        continue;
      }
      const updatedAt = new Date(item.updated_at);
      if (updatedAt < params.since || updatedAt > params.until) {
        continue;
      }

      if (item.pull_request) {
        const prDetail = await octokit.pulls.get({
          owner: params.owner,
          repo: params.repo,
          pull_number: item.number,
        });
        pullRequests.push({
          number: item.number,
          title: item.title,
          state: prDetail.data.state,
          merged: Boolean(prDetail.data.merged_at),
          url: item.html_url,
          createdAt: new Date(item.created_at),
          updatedAt,
        });
      } else {
        issues.push({
          number: item.number,
          title: item.title,
          state: item.state,
          url: item.html_url,
          createdAt: new Date(item.created_at),
          updatedAt,
        });
      }
    }

    if (response.data.length < 100) {
      break;
    }
  }

  const byUpdated = (a: { updatedAt: Date }, b: { updatedAt: Date }) =>
    b.updatedAt.getTime() - a.updatedAt.getTime();

  return {
    issues: issues.sort(byUpdated),
    pullRequests: pullRequests.sort(byUpdated),
  };
}

export async function listPullNumbersUpdatedSince(
  octokit: Octokit,
  params: FetchActivityParams,
): Promise<number[]> {
  const numbers: number[] = [];
  const sinceIso = params.since.toISOString();

  for (let page = 1; page <= 10; page++) {
    const response = await octokit.issues.listForRepo({
      owner: params.owner,
      repo: params.repo,
      state: "all",
      since: sinceIso,
      per_page: 100,
      page,
    });

    if (response.data.length === 0) {
      break;
    }

    for (const item of response.data as ListedIssue[]) {
      if (!item.pull_request) {
        continue;
      }
      const updatedAt = new Date(item.updated_at);
      if (updatedAt < params.since || updatedAt > params.until) {
        continue;
      }
      numbers.push(item.number);
    }

    if (response.data.length < 100) {
      break;
    }
  }

  return [...new Set(numbers)].slice(0, MAX_PRS_FOR_REVIEWS);
}

export async function fetchReviews(
  octokit: Octokit,
  params: FetchActivityParams,
): Promise<ReviewActivity[]> {
  const reviews: ReviewActivity[] = [];
  const candidates = await listPullNumbersUpdatedSince(octokit, params);

  for (const pullNumber of candidates) {
    const response = await octokit.pulls.listReviews({
      owner: params.owner,
      repo: params.repo,
      pull_number: pullNumber,
      per_page: 100,
    });

    for (const review of response.data) {
      if (
        review.user?.login?.toLowerCase() !== params.authorLogin.toLowerCase()
      ) {
        continue;
      }
      if (!review.submitted_at) {
        continue;
      }
      const submittedAt = new Date(review.submitted_at);
      if (submittedAt < params.since || submittedAt > params.until) {
        continue;
      }
      reviews.push({
        pullNumber,
        state: review.state,
        submittedAt,
        url: review.html_url,
      });
    }
  }

  return reviews.sort(
    (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime(),
  );
}

export async function buildActivityBundle(
  octokit: Octokit,
  params: FetchActivityParams,
): Promise<ActivityBundle> {
  const commits = await fetchCommits(octokit, params);
  const { issues, pullRequests } = await fetchIssuesAndPulls(octokit, params);
  const reviews = await fetchReviews(octokit, params);

  return {
    repo: `${params.owner}/${params.repo}`,
    author: params.authorLogin,
    since: params.since,
    until: params.until,
    source: "github",
    commits,
    pullRequests,
    issues,
    reviews,
  };
}
