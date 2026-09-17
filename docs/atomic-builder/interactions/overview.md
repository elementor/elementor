# Interactions overview

> Audience: both
> Module: `modules/interactions/` · `@elementor/editor-interactions`
> Related: [schema.md](./schema.md) · [editor.md](./editor.md) · [frontend.md](./frontend.md) · [../getting-started/experiments.md](../getting-started/experiments.md)

## What it is

Interactions add motion to atomic (v4) elements. Each element holds an `interactions` prop — a versioned list of **interaction items** (trigger + animation preset + optional breakpoint exclusions).

| Layer | Location |
|-------|----------|
| PHP module | `modules/interactions/` |
| Editor package | `packages/packages/core/editor-interactions/` |
| Frontend scripts | `modules/interactions/assets/js/` |
| Animation library | Motion.js (`lib/motion/motion.js`, v11.13.5) |

Data is validated on save, cached in postmeta for frontend reads, and executed client-side via Motion.js.

## When to use it

- **Designers** — configure entrance and scroll animations from the editor Interactions tab.
- **Addon authors** — extend the schema via `elementor/atomic-widgets/interactions/schema`; register editor controls via `registerInteractionsControl`.
- **Internal contributors** — work in `modules/interactions/` (save pipeline, validation, frontend) or `editor-interactions` (tab UI, preview).

**Gate:** `Module::is_experiment_active()` — requires `e_atomic_elements` (`AtomicWidgetsModule::EXPERIMENT_NAME`).

## Key concepts

**Interaction item** — PropValue with `$$type: "interaction-item"`. Fields: `interaction_id`, `trigger`, `animation` (`animation-preset-props`), `breakpoints` (`interaction-breakpoints`).

**Document shape:**

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

**Save pipeline** — `elementor/document/save/data`: `Validation` sanitizes/validates (max 5 items), `Parser` assigns stable `interaction_id` values. `elementor/document/after_save`: `Interactions_Postmeta` writes per-element cache.

**Config** — `ElementorInteractionsConfig` (`Module::JS_CONFIG_OBJECT`) exposes preset defaults and active breakpoints to JS.

## Extension

Extend via schema filter and editor controls registry — see [schema.md](./schema.md) and [editor.md](./editor.md). New triggers/effects need parallel PHP (`Validation`, `Presets`) and JS (`interactions.js`, `interactions-utils.js`) changes. No public frontend registration hook.

## Public API

| Symbol | Signature | Purpose | Source |
|--------|-----------|---------|--------|
| `Interactions_Schema` | `::get(): array` | Canonical prop-type tree (filtered) | `schema/interactions-schema.php` |
| `Parser` | `assign_interaction_ids( $data ): array` | Assign stable IDs on save | `parser.php` |
| `Presets` | `triggers_options()`, `effects_options()`, `easing_options()`, `defaults()` | Allowed enum values and defaults | `presets.php` |
| `Validation` | `sanitize( $document )`, `validate()` | Save-time sanitization/validation | `validation.php` |
| `Interactions_Frontend_Handler` | `collect_document_interactions()`, `print_interactions_data()` | Frontend collect + footer output | `interactions-frontend-handler.php` |
| `Interactions_Collector` | `::instance()`, `register()`, `get_all()` | Request-scoped aggregation | `interactions-collector.php` |
| `registerInteractionsControl` | `( { type, component, options? } )` | Register editor control | `editor-interactions/src/interactions-controls-registry.ts` |
| `interactionsRepository` | `.register( provider )`, `.all()` | Editor interactions data registry | `editor-interactions/src/interactions-repository.ts` |
| `useElementInteractions` | `( elementId )` | Read/write element interactions in editor | `editor-interactions/src/hooks/use-element-interactions.ts` |

**Filter:** `elementor/atomic-widgets/interactions/schema` — extend the schema returned by `Interactions_Schema::get()`.

## Internals

| Hook / integration | Role |
|--------------------|------|
| `elementor/frontend/after_register_scripts` | Registers Motion.js + interaction scripts |
| `elementor/document/save/data` | Validation + ID assignment |
| `elementor/document/after_save` | Postmeta cache write |
| `elementor/frontend/builder_content_data` | `collect_document_interactions` |
| `wp_footer` | `print_interactions_data` |
| `editor-editing-panel` | Mounts `InteractionsTab` |

Import/export resolves items through `Interactions_Schema::get()`.

## See also

- [schema.md](./schema.md) — prop-type tree and presets
- [editor.md](./editor.md) — controls registry
- [frontend.md](./frontend.md) — Motion.js runtime
- [../atomic-widgets/overview.md](../atomic-widgets/overview.md) — atomic element model
- [../fundamentals/prop-value.md](../fundamentals/prop-value.md) — PropValue conventions
