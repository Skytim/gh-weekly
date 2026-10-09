import type { ActivityBundle } from "../providers/types.js";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDateTime(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function prStatus(pr: { state: string; merged: boolean }): string {
  if (pr.merged) {
    return "merged";
  }
  return pr.state;
}

export function renderMarkdownReport(bundle: ActivityBundle): string {
  const lines: string[] = [];

  lines.push(`# Weekly report: ${bundle.repo}`);
  lines.push("");
  lines.push(
    `**Author:** ${bundle.author}  `,
    `**Period:** ${formatDate(bundle.since)} → ${formatDate(bundle.until)}  `,
    `**Source:** ${bundle.source}`,
  );
  lines.push("");

  lines.push("## Commits");
  lines.push("");
  if (bundle.commits.length === 0) {
    lines.push("_No commits in this period._");
  } else {
    for (const commit of bundle.commits) {
      lines.push(
        `- [\`${commit.sha}\`](${commit.url}) ${commit.message} — ${formatDateTime(commit.date)}`,
      );
    }
  }
  lines.push("");

  lines.push("## Pull requests");
  lines.push("");
  if (bundle.pullRequests.length === 0) {
    lines.push("_No pull requests in this period._");
  } else {
    for (const pr of bundle.pullRequests) {
      lines.push(
        `- [#${pr.number}](${pr.url}) ${pr.title} — **${prStatus(pr)}** (updated ${formatDateTime(pr.updatedAt)})`,
      );
    }
  }
  lines.push("");

  lines.push("## Issues");
  lines.push("");
  if (bundle.issues.length === 0) {
    lines.push("_No issues in this period._");
  } else {
    for (const issue of bundle.issues) {
      lines.push(
        `- [#${issue.number}](${issue.url}) ${issue.title} — **${issue.state}** (updated ${formatDateTime(issue.updatedAt)})`,
      );
    }
  }
  lines.push("");

  lines.push("## Reviews");
  lines.push("");
  if (bundle.reviews.length === 0) {
    lines.push("_No pull request reviews in this period._");
  } else {
    for (const review of bundle.reviews) {
      lines.push(
        `- PR [#${review.pullNumber}](${review.url}) — **${review.state}** (${formatDateTime(review.submittedAt)})`,
      );
    }
  }
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push(`_Generated at ${formatDateTime(new Date())}_`);

  return lines.join("\n");
}

export function appendSummarySection(
  report: string,
  summary: string,
): string {
  return `${report.trimEnd()}\n\n## Summary\n\n${summary.trim()}\n`;
}
