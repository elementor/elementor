# Interactions overview

> Audience: both
> Module: `modules/interactions/` · `@elementor/editor-interactions`
> Status: draft
> Related: [schema.md](./schema.md) · [editor.md](./editor.md) · [frontend.md](./frontend.md) · [../getting-started/experiments.md](../getting-started/experiments.md)

## What it is

Interactions add motion to atomic (v4) elements. Each element can hold an `interactions` prop — a versioned list of **interaction items**. Each item binds a **trigger** (when the animation runs), an **animation preset** (effect, direction, timing), and optional **breakpoint exclusions**.

The feature spans:

| Layer | Location |
|-------|----------|
| PHP module | `modules/interactions/` (`Elementor\Modules\Interactions\Module`) |
| Editor package | `packages/packages/core/editor-interactions/` (`@elementor/editor-interactions`) |
| Frontend scripts | `modules/interactions/assets/js/` (`interactions.js`, `editor-interactions.js`) |
| Animation library | Motion.js (`lib/motion/motion.js`, v11.13.5) |

Interactions are stored on element document data (alongside props and styles), validated on save, cached in postmeta for fast frontend reads, and executed client-side via Motion.js.

## When to use it

- **Designers / power users** — configure entrance, scroll, and (with Pro) advanced triggers from the editor Interactions tab.
- **Addon authors** — extend the interactions schema via `elementor/atomic-widgets/interactions/schema` to add new prop-type fields or item shapes; register editor controls via `registerInteractionsControl`.
- **Internal contributors** — work in `modules/interactions/` (save pipeline, validation, frontend handler) or `editor-interactions` (tab UI, preview playback).

Requires both experiments active:

| Experiment | Constant | Default | Notes |
|------------|----------|---------|-------|
| `e_interactions` | `Module::EXPERIMENT_NAME` | Active (since ~Dec 2025) | Hidden; `RELEASE_STATUS_DEV` — lowest `release_status` among long-default-active v4 experiments; fold-into-v4 decision tracked in [ED-25066](https://elementor.atlassian.net/browse/ED-25066) |
| `e_atomic_elements` | `AtomicWidgetsModule::EXPERIMENT_NAME` | — | Parent gate; module does not load without it |

`Module::is_experiment_active()` checks both before registering hooks.

## Key concepts

**Interaction item** — a PropValue with `$$type: "interaction-item"`. Fields: `interaction_id`, `trigger`, `animation` (`animation-preset-props`), `breakpoints` (`interaction-breakpoints`).

**Document shape** — elements store interactions as JSON (string or object):

```json
{
  "version": 1,
  "items": [
    {
      "$$type": "interaction-item",
      "value": {
        "interaction_id": { "$$type": "string", "value": "hero-fade-in" },
        "trigger": { "$$type": "string", "value": "scrollIn" },
        "animation": { "$$type": "animation-preset-props", "value": { "...": "..." } }
      }
    }
  ]
}
```

**Save pipeline** — on `elementor/document/save/data`, `Validation` sanitizes and validates (max 5 interactions per element), then `Parser` assigns stable `interaction_id` values (replacing `temp-*` ids). On `elementor/document/after_save`, `Interactions_Postmeta` writes a per-element cache.

**Config object** — `ElementorInteractionsConfig` (PHP constant `Module::JS_CONFIG_OBJECT`) exposes preset defaults (`defaultDuration`, `slideDistance`, etc.) and active breakpoint config to JS.

## Extension

Extend the schema and editor controls rather than patching element JSON directly. See [schema.md](./schema.md) for the `elementor/atomic-widgets/interactions/schema` filter and [editor.md](./editor.md) for `registerInteractionsControl`.

To add frontend support for a new trigger or effect, update PHP (`Validation`, `Presets`) and JS (`interactions.js`, `interactions-utils.js`) in parallel. There is no public frontend registration hook — `isSupportedInteraction()` in `interactions-utils.js` hard-filters the runtime subset.

## Internals

**Module hooks** (`module.php`):

- `elementor/frontend/after_register_scripts` — registers Motion.js, shared utils, frontend, and editor scripts
- `elementor/document/save/data` — validation + ID assignment
- `elementor/document/after_save` — postmeta cache write
- `elementor/frontend/builder_content_data` — `Interactions_Frontend_Handler::collect_document_interactions`
- `wp_footer` — `Interactions_Frontend_Handler::print_interactions_data`

**Editor integration** — `editor-interactions` is listed in `AtomicWidgetsModule` PACKAGES and mounted by `editor-editing-panel` as the Interactions tab (`InteractionsTab`).

**Import/export** — `atomic-import-export` resolves interaction items through `Interactions_Schema::get()`; dedicated modifiers handle ID remapping and prop resolution.

## See also

- [schema.md](./schema.md) — full prop-type tree and extension filter
- [editor.md](./editor.md) — interactions tab and controls registry
- [frontend.md](./frontend.md) — Motion.js runtime and collector
- [../atomic-widgets/overview.md](../atomic-widgets/overview.md) — atomic element model
- [../fundamentals/prop-value.md](../fundamentals/prop-value.md) — PropValue conventions
