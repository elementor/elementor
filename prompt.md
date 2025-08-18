I will provide either (A) a public log file URL or (B) raw log text. Parse the log and extract **all unique failing tests separately**. Each DIFFERENT test gets its own entry, but retries/attempts of the SAME test should be grouped together with `retries_observed`.

Produce a single JSON array artifact containing all unique failing tests:

**JSON array** (a single valid JSON array containing all unique failing test objects). Each DIFFERENT failing test gets its own entry with a unique `id` that includes context (e.g., plugin name, log source). This allows for granular tracking and analysis of error patterns across different test contexts.

### Required schema for each issue object
(Only include the fields below — **do not** include `first_seen`, `last_seen`, `occurrences`, `tags`, `suggested_actions`, or `notes`.)

- `id` : short unique id (string). Prefer deterministic slug like `<file>-<test-name>` or similar.
- `file` : the file path or test file where the failing test/error came from (string).
- `test` : human-readable test name or test case identifier (string).
- `status` : `"failed"` or `"flaky"` or `"error"` (string).
- `retries_observed` : integer (number of retries / repeated occurrences that were deduplicated).
- `severity` : `"low"`, `"medium"`, or `"high"` — pick according to impact (string).
- `unique_error_messages` : array of strings (deduplicated error messages from retries).
- `call_log_snippets` : array of short strings (1–3 line snippets from the log that show the EXACT failing locator/selector, stack trace line, or function call). MUST include the specific selector that failed (e.g. `locator.click: Timeout` should show the actual locator like `page.locator('#elementor-loading').click()`).
- `explanation` : short human-readable explanation of what likely caused the error (1–3 sentences).
- `impact` : short human-readable description of what the error blocks or affects (1–2 sentences).

### Parsing rules / heuristics
- **Group retries of the SAME test** - if the same test (same name, same file) fails multiple times, create ONE entry with `retries_observed` set to the total count.
- **Separate entries for DIFFERENT tests** - even if two different tests have identical error messages, they should be separate entries with unique IDs. For example, screenshot comparison errors for different plugins should each get their own entry.
- **DO NOT include cache failures** - skip any errors related to cache restore, cache service failures, or similar cache-related issues as they are infrastructure concerns rather than test failures.
- **ONLY include status "failed" tests** - exclude tests with status "flaky" and only keep tests that have status "failed" for consistent failure tracking.
- **EXTRACT FULL CONTEXT** - look for multiple lines around errors to capture the complete locator/selector information. Don't just use the error line itself.
- Different test contexts (different plugins, different files, different log sources) should always be separate issues, even if error messages are identical.
- Create unique IDs that include context information (e.g., plugin name, log file identifier, test name) to distinguish between similar errors in different contexts.
- Trim extremely long stack traces: keep 1–3 most relevant lines as `call_log_snippets`. Always include the EXACT locator/selector that caused the failure (e.g., `page.locator('#some-id')`, `getByRole('button')`, `waitForSelector('.class-name')`).
- For timeouts / selector issues, prefer severity `"high"` if they block test flow; for parameter mismatches use `"medium"`; for cosmetic or non-critical warnings use `"low"`.
- If a single failing test produces several distinct assertion failures in the same run that are clearly different (different error messages & different stack lines), include them as separate issues.
- For timeout errors, ALWAYS extract and include the specific locator/selector that timed out. Look for patterns like `locator.click`, `waitForSelector`, `getByRole`, `getByText`, etc.
- If a required field is not present in the log, still produce the object but set that field to an empty string (`""`) or an empty array `[]` as appropriate (do **not** omit the field).

### Output format requirements
- JSON array: pretty-printed (indentation 2 spaces) containing all unique failing tests as separate objects.
- Each failing test gets a unique `id` that includes contextual information to distinguish between similar errors in different contexts.
- At the end of the response, briefly (1–2 lines) summarize how many unique failing tests were found and list their `id`s.

### If you cannot access the provided URL
- If the assistant cannot fetch the URL (e.g., private link), say: "I cannot access the URL — please paste the log contents here." and stop (do not attempt partial work).

Now: I will provide the log (either a URL or paste the log). Parse it and return the JSON array as described above.