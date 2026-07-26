# Interactions frontend

> Audience: internal
> Module: `modules/interactions/interactions-frontend-handler.php` · `assets/js/interactions.js`
> Status: draft
> Related: [overview.md](./overview.md) · [schema.md](./schema.md)

## What it is

The frontend pipeline collects interaction data from all rendered documents on a page, outputs a single JSON payload in the footer, and executes animations via **Motion.js** (`window.Motion`). PHP orchestration lives in `Interactions_Frontend_Handler`; JS entry is `interactions.js`.

Motion.js is bundled at `assets/lib/motion/motion.js` (v11.13.5), registered as handle `motion-js`. Shared helpers resolve `Motion.animate` and `Motion.inView` through `interactions-shared-utils.js`.

## When to use it

- **Debugging missing animations** — trace collector → footer JSON → DOM `data-interaction-id` matching.
- **Adding runtime trigger/effect support** — extend `interactions.js` and `interactions-utils.js` (currently a subset of schema values).
- **Performance work** — postmeta cache avoids re-parsing full element trees on every frontend render.

## Key concepts

### Render pipeline

```
elementor/frontend/builder_content_data
  → Interactions_Frontend_Handler::collect_document_interactions
    → Interactions_Postmeta::load_content (or process_content fallback)
    → Interactions_Collector::register per element

wp_footer (priority 1)
  → Interactions_Frontend_Handler::print_interactions_data
    → enqueue motion-js + elementor-interactions
    → <script type="application/json" id="elementor-interactions-data">…</script>

interactions.js (DOMContentLoaded)
  → parse footer JSON
  → query [data-interaction-id="{elementId}"]
  → Motion.animate / Motion.inView per item
```

Both collector and footer output are skipped in edit mode (`Plugin::$instance->editor->is_edit_mode()`).

### Footer JSON shape

Each entry in the array:

```json
{
  "elementId": "abc123",
  "dataId": "abc123",
  "interactions": [ /* interaction-item PropValues */ ]
}
```

Script tag id: `elementor-interactions-data` (`Module::SCRIPT_ID_INTERACTIONS_DATA`).

### Postmeta cache

`Interactions_Postmeta` (`cache/interactions-postmeta.php`):

| Constant | Value |
|----------|-------|
| Meta key | `elementor-interactions-cache` |

**Write** — `handle_interactions_cache` on `elementor/document/after_save` calls `process_content($post_id, $data)`. Skips autosaves. Extracts per-element interaction `items` via `Elements_Interactions` walker and stores `element_id => items[]`.

**Read** — during `collect_document_interactions`, `load_content($post_id)` returns the map. If empty (stale/missing cache), falls back to `process_content` from live element data.

**Delete** — empty interaction map removes the meta key.

### Interactions collector

`Interactions_Collector` is a request-scoped singleton:

- `register($element_id, $interactions)` — merge by element id
- `get_all()` — used by footer printer
- `reset()` — testing / page reload

Aggregates interactions across multiple documents (header, footer, post content) as each passes through `builder_content_data`.

### Motion.js usage

Registered in `Module::register_frontend_scripts()`:

```php
wp_register_script( 'motion-js', ELEMENTOR_ASSETS_URL . 'lib/motion/motion…js', [], '11.13.5', true );
```

`interactions-shared-utils.js`:

```js
window.Motion.animate  // getAnimateFunction()
window.Motion.inView   // getInViewFunction()
```

`interactions.js` waits for Motion (`waitForAnimateFunction`), builds keyframes from effect/type/direction (`getKeyframes`), and applies:

| Trigger | Behavior |
|---------|----------|
| `load` | Immediate `animate()` |
| `scrollIn` | `inView` with `amount: 0` |
| `scrollOut` | `inView` with `amount: 0.85`, plays on exit |

Other schema triggers (`hover`, `click`, `scrollOn`) are **not** executed on the frontend free runtime. `custom` effects are skipped (`isSupportedInteraction`).

### Breakpoints

`interactions-breakpoints.js` reads `ElementorInteractionsConfig.breakpoints`, tracks active breakpoint on resize, and `skipInteraction()` excludes items whose `breakpoints.excluded` contains the active label.

### Legacy fallback (`data-interactions`)

When the `#elementor-interactions-data` script tag is absent, `interactions.js` falls back to per-element `[data-interactions]` attributes. The primary path is footer JSON; the fallback remains for compatibility.

Some atomic Twig templates still emit `data-interactions` alongside `data-interaction-id` — notably tabs subtree, `atomic-form`, and `atomic-self-hosted-video` (`_macros.html.twig` defines `render_interactions`). Container elements (flexbox, div-block, grid) emit only `data-interaction-id` via `render_data_attributes`.

### Config localization

`wp_localize_script` on `elementor-interactions` sets `ElementorInteractionsConfig` with `constants` (preset defaults) and `breakpoints` (active kit breakpoints). Same object name as editor (`Module::JS_CONFIG_OBJECT`).

## Extension

N/A — no public frontend registration hook today. Internal changes require editing `interactions.js`, `interactions-utils.js`, and likely PHP `Validation` / `Presets` in parallel.

## Internals

| File | Role |
|------|------|
| `interactions-frontend-handler.php` | Collector hook, footer output, asset enqueue |
| `interactions-collector.php` | In-memory aggregation |
| `cache/interactions-postmeta.php` | Postmeta read/write |
| `cache/elements-interactions.php` | Tree walk; extracts `interactions.items` per element id |
| `assets/js/interactions.js` | Frontend init, trigger dispatch |
| `assets/js/interactions-utils.js` | Keyframes, supported-trigger filter |
| `assets/js/interactions-shared-utils.js` | Motion bridge, PropValue unwrap, timing helpers |
| `assets/js/interactions-breakpoints.js` | Responsive skip logic |
| `assets/js/editor-interactions.js` | Preview iframe (editor only) |

**DOM binding** — `data-interaction-id` holds the **element id** (`origin_id ?? element id` from `Atomic_Element_Base::get_interaction_id()`), not the per-item `interaction_id` field. Set on every atomic element via Twig (`interaction_id` template variable) or `add_render_attribute( '_wrapper', 'data-interaction-id', … )`. Footer JSON keys by element id; `interactions.js` queries `[data-interaction-id="${elementId}"]`.

**Transition workaround** — `applyAnimation` temporarily sets `element.style.transition = 'none'` because CSS transitions interfere with Motion animations.

## See also

- [overview.md](./overview.md) — save pipeline that feeds the cache
- [schema.md](./schema.md) — full trigger/effect catalog vs runtime subset
- [editor.md](./editor.md) — preview handler (`editor-interactions.js`)
- [../architecture/data-flow.md](../architecture/data-flow.md) — edit → save → frontend render
