import { writeFile } from "node:fs/promises";
import { loadConfig, resolveOpenAiModel } from "../config/load.js";
import { GitHubProvider } from "../providers/github.js";
import { appendSummarySection, renderMarkdownReport } from "../report/markdown.js";
import { summarizeReport } from "../report/summarize.js";
import { UserError } from "../util/errors.js";
import { parseRepo, parseSince } from "../util/since.js";

export interface ReportOptions {
  repo: string;
  since: string;
  format: string;
  out?: string;
  provider: string;
}

export async function runReport(options: ReportOptions): Promise<void> {
  if (options.format !== "markdown") {
    throw new UserError(`Unsupported --format: ${options.format} (only markdown is supported)`);
  }

  if (options.provider !== "github") {
    throw new UserError(
      `Unsupported --provider: ${options.provider} (only github is supported in MVP)`,
    );
  }

  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) {
    throw new UserError("GITHUB_TOKEN environment variable is required");
  }

  const { owner, name } = parseRepo(options.repo);
  const since = parseSince(options.since);
  const until = new Date();

  const config = await loadConfig();
  const github = new GitHubProvider(token);
  const author = await github.getViewerLogin();

  const bundle = await github.fetchActivity({
    owner,
    repo: name,
    authorLogin: author,
    since,
    until,
  });

  let report = renderMarkdownReport(bundle);

  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (openAiKey) {
    try {
      const summary = await summarizeReport({
        apiKey: openAiKey,
        model: resolveOpenAiModel(config),
        reportMarkdown: report,
      });
      report = appendSummarySection(report, summary);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "OpenAI summarization failed";
      console.error(`Warning: ${message}`);
    }
  }

  if (options.out) {
    await writeFile(options.out, `${report}\n`, "utf8");
  } else {
    process.stdout.write(`${report}\n`);
  }
}
