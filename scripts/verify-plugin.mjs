import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function fail(message) {
  console.error(`verify-plugin: ${message}`);
  process.exit(1);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const requiredFiles = [
  "package.json",
  "plugin.manifest.json",
  ".grok-plugin/plugin.json",
  ".mcp.json",
  ".agents/plugins/marketplace.json",
  "docs/client-hook-coverage.md",
  "hooks/scripts/orgx-work-graph-reconcile.mjs",
  "skills/orgx-initiative-ops/SKILL.md",
  "skills/orgx-runtime-reporting/SKILL.md",
  "skills/orgx-delivery-loop/SKILL.md",
  "agents/orchestrator.md",
  "agents/engineering.md",
  "README.md",
  "AGENTS.md",
  "LICENSE",
  "assets/icon.png",
  "assets/logo.png",
];

for (const relative of requiredFiles) {
  const absolute = resolve(root, relative);
  if (!existsSync(absolute)) fail(`missing ${relative}`);
}

const pkg = readJson(resolve(root, "package.json"));
const peerManifest = readJson(resolve(root, "plugin.manifest.json"));
const manifest = readJson(resolve(root, ".grok-plugin/plugin.json"));
const mcp = readJson(resolve(root, ".mcp.json"));
const marketplace = readJson(resolve(root, ".agents/plugins/marketplace.json"));

if (pkg.name !== "@useorgx/grokbot-plugin") fail("package.json name must be @useorgx/grokbot-plugin");
if (pkg.private !== true) fail("package.json private must be true");
if (pkg.type !== "module") fail("package.json type must be module");
if (pkg.license !== "MIT") fail("package.json license must be MIT");
if (!pkg.engines?.node || !String(pkg.engines.node).includes("18")) {
  fail("package.json engines.node must require Node >=18");
}

if (!manifest.name || typeof manifest.name !== "string") fail("plugin.json name required");
if (manifest.name !== "orgx-grokbot-plugin") fail("plugin.json name must be orgx-grokbot-plugin");
if (!manifest.version) fail("plugin.json version required");
if (pkg.version !== manifest.version) {
  fail("package.json version must match .grok-plugin/plugin.json version");
}
if (peerManifest.version !== pkg.version) {
  fail("plugin.manifest.json version must match package.json version");
}
if (peerManifest.plugin_name !== "@useorgx/grokbot-plugin") {
  fail("plugin.manifest.json plugin_name must be @useorgx/grokbot-plugin");
}

if (!Array.isArray(peerManifest.capabilities)) fail("plugin.manifest.json capabilities must be an array");
for (const capability of ["plugin:heartbeat", "plugin:runtime_hooks", "work_graph:reconcile", "mcp:operator_chronicle"]) {
  if (!peerManifest.capabilities.includes(capability)) {
    fail(`plugin.manifest.json missing capability: ${capability}`);
  }
}
if (!Array.isArray(peerManifest.driver_ids) || !peerManifest.driver_ids.includes("grok_bot")) {
  fail("plugin.manifest.json driver_ids must include grok_bot");
}

if (manifest.skills !== "./skills/") fail("plugin.json skills must point to ./skills/");
if (manifest.agents !== "./agents/") fail("plugin.json agents must point to ./agents/");
if (manifest.mcpServers !== "./.mcp.json") fail("plugin.json mcpServers must point to ./.mcp.json");
if (manifest.interface?.displayName !== "OrgX for Grok Bot") {
  fail("plugin.json displayName must be OrgX for Grok Bot");
}
if (manifest.interface?.brandColor !== "#14B8A6") fail("plugin.json brandColor must be #14B8A6");
if (!Array.isArray(manifest.interface?.defaultPrompt) || manifest.interface.defaultPrompt.length !== 3) {
  fail("plugin.json defaultPrompt must contain exactly 3 strings");
}
for (const prompt of manifest.interface.defaultPrompt) {
  if (typeof prompt !== "string" || prompt.length === 0 || prompt.length > 128) {
    fail("each defaultPrompt entry must be a non-empty string <= 128 chars");
  }
}
if (!manifest.interface.defaultPrompt.some((p) => /operator chronicle/i.test(p))) {
  fail("defaultPrompt must include an operator chronicle reporting prompt");
}

for (const assetField of ["composerIcon", "logo"]) {
  const relative = manifest.interface?.[assetField];
  if (!relative) fail(`plugin.json interface.${assetField} required`);
  const assetPath = resolve(root, relative);
  if (!existsSync(assetPath) || !statSync(assetPath).isFile()) {
    fail(`missing asset for ${assetField}: ${relative}`);
  }
}

if (!mcp.mcpServers?.orgx || typeof mcp.mcpServers.orgx !== "object") {
  fail(".mcp.json must define mcpServers.orgx");
}
const orgx = mcp.mcpServers.orgx;
if (orgx.type !== "http") fail("mcpServers.orgx.type must be http");
if (orgx.url !== "https://mcp.useorgx.com/mcp") {
  fail("mcpServers.orgx.url must be https://mcp.useorgx.com/mcp");
}

if (marketplace.name !== "orgx-local") fail("marketplace.json name must be orgx-local");
if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length < 1) {
  fail("marketplace.json must list at least one plugin");
}
if (marketplace.plugins[0].name !== "orgx-grokbot-plugin") {
  fail("marketplace.json must point at orgx-grokbot-plugin");
}

for (const skillDir of ["orgx-initiative-ops", "orgx-runtime-reporting", "orgx-delivery-loop"]) {
  const skillPath = resolve(root, "skills", skillDir, "SKILL.md");
  if (!existsSync(skillPath)) fail(`missing skills/${skillDir}/SKILL.md`);
}

const coverage = readFileSync(resolve(root, "docs/client-hook-coverage.md"), "utf8");
for (const expected of ["Grok Bot", "scaffold", "unknown", "Codex", "Cursor", "get_operator_chronicle"]) {
  if (!coverage.includes(expected)) {
    fail(`client hook coverage must include: ${expected}`);
  }
}

console.log("verify-plugin: ok");
