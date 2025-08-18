I will provide either (A) a public log file URL or (B) raw log text. Parse the log and extract **all error instances separately**. Do NOT deduplicate errors - treat each occurrence as a separate issue, even if error messages are identical (e.g., screenshot comparison errors should be separate for each plugin/test). Track retries within the same test run as `retries_observed` but keep different test instances as separate entries.

Produce a single JSON array artifact containing all error instances:

**JSON array** (a single valid JSON array containing all error objects). Each error occurrence gets its own entry with a unique `id` that includes context (e.g., plugin name, log source). This allows for granular tracking and analysis of error patterns across different contexts.

### Required schema for each issue object
(Only include the fields below — **do not** include `first_seen`, `last_seen`, `occurrences`, `tags`, `suggested_actions`, or `notes`.)

- `id` : short unique id (string). Prefer deterministic slug like `<file>-<test-name>` or similar.
- `file` : the file path or test file where the failing test/error came from (string).
- `test` : human-readable test name or test case identifier (string).
- `status` : `"failed"` or `"flaky"` or `"error"` (string).
- `retries_observed` : integer (number of retries / repeated occurrences that were deduplicated).
- `severity` : `"low"`, `"medium"`, or `"high"` — pick according to impact (string).
- `unique_error_messages` : array of strings (deduplicated error messages from retries).
- `call_log_snippets` : array of short strings (1–3 line snippets from the log that show the stack trace line, failing locator, or function call).
- `explanation` : short human-readable explanation of what likely caused the error (1–3 sentences).
- `impact` : short human-readable description of what the error blocks or affects (1–2 sentences).

### Parsing rules / heuristics
- **DO NOT deduplicate errors** - each error occurrence should be a separate entry even if messages are identical. For example, screenshot comparison errors for different plugins should each get their own entry with unique IDs.
- **DO NOT include cache failures** - skip any errors related to cache restore, cache service failures, or similar cache-related issues as they are infrastructure concerns rather than test failures.
- **ONLY include status "failed" tests** - exclude tests with status "flaky" and only keep tests that have status "failed" for consistent failure tracking.
- Count retries within the same test run and set `retries_observed` accordingly, but treat different test contexts (different plugins, different files, different log sources) as separate issues.
- Create unique IDs that include context information (e.g., plugin name, log file identifier, test name) to distinguish between similar errors in different contexts.
- Trim extremely long stack traces: keep 1–3 most relevant lines as `call_log_snippets`.
- For timeouts / selector issues, prefer severity `"high"` if they block test flow; for parameter mismatches use `"medium"`; for cosmetic or non-critical warnings use `"low"`.
- If a single failing test produces several distinct assertion failures in the same run that are clearly different (different error messages & different stack lines), include them as separate issues.
- If a required field is not present in the log, still produce the object but set that field to an empty string (`""`) or an empty array `[]` as appropriate (do **not** omit the field).

### Output format requirements
- JSON array: pretty-printed (indentation 2 spaces) containing all error instances as separate objects.
- Each error gets a unique `id` that includes contextual information to distinguish between similar errors in different contexts.
- At the end of the response, briefly (1–2 lines) summarize how many error instances were found and list their `id`s.

### If you cannot access the provided URL
- If the assistant cannot fetch the URL (e.g., private link), say: "I cannot access the URL — please paste the log contents here." and stop (do not attempt partial work).

Now: I will provide the log (either a URL or paste the log). Parse it and return the JSON array as described above.