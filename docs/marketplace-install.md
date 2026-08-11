# Marketplace install (Cursor / Grok Bot)

This package loads through the real Cursor plugin path used by Grok Bot:

- Manifest: `.cursor-plugin/plugin.json` (`name`: `orgx-grokbot`)
- Team marketplace listing: `.cursor-plugin/marketplace.json`
- MCP: root `mcp.json` (`mcpServers.orgx` -> `https://mcp.useorgx.com/mcp`)
- Local load: symlink into `~/.cursor/plugins/local/orgx-grokbot`

Compatibility note: .grok-plugin/plugin.json is a thin mirror only.

## Local install (developer machine)

From the repo root:
Use the package script install:local.

That symlinks this repo to ~/.cursor/plugins/local/orgx-grokbot. Restart Cursor / Grok Bot (or reload plugins) so the host picks it up.

Verify packaging anytime with the package check and test scripts.

## Team marketplace import

1. Open the Cursor Dashboard, then Plugins.
2. Choose Import from Repo.
3. Paste this GitHub URL: https://github.com/useorgx/orgx-grokbot-plugin
4. Confirm the listing reads orgx-grokbot from .cursor-plugin/marketplace.json.
5. Install for the team, then open Grok Bot Settings, Plugins and confirm discovery.

## Public marketplace submit

1. Open https://cursor.com/marketplace/publish
2. Submit this repository for public listing.
3. Public listing requires Cursor review. Do not claim the plugin is publicly installable until that review completes.
4. After approval, users can discover it from Grok Bot Settings, Plugins.

## Docs

- https://cursor.com/docs/plugins.md
- https://cursor.com/docs/reference/plugins.md

## Honesty

- Local symlink and team import are available once this repo is on the branch you import.
- Public marketplace availability depends on Cursor review after submit.
- Host lifecycle hooks for Grok Bot remain scaffold/unknown until proven; see docs/client-hook-coverage.md.
