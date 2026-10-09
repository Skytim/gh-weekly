import { Command } from "commander";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { runReport } from "./cli/report.js";
import { UserError } from "./util/errors.js";

function readVersion(): string {
  try {
    const dir = dirname(fileURLToPath(import.meta.url));
    const pkgPath = join(dir, "..", "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

async function main(): Promise<void> {
  const program = new Command();

  program
    .name("gh-weekly")
    .description("GitHub activity weekly reports with optional AI summarization")
    .version(readVersion());

  program
    .command("report")
    .description("Generate a weekly activity report for a repository")
    .requiredOption("--repo <owner/name>", "Repository to report on")
    .option("--since <value>", "Start of period (7d, 2w, ISO date)", "7d")
    .option("--format <type>", "Output format", "markdown")
    .option("--out <file>", "Write report to file instead of stdout")
    .option("--provider <name>", "Activity provider", "github")
    .action(async (opts) => {
      await runReport({
        repo: opts.repo,
        since: opts.since,
        format: opts.format,
        out: opts.out,
        provider: opts.provider,
      });
    });

  await program.parseAsync(process.argv);
}

main().catch((error) => {
  if (error instanceof UserError) {
    console.error(error.message);
    process.exit(1);
  }
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
