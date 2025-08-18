// scripts/parse-logs.js
// Node.js ESM
// Usage: node scripts/parse-logs.js
// Env: LOG_ROOT (default: artifacts/logs), OUT (default: artifacts/ai/parsed.json)

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const LOG_ROOT = process.env.LOG_ROOT || "artifacts/logs";
const OUT_DIR  = path.dirname(process.env.OUT || "artifacts/ai/parsed.json");
const OUT_FILE = process.env.OUT || "artifacts/ai/parsed.json";

const SIGNAL_PATTERNS = [
  /!!ERROR/i,
  /TimeoutError/i,
  /AssertionError/i,
  /unhandledrejection/i,
  /ERR_CONNECTION/i,
  /Net::ERR/i,
  / ECONNREFUSED /i,
  / 5\d{2} /,          // HTTP 5xx
  / 4\d{2} /,          // HTTP 4xx
  /not found/i,
  /selector/i
];

function isSignal(line) {
  return SIGNAL_PATTERNS.some((re) => re.test(line));
}

// Нормализация, чтобы схлопывать динамический шум
function normalize(line) {
  return String(line)
    .replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, "<ip>")
    .replace(/\b[0-9a-f]{7,40}\b/gi, "<sha>")          // git sha
    .replace(/\b\d{1,4}ms\b/g, "<ms>")
    .replace(/\b\d{2,}x\d{2,}\b/g, "<size>")
    .replace(/(:\d+:\d+)/g, ":<loc>")                  // file:line:col
    .replace(/\/Users\/[^ )]+/g, "<path>")
    .replace(/C:\\[^ )]+/gi, "<path>")
    .replace(/0x[a-f0-9]+/gi, "<addr>")
    .slice(0, 400);
}

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.isFile() && /\.log$/i.test(e.name)) yield p;
  }
}

const clusters = new Map(); // key -> { key, examples:[], count, runs:Set }
let filesCount = 0;

for (const file of walk(LOG_ROOT)) {
  filesCount++;
  const runId = path.relative(LOG_ROOT, path.dirname(file)).replace(/\\/g, "/") || "unknown";
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  for (const raw of lines) {
    if (!raw || !isSignal(raw)) continue;
    const key = normalize(raw);
    const cur = clusters.get(key) || { key, examples: [], count: 0, runs: new Set() };
    cur.count++;
    if (cur.examples.length < 3) cur.examples.push(raw.slice(0, 600));
    cur.runs.add(runId);
    clusters.set(key, cur);
  }
}

const out = {
  meta: {
    createdAt: new Date().toISOString(),
    logRoot: LOG_ROOT,
    filesScanned: filesCount,
    clusterCount: clusters.size
  },
  clusters: [...clusters.values()]
    .sort((a, b) => b.count - a.count)
    .map((c, i) => ({
      id: `C${i + 1}`,
      key: c.key,
      count: c.count,
      runs: [...c.runs].sort(),
      examples: c.examples
    }))
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2));
console.log(`Parsed ${filesCount} files → ${OUT_FILE} (clusters: ${out.clusters.length})`);
