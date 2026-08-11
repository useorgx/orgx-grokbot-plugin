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
  ".cursor-plugin/plugin.json",
  ".cursor-plugin/marketplace.json",
  "mcp.json",
  ".mcp.json",
  ".grok-plugin/plugin.json",
  ".agents/plugins/marketplace.json",
  "scripts/install-local.mjs",
  "docs/client-hook-coverage.md",
  "docs/marketplace-install.md",
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
const cursorManifest = readJson(resolve(root, ".cursor-plugin/plugin.json"));
const cursorMarketplace = readJson(resolve(root, ".cursor-plugin/marketplace.json"));
const mcp = readJson(resolve(root, "mcp.json"));
const mcpDot = readJson(resolve(root, ".mcp.json"));
const grokManifest = readJson(resolve(root, ".grok-plugin/plugin.json"));
const agentsMarketplace = readJson(resolve(root, ".agents/plugins/marketplace.json"));

if (pkg.name !== "@useorgx/grokbot-plugin") fail("package.json name must be @useorgx/grokbot-plugin");
if (pkg.private !== true) fail("package.json private must be true");
if (pkg.type !== "module") fail("package.json type must be module");
if (pkg.license !== "MIT") fail("package.json license must be MIT");
if (!pkg.engines?.node || !String(pkg.engines.node).includes("18")) {
  fail("package.json engines.node must require Node >=18");
}
if (pkg.scripts?.["install:local"] !== "node ./scripts/install-local.mjs") {
  fail('package.json scripts.install:local must be "node ./scripts/install-local.mjs"');
}
if (!Array.isArray(pkg.files) || !pkg.files.includes(".cursor-plugin/") || !pkg.files.includes("mcp.json") || !pkg.files.includes("scripts/install-local.mjs")) {
  fail("package.json files must include .cursor-plugin/, mcp.json, and scripts/install-local.mjs");
}

if (cursorManifest.name !== "orgx-grokbot") fail(".cursor-plugin/plugin.json name must be orgx-grokbot");
if (!cursorManifest.version) fail(".cursor-plugin/plugin.json version required");
if (pkg.version !== cursorManifest.version) {
  fail("package.json version must match .cursor-plugin/plugin.json version");
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

if (cursorManifest.skills !== "skills") fail(".cursor-plugin/plugin.json skills must be skills");
if (cursorManifest.agents !== "agents") fail(".cursor-plugin/plugin.json agents must be agents");
if (cursorManifest.mcpServers !== "mcp.json") fail(".cursor-plugin/plugin.json mcpServers must be mcp.json");
if (cursorManifest.logo !== "assets/logo.png") fail(".cursor-plugin/plugin.json logo must be assets/logo.png");
if (!existsSync(resolve(root, cursorManifest.logo)) || !statSync(resolve(root, cursorManifest.logo)).isFile()) {
  fail("missing logo asset for .cursor-plugin/plugin.json");
}

if (cursorMarketplace.name !== "orgx-grokbot-marketplace") {
  fail(".cursor-plugin/marketplace.json name must be orgx-grokbot-marketplace");
}
if (!cursorMarketplace.owner?.name) fail(".cursor-plugin/marketplace.json owner.name required");
if (!Array.isArray(cursorMarketplace.plugins) || cursorMarketplace.plugins.length < 1) {
  fail(".cursor-plugin/marketplace.json must list at least one plugin");
}
if (cursorMarketplace.plugins[0].name !== "orgx-grokbot") {
  fail(".cursor-plugin/marketplace.json plugins[0].name must be orgx-grokbot");
}
if (cursorMarketplace.plugins[0].source !== "./") {
  fail(".cursor-plugin/marketplace.json plugins[0].source must be ./");
}

function assertOrgxMcp(doc, label) {
  if (!doc.mcpServers?.orgx || typeof doc.mcpServers.orgx !== "object") {
    fail(`${label} must define mcpServers.orgx`);
  }
  const orgx = doc.mcpServers.orgx;
  if (orgx.type !== "http") fail(`${label} mcpServers.orgx.type must be http`);
  if (orgx.url !== "https://mcp.useorgx.com/mcp") {
    fail(`${label} mcpServers.orgx.url must be https://mcp.useorgx.com/mcp`);
  }
}

assertOrgxMcp(mcp, "mcp.json");
assertOrgxMcp(mcpDot, ".mcp.json");

if (grokManifest.version !== pkg.version) {
  fail(".grok-plugin/plugin.json version must match package.json version");
}
if (grokManifest.skills !== "./skills/") fail(".grok-plugin/plugin.json skills must point to ./skills/");
if (grokManifest.agents !== "./agents/") fail(".grok-plugin/plugin.json agents must point to ./agents/");
if (grokManifest.mcpServers !== "./mcp.json") {
  fail(".grok-plugin/plugin.json mcpServers must point to ./mcp.json");
}
if (grokManifest.interface?.displayName !== "OrgX for Grok Bot") {
  fail(".grok-plugin/plugin.json displayName must be OrgX for Grok Bot");
}
if (grokManifest.interface?.brandColor !== "#14B8A6") fail(".grok-plugin/plugin.json brandColor must be #14B8A6");
if (!Array.isArray(grokManifest.interface?.defaultPrompt) || grokManifest.interface.defaultPrompt.length !== 3) {
  fail(".grok-plugin/plugin.json defaultPrompt must contain exactly 3 strings");
}
for (const prompt of grokManifest.interface.defaultPrompt) {
  if (typeof prompt !== "string" || prompt.length === 0 || prompt.length > 128) {
    fail("each defaultPrompt entry must be a non-empty string <= 128 chars");
  }
}
if (!grokManifest.interface.defaultPrompt.some((p) => /operator chronicle/i.test(p))) {
  fail("defaultPrompt must include an operator chronicle reporting prompt");
}

for (const assetField of ["composerIcon", "logo"]) {
  const relative = grokManifest.interface?.[assetField];
  if (!relative) fail(`.grok-plugin/plugin.json interface.${assetField} required`);
  const assetPath = resolve(root, relative);
  if (!existsSync(assetPath) || !statSync(assetPath).isFile()) {
    fail(`missing asset for ${assetField}: ${relative}`);
  }
}

if (agentsMarketplace.name !== "orgx-local") fail(".agents/plugins/marketplace.json name must be orgx-local");
if (!Array.isArray(agentsMarketplace.plugins) || agentsMarketplace.plugins.length < 1) {
  fail(".agents/plugins/marketplace.json must list at least one plugin");
}

const agentFiles = [
  "orchestrator.md",
  "engineering.md",
  "product.md",
  "design.md",
  "operations.md",
  "marketing.md",
  "sales.md",
];
for (const agentFile of agentFiles) {
  const agentPath = resolve(root, "agents", agentFile);
  if (!existsSync(agentPath)) fail(`missing agents/${agentFile}`);
  const body = readFileSync(agentPath, "utf8");
  if (!body.startsWith("---\n")) fail(`agents/${agentFile} must start with YAML frontmatter`);
  if (!/^name:\s+\S+/m.test(body)) fail(`agents/${agentFile} frontmatter must include name`);
  if (!/^description:\s+\S+/m.test(body)) fail(`agents/${agentFile} frontmatter must include description`);
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

const marketplaceDocs = readFileSync(resolve(root, "docs/marketplace-install.md"), "utf8");
for (const expected of ["install:local", "marketplace/publish", "Import from Repo", ".cursor-plugin"]) {
  if (!marketplaceDocs.includes(expected)) {
    fail(`marketplace-install.md must include: ${expected}`);
  }
}

console.log("verify-plugin: ok");
