// Usage:
//   node .github/scripts/format-report.js --input ./artifacts/ai/ai-report.json --out ./artifacts/ai/ai-report.md
//
// Reads a JSON ARRAY of error objects (your schema) and produces a readable Markdown report.
// No external deps. Node 20+.

const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const inPath  = arg("--input", "artifacts/ai/ai-report.json");
const outPath = arg("--out",   "artifacts/ai/ai-report.md");

function esc(s = "") {
  return String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sevEmoji(sev) {
  switch ((sev || "").toLowerCase()) {
    case "high": return "🔴";
    case "medium": return "🟠";
    case "low": return "🟢";
    default: return "⚪️";
  }
}

function statusEmoji(st) {
  switch ((st || "").toLowerCase()) {
    case "failed": return "❌";
    case "flaky":  return "🟡";
    case "error":  return "🟥";
    default: return "❔";
  }
}

function shorten(msg = "", max = 200) {
  const s = String(msg).trim();
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function listToCodeBlock(lines = []) {
  const clean = (lines || []).map(l => String(l || "")).filter(Boolean);
  if (!clean.length) return "";
  // показываем максимум 3 строки, как и в твоей схеме
  const show = clean.slice(0, 3).join("\n");
  return "```\n" + show + "\n```";
}

function toDeterministicId(item, idx) {
  // если нет id — подстрахуемся
  if (item?.id) return String(item.id);
  const file = (item?.file || "unknown").split("/").slice(-1)[0];
  const test = (item?.test || "test").slice(0, 40).replace(/\s+/g, "-").toLowerCase();
  return `${file}-${test}-${idx}`;
}

// Group by root causes для лучшего понимания
function analyzeRootCauses(errors) {
  const causes = {
    'Page Loading Issues': [],
    'Element Not Found': [],
    'Timeout Problems': [],
    'Script Execution Errors': [],
    'Other Issues': []
  };

  errors.forEach(err => {
    const msg = (err.unique_error_messages?.[0] || '').toLowerCase();
    const test = (err.test || '').toLowerCase();

    if (msg.includes('page.goto') || msg.includes('navigation')) {
      causes['Page Loading Issues'].push(err);
    } else if (msg.includes('waitforselector') || msg.includes('selector') || msg.includes('getelementbyid')) {
      causes['Element Not Found'].push(err);
    } else if (msg.includes('timeout') && !msg.includes('page.goto')) {
      causes['Timeout Problems'].push(err);
    } else if (msg.includes('evaluate') || msg.includes('script') || msg.includes('function')) {
      causes['Script Execution Errors'].push(err);
    } else {
      causes['Other Issues'].push(err);
    }
  });

  return causes;
}

// Генерирует actionable recommendations
function getActionItems(errorType, errors) {
  const recommendations = {
    'Page Loading Issues': [
      '🌐 Check if test environment is slow or unstable',
      '⏱️ Consider increasing page load timeout',
      '🔍 Verify the target URL is accessible',
      '⚡ Check network connectivity in CI environment'
    ],
    'Element Not Found': [
      '🎯 Verify selectors are correct and up-to-date',
      '⏳ Add wait conditions before interacting with elements',
      '🔄 Check if page content loads dynamically',
      '🧪 Test selectors manually in browser dev tools'
    ],
    'Timeout Problems': [
      '⏱️ Increase timeout values for slow operations',
      '🔄 Add explicit wait conditions',
      '⚡ Optimize test environment performance',
      '🎯 Use more specific wait strategies'
    ],
    'Script Execution Errors': [
      '📝 Review JavaScript code in page.evaluate calls',
      '🔍 Check console errors in browser',
      '🛠️ Verify page context and variables availability',
      '🧪 Test scripts manually in browser console'
    ]
  };

  return recommendations[errorType] || [
    '🔍 Review logs and error messages carefully',
    '🧪 Try reproducing the issue locally',
    '📋 Check for similar issues in past runs'
  ];
}

// Создает более понятный заголовок
function getReadableTitle(error) {
  const msg = (error.unique_error_messages?.[0] || '').toLowerCase();
  const test = error.test || 'Unknown Test';

  if (msg.includes('page.goto')) return `🌐 Page Loading Failed - ${test}`;
  if (msg.includes('waitforselector')) return `🎯 Element Not Found - ${test}`;
  if (msg.includes('timeout')) return `⏱️ Operation Timeout - ${test}`;
  if (msg.includes('evaluate')) return `📜 Script Execution Failed - ${test}`;
  if (msg.includes('getelementbyid')) return `🔍 Element ID Missing - ${test}`;

  return `❌ Test Failure - ${test}`;
}

// Определяет тип ошибки для одной ошибки (для рекомендаций)
function getErrorType(error) {
  const msg = (error.unique_error_messages?.[0] || '').toLowerCase();
  
  if (msg.includes('page.goto') || msg.includes('navigation')) {
    return 'Page Loading Issues';
  } else if (msg.includes('waitforselector') || msg.includes('selector') || msg.includes('getelementbyid')) {
    return 'Element Not Found';
  } else if (msg.includes('timeout') && !msg.includes('page.goto')) {
    return 'Timeout Problems';
  } else if (msg.includes('evaluate') || msg.includes('script') || msg.includes('function')) {
    return 'Script Execution Errors';
  } else {
    return 'Other Issues';
  }
}

// ---------- main ----------
if (!fs.existsSync(inPath)) {
  console.error(`Input JSON not found: ${inPath}`);
  process.exit(0); // мягко выходим
}

let data;
try {
  data = JSON.parse(fs.readFileSync(inPath, "utf8"));
} catch (e) {
  console.error(`Failed to parse JSON: ${inPath}`, e.message);
  process.exit(0);
}

if (!Array.isArray(data)) {
  console.error("Input JSON must be an array of error objects.");
  process.exit(0);
}

// сортируем: сначала high, потом medium, low; внутри — failed/flaky/error; стабильный вывод
const sevOrder = { high: 0, medium: 1, low: 2 };
const stOrder  = { failed: 0, flaky: 1, error: 2 };
data.sort((a, b) => {
  const sa = sevOrder[(a.severity || "").toLowerCase()] ?? 99;
  const sb = sevOrder[(b.severity || "").toLowerCase()] ?? 99;
  if (sa !== sb) return sa - sb;
  const ta = stOrder[(a.status || "").toLowerCase()] ?? 99;
  const tb = stOrder[(b.status || "").toLowerCase()] ?? 99;
  if (ta !== tb) return ta - tb;
  return String(a.id || "").localeCompare(String(b.id || ""));
});

// summary
const total = data.length;
const bySev = data.reduce((acc, x) => {
  const k = (x.severity || "unknown").toLowerCase();
  acc[k] = (acc[k] || 0) + 1;
  return acc;
}, {});
const byStatus = data.reduce((acc, x) => {
  const k = (x.status || "unknown").toLowerCase();
  acc[k] = (acc[k] || 0) + 1;
  return acc;
}, {});
const totalRetries = data.reduce((n, x) => n + (Number(x.retries_observed) || 0), 0);

// TOC
const ids = data.map((x, i) => toDeterministicId(x, i));

// build markdown
let md = "";
md += `# 🧪 Playwright AI Error Report\n\n`;
md += `**Total errors:** ${total}  •  **Retries observed (sum):** ${totalRetries}\n\n`;
md += `**By severity:** ${Object.entries(bySev).map(([k,v]) => `${sevEmoji(k)} ${k}: ${v}`).join("  |  ")}\n\n`;
md += `**By status:** ${Object.entries(byStatus).map(([k,v]) => `${statusEmoji(k)} ${k}: ${v}`).join("  |  ")}\n\n`;

if (ids.length) {
  md += `## Index\n`;
  for (const id of ids) {
    const anchor = id.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    md += `- [\`${id}\`](#${anchor})\n`;
  }
  md += `\n`;
}

const rootCauses = analyzeRootCauses(data);

// Добавим секцию Root Causes Analysis
md += "\n## 🎯 Root Causes Analysis\n\n";

Object.keys(rootCauses).forEach(causeType => {
  const errors = rootCauses[causeType];
  if (errors.length === 0) return;

  md += `### ${causeType} (${errors.length} error${errors.length > 1 ? 's' : ''})\n\n`;

  // Показать краткие детали
  errors.slice(0, 3).forEach(err => {
    md += `- **${getReadableTitle(err)}** - ${err.retries_observed} retries\n`;
  });

  if (errors.length > 3) {
    md += `- *...and ${errors.length - 3} more similar errors*\n`;
  }

  md += "\n**💡 Recommended Actions:**\n";
  getActionItems(causeType, errors).forEach(action => {
    md += `- ${action}\n`;
  });

  md += "\n---\n\n";
});

for (let i = 0; i < data.length; i++) {
  const x = data[i] || {};
  const id = toDeterministicId(x, i);
  const anchor = id.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const sev = (x.severity || "unknown");
  const st  = (x.status || "unknown");
  const re  = Number(x.retries_observed || 0);

  const errMsg = Array.isArray(x.unique_error_messages) && x.unique_error_messages.length
    ? x.unique_error_messages[0]
    : "";

  md += `---\n\n`;
  md += `### ${statusEmoji(st)} ${sevEmoji(sev)} ${getReadableTitle(x)}\n`;
  md += `<a id="${anchor}"></a>\n\n`;
  md += `**ID:** \`${id}\`\n\n`;
  md += `**File:** \`${esc(x.file || "")}\`\n\n`;
  md += `**Status:** **${st}**  •  **Severity:** **${sev}**  •  **Retries:** ${re}\n\n`;

  // Показать либо Error Message, либо Log Snippets (избегаем дублирования)
  if (errMsg) {
    md += `**Error Details:**\n`;
    md += "```\n" + shorten(errMsg, 600) + "\n```\n\n";
  } else if (Array.isArray(x.call_log_snippets) && x.call_log_snippets.length) {
    md += `**Log Details:**\n`;
    md += listToCodeBlock(x.call_log_snippets) + "\n\n";
  }

  if (x.explanation) {
    md += `**Why This Happened:**\n${esc(x.explanation)}\n\n`;
  }
  if (x.impact) {
    md += `**Impact:**\n${esc(x.impact)}\n\n`;
  }
  
  // Добавить конкретные рекомендации для этой ошибки
  const errorType = getErrorType(x);
  const specificActions = getActionItems(errorType, [x]);
  if (specificActions.length > 0) {
    md += `**🔧 What To Do:**\n`;
    specificActions.slice(0, 3).forEach(action => {
      md += `- ${action}\n`;
    });
    md += `\n`;
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, md, "utf8");
console.log(`✅ Markdown report written to: ${outPath}`);
