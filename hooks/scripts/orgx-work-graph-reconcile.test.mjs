import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  buildSummaryReport,
  loadHookOutboxRecords,
  main,
  parseArgs,
} from "./orgx-work-graph-reconcile.mjs";

const NOW = "2026-05-07T12:00:00.000Z";

function hookRecord(overrides = {}) {
  return {
    schema_version: "2026-05-07",
    source: "orgx_grokbot_plugin_runtime_hook",
    source_client: "grok_bot",
    event: "PostToolUse",
    session_id: "session-1",
    timestamp: NOW,
    summary: { tool_name: "apply_patch", payload_keys: ["tool_name"] },
    ...overrides,
  };
}

test("parseArgs handles equals, split values, and booleans", () => {
  const args = parseArgs([
    "--outbox",
    "/tmp/events.jsonl",
    "--output=/tmp/report.json",
    "--dry-run",
  ]);
  assert.equal(args.outbox, "/tmp/events.jsonl");
  assert.equal(args.output, "/tmp/report.json");
  assert.equal(args["dry-run"], "true");
});

test("loadHookOutboxRecords returns missing=true when outbox absent", async () => {
  const missingPath = join(tmpdir(), "orgx-grokbot-missing-outbox.jsonl");
  const loaded = await loadHookOutboxRecords(missingPath);
  assert.equal(loaded.missing, true);
  assert.equal(loaded.records.length, 0);
});

test("loadHookOutboxRecords reads jsonl and skips malformed lines", async () => {
  const outbox = join(mkdtempSync(join(tmpdir(), "orgx-grokbot-reconcile-")), "events.jsonl");
  writeFileSync(
    outbox,
    `${JSON.stringify(hookRecord())}\nnot json\n${JSON.stringify(hookRecord({ session_id: "session-2" }))}\n`,
    "utf8"
  );
  const loaded = await loadHookOutboxRecords(outbox);
  assert.equal(loaded.records.length, 2);
  assert.equal(loaded.skipped, 1);
  assert.equal(loaded.missing, false);
});

test("buildSummaryReport emits summary-only counts and fingerprint", () => {
  const report = buildSummaryReport(
    [hookRecord(), hookRecord({ event: "Stop", session_id: "session-2" })],
    { generatedAt: NOW }
  );
  assert.match(report.work_graph_fingerprint, /^wgf_[0-9a-f]{24}$/);
  assert.equal(report.fingerprint_placeholder, report.work_graph_fingerprint);
  assert.equal(report.raw_transcripts_sent, false);
  assert.equal(report.secrets_redacted, true);
  assert.equal(report.source_client, "grok_bot");
  assert.equal(report.counts.records, 2);
  assert.equal(report.counts.sessions, 2);
  assert.equal(report.counts.by_event.PostToolUse, 1);
  assert.equal(report.counts.by_event.Stop, 1);
  assert.equal(Object.hasOwn(report, "transcript"), false);
});

test("main writes report for missing outbox and exits successfully", async () => {
  const dir = mkdtempSync(join(tmpdir(), "orgx-grokbot-main-"));
  const outbox = join(dir, "missing-events.jsonl");
  const output = join(dir, "report.json");
  const result = await main({
    argv: [`--outbox=${outbox}`, `--output=${output}`],
    env: {},
    now: () => new Date(NOW),
  });
  assert.equal(result.ok, true);
  assert.equal(result.outbox_missing, true);
  assert.equal(result.records_read, 0);
  const written = JSON.parse(readFileSync(output, "utf8"));
  assert.equal(written.report.raw_transcripts_sent, false);
  assert.equal(written.work_graph_fingerprint, result.work_graph_fingerprint);
});

test("main writes dry-run report from outbox without credentials", async () => {
  const dir = mkdtempSync(join(tmpdir(), "orgx-grokbot-main-outbox-"));
  const outbox = join(dir, "events.jsonl");
  const output = join(dir, "report.json");
  writeFileSync(outbox, `${JSON.stringify(hookRecord())}\n`, "utf8");
  const result = await main({
    argv: [`--outbox=${outbox}`, `--output=${output}`],
    env: {},
    now: () => new Date(NOW),
  });
  assert.equal(result.ok, true);
  assert.equal(result.records_read, 1);
  const written = JSON.parse(readFileSync(output, "utf8"));
  assert.equal(written.report.counts.records, 1);
  assert.equal(written.report.raw_transcripts_sent, false);
});
