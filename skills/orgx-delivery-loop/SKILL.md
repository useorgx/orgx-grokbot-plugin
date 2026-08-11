---
name: orgx-delivery-loop
description: Use when Grok Bot must report honest delivery state with receipts, never claiming an open PR is shipped, and surface engineered today, stuck work, receipt gaps, and one human merge or decision.
---

# OrgX Delivery Loop

Use this skill whenever status, shipping, or progress claims are made.

## Honest delivery states

Only claim a state when you have receipts. Allowed states, in order:

- `researched` — sources reviewed; notes or links exist
- `drafted` — change sketched locally; not yet implemented
- `implemented` — code or artifact exists in the working tree
- `locally validated` — tests or checks ran on this machine and passed
- `CI-passed` — remote CI green for the exact commit
- `merged` — landed on the target branch
- `deployed` — released to an environment with deploy evidence
- `production-proven` — live behavior confirmed with production evidence

## Hard rules

- Never call an open PR shipped, done, or production-proven.
- Fail closed without receipts: if proof is missing, stay at the last proven state.
- Prefer "implemented, awaiting review" over "shipped" when a PR is still open.
- Do not invent CI, merge, deploy, or production evidence.

## Operator readout

When asked for status, report all four:

1. **Engineered today** — concrete diffs, artifacts, or decisions with receipts.
2. **Stuck** — blockers, missing context, or waiting-on-human items.
3. **Receipt gaps** — claims that lack CI, merge, deploy, or production proof.
4. **One merge or decision** — the single next human action that unblocks value.

## Quality bar

- Evidence-first language only.
- Use `source_client=grok_bot` when writing to OrgX.
- Register artifacts and blockers in OrgX when IDs are available.
- Keep secrets out of status: no tokens, cookies, API keys, or raw transcripts.
