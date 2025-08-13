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
