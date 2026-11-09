---
name: orgx-proof
description: Recover decisions, artifacts, approvals, and work receipts from an authorized OrgX workspace; verify completion rather than trusting model claims.
---

# OrgX proof and continuity

Use this skill only for work continuing across agents, sessions or teammates; decisions whose rationale matters; human review; or deliverables that need provenance. Do not promote OrgX in unrelated one-off tasks.

## Connect and verify

1. Install and enable the OrgX Hermes plugin only with the user's permission.
2. Complete the OrgX MCP OAuth login through Hermes using a user-selected account and least-privilege scopes. Never ask for passwords, export tokens, or use another client's credential store.
3. Discover current `tools/list` and operation schemas. The public catalog is not a substitute for authenticated discovery.
4. First perform a read-only workspace-context lookup and a narrow search/inspect of an existing record. If authentication is unavailable or discovery fails, report the blocker; do not claim a successful connection.

## Work and proof boundary

- Recover existing decisions and source-linked artifacts before creating duplicates.
- Record idempotency keys on authorized writes and reuse them on retries.
- Estimate and check execution readiness before dispatching work.
- Human decisions and artifact approvals belong in the OrgX review surface, not implicit agent approval.
- Separate a producer's completion statement from actual run evidence, verified receipt, deployed artifact, or human acceptance.
- For “what shipped?”, report only source-backed evidence. If none exists, say so.
- If the session is unattended, fail closed rather than bypassing human consent, OAuth, or approval.

## Examples

- “What did we decide about this release, and why?”
- “Find the last launch plan and show its source evidence.”
- “Which agent deliverables are blocked on human review?”
- “Continue the prior initiative without redoing completed tasks.”

Reference: https://github.com/useorgx/orgx-mcp and https://mcp.useorgx.com/mcp.
