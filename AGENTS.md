# AGENTS.md

Guidelines for agents working in useorgx/orgx-grokbot-plugin.

## Project

This repo packages OrgX for Grok Bot / Cursor via the real marketplace path: .cursor-plugin/plugin.json (orgx-grokbot), root mcp.json, skills, specialist agents, delivery honesty guidance, and a lean Work Graph reconciler. .grok-plugin/plugin.json is a compatibility mirror only.

## Install / verify

- install:local — symlink to ~/.cursor/plugins/local/orgx-grokbot
- check / verify — verify Cursor + peer manifests, MCP, skills, agents
- test — Work Graph reconciler unit tests

Do not claim Grok Bot host hook parity with Codex or Cursor unless docs/client-hook-coverage.md has proven evidence.

## Delivery honesty

Never call an open PR shipped. Fail closed without receipts. Prefer evidence-first status language.
