# Interactions frontend

> Audience: internal
> Module: `modules/interactions/interactions-frontend-handler.php` · `assets/js/interactions.js`
> Related: [overview.md](./overview.md) · [schema.md](./schema.md)

## What it is

The frontend pipeline collects interaction data from rendered documents, outputs JSON in the footer, and executes animations via **Motion.js** (`window.Motion`).

PHP: `Interactions_Frontend_Handler`. JS entry: `interactions.js`.

## When to use it

- **Debugging missing animations** — trace collector → footer JSON → `data-interaction-id` matching.
- **Adding runtime support** — extend `interactions.js` and `interactions-utils.js` (subset of schema values).
- **Performance** — postmeta cache avoids re-parsing element trees on every render.

## Key concepts

### Render pipeline

```
elementor/frontend/builder_content_data
  → collect_document_interactions
    → Interactions_Postmeta::load_content (or process_content fallback)
    → Interactions_Collector::register per element

wp_footer (priority 1)
  → print_interactions_data
    → <script id="elementor-interactions-data">…</script>

interactions.js (DOMContentLoaded)
  → parse JSON → query [data-interaction-id] → Motion.animate / inView
```

Skipped in edit mode.

### Footer JSON shape

```json
{ "elementId": "abc123", "dataId": "abc123", "interactions": [ /* items */ ] }
```

Script tag id: `elementor-interactions-data` (`Module::SCRIPT_ID_INTERACTIONS_DATA`).

### Postmeta cache

Meta key: `elementor-interactions-cache`.

- **Write** — `elementor/document/after_save` → `process_content`
- **Read** — `load_content`; falls back to `process_content` if stale
- **Delete** — when interaction map is empty

### Runtime triggers

| Trigger | Behavior |
|---------|----------|
| `load` | Immediate `animate()` |
| `scrollIn` | `inView` with `amount: 0` |
| `scrollOut` | `inView` with `amount: 0.85`, plays on exit |

Other schema triggers (`hover`, `click`, `scrollOn`) and `custom` effects are skipped by `isSupportedInteraction()`.

### Breakpoints

`interactions-breakpoints.js` reads `ElementorInteractionsConfig.breakpoints` and `skipInteraction()` excludes items whose `breakpoints.excluded` contains the active label.

### DOM binding

`data-interaction-id` holds the **element id** (not per-item `interaction_id`). Footer JSON keys by element id; `interactions.js` queries `[data-interaction-id="${elementId}"]`.

Legacy fallback: per-element `[data-interactions]` when footer script tag is absent.

## Extension

N/A — no public registration hook. Changes require editing `interactions.js`, `interactions-utils.js`, and PHP `Validation` / `Presets`.

## Public API

| Symbol | Signature | Purpose | Source |
|--------|-----------|---------|--------|
| `Interactions_Frontend_Handler` | `collect_document_interactions( $elements, $post_id )` | Collect per document | `interactions-frontend-handler.php` |
| `Interactions_Frontend_Handler` | `print_interactions_data()` | Footer JSON + asset enqueue | `interactions-frontend-handler.php` |
| `Interactions_Collector` | `::instance()`, `register( $id, $items )`, `get_all()` | In-memory aggregation | `interactions-collector.php` |
| `Interactions_Postmeta` | `load_content()`, `process_content()` | Postmeta cache | `cache/interactions-postmeta.php` |
| `getKeyframes` | `( effect, type, direction )` | Build Motion keyframes | `assets/js/interactions-utils.js` |
| `extractAnimationConfig` | `( interaction )` | Unwrap item to config | `assets/js/interactions-utils.js` |
| `getAnimateFunction` | `()` | `window.Motion.animate` bridge | `assets/js/interactions-shared-utils.js` |
| `getInViewFunction` | `()` | `window.Motion.inView` bridge | `assets/js/interactions-shared-utils.js` |
| `timingValueToMs` | `( timingValue, fallbackMs )` | Convert timing PropValue | `assets/js/interactions-shared-utils.js` |

## Internals

| File | Role |
|------|------|
| `cache/elements-interactions.php` | Tree walk; extracts `interactions.items` |
| `interactions-breakpoints.js` | Responsive skip logic |
| `editor-interactions.js` | Preview iframe (editor only) |

`applyAnimation` sets `element.style.transition = 'none'` to avoid CSS transition interference.

## See also

- [overview.md](./overview.md) — save pipeline
- [schema.md](./schema.md) — full catalog vs runtime subset
- [editor.md](./editor.md) — preview handler
- [../architecture/data-flow.md](../architecture/data-flow.md) — edit → save → render
