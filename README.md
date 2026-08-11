# OrgX Grok Bot Plugin

Grok Bot plugin package for OrgX:

- OrgX MCP server wiring via `https://mcp.useorgx.com/mcp`
- Operator chronicle reporting for decisions, PRs, artifacts, goals, gaps, and priorities
- Initiative-aware skills plus a delivery-honesty skill for evidence-first status
- Specialist agents for orchestration, engineering, product, design, operations, marketing, and sales
- Lean Work Graph reconciler that writes summary-only local reports (no raw transcripts)

## Why this plugin exists

This repo packages OrgX for Grok Bot using the same family of install surfaces as the Codex, Cursor, and Claude Code plugins:

- `.grok-plugin/plugin.json`
- `.mcp.json`
- `skills/**/SKILL.md`
- `agents/`
- `assets/`

## Structure

```text
.grok-plugin/plugin.json
.mcp.json
.agents/plugins/marketplace.json
plugin.manifest.json
skills/orgx-initiative-ops/SKILL.md
skills/orgx-runtime-reporting/SKILL.md
skills/orgx-delivery-loop/SKILL.md
agents/
hooks/scripts/orgx-work-graph-reconcile.mjs
scripts/verify-plugin.mjs
docs/client-hook-coverage.md
assets/icon.png
assets/logo.png
```

## Included skills

### orgx-initiative-ops

Use OrgX MCP as the source of truth when a task is scoped to an OrgX initiative, workstream, milestone, task, blocker, or decision.

### orgx-runtime-reporting

Keep OrgX updated during live Grok Bot execution with progress, artifacts, blockers, and completion events. Prefer get_operator_chronicle for operator briefings.

### orgx-delivery-loop

Honest delivery states only: researched, drafted, implemented, locally validated, CI-passed, merged, deployed, production-proven. Never call an open PR shipped. Fail closed without receipts. Report engineered today, stuck work, receipt gaps, and one merge or decision for a human.

## Work Graph reconciler

Generate a local summary-only report without credentials using hooks/scripts/orgx-work-graph-reconcile.mjs with an --output path.

Default outbox path is under ~/.config/useorgx/wizard/hooks/events.jsonl. The CLI exits 0 even when the outbox is missing. Reports include counts and a fingerprint placeholder only. No raw transcripts or secrets.

## Hook coverage honesty

Grok Bot host lifecycle hooks are scaffold/unknown until proven in a real host session. This package is not claiming Codex or Cursor hook parity. See docs/client-hook-coverage.md.

## Verification

Use the check and test package scripts from the package root.

## License

MIT
