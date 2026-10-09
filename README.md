# gh-weekly

AI-assisted **weekly reports** and standup summaries from your **GitHub** activity (commits, pull requests, issues, reviews).

Not related to [kamranahmedse/git-standup](https://github.com/kamranahmedse/git-standup) (local `git log` only). This tool uses the **GitHub API** and optional **BYOK** LLM keys.

## Status

Early development — CLI MVP in progress.

## Planned usage

```bash
export GITHUB_TOKEN=ghp_...
export OPENAI_API_KEY=sk-...

gh-weekly report \
  --repo myorg/api \
  --since 7d \
  --format markdown \
  --out weekly.md
```

## Configuration

- Config file (optional): `~/.config/gh-weekly/config.yaml`
- Secrets: environment variables only (never commit tokens or API keys)

## License

MIT (TBD)
