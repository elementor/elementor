Repo: ${{ github.repository }}
Commit: ${{ github.sha }}

I will provide either (A) a public log file URL or (B) raw aggregated log text from Playwright CI runs (Elementor + plugins).  
Parse the log and extract **all error instances separately**.

### Key rules
- **Do NOT deduplicate errors** — treat each occurrence as a separate entry, even if messages are identical (e.g., screenshot diffs for different plugins/tests).  
- Track retries within the same test run as `retries_observed`, but keep different test contexts (different plugins, different files, different log sources) as **separate entries**.  
- Each error must have a **unique `id`** including context (plugin name, log source, test name).  
- Trim very long stack traces to 1–3 relevant lines for `call_log_snippets`.

### Required schema for each error object
```json
{
  "id": "short unique id, include context (e.g. <file>-<test>)",
  "file": "file path or test file where the error came from",
  "test": "human-readable test name or case identifier",
  "status": "failed | flaky | error",
  "retries_observed": 0,
  "severity": "low | medium | high",
  "unique_error_messages": ["deduplicated messages from retries"],
  "call_log_snippets": ["1–3 short relevant log lines"],
  "explanation": "1–3 sentences, likely cause",
  "impact": "1–2 sentences, what this error blocks or affects"
}
