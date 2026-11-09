# OrgX for Hermes Agent (portable plugin candidate)

This subdirectory is a **candidate package**, not an approved Hermes catalog listing.

OrgX provides proof for AI-delivered work. Agents in ChatGPT, Claude, Cursor, and Codex share one record of decisions and work receipts. This Hermes adapter adds a workflow skill and a Streamable HTTP MCP declaration pointing to the hosted OrgX server.

## Install locally for review

Use an explicit install of this subdirectory, and enable it only with the user’s approval:

```bash
hermes plugins install useorgx/orgx-grokbot-plugin#integrations/hermes --no-enable
hermes plugins enable orgx-hermes
```

**OAuth configuration limitation:** Agent Plugins v1 `mcp.json` describes a remote URL but cannot declare Hermes' `auth: oauth` property. This package does **not** claim automatic authenticated operation on first enable. Until Hermes supports an equivalent portable declaration, an authorized user must add the following native override to `~/.hermes/config.yaml`:

```yaml
mcp_servers:
  orgx:
    url: "https://mcp.useorgx.com/mcp"
    auth: oauth
    trust: untrusted
```

Then, from an interactive terminal, run `hermes mcp login orgx` and complete the browser authorization for a chosen OrgX workspace. Hermes' existing `config.yaml` entry replaces the portable server entry, including its trust policy; the explicit `trust: untrusted` line above preserves approval gating for write-capable operations. Do not insert tokens into this repository, `mcp.json` or Hermes source code.

## Security and behavior

- This package makes network requests to `mcp.useorgx.com` only through Hermes' standard remote MCP client. It does not ship executable scripts, spawn shells, read local files or store credentials.
- OrgX may disclose workspace data after the user authorizes it, and some discovered tools can mutate workspace state. The package requests `untrusted` tool-call approval semantics for non-read-only MCP operations.
- No telemetry is added by this package. No spending, publishing, approval or unreviewed background work is authorized.
- Verify `hermes plugins validate ./integrations/hermes --install-deps` and an actual authenticated `hermes mcp login orgx` / `tools/list` / read-only request before proposing a catalog PR.
- This submission is **not** claimed to be end-to-end tested, catalog accepted or one-click OAuth ready. Independent environment verification is outstanding.

Official references: https://hermes-agent.nousresearch.com/docs/developer-guide/plugins/catalog-submission and https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp.
