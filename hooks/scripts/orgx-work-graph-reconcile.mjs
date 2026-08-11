#!/usr/bin/env node

import { createReadStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { pathToFileURL } from "node:url";

const DEFAULT_OUTBOX = join(
  homedir(),
  ".config",
  "useorgx",
  "wizard",
  "hooks",
  "events.jsonl"
);

export function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const [rawKey, ...rest] = arg.slice(2).split("=");
    const key = rawKey.trim();
    if (!key) continue;
    if (rest.length > 0) {
      args[key] = rest.join("=");
    } else if (argv[index + 1] && !argv[index + 1].startsWith("--")) {
      args[key] = argv[index + 1];
      index += 1;
    } else {
      args[key] = "true";
    }
  }
  return args;
}

export function hashString(value, length = 24) {
  return createHash("sha256").update(String(value)).digest("hex").slice(0, length);
}

export async function loadHookOutboxRecords(outboxPath) {
  if (!existsSync(outboxPath)) {
    return { records: [], skipped: 0, missing: true, path: outboxPath };
  }
  const records = [];
  let skipped = 0;
  const rl = createInterface({ input: createReadStream(outboxPath, { encoding: "utf8" }), crlfDelay: Infinity });
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed);
      if (!parsed || typeof parsed !== "object") {
        skipped += 1;
        continue;
      }
      records.push({
        event: typeof parsed.event === "string" ? parsed.event : "unknown",
        source_client: typeof parsed.source_client === "string" ? parsed.source_client : "unknown",
        session_id: typeof parsed.session_id === "string" ? parsed.session_id : undefined,
        timestamp: typeof parsed.timestamp === "string" ? parsed.timestamp : undefined,
        summary: parsed.summary && typeof parsed.summary === "object" ? {
          tool_name: typeof parsed.summary.tool_name === "string" ? parsed.summary.tool_name : undefined,
          payload_keys: Array.isArray(parsed.summary.payload_keys) ? parsed.summary.payload_keys.filter((k) => typeof k === "string") : [],
        } : {},
      });
    } catch {
      skipped += 1;
    }
  }
  return { records, skipped, missing: false, path: outboxPath };
}

export function buildSummaryReport(records, options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const byEvent = {};
  const byClient = {};
  const sessions = new Set();
  for (const record of records) {
    byEvent[record.event] = (byEvent[record.event] || 0) + 1;
    byClient[record.source_client] = (byClient[record.source_client] || 0) + 1;
    if (record.session_id) sessions.add(record.session_id);
  }
  const fingerprintSeed = JSON.stringify({
    counts: { records: records.length, sessions: sessions.size, byEvent, byClient },
    generatedAt,
  });
  const work_graph_fingerprint = `wgf_${hashString(fingerprintSeed, 24)}`;
  return {
    schema: "orgx.work_graph.summary.v1",
    source_client: "grok_bot",
    generated_at: generatedAt,
    work_graph_fingerprint,
    fingerprint_placeholder: work_graph_fingerprint,
    raw_transcripts_sent: false,
    secrets_redacted: true,
    counts: {
      records: records.length,
      sessions: sessions.size,
      by_event: byEvent,
      by_source_client: byClient,
    },
    note: "Summary-only report. No raw transcripts or secrets are included.",
  };
}

export async function main(options = {}) {
  const argv = options.argv || process.argv.slice(2);
  const env = options.env || process.env;
  const now = options.now || (() => new Date());
  const args = parseArgs(argv);
  const outbox = args.outbox || env.ORGX_WIZARD_HOOK_OUTBOX || DEFAULT_OUTBOX;
  const loaded = await loadHookOutboxRecords(outbox);
  const report = buildSummaryReport(loaded.records, {
    generatedAt: now().toISOString(),
  });
  const result = {
    ok: true,
    outbox,
    outbox_missing: loaded.missing,
    records_read: loaded.records.length,
    records_skipped: loaded.skipped,
    work_graph_fingerprint: report.work_graph_fingerprint,
    report,
  };
  if (args.output) {
    mkdirSync(dirname(args.output), { recursive: true });
    writeFileSync(args.output, JSON.stringify(result, null, 2) + "\n", "utf8");
  } else {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  }
  return result;
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  main().then(() => {
    process.exitCode = 0;
  }).catch((error) => {
    console.error(String(error && error.stack ? error.stack : error));
    process.exitCode = 0;
  });
}
