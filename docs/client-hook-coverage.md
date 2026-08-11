# OrgX AI Client Hook Coverage

This audit is the package contract for whether OrgX plugins and skills actually tap the hooks and tool surfaces exposed by each AI client.

## Verdict

Grok Bot host hooks in this package are scaffold/unknown until proven in a real host session.

This package ships MCP wiring, skills, agents, marketplace metadata, and a lean summary-only Work Graph reconciler. It does not yet prove Grok Bot lifecycle hook parity with Codex or Cursor.

Coverage is not sufficient yet for the full operator experience across every client. Codex and Cursor have stronger proven hook or MCP surfaces in their own packages. Grok Bot remains an honest scaffold until host evidence exists.

## Required product behavior

1. A user asks for yesterday, week, 30-day, decisions, artifacts, PRs, goals, gaps, or priorities.
2. The client calls get_operator_chronicle when the callable tool list exposes it.
3. If the client schema is stale, fall back to orgx_recommend or _orgx_recommend with mode: "morning_brief".
4. Lead with reportingNarrative.briefMarkdown, then expose drill-down IDs.
5. Passive hooks, when they exist, are a backstop only — never a substitute for live MCP calls.

## Coverage matrix

| Client | Current OrgX surface | Hook/support level | Chronicle route | Missing for seamless UX |
| --- | --- | --- | --- | --- |
| Grok Bot | This package: .cursor-plugin/plugin.json, mcp.json, .grok-plugin mirror, skills, agents, lean reconciler. | scaffold/unknown — no proven host lifecycle hooks yet. | Preferred: get_operator_chronicle. Fallback: orgx_recommend morning_brief. | Prove host hook events, tool list refresh, and durable MCP auth in a real Grok Bot session. |
| Codex | Separate orgx-codex-plugin with proven Stop-hook reconciliation in that package. | Stronger local hook coverage than Grok Bot. | Preferred: get_operator_chronicle. | Not packaged here; see Codex plugin docs. |
| Cursor | Separate cursor-plugin with MCP plus rules/commands. | MCP viable; no matching passive lifecycle package claimed here. | Preferred: get_operator_chronicle. | Not packaged here; see Cursor plugin docs. |

## Evidence gates

- Hosted MCP bootstrap advertises get_operator_chronicle.
- Active client callable tool list exposes get_operator_chronicle, or stale-client fallback is proven.
- Summary-only reconciler keeps raw_transcripts_sent: false.
- Grok Bot host hooks remain labeled scaffold/unknown until runtime proof exists.

Do not claim Codex or Cursor parity from this package alone.
Grok Bot also loads via the real Cursor path: .cursor-plugin/plugin.json, root mcp.json, and scripts/install-local.mjs (see docs/marketplace-install.md).
