---
name: orgx-initiative-ops
description: Use when Grok Bot is working on an OrgX initiative, workstream, milestone, task, blocker, or decision and needs current OrgX state.
---

# OrgX Initiative Ops

The connection selects `profile=v2`. Reconnect after plugin or server updates
and use only names in its authenticated callable inventory.

1. Read `orgx_get_workspace_context` before editing. For broad reporting, call
   `orgx_get_operator_brief` and lead with `chronicle.reportingNarrative.briefMarkdown`.
   Use `orgx_get_next_actions` for priorities and blockers.
2. Use `orgx_search` and `orgx_inspect` to find existing work before creating
   parallel structure. Read one initiative with `orgx_get_initiative_progress`.
3. Use the specific create or update operation for the current work type.
   Validate a proposed hierarchy with `orgx_validate_initiative_plan` before
   `orgx_create_initiative_hierarchy`; creation and launching are separate calls.
4. Attach a durable deliverable with `orgx_attach_artifact`. Capture judgment
   requests with `orgx_capture_decision`; open `orgx_open_decision_review` and
   share its `data.review_url` with the person. The model cannot approve it.
5. Keep the returned run or operation ID after launching or delegating. Read
   `orgx_get_operation_status` before claiming an outcome. Honor its next poll
   interval and report queued, held, or running work as still in progress.
6. Verify the task, preserve a complete portable work receipt, and report the
   actual outcome of `orgx_complete_work_with_proof`, including review gates.

If a write's outcome is uncertain, reconcile status first. Retry only if its
documented operation supports replay, with identical input and the original
idempotency key. Never guess an alias or call an app-only human callback.
Supply client attribution only when the advertised input schema permits it.
