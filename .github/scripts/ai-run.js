// scripts/ai-run.js
// Usage:
//   node scripts/ai-run.js --prompt ./prompt.md --input ./artifacts/ai/parsed.json --outdir ./artifacts/ai
// Env (required):
//   OPENAI_API_KEY
// Env (optional):
//   AI_MODEL (default: gpt-4o-mini), AI_TEMPERATURE (0.2), AI_MAX_TOKENS (2000)

const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");

// ---------- args & env ----------
function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const promptPath = arg("--prompt");
const inputPath  = arg("--input");
const outdir     = arg("--outdir", "artifacts/ai");
const maxBytes   = Number(arg("--max-bytes", "180000"));

if (!promptPath || !inputPath) {
  console.error("Usage: node scripts/ai-run.js --prompt <prompt-file> --input <data-file> [--outdir <dir>]");
  process.exit(2);
}

const apiKey      = process.env.OPENAI_API_KEY;
const model       = process.env.AI_MODEL || "gpt-4o-mini";
const temperature = Number(process.env.AI_TEMPERATURE ?? 0.2);
const maxTokens   = Number(process.env.AI_MAX_TOKENS ?? 2000);

if (!apiKey) {
  console.error("OPENAI_API_KEY is not set");
  process.exit(2);
}

// ---------- paths ----------
fs.mkdirSync(outdir, { recursive: true });
const OUT_JSON = path.join(outdir, "ai-report.json");
const RAW_REQ  = path.join(outdir, "request.preview.txt");
const RAW_RES  = path.join(outdir, "response.raw.txt");

// ---------- utils ----------
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
function tryParseJsonFrom(text) {
  // 1) чистый JSON
  try { return JSON.parse(text); } catch {}
  // 2) JSON во fenced-блоке ```json ... ```
  const m = text.match(/```json\s*([\s\S]*?)```/);
  if (m) { try { return JSON.parse(m[1]); } catch {} }
  return null;
}
async function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

// ---------- build messages ----------
const systemMsg = `You are a precise log parser. Output only a valid JSON array per instructions. If a URL is private, respond exactly: "I cannot access the URL — please paste the log contents here." and stop.`;

const userPrompt = fs.readFileSync(promptPath, "utf8");
const inputData  = readSafe(inputPath).toString("utf8");

// сохраняем превью запроса (без секретов)
const preview = `=== USER PROMPT START ===
${userPrompt.trim().slice(0, 2000)}
=== USER PROMPT END ===

=== DATA START (redacted, truncated) ===
${redact(inputData).slice(0, maxBytes)}
=== DATA END ===
`;
fs.writeFileSync(RAW_REQ, preview);

// ---------- OpenAI call via fetch (no SDK) ----------
async function callOpenAI({ messages, tries = 3, timeoutMs = 60_000 }) {
  let backoff = 300;
  for (let i = 0; i < tries; i++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature,
          max_tokens: maxTokens,
          messages
        }),
        signal: controller.signal
      });
      clearTimeout(t);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`OpenAI HTTP ${res.status}: ${txt.slice(0, 500)}`);
      }
      const json = await res.json();
      return json;
    } catch (err) {
      clearTimeout(t);
      const msg = String(err?.message || err);
      const retryable = /429|5\d\d|network|fetch|aborted|timeout/i.test(msg);
      if (!retryable || i === tries - 1) throw err;
      await sleep(backoff);
      backoff *= 2;
    }
  }
}

// ---------- run ----------
async function main() {
  const messages = [
    { role: "system", content: systemMsg },
    { role: "user",   content: `${userPrompt.trim()}\n\nDATA:\n${redact(inputData).slice(0, maxBytes)}` }
  ];

  try {
    const resp = await callOpenAI({ messages, tries: 3 });
    const text = resp?.choices?.[0]?.message?.content ?? "";
    fs.writeFileSync(RAW_RES, text);

    const parsed = tryParseJsonFrom(text);

    if (!parsed) {
      console.error("AI did not return valid JSON. See response.raw.txt");
      process.exitCode = 0; // мягко выходим, не валим CI
    } else if (!Array.isArray(parsed)) {
      console.error("AI returned JSON, but not a JSON array. See response.raw.txt");
      process.exitCode = 0;
    } else {
      fs.writeFileSync(OUT_JSON, JSON.stringify(parsed, null, 2));
      console.log("✅ AI JSON report saved:", OUT_JSON);

      if (process.env.GITHUB_STEP_SUMMARY) {
        const ids = parsed.map(x => x?.id).filter(Boolean);
        const summary = `Found **${parsed.length}** error instance(s).` + (ids.length ? `\n\nIDs: ${ids.join(", ")}` : "");
        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n\n## AI Error Extraction\n\n${summary}\n`);
      }
    }
  } catch (err) {
    console.error("AI call failed (non-blocking):", err?.message || String(err));
    process.exitCode = 0;
  }
}

main().catch(err => {
  console.error("Unhandled error:", err);
  process.exitCode = 1;
});
