Lists images and SVG assets already uploaded to the WordPress Media Library, so you can reference them by attachment `id` when composing pages.

Use this before falling back to external stock URLs, and always use it before placing an `e-svg` widget — an `e-svg` requires an uploaded attachment to render.

## Input

- `search` — optional keyword matched against attachment title and filename.
- `type` — `all` (default), `image` (raster only), or `svg` (icons/logos for `e-svg`).
- `page` and `per_page` — pagination. `per_page` is capped at 50.

## Output

Each asset has `{ id, url, title, alt, mime_type, width, height }`. SVGs return `null` for `width`/`height`.

Reference an asset by its `id` in the atomic prop shape:

- `e-image` → `{ "src": { "id": <id> }, "size": "full" }`
- `e-svg` → `{ "svg": { "id": <id> } }`

The `id` form is preferred: it gives you real dimensions and `srcset` at render time. An external URL works too (`{ "src": { "url": "https://…" } }` for `e-image`), but not for `e-svg` — an external URL there renders an empty div.

Note: `id` and `url` are mutually exclusive in `e-image` — send one, not both.

## When results are empty

The response includes an `llm_instructions` field telling you to ask the user to upload the assets they want to use. Do not fabricate attachment ids.
