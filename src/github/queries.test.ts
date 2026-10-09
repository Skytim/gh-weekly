import { describe, expect, it, vi } from "vitest";
import type { Octokit } from "@octokit/rest";
import { fetchCommits, fetchReviews } from "../github/queries.js";
import type { FetchActivityParams } from "../providers/types.js";

const params: FetchActivityParams = {
  owner: "acme",
  repo: "api",
  authorLogin: "alice",
  since: new Date("2026-03-13T00:00:00.000Z"),
  until: new Date("2026-03-20T23:59:59.000Z"),
};

function mockOctokit(handlers: {
  listCommits?: ReturnType<typeof vi.fn>;
  listForRepo?: ReturnType<typeof vi.fn>;
  listReviews?: ReturnType<typeof vi.fn>;
}): Octokit {
  return {
    repos: {
      listCommits: handlers.listCommits ?? vi.fn().mockResolvedValue({ data: [] }),
    },
    issues: {
      listForRepo: handlers.listForRepo ?? vi.fn().mockResolvedValue({ data: [] }),
    },
    pulls: {
      listReviews: handlers.listReviews ?? vi.fn().mockResolvedValue({ data: [] }),
      get: vi.fn(),
    },
  } as unknown as Octokit;
}

describe("fetchCommits", () => {
  it("filters commits outside the window", async () => {
    const listCommits = vi.fn().mockResolvedValue({
      data: [
        {
          sha: "fullsha1",
          html_url: "https://example.com/1",
          author: { login: "alice" },
          commit: {
            message: "feat: one",
            author: { date: "2026-03-15T12:00:00.000Z" },
          },
        },
        {
          sha: "fullsha2",
          html_url: "https://example.com/2",
          author: { login: "alice" },
          commit: {
            message: "old",
            author: { date: "2026-03-01T12:00:00.000Z" },
          },
        },
      ],
    });

    const result = await fetchCommits(mockOctokit({ listCommits }), params);
    expect(result).toHaveLength(1);
    expect(result[0]?.sha).toBe("fullsha");
    expect(result[0]?.message).toBe("feat: one");
  });
});

describe("fetchReviews", () => {
  it("collects reviews by the author on updated PRs", async () => {
    const listForRepo = vi.fn().mockResolvedValue({
      data: [
        {
          number: 9,
          updated_at: "2026-03-15T12:00:00.000Z",
          pull_request: {},
        },
      ],
    });
    const listReviews = vi.fn().mockResolvedValue({
      data: [
        {
          user: { login: "alice" },
          state: "APPROVED",
          submitted_at: "2026-03-15T13:00:00.000Z",
          html_url: "https://example.com/review/1",
        },
        {
          user: { login: "bob" },
          state: "COMMENTED",
          submitted_at: "2026-03-15T14:00:00.000Z",
          html_url: "https://example.com/review/2",
        },
      ],
    });

    const result = await fetchReviews(
      mockOctokit({ listForRepo, listReviews }),
      params,
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.pullNumber).toBe(9);
    expect(result[0]?.state).toBe("APPROVED");
  });
});
