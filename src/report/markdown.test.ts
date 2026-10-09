import { describe, expect, it } from "vitest";
import type { ActivityBundle } from "../providers/types.js";
import { renderMarkdownReport } from "./markdown.js";

const baseBundle: ActivityBundle = {
  repo: "acme/api",
  author: "alice",
  since: new Date("2026-03-13T00:00:00.000Z"),
  until: new Date("2026-03-20T00:00:00.000Z"),
  source: "github",
  commits: [
    {
      sha: "abc1234",
      message: "fix: handle edge case",
      date: new Date("2026-03-15T10:00:00.000Z"),
      url: "https://github.com/acme/api/commit/abc",
    },
  ],
  pullRequests: [
    {
      number: 42,
      title: "Add weekly report",
      state: "closed",
      merged: true,
      url: "https://github.com/acme/api/pull/42",
      createdAt: new Date("2026-03-14T00:00:00.000Z"),
      updatedAt: new Date("2026-03-16T00:00:00.000Z"),
    },
  ],
  issues: [],
  reviews: [],
};

describe("renderMarkdownReport", () => {
  it("includes repo, commits, and merged PR status", () => {
    const md = renderMarkdownReport(baseBundle);
    expect(md).toContain("# Weekly report: acme/api");
    expect(md).toContain("`abc1234`");
    expect(md).toContain("#42");
    expect(md).toContain("**merged**");
    expect(md).toContain("**Source:** github");
  });
});
