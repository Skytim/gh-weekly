# gh-weekly

AI-assisted **weekly reports** and standup summaries from your **GitHub** activity (commits, pull requests, issues, reviews).

Not related to [kamranahmedse/git-standup](https://github.com/kamranahmedse/git-standup) (local `git log` only). This tool uses the **GitHub API** and optional **BYOK** LLM keys.

## Requirements

- Node.js 20+
- `GITHUB_TOKEN` with `repo` scope (for private repositories) or `public_repo` for public repos only

## Install (local development)

```bash
npm install
npm run build
npm link   # optional: install `gh-weekly` globally
```

Run without linking:

```bash
npm run dev -- report --repo myorg/api --since 7d
```

## Usage

```bash
export GITHUB_TOKEN=ghp_...
export OPENAI_API_KEY=sk-...   # optional — adds a Summary section

gh-weekly report \
  --repo myorg/api \
  --since 7d \
  --format markdown \
  --out weekly.md
```

### Options

| Flag | Default | Description |
|------|---------|-------------|
| `--repo` | _(required)_ | Repository `owner/name` |
| `--since` | `7d` | Start of period: `7d`, `2w`, `30d`, `24h`, or ISO date |
| `--format` | `markdown` | Only `markdown` in MVP |
| `--out` | stdout | Output file path |
| `--provider` | `github` | `gitlab` is reserved (not implemented yet) |

## Configuration

Optional config file: `~/.config/gh-weekly/config.yaml`

```yaml
openai:
  model: gpt-4o-mini
gitlab:
  enabled: false
```

Secrets: **environment variables only** (never commit tokens or API keys).

## What gets included

For the authenticated user (`GITHUB_TOKEN` owner) and the given repository:

- **Commits** authored in the period
- **Pull requests** opened by you and updated in the period
- **Issues** opened by you and updated in the period
- **Reviews** you submitted on PRs updated in the period (scans up to 50 PRs)

Issues and pull requests use GitHub’s `since` filter (last updated). Commit times use author date.

## Scripts

```bash
npm test        # vitest
npm run typecheck
npm run build
```

## License

MIT — see [LICENSE](LICENSE).
