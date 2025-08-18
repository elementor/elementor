// scripts/ai-run.js
// Usage:
//   node scripts/ai-run.js --prompt ./prompt.md --input ./artifacts/ai/parsed.json --outdir ./artifacts/ai
// Env:
//   OPENAI_API_KEY (required)
//   AI_MODEL (default: gpt-4o-mini), AI_TEMPERATURE (0.2), AI_MAX_TOKENS (2000)

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import OpenAI from "openai";

function arg(name, fallback) {
  const idx = process.argv.indexOf(name);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

const promptPath = arg("--prompt");
const inputPath  = arg("--input");
const outdir     = arg("--outdir", "artifacts/ai");
const maxBytes   = Number(arg("--max-bytes", "180000"));

if (!promptPath || !inputPath) {
  console.error("Usage: node scripts/ai-run.js --prompt <prompt-file> --input <data-file> [--outdir <dir>]");
  process.exit(2);
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY is not set");
  process.exit(2);
}
const model = process.env.AI_MODEL || "gpt-4o-mini";
const temperature = Number(process.env.AI_TEMPERATURE ?? 0.2);
const maxTokens   = Number(process.env.AI_MAX_TOKENS ?? 2000);

fs.mkdirSync(outdir, { recursive: true });
const OUT_MD   = path.join(outdir, "ai-report.md");
const OUT_JSON = path.join(outdir, "ai-report.json");
const RAW_REQ  = path.join(outdir, "request.preview.txt");
const RAW_RES  = path.join(outdir, "response.raw.txt");

function readSafe(p) {
  const buf = fs.readFileSync(p);
  return buf.length > maxBytes ? buf.subarray(0, maxBytes) : buf;
}
function redact(str) {
  return String(str)
    .replace(/Bearer\s+[A-Za-z0-9\-\._]+/g, "Bearer [REDACTED]")
    .replace(/token=[^&\s]+/g, "token=[REDACTED]")
    .replace(/sid=[^&\s]+/g, "sid=[REDACTED]")
    .replace(/(cookie:\s*)[^;\n]+/gi, "$1[REDACTED]")
    .replace(/https?:\/\/[^ \n"]+(@|:)[^ \n"]+/gi, "https://[REDACTED]");
}
function parseJsonBlock(text) {
  const m = text.match(/```json\s*([\s\S]*?)```/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}
async function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

const client = new OpenAI({ apiKey });

const systemMsg = `You are a senior QA specialized in Playwright and Elementor. Be concise, factual, and actionable. If evidence is weak, say so.`;

const userPrompt = fs.readFileSync(promptPath, "utf8");
const inputData  = readSafe(inputPath).toString("utf8");

// сохранить превью запроса (без секретов)
const preview = `=== USER PROMPT START ===
${userPrompt.trim().slice(0, 2000)}
=== USER PROMPT END ===

=== DATA START (redacted, truncated) ===
${redact(inputData).slice(0, maxBytes)}
=== DATA END ===
`;
fs.writeFileSync(RAW_REQ, preview);

async function callWithRetry(body, tries = 3) {
  let backoff = 300;
  for (let i = 0; i < tries; i++) {
    try {
      return await client.chat.completions.create(body);
    } catch (e) {
      const status = e?.status ?? e?.response?.status;
      const retryable = status === 429 || (status >= 500 && status < 600);
      if (!retryable || i === tries - 1) throw e;
      await sleep(backoff);
      backoff *= 2;
    }
  }
}

const body = {
  model,
  temperature,
  max_tokens: maxTokens,
  messages: [
    { role: "system", content: systemMsg },
    { role: "user", content: `${userPrompt.trim()}\n\nDATA:\n${redact(inputData).slice(0, maxBytes)}` }
  ]
};

try {
  const resp = await callWithRetry(body);
  const text = resp.choices?.[0]?.message?.content || "";
  fs.writeFileSync(OUT_MD, text);
  fs.writeFileSync(RAW_RES, text);

  const j = parseJsonBlock(text);
  if (j) fs.writeFileSync(OUT_JSON, JSON.stringify(j, null, 2));

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n\n## AI Log Analysis\n\n` + text);
  }

  console.log("✅ AI report saved:");
  console.log(" -", OUT_MD);
  if (j) console.log(" -", OUT_JSON);
  console.log(" -", RAW_REQ, "(request preview)");
  console.log(" -", RAW_RES, "(raw response)");
  if (resp.usage) console.log("Usage:", resp.usage);
} catch (err) {
  console.error("AI call failed (non-blocking):", err?.message || String(err));
  process.exitCode = 0;
}
