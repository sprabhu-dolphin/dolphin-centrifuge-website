# DataForSEO Rank Checks

This repo now has a local read-only DataForSEO helper so the weekly SEO brief can use paid rank data without creating a second dashboard or mutating BigQuery.

## Commands

```powershell
npm run dfs:status
npm run dfs:serp
npm run dfs:ranked
```

## Default use

`npm run dfs:serp` checks the current core watchlist:

- `industrial centrifuge`
- `industrial centrifuges`
- `industrial centrifuge machine`
- `industrial continuous centrifuge`
- `industrial centrifuge suppliers`
- `disc stack centrifuge`
- `disk stack centrifuge`
- `disc stack centrifuge price`
- `disc stack centrifuge manufacturers`
- `alfa laval disc stack centrifuge`
- `difference between purifier and clarifier`

It reports whether `dolphincentrifuge.com` appears in the live Google organic SERP and shows the top visible titles/domains for comparison.

## Credential resolution

The helper stays outside the repo secret flow. It reads credentials from one of these existing local routes:

1. `DATAFORSEO_LOGIN` and `DATAFORSEO_PASSWORD`
2. `DATAFORSEO_CREDENTIALS_FILE`
3. `%APPDATA%\dataforseo\credentials.json`

Credential file format:

```json
{
  "login": "your-login",
  "password": "your-password"
}
```

## Why this path

- It keeps the weekly workflow consolidated in the existing local/reporting path.
- It avoids pretending `v_rank_daily` already exists in BigQuery when it does not.
- It gives immediate ranking and SERP-title evidence for the title experiment on:
  - `/industrial-centrifuge/`
  - `/disc-stack-centrifuge/`
