# CSS Converter — MVP Plan (Variables First)

## 1) Goal
Convert CSS custom properties (CSS variables) into Elementor Global Variables (design tokens). This is the only scope of MVP.

- Input: CSS string/file/URL containing declarations like:
  `:root { --primary: #007cba; --spacing-md: 16px; }`
- Output: Created/updated Global Variables in the active Kit, plus a machine-readable conversion report.

Out of scope (post‑MVP):
- Global Classes (mapping `.class` selectors to global classes)
- Widget styling (applying props to atomic schema)
- Widget creation (building widgets/elements from parsed content)

## 2) Deliverables (MVP)
- Parser: robust extraction of CSS variables via `CssParser::extract_variables()`
- Mapping: variables → Global Variables repository (safe upsert, id/label rules, collision handling)
- API (optional for MVP): POST endpoint to accept CSS and perform variables import
- Reporting: counts, names, and conflicts summary

## 3) Variable Mapping Rules
- Source: only `:root`/`html` scope variables (e.g., `--primary-color`)
- Normalization:
  - id: slugify without leading dashes (e.g., `primary-color`)
  - label: original variable name without leading dashes (e.g., `primary-color`)
- Upsert policy:
  - If id exists, update value
  - If conflict on label, keep id stable and update label only if explicitly requested
- Types:
  - Store as raw strings for MVP (e.g., colors, lengths)
  - No unit/type coercion in MVP

## 4) Conversion Flow
1. Parse CSS → `ParsedCss`
2. Extract variables → array of `{ name, value, scope }`
3. Transform to Global Variables data structure
4. Persist via Global Variables repository in the active Kit
5. Build response:
   ```json
   {
     "variables": { "created": ["primary"], "updated": ["spacing-md"], "skipped": [] },
     "stats": { "input_size": 1234, "variables_count": 2, "processed_at": 1734030000 }
   }
   ```

## 5) API (if enabled in MVP)
- Route: POST `/wp-json/elementor/v2/css-converter/variables`
- Auth: capabilities / nonces (remove hardcoded keys)
- Body:
  - `{ "css": "string" }` | `{ "url": "https://..." }` | file upload
- Response: conversion summary (see reporting above)

## 6) Testing
- Unit: parser variable extraction; mapping transforms
- Integration: repository upsert behavior; route request/response (if API enabled)
- Non-goals for tests in MVP: classes, widget props, widget creation

## 7) Performance
- OK for typical theme-size CSS; no streaming required in MVP
- Cache parsed artifacts only if needed; defer until post‑MVP

## 8) Rollout
- Feature flag the route (if added)
- Add a UI note or CLI docs for importing variables

## 9) Next Steps (Variables‑Only MVP)

0.0 Wire parser output to variable conversion — Status: DONE
- Implement a small service function that: parses CSS → extracts variables via `CssParser::extract_variables()` → converts them via `elementor_css_variables_convert_to_editor_variables()`.
- Expose a simple PHP entry point (e.g., `variables_from_css_string( string $css ): array`).
- Test scenario:
  - In a sandbox (WP console or `wp eval`), call `variables_from_css_string(':root { --primary: #EEE; }')` and verify the returned array contains one color variable with normalized value `#eeeeee` and an id derived from the name.

0.1 Add endpoint that accepts a CSS file URL — Status: DONE
- Route: `POST /wp-json/elementor/v2/css-converter/variables`
- Body: `{ "url": "https://.../file.css" }` (later: support `{ "css": "..." }` and file upload)
- Security: for MVP, allow only authenticated admins; next step add capability/nonces.
- Test scenario:
  - `curl -X POST -H "Content-Type: application/json" -H "X-WP-Nonce: <nonce>" \
    --data '{"url":"https://example.com/test.css"}' \
    https://<site>/wp-json/elementor/v2/css-converter/variables`
  - Expect 200 with a JSON payload (even if empty at this stage).

0.2 Endpoint logs the fetched CSS into a logs folder — Status: DONE
- Create folder: `plugins/elementor/modules/css-converter/logs/` (ensure writable; create if missing).
- When the endpoint receives a URL, fetch it and save the CSS to `logs/<timestamp>-<slug>.css`.
- Test scenario:
  - Call the endpoint from 0.1 with a valid CSS URL; verify a new file appears under `plugins/elementor/modules/css-converter/logs/` containing the remote CSS.

0.3 Filter variables and export a text file list — Status: DONE
- From the fetched CSS, run the parser + variable conversion pipeline (0.0).
- Create `logs/<timestamp>-variables.txt` listing each variable on its own line in the form: `--name = <value>`.
- Response should also include a machine-readable list of variables.
- Test scenario:
  - Call the endpoint again; verify `*-variables.txt` is created with each `--var = value`. Confirm the API response includes the same variables array.

0.4 PHPUnit tests — Status: DONE
- Add unit tests for:
  - Hex color convertor (3/6-digit, normalization, rejects non-hex)
  - Parser variable extraction from `:root`/`html`
  - Service pipeline: CSS string → variables array
- Add integration tests (can be feature tests) for:
  - Endpoint: url fetch mocked; file write to logs; response payload structure
- Test scenario:
  - `cd plugins/elementor/modules/css-converter && composer install`
  - `vendor/bin/phpunit` passes with all tests green.

0.5 Support direct CSS string body and file uploads — Status: PARTIAL (direct CSS supported; file upload pending)
- Extend endpoint to also accept `{ "css": "..." }` and multipart file upload.
- Test scenario:
  - POST with `{ "css": ":root { --primary: #eee; }" }` returns the same variables array and writes logs.

0.6 Hard validation for color-only MVP — Status: DONE
- For this phase, only convert variables whose values match `#eee` or `#eeeeee`; skip others.
- Response should include counts for converted vs skipped.
- Test scenario:
  - CSS containing `--primary: #eee; --spacing-md: 16px;` yields one converted, one skipped; counters reflected in response.

0.7 Wire into persistence (optional within MVP scope) — Status: PENDING (flag + stub exists)
- Prepare a small repository adapter stub for V4 Editor Global Variables. For MVP, return the computed array; persistence can be toggled by a flag.
- Test scenario:
  - With persistence flag off, response only. With flag on (dev env), verify the variable appears in the active Kit repository.

0.8 Feature flag and capability — Status: PARTIAL (capability enforced; dev token filter/constant available; dedicated feature flag pending)
- Add a filter/flag to enable the endpoint; restrict to `manage_options` or a dedicated capability.
- Test scenario:
  - When disabled, route returns 404/403; when enabled and authorized, route works.

0.9 Basic CLI/Script runner (optional) — Status: PENDING

0.10 Fallback extraction when parser fails — Status: DONE
- If Sabberworm parsing fails, a regex fallback extracts `--var: value;` pairs anywhere in CSS.
- This accommodates non-:root definitions (e.g., utility scopes like `.elementor-kit-*`).

0.11 Optional :root-only extraction — Status: PENDING
- Add a boolean filter `elementor_css_converter_root_only` (default false). When true, restrict extraction to `:root`/`html` scope only.
- Test scenario:
  - With flag off (default), variables under `.elementor-kit-*` are extracted.
  - With flag on, only variables under `:root`/`html` are extracted; others skipped.
- Provide a WP-CLI command `wp elementor css-converter variables --url=<css-url>` for local/dev usage.
- Test scenario:
  - Run the command; confirm console output, logs creation, and JSON file written if desired.
