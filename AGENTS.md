# Dolphin Website Agent Rules

These local rules apply to this Dolphin Centrifuge Astro website repo.

## API-First Platform Rule

Quick line: API first, browser second.

For any task with Sanjay that involves an external platform, SaaS dashboard, analytics tool, CRM, email service, Cloudflare, StatCounter, Google service, Google Ads, or similar system:

1. Check whether an official API, CLI, MCP connector, export endpoint, webhook, or SDK exists before using browser/dashboard automation.
2. Check whether safe local credentials, environment variables, or connected tools are already available without exposing secrets.
3. If an API path exists but credentials are missing, offer Sanjay the API path and ask whether he wants to provide or create the needed credential.
4. Use browser automation only when no API path exists, the API cannot answer the task, Sanjay chooses the browser path, or visual/login verification is required.
5. Do not store API keys, passwords, tokens, or secret credentials in this repo, Obsidian, GitHub, or chat.

