export interface CommitActivity {
  sha: string;
  message: string;
  date: Date;
  url: string;
}

export interface PullRequestActivity {
  number: number;
  title: string;
  state: string;
  merged: boolean;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueActivity {
  number: number;
  title: string;
  state: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewActivity {
  pullNumber: number;
  state: string;
  submittedAt: Date;
  url: string;
}

export interface ActivityBundle {
  repo: string;
  author: string;
  since: Date;
  until: Date;
  source: "github" | "gitlab";
  commits: CommitActivity[];
  pullRequests: PullRequestActivity[];
  issues: IssueActivity[];
  reviews: ReviewActivity[];
}

export interface FetchActivityParams {
  owner: string;
  repo: string;
  authorLogin: string;
  since: Date;
  until: Date;
}

export interface ActivityProvider {
  readonly id: "github" | "gitlab";
  fetchActivity(params: FetchActivityParams): Promise<ActivityBundle>;
}
